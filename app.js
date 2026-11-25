"use strict";

    /* ==========================================================================
       SECTION 1: DATA SEED
       ========================================================================== */
    const SEED_DATA = {
      items: [
        { sku: "CAF-1KG", name: "Café en grains 1 kg", zone: "A" },
        { sku: "CHO-500", name: "Chocolat en poudre 500 g", zone: "A" },
        { sku: "SIR-VAN", name: "Sirop de vanille 1 L", zone: "A" },
        { sku: "AVO-1L",  name: "Lait d'avoine 1 L", zone: "A" },
        { sku: "GOB-12",  name: "Gobelets carton 12 oz", zone: "B" },
        { sku: "COUV-12", name: "Couvercles gobelets 12 oz", zone: "B" }
      ],
      locations: [
        { code: "A-01", zone: "A", capacity: 200, isDock: false },
        { code: "A-02", zone: "A", capacity: 200, isDock: false },
        { code: "A-03", zone: "A", capacity: 200, isDock: false },
        { code: "A-04", zone: "A", capacity: 200, isDock: false },
        { code: "B-01", zone: "B", capacity: 600, isDock: false },
        { code: "B-02", zone: "B", capacity: 600, isDock: false },
        { code: "RECEPTION",  zone: "DOCK", capacity: Infinity, isDock: true },
        { code: "EXPEDITION", zone: "DOCK", capacity: Infinity, isDock: true }
      ],
      stock: [
        { sku: "CAF-1KG", location: "A-01", qty: 120 },
        { sku: "CAF-1KG", location: "A-02", qty: 60 },
        { sku: "CHO-500", location: "A-03", qty: 80 },
        { sku: "AVO-1L",  location: "A-03", qty: 90 },
        { sku: "SIR-VAN", location: "A-04", qty: 40 },
        { sku: "GOB-12",  location: "B-01", qty: 300 },
        { sku: "COUV-12", location: "B-02", qty: 250 }
      ],
      purchaseOrders: [
        {
          id: "PO-1001",
          supplier: "Torréfaction Artisanale des Alpes",
          lines: [
            { sku: "CAF-1KG", ordered: 150, received: 0 },
            { sku: "CHO-500", ordered: 60, received: 0 }
          ]
        },
        {
          id: "PO-1002",
          supplier: "EcoEmballages Direct",
          lines: [
            { sku: "GOB-12", ordered: 500, received: 0 },
            { sku: "COUV-12", ordered: 200, received: 0 }
          ]
        }
      ],
      salesOrders: [
        {
          id: "SO-2001",
          customer: "Café Central de Paris",
          status: "open", // open | released | picked | shipped
          lines: [
            { sku: "CAF-1KG", qty: 40 },
            { sku: "GOB-12", qty: 100 }
          ],
          shortages: {}
        },
        {
          id: "SO-2002",
          customer: "Bistrot du Port Maritime",
          status: "open",
          lines: [
            { sku: "AVO-1L", qty: 30 },
            { sku: "SIR-VAN", qty: 10 },
            { sku: "CAF-1KG", qty: 25 }
          ],
          shortages: {}
        },
        {
          id: "SO-2003",
          customer: "Grand Hôtel de la Plage",
          status: "open",
          lines: [
            { sku: "CHO-500", qty: 100 } // only 80 in stock -> shortage of 20
          ],
          shortages: {}
        }
      ],
      tasks: [], // WorkTask: { id, type: 'putaway'|'pick', sku, qty, from, to, ref, done }
      movementLogs: [
        { time: "08:00:00", text: "Initialisation du stock de démonstration." }
      ]
    };

    function createFreshWarehouseState() {
      return JSON.parse(JSON.stringify(SEED_DATA));
    }


    /* ==========================================================================
       SECTION 2: DOMAIN LOGIC (Pure functions, no DOM access)
       ========================================================================== */
    let _taskCounter = 100;
    function generateTaskId() {
      _taskCounter++;
      return "TSK-" + _taskCounter;
    }

    function getNowTimeStr() {
      const d = new Date();
      return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(n => String(n).padStart(2, '0'))
        .join(':');
    }

    function addLog(state, text) {
      state.movementLogs.unshift({
        time: getNowTimeStr(),
        text: text
      });
      if (state.movementLogs.length > 30) {
        state.movementLogs = state.movementLogs.slice(0, 30);
      }
    }

    // Helper: Add or subtract stock at a location
    function adjustStock(state, sku, locationCode, deltaQty) {
      let row = state.stock.find(s => s.sku === sku && s.location === locationCode);
      if (!row) {
        if (deltaQty > 0) {
          state.stock.push({ sku, location: locationCode, qty: deltaQty });
        }
      } else {
        row.qty += deltaQty;
      }
      // Remove zero or negative rows
      state.stock = state.stock.filter(s => s.qty > 0);
    }

    // Free space in a non-dock location = capacity - used - planned in open putaways
    function getLocationFreeSpace(state, locCode) {
      const loc = state.locations.find(l => l.code === locCode);
      if (!loc) return 0;
      if (loc.isDock) return Infinity;
      const currentUsed = state.stock
        .filter(s => s.location === locCode)
        .reduce((sum, s) => sum + s.qty, 0);
      const plannedInTasks = state.tasks
        .filter(t => t.type === 'putaway' && !t.done && t.to === locCode)
        .reduce((sum, t) => sum + t.qty, 0);
      return Math.max(0, loc.capacity - currentUsed - plannedInTasks);
    }

    // Current physical free space right now (ignoring open tasks)
    function getLocationPhysicalFreeSpace(state, locCode) {
      const loc = state.locations.find(l => l.code === locCode);
      if (!loc) return 0;
      if (loc.isDock) return Infinity;
      const currentUsed = state.stock
        .filter(s => s.location === locCode)
        .reduce((sum, s) => sum + s.qty, 0);
      return Math.max(0, loc.capacity - currentUsed);
    }

    // Putaway Plan pure function
    // Candidate locations: same zone as item, non-dock.
    // Sort: locations already holding this sku first, then by most free space.
    // Split quantity across locations. If space runs out, create task with empty destination.
    function planPutaway(state, sku, qty, poId) {
      const item = state.items.find(i => i.sku === sku);
      if (!item) return [];

      const candidates = state.locations.filter(l => !l.isDock && l.zone === item.zone);
      
      const scored = candidates.map(loc => {
        const skuQtyInLoc = state.stock
          .filter(s => s.location === loc.code && s.sku === sku)
          .reduce((sum, s) => sum + s.qty, 0);
        const freeSpace = getLocationFreeSpace(state, loc.code);
        return {
          code: loc.code,
          hasSku: skuQtyInLoc > 0,
          freeSpace: freeSpace
        };
      });

      // Sort: locations holding sku first, then most free space descending
      scored.sort((a, b) => {
        if (a.hasSku !== b.hasSku) {
          return a.hasSku ? -1 : 1;
        }
        return b.freeSpace - a.freeSpace;
      });

      const newTasks = [];
      let remaining = qty;

      for (const cand of scored) {
        if (remaining <= 0) break;
        if (cand.freeSpace <= 0) continue;

        const take = Math.min(remaining, cand.freeSpace);
        newTasks.push({
          id: generateTaskId(),
          type: "putaway",
          sku: sku,
          qty: take,
          from: "RECEPTION",
          to: cand.code,
          ref: poId,
          done: false
        });
        remaining -= take;
        cand.freeSpace -= take;
      }

      // If space runs out in candidate locations, create task with empty destination
      if (remaining > 0) {
        newTasks.push({
          id: generateTaskId(),
          type: "putaway",
          sku: sku,
          qty: remaining,
          from: "RECEPTION",
          to: "",
          ref: poId,
          done: false
        });
      }

      return newTasks;
    }

    // 1. receive(po, lineIndex, qty)
    // Clamps qty to what remains, adds stock to RECEPTION, creates putaway tasks, logs it.
    function receive(state, poId, lineIndex, requestedQty) {
      const po = state.purchaseOrders.find(p => p.id === poId);
      if (!po || !po.lines[lineIndex]) return { state, error: "Commande ou ligne introuvable." };

      const line = po.lines[lineIndex];
      const remains = Math.max(0, line.ordered - line.received);
      const actualQty = Math.max(0, Math.min(Number(requestedQty) || 0, remains));

      if (actualQty <= 0) {
        return { state, error: "Quantité à réceptionner invalide ou commande déjà soldée." };
      }

      line.received += actualQty;
      adjustStock(state, line.sku, "RECEPTION", actualQty);

      const putawayTasks = planPutaway(state, line.sku, actualQty, po.id);
      state.tasks.push(...putawayTasks);

      addLog(state, `Réception de ${actualQty}x ${line.sku} sur le quai RECEPTION (PO: ${po.id}).`);

      return { state, error: null };
    }

    // 3. confirmPutaway(task, chosenDest)
    // Refuses if destination is empty or lacks free space, otherwise moves stock RECEPTION -> dest.
    function confirmPutaway(state, taskId, chosenDest) {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.done) return { state, error: "Tâche introuvable ou déjà terminée." };

      const dest = chosenDest || task.to;
      if (!dest || dest.trim() === "") {
        return { state, error: "Veuillez choisir un emplacement de destination pour ranger cet article." };
      }

      const loc = state.locations.find(l => l.code === dest);
      if (!loc || loc.isDock) {
        return { state, error: `Emplacement de rangement "${dest}" invalide.` };
      }

      // Check current physical free space in destination
      const physFree = getLocationPhysicalFreeSpace(state, dest);
      if (task.qty > physFree) {
        return { state, error: `Capacité dépassée pour ${dest} : espace libre restant ${physFree}, requis ${task.qty}.` };
      }

      // Check stock at RECEPTION
      const recStock = state.stock.find(s => s.location === "RECEPTION" && s.sku === task.sku);
      if (!recStock || recStock.qty < task.qty) {
        return { state, error: `Stock insuffisant sur le quai RECEPTION pour ${task.sku}.` };
      }

      // Move stock
      adjustStock(state, task.sku, "RECEPTION", -task.qty);
      adjustStock(state, task.sku, dest, task.qty);

      task.to = dest;
      task.done = true;

      addLog(state, `Rangement terminé : ${task.qty}x ${task.sku} rangés dans ${dest} (Tâche: ${task.id}).`);
      return { state, error: null };
    }

    // 4. releaseOrder(so)
    // For each line, allocate from non-dock locations. Available = on hand - qty reserved by open pick tasks.
    // Take from locations with the least available quantity first (to empty small locations).
    // Create pick tasks to EXPEDITION. If shortage, record shortage per sku. Status -> released.
    function releaseOrder(state, soId) {
      const so = state.salesOrders.find(s => s.id === soId);
      if (!so) return { state, error: "Commande client introuvable." };
      if (so.status !== "open") return { state, error: "Cette commande a déjà été lancée." };

      so.shortages = {};

      for (const line of so.lines) {
        let needed = line.qty;

        // Find candidate non-dock locations with available stock
        const candidates = [];
        for (const loc of state.locations) {
          if (loc.isDock) continue;
          const onHand = state.stock
            .filter(s => s.location === loc.code && s.sku === line.sku)
            .reduce((sum, s) => sum + s.qty, 0);
          const reserved = state.tasks
            .filter(t => t.type === "pick" && !t.done && t.sku === line.sku && t.from === loc.code)
            .reduce((sum, t) => sum + t.qty, 0);
          const available = Math.max(0, onHand - reserved);

          if (available > 0) {
            candidates.push({ code: loc.code, available });
          }
        }

        // Sort: least available quantity first to empty small locations
        candidates.sort((a, b) => a.available - b.available);

        for (const cand of candidates) {
          if (needed <= 0) break;
          const take = Math.min(needed, cand.available);
          state.tasks.push({
            id: generateTaskId(),
            type: "pick",
            sku: line.sku,
            qty: take,
            from: cand.code,
            to: "EXPEDITION",
            ref: so.id,
            done: false
          });
          needed -= take;
        }

        if (needed > 0) {
          so.shortages[line.sku] = needed;
        }
      }

      so.status = "released";
      const shortageCount = Object.keys(so.shortages).length;
      if (shortageCount > 0) {
        addLog(state, `Préparation lancée pour SO ${so.id} AVEC RUPTURE sur ${Object.keys(so.shortages).join(', ')}.`);
      } else {
        addLog(state, `Préparation lancée pour commande ${so.id} (Tâches de prélèvement créées).`);
      }

      return { state, error: null };
    }

    // 5. confirmPick(task)
    // Move stock from location to EXPEDITION. When all tasks of order done, status -> picked.
    function confirmPick(state, taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.done) return { state, error: "Tâche de prélèvement introuvable ou déjà terminée." };

      const fromStock = state.stock.find(s => s.location === task.from && s.sku === task.sku);
      if (!fromStock || fromStock.qty < task.qty) {
        return { state, error: `Stock physique insuffisant en ${task.from} pour ${task.sku}.` };
      }

      adjustStock(state, task.sku, task.from, -task.qty);
      adjustStock(state, task.sku, "EXPEDITION", task.qty);
      task.done = true;

      // Check if all pick tasks for this SO are completed
      const remainingPicks = state.tasks.filter(t => t.ref === task.ref && t.type === "pick" && !t.done);
      const so = state.salesOrders.find(s => s.id === task.ref);

      if (so && remainingPicks.length === 0) {
        so.status = "picked";
        addLog(state, `Prélèvement terminé pour la commande ${so.id} (Prête pour expédition).`);
      } else {
        addLog(state, `Prélèvement confirmé : ${task.qty}x ${task.sku} depuis ${task.from} vers EXPEDITION.`);
      }

      return { state, error: null };
    }

    // 6. ship(so)
    // Remove picked quantities from EXPEDITION dock, status -> shipped.
    function ship(state, soId) {
      const so = state.salesOrders.find(s => s.id === soId);
      if (!so) return { state, error: "Commande client introuvable." };
      if (so.status !== "picked") return { state, error: "La commande doit être entièrement prélevée avant expédition." };

      // Calculate total picked items for this SO
      const pickedTasks = state.tasks.filter(t => t.ref === so.id && t.type === "pick" && t.done);
      for (const t of pickedTasks) {
        adjustStock(state, t.sku, "EXPEDITION", -t.qty);
      }

      so.status = "shipped";
      addLog(state, `Commande ${so.id} expédiée avec succès vers le client ${so.customer}.`);

      return { state, error: null };
    }

    // Bonus: Inventory Adjustment (Cycle Counting)
    function adjustInventory(state, locationCode, sku, physicalCount) {
      const count = Number(physicalCount);
      if (isNaN(count) || count < 0) {
        return { state, error: "Veuillez saisir un comptage valide (supérieur ou égal à 0)." };
      }

      const loc = state.locations.find(l => l.code === locationCode);
      if (!loc) return { state, error: "Emplacement introuvable." };

      const current = state.stock
        .filter(s => s.location === locationCode && s.sku === sku)
        .reduce((sum, s) => sum + s.qty, 0);

      const diff = count - current;
      if (diff === 0) {
        return { state, error: "Aucun écart constaté (le stock correspond exactement au comptage)." };
      }

      // Check capacity if adding stock
      if (diff > 0 && !loc.isDock) {
        const free = getLocationPhysicalFreeSpace(state, locationCode);
        if (diff > free) {
          return { state, error: `Ajustement impossible : dépasse la capacité de ${locationCode} de ${diff - free} unités.` };
        }
      }

      adjustStock(state, sku, locationCode, diff);
      state.inventoryAdjusted = true;
      const sign = diff > 0 ? `+${diff}` : `${diff}`;
      addLog(state, `Ajustement d'inventaire sur ${locationCode} : ${sku} corrigé de ${current} à ${count} (Écart: ${sign}).`);

      return { state, error: null };
    }


    /* ==========================================================================
       SECTION 3: TRAINING CONTENT (Lessons, glossaries, missions, quizzes)
       ========================================================================== */
    const TRAINING_LESSONS = [
      {
        id: 1,
        title: "L'entrepôt en cinq mots",
        concept: "Dans un système WMS (Warehouse Management System), chaque article possède un identifiant unique (le SKU). L'espace est découpé en zones selon la nature des produits, puis en emplacements adressés avec une capacité précise. Les quais (Réception et Expédition) sont les sas d'échange avec l'extérieur.",
        glossary: [
          { term: "SKU (Stock Keeping Unit)", def: "Référence unique identifiant un produit spécifique." },
          { term: "Emplacement", def: "Adresse physique exacte d'une étagère ou case de stockage (ex: A-01)." },
          { term: "Zone", def: "Regroupement logique (ex: A pour l'épicerie, B pour les emballages)." },
          { term: "Quai (Dock)", def: "Zone tampon d'arrivée (Réception) ou de départ (Expédition)." },
          { term: "Stock", def: "Quantité physique disponible par article et par emplacement." }
        ],
        missionText: "Ouvrez l'onglet « Stock » pour visualiser les articles en rayon et localiser les deux quais.",
        targetTab: "stock",
        checkCompleted: (state, training, ui) => ui.activeTab === "stock" || !!training.visitedStockTab,
        question: "Que représente le sigle « SKU » dans un entrepôt ?",
        options: [
          "Le numéro d'immatriculation du camion de livraison",
          "La référence unique d'un produit (Stock Keeping Unit)",
          "Le poids maximal supporté par un chariot élévateur"
        ],
        correctIndex: 1,
        explanation: "Le SKU (Stock Keeping Unit) permet d'identifier sans ambiguïté chaque référence de produit dans le système informatique de l'entrepôt."
      },
      {
        id: 2,
        title: "Réceptionner une livraison",
        concept: "Lorsqu'un fournisseur livre des marchandises, l'opérateur vérifie le bon de commande d'achat (PO - Purchase Order). Les quantités livrées sont enregistrées et déposées temporairement sur le quai de RÉCEPTION pour vérification avant leur mise en stock.",
        glossary: [
          { term: "PO (Purchase Order)", def: "Commande d'achat passée auprès d'un fournisseur." },
          { term: "Quai Réception", def: "Zone de déchargement où le stock entre dans le WMS." },
          { term: "Rapproché commande", def: "Comparaison entre quantité commandée et quantité réellement livrée." }
        ],
        missionText: "Allez dans l'onglet « Réception » et réceptionnez la ligne de Café (150 unités) de la commande PO-1001.",
        targetTab: "reception",
        checkCompleted: (state) => {
          const po = state.purchaseOrders.find(p => p.id === "PO-1001");
          const line = po && po.lines.find(l => l.sku === "CAF-1KG");
          return line && line.received > 0;
        },
        question: "Où se trouvent les marchandises immédiatement après leur déchargement du camion ?",
        options: [
          "Directement sur le quai de RÉCEPTION",
          "Sur le quai d'EXPÉDITION pour être vendues",
          "Dispersées au hasard dans les allées"
        ],
        correctIndex: 0,
        explanation: "Les marchandises entrent obligatoirement par le quai de Réception, servant de zone tampon avant d'être affectées à un emplacement de stockage."
      },
      {
        id: 3,
        title: "Le rangement (Putaway)",
        concept: "Le « Putaway » est l'opération consistant à déplacer les marchandises du quai de réception vers leur emplacement de stockage définitif. Le WMS applique des règles intelligentes : privilégier les emplacements contenant déjà la même référence (consolidation) et respecter la capacité maximale.",
        glossary: [
          { term: "Putaway (Rangement)", def: "Déplacement dirigé du quai vers un emplacement de stockage." },
          { term: "Consolidation", def: "Regrouper les mêmes articles ensemble pour optimiser l'espace." },
          { term: "Capacité", def: "Nombre maximal d'unités qu'un emplacement peut physiquement accueillir." }
        ],
        missionText: "Confirmez le rangement de la tâche de café générée lors de la réception.",
        targetTab: "reception",
        checkCompleted: (state) => {
          return state.tasks.some(t => t.type === "putaway" && t.sku === "CAF-1KG" && t.done);
        },
        question: "Pourquoi le WMS suggère-t-il en priorité un emplacement contenant déjà le même produit ?",
        options: [
          "Parce que la législation interdit le stockage multi-produits",
          "Pour consolider le stock et faciliter les futurs prélèvements",
          "Pour forcer l'opérateur à remplir les étagères du fond"
        ],
        correctIndex: 1,
        explanation: "La consolidation évite la dispersion d'un même article à travers tout l'entrepôt, ce qui accélère la préparation de commandes."
      },
      {
        id: 4,
        title: "Préparer une commande (Release)",
        concept: "Une commande client (SO - Sales Order) reçue doit être « lancée » (Release). Le WMS vérifie la disponibilité en temps réel et réserve le stock. Pour maximiser la place, l'algorithme prélève en priorité dans les emplacements les moins remplis afin de libérer des cases complètes.",
        glossary: [
          { term: "SO (Sales Order)", def: "Commande d'un client à honorer." },
          { term: "Release (Lancement)", def: "Affectation du stock et génération des ordres de prélèvement." },
          { term: "Vidage d'emplacement", def: "Stratégie visant à vider les reliquats pour libérer des espaces." }
        ],
        missionText: "Dans l'onglet « Expédition », lancez la préparation de la commande SO-2001.",
        targetTab: "expedition",
        checkCompleted: (state) => {
          const so = state.salesOrders.find(s => s.id === "SO-2001");
          return so && so.status !== "open";
        },
        question: "Dans quel ordre le WMS sélectionne-t-il les emplacements lors du lancement d'une commande ?",
        options: [
          "Il tire au sort les emplacements",
          "Il prend en priorité dans les emplacements les moins remplis pour les libérer",
          "Il prend obligatoirement dans les emplacements les plus pleins"
        ],
        correctIndex: 1,
        explanation: "Vider en priorité les emplacements contenant de petites quantités permet de libérer complètement des emplacements pour de nouveaux réassorts."
      },
      {
        id: 5,
        title: "Le prélèvement (Picking)",
        concept: "Le « Picking » est la collecte physique des articles par le préparateur dans les allées. Chaque article prélevé est acheminé vers le quai d'EXPÉDITION. Lorsque toutes les lignes d'une commande sont prélevées, celle-ci passe au statut « Prélevée » (Picked).",
        glossary: [
          { term: "Picking (Prélèvement)", def: "Action de collecter les articles en rayon selon la liste de travail." },
          { term: "Quai Expédition", def: "Zone tampon où les commandes prélevées sont regroupées et emballées." },
          { term: "Statut Picked", def: "Indique que l'ensemble des articles d'une commande a été réuni." }
        ],
        missionText: "Confirmez toutes les tâches de prélèvement associées à la commande SO-2001.",
        targetTab: "expedition",
        checkCompleted: (state) => {
          const so = state.salesOrders.find(s => s.id === "SO-2001");
          return so && (so.status === "picked" || so.status === "shipped");
        },
        question: "Où sont déposés les produits prélevés en rayon par le préparateur ?",
        options: [
          "Dans son vestiaire",
          "Sur le quai de RÉCEPTION",
          "Sur le quai d'EXPÉDITION"
        ],
        correctIndex: 2,
        explanation: "Les articles prélevés convergent tous vers le quai d'Expédition pour être consolidés, emballés et étiquetés."
      },
      {
        id: 6,
        title: "L'expédition (Ship)",
        concept: "L'étape finale est le chargement dans le camion du transporteur. L'action d'expédier déstocke définitivement la marchandise du quai d'expédition et clôture la commande (statut Shipped). Le cycle de vente dans l'entrepôt est alors complet.",
        glossary: [
          { term: "Shipping (Expédition)", def: "Remise formelle du colis au transporteur et clôture de la commande." },
          { term: "Déstockage final", def: "Sortie définitive des articles du stock informatique." }
        ],
        missionText: "Cliquez sur « Expédier » pour la commande SO-2001 prélevée.",
        targetTab: "expedition",
        checkCompleted: (state) => {
          const so = state.salesOrders.find(s => s.id === "SO-2001");
          return so && so.status === "shipped";
        },
        question: "Que se passe-t-il informatiquement lors de l'expédition d'une commande ?",
        options: [
          "Les produits sont retirés définitivement du stock et le statut passe à 'shipped'",
          "La commande est automatiquement dupliquée pour le mois suivant",
          "Les articles reviennent au quai de réception"
        ],
        correctIndex: 0,
        explanation: "L'expédition sort physiquement et informatiquement les articles de l'entrepôt, clôturant ainsi le cycle logistique."
      },
      {
        id: 7,
        title: "Gérer une rupture (Shortage)",
        concept: "Que faire si un client commande plus d'articles que ce qui est disponible en rayon ? Le WMS alloue tout le stock disponible et consigne immédiatement une rupture (Shortage) sur le reliquat. Cela permet d'alerter les approvisionnements sans bloquer la logistique.",
        glossary: [
          { term: "Shortage (Rupture)", def: "Différence entre la quantité demandée et le stock physique disponible." },
          { term: "Reliquat", def: "Quantité en attente de réapprovisionnement ultérieur." },
          { term: "Stock disponible", def: "Stock physique moins le stock déjà réservé par d'autres commandes." }
        ],
        missionText: "Lancez la préparation de SO-2003 (demande de 100 chocolats) et observez la rupture de 20 unités détectée.",
        targetTab: "expedition",
        checkCompleted: (state) => {
          const so = state.salesOrders.find(s => s.id === "SO-2003");
          return so && so.status !== "open" && so.shortages && so.shortages["CHO-500"] > 0;
        },
        question: "Si un client demande 100 unités mais que seules 80 sont disponibles, que fait le WMS ?",
        options: [
          "Il refuse la commande et supprime le compte client",
          "Il alloue les 80 unités et enregistre une rupture de 20 unités pour réapprovisionnement",
          "Il invente les 20 unités manquantes dans le système"
        ],
        correctIndex: 1,
        explanation: "Le WMS optimise le taux de service : il sert tout ce qui est possible immédiatement et trace le manquant pour réapprovisionnement."
      },
      {
        id: 8,
        title: "L'inventaire tournant (Cycle Counting)",
        concept: "Dans un entrepôt moderne, on ne bloque pas l'activité pour un inventaire annuel unique. On pratique l'inventaire tournant : un comptage régulier d'emplacements ciblés. En cas de différence entre le stock théorique et le comptage physique, un ajustement avec traçabilité est enregistré.",
        glossary: [
          { term: "Cycle Counting (Inventaire tournant)", def: "Comptage continu et régulier d'une fraction des emplacements." },
          { term: "Écart d'inventaire", def: "Différence entre le stock compté et le stock théorique informatique." },
          { term: "Ajustement de stock", def: "Mise à niveau du système pour refléter la réalité physique du terrain." }
        ],
        missionText: "Rendez-vous dans l'onglet « Inventaire », saisissez un comptage avec écart sur un emplacement et validez l'ajustement.",
        targetTab: "inventaire",
        checkCompleted: (state) => {
          return !!state.inventoryAdjusted || state.movementLogs.some(l => l.text.includes("Ajustement d'inventaire"));
        },
        question: "Quel est l'avantage principal de l'inventaire tournant par rapport à l'inventaire annuel ?",
        options: [
          "Il évite de fermer l'entrepôt et détecte les erreurs au fil de l'eau",
          "Il permet de licencier tous les préparateurs",
          "Il supprime totalement le besoin de compter les produits"
        ],
        correctIndex: 0,
        explanation: "L'inventaire tournant garantit la précision des stocks en continu sans interrompre les expéditions de l'entrepôt."
      }
    ];

    function createFreshTrainingState() {
      return {
        activeLessonId: 1,
        completedMissions: {},
        answeredQuestions: {}, // lessonId -> { answered: true, selectedIndex: number, isCorrect: boolean }
        visitedStockTab: false
      };
    }


    /* ==========================================================================
       SECTION 4: RENDERING (Template strings, focus/scroll preservation)
       ========================================================================== */
        /* Vector Icons Definition */
    const SVG_ICONS = {
      'refresh': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
      'award': '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
      'target': '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      'check': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
      'check-circle': '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
      'clock': '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      'help': '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      'map': '<svg class="ui-icon" viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
      'history': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><polyline points="12 7 12 12 15 15"/></svg>',
      'reception': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
      'expedition': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
      'box': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
      'clipboard': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/><path d="m9 14 2 2 4-4"/></svg>',
      'alert': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      'alert-circle': '<svg class="ui-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      'text-size': '<svg class="ui-icon" viewBox="0 0 24 24"><path d="m3 16 4-10 4 10"/><path d="M5 12h4"/><path d="m15 16 3-7 3 7"/><path d="M16.5 13.5h3"/></svg>'
    };

    function getIcon(name) {
      return SVG_ICONS[name] || '';
    }

    // Helper badge formatter
    function getStatusBadge(status) {
      switch (status) {
        case "open": return '<span class="badge badge-neutral">Ouvert</span>';
        case "released": return '<span class="badge badge-warning">Lancé (En prép.)</span>';
        case "picked": return '<span class="badge badge-primary">Prélevé</span>';
        case "shipped": return '<span class="badge badge-success">Expédié</span>';
        default: return `<span class="badge badge-neutral">${status}</span>`;
      }
    }

    function renderAlertBanner(uiState) {
      if (!uiState.banner) return "";
      const b = uiState.banner;
      return `
        <div class="alert-banner ${b.type || 'info'}" role="alert">
          <div>${b.message}</div>
          <button class="alert-close-btn" data-action="dismiss-banner" aria-label="Fermer le message">&times;</button>
        </div>
      `;
    }

    // 1. Formation View
    function renderTrainingView(state, trainingState, uiState) {
      const totalLessons = TRAINING_LESSONS.length;
      let completedCount = 0;
      TRAINING_LESSONS.forEach(l => {
        const missionDone = !!trainingState.completedMissions[l.id];
        const quizDone = trainingState.answeredQuestions[l.id] && trainingState.answeredQuestions[l.id].isCorrect;
        if (missionDone && quizDone) completedCount++;
      });

      const percent = Math.round((completedCount / totalLessons) * 100);
      const isAllFinished = completedCount === totalLessons;

      return `
        <div class="course-header">
          <div class="course-headline">
            <div>
              <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Formation Pratique WMS</h1>
              <p style="color: var(--text-muted); font-size: 13px;">Apprenez le cycle complet de gestion d'entrepôt par la pratique directe dans le système.</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="num" style="font-size: 16px; font-weight: 700; color: var(--primary);">${completedCount} / ${totalLessons} leçons</span>
              <button class="btn btn-secondary btn-sm" data-action="reset-training">${getIcon("refresh")} Recommencer la formation</button>
            </div>
          </div>
          <div class="progress-bar-bg" style="height: 10px;">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
          ${isAllFinished ? `
            <div class="alert-banner success" style="margin-bottom: 0;">
              <div>
                <strong>${getIcon("award")} Félicitations ! Vous avez terminé toutes les leçons du cycle logistique.</strong><br>
                Vous maîtrisez désormais les flux de réception, rangement, allocation, prélèvement, expédition, gestion de rupture et inventaire tournant.
              </div>
            </div>
          ` : ''}
        </div>

        <div class="lessons-list">
          ${TRAINING_LESSONS.map((lesson, idx) => {
            const isMissionDone = !!trainingState.completedMissions[lesson.id];
            const qState = trainingState.answeredQuestions[lesson.id];
            const isQuizDone = qState && qState.isCorrect;
            const isLessonDone = isMissionDone && isQuizDone;
            const isExpanded = trainingState.activeLessonId === lesson.id;

            return `
              <div class="lesson-card ${isLessonDone ? 'completed' : ''} ${isExpanded ? 'active' : ''}">
                <button class="lesson-toggle-btn" data-action="toggle-lesson" data-lesson-id="${lesson.id}" aria-expanded="${isExpanded}">
                  <div class="lesson-title-wrap">
                    <div class="lesson-num">${isLessonDone ? getIcon('check') : (idx + 1)}</div>
                    <div>
                      <div class="lesson-title-text">${lesson.title}</div>
                      <div style="font-size: 12px; color: var(--text-muted);">
                        Mission : ${isMissionDone ? 'Terminée' : 'À réaliser'} • Quiz : ${isQuizDone ? 'Réussi' : 'En attente'}
                      </div>
                    </div>
                  </div>
                  <div>
                    ${isLessonDone ? '<span class="badge badge-success">Terminée</span>' : (isExpanded ? '<span class="badge badge-primary">En cours</span>' : '<span class="badge badge-neutral">Détails</span>')}
                  </div>
                </button>

                ${isExpanded ? `
                  <div class="lesson-content">
                    <div class="concept-box">
                      <strong style="color: var(--primary-text); font-size: 12px; text-transform: uppercase;">1. Comprendre le concept</strong>
                      <p style="margin-top: 6px;">${lesson.concept}</p>
                    </div>

                    <div>
                      <div style="font-weight: 600; font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Glossaire essentiel</div>
                      <div class="glossary-grid">
                        ${lesson.glossary.map(g => `
                          <div class="glossary-term">
                            <strong>${g.term}</strong>
                            <span>${g.def}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>

                    <div class="mission-box">
                      <div class="mission-status-head">
                        <strong style="font-size: 13px; display: flex; align-items: center; gap: 6px;">
                          ${getIcon("target")} Mission pratique
                        </strong>
                        ${isMissionDone 
                          ? `<span class="badge badge-success">${getIcon('check')} Mission accomplie</span>` 
                          : `<span class="badge badge-warning">${getIcon('clock')} En attente d'action</span>`}
                      </div>
                      <p style="font-size: 13px;">${lesson.missionText}</p>
                      <div>
                        <button class="btn btn-primary btn-sm" data-action="nav-tab" data-tab="${lesson.targetTab}">
                          Aller sur l'écran « ${getTabLabel(lesson.targetTab)} » →
                        </button>
                      </div>
                    </div>

                    <div class="quiz-box">
                      <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px;">${getIcon("help")} Question de validation</div>
                      <p style="font-size: 13px; color: var(--text-main);">${lesson.question}</p>
                      
                      <div class="quiz-options">
                        ${lesson.options.map((opt, oIdx) => {
                          const isSelected = qState && qState.selectedIndex === oIdx;
                          return `
                            <label class="quiz-option-label" style="${isSelected ? (qState.isCorrect ? 'border-color: var(--success); background-color: var(--success-subtle);' : 'border-color: var(--danger); background-color: var(--danger-subtle);') : ''}">
                              <input type="radio" name="quiz-${lesson.id}" value="${oIdx}" data-action="select-quiz-option" data-lesson-id="${lesson.id}" ${isSelected ? 'checked' : ''}>
                              <span>${opt}</span>
                            </label>
                          `;
                        }).join('')}
                      </div>

                      ${qState ? `
                        <div class="quiz-feedback" style="background-color: ${qState.isCorrect ? 'var(--success-subtle)' : 'var(--danger-subtle)'}; color: ${qState.isCorrect ? 'var(--success-text)' : 'var(--danger-text)'};">
                          <strong>${qState.isCorrect ? 'Excellente réponse !' : 'Réponse incorrecte.'}</strong>
                          <div style="margin-top: 4px;">${lesson.explanation}</div>
                          ${!qState.isCorrect ? `
                            <div style="margin-top: 6px;">
                              <button class="btn btn-secondary btn-sm" data-action="retry-quiz" data-lesson-id="${lesson.id}">Réessayer</button>
                            </div>
                          ` : ''}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function getTabLabel(tabKey) {
      switch (tabKey) {
        case "formation": return "Formation";
        case "dashboard": return "Tableau de bord";
        case "reception": return "Réception";
        case "expedition": return "Expédition";
        case "stock": return "Stock";
        case "inventaire": return "Inventaire";
        default: return tabKey;
      }
    }

    // 2. Dashboard View
    function renderDashboardView(state) {
      // KPIs
      const totalUnits = state.stock.reduce((sum, s) => sum + s.qty, 0);

      const nonDockLocations = state.locations.filter(l => !l.isDock);
      const totalCapacity = nonDockLocations.reduce((sum, l) => sum + l.capacity, 0);
      const usedCapacity = state.stock
        .filter(s => {
          const loc = state.locations.find(l => l.code === s.location);
          return loc && !loc.isDock;
        })
        .reduce((sum, s) => sum + s.qty, 0);
      const occupancyRate = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

      const pendingPutaways = state.tasks.filter(t => t.type === "putaway" && !t.done).length;
      const pendingPicks = state.tasks.filter(t => t.type === "pick" && !t.done).length;
      const ordersReadyToShip = state.salesOrders.filter(s => s.status === "picked").length;

      return `
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Unités en stock</span>
            <span class="kpi-value num">${totalUnits}</span>
            <span class="kpi-desc">Total physique dans l'entrepôt</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Taux d'occupation</span>
            <span class="kpi-value num">${occupancyRate}%</span>
            <span class="kpi-desc">${usedCapacity} / ${totalCapacity} unités en rayon</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Rangements en attente</span>
            <span class="kpi-value num">${pendingPutaways}</span>
            <span class="kpi-desc">Mises en stock à confirmer</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Prélèvements en cours</span>
            <span class="kpi-value num">${pendingPicks}</span>
            <span class="kpi-desc">Tâches de picking ouvertes</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Prêtes à expédier</span>
            <span class="kpi-value num">${ordersReadyToShip}</span>
            <span class="kpi-desc">Commandes au statut Prélevé</span>
          </div>
        </div>

        <!-- Warehouse Map -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("map")} Plan de l'entrepôt & Taux de remplissage</span>
            <span style="font-size: 12px; color: var(--text-muted);">Alerte visuelle dès 85% d'occupation</span>
          </div>
          <div class="card-body">
            <div class="map-grid">
              ${state.locations.map(loc => {
                const itemsInLoc = state.stock.filter(s => s.location === loc.code);
                const currentUsed = itemsInLoc.reduce((sum, s) => sum + s.qty, 0);
                const isDock = loc.isDock;
                const percent = isDock ? 0 : Math.min(100, Math.round((currentUsed / loc.capacity) * 100));
                
                let fillClass = "";
                if (percent >= 100) fillClass = "full";
                else if (percent >= 85) fillClass = "warn";

                return `
                  <div class="location-cell">
                    <div class="location-cell-head">
                      <div>
                        <span class="location-code">${loc.code}</span>
                        <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">
                          ${isDock ? 'Quai' : `Zone ${loc.zone}`}
                        </span>
                      </div>
                      <div>
                        ${isDock ? '<span class="badge badge-neutral">Illimité</span>' : `<span class="badge ${percent >= 85 ? 'badge-warning' : 'badge-neutral'} num">${percent}%</span>`}
                      </div>
                    </div>

                    ${!isDock ? `
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${fillClass}" style="width: ${percent}%;"></div>
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
                        <span>Occ.: <b class="num">${currentUsed}</b> / ${loc.capacity}</span>
                        <span>Libre: <b class="num">${Math.max(0, loc.capacity - currentUsed)}</b></span>
                      </div>
                    ` : `
                      <div style="font-size: 11px; color: var(--text-muted);">
                        Stock actuel sur le quai : <b class="num">${currentUsed}</b> unités
                      </div>
                    `}

                    <div style="border-top: 1px solid var(--border-subtle); padding-top: 6px; margin-top: 2px;">
                      ${itemsInLoc.length === 0 ? `
                        <span style="font-size: 12px; color: var(--text-subtle); font-style: italic;">Emplacement vide</span>
                      ` : `
                        <div style="display: flex; flex-direction: column; gap: 3px;">
                          ${itemsInLoc.map(s => `
                            <div style="display: flex; justify-content: space-between; font-size: 12px;">
                              <span>${s.sku}</span>
                              <strong class="num">${s.qty}</strong>
                            </div>
                          `).join('')}
                        </div>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Recent Movements (last 8) -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("history")} Derniers mouvements de stock</span>
            <span style="font-size: 12px; color: var(--text-muted);">Historique en temps réel (8 derniers)</span>
          </div>
          <div class="card-body" style="padding: 0;">
            <div class="table-container" style="border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 100px;">Heure</th>
                    <th>Événement</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.movementLogs.slice(0, 8).map(log => `
                    <tr>
                      <td class="num" style="color: var(--text-muted); font-size: 12px;">${log.time}</td>
                      <td>${log.text}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Réception View
    function renderReceptionView(state) {
      const openPutawayTasks = state.tasks.filter(t => t.type === "putaway" && !t.done);

      return `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("reception")} Commandes d'achat fournisseurs (Purchase Orders)</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Réceptionnez les livraisons des fournisseurs. La marchandise est d'abord déposée sur le quai de RÉCEPTION, puis le WMS génère automatiquement des tâches de rangement (putaway).
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 18px;">
              ${state.purchaseOrders.map(po => `
                <div style="border: 2px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                  <div style="background-color: var(--pastel-yellow-subtle); border-bottom: 2px solid var(--border-color); padding: 10px 14px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span>${po.id}</span>
                      <span style="font-weight: 400; color: var(--text-muted); font-size: 13px; margin-left: 8px;">Fournisseur : ${po.supplier}</span>
                    </div>
                  </div>
                  <div class="table-container" style="border: none; border-radius: 0;">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Article</th>
                          <th style="text-align: right;">Commandé</th>
                          <th style="text-align: right;">Reçu</th>
                          <th style="text-align: right;">Restant</th>
                          <th style="text-align: right; width: 220px;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${po.lines.map((line, lIdx) => {
                          const item = state.items.find(i => i.sku === line.sku);
                          const remaining = Math.max(0, line.ordered - line.received);
                          const isClosed = remaining === 0;

                          return `
                            <tr>
                              <td><strong>${line.sku}</strong></td>
                              <td>${item ? item.name : ''}</td>
                              <td class="num" style="text-align: right;">${line.ordered}</td>
                              <td class="num" style="text-align: right;">${line.received}</td>
                              <td class="num" style="text-align: right; font-weight: 600; color: ${isClosed ? 'var(--text-muted)' : 'var(--primary)'};">
                                ${remaining}
                              </td>
                              <td style="text-align: right;">
                                ${isClosed ? `
                                  <span class="badge badge-success">Soldé</span>
                                ` : `
                                  <div style="display: inline-flex; align-items: center; gap: 6px;">
                                    <input type="number" 
                                           id="input-rcv-${po.id}-${lIdx}"
                                           class="input-text input-number num" 
                                           min="1" 
                                           max="${remaining}" 
                                           value="${remaining}" 
                                           aria-label="Quantité à réceptionner pour ${line.sku}">
                                    <button class="btn btn-primary btn-sm" 
                                            data-action="receive-po-line" 
                                            data-po-id="${po.id}" 
                                            data-line-idx="${lIdx}">
                                      Réceptionner
                                    </button>
                                  </div>
                                `}
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Putaway Tasks Table -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("box")} Tâches de rangement à exécuter (Putaway Tasks)</span>
            <span class="badge badge-primary num">${openPutawayTasks.length} en attente</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Déplacez les marchandises depuis le quai de RÉCEPTION vers leur emplacement de stockage cible.
            </p>

            ${openPutawayTasks.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic; background-color: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                Aucune tâche de rangement en attente. Réceptionnez une commande d'achat ci-dessus pour générer des tâches.
              </div>
            ` : `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID Tâche</th>
                      <th>Réf. PO</th>
                      <th>SKU & Désignation</th>
                      <th style="text-align: right;">Quantité</th>
                      <th>Origine</th>
                      <th>Emplacement Destination Cible</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${openPutawayTasks.map(task => {
                      const item = state.items.find(i => i.sku === task.sku);
                      const zone = item ? item.zone : "A";
                      const candidateLocs = state.locations.filter(l => !l.isDock && l.zone === zone);

                      return `
                        <tr>
                          <td><strong>${task.id}</strong></td>
                          <td>${task.ref}</td>
                          <td>
                            <strong>${task.sku}</strong>
                            <div style="font-size: 11px; color: var(--text-muted);">${item ? item.name : ''}</div>
                          </td>
                          <td class="num" style="text-align: right; font-weight: 700;">${task.qty}</td>
                          <td><span class="badge badge-neutral">${task.from}</span></td>
                          <td>
                            <select class="input-select" id="select-dest-${task.id}" aria-label="Destination pour la tâche ${task.id}">
                              ${task.to === "" ? '<option value="">-- Choisir un emplacement --</option>' : ''}
                              ${candidateLocs.map(loc => {
                                const free = getLocationPhysicalFreeSpace(state, loc.code);
                                const isSelected = loc.code === task.to;
                                return `
                                  <option value="${loc.code}" ${isSelected ? 'selected' : ''}>
                                    ${loc.code} (Espace libre : ${free} / ${loc.capacity})
                                  </option>
                                `;
                              }).join('')}
                            </select>
                          </td>
                          <td style="text-align: right;">
                            <button class="btn btn-primary btn-sm" data-action="confirm-putaway" data-task-id="${task.id}">
                              Ranger →
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // 4. Expédition View
    function renderExpeditionView(state) {
      const openPickTasks = state.tasks.filter(t => t.type === "pick" && !t.done);

      return `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("expedition")} Commandes clients (Sales Orders)</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Gérez le cycle de préparation des commandes clients : lancement (allocation & vidage des petits emplacements), prélèvement et expédition.
            </p>

            <div style="display: flex; flex-direction: column; gap: 18px;">
              ${state.salesOrders.map(so => {
                const canRelease = so.status === "open";
                const canShip = so.status === "picked";
                const hasShortage = so.shortages && Object.keys(so.shortages).length > 0;

                return `
                  <div style="border: 2px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <div style="background-color: var(--pastel-blue-subtle); border-bottom: 2px solid var(--border-color); padding: 10px 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px;">
                      <div>
                        <strong>${so.id}</strong>
                        <span style="color: var(--text-muted); font-size: 13px; margin-left: 8px;">Client : ${so.customer}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        ${getStatusBadge(so.status)}
                        ${canRelease ? `
                          <button class="btn btn-primary btn-sm" data-action="release-so" data-so-id="${so.id}">
                            Lancer la préparation
                          </button>
                        ` : ''}
                        ${canShip ? `
                          <button class="btn btn-success btn-sm" data-action="ship-so" data-so-id="${so.id}">
                            Expédier la commande
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    ${hasShortage ? `
                      <div style="padding: 10px 14px; background-color: var(--danger-subtle); color: var(--danger-text); font-size: 12.5px; font-weight: 700; border-bottom: 2px solid var(--border-color);">
                        ${getIcon("alert")} Rupture détectée lors du lancement : ${Object.entries(so.shortages).map(([sku, q]) => `<b>${sku}</b> (${q} manquants)`).join(', ')}.
                      </div>
                    ` : ''}

                    <div class="table-container" style="border: none; border-radius: 0;">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Article</th>
                            <th style="text-align: right;">Quantité demandée</th>
                            <th style="text-align: right;">Disponibilité totale en rayon</th>
                            <th>État de la ligne</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${so.lines.map(line => {
                            const item = state.items.find(i => i.sku === line.sku);
                            // Available in non-dock locations
                            const totalAvail = state.stock
                              .filter(s => {
                                const loc = state.locations.find(l => l.code === s.location);
                                return loc && !loc.isDock && s.sku === line.sku;
                              })
                              .reduce((sum, s) => sum + s.qty, 0);

                            const shortage = so.shortages ? (so.shortages[line.sku] || 0) : 0;

                            return `
                              <tr>
                                <td><strong>${line.sku}</strong></td>
                                <td>${item ? item.name : ''}</td>
                                <td class="num" style="text-align: right; font-weight: 600;">${line.qty}</td>
                                <td class="num" style="text-align: right; color: ${totalAvail >= line.qty ? 'var(--success-text)' : 'var(--danger-text)'};">
                                  ${totalAvail}
                                </td>
                                <td>
                                  ${shortage > 0 ? `
                                    <span class="badge badge-danger">Rupture partielle (${shortage} manquant${shortage > 1 ? 's' : ''})</span>
                                  ` : (so.status === "open" ? `
                                    <span class="badge badge-neutral">En attente de lancement</span>
                                  ` : `
                                    <span class="badge badge-success">Alloué</span>
                                  `)}
                                </td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Pick Tasks Table -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("clipboard")} Tâches de prélèvement (Picking Tasks)</span>
            <span class="badge badge-primary num">${openPickTasks.length} en attente</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Prélevez les articles dans les emplacements recommandés par le WMS et acheminez-les sur le quai d'EXPÉDITION.
            </p>

            ${openPickTasks.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic; background-color: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                Aucun prélèvement en attente. Lancez la préparation d'une commande client ci-dessus pour générer des tâches.
              </div>
            ` : `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID Tâche</th>
                      <th>Commande (Ref)</th>
                      <th>SKU & Désignation</th>
                      <th style="text-align: right;">Quantité</th>
                      <th>Emplacement Source</th>
                      <th>Destination</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${openPickTasks.map(task => {
                      const item = state.items.find(i => i.sku === task.sku);
                      return `
                        <tr>
                          <td><strong>${task.id}</strong></td>
                          <td>${task.ref}</td>
                          <td>
                            <strong>${task.sku}</strong>
                            <div style="font-size: 11px; color: var(--text-muted);">${item ? item.name : ''}</div>
                          </td>
                          <td class="num" style="text-align: right; font-weight: 700;">${task.qty}</td>
                          <td><span class="badge badge-neutral">${task.from}</span></td>
                          <td><span class="badge badge-primary">${task.to}</span></td>
                          <td style="text-align: right;">
                            <button class="btn btn-primary btn-sm" data-action="confirm-pick" data-task-id="${task.id}">
                              Confirmer le prélèvement →
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `;
    }

    // 5. Stock View
    function renderStockView(state) {
      return `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("box")} État du stock par emplacement</span>
            <div>
              <button class="btn btn-danger btn-sm" data-action="reset-demo" title="Réinitialiser les données de l'entrepôt à l'état initial">
                ${getIcon("alert")} Réinitialiser les données de démo
              </button>
            </div>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Visualisation complète des stocks. Remarque : réinitialiser les données de démo ne réinitialise JAMAIS votre progression pédagogique dans la formation.
            </p>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Emplacement</th>
                    <th>Type</th>
                    <th>Zone</th>
                    <th>SKU</th>
                    <th>Désignation article</th>
                    <th style="text-align: right;">Quantité</th>
                    <th style="text-align: right;">Capacité max</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.locations.map(loc => {
                    const rows = state.stock.filter(s => s.location === loc.code);
                    if (rows.length === 0) {
                      return `
                        <tr>
                          <td><strong>${loc.code}</strong></td>
                          <td>${loc.isDock ? '<span class="badge badge-primary">Quai</span>' : '<span class="badge badge-neutral">Rayonnage</span>'}</td>
                          <td>${loc.isDock ? '-' : loc.zone}</td>
                          <td colspan="3" style="color: var(--text-muted); font-style: italic;">(Emplacement vide)</td>
                          <td class="num" style="text-align: right;">${loc.isDock ? 'Illimité' : loc.capacity}</td>
                        </tr>
                      `;
                    }
                    return rows.map((r, rIdx) => {
                      const it = state.items.find(i => i.sku === r.sku);
                      return `
                        <tr>
                          ${rIdx === 0 ? `<td rowspan="${rows.length}"><strong>${loc.code}</strong></td>` : ''}
                          ${rIdx === 0 ? `<td rowspan="${rows.length}">${loc.isDock ? '<span class="badge badge-primary">Quai</span>' : '<span class="badge badge-neutral">Rayonnage</span>'}</td>` : ''}
                          ${rIdx === 0 ? `<td rowspan="${rows.length}">${loc.isDock ? '-' : loc.zone}</td>` : ''}
                          <td><strong>${r.sku}</strong></td>
                          <td>${it ? it.name : ''}</td>
                          <td class="num" style="text-align: right; font-weight: 700;">${r.qty}</td>
                          ${rIdx === 0 ? `<td class="num" rowspan="${rows.length}" style="text-align: right;">${loc.isDock ? 'Illimité' : loc.capacity}</td>` : ''}
                        </tr>
                      `;
                    }).join('');
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // 6. Inventaire View (Cycle Counting - Bonus Lesson 8)
    function renderInventaireView(state, uiState) {
      const selectedLocCode = uiState.selectedCountLoc || "A-01";
      const selectedLoc = state.locations.find(l => l.code === selectedLocCode) || state.locations[0];
      const itemsInLoc = state.stock.filter(s => s.location === selectedLoc.code);

      return `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("clipboard")} Inventaire tournant (Cycle Counting)</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
              L'inventaire tournant consiste à compter un emplacement ciblé pour corriger les écarts éventuels sans interrompre l'activité de l'entrepôt.
            </p>

            <div style="background-color: var(--bg-surface-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
              <label for="select-count-loc" style="font-weight: 600; font-size: 13px;">Sélectionner un emplacement à compter :</label>
              <select id="select-count-loc" class="input-select" data-action="change-count-loc" aria-label="Sélectionner l'emplacement">
                ${state.locations.filter(l => !l.isDock).map(loc => `
                  <option value="${loc.code}" ${loc.code === selectedLoc.code ? 'selected' : ''}>
                    ${loc.code} (Zone ${loc.zone} - Capacité : ${loc.capacity})
                  </option>
                `).join('')}
              </select>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">Articles présents dans ${selectedLoc.code} selon le système</h3>
              ${itemsInLoc.length === 0 ? `
                <div style="padding: 16px; background-color: var(--bg-surface-subtle); border-radius: var(--radius-sm); color: var(--text-muted); font-style: italic;">
                  Aucun article enregistré dans ${selectedLoc.code} selon le système. Vous pouvez déclarer une découverte de produit ci-dessous.
                </div>
              ` : `
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Désignation article</th>
                        <th style="text-align: right;">Stock système</th>
                        <th style="text-align: right; width: 140px;">Comptage physique réel</th>
                        <th style="text-align: right;">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsInLoc.map(s => {
                        const it = state.items.find(i => i.sku === s.sku);
                        return `
                          <tr>
                            <td><strong>${s.sku}</strong></td>
                            <td>${it ? it.name : ''}</td>
                            <td class="num" style="text-align: right; font-weight: 600;">${s.qty}</td>
                            <td style="text-align: right;">
                              <input type="number" 
                                     id="count-input-${s.sku}" 
                                     class="input-text input-number num" 
                                     min="0" 
                                     value="${s.qty}"
                                     aria-label="Comptage pour ${s.sku}">
                            </td>
                            <td style="text-align: right;">
                              <button class="btn btn-primary btn-sm" 
                                      data-action="submit-count" 
                                      data-loc="${selectedLoc.code}" 
                                      data-sku="${s.sku}">
                                Valider l'ajustement
                              </button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `}
            </div>

            <!-- Add SKU not in system (discovery) -->
            <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
              <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Déclarer un autre article dans cet emplacement</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                <select id="new-sku-select" class="input-select" aria-label="Choisir un SKU">
                  ${state.items.filter(i => !itemsInLoc.some(s => s.sku === i.sku)).map(i => `
                    <option value="${i.sku}">${i.sku} — ${i.name}</option>
                  `).join('')}
                </select>
                <input type="number" id="new-sku-qty" class="input-text input-number num" min="1" value="10" placeholder="Quantité" aria-label="Quantité comptée">
                <button class="btn btn-secondary btn-sm" data-action="submit-new-count" data-loc="${selectedLoc.code}">
                  Enregistrer découverte
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Main App Renderer
    function renderApp() {
      // Preserve active input focus & cursor if possible
      const activeEl = document.activeElement;
      const activeId = activeEl ? activeEl.id : null;
      const selStart = (activeEl && ('selectionStart' in activeEl)) ? activeEl.selectionStart : null;
      const selEnd = (activeEl && ('selectionEnd' in activeEl)) ? activeEl.selectionEnd : null;
      const scrollY = window.scrollY;

      // Update Header Tab Badges
      const totalLessons = TRAINING_LESSONS.length;
      let completedLessons = 0;
      TRAINING_LESSONS.forEach(l => {
        const mDone = !!trainingState.completedMissions[l.id];
        const qDone = trainingState.answeredQuestions[l.id] && trainingState.answeredQuestions[l.id].isCorrect;
        if (mDone && qDone) completedLessons++;
      });
      const badgeTraining = document.getElementById("badge-training-progress");
      if (badgeTraining) badgeTraining.textContent = `${completedLessons}/${totalLessons}`;

      const openPutaways = warehouseState.tasks.filter(t => t.type === "putaway" && !t.done).length;
      const badgeRec = document.getElementById("badge-reception-count");
      if (badgeRec) badgeRec.textContent = openPutaways;

      const openPicks = warehouseState.tasks.filter(t => t.type === "pick" && !t.done).length;
      const badgeExp = document.getElementById("badge-expedition-count");
      if (badgeExp) badgeExp.textContent = openPicks;

      // Update Nav Tabs Active State
      document.querySelectorAll(".nav-tab-btn").forEach(btn => {
        const tab = btn.getAttribute("data-tab");
        if (tab === uiState.activeTab) {
          btn.setAttribute("aria-current", "page");
        } else {
          btn.removeAttribute("aria-current");
        }
      });

      // Render Active View
      const appContainer = document.getElementById("app");
      let viewHtml = renderAlertBanner(uiState);

      switch (uiState.activeTab) {
        case "formation":
          viewHtml += renderTrainingView(warehouseState, trainingState, uiState);
          break;
        case "dashboard":
          viewHtml += renderDashboardView(warehouseState);
          break;
        case "reception":
          viewHtml += renderReceptionView(warehouseState);
          break;
        case "expedition":
          viewHtml += renderExpeditionView(warehouseState);
          break;
        case "stock":
          viewHtml += renderStockView(warehouseState);
          break;
        case "inventaire":
          viewHtml += renderInventaireView(warehouseState, uiState);
          break;
        default:
          viewHtml += renderTrainingView(warehouseState, trainingState, uiState);
      }

      if (appContainer) {
        appContainer.innerHTML = viewHtml;
      }

      // Restore Focus & Scroll
      if (activeId) {
        const el = document.getElementById(activeId);
        if (el) {
          el.focus();
          if (selStart !== null && 'setSelectionRange' in el) {
            try { el.setSelectionRange(selStart, selEnd); } catch(e) {}
          }
        }
      }
      window.scrollTo(0, scrollY);
    }


    /* ==========================================================================
       SECTION 5: EVENTS & STATE PERSISTENCE
       ========================================================================== */
    const STORAGE_KEY_WAREHOUSE = "stockroom_warehouse_v1";
    const STORAGE_KEY_TRAINING = "stockroom_training_v1";
    const STORAGE_KEY_THEME = "stockroom_theme_v1";
    const STORAGE_KEY_TEXT_SCALE = "stockroom_text_scale_v1";

    let warehouseState = createFreshWarehouseState();
    let trainingState = createFreshTrainingState();
    let uiState = {
      activeTab: "formation",
      banner: null, // { type: 'danger'|'success'|'info', message: '' }
      selectedCountLoc: "A-01"
    };

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY_WAREHOUSE, JSON.stringify(warehouseState));
      } catch (e) {
        console.warn("Stockage warehouseState impossible :", e);
      }
      try {
        localStorage.setItem(STORAGE_KEY_TRAINING, JSON.stringify(trainingState));
      } catch (e) {
        console.warn("Stockage trainingState impossible :", e);
      }
    }

    function checkTrainingMissions() {
      let changed = false;
      if (uiState.activeTab === "stock") {
        trainingState.visitedStockTab = true;
      }
      TRAINING_LESSONS.forEach(lesson => {
        if (!trainingState.completedMissions[lesson.id]) {
          if (lesson.checkCompleted(warehouseState, trainingState, uiState)) {
            trainingState.completedMissions[lesson.id] = true;
            changed = true;
          }
        }
      });
      if (changed) {
        saveState();
      }
    }

    function showBanner(type, message) {
      uiState.banner = { type, message };
    }

    function clearBanner() {
      uiState.banner = null;
    }

    // Global Event Delegation
    document.addEventListener("click", function(e) {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const action = target.getAttribute("data-action");

      if (action === "dismiss-banner") {
        clearBanner();
        renderApp();
        return;
      }

      if (action === "toggle-text-size") {
        const root = document.documentElement;
        const current = root.getAttribute("data-text-scale") || "auto";
        let next = "large";
        if (current === "large") next = "normal";
        else if (current === "normal") next = "auto";
        root.setAttribute("data-text-scale", next);
        try { localStorage.setItem(STORAGE_KEY_TEXT_SCALE, next); } catch(e){}
        const btn = document.getElementById("btn-text-size-toggle");
        if (btn) {
          btn.innerHTML = (next === "large" ? `${getIcon("text-size")} <span class="hide-mobile">Grand</span>` : (next === "normal" ? `${getIcon("text-size")} <span class="hide-mobile">Compact</span>` : `${getIcon("text-size")} <span class="hide-mobile">Auto</span>`));
        }
        return;
      }

      if (action === "toggle-theme") {
        const root = document.documentElement;
        const current = root.getAttribute("data-theme") || "auto";
        let next = "dark";
        if (current === "dark") next = "light";
        else if (current === "light") next = "auto";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(STORAGE_KEY_THEME, next); } catch(e){}
        return;
      }

      if (action === "trigger-self-tests") {
        runSelfTests();
        return;
      }

      if (action === "nav-tab") {
        const tab = target.getAttribute("data-tab");
        if (tab) {
          clearBanner();
          uiState.activeTab = tab;
          checkTrainingMissions();
          renderApp();
        }
        return;
      }

      if (action === "toggle-lesson") {
        const lessonId = Number(target.getAttribute("data-lesson-id"));
        trainingState.activeLessonId = trainingState.activeLessonId === lessonId ? null : lessonId;
        saveState();
        renderApp();
        return;
      }

      if (action === "retry-quiz") {
        const lessonId = Number(target.getAttribute("data-lesson-id"));
        delete trainingState.answeredQuestions[lessonId];
        saveState();
        renderApp();
        return;
      }

      if (action === "reset-training") {
        if (confirm("Voulez-vous vraiment réinitialiser votre progression pédagogique ?")) {
          trainingState = createFreshTrainingState();
          saveState();
          showBanner("info", "La formation a été réinitialisée. Bon apprentissage !");
          renderApp();
        }
        return;
      }

      if (action === "reset-demo") {
        if (confirm("Réinitialiser les données de l'entrepôt ? Votre progression de formation sera conservée.")) {
          warehouseState = createFreshWarehouseState();
          saveState();
          showBanner("success", "Les données de démonstration de l'entrepôt ont été réinitialisées.");
          renderApp();
        }
        return;
      }

      if (action === "receive-po-line") {
        const poId = target.getAttribute("data-po-id");
        const lineIdx = Number(target.getAttribute("data-line-idx"));
        const input = document.getElementById(`input-rcv-${poId}-${lineIdx}`);
        const qty = input ? Number(input.value) : 0;

        const res = receive(warehouseState, poId, lineIdx, qty);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          clearBanner();
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "confirm-putaway") {
        const taskId = target.getAttribute("data-task-id");
        const select = document.getElementById(`select-dest-${taskId}`);
        const chosenDest = select ? select.value : "";

        const res = confirmPutaway(warehouseState, taskId, chosenDest);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          clearBanner();
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "release-so") {
        const soId = target.getAttribute("data-so-id");
        const res = releaseOrder(warehouseState, soId);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          clearBanner();
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "confirm-pick") {
        const taskId = target.getAttribute("data-task-id");
        const res = confirmPick(warehouseState, taskId);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          clearBanner();
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "ship-so") {
        const soId = target.getAttribute("data-so-id");
        const res = ship(warehouseState, soId);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          clearBanner();
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "submit-count") {
        const loc = target.getAttribute("data-loc");
        const sku = target.getAttribute("data-sku");
        const input = document.getElementById(`count-input-${sku}`);
        const count = input ? Number(input.value) : 0;

        const res = adjustInventory(warehouseState, loc, sku, count);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          showBanner("success", `Inventaire validé pour ${sku} sur ${loc}.`);
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "submit-new-count") {
        const loc = target.getAttribute("data-loc");
        const select = document.getElementById("new-sku-select");
        const input = document.getElementById("new-sku-qty");
        const sku = select ? select.value : "";
        const count = input ? Number(input.value) : 0;

        if (!sku) return;
        const res = adjustInventory(warehouseState, loc, sku, count);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          showBanner("success", `Nouvel article ${sku} ajouté par inventaire dans ${loc}.`);
          checkTrainingMissions();
          saveState();
        }
        renderApp();
        return;
      }
    });

    document.addEventListener("change", function(e) {
      const target = e.target;
      const action = target.getAttribute("data-action");

      if (action === "change-count-loc") {
        uiState.selectedCountLoc = target.value;
        renderApp();
        return;
      }

      if (action === "select-quiz-option") {
        const lessonId = Number(target.getAttribute("data-lesson-id"));
        const selectedIdx = Number(target.value);
        const lesson = TRAINING_LESSONS.find(l => l.id === lessonId);
        if (!lesson) return;

        const isCorrect = selectedIdx === lesson.correctIndex;
        trainingState.answeredQuestions[lessonId] = {
          answered: true,
          selectedIndex: selectedIdx,
          isCorrect: isCorrect
        };
        saveState();
        renderApp();
        return;
      }
    });


    /* ==========================================================================
       SECTION 6: SELF-TESTS
       ========================================================================== */
    function runSelfTests() {
      console.log("==================================================");
      console.log("[TESTS] Lancement des auto-tests de validation WMS...");
      console.log("==================================================");

      const testResults = [];
      function assert(name, condition, details) {
        const pass = !!condition;
        testResults.push({ name, pass, details: details || "" });
        if (pass) {
          console.log(`[PASS] ${name}`);
        } else {
          console.error(`[FAIL] ${name} — ${details}`);
        }
      }

      // TEST SUITE 1: Receive clamping & Putaway splitting across locations
      try {
        const st1 = createFreshWarehouseState();
        // Line has 150 ordered, 0 received. Request 9999 units.
        receive(st1, "PO-1001", 0, 9999);
        const poLine = st1.purchaseOrders.find(p => p.id === "PO-1001").lines[0];
        assert("Receive clamp : la quantité reçue est bridée au restant dû (150)", poLine.received === 150);

        // Putaway planning on CAF-1KG 150 units:
        // Zone A locations: A-01 (120/200, free 80), A-02 (60/200, free 140).
        // Both hold CAF-1KG. Free space: A-02 has 140, A-01 has 80.
        // Sorted candidate list: A-02 (free 140) then A-01 (free 80).
        // Total tasks created should sum to 150 and split across A-02 and A-01.
        const putaways = st1.tasks.filter(t => t.type === "putaway" && t.sku === "CAF-1KG");
        const totalPlanned = putaways.reduce((s, t) => s + t.qty, 0);
        assert("Putaway split : la somme des tâches générées égale 150", totalPlanned === 150);
        assert("Putaway split : la quantité a été scindée sur 2 emplacements", putaways.length === 2);

        // Verify neither exceeds location capacity
        let capOk = true;
        for (const t of putaways) {
          const loc = st1.locations.find(l => l.code === t.to);
          const currentStock = st1.stock.filter(s => s.location === t.to).reduce((s, r) => s + r.qty, 0);
          if (currentStock + t.qty > loc.capacity) capOk = false;
        }
        assert("Putaway capacity : les tâches respectent la capacité maximale des emplacements", capOk);
      } catch (err) {
        assert("Suite 1 exception", false, err.message);
      }

      // TEST SUITE 2: Release order takes from least-filled location first & shortage detection
      try {
        const st2 = createFreshWarehouseState();
        // Seed stock for CAF-1KG: A-01 has 120, A-02 has 60.
        // SO-2001 orders 40 CAF-1KG.
        // Least-filled location holding CAF-1KG is A-02 (60 < 120).
        releaseOrder(st2, "SO-2001");
        const so1 = st2.salesOrders.find(s => s.id === "SO-2001");
        assert("Release order : statut devient 'released'", so1.status === "released");

        const coffeePick = st2.tasks.find(t => t.ref === "SO-2001" && t.type === "pick" && t.sku === "CAF-1KG");
        assert("Release allocation : prélèvement depuis l'emplacement le moins rempli (A-02)", coffeePick && coffeePick.from === "A-02" && coffeePick.qty === 40);

        // SO-2003 asks for 100 CHO-500, but only 80 exist in A-03.
        releaseOrder(st2, "SO-2003");
        const so3 = st2.salesOrders.find(s => s.id === "SO-2003");
        assert("Shortage detection : rupture de 20 enregistrée pour CHO-500 sur SO-2003", so3.shortages && so3.shortages["CHO-500"] === 20);
        const choPick = st2.tasks.find(t => t.ref === "SO-2003" && t.type === "pick" && t.sku === "CHO-500");
        assert("Partial allocation : les 80 unités disponibles sont allouées en prélèvement", choPick && choPick.qty === 80);
      } catch (err) {
        assert("Suite 2 exception", false, err.message);
      }

      // TEST SUITE 3: Random sequence of 200 valid operations
      try {
        const st3 = createFreshWarehouseState();
        const initialTotalUnits = st3.stock.reduce((s, r) => s + r.qty, 0);
        let totalReceivedUnits = 0;
        let totalShippedUnits = 0;

        let invariantViolated = false;
        let violationReason = "";

        for (let op = 0; op < 200; op++) {
          const actionChoice = Math.floor(Math.random() * 5);

          // 0: Receive an open PO line
          if (actionChoice === 0) {
            const openPos = st3.purchaseOrders.filter(p => p.lines.some(l => l.received < l.ordered));
            if (openPos.length > 0) {
              const po = openPos[Math.floor(Math.random() * openPos.length)];
              const openLines = po.lines.map((l, idx) => ({ l, idx })).filter(x => x.l.received < x.l.ordered);
              if (openLines.length > 0) {
                const target = openLines[Math.floor(Math.random() * openLines.length)];
                const remaining = target.l.ordered - target.l.received;
                const qtyToReceive = Math.floor(Math.random() * remaining) + 1;
                receive(st3, po.id, target.idx, qtyToReceive);
                totalReceivedUnits += qtyToReceive;
              }
            }
          }
          // 1: Confirm a putaway task
          else if (actionChoice === 1) {
            const openPutaways = st3.tasks.filter(t => t.type === "putaway" && !t.done);
            if (openPutaways.length > 0) {
              const task = openPutaways[Math.floor(Math.random() * openPutaways.length)];
              // Pick destination with enough physical free space
              const item = st3.items.find(i => i.sku === task.sku);
              const candidates = st3.locations.filter(l => !l.isDock && l.zone === item.zone && getLocationPhysicalFreeSpace(st3, l.code) >= task.qty);
              if (candidates.length > 0) {
                const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                confirmPutaway(st3, task.id, chosen.code);
              }
            }
          }
          // 2: Release an open SO
          else if (actionChoice === 2) {
            const openSos = st3.salesOrders.filter(s => s.status === "open");
            if (openSos.length > 0) {
              const so = openSos[Math.floor(Math.random() * openSos.length)];
              releaseOrder(st3, so.id);
            }
          }
          // 3: Confirm a pick task
          else if (actionChoice === 3) {
            const openPicks = st3.tasks.filter(t => t.type === "pick" && !t.done);
            if (openPicks.length > 0) {
              const task = openPicks[Math.floor(Math.random() * openPicks.length)];
              confirmPick(st3, task.id);
            }
          }
          // 4: Ship a picked SO
          else if (actionChoice === 4) {
            const pickedSos = st3.salesOrders.filter(s => s.status === "picked");
            if (pickedSos.length > 0) {
              const so = pickedSos[Math.floor(Math.random() * pickedSos.length)];
              // Count how many units are being shipped
              const pickedTasks = st3.tasks.filter(t => t.ref === so.id && t.type === "pick" && t.done);
              const shipQty = pickedTasks.reduce((s, t) => s + t.qty, 0);
              ship(st3, so.id);
              totalShippedUnits += shipQty;
            }
          }

          // Check Invariants at every step
          // Invariant A: No negative quantities
          for (const s of st3.stock) {
            if (s.qty <= 0) {
              invariantViolated = true;
              violationReason = `Ligne de stock avec quantité <= 0 (${s.sku} dans ${s.location}: ${s.qty})`;
              break;
            }
          }
          // Invariant B: Location capacity never exceeded
          for (const loc of st3.locations) {
            if (!loc.isDock) {
              const used = st3.stock.filter(s => s.location === loc.code).reduce((sum, s) => sum + s.qty, 0);
              if (used > loc.capacity) {
                invariantViolated = true;
                violationReason = `Capacité dépassée dans ${loc.code} (${used} / ${loc.capacity})`;
                break;
              }
            }
          }
          if (invariantViolated) break;
        }

        assert("Invariant 1 : aucune quantité négative pendant 200 opérations aléatoires", !invariantViolated, violationReason);

        // Invariant C: Conservation of mass
        const finalTotalUnits = st3.stock.reduce((s, r) => s + r.qty, 0);
        const expectedTotal = initialTotalUnits + totalReceivedUnits - totalShippedUnits;
        assert(`Invariant 2 : conservation de la masse (Stock actuel ${finalTotalUnits} == Initial ${initialTotalUnits} + Reçu ${totalReceivedUnits} - Expédié ${totalShippedUnits})`, finalTotalUnits === expectedTotal);
      } catch (err) {
        assert("Suite 3 exception", false, err.message);
      }

      // Render Results Panel
      const panel = document.getElementById("test-panel");
      if (panel) {
        const allPass = testResults.every(r => r.pass);
        panel.style.display = "block";
        panel.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <strong style="font-size: 13px;">${allPass ? getIcon('check-circle') + ' Auto-tests : TOUS RÉUSSIS' : getIcon('alert-circle') + ' Auto-tests : ÉCHEC'}</strong>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('test-panel').style.display='none'">Fermer</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${testResults.map(r => `
              <div style="font-size: 11px; padding: 4px 6px; border-radius: 3px; background-color: ${r.pass ? 'var(--success-subtle)' : 'var(--danger-subtle)'}; color: ${r.pass ? 'var(--success-text)' : 'var(--danger-text)'};">
                <b>${r.pass ? '[PASS]' : '[FAIL]'}</b> ${r.name}
                ${r.details ? `<div style="font-size: 10px; opacity: 0.85;">${r.details}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }

      return testResults;
    }


    /* ==========================================================================
       SECTION 7: BOOT
       ========================================================================== */
    function boot() {
      // 1. Theme and Text Scale restoration
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
        if (savedTheme) {
          document.documentElement.setAttribute("data-theme", savedTheme);
        }
      } catch (e) {
        console.warn("Theme storage read error :", e);
      }

      try {
        const savedScale = localStorage.getItem(STORAGE_KEY_TEXT_SCALE);
        if (savedScale) {
          document.documentElement.setAttribute("data-text-scale", savedScale);
          const btn = document.getElementById("btn-text-size-toggle");
          if (btn) {
            btn.innerHTML = (savedScale === "large" ? `${getIcon("text-size")} <span class="hide-mobile">Grand</span>` : (savedScale === "normal" ? `${getIcon("text-size")} <span class="hide-mobile">Compact</span>` : `${getIcon("text-size")} <span class="hide-mobile">Auto</span>`));
          }
        }
      } catch (e) {
        console.warn("Text scale storage read error :", e);
      }

      // 2. Warehouse state restoration
      try {
        const rawW = localStorage.getItem(STORAGE_KEY_WAREHOUSE);
        if (rawW) {
          warehouseState = JSON.parse(rawW);
        }
      } catch (e) {
        console.warn("Warehouse storage read error, defaulting to seed data :", e);
        warehouseState = createFreshWarehouseState();
      }

      // 3. Training state restoration
      try {
        const rawT = localStorage.getItem(STORAGE_KEY_TRAINING);
        if (rawT) {
          trainingState = JSON.parse(rawT);
        }
      } catch (e) {
        console.warn("Training storage read error, defaulting to fresh training :", e);
        trainingState = createFreshTrainingState();
      }

      // Check training mission completion against restored state
      checkTrainingMissions();

      // Initial Render
      renderApp();

      // Check if #tests is in URL hash
      if (window.location.hash === "#tests") {
        setTimeout(runSelfTests, 100);
      }
    }

    // Expose runSelfTests globally for console execution
    window.runSelfTests = runSelfTests;

    // Boot on DOMContentLoaded or immediately if already loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }

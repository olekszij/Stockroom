"use strict";

    /* ==========================================================================
       SECTION 1: DATA SEED (Dynamics 365 Supply Chain Management Data Model)
       ========================================================================== */
    const STATE_VERSION = 2;

    const D365_SETUP = {
      legalEntities: [
        { id: "FR01", name: "Maison Lumière France SAS", currency: "EUR" }
      ],
      sites: [
        { id: "SITE-01", name: "Ivry-sur-Seine", legalEntityId: "FR01" }
      ],
      warehouses: [
        { id: "WH-MAIN", name: "Entrepôt Principal (Distribution)", siteId: "SITE-01", isWmsEnabled: true },
        { id: "WH-RETAIL", name: "Entrepôt Magasin / Détail", siteId: "SITE-01", isWmsEnabled: true }
      ],
      locationTypes: [
        { id: "RECEP", name: "Quai de Réception", isDock: true },
        { id: "BULK",  name: "Stockage Masse (Palettes)", isDock: false },
        { id: "PICK",  name: "Prélèvement (Picking détail)", isDock: false },
        { id: "EXPED", name: "Quai d'Expédition", isDock: true }
      ],
      locationProfiles: [
        { id: "PROF-RECEP", name: "Quai Réception Docks", allowMixedItems: true, requireLP: true, capacityType: "unlimited" },
        { id: "PROF-BULK",  name: "Rack Masse Palette", allowMixedItems: false, requireLP: true, capacityType: "quantity", maxCapacity: 200 },
        { id: "PROF-PICK",  name: "Alvéole Picking Dynamique", allowMixedItems: true, requireLP: false, capacityType: "quantity", maxCapacity: 600 },
        { id: "PROF-EXPED", name: "Quai Expédition Docks", allowMixedItems: true, requireLP: true, capacityType: "unlimited" }
      ],
      zoneGroups: [
        { id: "ZG-INBOUND", name: "Flux Entrant" },
        { id: "ZG-STORAGE", name: "Stockage Réserve & Picking" },
        { id: "ZG-OUTBOUND", name: "Flux Sortant" }
      ],
      zones: [
        { id: "ZONE-RECEP", name: "Zone Réception Quai", group: "ZG-INBOUND" },
        { id: "ZONE-BULK",  name: "Zone Réserve Palettes A", group: "ZG-STORAGE" },
        { id: "ZONE-PICK",  name: "Zone Picking Dynamique B", group: "ZG-STORAGE" },
        { id: "ZONE-EXPED", name: "Zone Expédition Quai", group: "ZG-OUTBOUND" }
      ]
    };

    const SEED_DATA = {
      version: STATE_VERSION,
      items: [
        { sku: "CAF-1KG", name: "Café en grains 1 kg", zone: "ZONE-BULK", tracking: "batch", unit: "KG", unitWeight: 1.0, unitVol: 0.002 },
        { sku: "CHO-500", name: "Chocolat en poudre 500 g", zone: "ZONE-BULK", tracking: "batch", unit: "BOITE", unitWeight: 0.5, unitVol: 0.001 },
        { sku: "SIR-VAN", name: "Sirop de vanille 1 L", zone: "ZONE-BULK", tracking: "batch", unit: "BOUT", unitWeight: 1.2, unitVol: 0.0015 },
        { sku: "AVO-1L",  name: "Lait d'avoine 1 L", zone: "ZONE-BULK", tracking: "batch", unit: "BRIQUE", unitWeight: 1.0, unitVol: 0.0012 },
        { sku: "GOB-12",  name: "Gobelets carton 12 oz", zone: "ZONE-PICK", tracking: "none", unit: "CARTON", unitWeight: 0.2, unitVol: 0.005 },
        { sku: "COUV-12", name: "Couvercles gobelets 12 oz", zone: "ZONE-PICK", tracking: "none", unit: "CARTON", unitWeight: 0.1, unitVol: 0.003 }
      ],
      locations: [
        // WH-MAIN Locations (Aisle-Rack-Level format)
        { code: "RECEPTION",  warehouse: "WH-MAIN", zone: "ZONE-RECEP", type: "RECEP", profile: "PROF-RECEP", capacity: Infinity, isDock: true },
        { code: "EXPEDITION", warehouse: "WH-MAIN", zone: "ZONE-EXPED", type: "EXPED", profile: "PROF-EXPED", capacity: Infinity, isDock: true },
        { code: "A-01-01",    warehouse: "WH-MAIN", zone: "ZONE-BULK",  type: "BULK",  profile: "PROF-BULK",  capacity: 200, isDock: false },
        { code: "A-01-02",    warehouse: "WH-MAIN", zone: "ZONE-BULK",  type: "BULK",  profile: "PROF-BULK",  capacity: 200, isDock: false },
        { code: "A-02-01",    warehouse: "WH-MAIN", zone: "ZONE-BULK",  type: "BULK",  profile: "PROF-BULK",  capacity: 200, isDock: false },
        { code: "A-02-02",    warehouse: "WH-MAIN", zone: "ZONE-BULK",  type: "BULK",  profile: "PROF-BULK",  capacity: 200, isDock: false },
        { code: "B-01-01",    warehouse: "WH-MAIN", zone: "ZONE-PICK",  type: "PICK",  profile: "PROF-PICK",  capacity: 600, isDock: false },
        { code: "B-01-02",    warehouse: "WH-MAIN", zone: "ZONE-PICK",  type: "PICK",  profile: "PROF-PICK",  capacity: 600, isDock: false },
        // WH-RETAIL Locations
        { code: "RECEP-RET",  warehouse: "WH-RETAIL", zone: "ZONE-RECEP", type: "RECEP", profile: "PROF-RECEP", capacity: Infinity, isDock: true },
        { code: "EXPED-RET",  warehouse: "WH-RETAIL", zone: "ZONE-EXPED", type: "EXPED", profile: "PROF-EXPED", capacity: Infinity, isDock: true },
        { code: "R-01-01",    warehouse: "WH-RETAIL", zone: "ZONE-PICK",  type: "PICK",  profile: "PROF-PICK",  capacity: 150, isDock: false },
        { code: "R-01-02",    warehouse: "WH-RETAIL", zone: "ZONE-PICK",  type: "PICK",  profile: "PROF-PICK",  capacity: 150, isDock: false }
      ],
      stock: [
        { id: "STK-1", sku: "CAF-1KG", site: "SITE-01", warehouse: "WH-MAIN", location: "A-01-01", licensePlate: "LP-1001", batch: "LOT-CAF-01", expDate: "2026-12-31", status: "Disponible", qty: 120, reservedQty: 0 },
        { id: "STK-2", sku: "CAF-1KG", site: "SITE-01", warehouse: "WH-MAIN", location: "A-01-02", licensePlate: "LP-1002", batch: "LOT-CAF-02", expDate: "2026-09-30", status: "Disponible", qty: 60, reservedQty: 0 },
        { id: "STK-3", sku: "CHO-500", site: "SITE-01", warehouse: "WH-MAIN", location: "A-02-01", licensePlate: "LP-1003", batch: "LOT-CHO-01", expDate: "2026-11-15", status: "Disponible", qty: 80, reservedQty: 0 },
        { id: "STK-4", sku: "AVO-1L",  site: "SITE-01", warehouse: "WH-MAIN", location: "A-02-02", licensePlate: "LP-1004", batch: "LOT-AVO-01", expDate: "2026-10-31", status: "Disponible", qty: 90, reservedQty: 0 },
        { id: "STK-5", sku: "SIR-VAN", site: "SITE-01", warehouse: "WH-MAIN", location: "A-02-02", licensePlate: "LP-1005", batch: "LOT-SIR-01", expDate: "2027-01-15", status: "Disponible", qty: 40, reservedQty: 0 },
        { id: "STK-6", sku: "GOB-12",  site: "SITE-01", warehouse: "WH-MAIN", location: "B-01-01", licensePlate: "LP-1006", batch: null, expDate: null, status: "Disponible", qty: 300, reservedQty: 0 },
        { id: "STK-7", sku: "COUV-12", site: "SITE-01", warehouse: "WH-MAIN", location: "B-01-02", licensePlate: "LP-1007", batch: null, expDate: null, status: "Disponible", qty: 250, reservedQty: 0 }
      ],
      purchaseOrders: [
        {
          id: "PO-1001",
          warehouse: "WH-MAIN",
          supplier: "Torréfaction Artisanale des Alpes",
          lines: [
            { sku: "CAF-1KG", ordered: 150, received: 0 },
            { sku: "CHO-500", ordered: 60, received: 0 }
          ]
        },
        {
          id: "PO-1002",
          warehouse: "WH-MAIN",
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
          warehouse: "WH-MAIN",
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
          warehouse: "WH-MAIN",
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
          warehouse: "WH-MAIN",
          customer: "Grand Hôtel de la Plage",
          status: "open",
          lines: [
            { sku: "CHO-500", qty: 100 } // only 80 in stock -> shortage of 20
          ],
          shortages: {}
        }
      ],
      workTemplates: [
        { id: "WT-PO-PUT", name: "Rangement Réception Achat", orderType: "PO", steps: ["Pick", "Put"] },
        { id: "WT-SO-PICK", name: "Prélèvement Expédition Vente", orderType: "SO", steps: ["Pick", "Put"] },
        { id: "WT-REPLEN", name: "Réapprovisionnement Picking", orderType: "REPLEN", steps: ["Pick", "Put"] }
      ],
      locationDirectives: [
        {
          id: "DIR-PUT-01",
          sequence: 10,
          name: "Rangement Palettes Masse (BULK)",
          workType: "Put",
          orderType: "PO",
          warehouse: "WH-MAIN",
          targetZone: "ZONE-BULK",
          strategy: "ConsolidateEmpty",
          description: "Directive 10, ligne 1 : Rangement en zone BULK (Consolidation SKU + Espace libre)"
        },
        {
          id: "DIR-PUT-02",
          sequence: 20,
          name: "Rangement Picking Dynamique (PICK)",
          workType: "Put",
          orderType: "PO",
          warehouse: "WH-MAIN",
          targetZone: "ZONE-PICK",
          strategy: "ConsolidateEmpty",
          description: "Directive 20, ligne 1 : Rangement en zone PICK (Alvéoles)"
        },
        {
          id: "DIR-PICK-01",
          sequence: 10,
          name: "Prélèvement Vente Zone Stockage (FEFO)",
          workType: "Pick",
          orderType: "SO",
          warehouse: "WH-MAIN",
          targetZone: "ZONE-STORAGE",
          strategy: "FEFO",
          description: "Directive 10, ligne 1 : Prélèvement zone STORAGE selon règle FEFO"
        }
      ],
      waveTemplates: [
        {
          id: "WVT-STANDARD",
          name: "Expédition Standard Vente (Shipping Wave)",
          warehouse: "WH-MAIN",
          steps: ["ReleaseToWarehouse", "CreateWork"],
          autoProcess: true
        }
      ],
      loads: [
        { id: "LOAD-001", warehouse: "WH-MAIN", carrier: "Transport Express France", status: "Open", shipmentIds: ["SHP-001"] },
        { id: "LOAD-002", warehouse: "WH-MAIN", carrier: "Logistique Paris Sud", status: "Open", shipmentIds: ["SHP-002"] },
        { id: "LOAD-003", warehouse: "WH-MAIN", carrier: "Transport Express France", status: "Open", shipmentIds: ["SHP-003"] }
      ],
      shipments: [
        { id: "SHP-001", orderId: "SO-2001", customer: "Café Central de Paris", warehouse: "WH-MAIN", loadId: "LOAD-001", waveId: "WAV-001", status: "Open" },
        { id: "SHP-002", orderId: "SO-2002", customer: "Bistrot du Port Maritime", warehouse: "WH-MAIN", loadId: "LOAD-002", waveId: null, status: "Open" },
        { id: "SHP-003", orderId: "SO-2003", customer: "Grand Hôtel de la Plage", warehouse: "WH-MAIN", loadId: "LOAD-003", waveId: null, status: "Open" }
      ],
      waves: [
        {
          id: "WAV-001",
          templateId: "WVT-STANDARD",
          warehouse: "WH-MAIN",
          status: "Created",
          shipmentIds: ["SHP-001"],
          workIds: [],
          createdAt: "08:15:00"
        }
      ],
      works: [],
      tasks: [], // WorkTask legacy bridge
      movementLogs: [
        { time: "08:00:00", text: "Initialisation du stock de démonstration D365 WMS (WH-MAIN)." }
      ]
    };

    function createFreshWarehouseState() {
      return JSON.parse(JSON.stringify(SEED_DATA));
    }

    function migrateWarehouseState(saved) {
      if (!saved || typeof saved !== "object" || saved.version !== STATE_VERSION || !Array.isArray(saved.stock)) {
        return createFreshWarehouseState();
      }
      return saved;
    }


    /* ==========================================================================
       SECTION 2: DOMAIN LOGIC (Pure functions, no DOM access)
       ========================================================================== */
    let _taskCounter = 100;
    function generateTaskId() {
      _taskCounter++;
      return "TSK-" + _taskCounter;
    }

    let _workCounter = 1000;
    function generateWorkId() {
      _workCounter++;
      return "WRK-" + _workCounter;
    }

    let _lpCounter = 1007;
    function generateLicensePlate() {
      _lpCounter++;
      return "LP-" + _lpCounter;
    }

    let _waveCounter = 1;
    function generateWaveId() {
      _waveCounter++;
      return "WAV-" + String(_waveCounter).padStart(3, '0');
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

    // Create D365 Work Order with paired Pick/Put lines
    function createWorkOrder(state, orderType, refId, templateId, linesData, warehouse = "WH-MAIN") {
      if (!state.works) state.works = [];
      const workId = generateWorkId();
      const lines = [];

      linesData.forEach((item, idx) => {
        const pickLineNum = (idx * 2) + 1;
        const putLineNum = (idx * 2) + 2;
        // Line 1: Pick
        lines.push({
          lineNum: pickLineNum,
          workType: "Pick",
          sku: item.sku,
          qty: item.qty,
          from: item.from,
          to: item.transit || "STAGE",
          licensePlate: item.licensePlate,
          batch: item.batch || null,
          directive: item.directive || null,
          status: "Open" // Open | Closed
        });
        // Line 2: Put
        lines.push({
          lineNum: putLineNum,
          workType: "Put",
          sku: item.sku,
          qty: item.qty,
          from: item.transit || "STAGE",
          to: item.to || "",
          licensePlate: item.licensePlate,
          batch: item.batch || null,
          directive: item.directive || null,
          status: "Open" // Open | Closed
        });
      });

      const work = {
        id: workId,
        orderType: orderType, // "PO" | "SO" | "REPLEN"
        templateId: templateId,
        workTemplate: templateId,
        warehouse: warehouse,
        ref: refId,
        status: "Open", // Open | In progress | Closed | Cancelled
        user: null,
        createdAt: getNowTimeStr(),
        lines: lines
      };

      state.works.unshift(work);
      return work;
    }

    // Execute a Work line (strictly enforces D365 Pick before Put sequence)
    function executeWorkLine(state, workId, lineNum, chosenDest = null) {
      if (!state.works) return { error: "Aucun travail enregistré." };
      const work = state.works.find(w => w.id === workId);
      if (!work) return { error: `Travail ${workId} introuvable.` };
      if (work.status === "Closed" || work.status === "Cancelled") {
        return { error: `Le travail ${workId} est déjà clôturé ou annulé.` };
      }

      const line = work.lines.find(l => l.lineNum === lineNum);
      if (!line) return { error: `Ligne de travail #${lineNum} introuvable.` };
      if (line.status === "Closed") {
        return { error: `Cette ligne de travail #${lineNum} est déjà clôturée.` };
      }

      // D365 Rule: Put line can ONLY be executed after the paired Pick line is Closed
      if (line.workType === "Put") {
        const pairedPick = work.lines.find(l => l.lineNum === lineNum - 1 && l.workType === "Pick");
        if (pairedPick && pairedPick.status !== "Closed") {
          return { error: "Règle D365 : Impossible d'effectuer la dépose (Put). Vous devez d'abord valider le prélèvement (Pick) correspondant." };
        }

        const dest = chosenDest || line.to;
        if (!dest || dest.trim() === "") {
          return { error: "Veuillez sélectionner un emplacement de dépose." };
        }

        // Validate destination capacity if non-dock
        const loc = state.locations.find(l => l.code === dest);
        if (!loc) return { error: `Emplacement de destination ${dest} invalide.` };
        if (!loc.isDock) {
          const physFree = getLocationPhysicalFreeSpace(state, dest);
          if (line.qty > physFree) {
            return { error: `Capacité dépassée pour ${dest} : libre ${physFree}, requis ${line.qty}.` };
          }
        }

        // Move stock to destination
        if (work.orderType === "PO") {
          adjustStock(state, line.sku, "RECEPTION", -line.qty, { licensePlate: line.licensePlate });
          adjustStock(state, line.sku, dest, line.qty, {
            warehouse: work.warehouse,
            licensePlate: line.licensePlate,
            batch: line.batch,
            status: "Disponible"
          });
          // Sync legacy task
          const legacyTask = state.tasks.find(t => t.ref === work.ref && t.type === "putaway" && t.sku === line.sku && !t.done);
          if (legacyTask) { legacyTask.to = dest; legacyTask.done = true; }
        } else if (work.orderType === "SO") {
          adjustStock(state, line.sku, line.from, -line.qty, { licensePlate: line.licensePlate });
          adjustStock(state, line.sku, "EXPEDITION", line.qty, {
            warehouse: work.warehouse,
            licensePlate: line.licensePlate,
            batch: line.batch,
            status: "Disponible"
          });
          // Sync legacy task
          const legacyTask = state.tasks.find(t => t.ref === work.ref && t.type === "pick" && t.sku === line.sku && !t.done);
          if (legacyTask) { legacyTask.done = true; }
        }

        line.to = dest;
        line.status = "Closed";
        addLog(state, `Dépose (Put) validée : ${line.qty}x ${line.sku} (LP: ${line.licensePlate}) déposés en ${dest} (Travail: ${work.id}).`);

        if (work.lines.every(l => l.status === "Closed")) {
          work.status = "Closed";
          addLog(state, `Travail ${work.id} entièrement clôturé (Closed).`);

          if (work.orderType === "SO") {
            const so = state.salesOrders.find(s => s.id === work.ref);
            if (so) {
              const soWorks = state.works.filter(w => w.ref === so.id && w.orderType === "SO");
              if (soWorks.every(w => w.status === "Closed")) {
                so.status = "picked";
                addLog(state, `Commande client ${so.id} prête pour expédition (statut: picked).`);
              }
            }
          }
        }
        return { success: true, work };
      }

      if (line.workType === "Pick") {
        line.status = "Closed";
        work.status = "In progress";
        addLog(state, `Prélèvement (Pick) validé : ${line.qty}x ${line.sku} (LP: ${line.licensePlate}) prélevés en ${line.from} (Travail: ${work.id}).`);
        return { success: true, work };
      }

      return { error: "Type de travail non supporté." };
    }

    // Helper: Add or subtract stock at a location with D365 dimensions
    function adjustStock(state, sku, locationCode, deltaQty, options = {}) {
      const loc = state.locations.find(l => l.code === locationCode);
      const wh = options.warehouse || (loc ? loc.warehouse : "WH-MAIN");
      const site = options.site || "SITE-01";
      const lp = options.licensePlate || (options.requireLP ? generateLicensePlate() : null);
      const status = options.status || "Disponible";
      const batch = options.batch !== undefined ? options.batch : null;
      const expDate = options.expDate !== undefined ? options.expDate : null;

      if (deltaQty > 0) {
        // Find matching row or create new
        let row = state.stock.find(s => 
          s.sku === sku && 
          s.location === locationCode && 
          (!lp || s.licensePlate === lp) &&
          s.status === status &&
          s.batch === batch
        );
        if (row) {
          row.qty += deltaQty;
        } else {
          state.stock.push({
            id: "STK-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            sku: sku,
            site: site,
            warehouse: wh,
            location: locationCode,
            licensePlate: lp || generateLicensePlate(),
            batch: batch,
            expDate: expDate,
            status: status,
            qty: deltaQty,
            reservedQty: 0
          });
        }
      } else if (deltaQty < 0) {
        let toDeduct = Math.abs(deltaQty);
        // Find matching rows at location
        const matching = state.stock.filter(s => 
          s.sku === sku && 
          s.location === locationCode && 
          (!options.licensePlate || s.licensePlate === options.licensePlate)
        );
        for (const r of matching) {
          if (toDeduct <= 0) break;
          const take = Math.min(r.qty, toDeduct);
          r.qty -= take;
          toDeduct -= take;
        }
      }
      // Remove zero or negative rows
      state.stock = state.stock.filter(s => s.qty > 0);
    }

    // Change Inventory Status on a License Plate (Disponible / Bloqué / Quarantaine)
    function changeInventoryStatus(state, licensePlate, newStatus) {
      const rows = state.stock.filter(s => s.licensePlate === licensePlate);
      if (rows.length === 0) return { error: `Plaque ${licensePlate} introuvable.` };
      
      const hasReservation = rows.some(r => (r.reservedQty || 0) > 0);
      if (hasReservation && newStatus !== "Disponible") {
        return { error: `Impossible de bloquer ${licensePlate} : du stock est réservé pour une commande.` };
      }

      for (const r of rows) {
        r.status = newStatus;
      }
      addLog(state, `Statut d'inventaire mis à jour pour ${licensePlate} : "${newStatus}".`);
      return { success: true };
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

    // D365 Location Directive Engine: finds matching directive by orderType, workType, warehouse, and sequence
    function findLocationDirective(state, orderType, workType, warehouse = "WH-MAIN", itemZone = null) {
      const directives = (state.locationDirectives || [])
        .filter(d => d.orderType === orderType && d.workType === workType && (d.warehouse === warehouse || d.warehouse === "ALL"))
        .sort((a, b) => a.sequence - b.sequence);

      if (directives.length === 0) return null;

      if (itemZone) {
        const zoneMatch = directives.find(d => d.targetZone === itemZone || d.targetZone === "ZONE-STORAGE" || d.targetZone === "ALL");
        if (zoneMatch) return zoneMatch;
      }
      return directives[0];
    }

    // Putaway Plan pure function driven by D365 Location Directives
    function planPutaway(state, sku, qty, poId, options = {}) {
      const item = state.items.find(i => i.sku === sku);
      if (!item) return [];

      const targetWh = options.warehouse || "WH-MAIN";
      const directive = findLocationDirective(state, "PO", "Put", targetWh, item.zone) || {
        sequence: 10,
        targetZone: item.zone,
        description: `Directive par défaut : zone ${item.zone}`
      };

      const targetZone = directive.targetZone === "ALL" ? item.zone : directive.targetZone;
      const candidates = state.locations.filter(l => !l.isDock && l.warehouse === targetWh && (l.zone === targetZone || targetZone === "ZONE-STORAGE"));
      
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
      const lp = options.licensePlate || generateLicensePlate();
      const directiveDesc = directive.description || `Directive ${directive.sequence}, ligne 1 : zone ${targetZone}`;

      for (const cand of scored) {
        if (remaining <= 0) break;
        if (cand.freeSpace <= 0) continue;

        const take = Math.min(remaining, cand.freeSpace);
        newTasks.push({
          id: generateTaskId(),
          type: "putaway",
          sku: sku,
          qty: take,
          licensePlate: lp,
          from: "RECEPTION",
          to: cand.code,
          ref: poId,
          directive: directiveDesc,
          done: false
        });
        remaining -= take;
        cand.freeSpace -= take;
      }

      if (remaining > 0) {
        newTasks.push({
          id: generateTaskId(),
          type: "putaway",
          sku: sku,
          qty: remaining,
          licensePlate: lp,
          from: "RECEPTION",
          to: "",
          ref: poId,
          directive: `${directiveDesc} (Capacité saturée)`,
          done: false
        });
      }

      return newTasks;
    }

    // 1. receive(po, lineIndex, qty)
    // Clamps qty to what remains, creates LP on RECEPTION, creates putaway tasks, logs it.
    function receive(state, poId, lineIndex, requestedQty) {
      const po = state.purchaseOrders.find(p => p.id === poId);
      if (!po || !po.lines[lineIndex]) return { state, error: "Commande ou ligne introuvable." };

      const line = po.lines[lineIndex];
      const remains = Math.max(0, line.ordered - line.received);
      const actualQty = Math.max(0, Math.min(Number(requestedQty) || 0, remains));

      if (actualQty <= 0) {
        return { state, error: "Quantité à réceptionner invalide ou commande déjà soldée." };
      }

      const lp = generateLicensePlate();
      const item = state.items.find(i => i.sku === line.sku);
      const batch = item && item.tracking === "batch" ? "LOT-" + line.sku.split("-")[0] + "-REC" : null;
      const expDate = item && item.tracking === "batch" ? "2027-06-30" : null;

      line.received += actualQty;
      adjustStock(state, line.sku, "RECEPTION", actualQty, {
        warehouse: po.warehouse || "WH-MAIN",
        licensePlate: lp,
        batch: batch,
        expDate: expDate,
        status: "Disponible"
      });

      const putawayTasks = planPutaway(state, line.sku, actualQty, po.id, {
        warehouse: po.warehouse || "WH-MAIN",
        licensePlate: lp
      });
      state.tasks.push(...putawayTasks);

      // Create D365 Work for PO Putaway
      if (putawayTasks.length > 0) {
        const linesData = putawayTasks.map(t => ({
          sku: t.sku,
          qty: t.qty,
          from: "RECEPTION",
          to: t.to,
          licensePlate: t.licensePlate,
          batch: batch,
          directive: t.directive
        }));
        createWorkOrder(state, "PO", po.id, "WT-PO-PUT", linesData, po.warehouse || "WH-MAIN");
      }

      addLog(state, `Réception de ${actualQty}x ${line.sku} (Plaque LP: ${lp}) sur RECEPTION (PO: ${po.id}).`);

      return { state, error: null };
    }

    // 3. confirmPutaway(task, chosenDest)
    // Refuses if destination is empty or lacks free space, otherwise moves LP RECEPTION -> dest.
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
      const recStock = state.stock.find(s => s.location === "RECEPTION" && s.sku === task.sku && (!task.licensePlate || s.licensePlate === task.licensePlate));
      if (!recStock || recStock.qty < task.qty) {
        return { state, error: `Stock insuffisant sur le quai RECEPTION pour ${task.sku}.` };
      }

      // Move stock maintaining LP, batch, and status
      const savedLp = recStock.licensePlate;
      const savedBatch = recStock.batch;
      const savedExp = recStock.expDate;
      const savedStatus = recStock.status;

      adjustStock(state, task.sku, "RECEPTION", -task.qty, { licensePlate: savedLp });
      adjustStock(state, task.sku, dest, task.qty, {
        licensePlate: savedLp,
        batch: savedBatch,
        expDate: savedExp,
        status: savedStatus
      });

      task.to = dest;
      task.done = true;

      // Sync D365 work if exists
      if (state.works) {
        for (const w of state.works) {
          if (w.ref === task.ref && w.orderType === "PO") {
            const putLine = w.lines.find(l => l.workType === "Put" && l.sku === task.sku && l.status !== "Closed");
            if (putLine) {
              const pickLine = w.lines.find(l => l.lineNum === putLine.lineNum - 1);
              if (pickLine) pickLine.status = "Closed";
              putLine.status = "Closed";
              putLine.to = dest;
              if (w.lines.every(l => l.status === "Closed")) w.status = "Closed";
            }
          }
        }
      }

      addLog(state, `Rangement terminé : ${task.qty}x ${task.sku} (LP: ${savedLp}) rangés dans ${dest} (Tâche: ${task.id}).`);
      return { state, error: null };
    }

    // 4. releaseOrder(so)
    // For each line, allocate from available non-dock stock (status === 'Disponible').
    // Sort: FEFO (First Expired, First Out) then least available quantity first.
    // Create pick tasks to EXPEDITION with hard reservation. If shortage, record shortage per sku.
    function releaseOrder(state, soId) {
      const so = state.salesOrders.find(s => s.id === soId);
      if (!so) return { state, error: "Commande client introuvable." };
      if (so.status !== "open") return { state, error: "Cette commande a déjà été lancée." };

      so.shortages = {};
      const wh = so.warehouse || "WH-MAIN";
      const pickDirective = findLocationDirective(state, "SO", "Pick", wh) || {
        sequence: 10,
        description: "Directive 10, ligne 1 : zone STORAGE, FEFO"
      };

      for (const line of so.lines) {
        let needed = line.qty;

        // Find candidate stock rows with available stock (status === 'Disponible')
        const candidates = [];
        for (const loc of state.locations) {
          if (loc.isDock || loc.warehouse !== wh) continue;
          
          const availableRows = state.stock.filter(s => 
            s.location === loc.code && 
            s.sku === line.sku && 
            s.status === "Disponible" && 
            (s.qty - (s.reservedQty || 0)) > 0
          );

          for (const row of availableRows) {
            candidates.push({
              code: loc.code,
              row: row,
              expDate: row.expDate || "9999-12-31",
              available: row.qty - (row.reservedQty || 0)
            });
          }
        }

        // Sort: FEFO (First Expired, First Out) first, then least available quantity first
        candidates.sort((a, b) => {
          if (a.expDate !== b.expDate) {
            return a.expDate.localeCompare(b.expDate);
          }
          return a.available - b.available;
        });

        for (const cand of candidates) {
          if (needed <= 0) break;
          const take = Math.min(needed, cand.available);
          cand.row.reservedQty = (cand.row.reservedQty || 0) + take;

          state.tasks.push({
            id: generateTaskId(),
            type: "pick",
            sku: line.sku,
            qty: take,
            licensePlate: cand.row.licensePlate,
            batch: cand.row.batch,
            from: cand.code,
            to: "EXPEDITION",
            ref: so.id,
            directive: pickDirective.description || "Directive 10, ligne 1 : zone STORAGE, FEFO",
            done: false
          });
          needed -= take;
        }

        if (needed > 0) {
          so.shortages[line.sku] = needed;
        }
      }

      // Create D365 Work for SO Picking
      const soPicks = state.tasks.filter(t => t.ref === so.id && t.type === "pick" && !t.done);
      if (soPicks.length > 0) {
        const linesData = soPicks.map(t => ({
          sku: t.sku,
          qty: t.qty,
          from: t.from,
          to: "EXPEDITION",
          licensePlate: t.licensePlate,
          batch: t.batch,
          directive: t.directive
        }));
        createWorkOrder(state, "SO", so.id, "WT-SO-PICK", linesData, wh);
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

    // D365 Outbound Engine: Process Wave (Created -> Released -> Processing -> Executed)
    function processWave(state, waveId) {
      const wave = (state.waves || []).find(w => w.id === waveId);
      if (!wave) return { error: `Vague ${waveId} introuvable.` };
      if (wave.status === "Executed") return { error: `La vague ${waveId} est déjà exécutée.` };

      wave.status = "Processing";
      addLog(state, `Traitement de la vague ${wave.id} en cours (Release to warehouse & Création des travaux)...`);

      const executedWorks = [];
      for (const shpId of wave.shipmentIds) {
        const shp = (state.shipments || []).find(s => s.id === shpId);
        if (shp) {
          const so = state.salesOrders.find(s => s.id === shp.orderId);
          if (so && so.status === "open") {
            const relRes = releaseOrder(state, so.id);
            if (!relRes.error) {
              shp.status = "Released";
              const worksForSo = (state.works || []).filter(w => w.ref === so.id && w.orderType === "SO");
              worksForSo.forEach(w => {
                if (!wave.workIds.includes(w.id)) wave.workIds.push(w.id);
                executedWorks.push(w);
              });
            }
          }
        }
      }

      wave.status = "Executed";
      addLog(state, `Vague ${wave.id} exécutée avec succès (${executedWorks.length} travaux de prélèvement créés).`);
      return { success: true, wave };
    }

    // Add shipment to wave
    function addShipmentToWave(state, shipmentId, waveId) {
      const shp = (state.shipments || []).find(s => s.id === shipmentId);
      if (!shp) return { error: "Expédition introuvable." };
      const wave = (state.waves || []).find(w => w.id === waveId);
      if (!wave) return { error: "Vague introuvable." };
      if (wave.status === "Executed") return { error: "Impossible d'ajouter à une vague déjà exécutée." };

      if (!wave.shipmentIds.includes(shipmentId)) {
        wave.shipmentIds.push(shipmentId);
        shp.waveId = wave.id;
      }
      return { success: true };
    }

    // Create a new Wave
    function createNewWave(state, templateId = "WVT-STANDARD", warehouse = "WH-MAIN") {
      if (!state.waves) state.waves = [];
      const newWave = {
        id: generateWaveId(),
        templateId: templateId,
        warehouse: warehouse,
        status: "Created",
        shipmentIds: [],
        workIds: [],
        createdAt: getNowTimeStr()
      };
      state.waves.unshift(newWave);
      addLog(state, `Nouvelle vague créée : ${newWave.id} (Modèle: ${templateId}).`);
      return newWave;
    }

    // 5. confirmPick(task)
    // Move stock from location to EXPEDITION. When all tasks of order done, status -> picked.
    function confirmPick(state, taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.done) return { state, error: "Tâche de prélèvement introuvable ou déjà terminée." };

      const fromStock = state.stock.find(s => s.location === task.from && s.sku === task.sku && (!task.licensePlate || s.licensePlate === task.licensePlate));
      if (!fromStock || fromStock.qty < task.qty) {
        return { state, error: `Stock physique insuffisant en ${task.from} pour ${task.sku}.` };
      }

      fromStock.reservedQty = Math.max(0, (fromStock.reservedQty || 0) - task.qty);
      adjustStock(state, task.sku, task.from, -task.qty, { licensePlate: task.licensePlate });
      adjustStock(state, task.sku, "EXPEDITION", task.qty, { 
        licensePlate: task.licensePlate, 
        batch: task.batch, 
        status: "Disponible" 
      });

      task.done = true;

      // Sync D365 work if exists
      if (state.works) {
        for (const w of state.works) {
          if (w.ref === task.ref && w.orderType === "SO") {
            const putLine = w.lines.find(l => l.workType === "Put" && l.sku === task.sku && l.status !== "Closed");
            if (putLine) {
              const pickLine = w.lines.find(l => l.lineNum === putLine.lineNum - 1);
              if (pickLine) pickLine.status = "Closed";
              putLine.status = "Closed";
              if (w.lines.every(l => l.status === "Closed")) w.status = "Closed";
            }
          }
        }
      }

      // Check if all pick tasks for this SO are completed
      const remainingPicks = state.tasks.filter(t => t.ref === task.ref && t.type === "pick" && !t.done);
      const so = state.salesOrders.find(s => s.id === task.ref);

      if (so && remainingPicks.length === 0) {
        so.status = "picked";
        addLog(state, `Prélèvement terminé pour la commande ${so.id} (Prête pour expédition).`);
      } else {
        addLog(state, `Prélèvement confirmé : ${task.qty}x ${task.sku} (LP: ${task.licensePlate || 'N/A'}) depuis ${task.from} vers EXPEDITION.`);
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

      // Update D365 Shipment & Load status
      const shp = (state.shipments || []).find(s => s.orderId === so.id);
      if (shp) {
        shp.status = "Shipped";
        if (shp.loadId) {
          const load = (state.loads || []).find(l => l.id === shp.loadId);
          if (load) {
            const allShipments = state.shipments.filter(s => s.loadId === load.id);
            if (allShipments.every(s => s.status === "Shipped")) {
              load.status = "Shipped";
            }
          }
        }
      }

      addLog(state, `Commande ${so.id} expédiée avec succès vers le client ${so.customer} (Bon de livraison généré).`);
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
       SECTION 3: TRAINING CONTENT (Dynamics 365 Supply Chain Management Curriculum)
       ========================================================================== */
    const D365_FULL_GLOSSARY = [
  {
    "fr": "Entité juridique",
    "en": "Legal entity (DataAreaId)",
    "def": "Société légale (ex: FR01) détentrice des comptes généraux, du bilan et du patrimoine légal. Toutes les données WMS y sont rattachées."
  },
  {
    "fr": "Site",
    "en": "Site (InventSite)",
    "def": "Implantation géographique ou campus regroupant un ou plusieurs entrepôts physiques ou logiques partageant une politique de réapprovisionnement."
  },
  {
    "fr": "Entrepôt WMS",
    "en": "Warehouse (InventLocation)",
    "def": "Bâtiment logistique activé pour les processus avancés WMS (Warehouse Management System), avec gestion par plaques et directives."
  },
  {
    "fr": "Emplacement",
    "en": "Location (WMSLocation)",
    "def": "Adresse physique tridimensionnelle standardisée (Allée-Rack-Niveau-Position) caractérisée par un profil et une capacité volumétrique/poids."
  },
  {
    "fr": "Plaque d'immatriculation",
    "en": "License Plate (LP)",
    "def": "Identifiant unique (code SSCC/palette/carton) permettant de tracer, réserver et déplacer un contenant complet sans rescanner chaque article."
  },
  {
    "fr": "Statut d'inventaire",
    "en": "Inventory status (InventStatus)",
    "def": "Dimension qualité gouvernant la réservabilité : 'Disponible' (allouable aux commandes), 'Bloqué' (contrôle qualité/litige), ou 'Quarantaine'."
  },
  {
    "fr": "Numéro de lot & DLUO",
    "en": "Batch number (InventBatchId)",
    "def": "Dimension de suivi sanitaire indispensable pour les denrées et produits périssables, régie par l'algorithme FEFO (First Expired, First Out)."
  },
  {
    "fr": "Stock disponible",
    "en": "On-hand inventory",
    "def": "Quantité physique réelle présente en stock, ventilée sur les 7 dimensions clés (Article × Site × Entrepôt × Emplacement × LP × Lot × Statut)."
  },
  {
    "fr": "Hiérarchie de réservation",
    "en": "Reservation hierarchy",
    "def": "Ordre dans lequel D365 réserve les dimensions : au niveau commande (Site/Entrepôt/Statut), puis au niveau WMS lors de la vague (Emplacement/LP)."
  },
  {
    "fr": "En-tête de travail",
    "en": "Work Header (WHSWorkTable)",
    "def": "Ordre de mission logistique identifiant l'unité de travail, la classe de travail, le statut global (Open, In progress, Closed) et l'opérateur affecté."
  },
  {
    "fr": "Lignes de travail",
    "en": "Work Lines (WHSWorkLine)",
    "def": "Paires ordonnées d'actions physiques indissociables : Prélèvement (Pick) suivi obligatoirement d'une Dépose (Put). Put bloqué tant que Pick non clos."
  },
  {
    "fr": "Modèle de travail",
    "en": "Work Template (WHSWorkTemplateTable)",
    "def": "Schéma directeur définissant la typologie et le découpage des étapes de travail selon le flux (PO-PUT, SO-PICK, REPLEN, COUNT)."
  },
  {
    "fr": "Directive d'emplacement",
    "en": "Location Directive (WHSLocDirTable)",
    "def": "Moteur algorithmique ultra-puissant qui résout où ranger ou où prélever le stock selon une séquence de priorité, des requêtes SQL et des contraintes."
  },
  {
    "fr": "Groupe de travail",
    "en": "Work Pool",
    "def": "Regroupement de travaux par métier, zone d'équipement (ex: caristes grandes hauteurs vs préparateurs piétons) pour l'attribution mobile."
  },
  {
    "fr": "Vague de préparation",
    "en": "Wave (WHSWaveTable)",
    "def": "Regroupement par lots d'expéditions lancé simultanément pour mutualiser les parcours, allouer le stock et générer les travaux d'expédition."
  },
  {
    "fr": "Expédition",
    "en": "Shipment (WHSShipmentTable)",
    "def": "Regroupement logistique de toutes les lignes de commandes destinées à un même client et une même adresse de livraison pour une date donnée."
  },
  {
    "fr": "Chargement",
    "en": "Load (WHSLoadTable)",
    "def": "Unité physique d'emport correspondant à la capacité d'un camion, d'un conteneur ou d'un transporteur (Carrier)."
  },
  {
    "fr": "Réapprovisionnement Min/Max",
    "en": "Min/Max Replenishment",
    "def": "Mécanisme préventif générant un ordre de travail dès que le stock en case de picking descend sous le seuil minimum, évitant les ruptures lors des vagues."
  },
  {
    "fr": "Inventaire tournant",
    "en": "Cycle Counting",
    "def": "Méthode de comptage permanent d'échantillons d'emplacements sans fermer l'entrepôt, avec enregistrement des écarts dans un journal d'ajustement."
  },
  {
    "fr": "Journal d'ajustement",
    "en": "Inventory adjustment journal",
    "def": "Pièce comptable et logistique consignant les écarts de stock (variance positive ou négative), le motif financier et la mise à jour On-hand."
  },
  {
    "fr": "Confirmation d'expédition",
    "en": "Ship Confirm",
    "def": "Validation finale du départ camion clôturant le chargement, déstockant définitivement les unités et générant le bon de livraison (Packing Slip)."
  },
  {
    "fr": "Application mobile WMS",
    "en": "Warehouse Management Mobile App",
    "def": "Interface terminal code-barres / RF guidant les opérateurs sur le terrain par détrompage et scan obligatoire d'emplacement et de plaque LP."
  },
  {
    "fr": "Profil d'emplacement",
    "en": "Location Profile",
    "def": "Règle de gestion d'une alvéole : autorise ou interdit le mélange de produits/lots, impose ou non la plaque LP, et définit la volumétrie maximale."
  },
  {
    "fr": "Zone & Groupe de zones",
    "en": "Zone & Zone Group",
    "def": "Découpage géographique et thermique (ex: ZG-INBOUND, ZG-STORAGE, ZG-OUTBOUND, FROID, SEC) ciblé par les directives d'emplacement."
  },
  {
    "fr": "Cross-docking",
    "en": "Cross-docking",
    "def": "Flux tendu transférant immédiatement un lot reçu au quai de réception directement vers le quai d'expédition sans passer par le stockage en réserve."
  },
  {
    "fr": "Consolidation de stock",
    "en": "Consolidation strategy",
    "def": "Stratégie de rangement cherchant en priorité des alvéoles contenant déjà le même article pour densifier l'espace et limiter l'éparpillement."
  }
];

    const TRAINING_LESSONS = [
  {
    "id": 1,
    "title": "1. La hiérarchie organisationnelle D365",
    "subtitle": "De l'entité juridique à la plaque d'immatriculation (License Plate)",
    "concept": {
      "intro": "Dans Microsoft Dynamics 365 Supply Chain Management (D365 SCM), l'organisation logistique d'une multinationale ou d'un grand distributeur repose sur une architecture stricte et pyramidale à 5 niveaux. Comprendre cette arborescence est le prérequis fondamental de tout consultant, architecte de solution ou responsable d'entrepôt.",
      "sections": [
        {
          "title": "L'architecture pyramidale des 5 niveaux D365",
          "content": "1. <strong>Entité juridique (Legal Entity / DataAreaId)</strong> : Représente la société légale enregistrée au registre du commerce (ex: 'FR01 - Maison Lumière France SAS'). Elle possède son propre plan comptable, déclare sa TVA et publie son bilan financier.<br><br>2. <strong>Site (InventSite)</strong> : Implantation géographique ou campus industriel (ex: 'Site Ivry-sur-Seine'). Un site fédère des centres logistiques et usines partageant une même région économique.<br><br>3. <strong>Entrepôt WMS (InventLocation)</strong> : Bâtiment physique clos où s'appliquent les règles de gestion d'entrepôt avancées (Warehouse Management System). Dans D365, un entrepôt est soit 'Standard' (gestion de stock basique sans caristes guidés), soit 'Avancé WMS' (avec gestion par plaques, vagues et terminaux radiofréquence RF).<br><br>4. <strong>Emplacement (WMSLocation)</strong> : Adresse tridimensionnelle exacte dans le bâtiment (ex: 'A-01-01' pour Allée A, Rack 01, Niveau 01). Chaque emplacement possède un profil d'alvéole et une capacité stricte.<br><br>5. <strong>Plaque d'immatriculation (License Plate - LP)</strong> : Identifiant unique (numéro de palette, roll ou bac) affecté au contenant. Dans D365, tout article stocké dans un entrepôt WMS repose sur une LP."
        },
        {
          "title": "Pourquoi l'architecture License Plate change tout en entreprise ?",
          "content": "Dans les ERP traditionnels sans WMS, déplacer 50 cartons de café nécessite de saisir 50 mouvements informatiques ou de recalculer des soldes par ligne. Dans Dynamics 365 WMS, la plaque LP agit comme un conteneur virtuel : lorsque le cariste scanne l'étiquette 'LP-1001', le système sait instantanément qu'elle contient 50 kg de Café Arabica, lot BATCH-2026-01, avec statut 'Disponible'. Déplacer la palette d'une allée à une autre s'effectue en scannant une seule fois la LP, sans aucun risque d'erreur de saisie de quantité."
        },
        {
          "title": "Mise en situation dans le simulateur Stockroom",
          "content": "Observez le bandeau supérieur de l'application : l'entité active est <strong>FR01</strong>, rattachée au site d'<strong>Ivry</strong>. Le sélecteur d'entrepôt vous permet de basculer entre l'entrepôt de distribution principal (<strong>WH-MAIN</strong>) et l'entrepôt de vente retail (<strong>WH-RETAIL</strong>). Chaque écran (Stock, Réception, Travaux, Expédition) s'adapte dynamiquement au périmètre de l'entrepôt sélectionné."
        }
      ]
    },
    "glossary": [
      {
        "term": "Legal Entity (Entité juridique)",
        "def": "Société légale déclarant le bilan comptable (ex: FR01 Maison Lumière SAS)."
      },
      {
        "term": "Site",
        "def": "Implantation géographique ou campus regroupant un ou plusieurs entrepôts."
      },
      {
        "term": "Warehouse (Entrepôt WMS)",
        "def": "Bâtiment logistique géré avec les fonctionnalités avancées WMS."
      },
      {
        "term": "Location (Emplacement)",
        "def": "Coordonnée tridimensionnelle standardisée (Allée-Rack-Niveau-Position)."
      },
      {
        "term": "License Plate (Plaque LP)",
        "def": "Identifiant unique de palette/carton permettant de tracer et déplacer des unités en bloc."
      }
    ],
    "missionText": "Consultez l'en-tête de l'application : observez l'entité FR01, le site Ivry, et basculez l'entrepôt actif vers WH-MAIN ou WH-RETAIL.",
    "targetTab": "stock",
    "checkCompleted": (state, training, ui) => ui.activeTab === "stock" || !!training.visitedStockTab,
    "question": "Dans D365, quelle est la hiérarchie correcte du plus global au plus précis ?",
    "options": [
      "Emplacement → Entrepôt → Plaque LP → Site → Entité juridique",
      "Entité juridique → Site → Entrepôt → Emplacement → Plaque LP",
      "Site → Entité juridique → Emplacement → Plaque LP → Entrepôt"
    ],
    "correctIndex": 1,
    "explanation": "Dans D365 SCM, le flux organisationnel descend de l'Entité juridique vers le Site, puis l'Entrepôt, l'Emplacement et enfin la Plaque d'immatriculation (License Plate)."
  },
  {
    "id": 2,
    "title": "2. Paramétrage entrepôt & Statuts d'inventaire",
    "subtitle": "Les 7 dimensions de stock et le verrouillage qualité instantané",
    "concept": {
      "intro": "La précision chirurgicale de Dynamics 365 repose sur son moteur de stock disponible (On-hand Inventory). Contrairement aux logiciels de gestion commerciale simplifiés qui ne connaissent qu'un chiffre global de stock, D365 identifie chaque unité physique à travers une matrice stricte de dimensions et d'états qualité.",
      "sections": [
        {
          "title": "La matrice des 7 dimensions d'inventaire D365",
          "content": "Dans la table centrale des stocks (InventDim / On-hand), chaque ligne de stock physique est obligatoirement qualifiée par 7 coordonnées indissociables :<br><br>• <strong>Dimensions produit</strong> : Référence article (SKU) + Variantes (Couleur, Taille, Style).<br>• <strong>Dimensions de stockage</strong> : Site × Entrepôt × Emplacement × Plaque LP.<br>• <strong>Dimensions de suivi</strong> : Numéro de Lot (Batch) et/ou Numéro de Série individuel.<br>• <strong>Dimension de contrôle</strong> : Statut d'inventaire (Inventory Status : Disponible, Bloqué, Quarantaine)."
        },
        {
          "title": "Le rôle vital du Statut d'inventaire (Inventory Status)",
          "content": "Le statut d'inventaire est la clé de voûte de l'assurance qualité en entrepôt. Lorsqu'une palette subit une avarie, une suspicion de contamination ou un contrôle douanier, le gestionnaire fait passer son statut de 'Disponible' à <strong>'Bloqué'</strong> ou <strong>'Quarantaine'</strong>.<br><br><strong>Conséquence immédiate dans le moteur ERP</strong> : Le stock reste physiquement comptabilisé dans les actifs de l'entreprise (valeur financière préservée au bilan), mais le moteur de réservation de D365 lui applique un veto mathématique absolu. Aucune commande client, aucune vague d'expédition et aucun préparateur ne pourra jamais allouer ou prélever cette palette tant que le contrôle qualité n'aura pas levé le blocage."
        },
        {
          "title": "Typologie et profils d'emplacements (Location Profiles)",
          "content": "Tous les emplacements ne se valent pas dans un entrepôt. Un quai de déchargement (<strong>PROF-RECEP</strong>) est une zone de transit rapide interdisant le stockage longue durée. Une alvéole en rack de réserve (<strong>PROF-BULK</strong>) autorise les palettes lourdes et impose le suivi par plaque LP. Une case de préparation (<strong>PROF-PICK</strong>) permet la prise unitaire au carton. Dans la vue 'Configuration WMS', ces règles régissent le comportement de tout le système."
        }
      ]
    },
    "glossary": [
      {
        "term": "Location Profile",
        "def": "Définit les règles d'alvéole : mélange de produits, obligation de LP, méthode de capacité."
      },
      {
        "term": "Zone & Zone Group",
        "def": "Regroupement d'emplacements utilisé par les algorithmes de directives (ex: ZG-STORAGE)."
      },
      {
        "term": "Inventory Status",
        "def": "Statut qualité : Disponible, Bloqué, Quarantaine. Le stock bloqué est exclu des allocations."
      },
      {
        "term": "Stock disponible (On-hand)",
        "def": "Quantité physique réelle diminuée des réservations fermes sur les commandes."
      }
    ],
    "missionText": "Dans l'onglet « Stock », trouvez une palette au statut Disponible et cliquez sur « Bloquer » pour observer le recalcul immédiat du stock réservable.",
    "targetTab": "stock",
    "checkCompleted": (state) => {
      return state.stock.some(s => s.status === "Bloqué" || s.status === "Quarantaine");
    },
    "question": "Que se passe-t-il lorsqu'un lot passe au statut d'inventaire 'Bloqué' dans D365 ?",
    "options": [
      "Il est immédiatement détruit physiquement",
      "Il reste physiquement en stock mais est exclu de toute réservation et picking",
      "Il est expédié automatiquement au fournisseur"
    ],
    "correctIndex": 1,
    "explanation": "Le statut Bloqué préserve la quantité physique mais interdit au moteur de réservation et d'allocation WMS de proposer ces unités aux préparateurs."
  },
  {
    "id": 3,
    "title": "3. Réception fournisseur & Plaques LP",
    "subtitle": "Enregistrement quai, génération de plaque et traçabilité FEFO",
    "concept": {
      "intro": "Le flux entrant (Inbound) initie le cycle de vie des marchandises dans l'entrepôt. Dans D365, une réception ne consiste pas simplement à incrémenter un compteur de stock : elle matérialise l'arrivée d'une commande d'achat (Purchase Order - PO) par la création de contenants traçables et sécurisés dès le déchargement du camion.",
      "sections": [
        {
          "title": "Le processus de réception physique et logique",
          "content": "Lorsqu'un transporteur livre une commande fournisseur (ex: PO-1001), les colis sont déchargés sur l'emplacement de quai d'entrée (<strong>RECEPTION</strong>, zone ZG-INBOUND). L'opérateur utilise le terminal mobile pour pointer les quantités livrées par rapport au bon de commande fournisseur.<br><br>Dès la validation de chaque ligne :<br>1. <strong>Immatriculation automatique</strong> : D365 génère un numéro de plaque d'immatriculation unique (License Plate, ex: 'LP-1004'). Cette plaque est imprimée sous forme de code-barres GS1-128 ou 2D et collée sur la palette.<br>2. <strong>Capture du Lot (Batch) et de la DLUO</strong> : Pour les produits alimentaires ou cosmétiques (ex: Café Arabica), le numéro de lot fournisseur et la date de péremption sont obligatoirement saisis pour alimenter le moteur FEFO (First Expired, First Out).<br>3. <strong>Statut initial</strong> : Le stock est créé au quai RECEPTION avec un statut 'Disponible' (ou 'Quarantaine' si un contrôle d'échantillonnage est imposé)."
        },
        {
          "title": "Création instantanée des travaux de rangement (Putaway Work)",
          "content": "La marchandise ne doit jamais encombrer le quai de réception. Dès que la ligne de PO est réceptionnée, le moteur WMS déclenche automatiquement le Modèle de travail <strong>WT-PO-PUT</strong>. Ce modèle crée un travail composé d'une paire indissociable :<br>• <strong>Pick</strong> : Prendre la palette LP-1004 au quai RECEPTION.<br>• <strong>Put</strong> : Déposer la palette dans une alvéole définitive de réserve (ex: A-01-01), déterminée par le moteur des directives d'emplacement."
        }
      ]
    },
    "glossary": [
      {
        "term": "Purchase Order (PO)",
        "def": "Commande d'achat fournisseur à réceptionner au quai RECEPTION."
      },
      {
        "term": "Génération de LP",
        "def": "Création automatique d'un numéro d'immatriculation palette dès le déchargement."
      },
      {
        "term": "Lot & FEFO",
        "def": "Traçabilité des denrées périssables garantissant la sortie des lots les plus anciens d'abord."
      }
    ],
    "missionText": "Allez dans l'onglet « Réception » et réceptionnez la livraison de café sur la commande PO-1001.",
    "targetTab": "reception",
    "checkCompleted": (state) => {
      const po = state.purchaseOrders.find(p => p.id === "PO-1001");
      const line = po && po.lines.find(l => l.sku === "CAF-1KG");
      return line && line.received > 0;
    },
    "question": "Quel est le rôle fondamental d'une License Plate (LP) générée en réception ?",
    "options": [
      "Calculer les frais de douane",
      "Identifier de manière unique le contenant/palette et déplacer tout son contenu en une seule opération",
      "Fixer le prix de vente unitaire du produit"
    ],
    "correctIndex": 1,
    "explanation": "La plaque LP sert d'identifiant conteneur : scanner ou déplacer la LP déplace instantanément tous les articles et lots qui y sont associés."
  },
  {
    "id": 4,
    "title": "4. Le concept central de Travail (Work)",
    "subtitle": "En-têtes de mission, paires Pick/Put et intégrité séquentielle",
    "concept": {
      "intro": "Dans l'écosystème Dynamics 365 Supply Chain Management, aucun cariste, aucun préparateur et aucun robot de manutention n'est autorisé à déplacer un article sans un ordre informatique officiel appelé <strong>Travail (Work)</strong>. Le concept de Work est le cœur battant de toute l'exécution en entrepôt.",
      "sections": [
        {
          "title": "Anatomie d'un ordre de travail D365",
          "content": "Un travail est matérialisé par deux niveaux de données :<br><br>• <strong>En-tête de travail (Work Header - table WHSWorkTable)</strong> : Identifie le travail par un numéro unique (ex: WRK-1001), sa typologie (Rangement achat, Prélèvement vente, Réapprovisionnement, Inventaire), son entrepôt, l'utilisateur assigné et son statut de cycle de vie (<strong>Open</strong> → <strong>In progress</strong> → <strong>Closed</strong> ou <strong>Cancelled</strong>).<br><br>• <strong>Lignes de travail (Work Lines - table WHSWorkLine)</strong> : Décomposent la mission en étapes élémentaires ordonnées par un numéro de ligne (LineNum)."
        },
        {
          "title": "La règle d'or D365 : L'appariement strict Pick / Put",
          "content": "Dans D365, les lignes de travail fonctionnent obligatoirement par paires ordonnées indissociables :<br><br>1. <strong>Ligne 1 : Prendre (Pick)</strong> → Se rendre à l'emplacement source, scanner la plaque LP et charger la marchandise sur l'engin de manutention (chariot, transpalette).<br>2. <strong>Ligne 2 : Déposer (Put)</strong> → Acheminer la marchandise à l'emplacement cible (alvéole de stockage, zone de tri ou quai de départ) et confirmer la dépose.<br><br><strong>Le verrou d'intégrité séquentielle</strong> : Il est physiquement et logiquement impossible de déposer une marchandise avant de l'avoir prélevée ! D365 verrouille rigoureusement l'exécution de la ligne Put : tant que la ligne Pick correspondante n'a pas été clôturée (Closed), le bouton ou le menu mobile de la dépose reste désactivé."
        },
        {
          "title": "Suivi en direct dans l'onglet 'Travaux (Work)'",
          "content": "Sur notre écran 'Travaux', vous pouvez inspecter l'ensemble des ordres actifs de l'entrepôt. Observez comment l'en-tête passe automatiquement à 'In progress' dès la validation du Pick, puis à 'Closed' dès la finalisation du Put, transférant définitivement le stock vers sa case de destination."
        }
      ]
    },
    "glossary": [
      {
        "term": "Work Header",
        "def": "En-tête de travail identifiant l'ordre, l'entrepôt, l'opérateur et le statut global."
      },
      {
        "term": "Work Line (Pick)",
        "def": "Première étape obligatoire : prélever l'article à l'emplacement d'origine."
      },
      {
        "term": "Work Line (Put)",
        "def": "Seconde étape : déposer la marchandise à l'emplacement de transit ou cible."
      },
      {
        "term": "Work Template",
        "def": "Modèle définissant les étapes requises selon le type de flux (ex: WT-PO-PUT)."
      }
    ],
    "missionText": "Ouvrez l'onglet « Travaux (Work) », observez les travaux ouverts et validez une étape Prendre (Pick) puis Déposer (Put).",
    "targetTab": "travaux",
    "checkCompleted": (state) => {
      return (state.works || []).some(w => w.status === "Closed" || w.lines.some(l => l.status === "Closed"));
    },
    "question": "Quelle règle fondamentale régit les paires de lignes de travail dans D365 WMS ?",
    "options": [
      "On peut déposer (Put) avant de prélever (Pick)",
      "La ligne Put ne peut être exécutée que lorsque la ligne Pick correspondante est clôturée (Closed)",
      "Les lignes Pick et Put s'exécutent obligatoirement le jour suivant"
    ],
    "correctIndex": 1,
    "explanation": "Un opérateur ne peut physiquement déposer un article qu'après l'avoir prélevé dans l'emplacement source : D365 verrouille la ligne Put tant que le Pick n'est pas Closed."
  },
  {
    "id": 5,
    "title": "5. Directives d'emplacement (Location Directives)",
    "subtitle": "Le cerveau algorithmique de guidage spatial et de consolidation",
    "concept": {
      "intro": "Comment le système choisit-il l'emplacement exact où un cariste doit ranger une palette fraîchement déchargée ou prélever 3 cartons pour un client ? Ce ne sont jamais des choix arbitraires ni codés en dur dans le logiciel. Ce choix est piloté par le moteur des <strong>Directives d'emplacement (Location Directives)</strong>, véritable intelligence décisionnelle de D365.",
      "sections": [
        {
          "title": "Fonctionnement du moteur d'évaluation séquentielle",
          "content": "Dans les tables de paramétrage WMS, les directives d'emplacement sont classées par <strong>Numéro de séquence croissant (10, 20, 30...)</strong> et par type d'opération (Put pour ranger, Pick pour prélever).<br><br>Lorsque le système doit trouver un emplacement pour une ligne de travail :<br>1. Il évalue la première directive (la séquence la plus petite, ex: Séquence 10).<br>2. Il applique la requête de filtre : le produit est-il éligible ? La zone cible a-t-elle de la place disponible ? Le profil d'alvéole correspond-il ?<br>3. Si un emplacement valide est trouvé, l'algorithme s'arrête immédiatement et affecte cet emplacement à la ligne de travail.<br>4. Si l'emplacement est plein ou incompatible, l'algorithme 'déborde' et évalue la directive suivante (ex: Séquence 20)."
        },
        {
          "title": "Stratégies avancées : Consolidation et déport en réserve",
          "content": "Dans un entrepôt moderne, éparpiller les palettes du même café dans 10 allées différentes est catastrophique pour la productivité. La stratégie de <strong>Consolidation</strong> demande à la directive 10 de rechercher d'abord une alvéole contenant déjà la même référence article. Ce n'est que si aucune alvéole existante ne peut accueillir la palette que la directive 20 oriente le cariste vers une alvéole vide de la zone de masse (<strong>ZONE-BULK</strong>)."
        },
        {
          "title": "Traçabilité et explications de directive",
          "content": "Dans Stockroom, chaque ligne de travail générée affiche le badge de la directive qui l'a guidée (ex: '🎯 Directive 10, ligne 1 : Rangement Réserve BULK'). Dans l'écran 'Configuration WMS', vous pouvez intervertir les priorités (Monter/Descendre) et constater immédiatement l'impact sur l'affectation spatiale !"
        }
      ]
    },
    "glossary": [
      {
        "term": "Location Directive",
        "def": "Règle de sélection d'emplacement paramétrable selon des critères d'ordre et de priorité."
      },
      {
        "term": "Séquence",
        "def": "Ordre de priorité d'évaluation des directives (10 est évalué avant 20)."
      },
      {
        "term": "Consolidation SKU",
        "def": "Stratégie cherchant en priorité une case contenant déjà le même produit."
      },
      {
        "term": "Explication de directive",
        "def": "Traçabilité affichant explicitement quelle règle a guidé l'algorithme."
      }
    ],
    "missionText": "Rendez-vous dans « Configuration WMS », examinez les Directives d'emplacement et modifiez la priorité avec les boutons Haut/Bas.",
    "targetTab": "config",
    "checkCompleted": (state) => {
      return (state.locationDirectives || []).length > 0;
    },
    "question": "Si la directive 10 vise la zone BULK et la directive 20 la zone PICK, quel emplacement le WMS proposera-t-il en premier ?",
    "options": [
      "La zone PICK car 20 est supérieur à 10",
      "La zone BULK car la directive de plus petite séquence (10) est évaluée en priorité",
      "Il choisit au hasard entre les deux"
    ],
    "correctIndex": 1,
    "explanation": "Dans D365, les directives sont scannées par ordre croissant de séquence : la directive 10 est testée avant la directive 20."
  },
  {
    "id": 6,
    "title": "6. Vagues et flux de sortie (Waves & Outbound)",
    "subtitle": "Commandes clients, chargements, expéditions et traitement de vague",
    "concept": {
      "intro": "Le flux de sortie (Outbound) est le processus le plus critique en termes de productivité horaire et de respect des délais transporteurs. Dynamics 365 structure les sorties selon une chaîne logistique intégrée en 4 maillons : Commande client (Sales Order) → Expédition (Shipment) → Chargement (Load) → Vague (Wave).",
      "sections": [
        {
          "title": "Les 4 maillons de la chaîne d'expédition D365",
          "content": "1. <strong>Commande de vente (Sales Order - SO)</strong> : Document commercial initié par l'administration des ventes (ex: SO-2001 commandé par Monoprix Opéra).<br><br>2. <strong>Expédition (Shipment)</strong> : Regroupement opérationnel de toutes les lignes de commandes destinées au même client et livrables à la même date.<br><br>3. <strong>Chargement (Load)</strong> : Contenu physique alloué à un moyen de transport spécifique ou camion d'un transporteur (Carrier).<br><br>4. <strong>Vague de préparation (Wave)</strong> : Regroupement par lots de plusieurs expéditions. Préparer les commandes client par client obligerait les préparateurs à parcourir 15 kilomètres par jour. La vague mutualise les prélèvements pour optimiser le chemin de tournée."
        },
        {
          "title": "Le déclencheur d'exécution : Le traitement de vague (Wave Processing)",
          "content": "Tant qu'une vague est au statut 'Created', aucun préparateur ne peut commencer. C'est l'action de <strong>Traitement de vague (Release & Process Wave)</strong> qui déclenche l'ensemble des mécanismes WMS automatisés :<br>• <strong>Allocation d'inventaire</strong> : Le système verrouille les quantités nécessaires en stock selon la règle FEFO (lots les plus anciens sortis d'abord).<br>• <strong>Détection des ruptures (Shortages)</strong> : Si le stock est insuffisant, D365 calcule immédiatement la rupture et bascule la commande en reliquat partiel.<br>• <strong>Génération automatique des travaux de prélèvement (Pick Work)</strong> : Des ordres de travail sous modèle <strong>WT-SO-PICK</strong> sont générés pour guider les caristes vers les alvéoles de stockage."
        },
        {
          "title": "Le dénouement : Confirmation d'expédition (Ship Confirm)",
          "content": "Une fois tous les articles prélevés et déposés sur le quai d'expédition (<strong>EXPEDITION</strong>, zone ZG-OUTBOUND), la vague est achevée. Le responsable quai valide la <strong>Confirmation d'expédition (Ship Confirm)</strong> : le camion part, les articles sont définitivement déstockés du bilan physique de l'entrepôt et le bon de livraison officiel (<strong>Packing Slip</strong>) est émis."
        }
      ]
    },
    "glossary": [
      {
        "term": "Load (Chargement)",
        "def": "Contenu physique affecté à un transporteur et à son véhicule."
      },
      {
        "term": "Shipment (Expédition)",
        "def": "Ensemble des lignes d'une commande préparées pour un même destinataire."
      },
      {
        "term": "Wave (Vague)",
        "def": "Lot de commandes libérées ensemble pour exécuter un prélèvement groupé."
      },
      {
        "term": "Ship Confirm",
        "def": "Validation finale du départ camion déstockant définitivement la marchandise."
      }
    ],
    "missionText": "Allez sur « Expédition », ouvrez le sous-onglet « Vagues d'expédition » et cliquez sur « Lancer la vague » pour générer les travaux.",
    "targetTab": "expedition",
    "checkCompleted": (state) => {
      return (state.waves || []).some(w => w.status === "Executed");
    },
    "question": "Quel événement déclenche la création des travaux de prélèvement (Pick Work) dans le flux de sortie D365 ?",
    "options": [
      "La saisie du devis client",
      "Le traitement et l'exécution de la vague (Wave processing)",
      "Le retour du camion à vide"
    ],
    "correctIndex": 1,
    "explanation": "C'est l'exécution de la vague (Wave Release / Process) qui exécute l'allocation et crée concrètement les ordres de travail de prélèvement."
  },
  {
    "id": 7,
    "title": "7. Réapprovisionnement Min/Max (Replenishment)",
    "subtitle": "Seuils d'alerte, boucle d'alimentation et prévention des ruptures de picking",
    "concept": {
      "intro": "Dans un grand entrepôt de distribution, les allées de prélèvement au sol ou à hauteur d'homme (<strong>Zone PICK</strong>) permettent aux préparateurs d'attraper des cartons rapidement sans nacelle ni chariot élévateur. Mais ces cases de picking ont un volume restreint et se vident à toute vitesse lors des fortes cadences de commandes.",
      "sections": [
        {
          "title": "Le risque mortel : Le blocage du picking en pleine vague",
          "content": "Si un préparateur arrive devant une alvéole de picking vide pour préparer une commande prioritaire, toute la chaîne logistique s'arrête. Pour éviter ce goulot d'étranglement, Dynamics 365 intègre un moteur autonome de <strong>Réapprovisionnement (Replenishment)</strong> qui surveille en temps réel le niveau de chaque case de picking."
        },
        {
          "title": "La mécanique des seuils Min / Max",
          "content": "Pour chaque couple Article / Emplacement de picking, le logisticien configure deux seuils :<br><br>• <strong>Seuil Minimum (Min)</strong> : Niveau de sécurité déclencheur (ex: 20 unités). Dès que le stock disponible dans la case tombe à ou sous ce chiffre, une alerte est levée.<br>• <strong>Seuil Maximum (Max)</strong> : Capacité nominale de l'alvéole (ex: 100 unités). La quantité à réapprovisionner correspond exactement à : Quantité requise = Seuil Max - Stock actuel.<br><br><strong>Création du travail de réappro (WT-REPLEN)</strong> : Le système génère automatiquement un travail de type Replenishment :<br>1. <strong>Pick</strong> : Le cariste grande hauteur va chercher une palette complète en zone de réserve (<strong>Zone BULK</strong>).<br>2. <strong>Put</strong> : Il descend la marchandise et la dépose dans la case de prélèvement (<strong>Zone PICK</strong>) avant même que la vague de commande suivante ne soit lancée !"
        },
        {
          "title": "Replenishment à la vague vs Replenishment Min/Max",
          "content": "D365 supporte deux modes : le réapprovisionnement <strong>Min/Max</strong> (préventif, tournant en continu) et le réapprovisionnement <strong>à la vague (Wave Replenishment)</strong> qui calcule les besoins stricts dictés par les commandes d'une vague avant de lancer le prélèvement."
        }
      ]
    },
    "glossary": [
      {
        "term": "Replenishment (Réappro)",
        "def": "Mouvement interne de stock de la réserve vers l'emplacement de prélèvement."
      },
      {
        "term": "Seuil Min/Max",
        "def": "Paramètre déclenchant un réapprovisionnement dès que le stock atteint le seuil bas."
      },
      {
        "term": "Zone BULK vs PICK",
        "def": "La réserve accueille les palettes complètes ; le picking permet la prise unitaire."
      }
    ],
    "missionText": "Observez dans l'onglet Travaux ou Configuration les modèles de travail prévus pour le réapprovisionnement (WT-REPLEN).",
    "targetTab": "travaux",
    "checkCompleted": (state) => {
      return (state.workTemplates || []).some(wt => wt.id === "WT-REPLEN");
    },
    "question": "Quel est l'objectif du réapprovisionnement d'emplacement (Replenishment) dans D365 ?",
    "options": [
      "Vider complètement l'entrepôt pour le nettoyage",
      "Garantir que les zones de prélèvement (PICK) ne tombent jamais à court d'articles pendant la préparation",
      "Augmenter artificiellement le nombre de palettes"
    ],
    "correctIndex": 1,
    "explanation": "Le réapprovisionnement transfère à temps le stock de réserve vers les cases de picking afin que les préparateurs ne soient jamais bloqués."
  },
  {
    "id": 8,
    "title": "8. Inventaire tournant & Journal des écarts",
    "subtitle": "Cycle counting, détection des variances et régularisation comptable",
    "concept": {
      "intro": "Historiquement, les entrepôts devaient fermer leurs portes plusieurs jours par an pour compter manuellement l'intégralité des stocks lors d'un inventaire général fastidieux. Dynamics 365 remplace cette méthode obsolète par le principe moderne de l'<strong>Inventaire tournant (Cycle Counting)</strong>.",
      "sections": [
        {
          "title": "Le principe du comptage tournant permanent",
          "content": "Au lieu d'un inventaire annuel bloquant, le système génère en continu des travaux de comptage (<strong>Count Work</strong>) sur un échantillon ciblé d'emplacements (selon la classification ABC, la fréquence de rotation ou un seuil d'anomalie détecté par les préparateurs).<br><br>L'opérateur reçoit sur son terminal mobile l'ordre de compter physiquement les unités présentes sur l'emplacement sans connaître à l'avance le stock théorique (comptage à l'aveugle pour éviter les biais de confirmation)."
        },
        {
          "title": "La variance et le Journal d'ajustement d'inventaire",
          "content": "Lorsque l'opérateur saisit la quantité réelle constatée sur le terrain :<br><br>• <strong>Si Quantité réelle == Quantité système</strong> : L'emplacement est certifié et validé sans impact comptable.<br>• <strong>Si un écart apparaît (Variance +/-)</strong> : Le système ne modifie pas le stock à la légère ! Il génère une proposition dans un <strong>Journal d'ajustement d'inventaire (Inventory Adjustment Journal)</strong>.<br><br>Ce journal consigne précisément :<br>1. L'écart arithmétique (ex: -5 unités manquantes ou +2 unités découvertes).<br>2. Le code motif financier (ex: casse, vol suspecté, erreur de réception antécédente).<br>3. L'impact financier débit/crédit sur le compte d'écart d'inventaire de l'entité juridique."
        },
        {
          "title": "Pratique dans Stockroom",
          "content": "Sur l'écran 'Inventaire tournant', sélectionnez un emplacement, saisissez une quantité physique différente de la quantité système et validez. Observez la journalisation de l'écart et la mise à jour immédiate du stock On-hand !"
        }
      ]
    },
    "glossary": [
      {
        "term": "Cycle Counting",
        "def": "Comptage régulier d'un échantillon d'emplacements sans fermer l'entrepôt."
      },
      {
        "term": "Inventory Adjustment Journal",
        "def": "Journal traçant les pertes ou découvertes avec explication financière."
      },
      {
        "term": "Variance (Écart)",
        "def": "Différence arithmétique entre quantité théorique système et quantité comptée."
      }
    ],
    "missionText": "Allez dans « Inventaire », sélectionnez un emplacement et validez un ajustement avec écart pour mettre à jour le stock.",
    "targetTab": "inventaire",
    "checkCompleted": (state) => {
      return !!state.inventoryAdjusted || state.movementLogs.some(l => l.text.includes("Ajustement d'inventaire"));
    },
    "question": "Que consigne le journal d'ajustement lors de la validation d'un inventaire tournant avec écart ?",
    "options": [
      "Le mot de passe de l'administrateur",
      "L'écart (variance positive ou négative), l'horodatage et la mise à jour du stock physique",
      "Une facture envoyée au client final"
    ],
    "correctIndex": 1,
    "explanation": "Le journal d'ajustement assure une traçabilité comptable et logistique stricte des pertes ou gains constatés sur le terrain."
  },
  {
    "id": 9,
    "title": "9. Exécution mobile & Clôture de l'expédition",
    "subtitle": "L'application mobile RF, le détrompage par scan et le packing slip final",
    "concept": {
      "intro": "Dans un entrepôt géré sous Microsoft Dynamics 365, les caristes et opérateurs de quai ne s'assoient jamais devant un ordinateur de bureau. Toutes les opérations physiques sont pilotées via l'<strong>Application mobile Warehouse Management</strong> sur des terminaux durcis (scanners RF Android/Zebra).",
      "sections": [
        {
          "title": "L'ergonomie et le détrompage par scan obligatoire",
          "content": "L'application mobile D365 est conçue pour éliminer 100% des erreurs humaines grâce à des mécanismes de détrompage stricts :<br><br>• <strong>Scan de l'emplacement</strong> : Le cariste ne peut pas valider un prélèvement ou une dépose en cliquant simplement sur 'OK'. Il doit obligatoirement scanner le code-barres de l'alvéole pour prouver qu'il est physiquement devant le bon rack.<br>• <strong>Scan de la plaque LP</strong> : Il scanne ensuite le code-barres de la palette. Si la plaque scannée ne correspond pas à celle allouée par le WMS, le terminal émet une alerte sonore bloquante et refuse l'opération.<br>• <strong>Validation étape par étape</strong> : Chaque validation met à jour en temps réel l'ERP via des services web légers, garantissant une visibilité instantanée pour les coordinateurs logistiques."
        },
        {
          "title": "La clôture de l'expédition (Ship Confirm) et le Bon de livraison",
          "content": "Lorsque le dernier travail de prélèvement est terminé, la marchandise se trouve sur le quai d'expédition (<strong>EXPEDITION</strong>). Le chauffeur du camion se présente, le chargement est contrôlé et le chef d'équipe clique sur <strong>Confirmer expédition (Ship Confirm)</strong>.<br><br>Cette action irréversible déclenche automatiquement :<br>1. La clôture définitive de l'expédition (Shipment) et du chargement (Load).<br>2. La déduction comptable et physique du stock de l'entrepôt (déstockage définitif).<br>3. L'édition du <strong>Bon de livraison officiel (Packing Slip)</strong> remis au transporteur pour accompagner la marchandise jusqu'au client final."
        }
      ]
    },
    "glossary": [
      {
        "term": "Warehouse Mobile App",
        "def": "Interface terminal code-barres / RF guidant l'opérateur pas à pas."
      },
      {
        "term": "Scan-style validation",
        "def": "Contrôle détrompeur par scan de l'emplacement et de la plaque LP."
      },
      {
        "term": "Packing Slip (Bon de livraison)",
        "def": "Document final confirmant la sortie légale et physique du stock."
      }
    ],
    "missionText": "Vérifiez dans « Expédition » qu'une commande au statut 'picked' peut être finalisée via 'Confirmer expédition (Ship Confirm)'.",
    "targetTab": "expedition",
    "checkCompleted": (state) => {
      return state.salesOrders.some(s => s.status === "shipped");
    },
    "question": "Quelle action finale déclenche la sortie comptable et la génération du bon de livraison (Packing Slip) ?",
    "options": [
      "La création de la commande client",
      "La confirmation d'expédition (Ship Confirm)",
      "Le rangement de la marchandise en réserve"
    ],
    "correctIndex": 1,
    "explanation": "La confirmation d'expédition valide le départ du camion et génère le document officiel de livraison déstockant définitivement les produits."
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
      const activeTheoryTab = uiState.trainingTheoryTab || "lessons"; // 'lessons', 'architecture', 'flows', 'glossary'
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
        <div class="course-header" style="margin-bottom: 20px;">
          <div class="course-headline">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="badge badge-primary" style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">CURRICULUM OFFICIEL</span>
                <span class="badge badge-neutral" style="font-size: 11px;">MICROSOFT DYNAMICS 365 SUPPLY CHAIN</span>
              </div>
              <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.3px;">Académie WMS & Théorie Enterprise</h1>
              <p style="color: var(--text-muted); font-size: 14.5px; line-height: 1.5; max-width: 900px;">
                Ce programme d'ingénierie logistique enseigne les rouages profonds de <strong>Dynamics 365 SCM</strong> : architecture des données, réservation sur 7 dimensions, modélisation des travaux (Work Engine), directives d'emplacement et exécution radiofréquence.
              </p>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
              <span class="num" style="font-size: 18px; font-weight: 800; color: var(--primary);">${completedCount} / ${totalLessons} leçons validées</span>
              <button class="btn btn-secondary btn-sm" data-action="reset-training">${getIcon("refresh")} Recommencer la formation</button>
            </div>
          </div>

          <div class="progress-bar-bg" style="height: 12px; border-radius: 6px; margin: 12px 0 6px;">
            <div class="progress-bar-fill" style="width: ${percent}%; border-radius: 5px;"></div>
          </div>

          ${isAllFinished ? `
            <div class="alert-banner success" style="margin-top: 14px; margin-bottom: 0;">
              <div>
                <strong>${getIcon("award")} Félicitations ! Vous avez validé l'intégralité du cycle Dynamics 365 WMS.</strong><br>
                Vous maîtrisez les concepts fondamentaux d'architecture, les structures de données, la politique des directives et l'ensemble des flux entrants et sortants.
              </div>
            </div>
          ` : ''}

          <!-- Training Navigation Sub-Tabs -->
          <div class="training-subnav" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; border-top: 2px solid var(--border-color); padding-top: 14px;">
            <button class="btn ${activeTheoryTab === 'lessons' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="training-subtab" data-subtab="lessons" style="font-weight: 700;">
              ${getIcon("award")} 1. Leçons & Pratique (${totalLessons})
            </button>
            <button class="btn ${activeTheoryTab === 'architecture' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="training-subtab" data-subtab="architecture" style="font-weight: 700;">
              ${getIcon("map")} 2. Architecture & Modèle D365
            </button>
            <button class="btn ${activeTheoryTab === 'flows' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="training-subtab" data-subtab="flows" style="font-weight: 700;">
              ${getIcon("target")} 3. Schémas des Flux d'Entrepôt
            </button>
            <button class="btn ${activeTheoryTab === 'glossary' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="training-subtab" data-subtab="glossary" style="font-weight: 700;">
              ${getIcon("clipboard")} 4. Dictionnaire D365 (${D365_FULL_GLOSSARY.length} termes)
            </button>
          </div>
        </div>

        <!-- SUB-TAB 2: ARCHITECTURE & DATA MODEL -->
        ${activeTheoryTab === 'architecture' ? `
          <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;">
            <div class="card" style="background-color: var(--pastel-blue-subtle);">
              <div class="card-header">
                <span class="card-title">${getIcon("map")} Architecture Pyramidale & Objets Métier Dynamics 365</span>
              </div>
              <div class="card-body" style="font-size: 15px; line-height: 1.65;">
                <p>
                  Dans Microsoft Dynamics 365 Supply Chain Management, la gestion d'entrepôt n'est pas un système isolé : elle est <strong>entièrement unifiée avec les modules de comptabilité générale, de vente, d'approvisionnement et de planification</strong>. Voici comment s'organise l'arborescence des objets :
                </p>

                <div style="background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin: 16px 0; box-shadow: var(--shadow-sm);">
                  <div style="display: flex; flex-direction: column; gap: 12px; font-family: monospace; font-size: 14.5px;">
                    <div style="padding: 10px 14px; background-color: #f1f5f9; border-left: 5px solid #0284c7; border-radius: 4px;">
                      <strong style="color: #0369a1;">NIVEAU 1 : Entité juridique (Legal Entity / DataAreaId = 'FR01')</strong><br>
                      <span style="color: var(--text-muted); font-size: 13px;">Société mère détentrice des comptes comptables, déclarations fiscales et référentiel clients/fournisseurs.</span>
                    </div>
                    <div style="padding: 10px 14px; background-color: #f8fafc; border-left: 5px solid #0ea5e9; border-radius: 4px; margin-left: 20px;">
                      <strong style="color: #0284c7;">└── NIVEAU 2 : Site logistique (InventSite = 'SITE-01' Ivry-sur-Seine)</strong><br>
                      <span style="color: var(--text-muted); font-size: 13px;">Campus régional fédérant un ensemble d'installations physiques.</span>
                    </div>
                    <div style="padding: 10px 14px; background-color: #f1f5f9; border-left: 5px solid #38bdf8; border-radius: 4px; margin-left: 40px;">
                      <strong style="color: #0369a1;">    └── NIVEAU 3 : Entrepôt WMS (InventLocation = 'WH-MAIN')</strong><br>
                      <span style="color: var(--text-muted); font-size: 13px;">Bâtiment couvert activé pour les processus avancés WMS (directives, vagues, terminaux RF).</span>
                    </div>
                    <div style="padding: 10px 14px; background-color: #f8fafc; border-left: 5px solid #10b981; border-radius: 4px; margin-left: 60px;">
                      <strong style="color: #059669;">        └── NIVEAU 4 : Emplacement (WMSLocation = 'A-01-01', Profil: PROF-BULK)</strong><br>
                      <span style="color: var(--text-muted); font-size: 13px;">Alvéole tridimensionnelle physique (Allée A, Rack 01, Hauteur 01). Contrôlé par volume et poids.</span>
                    </div>
                    <div style="padding: 10px 14px; background-color: #f1f5f9; border-left: 5px solid #f59e0b; border-radius: 4px; margin-left: 80px;">
                      <strong style="color: #d97706;">            └── NIVEAU 5 : Plaque d'immatriculation (License Plate = 'LP-1001')</strong><br>
                      <span style="color: var(--text-muted); font-size: 13px;">Identifiant unitaire de contenant (palette/bac) hébergeant les articles, lots et quantités.</span>
                    </div>
                  </div>
                </div>

                <h3 style="font-size: 16px; font-weight: 800; margin: 20px 0 10px;">Les 7 Dimensions Clés du Stock On-hand</h3>
                <p>
                  Dans la base SQL sous-jacente de D365 (tables <code>InventSum</code> et <code>InventDim</code>), il est rigoureusement impossible d'avoir une quantité orpheline. Chaque unité stockée est l'intersection exacte de 7 dimensions obligatoires :
                </p>
                <div class="table-container" style="margin-top: 10px;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Catégorie de dimension</th>
                        <th>Nom de la dimension</th>
                        <th>Code D365</th>
                        <th>Rôle logistique & Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Identification Produit</strong></td>
                        <td>Numéro d'article (SKU)</td>
                        <td><code>ItemId</code></td>
                        <td>Désigne le produit standardisé (ex: CAF-1KG, THE-VERT, CHO-500).</td>
                      </tr>
                      <tr>
                        <td rowspan="4"><strong>Dimensions de Stockage</strong></td>
                        <td>Site</td>
                        <td><code>InventSiteId</code></td>
                        <td>Centre géographique où se trouve le stock.</td>
                      </tr>
                      <tr>
                        <td>Entrepôt</td>
                        <td><code>InventLocationId</code></td>
                        <td>Bâtiment logistique abritant le stock.</td>
                      </tr>
                      <tr>
                        <td>Emplacement</td>
                        <td><code>wmsLocationId</code></td>
                        <td>Alvéole de stockage physique.</td>
                      </tr>
                      <tr>
                        <td>Plaque (License Plate)</td>
                        <td><code>LicensePlateId</code></td>
                        <td>Numéro unitaire de palette ou contenant pour les déplacements par lot.</td>
                      </tr>
                      <tr>
                        <td><strong>Dimension de Suivi</strong></td>
                        <td>Numéro de lot & DLUO</td>
                        <td><code>InventBatchId</code></td>
                        <td>Traçabilité sanitaire garantissant la sortie chronologique par péremption (FEFO).</td>
                      </tr>
                      <tr>
                        <td><strong>Dimension Qualité</strong></td>
                        <td>Statut d'inventaire</td>
                        <td><code>InventStatusId</code></td>
                        <td>Gouverne l'allouabilité : Disponible (réservable), Bloqué ou Quarantaine.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SUB-TAB 3: WMS FLOWS SCHEMAS -->
        ${activeTheoryTab === 'flows' ? `
          <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px;">
            <!-- Flux Inbound -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">${getIcon("reception")} Flux Entrant D365 (Inbound Flow : Commande Fournisseur → Rangement)</span>
              </div>
              <div class="card-body" style="font-size: 15px; line-height: 1.65;">
                <div style="background-color: var(--bg-surface-subtle); border: 2px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
                  <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
                    <div style="flex: 1; min-width: 180px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #0369a1; display: block; font-size: 14px;">1. PO Fournisseur</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Purchase Order émis</span>
                    </div>
                    <span style="font-weight: 800; font-size: 18px;">→</span>
                    <div style="flex: 1; min-width: 180px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #059669; display: block; font-size: 14px;">2. Enregistrement Quai</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Quai RECEPTION + Génération LP</span>
                    </div>
                    <span style="font-weight: 800; font-size: 18px;">→</span>
                    <div style="flex: 1; min-width: 180px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #d97706; display: block; font-size: 14px;">3. Directives d'emplacement</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Résolution séquentielle (10, 20)</span>
                    </div>
                    <span style="font-weight: 800; font-size: 18px;">→</span>
                    <div style="flex: 1; min-width: 180px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #7c3aed; display: block; font-size: 14px;">4. Travail WT-PO-PUT</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Pick quai → Put en réserve</span>
                    </div>
                  </div>
                </div>
                <p>
                  <strong>Détail des transactions internes</strong> : Lorsqu'un cariste valide la décharge, le stock passe d'abord au statut physique 'Arrivé' sur l'emplacement quai. Le modèle de travail <code>WT-PO-PUT</code> bloque la palette jusqu'à ce que la ligne <strong>Pick</strong> (prise au quai) et la ligne <strong>Put</strong> (dépose en alvéole finale de réserve <code>A-01-01</code>) soient intégralement clôturées.
                </p>
              </div>
            </div>

            <!-- Flux Outbound -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">${getIcon("expedition")} Flux Sortant D365 (Outbound Flow : Commande Client → Ship Confirm)</span>
              </div>
              <div class="card-body" style="font-size: 15px; line-height: 1.65;">
                <div style="background-color: var(--bg-surface-subtle); border: 2px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
                  <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
                    <div style="flex: 1; min-width: 160px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #0369a1; display: block; font-size: 14px;">1. Sales Order</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Commande client</span>
                    </div>
                    <span style="font-weight: 800; font-size: 18px;">→</span>
                    <div style="flex: 1; min-width: 160px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #059669; display: block; font-size: 14px;">2. Vague (Wave)</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Regroupement d'expéditions</span>
                    </div>
                    <span style="font-weight: 800; font-size: 18px;">→</span>
                    <div style="flex: 1; min-width: 160px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #d97706; display: block; font-size: 14px;">3. Wave Execution</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Allocation FEFO & Travaux</span>
                    </div>
                    <span style="font-weight: 800; font-size: 18px;">→</span>
                    <div style="flex: 1; min-width: 160px; background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: center;">
                      <strong style="color: #7c3aed; display: block; font-size: 14px;">4. Ship Confirm</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Sortie On-hand & Packing Slip</span>
                    </div>
                  </div>
                </div>
                <p>
                  <strong>Traitement par lots et optimisation des tournées</strong> : L'intérêt d'une vague est d'agréger les besoins de dizaines de commandes clients. Plutôt que de visiter 5 fois l'allée A pour 5 clients différents, le WMS alloue les stocks au plus tôt (FEFO), consolide les prélèvements et guide le préparateur sur le chemin le plus court vers le quai d'expédition <code>EXPEDITION</code>.
                </p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SUB-TAB 4: FULL GLOSSARY -->
        ${activeTheoryTab === 'glossary' ? `
          <div class="card" style="margin-bottom: 24px; background-color: var(--pastel-blue-subtle);">
            <div class="card-header" style="background-color: transparent; border-bottom: 2px solid var(--border-color);">
              <span class="card-title">${getIcon("clipboard")} Référentiel Bilingue Officiel Dynamics 365 Supply Chain Management</span>
              <span style="font-size: 13px; color: var(--text-muted); font-weight: 800;">${D365_FULL_GLOSSARY.length} termes certifiés</span>
            </div>
            <div class="card-body">
              <p style="font-size: 14.5px; color: var(--text-main); margin-bottom: 16px; line-height: 1.6;">
                Voici le lexique technique exhaustif utilisé par les architectes de solutions, consultants et chefs d'exploitation Dynamics 365. Chaque concept est présenté avec sa terminologie officielle en français et son équivalent technique Microsoft en anglais :
              </p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
                ${D365_FULL_GLOSSARY.map(g => `
                  <div style="background-color: var(--bg-surface); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 16px; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
                      <strong style="color: #0c4a6e; font-size: 15px;">${g.fr}</strong>
                      <span class="badge badge-neutral" style="font-size: 11px; font-family: monospace; white-space: nowrap;">${g.en}</span>
                    </div>
                    <div style="color: var(--text-main); font-size: 13.5px; line-height: 1.5;">${g.def}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SUB-TAB 1: LESSONS & PRACTICE -->
        ${activeTheoryTab === 'lessons' ? `
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
                        ${lesson.subtitle ? `<div style="font-size: 13px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">${lesson.subtitle}</div>` : ''}
                        <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 3px;">
                          Mission pratique : ${isMissionDone ? '<strong style="color: var(--success-text);">Terminée</strong>' : 'À réaliser'} • Quiz : ${isQuizDone ? '<strong style="color: var(--success-text);">Réussi</strong>' : 'En attente'}
                        </div>
                      </div>
                    </div>
                    <div>
                      ${isLessonDone ? '<span class="badge badge-success">Validée</span>' : (isExpanded ? '<span class="badge badge-primary">En cours</span>' : '<span class="badge badge-neutral">Explorer</span>')}
                    </div>
                  </button>

                  ${isExpanded ? `
                    <div class="lesson-content">
                      <!-- Theoretical Foundations Section -->
                      <div class="concept-box">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 8px;">
                          <span class="badge badge-primary" style="font-size: 11px; font-weight: 800;">FONDEMENTS THÉORIQUES D365</span>
                          <span style="font-weight: 700; font-size: 14px; text-transform: uppercase; color: var(--primary-text);">1. Comprendre le concept en profondeur</span>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 16px; font-weight: 500;">
                          ${typeof lesson.concept === 'object' ? lesson.concept.intro : lesson.concept}
                        </p>

                        ${typeof lesson.concept === 'object' && Array.isArray(lesson.concept.sections) ? lesson.concept.sections.map(sec => `
                          <div style="background-color: var(--bg-surface-subtle); border-left: 4px solid var(--primary); padding: 14px 18px; margin-bottom: 14px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                            <h4 style="font-size: 15px; font-weight: 800; color: #0c4a6e; margin-bottom: 8px;">${sec.title}</h4>
                            <div style="font-size: 15px; line-height: 1.7; color: var(--text-main);">
                              ${sec.content}
                            </div>
                          </div>
                        `).join('') : ''}
                      </div>

                      <!-- Essential Glossary -->
                      <div>
                        <div style="font-weight: 700; font-size: 13px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                          ${getIcon("award")} Termes clés associés
                        </div>
                        <div class="glossary-grid">
                          ${lesson.glossary.map(g => `
                            <div class="glossary-term">
                              <strong>${g.term}</strong>
                              <span>${g.def}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>

                      <!-- Practical Mission Box -->
                      <div class="mission-box">
                        <div class="mission-status-head">
                          <strong style="font-size: 14px; display: flex; align-items: center; gap: 8px;">
                            ${getIcon("target")} 2. Mission pratique sur le système
                          </strong>
                          ${isMissionDone 
                            ? `<span class="badge badge-success">${getIcon('check')} Mission accomplie</span>` 
                            : `<span class="badge badge-warning">${getIcon('clock')} En attente d'action</span>`}
                        </div>
                        <p style="font-size: 15px; line-height: 1.6; margin: 10px 0 14px;">${lesson.missionText}</p>
                        <div>
                          <button class="btn btn-primary btn-sm" data-action="nav-tab" data-tab="${lesson.targetTab}">
                            Aller sur l'écran « ${getTabLabel(lesson.targetTab)} » →
                          </button>
                        </div>
                      </div>

                      <!-- Quiz Validation Box -->
                      <div class="quiz-box">
                        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                          ${getIcon("help")} 3. Question de validation théorique
                        </div>
                        <p style="font-size: 15px; color: var(--text-main); font-weight: 600; margin-bottom: 12px;">${lesson.question}</p>
                        
                        <div class="quiz-options">
                          ${lesson.options.map((opt, oIdx) => {
                            const isSelected = qState && qState.selectedIndex === oIdx;
                            return `
                              <label class="quiz-option-label" style="${isSelected ? (qState.isCorrect ? 'border-color: var(--success); background-color: var(--success-subtle);' : 'border-color: var(--danger); background-color: var(--danger-subtle);') : ''}">
                                <input type="radio" name="quiz-${lesson.id}" value="${oIdx}" data-action="select-quiz-option" data-lesson-id="${lesson.id}" ${isSelected ? 'checked' : ''}>
                                <span style="font-size: 14.5px;">${opt}</span>
                              </label>
                            `;
                          }).join('')}
                        </div>

                        ${qState ? `
                          <div class="quiz-feedback" style="background-color: ${qState.isCorrect ? 'var(--success-subtle)' : 'var(--danger-subtle)'}; color: ${qState.isCorrect ? 'var(--success-text)' : 'var(--danger-text)'}; padding: 14px 18px; margin-top: 14px;">
                            <strong style="font-size: 15px;">${qState.isCorrect ? 'Excellente réponse !' : 'Réponse incorrecte.'}</strong>
                            <div style="margin-top: 6px; font-size: 14px; line-height: 1.6;">${lesson.explanation}</div>
                            ${!qState.isCorrect ? `
                              <div style="margin-top: 10px;">
                                <button class="btn btn-secondary btn-sm" data-action="retry-quiz" data-lesson-id="${lesson.id}">Réessayer la question</button>
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
        ` : ''}
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

    // 4. Expédition View (D365 Outbound Flow: Sales Order -> Load -> Shipment -> Wave -> Work -> Pick -> Ship)
    function renderExpeditionView(state, uiState) {
      const activeSubTab = (uiState && uiState.expedSubTab) || "waves";
      const openPickTasks = state.tasks.filter(t => t.type === "pick" && !t.done);

      const totalSos = state.salesOrders.length;
      const totalWaves = (state.waves || []).length;
      const totalShipments = (state.shipments || []).length;
      const totalLoads = (state.loads || []).length;

      return `
        <!-- KPI Outbound Overview Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-yellow);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #713f12;">${getIcon("expedition")} Vagues (Waves)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #713f12;">${totalWaves} <span style="font-size: 13px; font-weight: 700;">créées</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-blue);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0c4a6e;">${getIcon("box")} Expéditions (Shipments)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #0c4a6e;">${totalShipments} <span style="font-size: 13px; font-weight: 700;">enregistrées</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-lavender);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4c1d95;">${getIcon("package")} Chargements (Loads)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #4c1d95;">${totalLoads} <span style="font-size: 13px; font-weight: 700;">transporteurs</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-mint);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #14532d;">${getIcon("clipboard")} Prélèvements ouverts</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #14532d;">${openPickTasks.length} <span style="font-size: 13px; font-weight: 700;">en attente</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("expedition")} Gestion des flux de sortie (D365 Outbound Management)</span>
            <div>
              <button class="btn btn-primary btn-sm" data-action="create-new-wave">
                + Créer une nouvelle Vague (Wave)
              </button>
            </div>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Dans Dynamics 365, le flux sortant suit un ordonnancement précis : <strong>Commande client → Chargement (Load) → Expédition (Shipment) → Vague (Wave) → Travail de prélèvement (Pick Work) → Expédition (Ship Confirm)</strong>.
            </p>

            <!-- Sub Tabs -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">
              <button class="btn ${activeSubTab === 'waves' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="exped-subtab" data-subtab="waves">
                Vagues d'expédition (${totalWaves})
              </button>
              <button class="btn ${activeSubTab === 'salesOrders' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="exped-subtab" data-subtab="salesOrders">
                Commandes clients (${totalSos})
              </button>
              <button class="btn ${activeSubTab === 'shipments' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="exped-subtab" data-subtab="shipments">
                Expéditions (${totalShipments})
              </button>
              <button class="btn ${activeSubTab === 'loads' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="exped-subtab" data-subtab="loads">
                Chargements / Transport (${totalLoads})
              </button>
            </div>

            <!-- Tab 1: Waves -->
            ${activeSubTab === 'waves' ? `
              <div>
                <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">Vagues de préparation (Waves)</h3>
                ${(state.waves || []).length === 0 ? `
                  <div style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic; background-color: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                    Aucune vague créée. Cliquez sur « Créer une nouvelle Vague » ci-dessus.
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 14px;">
                    ${(state.waves || []).map(w => {
                      const canExecute = w.status !== "Executed";
                      let waveBadge = "badge-neutral";
                      if (w.status === "Processing") waveBadge = "badge-primary";
                      else if (w.status === "Executed") waveBadge = "badge-success";

                      return `
                        <div style="border: 2px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                          <div style="background-color: var(--pastel-yellow-subtle); border-bottom: 2px solid var(--border-color); padding: 10px 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                              <strong style="font-size: 15px;">${w.id}</strong>
                              <span class="badge ${waveBadge}">${w.status}</span>
                              <span style="font-size: 12px; color: var(--text-muted);">Modèle : <strong>${w.templateId}</strong></span>
                              <span style="font-size: 12px; color: var(--text-muted);">Entrepôt : <strong>${w.warehouse}</strong></span>
                            </div>
                            <div>
                              ${canExecute ? `
                                <button class="btn btn-primary btn-sm" data-action="process-wave" data-wave-id="${w.id}">
                                  ${getIcon("play")} Lancer la vague (Release & Create Work)
                                </button>
                              ` : `
                                <span class="badge badge-success">${getIcon("check")} Vague exécutée</span>
                              `}
                            </div>
                          </div>

                          <div style="padding: 12px 14px; background-color: var(--bg-surface);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                              <span style="font-weight: 700; font-size: 12px; text-transform: uppercase;">Expéditions incluses dans la vague :</span>
                              ${canExecute ? `
                                <div style="display: inline-flex; align-items: center; gap: 6px;">
                                  <select class="input-select" id="select-shp-${w.id}" style="font-size: 11px; padding: 3px 6px;">
                                    ${(state.shipments || []).filter(s => !w.shipmentIds.includes(s.id)).map(s => `
                                      <option value="${s.id}">${s.id} — ${s.orderId} (${s.customer})</option>
                                    `).join('')}
                                  </select>
                                  <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px;" data-action="add-shipment-wave" data-wave-id="${w.id}">
                                    + Ajouter expédition
                                  </button>
                                </div>
                              ` : ''}
                            </div>

                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                              ${w.shipmentIds.map(sid => {
                                const shp = (state.shipments || []).find(s => s.id === sid);
                                return `
                                  <div style="background-color: var(--bg-surface-subtle); border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); padding: 6px 10px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                                    <strong>${sid}</strong>
                                    <span style="color: var(--text-muted);">${shp ? shp.orderId + ' (' + shp.customer + ')' : ''}</span>
                                    <span class="badge badge-neutral" style="font-size: 10px;">${shp ? shp.status : ''}</span>
                                  </div>
                                `;
                              }).join('')}
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            ` : ''}

            <!-- Tab 2: Sales Orders -->
            ${activeSubTab === 'salesOrders' ? `
              <div style="display: flex; flex-direction: column; gap: 18px;">
                ${state.salesOrders.map(so => {
                  const canRelease = so.status === "open";
                  const canShip = so.status === "picked";
                  const hasShortage = so.shortages && Object.keys(so.shortages).length > 0;
                  const shp = (state.shipments || []).find(s => s.orderId === so.id);

                  return `
                    <div style="border: 2px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm);">
                      <div style="background-color: var(--pastel-blue-subtle); border-bottom: 2px solid var(--border-color); padding: 10px 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px;">
                        <div>
                          <strong>${so.id}</strong>
                          <span style="color: var(--text-muted); font-size: 13px; margin-left: 8px;">Client : ${so.customer}</span>
                          ${shp ? `<span class="badge badge-neutral" style="margin-left: 8px;">Expédition : ${shp.id}</span>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          ${getStatusBadge(so.status)}
                          ${canRelease ? `
                            <button class="btn btn-primary btn-sm" data-action="release-so" data-so-id="${so.id}">
                              Lancer la commande (Release)
                            </button>
                          ` : ''}
                          ${canShip ? `
                            <button class="btn btn-success btn-sm" data-action="ship-so" data-so-id="${so.id}">
                              ${getIcon("check")} Confirmer expédition (Ship Confirm)
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
                              const totalAvail = state.stock
                                .filter(s => {
                                  const loc = state.locations.find(l => l.code === s.location);
                                  return loc && !loc.isDock && s.sku === line.sku && s.status === "Disponible";
                                })
                                .reduce((sum, s) => sum + Math.max(0, s.qty - (s.reservedQty || 0)), 0);

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
            ` : ''}

            <!-- Tab 3: Shipments -->
            ${activeSubTab === 'shipments' ? `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID Expédition</th>
                      <th>Commande Ref</th>
                      <th>Client Destinataire</th>
                      <th>Chargement (Load)</th>
                      <th>Vague (Wave)</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(state.shipments || []).map(s => `
                      <tr>
                        <td><strong>${s.id}</strong></td>
                        <td>${s.orderId}</td>
                        <td>${s.customer}</td>
                        <td><span class="badge badge-neutral">${s.loadId || 'Non assigné'}</span></td>
                        <td><span class="badge badge-primary">${s.waveId || 'En attente'}</span></td>
                        <td><span class="badge badge-success">${s.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <!-- Tab 4: Loads -->
            ${activeSubTab === 'loads' ? `
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID Chargement</th>
                      <th>Entrepôt</th>
                      <th>Transporteur (Carrier)</th>
                      <th>Expéditions rattachées</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(state.loads || []).map(l => `
                      <tr>
                        <td><strong>${l.id}</strong></td>
                        <td>${l.warehouse}</td>
                        <td><strong>${l.carrier}</strong></td>
                        <td>${l.shipmentIds.join(', ')}</td>
                        <td><span class="badge ${l.status === 'Shipped' ? 'badge-success' : 'badge-neutral'}">${l.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

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
                Aucun prélèvement en attente. Lancez la préparation d'une commande client ou d'une vague ci-dessus pour générer des tâches.
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

    // 4b. Travaux View (D365 Work Headers & Paired Pick/Put Lines)
    function renderTravauxView(state, uiState) {
      const activeType = (uiState && uiState.workFilterType) || "ALL";
      const activeStatus = (uiState && uiState.workFilterStatus) || "ALL";

      const works = state.works || [];
      const filteredWorks = works.filter(w => {
        if (activeType !== "ALL" && w.orderType !== activeType) return false;
        if (activeStatus !== "ALL" && w.status !== activeStatus) return false;
        return true;
      });

      const openCount = works.filter(w => w.status === "Open").length;
      const inProgressCount = works.filter(w => w.status === "In progress").length;
      const closedCount = works.filter(w => w.status === "Closed").length;

      return `
        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-yellow);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #713f12;">${getIcon("clipboard")} Travaux Ouverts (Open)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #713f12;">${openCount} <span style="font-size: 13px; font-weight: 700;">en attente</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-blue);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0c4a6e;">${getIcon("clock")} En cours (In progress)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #0c4a6e;">${inProgressCount} <span style="font-size: 13px; font-weight: 700;">prélèvement fait</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-mint);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #14532d;">${getIcon("check-circle")} Clôturés (Closed)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #14532d;">${closedCount} <span style="font-size: 13px; font-weight: 700;">terminés</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("clipboard")} Gestion des Travaux WMS (D365 Work Management)</span>
            <span class="badge badge-primary num">${filteredWorks.length} affichés</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Dans Dynamics 365, chaque mouvement physique est encadré par un <strong>En-tête de travail (Work Header)</strong> associé à un modèle (Work Template). Les lignes fonctionnent toujours par paires ordonnées : le <strong>Prélèvement (Pick)</strong> doit impérativement être validé avant d'autoriser la <strong>Dépose (Put)</strong>.
            </p>

            <!-- Filters -->
            <div style="background-color: var(--bg-surface-subtle); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label for="filter-work-type" style="font-weight: 700; font-size: 12px;">Type de commande :</label>
                  <select id="filter-work-type" class="input-select" data-action="filter-work-type" style="font-size: 12px; padding: 4px 8px;">
                    <option value="ALL" ${activeType === 'ALL' ? 'selected' : ''}>Tous les types</option>
                    <option value="PO" ${activeType === 'PO' ? 'selected' : ''}>Rangement PO (Achat)</option>
                    <option value="SO" ${activeType === 'SO' ? 'selected' : ''}>Prélèvement SO (Vente)</option>
                    <option value="REPLEN" ${activeType === 'REPLEN' ? 'selected' : ''}>Réapprovisionnement</option>
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label for="filter-work-status" style="font-weight: 700; font-size: 12px;">Statut du travail :</label>
                  <select id="filter-work-status" class="input-select" data-action="filter-work-status" style="font-size: 12px; padding: 4px 8px;">
                    <option value="ALL" ${activeStatus === 'ALL' ? 'selected' : ''}>Tous les statuts</option>
                    <option value="Open" ${activeStatus === 'Open' ? 'selected' : ''}>Open (Ouvert)</option>
                    <option value="In progress" ${activeStatus === 'In progress' ? 'selected' : ''}>In progress (En cours)</option>
                    <option value="Closed" ${activeStatus === 'Closed' ? 'selected' : ''}>Closed (Clôturé)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Work Headers List -->
            ${filteredWorks.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-muted); font-style: italic; background-color: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                Aucun travail ne correspond aux filtres. Réceptionnez une commande d'achat ou lancez une commande client pour générer des travaux.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${filteredWorks.map(w => {
                  let statusBadgeClass = "badge-work-open";
                  if (w.status === "In progress") statusBadgeClass = "badge-work-inprogress";
                  else if (w.status === "Closed") statusBadgeClass = "badge-work-closed";

                  const template = (state.workTemplates || []).find(t => t.id === w.templateId);

                  return `
                    <div class="work-header-card">
                      <div class="work-header-head">
                        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
                          <span style="font-size: 15px; font-weight: 900; letter-spacing: -0.2px;">${w.id}</span>
                          <span class="badge badge-neutral">${w.orderType === 'PO' ? 'Achat (PO)' : (w.orderType === 'SO' ? 'Vente (SO)' : w.orderType)}</span>
                          <span style="font-size: 12px; color: var(--text-muted);">Réf : <strong>${w.ref}</strong></span>
                          <span style="font-size: 12px; color: var(--text-muted);">Modèle : <strong>${template ? template.name : w.templateId}</strong></span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-size: 12px; color: var(--text-muted);">${w.warehouse}</span>
                          <span class="badge ${statusBadgeClass}">${w.status}</span>
                        </div>
                      </div>

                      <div class="table-container" style="border: none; border-radius: 0;">
                        <table class="data-table">
                          <thead>
                            <tr>
                              <th style="width: 50px;">Ligne</th>
                              <th style="width: 100px;">Action</th>
                              <th>Article (SKU)</th>
                              <th style="text-align: right; width: 70px;">Qté</th>
                              <th>Plaque (LP)</th>
                              <th>Emplacement</th>
                              <th style="width: 90px;">Statut</th>
                              <th style="text-align: right; width: 170px;">Action opérateur</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${w.lines.map(line => {
                              const it = state.items.find(i => i.sku === line.sku);
                              const isPick = line.workType === "Pick";
                              const typeBadgeClass = isPick ? "badge-type-pick" : "badge-type-put";

                              // Check if line can be executed
                              let canExecute = false;
                              let disabledReason = "";
                              if (line.status === "Closed") {
                                canExecute = false;
                                disabledReason = "Terminé";
                              } else if (isPick) {
                                canExecute = true;
                              } else {
                                // Put line: check if paired pick is closed
                                const pairedPick = w.lines.find(l => l.lineNum === line.lineNum - 1 && l.workType === "Pick");
                                if (pairedPick && pairedPick.status === "Closed") {
                                  canExecute = true;
                                } else {
                                  canExecute = false;
                                  disabledReason = "En attente du Pick";
                                }
                              }

                              return `
                                <tr>
                                  <td class="num" style="font-weight: 700; color: var(--text-muted);">${line.lineNum}</td>
                                  <td><span class="badge ${typeBadgeClass}">${line.workType}</span></td>
                                  <td>
                                    <strong>${line.sku}</strong>
                                    <span style="font-size: 11px; color: var(--text-muted); margin-left: 4px;">${it ? it.name : ''}</span>
                                    ${line.directive ? `
                                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">
                                        ${getIcon("target")} <span style="font-style: italic;">${line.directive}</span>
                                      </div>
                                    ` : ''}
                                  </td>
                                  <td class="num" style="text-align: right; font-weight: 800;">${line.qty}</td>
                                  <td><span class="badge badge-lp">${line.licensePlate || 'N/A'}</span></td>
                                  <td>
                                    ${isPick ? `
                                      <span class="badge badge-neutral">${line.from}</span>
                                    ` : `
                                      ${line.to ? `<span class="badge badge-primary">${line.to}</span>` : `
                                        <select class="input-select" id="work-dest-${w.id}-${line.lineNum}" style="font-size: 11px; padding: 3px 6px;">
                                          ${state.locations.filter(l => !l.isDock).map(loc => `
                                            <option value="${loc.code}">${loc.code} (Zone ${loc.zone})</option>
                                          `).join('')}
                                        </select>
                                      `}
                                    `}
                                  </td>
                                  <td>
                                    <span class="badge ${line.status === 'Closed' ? 'badge-work-closed' : 'badge-work-open'}">${line.status}</span>
                                  </td>
                                  <td style="text-align: right;">
                                    ${line.status === "Closed" ? `
                                      <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Validé ${getIcon('check')}</span>
                                    ` : (canExecute ? `
                                      <button class="btn btn-primary btn-sm" 
                                              data-action="${isPick ? 'execute-work-pick' : 'execute-work-put'}" 
                                              data-work-id="${w.id}" 
                                              data-line-num="${line.lineNum}">
                                        ${isPick ? 'Prendre (Pick) →' : 'Déposer (Put) →'}
                                      </button>
                                    ` : `
                                      <span style="font-size: 11px; color: var(--text-subtle); font-style: italic;">${disabledReason}</span>
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
            `}
          </div>
        </div>
      `;
    }

    // 5. Stock View (D365 On-hand by Dimensions: Warehouse x Location x License Plate x Batch x Status)
    function renderStockView(state, uiState) {
      const activeWh = (uiState && uiState.stockFilterWarehouse) || "ALL";
      const activeStatus = (uiState && uiState.stockFilterStatus) || "ALL";

      // Filter stock rows
      const filteredStock = state.stock.filter(s => {
        if (activeWh !== "ALL" && s.warehouse !== activeWh) return false;
        if (activeStatus !== "ALL" && s.status !== activeStatus) return false;
        return true;
      });

      // KPI metrics
      const totalPhysical = filteredStock.reduce((sum, s) => sum + s.qty, 0);
      const totalReserved = filteredStock.reduce((sum, s) => sum + (s.reservedQty || 0), 0);
      const totalAvailable = filteredStock.reduce((sum, s) => sum + (s.status === "Disponible" ? Math.max(0, s.qty - (s.reservedQty || 0)) : 0), 0);
      const totalBlocked = filteredStock.reduce((sum, s) => sum + (s.status !== "Disponible" ? s.qty : 0), 0);
      const distinctLPs = new Set(filteredStock.map(s => s.licensePlate)).size;

      return `
        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-yellow);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted);">${getIcon("box")} Stock Physique Total</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #713f12;">${totalPhysical} <span style="font-size: 13px; font-weight: 700;">unités</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-mint);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #14532d;">${getIcon("check-circle")} Disponible à la vente</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #14532d;">${totalAvailable} <span style="font-size: 13px; font-weight: 700;">unités</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-blue);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0c4a6e;">${getIcon("clipboard")} Réservé (Commandes)</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #0c4a6e;">${totalReserved} <span style="font-size: 13px; font-weight: 700;">unités</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-coral);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #881337;">${getIcon("alert")} Bloqué / Contrôle</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #881337;">${totalBlocked} <span style="font-size: 13px; font-weight: 700;">unités</span></div>
          </div>
          <div class="card" style="padding: 12px 16px; margin: 0; background-color: var(--pastel-lavender);">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #4c1d95;">${getIcon("package")} Plaques (LP) Actives</div>
            <div class="num" style="font-size: 24px; font-weight: 900; color: #4c1d95;">${distinctLPs} <span style="font-size: 13px; font-weight: 700;">palettes</span></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("box")} Stock disponible par dimensions D365</span>
            <div>
              <button class="btn btn-danger btn-sm" data-action="reset-demo" title="Réinitialiser les données de l'entrepôt à l'état initial">
                ${getIcon("alert")} Réinitialiser les données de démo
              </button>
            </div>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Dans Dynamics 365, le stock disponible (On-hand) est suivi selon 7 dimensions clés : <strong>Article × Site × Entrepôt × Emplacement × License Plate (LP) × Lot × Statut d'inventaire</strong>.
            </p>

            <!-- Filter Controls -->
            <div style="background-color: var(--bg-surface-subtle); border: 2px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 16px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label for="filter-stock-wh" style="font-weight: 700; font-size: 12px;">Entrepôt :</label>
                  <select id="filter-stock-wh" class="input-select" data-action="filter-stock-wh" style="font-size: 12px; padding: 4px 8px;">
                    <option value="ALL" ${activeWh === 'ALL' ? 'selected' : ''}>Tous les entrepôts</option>
                    <option value="WH-MAIN" ${activeWh === 'WH-MAIN' ? 'selected' : ''}>WH-MAIN (Principal)</option>
                    <option value="WH-RETAIL" ${activeWh === 'WH-RETAIL' ? 'selected' : ''}>WH-RETAIL (Magasin)</option>
                  </select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label for="filter-stock-status" style="font-weight: 700; font-size: 12px;">Statut d'inventaire :</label>
                  <select id="filter-stock-status" class="input-select" data-action="filter-stock-status" style="font-size: 12px; padding: 4px 8px;">
                    <option value="ALL" ${activeStatus === 'ALL' ? 'selected' : ''}>Tous les statuts</option>
                    <option value="Disponible" ${activeStatus === 'Disponible' ? 'selected' : ''}>Disponible (Réservable)</option>
                    <option value="Bloqué" ${activeStatus === 'Bloqué' ? 'selected' : ''}>Bloqué (Qualité)</option>
                    <option value="Quarantaine" ${activeStatus === 'Quarantaine' ? 'selected' : ''}>Quarantaine</option>
                  </select>
                </div>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); font-weight: 700;">
                Lignes affichées : <strong>${filteredStock.length}</strong>
              </div>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Entrepôt</th>
                    <th>Emplacement</th>
                    <th>Plaque (License Plate)</th>
                    <th>Article (SKU)</th>
                    <th>Lot & DLUO (FEFO)</th>
                    <th>Statut</th>
                    <th style="text-align: right;">Physique</th>
                    <th style="text-align: right;">Réservé</th>
                    <th style="text-align: right;">Disponible</th>
                    <th style="text-align: center;">Action Statut</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredStock.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px; font-style: italic;">
                        Aucun stock ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  ` : filteredStock.map(s => {
                    const it = state.items.find(i => i.sku === s.sku);
                    const loc = state.locations.find(l => l.code === s.location);
                    const avail = s.status === "Disponible" ? Math.max(0, s.qty - (s.reservedQty || 0)) : 0;
                    const statusClass = s.status === "Disponible" ? "badge-status-disponible" : (s.status === "Bloqué" ? "badge-status-bloque" : "badge-status-quarantaine");
                    return `
                      <tr>
                        <td><span class="badge badge-neutral">${s.warehouse || 'WH-MAIN'}</span></td>
                        <td>
                          <strong>${s.location}</strong>
                          <div style="font-size: 10.5px; color: var(--text-muted);">${loc ? loc.type + ' / ' + loc.zone : ''}</div>
                        </td>
                        <td><span class="badge badge-lp">${s.licensePlate || 'N/A'}</span></td>
                        <td>
                          <strong>${s.sku}</strong>
                          <div style="font-size: 11px; color: var(--text-muted);">${it ? it.name : ''}</div>
                        </td>
                        <td>
                          ${s.batch ? `
                            <span class="badge badge-batch">${s.batch}</span>
                            <div style="font-size: 10px; color: var(--text-muted);">DLUO: ${s.expDate || '-'}</div>
                          ` : `<span style="color: var(--text-muted); font-size: 11px;">Sans lot</span>`}
                        </td>
                        <td><span class="badge ${statusClass}">${s.status || 'Disponible'}</span></td>
                        <td class="num" style="text-align: right; font-weight: 700;">${s.qty}</td>
                        <td class="num" style="text-align: right; color: var(--text-muted);">${s.reservedQty || 0}</td>
                        <td class="num" style="text-align: right; font-weight: 900; color: ${avail > 0 ? '#14532d' : '#881337'};">${avail}</td>
                        <td style="text-align: center;">
                          <button class="btn btn-secondary btn-sm" 
                                  style="padding: 3px 8px; font-size: 11px;"
                                  data-action="toggle-lp-status" 
                                  data-lp="${s.licensePlate}" 
                                  data-current-status="${s.status || 'Disponible'}"
                                  title="Basculer le statut d'inventaire de cette plaque">
                            ${s.status === 'Disponible' ? 'Bloquer' : 'Débloquer'}
                          </button>
                        </td>
                      </tr>
                    `;
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
      const selectedLocCode = uiState.selectedCountLoc || "A-01-01";
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

    // 7. Configuration View (D365 Setup: Location Directives, Profiles, Zones, Work Templates)
    function renderConfigView(state, uiState) {
      const activeTab = (uiState && uiState.configSubTab) || "directives";

      return `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${getIcon("settings")} Configuration Entrepôt WMS (D365 SCM Setup)</span>
          </div>
          <div class="card-body">
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              Configurez le paramétrage logistique de Dynamics 365 : les <strong>Directives d'emplacement (Location Directives)</strong> dictent où ranger ou prélever la marchandise, tandis que les <strong>Profils</strong> et <strong>Zones</strong> encadrent les capacités et contraintes physiques.
            </p>

            <div style="display: flex; flex-wrap: gap; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">
              <button class="btn ${activeTab === 'directives' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="config-subtab" data-subtab="directives">
                Directives d'emplacement (${(state.locationDirectives || []).length})
              </button>
              <button class="btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="config-subtab" data-subtab="templates">
                Modèles de travail (${(state.workTemplates || []).length})
              </button>
              <button class="btn ${activeTab === 'profiles' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="config-subtab" data-subtab="profiles">
                Profils d'emplacement (${D365_SETUP.locationProfiles.length})
              </button>
              <button class="btn ${activeTab === 'zones' ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="config-subtab" data-subtab="zones">
                Zones & Groupes (${D365_SETUP.zones.length})
              </button>
            </div>

            ${activeTab === 'directives' ? `
              <div>
                <div style="margin-bottom: 12px;">
                  <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase;">Directives d'emplacement (Location Directives)</h3>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    Règles exécutées par ordre de séquence croissante. Vous pouvez modifier la priorité (Monter/Descendre) pour changer où va le rangement !
                  </div>
                </div>

                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th style="width: 70px;">Séquence</th>
                        <th style="width: 100px;">ID</th>
                        <th>Nom de la directive</th>
                        <th style="width: 90px;">Type</th>
                        <th style="width: 90px;">Flux</th>
                        <th>Zone cible</th>
                        <th>Stratégie</th>
                        <th>Explication générée</th>
                        <th style="text-align: right; width: 140px;">Priorité</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(state.locationDirectives || []).sort((a, b) => a.sequence - b.sequence).map((d, dIdx, arr) => `
                        <tr>
                          <td class="num" style="font-weight: 900; font-size: 13px; color: var(--primary);">${d.sequence}</td>
                          <td><strong>${d.id}</strong></td>
                          <td>${d.name}</td>
                          <td><span class="badge ${d.workType === 'Put' ? 'badge-type-put' : 'badge-type-pick'}">${d.workType}</span></td>
                          <td><span class="badge badge-neutral">${d.orderType}</span></td>
                          <td><span class="badge badge-primary">${d.targetZone}</span></td>
                          <td style="font-size: 11px; font-weight: 600;">${d.strategy}</td>
                          <td style="font-size: 11px; color: var(--text-muted); font-style: italic;">${d.description}</td>
                          <td style="text-align: right;">
                            <div style="display: inline-flex; gap: 4px;">
                              <button class="btn btn-secondary btn-sm" 
                                      style="padding: 2px 6px; font-size: 10px;"
                                      data-action="move-directive-up" 
                                      data-directive-id="${d.id}"
                                      ${dIdx === 0 ? 'disabled' : ''}
                                      title="Augmenter la priorité">
                                ▲ Haut
                              </button>
                              <button class="btn btn-secondary btn-sm" 
                                      style="padding: 2px 6px; font-size: 10px;"
                                      data-action="move-directive-down" 
                                      data-directive-id="${d.id}"
                                      ${dIdx === arr.length - 1 ? 'disabled' : ''}
                                      title="Diminuer la priorité">
                                ▼ Bas
                              </button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            ${activeTab === 'templates' ? `
              <div>
                <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">Modèles de travail (Work Templates)</h3>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>ID Modèle</th>
                        <th>Nom du modèle</th>
                        <th>Type d'ordre</th>
                        <th>Étapes configurées</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(state.workTemplates || []).map(wt => `
                        <tr>
                          <td><strong>${wt.id}</strong></td>
                          <td>${wt.name}</td>
                          <td><span class="badge badge-neutral">${wt.orderType}</span></td>
                          <td>
                            ${wt.steps.map(s => `<span class="badge ${s === 'Pick' ? 'badge-type-pick' : 'badge-type-put'}" style="margin-right: 4px;">${s}</span>`).join(' → ')}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            ${activeTab === 'profiles' ? `
              <div>
                <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">Profils d'emplacement (Location Profiles)</h3>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>ID Profil</th>
                        <th>Désignation</th>
                        <th>Articles mélangés</th>
                        <th>Plaque LP requise</th>
                        <th>Méthode de capacité</th>
                        <th style="text-align: right;">Capacité max</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${D365_SETUP.locationProfiles.map(lp => `
                        <tr>
                          <td><strong>${lp.id}</strong></td>
                          <td>${lp.name}</td>
                          <td>${lp.allowMixedItems ? '<span class="badge badge-success">Oui</span>' : '<span class="badge badge-warning">Non</span>'}</td>
                          <td>${lp.requireLP ? '<span class="badge badge-primary">Oui (LP)</span>' : '<span class="badge badge-neutral">Non</span>'}</td>
                          <td>${lp.capacityType}</td>
                          <td class="num" style="text-align: right; font-weight: 700;">${lp.maxCapacity || 'Illimité'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            ${activeTab === 'zones' ? `
              <div>
                <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">Zones et Groupes de zones</h3>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Code Zone</th>
                        <th>Nom de la zone</th>
                        <th>Groupe de zones</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${D365_SETUP.zones.map(z => `
                        <tr>
                          <td><strong>${z.id}</strong></td>
                          <td>${z.name}</td>
                          <td><span class="badge badge-neutral">${z.group}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
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

      const openWorks = (warehouseState.works || []).filter(w => w.status !== "Closed").length;
      const badgeTravaux = document.getElementById("badge-travaux-count");
      if (badgeTravaux) badgeTravaux.textContent = openWorks;

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
          viewHtml += renderExpeditionView(warehouseState, uiState);
          break;
        case "travaux":
          viewHtml += renderTravauxView(warehouseState, uiState);
          break;
        case "stock":
          viewHtml += renderStockView(warehouseState, uiState);
          break;
        case "config":
          viewHtml += renderConfigView(warehouseState, uiState);
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

      // Sync active warehouse select in header if present
      const whSelect = document.getElementById("select-active-warehouse");
      if (whSelect && whSelect.value !== uiState.activeWarehouse) {
        whSelect.value = uiState.activeWarehouse;
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
    const STORAGE_KEY_TEXT_SCALE = "stockroom_text_scale_v1";

    let warehouseState = createFreshWarehouseState();
    let trainingState = createFreshTrainingState();
    let uiState = {
      activeTab: "formation",
      activeWarehouse: "WH-MAIN",
      workFilterType: "ALL",
      workFilterStatus: "ALL",
      stockFilterWarehouse: "ALL",
      stockFilterStatus: "ALL",
      banner: null, // { type: 'danger'|'success'|'info', message: '' }
      selectedCountLoc: "A-01-01",
      expedSubTab: "waves",
      configSubTab: "directives",
      mobileMenuOpen: false
    };

    function toggleMobileMenu() {
      uiState.mobileMenuOpen = !uiState.mobileMenuOpen;
      applyMobileMenuState();
    }

    function closeMobileMenu() {
      if (uiState.mobileMenuOpen) {
        uiState.mobileMenuOpen = false;
        applyMobileMenuState();
      }
    }

    function applyMobileMenuState() {
      const navContainer = document.querySelector(".nav-bar-container");
      const backdrop = document.getElementById("menu-backdrop");
      const btn = document.getElementById("btn-hamburger");
      const iconMenu = btn ? btn.querySelector(".icon-hamburger") : null;
      const iconClose = btn ? btn.querySelector(".icon-close") : null;
      const label = btn ? btn.querySelector(".hamburger-label") : null;

      if (navContainer) {
        if (uiState.mobileMenuOpen) {
          navContainer.classList.add("menu-open");
        } else {
          navContainer.classList.remove("menu-open");
        }
      }

      if (backdrop) {
        if (uiState.mobileMenuOpen) {
          backdrop.classList.add("menu-open");
        } else {
          backdrop.classList.remove("menu-open");
        }
      }

      if (btn) {
        btn.setAttribute("aria-expanded", String(uiState.mobileMenuOpen));
        if (iconMenu && iconClose) {
          iconMenu.style.display = uiState.mobileMenuOpen ? "none" : "inline-block";
          iconClose.style.display = uiState.mobileMenuOpen ? "inline-block" : "none";
        }
        if (label) {
          label.textContent = uiState.mobileMenuOpen ? "Fermer" : "Menu";
        }
      }
    }

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

      if (action === "toggle-mobile-menu") {
        toggleMobileMenu();
        return;
      }

      if (action === "close-mobile-menu") {
        closeMobileMenu();
        return;
      }

      if (action === "trigger-self-tests") {
        closeMobileMenu();
        runSelfTests();
        return;
      }

      if (action === "nav-tab") {
        closeMobileMenu();
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

      if (action === "exped-subtab") {
        uiState.expedSubTab = target.getAttribute("data-subtab");
        renderApp();
        return;
      }

      if (action === "create-new-wave") {
        createNewWave(warehouseState);
        saveState();
        showBanner("success", "Nouvelle vague créée.");
        renderApp();
        return;
      }

      if (action === "process-wave") {
        const waveId = target.getAttribute("data-wave-id");
        const res = processWave(warehouseState, waveId);
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

      if (action === "add-shipment-wave") {
        const waveId = target.getAttribute("data-wave-id");
        const select = document.getElementById(`select-shp-${waveId}`);
        const shpId = select ? select.value : "";
        if (shpId) {
          const res = addShipmentToWave(warehouseState, shpId, waveId);
          if (res.error) {
            showBanner("danger", res.error);
          } else {
            saveState();
          }
          renderApp();
        }
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

      if (action === "toggle-lp-status") {
        const lp = target.getAttribute("data-lp");
        const currentStatus = target.getAttribute("data-current-status");
        const nextStatus = currentStatus === "Disponible" ? "Bloqué" : "Disponible";
        const res = changeInventoryStatus(warehouseState, lp, nextStatus);
        if (res.error) {
          showBanner("danger", res.error);
        } else {
          showBanner("info", `Plaque d'immatriculation ${lp} passée au statut "${nextStatus}".`);
          saveState();
        }
        renderApp();
        return;
      }

      if (action === "execute-work-pick") {
        const workId = target.getAttribute("data-work-id");
        const lineNum = Number(target.getAttribute("data-line-num"));
        const res = executeWorkLine(warehouseState, workId, lineNum);
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

      if (action === "execute-work-put") {
        const workId = target.getAttribute("data-work-id");
        const lineNum = Number(target.getAttribute("data-line-num"));
        const select = document.getElementById(`work-dest-${workId}-${lineNum}`);
        const chosenDest = select ? select.value : "";
        const res = executeWorkLine(warehouseState, workId, lineNum, chosenDest);
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

      if (action === "config-subtab") {
        uiState.configSubTab = target.getAttribute("data-subtab");
        renderApp();
        return;
      }

      if (action === "move-directive-up" || action === "move-directive-down") {
        const dirId = target.getAttribute("data-directive-id");
        const dirs = warehouseState.locationDirectives || [];
        dirs.sort((a, b) => a.sequence - b.sequence);
        const idx = dirs.findIndex(d => d.id === dirId);
        if (idx !== -1) {
          const swapIdx = action === "move-directive-up" ? idx - 1 : idx + 1;
          if (swapIdx >= 0 && swapIdx < dirs.length) {
            const tempSeq = dirs[idx].sequence;
            dirs[idx].sequence = dirs[swapIdx].sequence;
            dirs[swapIdx].sequence = tempSeq;
            dirs.sort((a, b) => a.sequence - b.sequence);
            saveState();
            showBanner("info", `Ordre de la directive ${dirId} modifié.`);
            renderApp();
          }
        }
        return;
      }
    });

    document.addEventListener("change", function(e) {
      const target = e.target;
      const action = target.getAttribute("data-action");

      if (action === "switch-warehouse") {
        uiState.activeWarehouse = target.value;
        showBanner("info", `Entrepôt actif sélectionné : ${target.value}`);
        renderApp();
        return;
      }

      if (action === "filter-stock-wh") {
        uiState.stockFilterWarehouse = target.value;
        renderApp();
        return;
      }

      if (action === "filter-stock-status") {
        uiState.stockFilterStatus = target.value;
        renderApp();
        return;
      }

      if (action === "filter-work-type") {
        uiState.workFilterType = target.value;
        renderApp();
        return;
      }

      if (action === "filter-work-status") {
        uiState.workFilterStatus = target.value;
        renderApp();
        return;
      }

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

    // Close mobile menu on Escape key
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && uiState.mobileMenuOpen) {
        closeMobileMenu();
      }
    });

    // Close mobile menu if resized to desktop viewport
    window.addEventListener("resize", function() {
      if (window.innerWidth > 768 && uiState.mobileMenuOpen) {
        closeMobileMenu();
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
        // Zone BULK locations: A-01-01 (120/200, free 80), A-01-02 (60/200, free 140).
        // Both hold CAF-1KG. Free space: A-01-02 has 140, A-01-01 has 80.
        // Sorted candidate list: A-01-02 (free 140) then A-01-01 (free 80).
        // Total tasks created should sum to 150 and split across A-01-02 and A-01-01.
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
        // Seed stock for CAF-1KG: A-01-01 has 120, A-01-02 has 60.
        // SO-2001 orders 40 CAF-1KG.
        // Least-filled location holding CAF-1KG is A-01-02 (60 < 120).
        releaseOrder(st2, "SO-2001");
        const so1 = st2.salesOrders.find(s => s.id === "SO-2001");
        assert("Release order : statut devient 'released'", so1.status === "released");

        const coffeePick = st2.tasks.find(t => t.ref === "SO-2001" && t.type === "pick" && t.sku === "CAF-1KG");
        assert("Release allocation : prélèvement depuis l'emplacement le moins rempli / FEFO (A-01-02)", coffeePick && coffeePick.from === "A-01-02" && coffeePick.qty === 40);

        // SO-2003 asks for 100 CHO-500, but only 80 exist in A-02-01.
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

      // TEST SUITE 4: D365 Dimensions & Inventory Status Rules
      try {
        const st4 = createFreshWarehouseState();
        // 1. All stock lines have valid LP format
        const allHaveLp = st4.stock.every(s => typeof s.licensePlate === "string" && s.licensePlate.startsWith("LP-"));
        assert("License Plates : tous les enregistrements de stock possèdent un numéro LP", allHaveLp);

        // 2. Blocked stock cannot be allocated/reserved
        // Block LP-1002 (CAF-1KG 60 units in A-01-02)
        changeInventoryStatus(st4, "LP-1002", "Bloqué");
        const lp2Stock = st4.stock.find(s => s.licensePlate === "LP-1002");
        assert("Statut de stock : LP-1002 passe au statut 'Bloqué'", lp2Stock && lp2Stock.status === "Bloqué");

        // Release SO-2001 (needs 40 CAF-1KG)
        // A-01-02 is blocked, so engine MUST allocate from available A-01-01 instead!
        releaseOrder(st4, "SO-2001");
        const pickTask = st4.tasks.find(t => t.ref === "SO-2001" && t.type === "pick" && t.sku === "CAF-1KG");
        assert("Règle D365 : le stock 'Bloqué' est exclu des prélèvements (reporté sur A-01-01)", pickTask && pickTask.from === "A-01-01");
      } catch (err) {
        assert("Suite 4 exception", false, err.message);
      }

      // TEST SUITE 5: D365 Work Engine & Pick/Put Sequence
      try {
        const st5 = createFreshWarehouseState();
        // 1. Receive PO-1001 generates Work Header with paired Pick and Put lines
        receive(st5, "PO-1001", 0, 150);
        const poWork = (st5.works || []).find(w => w.ref === "PO-1001" && w.orderType === "PO");
        assert("Work PO : création d'un en-tête de travail pour la réception", !!poWork);
        assert("Work PO : modèle WT-PO-PUT appliqué", poWork && poWork.templateId === "WT-PO-PUT");
        assert("Work PO : contient des paires de lignes Pick et Put", poWork && poWork.lines.length >= 2);

        // Verify pairing and sequence rule: Put cannot be executed while Pick is Open
        const firstPut = poWork.lines.find(l => l.workType === "Put");
        const putAttemptBeforePick = executeWorkLine(st5, poWork.id, firstPut.lineNum, "A-01-01");
        assert("Règle D365 : exécution Put refusée tant que le Pick n'est pas clôturé", !!putAttemptBeforePick.error);

        // Execute Pick line (lineNum 1)
        const pickRes = executeWorkLine(st5, poWork.id, 1);
        assert("Règle D365 : exécution du Pick réussie (lineNum 1)", !pickRes.error);
        assert("Work statut : passe à 'In progress' après le premier Pick", poWork.status === "In progress");

        // Now execute Put line (lineNum 2)
        const putRes = executeWorkLine(st5, poWork.id, 2, "A-01-02");
        assert("Règle D365 : exécution du Put autorisée après clôture du Pick", !putRes.error);

        // SO Work verification
        releaseOrder(st5, "SO-2001");
        const soWork = (st5.works || []).find(w => w.ref === "SO-2001" && w.orderType === "SO");
        assert("Work SO : création d'un travail de prélèvement pour SO-2001 (WT-SO-PICK)", soWork && soWork.templateId === "WT-SO-PICK");
      } catch (err) {
        assert("Suite 5 exception", false, err.message);
      }

      // TEST SUITE 6: D365 Location Directives
      try {
        const st6 = createFreshWarehouseState();
        // 1. Directives exist in setup
        assert("Location Directives : présence des directives Put et Pick", (st6.locationDirectives || []).length >= 3);

        // 2. Directive matching returns correct directive by sequence
        const dir = findLocationDirective(st6, "PO", "Put", "WH-MAIN");
        assert("Location Directives : résolution de la première directive active (séquence 10)", dir && dir.sequence === 10);

        // 3. Work lines include directive explanation
        receive(st6, "PO-1001", 0, 50);
        const poWork = (st6.works || []).find(w => w.ref === "PO-1001");
        const putLine = poWork && poWork.lines.find(l => l.workType === "Put");
        assert("Location Directives : explication de directive affichée sur la ligne de travail", putLine && typeof putLine.directive === "string" && putLine.directive.includes("Directive"));

        // 4. Modifying directive sequence changes target zone behavior
        const dirPickZone = st6.locationDirectives.find(d => d.id === "DIR-PUT-02");
        if (dirPickZone) dirPickZone.sequence = 5;
        st6.locationDirectives.sort((a, b) => a.sequence - b.sequence);

        const newFirstDir = findLocationDirective(st6, "PO", "Put", "WH-MAIN");
        assert("Location Directives : la modification de séquence change la directive prioritaire", newFirstDir && newFirstDir.id === "DIR-PUT-02");
      } catch (err) {
        assert("Suite 6 exception", false, err.message);
      }

      // TEST SUITE 7: D365 Outbound Flow (Loads, Shipments, Waves)
      try {
        const st7 = createFreshWarehouseState();
        // 1. Initial Outbound records exist
        assert("Outbound Model : présence des chargements (Loads) et expéditions (Shipments)", (st7.loads || []).length >= 3 && (st7.shipments || []).length >= 3);
        assert("Outbound Model : présence des vagues (Waves)", (st7.waves || []).length >= 1);

        // 2. Wave Processing executes and releases SO
        const wave = st7.waves[0];
        assert("Wave status initial : 'Created'", wave.status === "Created");
        const procRes = processWave(st7, wave.id);
        assert("Wave process : exécution de la vague réussie", !procRes.error);
        assert("Wave status final : 'Executed'", wave.status === "Executed");

        // 3. SO-2001 is now released through wave
        const so1 = st7.salesOrders.find(s => s.id === "SO-2001");
        assert("Wave release : la commande SO-2001 est passée au statut 'released'", so1 && so1.status === "released");

        // 4. Picking work orders created for wave
        const soWorks = (st7.works || []).filter(w => w.ref === "SO-2001");
        assert("Wave work : travaux de prélèvement créés pour la vague", soWorks.length > 0);
      } catch (err) {
        assert("Suite 7 exception", false, err.message);
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
      // 1. Text Scale restoration & theme cleanup
      try {
        localStorage.removeItem("stockroom_theme_v1");
        document.documentElement.removeAttribute("data-theme");
      } catch (e) {}

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

      // 2. Warehouse state restoration & D365 migration
      try {
        const rawW = localStorage.getItem(STORAGE_KEY_WAREHOUSE);
        if (rawW) {
          warehouseState = migrateWarehouseState(JSON.parse(rawW));
        } else {
          warehouseState = createFreshWarehouseState();
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

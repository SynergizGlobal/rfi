import localforage from "localforage";

// ✅ Offline inspections storage (selfie, gallery images, test documents)
const inspectionsDB = localforage.createInstance({
    name: "rfi-offline-storage",
    storeName: "offlineInspections"
});

// ✅ Offline enclosures storage (separate table)
const enclosuresDB = localforage.createInstance({
    name: "rfi-offline-storage",
    storeName: "offlineEnclosures"
});

// ----- INSPECTIONS -----
export const saveOfflineInspection = async (inspection) => {
    const id = inspection.rfiId; // ✅ use rfiId as the key
    if (!id) throw new Error("Missing rfiId in inspection");
    await inspectionsDB.setItem(String(id), inspection);
};


export const getOfflineInspection = async (id) => {
    return await inspectionsDB.getItem(String(id));
};

export const getAllOfflineInspections = async () => {
    const inspections = [];
    await inspectionsDB.iterate((value) => inspections.push(value));
    return inspections;
};

export const removeOfflineInspection = async (rfiId) => {
    await inspectionsDB.removeItem(String(rfiId));
};

// ----- ENCLOSURES -----

// ✅ Save enclosure as flat record instead of nested under RFI
export const saveOfflineEnclosure = async (rfiId, newEnclosure) => {
    const key = `enclosure-${rfiId}`;

    // Get existing enclosures for this RFI
    const existing = (await enclosuresDB.getItem(key)) || [];

    // Just push new enclosure — no ID required
    existing.push({ ...newEnclosure, rfiId });

    // Save back to storage
    await enclosuresDB.setItem(key, existing);
    console.log(`📌 Saved enclosure offline for RFI ${rfiId}`, existing);
};

export const getAllOfflineEnclosures = async () => {
    const enclosures = [];
    await enclosuresDB.iterate((value) => {
        // ✅ Just push the object, no spread needed
        enclosures.push(...(Array.isArray(value) ? value : [value]));
    });
    return enclosures;
};


// ✅ Get enclosures for specific RFI
export const getOfflineEnclosures = async (rfiId) => {
    const key = `enclosure-${rfiId}`;
    return (await enclosuresDB.getItem(key)) || [];
};

export const removeOfflineEnclosure = async (rfiId, file) => {
    const key = `enclosure-${rfiId}`;
    const existing = (await enclosuresDB.getItem(key)) || [];

    const updated = existing.filter(e => e.file !== file);

    if (updated.length === 0) {
        await enclosuresDB.removeItem(key);
    } else {
        await enclosuresDB.setItem(key, updated);
    }
};


export const clearOfflineEnclosures = async (rfiId) => {
    const key = `enclosure-${rfiId}`;
    await enclosuresDB.removeItem(key);
};

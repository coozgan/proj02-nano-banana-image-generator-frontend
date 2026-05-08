import type { GeneratedImage } from "../types";
import type { Settings } from "../components/SettingsPanel";

const DB_NAME = "nano-banana";
const DB_VERSION = 1;
const STORE = "generations";
const INDEX_TIMESTAMP = "by_timestamp";

export interface HistoryRecord {
  id: string;
  mime_type: string;
  data_base64: string;
  text?: string;
  prompt: string;
  negative_prompt?: string;
  settings: Settings;
  model?: string;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex(INDEX_TIMESTAMP, "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });

  return dbPromise;
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function addRecord(record: HistoryRecord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  return new Promise((resolve) => {
    const req = tx(db, "readwrite").put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function getCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  return new Promise((resolve) => {
    const req = tx(db, "readonly").count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
}

export async function getPage(offset: number, limit: number): Promise<HistoryRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return new Promise((resolve) => {
    const out: HistoryRecord[] = [];
    let skipped = 0;
    const req = tx(db, "readonly").index(INDEX_TIMESTAMP).openCursor(null, "prev");
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(out);
        return;
      }
      if (skipped < offset) {
        skipped += 1;
        cursor.continue();
        return;
      }
      out.push(cursor.value as HistoryRecord);
      if (out.length >= limit) {
        resolve(out);
        return;
      }
      cursor.continue();
    };
    req.onerror = () => resolve(out);
  });
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  return new Promise((resolve) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function clearAll(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  return new Promise((resolve) => {
    const req = tx(db, "readwrite").clear();
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export function recordFromImage(
  image: GeneratedImage,
  prompt: string,
  settings: Settings,
  model?: string,
  negativePrompt?: string
): HistoryRecord {
  return {
    id: crypto.randomUUID(),
    mime_type: image.mime_type,
    data_base64: image.data_base64,
    text: image.text,
    prompt,
    negative_prompt: negativePrompt || undefined,
    settings,
    model,
    timestamp: Date.now(),
  };
}

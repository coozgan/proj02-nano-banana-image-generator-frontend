import { useCallback, useEffect, useRef, useState } from "react";
import {
  addRecord,
  clearAll,
  deleteRecord,
  getCount,
  getPage,
  type HistoryRecord,
} from "../lib/historyDb";
import type { GalleryItem } from "../types";

const INITIAL_PAGE_SIZE = 3;
const NEXT_PAGE_SIZE = 10;

function recordToGalleryItem(r: HistoryRecord): GalleryItem {
  return {
    id: r.id,
    image: { mime_type: r.mime_type, data_base64: r.data_base64, text: r.text },
    prompt: r.prompt,
    timestamp: new Date(r.timestamp),
  };
}

export function useGenerationHistory() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const itemCountRef = useRef(0);
  itemCountRef.current = items.length;

  const refreshTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    const [page, count] = await Promise.all([getPage(0, INITIAL_PAGE_SIZE), getCount()]);
    setItems(page.map(recordToGalleryItem));
    setTotal(count);
    setLoading(false);
  }, []);

  useEffect(() => {
    void initialLoad();
  }, [initialLoad]);

  const refresh = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      const limit = Math.max(itemCountRef.current, INITIAL_PAGE_SIZE);
      const [page, count] = await Promise.all([getPage(0, limit), getCount()]);
      setItems(page.map(recordToGalleryItem));
      setTotal(count);
    }, 50);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const offset = itemCountRef.current;
    const next = await getPage(offset, NEXT_PAGE_SIZE);
    setItems((prev) => [...prev, ...next.map(recordToGalleryItem)]);
    setLoadingMore(false);
  }, [loadingMore]);

  const remove = useCallback(async (id: string) => {
    await deleteRecord(id);
    refresh();
  }, [refresh]);

  const clearHistory = useCallback(async () => {
    await clearAll();
    setItems([]);
    setTotal(0);
  }, []);

  const persist = useCallback(async (record: HistoryRecord) => {
    await addRecord(record);
    refresh();
  }, [refresh]);

  return {
    items,
    total,
    loading,
    loadingMore,
    hasMore: items.length < total,
    loadMore,
    refresh,
    remove,
    clearHistory,
    persist,
  };
}

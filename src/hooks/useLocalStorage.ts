"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEBOUNCE_MS } from "@/lib/constants";
import { readStorage, writeStorage } from "@/lib/storage";
import type { NotepadData } from "@/types";

export function useLocalStorage() {
  const [data, setData] = useState<NotepadData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = readStorage();
    setData(stored);
    setLoaded(true);
  }, []);

  const save = useCallback((content: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const updated: NotepadData = {
        content,
        updatedAt: new Date().toISOString(),
      };
      const success = writeStorage(updated);
      if (success) setData(updated);
    }, DEBOUNCE_MS);
  }, []);

  return { data, loaded, save };
}

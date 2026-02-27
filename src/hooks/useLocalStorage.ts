"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { DEBOUNCE_MS } from "@/lib/constants";
import { readStorage, writeStorage } from "@/lib/storage";
import type { NotepadData } from "@/types";

let cachedData: NotepadData | null = null;
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): NotepadData | null {
  if (cachedData === null && typeof window !== "undefined") {
    cachedData = readStorage();
  }
  return cachedData;
}

function getServerSnapshot(): NotepadData | null {
  return null;
}

function emitChange(next: NotepadData) {
  cachedData = next;
  for (const listener of listeners) {
    listener();
  }
}

export function useLocalStorage() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
      if (success) emitChange(updated);
    }, DEBOUNCE_MS);
  }, []);

  return { data, loaded, save };
}

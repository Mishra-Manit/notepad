"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Tab } from "@/types";
import { DEBOUNCE_MS, NOTEPADS_KEY } from "@/lib/constants";

interface NotepadsState {
  tabs: Tab[];
  activeId: string;
  contents: Record<string, string>;
  renamingId: string | null;
}

const DEFAULT_STATE: NotepadsState = {
  tabs: [{ id: "main", label: "main" }],
  activeId: "main",
  contents: {},
  renamingId: null,
};

function readState(): NotepadsState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(NOTEPADS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<NotepadsState>;
    return {
      tabs: parsed.tabs ?? DEFAULT_STATE.tabs,
      activeId: parsed.activeId ?? DEFAULT_STATE.activeId,
      contents: parsed.contents ?? {},
      renamingId: null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function persistState(state: NotepadsState): boolean {
  if (typeof window === "undefined") return false;
  try {
    const { tabs, activeId, contents } = state;
    localStorage.setItem(NOTEPADS_KEY, JSON.stringify({ tabs, activeId, contents }));
    return true;
  } catch {
    return false;
  }
}

export function useNotepads() {
  const [state, setState] = useState<NotepadsState & { loaded: boolean }>({
    ...DEFAULT_STATE,
    loaded: false,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(state);

  useEffect(() => {
    latestRef.current = state;
  });

  useEffect(() => {
    setState({ ...readState(), loaded: true }); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        persistState(latestRef.current);
      }
    };
  }, []);

  const saveContent = useCallback((html: string) => {
    setState((prev) => ({
      ...prev,
      contents: { ...prev.contents, [prev.activeId]: html },
    }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => persistState(latestRef.current),
      DEBOUNCE_MS
    );
  }, []);

  const selectTab = useCallback((id: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setState((prev) => {
      const next = { ...prev, activeId: id, renamingId: null };
      persistState(next);
      return next;
    });
  }, []);

  const renameTab = useCallback((id: string, label: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        tabs: prev.tabs.map((t) => (t.id === id ? { ...t, label } : t)),
        renamingId: null,
      };
      persistState(next);
      return next;
    });
  }, []);

  const addTab = useCallback(() => {
    const id = `t_${Date.now()}`;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setState((prev) => {
      const next = {
        ...prev,
        tabs: [...prev.tabs, { id, label: "untitled" }],
        activeId: id,
        renamingId: id,
      };
      persistState(next);
      return next;
    });
  }, []);

  const deleteTab = useCallback((id: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setState((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === id);
      const nextId =
        prev.tabs[idx + 1]?.id ?? prev.tabs[idx - 1]?.id ?? prev.tabs[0].id;
      const contents = Object.fromEntries(
        Object.entries(prev.contents).filter(([k]) => k !== id)
      );
      const next = {
        ...prev,
        tabs: prev.tabs.filter((t) => t.id !== id),
        activeId: nextId,
        contents,
        renamingId: null,
      };
      persistState(next);
      return next;
    });
  }, []);

  const clearActiveTab = useCallback(() => saveContent(""), [saveContent]);

  return {
    ...state,
    saveContent,
    selectTab,
    renameTab,
    addTab,
    deleteTab,
    clearActiveTab,
  };
}

"use client";

import { useCallback, useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";

import { Editor } from "@/components/Editor";
import { StorageWarning } from "@/components/StorageWarning";
import { TabBar } from "@/components/TabBar";
import { useNotepads } from "@/hooks/useNotepads";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { NOTEPADS_KEY, STORAGE_WARNING_BYTES } from "@/lib/constants";

export function NotepadApp() {
  const {
    tabs,
    activeId,
    contents,
    renamingId,
    loaded,
    saveContent,
    selectTab,
    addTab,
    deleteTab,
    renameTab,
    clearActiveTab,
  } = useNotepads();

  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [storageSize, setStorageSize] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const updateSize = useCallback(() => {
    if (typeof window !== "undefined") {
      setStorageSize(
        new Blob([localStorage.getItem(NOTEPADS_KEY) ?? ""]).size
      );
    }
  }, []);

  const handleUpdate = useCallback(
    (html: string) => {
      saveContent(html);
      updateSize();
      if (editor) {
        setCharCount(editor.getText({ blockSeparator: "" }).length);
      }
    },
    [saveContent, updateSize, editor]
  );

  const handleEditorReady = useCallback(
    (e: TiptapEditor | null) => {
      setEditor(e);
      updateSize();
      if (e) {
        setCharCount(e.getText({ blockSeparator: "" }).length);
      }
    },
    [updateSize]
  );

  const handleClearAll = useCallback(() => setShowClearDialog(true), []);

  const confirmClear = useCallback(() => {
    clearActiveTab();
    if (editor) editor.commands.clearContent();
    setShowClearDialog(false);
    setStorageSize(0);
    setCharCount(0);
  }, [clearActiveTab, editor]);

  useKeyboardShortcuts({ editor, onClearAll: handleClearAll });

  const activeLabel = tabs.find((t) => t.id === activeId)?.label ?? "";

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background px-4 py-12 sm:py-16 md:py-20">
      {/* Tab bar */}
      <div className="w-full max-w-[55rem]">
        <TabBar
          tabs={tabs}
          activeId={activeId}
          renamingId={renamingId}
          onSelect={selectTab}
          onAdd={addTab}
          onDelete={deleteTab}
          onRename={renameTab}
        />
      </div>

      {/* Editor card */}
      <div
        className="w-full max-w-[55rem] rounded-lg border border-border bg-surface
          shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.4)]
          transition-shadow duration-150"
      >
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <Editor
            key={activeId}
            content={contents[activeId] ?? ""}
            onUpdate={handleUpdate}
            onEditorReady={handleEditorReady}
          />
        </div>
      </div>

      {/* Character count indicator */}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted">
        <span>{charCount.toLocaleString()} chars</span>
        <span className="text-border-hover">·</span>
        <span className="text-muted/70">
          {charCount > 0 ? "Saved" : "Ready to save"}
        </span>
      </div>

      {/* Storage warning */}
      {storageSize > STORAGE_WARNING_BYTES && (
        <StorageWarning sizeBytes={storageSize} />
      )}

      {/* Clear confirmation dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="mx-4 w-full max-w-sm rounded-lg border border-border bg-surface
              p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-base font-semibold text-foreground">
              Clear {activeLabel}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This will permanently delete all content in this tab. This
              action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowClearDialog(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted
                  transition-colors duration-150 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="rounded-md bg-red-600/90 px-4 py-2 text-sm font-medium
                  text-white transition-colors duration-150 hover:bg-red-600"
              >
                Clear tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

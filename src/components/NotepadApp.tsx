"use client";

import { useCallback, useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";

import { Editor } from "@/components/Editor";
import { StorageWarning } from "@/components/StorageWarning";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { clearStorage, getStorageSizeBytes } from "@/lib/storage";
import { STORAGE_WARNING_BYTES } from "@/lib/constants";

export function NotepadApp() {
  const { data, loaded, save } = useLocalStorage();
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [storageSize, setStorageSize] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleUpdate = useCallback(
    (html: string) => {
      save(html);
      setStorageSize(getStorageSizeBytes());
      if (editor) {
        setCharCount(editor.getText({ blockSeparator: '' }).length);
      }
    },
    [save, editor]
  );

  const handleEditorReady = useCallback((e: TiptapEditor | null) => {
    setEditor(e);
    setStorageSize(getStorageSizeBytes());
    if (e) {
      setCharCount(e.getText({ blockSeparator: '' }).length);
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const confirmClear = useCallback(() => {
    clearStorage();
    if (editor) {
      editor.commands.clearContent();
    }
    setShowClearDialog(false);
    setStorageSize(0);
    setCharCount(0);
  }, [editor]);

  useKeyboardShortcuts({ editor, onClearAll: handleClearAll });

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background px-4 py-12 sm:py-16 md:py-20">
      {/* Editor card */}
      <div
        className="w-full max-w-[55rem] rounded-lg border border-border bg-surface
          shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_4px_24px_rgba(0,0,0,0.4)]
          transition-shadow duration-150"
      >
        <div
          className="px-6 py-8 sm:px-8 sm:py-10 cursor-text"
          onClick={(e) => {
            if (e.target === e.currentTarget && editor) {
              editor.commands.focus("end");
            }
          }}
        >
          <Editor
            content={data?.content ?? ""}
            onUpdate={handleUpdate}
            onEditorReady={handleEditorReady}
          />
        </div>
      </div>

      {/* Character count indicator */}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted">
        <span>{charCount.toLocaleString()} chars</span>
        <span className="text-border-hover">·</span>
        <span className="text-muted/70">{charCount > 0 ? "Saved" : "Ready to save"}</span>
      </div>

      {/* Storage warning */}
      {storageSize > STORAGE_WARNING_BYTES && (
        <StorageWarning sizeBytes={storageSize} />
      )}

      {/* Clear all confirmation dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="mx-4 w-full max-w-sm rounded-lg border border-border bg-surface
              p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            <h2 className="text-base font-semibold text-foreground">
              Clear everything?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This will permanently delete all your notes and images. This
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
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

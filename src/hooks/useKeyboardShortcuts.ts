"use client";

import { useEffect } from "react";
import type { Editor } from "@tiptap/react";

interface ShortcutOptions {
  editor: Editor | null;
  onClearAll: () => void;
}

export function useKeyboardShortcuts({
  editor,
  onClearAll,
}: ShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.shiftKey && e.key === "Backspace") {
        e.preventDefault();
        onClearAll();
        return;
      }

      if (!editor) return;

      if (e.key === "k") {
        e.preventDefault();
        const previousUrl = editor.getAttributes("link").href ?? "";
        const url = window.prompt("Enter URL:", previousUrl);
        if (url === null) return;
        if (url === "") {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }
        return;
      }

      if (e.shiftKey && e.key === "c") {
        e.preventDefault();
        editor.chain().focus().toggleCodeBlock().run();
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, onClearAll]);
}

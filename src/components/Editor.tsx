"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface EditorProps {
  content: string;
  onUpdate: (html: string) => void;
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
}

export function Editor({ content, onUpdate, onEditorReady }: EditorProps) {
  const initialized = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter((f) =>
          f.type.startsWith("image/")
        );
        if (imageFiles.length === 0) return false;

        event.preventDefault();

        imageFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const pos = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (pos) {
              const node = view.state.schema.nodes.image.create({ src });
              const tr = view.state.tr.insert(pos.pos, node);
              view.dispatch(tr);
            }
          };
          reader.readAsDataURL(file);
        });

        return true;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const imageItems = Array.from(items).filter((item) =>
          item.type.startsWith("image/")
        );
        if (imageItems.length === 0) return false;

        event.preventDefault();

        imageItems.forEach((item) => {
          const file = item.getAsFile();
          if (!file) return;

          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const node = view.state.schema.nodes.image.create({ src });
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          };
          reader.readAsDataURL(file);
        });

        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getHTML());
    },
    immediatelyRender: false,
  });

  const setInitialContent = useCallback(() => {
    if (editor && content && !initialized.current) {
      initialized.current = true;
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    setInitialContent();
  }, [setInitialContent]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="min-h-[70vh]">
      <EditorContent editor={editor} />
    </div>
  );
}

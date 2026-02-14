"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { codeBlockOptions } from "@blocknote/code-block";
import "@blocknote/mantine/style.css";

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec(codeBlockOptions),
  },
});

interface BlockEditorProps {
  pageId: string;
  initialContent?: unknown;
}

export function BlockEditor({ pageId, initialContent }: BlockEditorProps) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);
  const { resolvedTheme } = useTheme();

  const editor = useCreateBlockNote({
    schema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: initialContent as any,
  });

  const saveContent = useCallback(
    async (content: unknown) => {
      await fetch(`/api/pages/${pageId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    },
    [pageId]
  );

  useEffect(() => {
    if (!editor || isInitialized.current) return;
    isInitialized.current = true;

    // Auto-save on changes with debounce
    editor.onChange(() => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveContent(editor.document);
      }, 1000);
    });

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [editor, saveContent]);

  return (
    <>
      <style>{`
        .bn-container { position: relative; z-index: 1; }
        .bn-container .tiptap { z-index: 0; }
        .bn-container > [data-floating-ui-focusable] { z-index: 10080 !important; }
        .bn-block-outer:has([data-content-type="codeBlock"]) {
          margin-top: 16px;
          margin-bottom: 16px;
        }
        .bn-side-menu {
          margin-right: 8px;
        }
        .bn-toggle-button {
          margin-right: 4px;
        }
      `}</style>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        className="min-h-[300px]"
      />
    </>
  );
}

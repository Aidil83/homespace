"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Tldraw, Editor, TLStoreSnapshot } from "tldraw";
import "tldraw/tldraw.css";

interface DrawingCanvasProps {
  drawingId: string;
  initialSnapshot?: TLStoreSnapshot | null;
  isEditing: boolean;
  onPenDetected?: () => void;
}

export function DrawingCanvas({
  drawingId,
  initialSnapshot,
  isEditing,
  onPenDetected,
}: DrawingCanvasProps) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);
  themeRef.current = resolvedTheme;

  const saveDrawing = useCallback(
    async (editor: Editor) => {
      const snapshot = editor.store.getStoreSnapshot();
      await fetch(`/api/drawings/${drawingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tldrawDocument: snapshot }),
      });
    },
    [drawingId]
  );

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Start in locked mode
      editor.updateInstanceState({ isReadonly: true });
      editor.blur();
      editor.user.updateUserPreferences({ colorScheme: themeRef.current === "dark" ? "dark" : "light" });

      // Auto-save on changes with debounce
      editor.store.listen(
        () => {
          if (saveTimeout.current) clearTimeout(saveTimeout.current);
          saveTimeout.current = setTimeout(() => {
            saveDrawing(editor);
          }, 1500);
        },
        { source: "user", scope: "document" }
      );
    },
    [saveDrawing]
  );

  // Sync dark mode with app theme
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.user.updateUserPreferences({ colorScheme: resolvedTheme === "dark" ? "dark" : "light" });
  }, [resolvedTheme]);

  // React to isEditing changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (isEditing) {
      editor.updateInstanceState({ isReadonly: false });
      editor.focus();
    } else {
      editor.updateInstanceState({ isReadonly: true });
      editor.blur();
    }
  }, [isEditing]);

  return (
    <div
      className={`relative h-full w-full rounded-lg border ${!isEditing ? "drawing-canvas-locked" : ""}`}
    >
      <style>{`
        .drawing-canvas-locked .tl-canvas {
          touch-action: auto !important;
        }
      `}</style>
      <Tldraw
        autoFocus={false}
        onMount={handleMount}
        snapshot={initialSnapshot ?? undefined}
        components={{
          MenuPanel: null,
        }}
      />
      {!isEditing && (
        <div
          className="absolute inset-0 z-[5]"
          style={{ touchAction: "auto" }}
          onPointerDown={(e) => {
            if (e.pointerType === "pen") {
              onPenDetected?.();
            }
          }}
        />
      )}
    </div>
  );
}

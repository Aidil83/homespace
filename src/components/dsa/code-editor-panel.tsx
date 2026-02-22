"use client";

import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";

interface CodeEditorPanelProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

export function CodeEditorPanel({
  code,
  language,
  onChange,
}: CodeEditorPanelProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        value={code}
        onChange={(value) => onChange(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}

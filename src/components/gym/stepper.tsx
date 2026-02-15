"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number | null;
  increment: number;
  onChange: (value: number | null) => void;
  unit?: string;
  min?: number;
}

export function Stepper({ value, increment, onChange, unit, min = 0 }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  function handleStartEdit() {
    setEditValue(value?.toString() ?? "");
    setEditing(true);
  }

  function handleEndEdit() {
    setEditing(false);
    const num = Number(editValue);
    onChange(editValue === "" || isNaN(num) ? null : num);
  }

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleEndEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleEndEdit();
        }}
        className={cn(
          "h-9 w-full rounded-lg border bg-transparent text-center text-sm font-semibold",
          "focus:outline-none focus:ring-1 focus:ring-primary",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          const current = value ?? 0;
          const next = current - increment;
          onChange(next < min ? min : next);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground hover:bg-accent transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={handleStartEdit}
        className="flex-1 min-w-0 text-center"
        title="Tap to edit"
      >
        <span className="text-sm font-semibold">
          {value ?? "—"}
        </span>
        {unit && value != null && (
          <span className="ml-0.5 text-[10px] text-muted-foreground">{unit}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          const current = value ?? 0;
          onChange(current + increment);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground hover:bg-accent transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

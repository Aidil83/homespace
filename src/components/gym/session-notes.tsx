"use client";

import { useState } from "react";
import { NotebookPen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SessionNotesProps {
  value: string;
  onChange: (text: string) => void;
}

export function SessionNotes({ value, onChange }: SessionNotesProps) {
  const [open, setOpen] = useState(false);

  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Session Notes</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Optional
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="How did this session feel? Any observations about form, energy, or progress..."
              maxLength={500}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[100px]"
              rows={4}
            />
            {value && (
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>Auto-saved</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

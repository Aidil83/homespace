"use client";

import { useEffect, useState } from "react";
import { DrawingCanvas } from "./drawing-canvas";
import { TLStoreSnapshot } from "tldraw";
import { Trash2, Maximize2, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DrawingBlockProps {
  blockId: string;
  drawingId: string;
  onDelete?: () => void;
}

export function DrawingBlock({ drawingId, onDelete }: DrawingBlockProps) {
  const [snapshot, setSnapshot] = useState<TLStoreSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchDrawing() {
      const res = await fetch(`/api/drawings/${drawingId}`);
      if (res.ok) {
        const data = await res.json();
        const doc = data.tldrawDocument;
        // Only set snapshot if it has actual content
        if (doc && Object.keys(doc).length > 0) {
          setSnapshot(doc);
        }
      }
      setLoaded(true);
    }
    fetchDrawing();
  }, [drawingId]);

  if (!loaded) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border bg-muted/50">
        <p className="text-sm text-muted-foreground">Loading drawing...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative my-4 isolate z-0 rounded-lg",
        isEditing && "ring-2 ring-primary/50"
      )}
    >
      <div
        className={cn(
          "absolute -top-2 right-2 z-10 flex gap-1 transition-opacity",
          isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-7 w-7 bg-background shadow-sm",
            isEditing &&
              "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          )}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <Check className="h-3 w-3" />
          ) : (
            <Pencil className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-background shadow-sm"
          onClick={() => setExpanded(!expanded)}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-background shadow-sm text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div style={{ height: expanded ? "80vh" : "500px" }}>
        <DrawingCanvas
          drawingId={drawingId}
          initialSnapshot={snapshot}
          isEditing={isEditing}
          onPenDetected={() => setIsEditing(true)}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { BlockEditor } from "@/components/editor/block-editor";
import { DrawingBlock } from "@/components/drawing/drawing-block";
import { EmojiPicker } from "@/components/emoji-picker";
import { Button } from "@/components/ui/button";
import { ChevronRight, Pencil, Smile } from "lucide-react";

interface PageData {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

interface BreadcrumbItem {
  id: string;
  title: string;
  icon: string | null;
}

interface DrawingBlockData {
  id: string;
  drawing: {
    id: string;
  } | null;
}

export default function PageView() {
  const params = useParams();
  const pageId = params.pageId as string;
  const [page, setPage] = useState<PageData | null>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [content, setContent] = useState<unknown>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [drawings, setDrawings] = useState<DrawingBlockData[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    const [pageRes, contentRes, drawingsRes, pagesRes] = await Promise.all([
      fetch(`/api/pages/${pageId}`),
      fetch(`/api/pages/${pageId}/content`),
      fetch(`/api/pages/${pageId}/drawings`),
      fetch("/api/pages"),
    ]);

    if (pageRes.ok) {
      const pageData = await pageRes.json();
      setPage(pageData);
      setTitle(pageData.title);
      setIcon(pageData.icon);

      // Build breadcrumbs from all pages
      if (pagesRes.ok && pageData.parentId) {
        const allPages: PageData[] = await pagesRes.json();
        const crumbs: BreadcrumbItem[] = [];
        let currentId = pageData.parentId;
        while (currentId) {
          const parent = allPages.find((p) => p.id === currentId);
          if (!parent) break;
          crumbs.unshift({ id: parent.id, title: parent.title, icon: parent.icon });
          currentId = parent.parentId;
        }
        setBreadcrumbs(crumbs);
      } else {
        setBreadcrumbs([]);
      }
    }

    if (contentRes.ok) {
      const contentData = await contentRes.json();
      setContent(contentData.content);
    }

    if (drawingsRes.ok) {
      const drawingsData = await drawingsRes.json();
      setDrawings(drawingsData);
    }

    setLoaded(true);
  }, [pageId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateTitle = useCallback(
    async (newTitle: string) => {
      await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      window.dispatchEvent(
        new CustomEvent("page-title-updated", {
          detail: { pageId, title: newTitle },
        })
      );
    },
    [pageId]
  );

  const updateIcon = useCallback(
    async (newIcon: string | null) => {
      setIcon(newIcon);
      await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon: newIcon }),
      });
      window.dispatchEvent(
        new CustomEvent("page-icon-updated", {
          detail: { pageId, icon: newIcon },
        })
      );
    },
    [pageId]
  );

  // Debounce title updates
  useEffect(() => {
    if (!page || title === page.title) return;
    const timer = setTimeout(() => updateTitle(title), 500);
    return () => clearTimeout(timer);
  }, [title, page, updateTitle]);

  async function addDrawing() {
    const res = await fetch(`/api/pages/${pageId}/drawings`, {
      method: "POST",
    });
    if (res.ok) {
      const block = await res.json();
      setDrawings((prev) => [...prev, block]);
    }
  }

  async function deleteDrawing(blockId: string) {
    await fetch(`/api/blocks/${blockId}`, { method: "DELETE" });
    setDrawings((prev) => prev.filter((d) => d.id !== blockId));
  }

  if (!loaded) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <div className="group/page mx-auto max-w-4xl">
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <a
                href={`/${crumb.id}`}
                className="hover:text-foreground transition-colors"
              >
                {crumb.icon ? `${crumb.icon} ` : ""}{crumb.title}
              </a>
            </span>
          ))}
        </nav>
      )}
      <div className="mb-2">
        {icon ? (
          <EmojiPicker currentEmoji={icon} onSelect={updateIcon}>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-lg text-4xl hover:bg-accent transition-colors"
            >
              {icon}
            </button>
          </EmojiPicker>
        ) : (
          <div className="opacity-0 group-hover/page:opacity-100 transition-opacity">
            <EmojiPicker currentEmoji={null} onSelect={updateIcon}>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                <Smile className="h-4 w-4" />
                Add icon
              </button>
            </EmojiPicker>
          </div>
        )}
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground"
        placeholder="Untitled"
      />

      <div className="relative z-[2] mt-4">
        <BlockEditor
          pageId={pageId}
          initialContent={content || undefined}
        />
      </div>

      {/* Drawing blocks */}
      {drawings.map((block) =>
        block.drawing ? (
          <DrawingBlock
            key={block.id}
            blockId={block.id}
            drawingId={block.drawing.id}
            onDelete={() => deleteDrawing(block.id)}
          />
        ) : null
      )}

      {/* Add drawing button */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={addDrawing} className="gap-2">
          <Pencil className="h-4 w-4" />
          Add Drawing
        </Button>
      </div>
    </div>
  );
}

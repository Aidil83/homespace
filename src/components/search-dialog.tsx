"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface Page {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const router = useRouter();

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch pages when dialog opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/pages")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPages);
  }, [open]);

  // Keep list in sync with title/icon changes
  useEffect(() => {
    function handleTitleUpdate(e: Event) {
      const { pageId, title } = (e as CustomEvent).detail;
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, title } : p))
      );
    }
    function handleIconUpdate(e: Event) {
      const { pageId, icon } = (e as CustomEvent).detail;
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, icon } : p))
      );
    }
    window.addEventListener("page-title-updated", handleTitleUpdate);
    window.addEventListener("page-icon-updated", handleIconUpdate);
    return () => {
      window.removeEventListener("page-title-updated", handleTitleUpdate);
      window.removeEventListener("page-icon-updated", handleIconUpdate);
    };
  }, []);

  const handleSelect = useCallback(
    (pageId: string) => {
      setOpen(false);
      router.push(`/${pageId}`);
    },
    [router]
  );

  if (!mounted) return null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search for a page by title"
      showCloseButton={false}
    >
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.id}
              value={`${page.title}-${page.id}`}
              keywords={[page.title]}
              onSelect={() => handleSelect(page.id)}
            >
              {page.icon ? (
                <span className="text-lg leading-none">{page.icon}</span>
              ) : (
                <FileText className="text-muted-foreground" />
              )}
              <span>{page.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

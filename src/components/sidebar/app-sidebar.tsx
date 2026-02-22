"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Plus,
  FileText,
  Trash2,
  LogOut,
  MoreHorizontal,
  Moon,
  Sun,
  ChevronRight,
  FilePlus,
  Dumbbell,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Page {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
}

export function AppSidebar() {
  const [pages, setPages] = useState<Page[]>([]);
  const [mounted, setMounted] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPages();
  }, []);

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

  // Auto-expand ancestors of the active page
  useEffect(() => {
    const activePageId = pathname.replace("/", "");
    if (!activePageId || pages.length === 0) return;

    const toExpand = new Set<string>();
    let current = pages.find((p) => p.id === activePageId);
    while (current?.parentId) {
      toExpand.add(current.parentId);
      current = pages.find((p) => p.id === current!.parentId);
    }
    if (toExpand.size > 0) {
      setExpandedPages((prev) => {
        const next = new Set(prev);
        toExpand.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [pathname, pages]);

  async function fetchPages() {
    const res = await fetch("/api/pages");
    if (res.ok) {
      const data = await res.json();
      setPages(data);
    }
  }

  async function createPage(parentId?: string) {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", parentId: parentId || null }),
    });
    if (res.ok) {
      const page = await res.json();
      if (parentId) {
        setExpandedPages((prev) => new Set(prev).add(parentId));
      }
      await fetchPages();
      router.push(`/${page.id}`);
    }
  }

  async function deletePage(pageId: string) {
    await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
    await fetchPages();
    if (pathname === `/${pageId}`) {
      router.push("/");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function toggleExpanded(pageId: string) {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }

  // Build tree helpers
  const childrenMap = new Map<string | null, Page[]>();
  for (const page of pages) {
    const key = page.parentId;
    if (!childrenMap.has(key)) {
      childrenMap.set(key, []);
    }
    childrenMap.get(key)!.push(page);
  }

  const topLevelPages = childrenMap.get(null) || [];

  function PageItem({ page, depth }: { page: Page; depth: number }) {
    const children = childrenMap.get(page.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedPages.has(page.id);
    const isActive = pathname === `/${page.id}`;

    return (
      <SidebarMenuItem>
        <div className="flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(page.id);
            }}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent transition-colors",
              !hasChildren && "invisible"
            )}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </button>
          <SidebarMenuButton asChild isActive={isActive} className="flex-1">
            <a href={`/${page.id}`}>
              <FileText className="h-4 w-4" />
              <span>
                {page.icon || ""} {page.title}
              </span>
            </a>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction>
                <MoreHorizontal className="h-4 w-4" />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onClick={() => createPage(page.id)}>
                <FilePlus className="mr-2 h-4 w-4" />
                New sub-page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deletePage(page.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {hasChildren && isExpanded && (
          <SidebarMenuSub>
            {children.map((child) => (
              <PageItem key={child.id} page={child} depth={depth + 1} />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Homespace</h2>
      </SidebarHeader>

      <SidebarContent>
        {/* Gym */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/gym"}>
                  <Link href="/gym">
                    <Dumbbell className="h-4 w-4" />
                    <span>Gym</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/tempo"}>
                  <Link href="/tempo">
                    <Clock className="h-4 w-4" />
                    <span>Tempo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Notes */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            Notes
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => createPage()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topLevelPages.map((page) => (
                <PageItem key={page.id} page={page} depth={0} />
              ))}
              {topLevelPages.length === 0 && (
                <p className="px-4 py-2 text-sm text-muted-foreground">
                  No pages yet. Create one!
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>
                {mounted
                  ? resolvedTheme === "dark"
                    ? "Light mode"
                    : "Dark mode"
                  : "Dark mode"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

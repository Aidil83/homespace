import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SearchDialog } from "@/components/search-dialog";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex h-12 items-center border-b bg-background px-4">
          <SidebarTrigger />
        </div>
        <div className="p-6">{children}</div>
      </main>
      <SearchDialog />
    </SidebarProvider>
  );
}

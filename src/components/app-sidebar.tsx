import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid, ScanSearch, Rows3, Columns3, Send, Inbox, Clock3,
  Megaphone, Clapperboard, CalendarDays, Palette, FolderOpen,
  PanelsTopLeft, Wallet, UsersRound, SlidersHorizontal,
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { wallet } from "@/lib/mock";

type Item = { title: string; url: string; icon: typeof LayoutGrid };
const groups: { label: string; items: Item[] }[] = [
  { label: "", items: [{ title: "Overview", url: "/", icon: LayoutGrid }] },
  {
    label: "Leads",
    items: [
      { title: "Find", url: "/search", icon: ScanSearch },
      { title: "Contacts", url: "/leads", icon: Rows3 },
      { title: "Pipeline", url: "/pipeline", icon: Columns3 },
      { title: "Reach", url: "/reach", icon: Send },
      { title: "Inbox", url: "/inbox", icon: Inbox },
      { title: "Search history", url: "/history", icon: Clock3 },
    ],
  },
  {
    label: "Studio",
    items: [
      { title: "Ads", url: "/studio/ads", icon: Megaphone },
      { title: "Video", url: "/studio/video", icon: Clapperboard },
      { title: "Social", url: "/studio/social", icon: CalendarDays },
      { title: "Brand kit", url: "/studio/brand", icon: Palette },
      { title: "Library", url: "/studio/library", icon: FolderOpen },
    ],
  },
  { label: "Sites", items: [{ title: "Sites", url: "/sites", icon: PanelsTopLeft }] },
  {
    label: "Workspace",
    items: [
      { title: "Billing & credits", url: "/billing", icon: Wallet },
      { title: "Team", url: "/team", icon: UsersRound },
      { title: "Settings", url: "/settings", icon: SlidersHorizontal },
    ],
  },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (u: string) => (u === "/" ? path === "/" : path === u || path.startsWith(u + "/"));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-[5px] bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground">
            O
          </div>
          <span className="text-sm font-semibold tracking-[-0.01em] group-data-[collapsible=icon]:hidden">Outbound</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        {groups.map((g) => (
          <SidebarGroup key={g.label || "root"} className="py-1">
            {g.label && (
              <SidebarGroupLabel className="h-7 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {g.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-8 text-[13px] data-[active=true]:font-medium"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" strokeWidth={1.6} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/billing" className="block rounded-md px-2 py-2 hover:bg-sidebar-accent">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Credits</span>
                <span className="num text-sm font-medium">{wallet.balance.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-sidebar-accent">
                <div className="h-full bg-foreground/70" style={{ width: "57%" }} />
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

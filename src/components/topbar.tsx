import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsUpDown, Search, Bell, Check } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/kit";
import { wallet, workspaces } from "@/lib/mock";

const labels: Record<string, string> = {
  "": "Overview", search: "Find", leads: "Contacts", pipeline: "Pipeline", reach: "Reach",
  inbox: "Inbox", history: "Search history", studio: "Studio", ads: "Ads", video: "Video",
  social: "Social", brand: "Brand kit", library: "Library", sites: "Sites", builder: "Editor",
  billing: "Billing & credits", team: "Team", settings: "Settings",
};

export function Topbar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const parts = path.split("/").filter(Boolean);
  const crumbs = parts.length ? parts : [""];

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-3 backdrop-blur md:px-4">
      <SidebarTrigger className="text-muted-foreground" />
      <div className="h-4 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-accent">
          {workspaces[0].name}
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Workspaces</DropdownMenuLabel>
          {workspaces.map((w, i) => (
            <DropdownMenuItem key={w.id} className="justify-between">
              <span>{w.name}</span>
              {i === 0 ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs text-muted-foreground">{w.plan}</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem>Create workspace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="text-border">/</span>
            <span className={i === crumbs.length - 1 ? "text-foreground" : ""}>{labels[c] ?? c}</span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button className="hidden h-8 w-56 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm text-muted-foreground lg:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <span className="ml-auto"><Kbd>⌘K</Kbd></span>
        </button>
        <Link
          to="/billing"
          className="flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm hover:bg-accent"
        >
          <span className="text-muted-foreground">Credits</span>
          <span className="num font-medium">{wallet.balance.toLocaleString()}</span>
        </Link>
        <button className="relative grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent" aria-label="Notifications">
          <Bell className="h-4 w-4" strokeWidth={1.6} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-info" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-medium">
            CO
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-sm">Chidi Okafor</div>
              <div className="text-xs font-normal text-muted-foreground">chidi@dentallounge.ng</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/settings">Account settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/team">Team</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/billing">Billing</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

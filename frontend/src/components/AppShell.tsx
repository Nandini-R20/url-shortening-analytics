import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, Link2, LogOut, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 p-4 border-r border-glass-border glass">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <div className="size-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
            <Link2 className="size-5 text-primary-foreground" />
          </div>
          <div className="font-display text-xl font-bold tracking-tight">lnk<span className="text-gradient">.sh</span></div>
        </Link>

        <nav className="mt-4 flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all " +
                  (active
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-glass")
                }
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="glass-strong rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-accent" /> Pro plan
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unlimited links, custom domains, team seats.</p>
            <button className="mt-3 w-full rounded-lg bg-gradient-brand py-2 text-xs font-semibold text-primary-foreground">
              Upgrade
            </button>
          </div>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="mt-3 flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-glass"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-glass-border glass">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center"><Link2 className="size-4 text-primary-foreground" /></div>
            <span className="font-display font-bold">lnk<span className="text-gradient">.sh</span></span>
          </Link>
          <nav className="flex gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className={"px-3 py-1.5 rounded-md text-xs font-medium " + (active ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}

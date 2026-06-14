import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DailyClicksChart } from "@/components/DailyClicksChart";
import { StatPie } from "@/components/StatPie";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrls } from "@/lib/useUrls";
import { shortDomain, type Visit } from "@/lib/urlStore";
import { MousePointerClick, Clock, TrendingUp, Activity, Inbox } from "lucide-react";


export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — lnk.sh" }, { name: "description", content: "Clicks, devices, browsers and recent visits." }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const urls = useUrls();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350);
    return () => clearTimeout(t);
  }, []);

  const allVisits = useMemo(() => urls.flatMap((u) => u.visits.map((v) => ({ ...v, slug: u.slug }))), [urls]);

  const totalClicks = allVisits.length;
  const last24 = allVisits.filter((v) => v.at > Date.now() - 1000 * 60 * 60 * 24).length;

  const browserPie = useMemo(() => toPie(countBy(allVisits, (v) => v.browser)), [allVisits]);
  const devicePie = useMemo(() => toPie(countBy(allVisits, (v) => v.device)), [allVisits]);

  const series = useMemo(() => buildSeries(allVisits, 14), [allVisits]);
  const recent = useMemo(() => allVisits.slice().sort((a, b) => b.at - a.at).slice(0, 10), [allVisits]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
        <header>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance across all your links.</p>
        </header>

        {!mounted ? (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </section>
        ) : (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <BigStat icon={MousePointerClick} label="Total clicks" value={totalClicks.toLocaleString()} />
            <BigStat icon={Clock} label="Last 24h" value={last24.toLocaleString()} />
            <BigStat icon={TrendingUp} label="Active links" value={urls.length.toLocaleString()} />
            <BigStat icon={Activity} label="Avg per link" value={urls.length ? Math.round(totalClicks / urls.length).toLocaleString() : "0"} />
          </section>
        )}

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Daily click trend</h2>
            <span className="text-xs text-muted-foreground">Last 14 days</span>
          </div>
          {mounted ? <DailyClicksChart data={series} /> : <Skeleton className="h-64 rounded-xl" />}
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold mb-2">Browsers</h3>
            <p className="text-xs text-muted-foreground mb-3">Visitor browser distribution</p>
            {mounted ? <StatPie data={browserPie} /> : <Skeleton className="h-64 rounded-xl" />}
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold mb-2">Devices</h3>
            <p className="text-xs text-muted-foreground mb-3">Desktop, mobile and tablet split</p>
            {mounted ? <StatPie data={devicePie} /> : <Skeleton className="h-64 rounded-xl" />}
          </div>
        </section>

        <section className="glass rounded-2xl overflow-hidden">
          <div className="p-6 pb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recent visit timeline</h2>
            <span className="text-xs text-muted-foreground">Live feed</span>
          </div>
          {!mounted ? (
            <div className="p-6 pt-0 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center">
              <div className="size-12 rounded-2xl glass-strong grid place-items-center"><Inbox className="size-6 text-muted-foreground" /></div>
              <div className="font-semibold">No visits yet</div>
              <p className="text-sm text-muted-foreground">Share a short link to start collecting analytics.</p>
            </div>
          ) : (
            <ol className="p-6 pt-2 flex flex-col gap-3">
              {recent.map((v, i) => (
                <li key={i} className="flex items-center gap-4 glass rounded-xl p-3">
                  <div className="size-2.5 rounded-full bg-gradient-brand shadow-glow shrink-0" />
                  <div className="font-mono text-sm text-gradient shrink-0">{shortDomain()}/{v.slug}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">{v.browser} · {v.device}</div>
                  <div className="ml-auto text-xs text-muted-foreground">{timeAgo(v.at)}</div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function toPie(d: Record<string, number>) {
  return Object.entries(d).map(([name, value]) => ({ name, value }));
}

function BigStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="size-10 rounded-xl glass-strong grid place-items-center">
        <Icon className="size-5 text-accent" />
      </div>
      <div className="mt-4 font-display text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}


function countBy<T, K extends string>(arr: T[], fn: (t: T) => K): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = fn(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function buildSeries(visits: Visit[], days: number) {
  const out: { date: string; clicks: number }[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const v = visits.filter((x) => x.at >= start.getTime() && x.at < end.getTime()).length;
    out.push({ date: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }), clicks: v });
  }
  return out;
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

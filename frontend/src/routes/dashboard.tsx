import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrls } from "@/lib/useUrls";
import { shortDomain, type ShortUrl } from "@/lib/urlStore";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, MousePointerClick, TrendingUp, Copy, Trash2, QrCode, Check, Plus, ExternalLink, BarChart3, Trophy, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — lnk.sh" }, { name: "description", content: "Manage your short links." }] }),
  component: DashboardPage,
});

const EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function DashboardPage() {
  const urls = useUrls();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const totalClicks = urls.reduce((a, u) => a + u.clicks, 0);
    const today = now - 1000 * 60 * 60 * 24;
    const clicksToday = urls.reduce((a, u) => a + u.visits.filter((v) => v.at >= today).length, 0);
    const expired = urls.filter((u) => now - u.createdAt > EXPIRY_MS).length;
    const active = urls.length - expired;
    return { totalLinks: urls.length, totalClicks, clicksToday, active, expired };
  }, [urls]);

  const top = useMemo(() => urls.slice().sort((a, b) => b.clicks - a.clicks)[0], [urls]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your links, performance and quick actions.</p>
          </div>
        </header>

        {!mounted ? (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </section>
        ) : (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Link2} label="Total URLs" value={stats.totalLinks.toLocaleString()} trend="+12%" />
            <StatCard icon={MousePointerClick} label="Total clicks" value={stats.totalClicks.toLocaleString()} trend="+8.4%" />
            <StatCard icon={TrendingUp} label="Active links" value={stats.active.toLocaleString()} trend="+3.1%" />
            <StatCard icon={Clock} label="Expired links" value={stats.expired.toLocaleString()} trend="0%" />
          </section>
        )}

        {top && top.clicks > 0 && <TopPerformingCard url={top} />}

        <CreateUrlForm />

        {!mounted ? <Skeleton className="h-72 rounded-2xl" /> : <UrlTable urls={urls} />}
      </div>
    </AppShell>
  );
}

function TopPerformingCard({ url }: { url: ShortUrl }) {
  return (
    <section className="relative overflow-hidden rounded-2xl glass-strong p-6 md:p-7">
      <div className="absolute -right-10 -top-10 size-56 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow">
            <Trophy className="size-7 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-accent font-semibold">🏆 Top performing link</div>
            <div className="font-mono text-lg md:text-xl text-gradient font-bold mt-1">{shortDomain()}/{url.slug}</div>
            <div className="text-xs text-muted-foreground truncate max-w-xs md:max-w-md">{url.longUrl}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-bold">{url.clicks.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">total clicks</div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; trend: string }) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-gradient-brand opacity-20 blur-2xl" />
      <div className="flex items-center justify-between">
        <div className="size-10 rounded-xl glass-strong grid place-items-center">
          <Icon className="size-5 text-accent" />
        </div>
        <span className="text-xs font-semibold text-accent">{trend}</span>
      </div>
      <div className="mt-4">
        <div className="font-display text-3xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function CreateUrlForm() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [created, setCreated] = useState<ShortUrl | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (variables: { originalUrl: string; customAlias?: string }) => api.createUrl(variables.originalUrl, variables.customAlias),
    onSuccess: (data) => {
      setCreated(data as any);
      setUrl("");
      setSlug("");
      toast.success("Short link created", { description: `${shortDomain()}/${data.slug}` });
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create link");
    }
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    let val = url.trim();
    if (!/^https?:\/\//i.test(val)) val = "https://" + val;
    mutation.mutate({ originalUrl: val, customAlias: slug || undefined });
  }

  return (
    <section className="glass-strong rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-9 rounded-xl bg-gradient-brand grid place-items-center"><Plus className="size-5 text-primary-foreground" /></div>
        <div>
          <h2 className="font-display text-xl font-bold">Create new link</h2>
          <p className="text-xs text-muted-foreground">Paste a long URL, optionally choose a custom slug.</p>
        </div>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-very-long-url.com/path?query=value"
          className="glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/40 min-w-0"
        />
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 text-sm">
          <span className="text-muted-foreground">{shortDomain()}/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, ""))}
            placeholder="custom"
            className="bg-transparent outline-none w-28"
          />
        </div>
        <button disabled={mutation.isPending} type="submit" className="rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow whitespace-nowrap disabled:opacity-50">
          {mutation.isPending ? "Shortening..." : "Shorten link"}
        </button>
      </form>

      {created && (
        <div className="mt-4 glass rounded-xl p-4 flex flex-wrap items-center gap-4 justify-between">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">New short link</div>
            <div className="font-mono text-sm text-gradient truncate">{shortDomain()}/{created.slug}</div>
          </div>
          <CopyBtn text={`https://${shortDomain()}/${created.slug}`} />
        </div>
      )}
    </section>
  );
}

function UrlTable({ urls }: { urls: ShortUrl[] }) {
  const [preview, setPreview] = useState<ShortUrl | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUrl(id),
    onSuccess: () => {
      toast.success("Link deleted");
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete link");
    }
  });
  return (
    <section className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="font-display text-xl font-bold">Your links</h2>
        <span className="text-xs text-muted-foreground">{urls.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-y border-glass-border">
              <th className="px-6 py-3 font-medium">Short link</th>
              <th className="px-6 py-3 font-medium">Destination</th>
              <th className="px-6 py-3 font-medium">Clicks</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((u) => (
              <tr key={u.id} className="border-b border-glass-border last:border-0 hover:bg-glass/50 transition">
                <td className="px-6 py-4">
                  <div className="font-mono text-gradient font-semibold">{shortDomain()}/{u.slug}</div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <a href={u.longUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground truncate">
                    <span className="truncate">{u.longUrl}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </td>
                <td className="px-6 py-4 font-semibold">{u.clicks.toLocaleString()}</td>
                <td className="px-6 py-4 text-muted-foreground">{timeAgo(u.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <IconBtn title="QR code" onClick={() => setPreview(u)}><QrCode className="size-4" /></IconBtn>
                    <Link to="/analytics" title="Analytics" className="size-9 grid place-items-center rounded-lg glass hover:bg-glass-border transition hover:text-accent">
                      <BarChart3 className="size-4" />
                    </Link>
                    <CopyBtn text={`https://${shortDomain()}/${u.slug}`} compact />
                    <IconBtn title="Delete" danger onClick={() => deleteMutation.mutate(u.id)}><Trash2 className="size-4" /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {urls.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-12 rounded-2xl glass-strong grid place-items-center"><Link2 className="size-6 text-muted-foreground" /></div>
                  <div className="font-semibold">No links yet</div>
                  <p className="text-sm text-muted-foreground">Create your first short link using the form above.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {preview && <QrModal url={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}

function QrModal({ url, onClose }: { url: any; onClose: () => void }) {
  const short = `https://${shortDomain()}/${url.slug}`;
  const qr = url.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=320x320&bgcolor=10-12-20&color=ffffff&margin=12&data=${encodeURIComponent(short)}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-strong rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl font-bold">QR preview</h3>
        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{short}</p>
        <div className="mt-4 rounded-xl overflow-hidden glass p-3 grid place-items-center">
          <img src={qr} alt="QR code" className="size-72 rounded-lg" />
        </div>
        <div className="mt-4 flex gap-2">
          <a href={qr} download={`${url.slug}.png`} className="flex-1 rounded-xl bg-gradient-brand text-center py-2.5 text-sm font-semibold text-primary-foreground">Download</a>
          <button onClick={onClose} className="rounded-xl glass px-4 py-2.5 text-sm font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

export function CopyBtn({ text, compact }: { text: string; compact?: boolean }) {
  const [done, setDone] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setDone(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setDone(false), 1500);
  }
  if (compact) {
    return (
      <IconBtn title="Copy" onClick={copy}>
        {done ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
      </IconBtn>
    );
  }
  return (
    <button onClick={copy} className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground flex items-center gap-2">
      {done ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}
    </button>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={
        "size-9 grid place-items-center rounded-lg glass hover:bg-glass-border transition " +
        (danger ? "hover:text-destructive" : "hover:text-foreground")
      }
    >
      {children}
    </button>
  );
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

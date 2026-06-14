export type ShortUrl = {
  id: string;
  slug: string;
  longUrl: string;
  createdAt: number;
  clicks: number;
  visits: Visit[];
};

export type Visit = {
  at: number;
  browser: "Chrome" | "Safari" | "Firefox" | "Edge" | "Other";
  device: "Desktop" | "Mobile" | "Tablet";
};

const KEY = "lnk_urls_v1";
const listeners = new Set<() => void>();

function read(): ShortUrl[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as ShortUrl[];
  } catch {
    return [];
  }
}

function write(urls: ShortUrl[]) {
  localStorage.setItem(KEY, JSON.stringify(urls));
  listeners.forEach((l) => l());
}

const BROWSERS: Visit["browser"][] = ["Chrome", "Safari", "Firefox", "Edge", "Other"];
const DEVICES: Visit["device"][] = ["Desktop", "Mobile", "Tablet"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genVisits(n: number): Visit[] {
  const now = Date.now();
  return Array.from({ length: n }, () => ({
    at: now - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 14),
    browser: rand(BROWSERS),
    device: rand(DEVICES),
  })).sort((a, b) => b.at - a.at);
}

function seed(): ShortUrl[] {
  const urls: ShortUrl[] = [
    {
      id: "1",
      slug: "launch",
      longUrl: "https://example.com/product/launch-announcement",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      clicks: 1284,
      visits: genVisits(1284),
    },
    {
      id: "2",
      slug: "pricing",
      longUrl: "https://example.com/pricing-2026",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      clicks: 437,
      visits: genVisits(437),
    },
    {
      id: "3",
      slug: "demo",
      longUrl: "https://example.com/book-a-demo",
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
      clicks: 92,
      visits: genVisits(92),
    },
  ];
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(urls));
  return urls;
}

export const urlStore = {
  getAll: read,
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  create(longUrl: string, slug?: string): ShortUrl {
    const all = read();
    const finalSlug = slug?.trim() || Math.random().toString(36).slice(2, 8);
    const u: ShortUrl = {
      id: crypto.randomUUID(),
      slug: finalSlug,
      longUrl,
      createdAt: Date.now(),
      clicks: 0,
      visits: [],
    };
    write([u, ...all]);
    return u;
  },
  remove(id: string) {
    write(read().filter((u) => u.id !== id));
  },
};

export function shortDomain() {
  if (typeof window === "undefined") return "lnk.sh";
  return "lnk.sh";
}

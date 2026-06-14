const BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(err.message || "Login failed");
    }
    return res.json();
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Registration failed" }));
      throw new Error(err.message || "Registration failed");
    }
    return res.json();
  },

  async getUrls() {
    const res = await fetch(`${BASE_URL}/url/myurls`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized");
      throw new Error("Failed to fetch URLs");
    }
    const data = await res.json();
    return data.map((url: any) => ({
      id: url._id,
      slug: url.shortCode,
      longUrl: url.originalUrl,
      createdAt: new Date(url.createdAt).getTime(),
      clicks: url.clickCount || 0,
      visits: [], // Dummy for now, actual visits can be fetched via /analytics if needed
      qrCode: url.qrCode
    }));
  },

  async createUrl(originalUrl: string, customAlias?: string) {
    const res = await fetch(`${BASE_URL}/url/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ originalUrl, customAlias }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed to create URL" }));
      throw new Error(err.message || "Failed to create URL");
    }
    const url = await res.json();
    return {
      id: url._id,
      slug: url.shortCode,
      longUrl: url.originalUrl,
      createdAt: new Date(url.createdAt).getTime(),
      clicks: url.clickCount || 0,
      visits: [],
      qrCode: url.qrCode
    };
  },

  async deleteUrl(id: string) {
    const res = await fetch(`${BASE_URL}/url/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete URL");
    }
    return res.json();
  },

  async getAnalytics(id: string) {
    const res = await fetch(`${BASE_URL}/url/${id}/analytics`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized");
      throw new Error("Failed to fetch analytics");
    }
    return res.json();
  }
};

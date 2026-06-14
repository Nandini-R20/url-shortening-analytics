import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Link2, Mail, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — lnk.sh" }, { name: "description", content: "Sign in to your link dashboard." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(email, pw);
      localStorage.setItem("token", data.token);
      toast.success("Logged in successfully");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your links and analytics."
      footer={<>Don't have an account? <Link to="/signup" className="text-gradient font-semibold">Sign up</Link></>}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <Field icon={Mail} placeholder="you@company.com" type="email" value={email} onChange={setEmail} />
        <Field icon={Lock} placeholder="••••••••" type="password" value={pw} onChange={setPw} />
        <button disabled={loading} type="submit" className="mt-2 rounded-xl bg-gradient-brand py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50">
          {loading ? "Signing in..." : <>Sign in <ArrowRight className="size-4" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-glass-border glass">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow"><Link2 className="size-5 text-primary-foreground" /></div>
          <span className="font-display text-2xl font-bold">lnk<span className="text-gradient">.sh</span></span>
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">Short links.<br /><span className="text-gradient">Real signal.</span></h2>
          <p className="mt-4 text-muted-foreground max-w-md">Branded short URLs, QR codes, and click-by-click analytics in one beautifully minimal dashboard.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["12M+", "Links shortened"],
              ["99.99%", "Redirect uptime"],
              ["180+", "Countries tracked"],
            ].map(([v, l]) => (
              <div key={l} className="glass rounded-xl p-4">
                <div className="font-display text-2xl font-bold text-gradient">{v}</div>
                <div className="text-xs text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 lnk.sh — built for modern teams.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md glass-strong rounded-2xl p-8 sm:p-10">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-9 rounded-xl bg-gradient-brand grid place-items-center"><Link2 className="size-5 text-primary-foreground" /></div>
            <span className="font-display text-xl font-bold">lnk<span className="text-gradient">.sh</span></span>
          </div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-muted-foreground text-center">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, ...props }: { icon: React.ComponentType<{ className?: string }>; placeholder: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 glass rounded-xl px-4 py-3 focus-within:ring-2 ring-primary/40">
      <Icon className="size-4 text-muted-foreground" />
      <input
        className="bg-transparent outline-none w-full text-sm placeholder:text-muted-foreground"
        placeholder={props.placeholder}
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

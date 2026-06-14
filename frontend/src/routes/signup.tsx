import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — lnk.sh" }, { name: "description", content: "Create your lnk.sh account." }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.register(name, email, pw);
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const msg = err.message || "Failed to create account. Please try again.";
      console.error("[signup error]", err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start shortening and tracking in under a minute."
      footer={<>Already have one? <Link to="/login" className="text-gradient font-semibold">Sign in</Link></>}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field icon={User} placeholder="Your name" type="text" value={name} onChange={setName} />
        <Field icon={Mail} placeholder="you@company.com" type="email" value={email} onChange={setEmail} />
        <Field icon={Lock} placeholder="Create a password" type="password" value={pw} onChange={setPw} />
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <button disabled={loading} type="submit" className="mt-2 rounded-xl bg-gradient-brand py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50">
          {loading ? "Creating..." : <>Create account <ArrowRight className="size-4" /></>}
        </button>
        <p className="text-xs text-muted-foreground text-center">By signing up you agree to our Terms & Privacy.</p>
      </form>
    </AuthLayout>
  );
}

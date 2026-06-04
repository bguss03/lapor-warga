import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).default("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { login } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", nik: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && (!form.name || !form.nik || !form.phone || !form.password)) {
      toast.error("Lengkapi semua data dahulu");
      return;
    }
    if (mode === "login" && (!form.phone || !form.password)) {
      toast.error("Masukkan no. HP dan password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login({
        name: form.name || "Warga Sentosa",
        nik: form.nik || "3201xxxxxxxxxxxx",
        phone: form.phone,
        region: "Kel. Sukamaju, Kec. Mekarsari",
      });
      toast.success(mode === "register" ? "Akun berhasil dibuat" : "Selamat datang kembali!");
      navigate({ to: "/home" });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[image:var(--gradient-hero)] px-5 pb-10 pt-6 text-primary-foreground">
        <Link to="/welcome" className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="mt-6 flex items-center gap-2">
          <Megaphone className="size-6" />
          <span className="text-lg font-bold">LaporWarga</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {mode === "login" ? "Masuk ke akunmu" : "Daftar akun warga"}
        </h1>
        <p className="text-sm text-white/85">
          {mode === "login" ? "Lapor cepat & pantau progres laporan." : "Hanya butuh sebentar untuk memulai."}
        </p>
      </div>

      <form onSubmit={submit} className="-mt-6 space-y-4 rounded-t-3xl bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <>
            <Field label="Nama Lengkap">
              <Input value={form.name} onChange={update("name")} placeholder="Budi Santoso" />
            </Field>
            <Field label="NIK (16 digit)">
              <Input value={form.nik} onChange={update("nik")} inputMode="numeric" placeholder="3201xxxxxxxxxxxx" />
            </Field>
          </>
        )}
        <Field label="No. Handphone">
          <Input value={form.phone} onChange={update("phone")} inputMode="numeric" placeholder="0812xxxxxxxx" />
        </Field>
        <Field label="Password">
          <Input value={form.password} onChange={update("password")} type="password" placeholder="••••••••" />
        </Field>

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Sekarang"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Dengan melanjutkan, Anda menyetujui ketentuan & kebijakan privasi.
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

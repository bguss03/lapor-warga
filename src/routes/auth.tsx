import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

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
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", nik: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
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

    try {
      // For simplicity in this demo, we use phone + @laporwarga.com as email for Supabase Auth
      // since Supabase standard email auth is easier to set up than phone auth
      const email = `${form.phone}@laporwarga.com`;

      if (mode === "register") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: form.password,
          options: {
            data: {
              name: form.name,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: authData.user.id,
            name: form.name,
            nik: form.nik,
            phone: form.phone,
            role: "warga",
          });

          if (profileError) throw profileError;
        }

        toast.success("Akun berhasil dibuat. Silakan login.");
        setMode("login");
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });

        if (loginError) throw loginError;

        toast.success("Selamat datang kembali!");
        navigate({ to: "/home" });
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-12">
      <div className="safe-top bg-(image:--gradient-hero) px-5 pb-12 pt-8 text-primary-foreground">
        <Link
          to="/welcome"
          className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
        >
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
          {mode === "login"
            ? "Lapor cepat & pantau progres laporan."
            : "Hanya butuh sebentar untuk memulai."}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="-mt-8 flex-1 space-y-4 rounded-t-3xl bg-card p-6 shadow-card"
      >
        <div className="mb-2 flex gap-1 rounded-xl bg-muted p-1">
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
              <Input
                value={form.nik}
                onChange={update("nik")}
                inputMode="numeric"
                placeholder="3201xxxxxxxxxxxx"
              />
            </Field>
          </>
        )}
        <Field label="No. Handphone">
          <Input
            value={form.phone}
            onChange={update("phone")}
            inputMode="numeric"
            placeholder="0812xxxxxxxx"
          />
        </Field>
        <Field label="Password">
          <Input
            value={form.password}
            onChange={update("password")}
            type="password"
            placeholder="••••••••"
          />
        </Field>

        <div className="pt-2">
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Sekarang"}
          </Button>
        </div>

        <p className="px-4 text-center text-xs leading-relaxed text-muted-foreground">
          Dengan melanjutkan, Anda menyetujui ketentuan & kebijakan privasi.
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

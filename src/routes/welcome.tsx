import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Megaphone, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  const { user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: "/home" });
  }, [user, navigate]);

  return (
    <div className="relative flex min-h-screen flex-col bg-(image:--gradient-hero) text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(1_0_0/0.15),transparent_60%)]" />
      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 pt-4">
          <div className="grid size-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Megaphone className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">LaporWarga</span>
        </div>

        <div className="flex-1 pt-16">
          <h1 className="text-4xl font-bold leading-tight">
            Suara warga, <br /> aksi nyata.
          </h1>
          <p className="mt-4 text-base text-white/85">
            Sampaikan keluhan dan laporan Anda. Pantau langsung penanganannya oleh petugas wilayah.
          </p>

          <div className="mt-10 space-y-3">
            <Feature
              icon={<Megaphone className="size-5" />}
              title="Lapor cepat"
              desc="Kirim laporan dalam hitungan detik."
            />
            <Feature
              icon={<MapPin className="size-5" />}
              title="Lokasi akurat"
              desc="Pin point lokasi kejadian."
            />
            <Feature
              icon={<ShieldCheck className="size-5" />}
              title="Anonim & aman"
              desc="Identitas terlindungi bila perlu."
            />
          </div>
        </div>

        <div className="safe-bottom space-y-3 pt-8">
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-primary shadow-elevated active:scale-[0.98]"
          >
            Mulai Sekarang <ArrowRight className="size-5" />
          </Link>
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-sm font-medium text-white backdrop-blur"
          >
            Saya sudah punya akun
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/20">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-white/80">{desc}</p>
      </div>
    </div>
  );
}

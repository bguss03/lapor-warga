import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Settings, HelpCircle, Shield, LogOut, ChevronRight,
  Bell, Globe, FileBadge, MapPin,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, reports } = useStore();
  const navigate = useNavigate();
  const total = reports.length;
  const selesai = reports.filter((r) => r.status === "selesai").length;

  const out = () => {
    logout();
    navigate({ to: "/welcome" });
  };

  return (
    <div>
      <header className="rounded-b-3xl bg-[image:var(--gradient-hero)] px-5 pb-10 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">Profil</h1>
        <div className="mt-5 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
            {user?.name?.[0] ?? "W"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{user?.name}</p>
            <p className="text-xs text-white/80">{user?.phone}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
              <MapPin className="size-3" /> {user?.region}
            </p>
          </div>
        </div>
      </header>

      <div className="-mt-5 px-5">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
          <Stat label="Total" value={total} />
          <div className="border-x border-border">
            <Stat label="Selesai" value={selesai} />
          </div>
          <Stat label="Reputasi" value="A+" />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <Group title="Akun">
          <Row icon={<FileBadge className="size-4" />} label="Data Diri & NIK" />
          <Row icon={<Bell className="size-4" />} label="Pengaturan Notifikasi" />
          <Row icon={<Globe className="size-4" />} label="Wilayah" hint={user?.region} />
        </Group>

        <Group title="Dukungan">
          <Row icon={<HelpCircle className="size-4" />} label="Pusat Bantuan" />
          <Row icon={<Shield className="size-4" />} label="Kebijakan Privasi" />
          <Row icon={<Settings className="size-4" />} label="Pengaturan Aplikasi" />
        </Group>

        <Button onClick={out} variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive" size="lg">
          <LogOut className="size-4" /> Keluar dari akun
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">LaporWarga v1.0 · Dibuat dengan ❤ untuk pelayanan publik</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">{children}</div>
    </section>
  );
}

function Row({ icon, label, hint }: { icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-b-0 transition active:bg-muted/50">
      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hint && <span className="max-w-[40%] truncate text-[11px] text-muted-foreground">{hint}</span>}
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Plus, Clock, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { useStore, STATUS_META } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

function HomePage() {
  const { user, reports } = useStore();
  const diproses = reports.filter((r) => r.status === "diproses" || r.status === "menunggu").length;
  const selesai = reports.filter((r) => r.status === "selesai").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="rounded-b-3xl bg-[image:var(--gradient-hero)] px-5 pb-8 pt-8 text-primary-foreground shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/80">Selamat datang,</p>
            <h1 className="text-xl font-bold leading-tight">{user?.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
              <MapPin className="size-3.5" /> {user?.region}
            </p>
          </div>
          <div className="grid size-12 place-items-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur">
            {user?.name?.[0] ?? "W"}
          </div>
        </div>

        {/* Status summary */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <SummaryCard icon={<Clock className="size-4" />} label="Diproses" value={diproses} />
          <SummaryCard icon={<CheckCircle2 className="size-4" />} label="Selesai" value={selesai} />
        </div>
      </header>

      {/* CTA */}
      <section className="px-5">
        <Link
          to="/report"
          className="group flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] ring-1 ring-border transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elevated)]">
              <Plus className="size-6" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-bold">Buat Laporan Sekarang</p>
              <p className="text-xs text-muted-foreground">Cepat, mudah, & transparan</p>
            </div>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>
      </section>

      {/* Feed */}
      <section className="px-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold">Laporan Terkini</h2>
            <p className="text-xs text-muted-foreground">Dari warga di sekitarmu</p>
          </div>
          <Sparkles className="size-4 text-accent" />
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <article
              key={r.id}
              className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)] ring-1 ring-border"
            >
              {r.photo && (
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img src={r.photo} alt={r.category} className="size-full object-cover" loading="lazy" />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                      {r.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2 p-4">
                {!r.photo && (
                  <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                    {r.category}
                  </span>
                )}
                <p className="line-clamp-2 text-sm text-foreground">{r.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">oleh {r.author}</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-white/85">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="text-[10px] text-white/70">Laporan saya</p>
    </div>
  );
}

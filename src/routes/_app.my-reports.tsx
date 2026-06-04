import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Star, MapPin, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStore, type Report } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/my-reports")({
  component: MyReportsPage,
});

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "menunggu", label: "Menunggu" },
  { id: "diproses", label: "Diproses" },
  { id: "selesai", label: "Selesai" },
] as const;

function MyReportsPage() {
  const { user, reports } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [active, setActive] = useState<Report | null>(null);

  const mine = reports.filter((r) => !r.anonymous && r.author === user?.name || r.author === user?.name);
  // Show all authored by user (incl. anonymous-by-self isn't tracked; show all for demo)
  const list = reports
    .filter((r) => (filter === "all" ? true : r.status === filter));

  return (
    <div>
      <header className="rounded-b-3xl bg-[image:var(--gradient-hero)] px-5 pb-6 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">Laporan Saya</h1>
        <p className="text-sm text-white/85">Pantau progres laporan yang Anda kirim.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filter === f.id ? "bg-white text-primary" : "bg-white/15 text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3 p-5">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Tidak ada laporan pada filter ini.
          </div>
        )}
        {list.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r)}
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-[var(--shadow-soft)] ring-1 ring-border transition active:scale-[0.99]"
          >
            {r.photo ? (
              <img src={r.photo} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">📌</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-primary">{r.id}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-semibold">{r.category}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      {active && <DetailSheet report={active} onClose={() => setActive(null)} />}
      <span className="hidden">{mine.length}</span>
    </div>
  );
}

function DetailSheet({ report, onClose }: { report: Report; onClose: () => void }) {
  const { rateReport } = useStore();
  const [rating, setRating] = useState(report.rating ?? 0);
  const [feedback, setFeedback] = useState(report.feedback ?? "");

  const submitRating = () => {
    if (rating === 0) return toast.error("Berikan bintang dahulu");
    rateReport(report.id, rating, feedback);
    toast.success("Terima kasih atas ulasannya!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl animate-in slide-in-from-bottom"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-primary">{report.id}</span>
            <h2 className="text-lg font-bold">{report.category}</h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {report.location}
            </p>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StatusBadge status={report.status} />
          <span className="text-xs text-muted-foreground">• oleh {report.author}</span>
        </div>

        {report.photo && (
          <img src={report.photo} alt="" className="mt-4 aspect-video w-full rounded-2xl object-cover" />
        )}

        <p className="mt-4 text-sm leading-relaxed text-foreground">{report.description}</p>

        {/* Timeline */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold">Progress Penanganan</h3>
          <ol className="relative space-y-5 border-l-2 border-dashed border-border pl-5">
            {report.timeline.map((step, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -left-[27px] grid size-5 place-items-center rounded-full ring-2 ring-card ${
                    step.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.date}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Rating */}
        {report.status === "selesai" && (
          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
            <h3 className="text-sm font-bold">Beri Ulasan Kinerja Petugas</h3>
            <p className="text-xs text-muted-foreground">Ulasan Anda membantu peningkatan pelayanan.</p>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1 transition active:scale-90">
                  <Star
                    className={`size-8 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tulis ulasan singkat (opsional)..."
              rows={3}
              className="mt-3 resize-none bg-card"
            />
            <Button onClick={submitRating} variant="hero" className="mt-3 w-full">
              Kirim Ulasan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

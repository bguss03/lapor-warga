import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, CheckCircle2, Clock, Megaphone } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markNotifsRead } = useStore();

  useEffect(() => {
    const t = setTimeout(() => markNotifsRead(), 800);
    return () => clearTimeout(t);
  }, [markNotifsRead]);

  return (
    <div>
      <header className="rounded-b-3xl bg-[image:var(--gradient-hero)] px-5 pb-6 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <p className="text-sm text-white/85">Pembaruan progres dan pengumuman.</p>
      </header>

      <div className="space-y-3 p-5">
        {notifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Belum ada notifikasi.
          </div>
        )}
        {notifications.map((n) => {
          const Icon = n.title.includes("Selesai")
            ? CheckCircle2
            : n.title.includes("Ditunjuk") || n.title.includes("Terkirim")
            ? Clock
            : n.title.includes("Selamat")
            ? Megaphone
            : Bell;
          return (
            <article
              key={n.id}
              className={`flex gap-3 rounded-2xl border bg-card p-4 ring-1 ${
                n.read ? "border-border ring-transparent" : "border-primary/30 ring-primary/10 bg-primary/[0.03]"
              }`}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">{n.date}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

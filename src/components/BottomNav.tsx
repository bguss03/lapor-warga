import { Link, useLocation } from "@tanstack/react-router";
import { Home, FileText, Bell, User, PlusCircle } from "lucide-react";
import { useStore } from "@/lib/store";

type NavItem = { to: "/home" | "/my-reports" | "/report" | "/notifications" | "/profile"; label: string; icon: typeof Home; primary?: boolean };

const items: NavItem[] = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/my-reports", label: "Laporan", icon: FileText },
  { to: "/report", label: "Lapor", icon: PlusCircle, primary: true },
  { to: "/notifications", label: "Notifikasi", icon: Bell },
  { to: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-xl">
      <ul className="safe-bottom flex items-end justify-around px-2 pt-1">
        {items.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          if (item.primary) {
            return (
              <li key={item.to} className="-mt-6">
                <Link
                  to={item.to}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elevated)] transition active:scale-95">
                    <Icon className="size-7" strokeWidth={2.4} />
                  </span>
                  <span className="text-[10px] font-semibold text-foreground">{item.label}</span>
                </Link>
              </li>
            );
          }
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`relative flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.to === "/notifications" && unread > 0 && (
                  <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

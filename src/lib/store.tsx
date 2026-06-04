import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ReportStatus = "menunggu" | "diproses" | "selesai" | "eskalasi";

export interface TimelineStep {
  label: string;
  date: string;
  done: boolean;
}

export interface Report {
  id: string;
  category: string;
  description: string;
  photo?: string;
  location: string;
  anonymous: boolean;
  status: ReportStatus;
  createdAt: string;
  author: string;
  timeline: TimelineStep[];
  rating?: number;
  feedback?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface User {
  name: string;
  nik: string;
  phone: string;
  region: string;
}

interface State {
  user: User | null;
  reports: Report[];
  notifications: Notification[];
  login: (u: User) => void;
  logout: () => void;
  addReport: (r: Omit<Report, "id" | "createdAt" | "status" | "timeline" | "author"> & { author?: string }) => Report;
  rateReport: (id: string, rating: number, feedback: string) => void;
  markNotifsRead: () => void;
}

const Ctx = createContext<State | null>(null);

const seedReports = (userName: string): Report[] => [
  {
    id: "RPT-001",
    category: "Infrastruktur",
    description: "Jalan berlubang di depan Pasar Sentral, sangat membahayakan pengendara motor terutama malam hari.",
    photo: "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=600&q=70",
    location: "Jl. Pasar Sentral No. 12",
    anonymous: false,
    status: "diproses",
    createdAt: "2026-06-01",
    author: "Budi Santoso",
    timeline: [
      { label: "Laporan Diterima", date: "01 Jun 2026", done: true },
      { label: "Petugas Ditunjuk", date: "02 Jun 2026", done: true },
      { label: "Sedang Diperbaiki", date: "03 Jun 2026", done: true },
      { label: "Selesai", date: "-", done: false },
    ],
  },
  {
    id: "RPT-002",
    category: "Lingkungan",
    description: "Tumpukan sampah tidak diangkut sudah 3 hari di RT 04.",
    photo: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&q=70",
    location: "Gang Mawar RT 04",
    anonymous: true,
    status: "selesai",
    createdAt: "2026-05-28",
    author: "Anonim",
    timeline: [
      { label: "Laporan Diterima", date: "28 Mei 2026", done: true },
      { label: "Petugas Ditunjuk", date: "28 Mei 2026", done: true },
      { label: "Sedang Diperbaiki", date: "29 Mei 2026", done: true },
      { label: "Selesai", date: "30 Mei 2026", done: true },
    ],
  },
  {
    id: "RPT-003",
    category: "Ketertiban",
    description: "Parkir liar di trotoar menghalangi pejalan kaki.",
    location: "Jl. Diponegoro",
    anonymous: false,
    status: "menunggu",
    createdAt: "2026-06-03",
    author: userName,
    timeline: [
      { label: "Laporan Diterima", date: "03 Jun 2026", done: true },
      { label: "Petugas Ditunjuk", date: "-", done: false },
      { label: "Sedang Diperbaiki", date: "-", done: false },
      { label: "Selesai", date: "-", done: false },
    ],
  },
];

const seedNotifs = (): Notification[] => [
  { id: "n1", title: "Laporan #RPT-002 Selesai", body: "Petugas telah menyelesaikan laporan tumpukan sampah Anda. Terima kasih!", date: "30 Mei 2026", read: false },
  { id: "n2", title: "Petugas Ditunjuk", body: "Laporan #RPT-001 sedang ditangani oleh Tim Dinas PU.", date: "02 Jun 2026", read: false },
  { id: "n3", title: "Selamat Datang!", body: "Akun Anda berhasil terdaftar di LaporWarga.", date: "01 Jun 2026", read: true },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lapor-warga");
      if (raw) {
        const data = JSON.parse(raw);
        setUser(data.user || null);
        setReports(data.reports || []);
        setNotifications(data.notifications || []);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("lapor-warga", JSON.stringify({ user, reports, notifications }));
  }, [user, reports, notifications, hydrated]);

  const login = (u: User) => {
    setUser(u);
    if (reports.length === 0) setReports(seedReports(u.name));
    if (notifications.length === 0) setNotifications(seedNotifs());
  };

  const logout = () => {
    setUser(null);
    setReports([]);
    setNotifications([]);
    localStorage.removeItem("lapor-warga");
  };

  const addReport: State["addReport"] = (r) => {
    const id = `RPT-${String(Math.floor(Math.random() * 900) + 100)}`;
    const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    const report: Report = {
      ...r,
      id,
      author: r.anonymous ? "Anonim" : user?.name || "Warga",
      createdAt: new Date().toISOString().slice(0, 10),
      status: "menunggu",
      timeline: [
        { label: "Laporan Diterima", date: today, done: true },
        { label: "Petugas Ditunjuk", date: "-", done: false },
        { label: "Sedang Diperbaiki", date: "-", done: false },
        { label: "Selesai", date: "-", done: false },
      ],
    };
    setReports((prev) => [report, ...prev]);
    setNotifications((prev) => [
      { id: `n-${id}`, title: "Laporan Terkirim", body: `Laporan ${id} berhasil dikirim dan menunggu verifikasi petugas.`, date: today, read: false },
      ...prev,
    ]);
    return report;
  };

  const rateReport = (id: string, rating: number, feedback: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, rating, feedback } : r)));
  };

  const markNotifsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <Ctx.Provider value={{ user, reports, notifications, login, logout, addReport, rateReport, markNotifsRead }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const CATEGORIES = [
  { id: "Infrastruktur", icon: "🛣️", color: "bg-info/10 text-info" },
  { id: "Lingkungan", icon: "🌿", color: "bg-success/10 text-success" },
  { id: "Ketertiban", icon: "🚨", color: "bg-destructive/10 text-destructive" },
  { id: "Kesehatan", icon: "🏥", color: "bg-accent/10 text-accent" },
  { id: "Pendidikan", icon: "🎓", color: "bg-warning/10 text-warning" },
  { id: "Lainnya", icon: "📌", color: "bg-muted text-muted-foreground" },
];

export const STATUS_META: Record<ReportStatus, { label: string; className: string }> = {
  menunggu: { label: "Menunggu", className: "bg-warning/15 text-warning-foreground border-warning/30 text-[oklch(0.45_0.12_65)]" },
  diproses: { label: "Diproses", className: "bg-info/15 border-info/30 text-info" },
  selesai: { label: "Selesai", className: "bg-success/15 border-success/30 text-success" },
  eskalasi: { label: "Eskalasi", className: "bg-destructive/15 border-destructive/30 text-destructive" },
};

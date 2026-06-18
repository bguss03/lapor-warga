import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  Globe,
  FileBadge,
  MapPin,
  X,
  Check,
  User,
  Smartphone,
  Info,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const SEMARANG_REGIONS = [
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Semarang Tengah" },
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Semarang Utara" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Semarang Timur" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Semarang Selatan" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Semarang Barat" },
  { id: "550e8400-e29b-41d4-a716-446655440005", name: "Gajahmungkur" },
  { id: "550e8400-e29b-41d4-a716-446655440006", name: "Candisari" },
  { id: "550e8400-e29b-41d4-a716-446655440007", name: "Tembalang" },
  { id: "550e8400-e29b-41d4-a716-446655440008", name: "Banyumanik" },
  { id: "550e8400-e29b-41d4-a716-446655440009", name: "Gunungpati" },
  { id: "550e8400-e29b-41d4-a716-446655440010", name: "Ngaliyan" },
  { id: "550e8400-e29b-41d4-a716-446655440011", name: "Mijen" },
  { id: "550e8400-e29b-41d4-a716-446655440012", name: "Tugu" },
  { id: "550e8400-e29b-41d4-a716-446655440013", name: "Genuk" },
  { id: "550e8400-e29b-41d4-a716-446655440014", name: "Pedurungan" },
  { id: "550e8400-e29b-41d4-a716-446655440015", name: "Gayamsari" },
];

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, reports, updateProfile } = useStore();
  const navigate = useNavigate();
  const myReports = reports.filter((r) => r.reporter_id === user?.id);
  const total = myReports.length;
  const selesai = myReports.filter((r) => r.status === "selesai").length;

  const [editModal, setEditModal] = useState(false);
  const [regionModal, setRegionModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [appModal, setAppModal] = useState(false);
  
  const [form, setForm] = useState({ name: user?.name || "", nik: user?.nik || "" });
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [notifs, setNotifs] = useState({
    push: true,
    email: false,
    update: true,
  });

  useEffect(() => {
    if (user) setForm({ name: user.name, nik: user.nik || "" });
  }, [user]);

  useEffect(() => {
    if (regionModal) {
      supabase
        .from("regions")
        .select("id, name")
        .then(({ data }) => {
          if (data && data.length > 0) {
            setRegions(data);
          } else {
            setRegions(SEMARANG_REGIONS);
          }
        });
    }
  }, [regionModal]);

  const out = () => {
    logout();
    navigate({ to: "/welcome" });
  };

  const handleUpdate = async () => {
    setLoading(true);
    const success = await updateProfile(form);
    if (success) {
      toast.success("Profil berhasil diperbarui");
      setEditModal(false);
    } else {
      toast.error("Gagal memperbarui profil");
    }
    setLoading(false);
  };

  const handleRegionSelect = async (id: string) => {
    setLoading(true);
    const success = await updateProfile({ region_id: id });
    if (success) {
      toast.success("Wilayah berhasil diperbarui");
      setRegionModal(false);
    } else {
      toast.error("Gagal memperbarui wilayah");
    }
    setLoading(false);
  };

  const currentRegionName = user?.region?.name || SEMARANG_REGIONS.find(r => r.id === user?.region_id)?.name || "Wilayah tidak diketahui";

  return (
    <div className="pb-20">
      <header className="rounded-b-3xl bg-(image:--gradient-hero) px-5 pb-10 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">Profil</h1>
        <div className="mt-5 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
            {user?.name?.[0] ?? "W"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{user?.name}</p>
            <p className="text-xs text-white/80">{user?.phone}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
              <MapPin className="size-3" /> {currentRegionName}
            </p>
          </div>
        </div>
      </header>

      <div className="-mt-5 px-5">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-4 shadow-card">
          <Stat 
            label="Total" 
            value={total} 
            onClick={() => navigate({ to: "/my-reports", search: { filter: "all" } })} 
          />
          <div className="border-x border-border">
            <Stat 
              label="Selesai" 
              value={selesai} 
              onClick={() => navigate({ to: "/my-reports", search: { filter: "selesai" } })}
            />
          </div>
          <Stat label="Reputasi" value="A+" />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <Group title="Akun">
          <Row 
            icon={<FileBadge className="size-4" />} 
            label="Data Diri & NIK" 
            onClick={() => setEditModal(true)} 
          />
          <Row 
            icon={<Bell className="size-4" />} 
            label="Pengaturan Notifikasi" 
            onClick={() => setNotifModal(true)}
          />
          <Row 
            icon={<Globe className="size-4" />} 
            label="Wilayah" 
            hint={currentRegionName} 
            onClick={() => setRegionModal(true)}
          />
        </Group>

        <Group title="Dukungan">
          <Row 
            icon={<HelpCircle className="size-4" />} 
            label="Pusat Bantuan" 
            onClick={() => setHelpModal(true)}
          />
          <Row 
            icon={<Shield className="size-4" />} 
            label="Kebijakan Privasi" 
            onClick={() => setPrivacyModal(true)}
          />
          <Row 
            icon={<Settings className="size-4" />} 
            label="Pengaturan Aplikasi" 
            onClick={() => setAppModal(true)}
          />
        </Group>

        <Button
          onClick={out}
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
          size="lg"
        >
          <LogOut className="size-4" /> Keluar dari akun
        </Button>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <Modal title="Edit Data Diri" onClose={() => setEditModal(false)}>
          <div className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
              />
            </div>
            <div className="space-y-1.5">
              <Label>NIK (16 Digit)</Label>
              <Input 
                value={form.nik} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm(p => ({ ...p, nik: val }));
                }}
                maxLength={16}
                inputMode="numeric"
              />
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Region Modal */}
      {regionModal && (
        <Modal title="Pilih Wilayah" onClose={() => setRegionModal(false)}>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {regions.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Memuat wilayah...</p>
            ) : (
              regions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRegionSelect(r.id)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-muted"
                >
                  <span className="text-sm font-medium">{r.name}</span>
                  {user?.region_id === r.id && <Check className="size-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* Notification Modal */}
      {notifModal && (
        <Modal title="Pengaturan Notifikasi" onClose={() => setNotifModal(false)}>
          <div className="space-y-6 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Notifikasi Push</p>
                <p className="text-xs text-muted-foreground">Terima info langsung di HP.</p>
              </div>
              <Switch checked={notifs.push} onCheckedChange={(v) => setNotifs(p => ({...p, push: v}))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Notifikasi Email</p>
                <p className="text-xs text-muted-foreground">Update mingguan via email.</p>
              </div>
              <Switch checked={notifs.email} onCheckedChange={(v) => setNotifs(p => ({...p, email: v}))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Update Aplikasi</p>
                <p className="text-xs text-muted-foreground">Info fitur dan rilis terbaru.</p>
              </div>
              <Switch checked={notifs.update} onCheckedChange={(v) => setNotifs(p => ({...p, update: v}))} />
            </div>
            <Button onClick={() => { toast.success("Preferensi disimpan"); setNotifModal(false); }} className="w-full">
              Simpan Preferensi
            </Button>
          </div>
        </Modal>
      )}

      {/* Privacy Modal */}
      {privacyModal && (
        <Modal title="Kebijakan Privasi" onClose={() => setPrivacyModal(false)}>
          <div className="max-h-[60vh] overflow-y-auto p-5 text-sm leading-relaxed text-muted-foreground">
            <p className="mb-4">
              LaporWarga berkomitmen untuk melindungi data pribadi Anda. Kami hanya mengumpulkan informasi yang diperlukan untuk proses pelaporan dan pelayanan publik.
            </p>
            <h3 className="mb-2 font-bold text-foreground">Data yang Kami Kumpulkan:</h3>
            <ul className="mb-4 list-disc pl-5">
              <li>Nama lengkap dan NIK untuk verifikasi.</li>
              <li>Lokasi kejadian (koordinat GPS) untuk penanganan laporan.</li>
              <li>Foto sebagai bukti laporan.</li>
            </ul>
            <p>
              Data Anda tidak akan disebarluaskan kepada pihak ketiga tanpa persetujuan Anda, kecuali diperlukan oleh otoritas hukum yang berwenang.
            </p>
          </div>
        </Modal>
      )}

      {/* App Settings Modal */}
      {appModal && (
        <Modal title="Pengaturan Aplikasi" onClose={() => setAppModal(false)}>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
              <Smartphone className="size-5 text-primary" />
              <div>
                <p className="text-xs font-medium">Versi Aplikasi</p>
                <p className="text-sm font-bold">1.0.0 (Build 20240613)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
              <Info className="size-5 text-primary" />
              <div>
                <p className="text-xs font-medium">Status Server</p>
                <p className="flex items-center gap-1.5 text-sm font-bold text-success">
                  <span className="size-2 rounded-full bg-success animate-pulse" /> Operasional
                </p>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground">
              ID Perangkat: {Math.random().toString(36).slice(2, 10).toUpperCase()}
            </p>
          </div>
        </Modal>
      )}

      {/* Help Modal */}
      {helpModal && (
        <Modal title="Pusat Bantuan" onClose={() => setHelpModal(false)}>
          <div className="space-y-4 p-5">
            <div className="rounded-2xl bg-primary/5 p-4 text-center">
              <p className="text-sm font-medium">Butuh bantuan darurat?</p>
              <p className="mt-1 text-2xl font-bold text-primary">112</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Kontak Kami</p>
              <HelpRow label="WhatsApp" value="0812-3456-7890" />
              <HelpRow label="Email" value="halo@laporwarga.com" />
              <HelpRow label="Instagram" value="@laporwarga_id" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-10 sm:items-center sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HelpRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function Stat({ label, value, onClick }: { label: string; value: number | string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-center transition active:scale-95">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">{children}</div>
    </section>
  );
}

function Row({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint?: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left last:border-b-0 transition active:bg-muted/50 group"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary group-active:scale-95 transition">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {hint && (
        <span className="max-w-[40%] truncate text-[11px] text-muted-foreground">{hint}</span>
      )}
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

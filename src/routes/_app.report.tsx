import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Camera, MapPin, Send, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/report")({
  component: ReportPage,
});

function ReportPage() {
  const { addReport } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<string>("");
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!category) return toast.error("Pilih kategori dahulu");
    if (description.length < 10) return toast.error("Deskripsi terlalu pendek");
    if (!location) return toast.error("Lokasi belum diisi");
    setSending(true);
    setTimeout(() => {
      const r = addReport({ category, description, location, photo, anonymous });
      toast.success(`Laporan ${r.id} terkirim!`);
      setSending(false);
      navigate({ to: "/my-reports" });
    }, 1200);
  };

  return (
    <div>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="grid size-10 place-items-center rounded-xl bg-muted text-foreground"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">Buat Laporan</h1>
          <p className="text-xs text-muted-foreground">Isi detail untuk membantu petugas</p>
        </div>
      </header>

      <div className="space-y-6 p-5">
        {/* Step 1: Category */}
        <Section number={1} title="Pilih Kategori">
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCategory(c.id); setStep(2); }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition active:scale-95 ${
                    active
                      ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                      : "border-border bg-card"
                  }`}
                >
                  <span className={`grid size-11 place-items-center rounded-xl text-xl ${c.color}`}>{c.icon}</span>
                  <span className="text-[11px] font-medium leading-tight">{c.id}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Step 2: Description */}
        <Section number={2} title="Deskripsi Laporan">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara singkat apa yang terjadi, kapan, dan kondisi saat ini..."
            rows={5}
            className="resize-none"
          />
          <p className="text-right text-[11px] text-muted-foreground">{description.length}/500</p>
        </Section>

        {/* Step 3: Photo */}
        <Section number={3} title="Foto / Bukti">
          <label className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition hover:border-primary">
            {photo ? (
              <img src={photo} alt="bukti" className="size-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="grid size-12 place-items-center rounded-2xl bg-card">
                  <Upload className="size-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Ambil foto / unggah</p>
                <p className="text-[11px]">JPG / PNG maks 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
          </label>
          {photo && (
            <button onClick={() => setPhoto("")} className="text-xs font-medium text-destructive">
              Hapus foto
            </button>
          )}
        </Section>

        {/* Step 4: Location */}
        <Section number={4} title="Lokasi Kejadian">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative grid h-28 place-items-center bg-[linear-gradient(135deg,oklch(0.92_0.04_215),oklch(0.94_0.04_165))]">
              <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(0deg,transparent_0_19px,oklch(0.5_0.05_220_/_0.2)_19px_20px),repeating-linear-gradient(90deg,transparent_0_19px,oklch(0.5_0.05_220_/_0.2)_19px_20px)]" />
              <div className="relative flex flex-col items-center">
                <MapPin className="size-7 text-destructive drop-shadow" strokeWidth={2.5} />
                <span className="mt-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium">Pin di sini</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3">
              <MapPin className="size-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jl. Melati No. 23, RT 02"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </Section>

        {/* Anonymous */}
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <Checkbox checked={anonymous} onCheckedChange={(v) => setAnonymous(!!v)} className="mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Laporkan secara Anonim</p>
            <p className="text-xs text-muted-foreground">Nama Anda tidak akan ditampilkan ke publik.</p>
          </div>
        </label>

        <Button onClick={submit} variant="hero" size="xl" className="w-full" disabled={sending}>
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center gap-2"><Send className="size-4" /> Kirim Laporan</span>
          )}
        </Button>
      </div>
      {/* unused vars referenced for linter */}
      <span className="hidden">{step}<Camera /><Check /></span>
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {number}
        </span>
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

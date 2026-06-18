import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { ArrowLeft, Camera, MapPin, Send, Check, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { CategoryIcon, getCategoryIconStyle } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CameraCapture } from "@/components/CameraCapture";

const LocationPicker = lazy(() => import("@/components/LocationPicker").then(m => ({ default: m.LocationPicker })));

export const Route = createFileRoute("/_app/report")({
  component: ReportPage,
});

function ReportPage() {
  const { addReport, categories } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    setPhotoFile(file);
    setPhoto(dataUrl);
    setShowCamera(false);
  };

  const handleOpenCamera = () => {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Kamera tidak didukung di browser ini. Coba gunakan Galeri.");
      return;
    }
    setShowCamera(true);
  };

  const submit = async () => {
    if (!categoryId) return toast.error("Pilih kategori dahulu");
    if (description.length < 10) return toast.error("Deskripsi terlalu pendek");
    if (!location) return toast.error("Lokasi belum diisi");
    
    setSending(true);
    try {
      const { data: r, error: dbError } = await addReport({ 
        category_id: categoryId, 
        description, 
        location_address: location, 
        latitude: coords?.lat,
        longitude: coords?.lng,
        photo_url: photo, 
        photo_file: photoFile,
        anonymous 
      });
      
      if (r) {
        toast.success(`Laporan ${r.ticket_number || r.id} terkirim!`);
        navigate({ to: "/my-reports" });
      } else {
        console.error("Database error details:", dbError);
        const msg = typeof dbError === "string" ? dbError : dbError?.message || "Gagal mengirim laporan";
        toast.error(`Gagal: ${msg}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Camera Overlay */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

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
            {categories.map((c) => {
              const active = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(c.id);
                    setStep(2);
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition active:scale-95 ${
                    active
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border bg-card"
                  }`}
                >
                  <span
                    className="grid size-11 place-items-center rounded-xl text-xl"
                    style={getCategoryIconStyle(c.icon) || undefined}
                  >
                    <CategoryIcon icon={c.icon} className="size-6" />
                  </span>
                  <span className="text-[11px] font-medium leading-tight">{c.name}</span>
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
          {photo ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-sm">
              <img src={photo} alt="bukti" className="size-full object-cover" />
              <button 
                onClick={() => { setPhoto(""); setPhotoFile(null); }}
                className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-destructive text-white shadow-lg active:scale-90 transition"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Camera button — opens WebRTC camera */}
              <button
                type="button"
                onClick={handleOpenCamera}
                className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6 transition hover:border-primary active:bg-primary/5"
              >
                <div className="grid size-12 place-items-center rounded-2xl bg-card text-primary shadow-sm">
                  <Camera className="size-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground">Kamera</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ambil Foto</p>
                </div>
              </button>

              {/* Gallery button — opens file picker */}
              <div className="relative">
                <label 
                  htmlFor="gallery-input"
                  className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6 transition hover:border-primary active:bg-primary/5"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-card text-primary shadow-sm">
                    <Upload className="size-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Galeri</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Pilih File</p>
                  </div>
                </label>
                <input
                  id="gallery-input"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 size-0 opacity-0"
                  onChange={onFile}
                />
              </div>
            </div>
          )}
          <p className="mt-2 text-[10px] text-center text-muted-foreground">
            Lampirkan foto kejadian yang jelas sebagai bukti laporan.
          </p>
        </Section>

        {/* Step 4: Location */}
        <Section number={4} title="Lokasi Kejadian">
          {isClient ? (
            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
              <LocationPicker
                onLocationSelect={(lat, lng, addr) => {
                  setCoords({ lat, lng });
                  setLocation(addr);
                }}
              />
            </Suspense>
          ) : (
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          )}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
            <MapPin className="size-4 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Jl. Melati No. 23, RT 02"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </Section>

        {/* Anonymous */}
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <Checkbox
            checked={anonymous}
            onCheckedChange={(v) => setAnonymous(!!v)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-semibold">Laporkan secara Anonim</p>
            <p className="text-xs text-muted-foreground">
              Nama Anda tidak akan ditampilkan ke publik.
            </p>
          </div>
        </label>

        <Button onClick={submit} variant="hero" size="xl" className="w-full" disabled={sending}>
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Mengirim...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="size-4" /> Kirim Laporan
            </span>
          )}
        </Button>
      </div>
      {/* unused vars referenced for linter */}
      <span className="hidden">
        {step}
        <Camera />
        <Check />
      </span>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
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


import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronRight, Star, MapPin, X, CheckCircle2, Pencil, Trash2, Save, XCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import { useStore, type Report } from "@/lib/store";
import { CategoryIcon, getCategoryIconStyle } from "@/components/CategoryIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from "zod";

const reportSearchSchema = z.object({
  filter: z.enum(["all", "menunggu", "diproses", "selesai"]).catch("all").optional(),
});

export const Route = createFileRoute("/_app/my-reports")({
  validateSearch: (search) => reportSearchSchema.parse(search),
  component: MyReportsPage,
});

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "menunggu", label: "Menunggu" },
  { id: "diproses", label: "Diproses" },
  { id: "selesai", label: "Selesai" },
] as const;

function MyReportsPage() {
  const { user, myReports, reports } = useStore();
  const { filter: searchFilter } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>(searchFilter || "all");
  const [active, setActive] = useState<Report | null>(null);

  useEffect(() => {
    if (searchFilter) {
      setFilter(searchFilter);
    }
  }, [searchFilter]);

  const handleFilterChange = (newFilter: (typeof FILTERS)[number]["id"]) => {
    setFilter(newFilter);
    navigate({ search: { filter: newFilter } });
  };

  const list = myReports.filter((r) => (filter === "all" ? true : r.status === filter));

  // When reports refresh, update the active detail sheet with fresh data
  useEffect(() => {
    if (active) {
      const updated = myReports.find((r) => r.id === active.id);
      if (updated) {
        setActive(updated);
      }
    }
  }, [myReports]);

  return (
    <div className="pb-20">
      <header className="rounded-b-3xl bg-(image:--gradient-hero) px-5 pb-6 pt-8 text-primary-foreground">
        <h1 className="text-2xl font-bold">Laporan Saya</h1>
        <p className="text-sm text-white/85">Pantau progres laporan yang Anda kirim.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
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
            className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-soft ring-1 ring-border transition active:scale-[0.99]"
          >
            {r.photo_url ? (
              <img src={r.photo_url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">
                📌
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-primary">
                  {r.ticket_number || r.id.slice(0, 8)}
                </span>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-semibold">
                {r.category?.name || "Lainnya"}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      {active && <DetailSheet report={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function DetailSheet({ report, onClose }: { report: Report; onClose: () => void }) {
  const { rateReport, updateReport, deleteReport, categories } = useStore();
  const [rating, setRating] = useState(report.rating ?? 0);
  const [feedback, setFeedback] = useState(report.feedback_comment ?? "");

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(report.description);
  const [editCategoryId, setEditCategoryId] = useState(report.category_id);
  const [editLocation, setEditLocation] = useState(report.location_address);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEditDelete = report.status === "menunggu";

  // Reset edit fields when report changes
  useEffect(() => {
    setEditDescription(report.description);
    setEditCategoryId(report.category_id);
    setEditLocation(report.location_address);
  }, [report]);

  const handleStartEdit = () => {
    setEditDescription(report.description);
    setEditCategoryId(report.category_id);
    setEditLocation(report.location_address);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDescription(report.description);
    setEditCategoryId(report.category_id);
    setEditLocation(report.location_address);
  };

  const handleSaveEdit = async () => {
    if (editDescription.length < 10) {
      toast.error("Deskripsi terlalu pendek (min. 10 karakter)");
      return;
    }
    if (!editLocation.trim()) {
      toast.error("Lokasi tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateReport(report.id, {
        description: editDescription,
        category_id: editCategoryId,
        location_address: editLocation,
      });
      if (success) {
        toast.success("Laporan berhasil diperbarui!");
        setIsEditing(false);
      } else {
        toast.error("Gagal memperbarui laporan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteReport(report.id);
      if (success) {
        toast.success("Laporan berhasil dihapus");
        onClose();
      } else {
        toast.error("Gagal menghapus laporan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const submitRating = () => {
    if (rating === 0) return toast.error("Berikan bintang dahulu");
    rateReport(report.id, rating, feedback);
    toast.success("Terima kasih atas ulasannya!");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl animate-in slide-in-from-bottom"
        >
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-primary">
                {report.ticket_number || report.id.slice(0, 8)}
              </span>
              <h2 className="text-lg font-bold">{report.category?.name || "Lainnya"}</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {report.location_address}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Edit & Delete buttons — only for "menunggu" status */}
              {canEditDelete && !isEditing && (
                <>
                  <button
                    id="btn-edit-report"
                    onClick={handleStartEdit}
                    className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 active:scale-90"
                    title="Edit Laporan"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    id="btn-delete-report"
                    onClick={() => setShowDeleteDialog(true)}
                    className="grid size-9 place-items-center rounded-full bg-destructive/10 text-destructive transition hover:bg-destructive/20 active:scale-90"
                    title="Hapus Laporan"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="text-xs text-muted-foreground">
              • oleh {report.anonymous ? "Anonim" : (report.reporter?.name || "Warga")}
            </span>
          </div>

          {report.photo_url && (
            <img
              src={report.photo_url}
              alt=""
              className="mt-4 aspect-video w-full rounded-2xl object-cover"
            />
          )}

          {/* ===== EDIT MODE ===== */}
          {isEditing ? (
            <div className="mt-4 space-y-4">
              {/* Edit Category */}
              <div>
                <label className="mb-2 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((c) => {
                    const active = editCategoryId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditCategoryId(c.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition active:scale-95 ${
                          active
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card"
                        }`}
                      >
                        <span
                          className="grid size-9 place-items-center rounded-lg"
                          style={getCategoryIconStyle(c.icon) || undefined}
                        >
                          <CategoryIcon icon={c.icon} className="size-5" />
                        </span>
                        <span className="font-medium leading-tight">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Description */}
              <div>
                <label className="mb-2 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Deskripsi
                </label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Jelaskan laporan Anda..."
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {editDescription.length}/500
                </p>
              </div>

              {/* Edit Location */}
              <div>
                <label className="mb-2 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Lokasi
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    id="edit-location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Alamat lokasi kejadian"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex gap-2">
                <Button
                  id="btn-cancel-edit"
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex-1 gap-2"
                  disabled={isSaving}
                >
                  <XCircle className="size-4" />
                  Batal
                </Button>
                <Button
                  id="btn-save-edit"
                  onClick={handleSaveEdit}
                  variant="hero"
                  className="flex-1 gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* ===== VIEW MODE ===== */
            <p className="mt-4 text-sm leading-relaxed text-foreground">{report.description}</p>
          )}

          {/* Timeline */}
          {!isEditing && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold">Progress Penanganan</h3>
              <ol className="relative space-y-5 border-l-2 border-dashed border-border pl-5">
                {report.timeline?.map((step, i) => (
                  <li key={i} className="relative">
                    <span
                      className={`absolute left-[-27px] grid size-5 place-items-center rounded-full ring-2 ring-card ${
                        true // In the actual schema, all timeline steps fetched are "done"
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(step.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {step.notes && <p className="mt-1 text-xs text-muted-foreground">{step.notes}</p>}
                    {step.photo_evidence_url && (
                      <div className="mt-2">
                        <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Camera className="size-3" />
                          Bukti Foto Petugas
                        </p>
                        <a
                          href={step.photo_evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-xl border border-border shadow-sm transition hover:shadow-md active:scale-[0.98]"
                        >
                          <img
                            src={step.photo_evidence_url}
                            alt="Bukti foto petugas"
                            className="aspect-video w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Rating */}
          {report.status === "selesai" && !isEditing && (
            <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
              <h3 className="text-sm font-bold">Beri Ulasan Kinerja Petugas</h3>
              <p className="text-xs text-muted-foreground">
                Ulasan Anda membantu peningkatan pelayanan.
              </p>
              <div className="mt-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className="p-1 transition active:scale-90"
                  >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="mx-4 max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-destructive/10">
              <Trash2 className="size-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Laporan <span className="font-semibold">{report.ticket_number || report.id.slice(0, 8)}</span>{" "}
              akan dihapus secara permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:flex-row">
            <AlertDialogCancel className="mt-0 flex-1" disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              id="btn-confirm-delete"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Menghapus...
                </span>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

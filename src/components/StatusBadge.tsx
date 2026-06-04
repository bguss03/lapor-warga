import { STATUS_META, type ReportStatus } from "@/lib/store";

export function StatusBadge({ status }: { status: ReportStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.className}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}

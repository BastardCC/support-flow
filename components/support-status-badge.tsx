import { statusLabels } from "@/utils/support-labels";

export function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";
  const styles: Record<string, string> = {
    received: `${base} bg-amber-500/10 text-amber-800 ring-amber-500/25 dark:text-amber-200`,
    analyzing: `${base} bg-orange-500/10 text-orange-800 ring-orange-500/25 dark:text-orange-200 animate-pulse`,
    analyzed: `${base} bg-sky-500/10 text-sky-800 ring-sky-500/25 dark:text-sky-200`,
    replied: `${base} bg-emerald-500/10 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200`,
    closed: `${base} bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:text-zinc-300`,
  };
  return (
    <span className={styles[status] ?? `${base} bg-zinc-500/10 text-zinc-600`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

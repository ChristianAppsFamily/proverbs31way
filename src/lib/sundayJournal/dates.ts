const TZ = "America/Los_Angeles";

/** Calendar date YYYY-MM-DD in America/Los_Angeles. */
export function todayIso(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function formatRelativeTime(
  iso: string,
  now = new Date(),
): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((now.getTime() - then) / 1000);
  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) {
    const m = Math.max(1, Math.round(diffSec / 60));
    return `${m} min ago`;
  }
  if (diffSec < 86400) {
    const h = Math.max(1, Math.round(diffSec / 3600));
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.max(1, Math.round(diffSec / 86400));
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

type AffiliateBadgeProps = {
  className?: string;
};

export function AffiliateBadge({ className }: AffiliateBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-600 ring-1 ring-orange-200 ring-inset ${className ?? ""}`}
      aria-label="広告"
    >
      PR
    </span>
  );
}

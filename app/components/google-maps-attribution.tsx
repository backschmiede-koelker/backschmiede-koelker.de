// /app/components/google-maps-attribution.tsx
export default function GoogleMapsAttribution({ className = "" }: { className?: string }) {
  return (
    <span
      translate="no"
      className={[
        "whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400",
        className,
      ].join(" ")}
      aria-label="Google Maps"
      title="Google Maps"
    >
      Google Maps
    </span>
  );
}

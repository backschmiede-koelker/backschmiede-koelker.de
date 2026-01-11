// app/admin/analytics/line-chart.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Point = { x: string; y: number };
type Props = {
  data: Point[];
  maxPoints?: number;
  yLabel?: string;
  xLabel?: string;
  className?: string;
  /** Linieninterpolation: "linear" (wie vorher) oder "smooth" (Spline) */
  curve?: "linear" | "smooth";
  /** Glättungsgrad für "smooth" (0..1). 0.5-0.7 ist meist ideal. */
  tension?: number;
};

export default function LineChart({
  data,
  maxPoints = 60,
  yLabel,
  xLabel,
  className,
  curve = "smooth",
  tension = 0.6,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(360);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.max(240, Math.round(entries[0].contentRect.width));
      setWidth(w);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const isNarrow = width < 340;

  const height = isNarrow
    ? Math.max(280, Math.round(width * 0.95))
    : Math.max(220, Math.min(380, Math.round(width * 0.55)));

  // rechts mehr Luft, damit letzte Labels/Tooltip nie abgeschnitten werden
  const padding = useMemo(
    () => (isNarrow ? { top: 16, right: 22, bottom: 40, left: 40 } : { top: 20, right: 20, bottom: 44, left: 48 }),
    [isNarrow]
  );

  const effectiveMaxPoints = isNarrow ? Math.min(maxPoints, 40) : maxPoints;
  const sampled = useMemo(() => downsampleMinMax(data, effectiveMaxPoints), [data, effectiveMaxPoints]);

  const { maxY, yTicks, xTicks, pts, innerW } = useMemo(() => {
    const ys = sampled.map((d) => d.y);
    const max = Math.max(...ys, 1);
    const steps = 4;
    const step = Math.ceil(max / steps);
    const yTicks = Array.from({ length: steps + 1 }, (_, i) => i * step);

    const n = sampled.length;
    const xtCount = Math.min(isNarrow ? 4 : 6, Math.max(2, n));
    const intervals = xtCount - 1;
    const idx = Array.from({ length: xtCount }, (_, i) => Math.round((i * (n - 1)) / intervals));
    const fmtDate = (s: string) => {
      const d = new Date(s);
      const dd = `${d.getDate()}`.padStart(2, "0");
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      return `${dd}.${mm}.`;
    };
    const xTicks = idx.map((i) => ({ i, label: fmtDate(sampled[i].x) }));

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * innerW);
    const y = (v: number) => innerH - (v / (step * steps)) * innerH;

    const pts = sampled.map((d, i) => ({ px: padding.left + x(i), py: padding.top + y(d.y) }));
    return { maxY: step * steps, yTicks, xTicks, pts, innerW };
  }, [sampled, width, height, padding, isNarrow]);

  // --- Smooth-Helper: Catmull-Rom → Bézier ---
  function smoothPathFromPts(pts: { px: number; py: number }[], t = 0.6) {
    const n = pts.length;
    if (n < 2) return "";
    const p = pts.map((q) => [q.px, q.py] as const);

    const seg = (i: number) => {
      const p0 = i === 0 ? ([2 * p[0][0] - p[1][0], 2 * p[0][1] - p[1][1]] as const) : p[i - 1];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = i + 2 < n ? p[i + 2] : ([2 * p2[0] - p1[0], 2 * p2[1] - p1[1]] as const);

      const c1x = p1[0] + (p2[0] - p0[0]) * (t / 6);
      const c1y = p1[1] + (p2[1] - p0[1]) * (t / 6);
      const c2x = p2[0] - (p3[0] - p1[0]) * (t / 6);
      const c2y = p2[1] - (p3[1] - p1[1]) * (t / 6);
      return `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    };

    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < n - 1; i++) d += " " + seg(i);
    return d;
  }

  const path = useMemo(() => {
    if (!pts.length) return "";
    if (curve === "smooth" && pts.length >= 2) return smoothPathFromPts(pts, tension);
    // linear fallback
    return pts.map((p, i) => `${i ? "L" : "M"} ${p.px} ${p.py}`).join(" ");
  }, [pts, curve, tension]);

  const [hover, setHover] = useState<number | null>(null);

  const pickIndexByClientX = useCallback(
    (clientX: number) => {
      if (!svgRef.current || !pts.length) return;
      const rect = svgRef.current.getBoundingClientRect();
      const localX = clientX - rect.left - padding.left;
      const ratio = Math.max(0, Math.min(1, localX / innerW));
      const i = Math.round(ratio * Math.max(0, sampled.length - 1));
      setHover(i);
    },
    [innerW, pts.length, sampled.length, padding.left]
  );

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => pickIndexByClientX(e.clientX);
  const onTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches?.length) pickIndexByClientX(e.touches[0].clientX);
  };
  const onLeave = () => setHover(null);

  const fmtTooltipDate = (s: string) =>
    new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const tooltipBox = (i: number) => {
    const px = pts[i].px;
    const py = pts[i].py;
    const boxW = isNarrow ? 132 : 120;
    const boxH = isNarrow ? 46 : 40;
    const margin = 6;

    let boxX = px - boxW / 2;
    let boxY = py + margin + 8;

    if (boxY + boxH > height - padding.bottom) boxY = py - margin - boxH - 8;
    boxX = Math.max(padding.left, Math.min(boxX, width - padding.right - boxW));
    const markerY = boxY > py ? py + 6 : py - 6;

    return { boxX, boxY, boxW, boxH, markerY, px, py };
  };

  const tickFont = isNarrow ? 12 : 11;

  return (
    <div ref={containerRef} className={className}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full h-auto text-emerald-600 dark:text-emerald-400"
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
        onTouchStart={onTouchMove}
        onTouchMove={onTouchMove}
        role="img"
        aria-label="Zeitverlauf"
        style={{ touchAction: "none" }}
      >
        {/* Y-Label oben */}
        {yLabel && (
          <text x={padding.left} y={14} fontSize={tickFont} className="fill-zinc-600 dark:fill-zinc-400">
            {yLabel}
          </text>
        )}

        {/* Y-Raster + Labels */}
        {yTicks.map((t, i) => {
          const y = padding.top + (height - padding.top - padding.bottom) * (1 - t / maxY);
          return (
            <g key={`y-${i}`}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="stroke-zinc-200 dark:stroke-zinc-800" />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize={tickFont}
                className="fill-zinc-600 dark:fill-zinc-400"
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* X-Raster + Labels (erste/letzte Beschriftung an Rand ausrichten) */}
        {xTicks.map((t, idx) => {
          const x = padding.left + ((sampled.length <= 1 ? 0 : t.i / (sampled.length - 1)) * innerW);
          const y = height - padding.bottom;
          const isFirst = idx === 0;
          const isLast = idx === xTicks.length - 1;
          const anchor: "start" | "end" | "middle" = isFirst ? "start" : isLast ? "end" : "middle";
          const dx = isFirst ? 2 : isLast ? -2 : 0;
          return (
            <g key={`x-${t.i}`}>
              <line x1={x} x2={x} y1={padding.top} y2={y} className="stroke-zinc-100 dark:stroke-zinc-800" />
              <text
                x={x}
                y={height - padding.bottom + 16}
                dx={dx}
                textAnchor={anchor}
                fontSize={tickFont}
                className="fill-zinc-600 dark:fill-zinc-400"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* X-Achse */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          className="stroke-zinc-300 dark:stroke-zinc-700"
        />

        {/* X-Label unten rechts */}
        {xLabel && (
          <text
            x={width - padding.right}
            y={height - 8}
            textAnchor="end"
            fontSize={tickFont}
            className="fill-zinc-600 dark:fill-zinc-400"
          >
            {xLabel}
          </text>
        )}

        {/* Kurve */}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          shapeRendering="geometricPrecision"
        />

        {/* Hover-Linie & Tooltip */}
        {hover !== null && sampled[hover] && (
          <>
            <line
              x1={pts[hover].px}
              x2={pts[hover].px}
              y1={padding.top}
              y2={height - padding.bottom}
              className="stroke-emerald-500/60"
            />
            <circle cx={pts[hover].px} cy={pts[hover].py} r={3.8} className="fill-emerald-600 dark:fill-emerald-400" />
            {(() => {
              const b = tooltipBox(hover);
              return (
                <g>
                  <rect
                    x={b.boxX}
                    y={b.boxY}
                    width={b.boxW}
                    height={b.boxH}
                    rx={6}
                    className="fill-white dark:fill-zinc-800"
                    stroke="currentColor"
                    strokeOpacity={0.25}
                  />
                  <text x={b.boxX + 8} y={b.boxY + 16} fontSize={tickFont} className="fill-zinc-900 dark:fill-zinc-100">
                    {fmtTooltipDate(sampled[hover].x)}
                  </text>
                  <text x={b.boxX + 8} y={b.boxY + 32} fontSize={tickFont} className="fill-zinc-700 dark:fill-zinc-300">
                    {sampled[hover].y}
                  </text>
                  <circle cx={b.px} cy={b.markerY} r={2} className="fill-emerald-600 dark:fill-emerald-400" />
                </g>
              );
            })()}
          </>
        )}
      </svg>
    </div>
  );
}

/** Downsampling: behält Form durch Min/Max je Bucket + Endpunkte */
function downsampleMinMax(input: Point[], maxPoints: number): Point[] {
  const n = input.length;
  if (n <= maxPoints) return input;
  const keep: { i: number; p: Point }[] = [{ i: 0, p: input[0] }];
  const buckets = maxPoints - 2;
  const size = Math.ceil((n - 2) / buckets);
  for (let start = 1; start < n - 1; start += size) {
    const end = Math.min(n - 1, start + size);
    let minI = start,
      maxI = start;
    for (let i = start; i < end; i++) {
      if (input[i].y < input[minI].y) minI = i;
      if (input[i].y > input[maxI].y) maxI = i;
    }
    if (minI !== maxI) {
      keep.push({ i: minI, p: input[minI] }, { i: maxI, p: input[maxI] });
    } else {
      keep.push({ i: minI, p: input[minI] });
    }
  }
  keep.push({ i: n - 1, p: input[n - 1] });
  keep.sort((a, b) => a.i - b.i);
  const out: Point[] = [];
  let last = -1;
  for (const k of keep) {
    if (k.i !== last) out.push(k.p);
    last = k.i;
  }
  return out;
}

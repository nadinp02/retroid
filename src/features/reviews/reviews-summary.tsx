import { StarRating } from "@/components/star-rating";
import type { ReviewSummary } from "@/types/reviews";

const BARS = [5, 4, 3, 2, 1] as const;

export function ReviewsSummary({ summary }: { summary: ReviewSummary }) {
  if (summary.count === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay reseñas — ¡sé el primero en dejar la tuya!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex shrink-0 flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <StarRating rating={summary.average} size="lg" />
          <span className="font-mono text-2xl font-semibold">{summary.average.toFixed(1)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Basado en {summary.count} reseña{summary.count === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {BARS.map((stars) => {
          const value = summary.breakdown[stars];
          const percent = summary.count > 0 ? (value / summary.count) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-12 shrink-0 font-mono uppercase">{stars} ★</span>
              <div className="h-1.5 flex-1 overflow-hidden bg-muted">
                <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right tabular-nums">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

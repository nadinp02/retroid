import { Star } from "lucide-react";
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
      <div className="flex shrink-0 flex-col items-start gap-1.5 sm:border-r sm:border-border sm:pr-6">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl font-semibold tabular-nums">
            {summary.average.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">/ 5</span>
        </div>
        <StarRating rating={summary.average} size="lg" />
        <p className="text-sm text-muted-foreground">
          Basado en {summary.count} reseña{summary.count === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        {BARS.map((stars) => {
          const value = summary.breakdown[stars];
          const percent = summary.count > 0 ? (value / summary.count) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex w-9 shrink-0 items-center gap-1 font-mono tabular-nums">
                {stars}
                <Star className="size-3 fill-current text-muted-foreground/50" />
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right font-mono tabular-nums">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

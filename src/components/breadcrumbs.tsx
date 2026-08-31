import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

// Migas de pan genéricas: el último item nunca es link (es la página
// actual). font-mono/uppercase para calzar con el resto de la nav del
// header.
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && <ChevronRight className="size-3 shrink-0" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link href={item.href} className="shrink-0 transition-colors hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "truncate text-foreground" : "shrink-0"}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

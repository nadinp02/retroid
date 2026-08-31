"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_DELAY_MS = 600;
const MAX_DELAY_MS = 1200;
const MIN_DURATION_MS = 150;
const MAX_DURATION_MS = 280;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Dispara el glitch solo (sin hover) cada 0.6-1.2s, con una duración bien
 * corta — rápido a propósito para que se note antes de que el usuario se
 * vaya de la página. Corre también en mobile porque no depende de :hover.
 * Respeta prefers-reduced-motion no programando ningún timer.
 */
export function GlitchText({ children, className }: { children: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let durationTimer: ReturnType<typeof setTimeout>;
    let delayTimer: ReturnType<typeof setTimeout>;

    function scheduleGlitch() {
      delayTimer = setTimeout(() => {
        setIsGlitching(true);
        durationTimer = setTimeout(() => {
          setIsGlitching(false);
          scheduleGlitch();
        }, randomBetween(MIN_DURATION_MS, MAX_DURATION_MS));
      }, randomBetween(MIN_DELAY_MS, MAX_DELAY_MS));
    }

    scheduleGlitch();
    return () => {
      clearTimeout(delayTimer);
      clearTimeout(durationTimer);
    };
  }, []);

  return (
    <span
      data-text={children}
      className={cn("glitch-auto", isGlitching && "is-glitching", className)}
    >
      {children}
      {/* Tercera capa de la interferencia (ver .glitch-slice en
          globals.css) — duplicado decorativo, oculto de lectores de
          pantalla porque el texto real ya está arriba. */}
      <span aria-hidden="true" className="glitch-slice">
        {children}
      </span>
    </span>
  );
}

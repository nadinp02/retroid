"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type WhatsAppButtonProps = {
  url: string;
  label: ReactNode;
  event: AnalyticsEvent;
} & Omit<ComponentProps<typeof Button>, "render" | "children">;

export function WhatsAppButton({ url, label, event, ...buttonProps }: WhatsAppButtonProps) {
  return (
    <Button
      render={
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(event)}>
          {label}
        </a>
      }
      {...buttonProps}
    />
  );
}

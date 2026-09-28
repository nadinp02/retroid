// Capa de analytics preparada pero sin proveedor real todavía (GA/Meta
// Pixel quedan para una fase futura). Client-safe: no lee env vars server-
// only, se puede importar desde componentes de cliente.

export type AnalyticsEvent =
  | { name: "whatsapp_click_card"; productId: string; productSlug: string }
  | { name: "whatsapp_click_detail"; productId: string; productSlug: string }
  | { name: "whatsapp_click_general" }
  | { name: "whatsapp_click_float" };

export function trackEvent(event: AnalyticsEvent) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[analytics]", event.name, event);
  }
  // TODO(fase futura): enviar `event` a GA/Meta Pixel u otro proveedor acá.
}

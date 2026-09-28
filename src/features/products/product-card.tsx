import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { formatPrice } from "@/utils/price";
import { buildWhatsAppUrl, buildProductWhatsAppMessage } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { ProductWithRelations } from "@/types/catalog";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  // PRODUCT_CARD_RELATIONS ya trae como mucho 2 imágenes: portada
  // (position 0) y, si existe, la marcada como hover — independiente de su
  // posición real en la galería completa del producto.
  const [coverImage, hoverImage] = product.images;
  const productUrl = `${siteConfig.url}/productos/${product.slug}`;
  const whatsappUrl = buildWhatsAppUrl(
    buildProductWhatsAppMessage({ name: product.name, price: product.price, url: productUrl }),
  );

  return (
    <div className="group flex flex-col border border-border bg-card transition-colors duration-150 hover:border-accent">
      <Link href={`/productos/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden border-b border-border bg-muted">
          {coverImage ? (
            <>
              <Image
                src={coverImage.url}
                alt={coverImage.alt ?? product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={`object-cover ${hoverImage ? "transition-opacity duration-300 ease-out group-hover:opacity-0" : ""}`}
              />
              {/* Sin JS: :hover del contenedor alcanza directo (no existe en
                  mobile, así que ahí queda siempre la portada, tal como se
                  pidió). Independiente de la galería completa del detalle. */}
              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt={hoverImage.alt ?? product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="font-mono text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            {product.category.name}
          </p>
          <h3 className="line-clamp-2 font-medium">{product.name}</h3>
          <p className="mt-auto pt-1 font-mono text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <WhatsAppButton
          url={whatsappUrl}
          label={
            <>
              <MessageCircle className="size-3.5" />
              Comprar
            </>
          }
          event={{ name: "whatsapp_click_card", productId: product.id, productSlug: product.slug }}
          variant="outline"
          size="sm"
          className="w-full"
        />
      </div>
    </div>
  );
}

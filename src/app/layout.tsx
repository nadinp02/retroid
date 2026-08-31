import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { ScanlineOverlay } from "@/components/scanline-overlay";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fuente display para el hero y títulos hero de la Home (--font-display en
// globals.css). Deliberadamente separada de --font-heading (que sigue
// siendo Geist Sans y alimenta CardTitle en el panel de admin) para no
// cambiarle la tipografía al admin.
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const DEFAULT_TITLE = "RETROID | Consolas Retro, Nintendo DS y 3DS Argentina";
const DEFAULT_DESCRIPTION =
  "Compra y venta de consolas retro, Nintendo DS, Nintendo 3DS, cartuchos, accesorios y estuches. Envíos a todo Argentina.";
const DEFAULT_OG_IMAGE = {
  url: "/banner.jpg",
  width: 1279,
  height: 929,
  alt: "RETROID — consolas retro Nintendo DS y 3DS",
};

// metadataBase resuelve toda URL relativa (openGraph.images, alternates.canonical,
// etc.) de esta y las demás páginas contra siteConfig.url — que en producción
// sale de AUTH_URL. No hace falta repetir el dominio absoluto en cada página.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | RETROID",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Nintendo 3DS Argentina",
    "Nintendo DS usada",
    "consolas retro Argentina",
    "cartuchos Nintendo DS",
    "R4 DS",
    "accesorios Nintendo",
    "estuches Nintendo 3DS",
    "compra venta consolas retro",
  ],
  authors: [{ name: siteConfig.companyName }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: siteConfig.companyName,
    url: siteConfig.url,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Dark-first sin selector claro/oscuro: la clase "dark" queda fija acá,
    // no depende de prefers-color-scheme ni de ningún toggle.
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ScanlineOverlay />
      </body>
    </html>
  );
}

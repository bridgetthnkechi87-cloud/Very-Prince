import type { Metadata, Viewport } from "next";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/getDictionary";

// ── Layout Types ──────────────────────────────────────────────────────────────

export interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    lang: Locale;
  };
}

// ── SEO Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    ),
    title: {
      template: "%s | very-prince",
      default: dictionary.home.title,
    },
    description: dictionary.home.description,
    keywords: ["Stellar", "Soroban", "DeFi", "Open Source", "Payouts"],
    openGraph: {
      siteName: "very-prince",
      title: dictionary.home.title,
      description: dictionary.home.description,
      type: "website",
      locale:
        params.lang === "en"
          ? "en_US"
          : params.lang === "es"
          ? "es_ES"
          : "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.home.title,
      description: dictionary.home.description,
    },
  };
}

// ── Viewport ──────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

// ── Layout Component ──────────────────────────────────────────────────────────
// NOTE: Do NOT render <html> or <body> here — the root src/app/layout.tsx
// already does that. Nesting them breaks CSS entirely.

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return <>{children}</>;
}

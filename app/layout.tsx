// /app/layout.tsx
import "./globals.css";
import { Providers } from "./providers/theme-provider";
import LayoutWrapper from "./components/layout-wrapper";
import Footer from "./components/footer";
import { localBusinessJsonLd } from "./lib/seo";
import AnalyticsBeacon from "./components/analytics-beacon";

const building = true;

function BuildingPage() {
  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-100 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <p className="text-xs sm:text-sm text-zinc-400 tracking-widest uppercase">
            Coming soon
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Im Aufbau.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-prose">
            Wir sind bald online da — mit neuen Inhalten und frischem Design.
          </p>

          <div className="mt-8 h-px w-full bg-white/10" />

          <p className="mt-4 text-xs sm:text-sm text-zinc-500">
            Danke für deine Geduld.
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] sm:text-xs text-zinc-600">
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (building) {
    return (
      <html lang="de" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
          />
        </head>
        <body className="bg-zinc-950 text-zinc-100 overflow-x-hidden">
          <BuildingPage />
          <AnalyticsBeacon />
        </body>
      </html>
    );
  }

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <div className="ml-0 md:ml-72">
            <Footer />
          </div>
          <AnalyticsBeacon />
        </Providers>
      </body>
    </html>
  );
}

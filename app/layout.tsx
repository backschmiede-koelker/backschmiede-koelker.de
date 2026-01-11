// /app/layout.tsx
import "./globals.css";

import { Providers } from "./providers/theme-provider";
import LayoutWrapper from "./components/layout-wrapper";
import Footer from "./components/footer";
import { localBusinessJsonLd } from "./lib/seo";
import AnalyticsBeacon from "./components/analytics-beacon";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <Suspense fallback={null}>
            <AnalyticsBeacon />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

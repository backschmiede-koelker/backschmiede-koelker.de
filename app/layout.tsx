import "./globals.css";
import { Providers } from './providers/theme-provider';
import LayoutWrapper from "./components/layout-wrapper";
import { localBusinessJsonLd } from "./lib/seo";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }} />
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
        { /* delete for auto theme*/ }
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        { /* delete for auto theme*/ }
        </Providers>
      </body>
    </html>
  );
}

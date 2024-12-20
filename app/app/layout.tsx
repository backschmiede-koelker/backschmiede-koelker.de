'client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import AddressLink from "./components/address-link";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backschmiede Kölker",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className={'app'}>
          <div className={'sidebar'}>
            <a href="/" className={'sidebar-logo'}>

            </a>
            <div>
              <ul>
                <li>
                  <a href="#ABOUT_US">ÜBER UNS</a>
                </li>
                <li>
                  <a href="#CALENDAR">WAS STEHT AN</a>
                </li>
                <li>
                  <a href="#WARES">UNSERE WARE</a>
                </li>
                <li>
                  <a href="#CONTACT">SO EREICHST DU UNS</a>
                </li>
              </ul>
            </div>
            <AddressLink />
          </div>
          <main className="content">
            {children}
            <Footer/>
          </main>
        </div>
      </body>
    </html>
  );
}

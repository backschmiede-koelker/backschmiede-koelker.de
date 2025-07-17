'client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import AddressLink from "./components/address-link";
import Footer from "./components/footer";
import Image from 'next/image';
import Link from 'next/link'
import { FaInstagram, FaLocationDot } from "react-icons/fa6";

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
             <Image
               className="sidebar-logo"
                src="/Logo1.jpg"
                width={500}
                height={500}
                alt="Sidebar Logo"
              />
            <div>
              <ul>
                <li>
                  <Link href={"https://www.instagram.com/backschmiede_koelker?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}>
                    <FaInstagram size={24}/>
                    <p>@Backschmiede Koelker</p>
                  </Link>
                </li>
                <li>
                  <Link href={"https://maps.app.goo.gl/gyHqK9nJXGHv4oxX6"}>
                    <FaLocationDot size={24}/>
                    <p>Landrat-Schultz-Straße 1<br/> 49497 Mettingen</p>
                  </Link>
                </li>
                <li>
                  <Link href={"https://maps.app.goo.gl/v7fAobfiUPDe8xTV6"}>
                    <FaLocationDot size={24}/>
                    <p>Hauptstraße 12<br/>49509 Recke</p>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <main className="content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

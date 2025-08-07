'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaLocationDot } from 'react-icons/fa6';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 w-64 h-screen bg-green-700 dark:bg-green-900 text-white z-50 p-6 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      {/* Schließen-Button nur auf Mobile sichtbar */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={onClose}
          className="text-white text-2xl font-bold px-3 py-1 rounded transition-transform duration-300 hover:rotate-90 active:scale-90 hover:brightness-110 focus:outline-none"
          aria-label="Seitenleiste schließen"
        >
          ✕
        </button>
      </div>

      {/* Light Mode Logo */}
      <Image
        src="/Logo1-transparent-komplett-schwarz.png"
        alt="Logo Light"
        width={180}
        height={180}
        className="mb-8 mx-auto rounded-xl block dark:hidden"
      />
      {/* Dark Mode Logo */}
      <Image
        src="/Logo1-transparent-komplett-weiß.png"
        alt="Logo Dark"
        width={180}
        height={180}
        className="mb-8 mx-auto rounded-xl hidden dark:block"
      />
      <ul className="space-y-6 text-sm">
        <p className="">
          Mettingen:
        </p>
        <li>
          <Link href="https://www.instagram.com/backschmiede_koelker">
            <span className="flex items-center gap-2">
              <FaInstagram /> @Backschmiede Kölker
            </span>
          </Link>
        </li>
        <li>
          <Link href="https://maps.app.goo.gl/gyHqK9nJXGHv4oxX6">
            <span className="flex items-center gap-2">
              <FaLocationDot /> Mettingen
            </span>
          </Link>
        </li>
        <p className="">
          Recke:
        </p>
        <li>
          <Link href="https://www.instagram.com/recke.backschmiede_koelker">
            <span className="flex items-center gap-2">
              <FaInstagram /> @Backschmiede Kölker
            </span>
          </Link>
        </li>
        <li>
          <Link href="https://maps.app.goo.gl/v7fAobfiUPDe8xTV6">
            <span className="flex items-center gap-2">
              <FaLocationDot /> Recke
            </span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

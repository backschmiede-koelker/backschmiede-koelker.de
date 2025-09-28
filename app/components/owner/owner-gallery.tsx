// File: /app/components/owner/owner-gallery.tsx
"use client";
import { InViewReveal } from "../animations/in-view";
import { motion as m } from "motion/react";

export default function OwnerGallery() {
  const images = [
    { src: "/products/vanillekipferl.jpg", alt: "Teig wirkt" },
    { src: "/products/vollkornbrot.webp", alt: "Brot aus dem Ofen" },
    { src: "/products/weizenbroetchen.jpg", alt: "Korn & Mehl" },
    { src: "/mettingen-und-recke.png", alt: "Ladenansicht" },
  ];
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <InViewReveal
            key={img.src}
            y={30}
            delay={i * 0.05}
            className="group relative overflow-hidden rounded-2xl shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-900"
            visibility={{ amountEnter: 0.08, amountLeave: 0 }}
          >
            <m.img
              src={img.src}
              alt={img.alt}
              className="h-44 sm:h-48 md:h-56 w-full object-cover transition duration-300 group-hover:scale-105"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <m.figcaption
              className="absolute inset-x-0 bottom-0 p-2 text-xs bg-gradient-to-t from-black/50 to-transparent text-white group-hover:opacity-100"
              initial={{ opacity: 0, y: 6 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {img.alt}
            </m.figcaption>
          </InViewReveal>
        ))}
      </div>
    </section>
  );
}

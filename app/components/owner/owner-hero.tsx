// File: /app/components/owner/owner-hero.tsx
"use client";
import { motion as m } from "motion/react";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { InViewReveal, StaggerContainer, StaggerItem } from "../animations/in-view";

export default function OwnerHero() {
  return (
    <InViewReveal
      as={m.section}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-zinc-900 shadow"
      y={60}
      visibility={{ amountEnter: 0.06, amountLeave: 0, rootMargin: "0px 0px 0px 0px", debounceMs: 80 }}
    >
      <div className="absolute inset-0 bg-[url('/owner/grain.png')] opacity-10 pointer-events-none" />
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 p-5 md:p-12">
        <StaggerContainer className="flex min-w-0 flex-col justify-center">
          <StaggerItem>
            <span className="inline-flex items-center w-fit rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1 text-[11px] md:text-xs font-medium mb-3 md:mb-4">
              Inhaber & Bäckermeister
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-[28px] leading-8 sm:text-4xl md:text-5xl font-black tracking-tight">Josua Kölker</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-3 md:mt-4 text-[15px] md:text-lg leading-6 md:leading-7 text-zinc-700 dark:text-zinc-300 max-w-prose">
              Handwerk, Zeit und regionale Zutaten – das ist die DNA der Backschmiede
              Kölker. Josua steht jeden Morgen am Ofen, liebt lange Teigführungen und
              echte Kruste. Hier verbinden sich Tradition und moderne Backkultur.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-5 md:mt-6 flex flex-wrap gap-2.5 md:gap-3">
              <a
                href="mailto:hallo@backschmiede.de"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-3.5 md:px-4 py-2 text-sm hover:border-emerald-300 hover:text-emerald-700 dark:hover:border-emerald-700 transition"
              >
                <Mail className="h-4 w-4" /> Kontakt
              </a>
              <a
                href="tel:+49-000-000000"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-3.5 md:px-4 py-2 text-sm shadow hover:bg-emerald-700 transition"
              >
                <Phone className="h-4 w-4" /> Anrufen
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3.5 md:px-4 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-5 md:mt-6 text-xs md:text-sm opacity-80 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Bruchhausen, NRW – Backstube & Laden
            </div>
          </StaggerItem>
        </StaggerContainer>

        <InViewReveal as={m.div} y={50} className="relative min-w-0" visibility={{ amountEnter: 0.08, amountLeave: 0 }}>
          <m.img
            src="/owner/josua_ofen.jpg"
            alt="Inhaber Josua am Ofen"
            className="w-full h-[320px] sm:h-[380px] md:h-[420px] object-cover rounded-2xl shadow-xl ring-1 ring-zinc-200/60 dark:ring-zinc-700"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          {/* Stats: mobil gestapelt (static), ab md absolut */}
          <div className="mt-3 grid grid-cols-3 gap-2 md:mt-0 md:absolute md:-bottom-5 md:left-6 md:right-6 md:mx-auto md:grid-cols-3 md:gap-3">
            {[
              { label: "Sauerteig", value: "100%" },
              { label: "Handwerk", value: "24/7" },
              { label: "Regional", value: "✔️" },
            ].map((item, i) => (
              <InViewReveal
                key={item.label}
                y={12}
                delay={i * 0.05}
                duration={0.5}
                visibility={{ amountEnter: 0.08, amountLeave: 0 }}
                className="rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow p-2.5 md:p-3 text-center border border-zinc-200 dark:border-zinc-800"
              >
                <div className="text-[10px] md:text-xs opacity-70">{item.label}</div>
                <div className="text-base md:text-lg font-semibold">{item.value}</div>
              </InViewReveal>
            ))}
          </div>
        </InViewReveal>
      </div>
    </InViewReveal>
  );
}

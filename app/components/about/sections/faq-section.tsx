// app/components/about/sections/faq-section.tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

type Faq = NonNullable<AboutSectionDTO["faqs"]>[number];

function clampId(id: string) {
  return `about-faq-${String(id).replace(/[^a-z0-9_-]/gi, "")}`;
}

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  const contentId = clampId(item.id);

  return (
    <div className="group relative">
      {/* Subtle “premium” border with hover accent */}
      <div
        className={[
          "rounded-2xl p-[1px]",
          "bg-gradient-to-r from-zinc-200/70 via-zinc-200/40 to-zinc-200/70",
          "dark:from-zinc-800/80 dark:via-zinc-800/40 dark:to-zinc-800/80",
          open
            ? "from-emerald-200/80 via-zinc-200/40 to-amber-200/70 dark:from-emerald-700/30 dark:via-zinc-800/40 dark:to-amber-700/25"
            : "group-hover:from-emerald-200/70 group-hover:to-amber-200/60 dark:group-hover:from-emerald-700/25 dark:group-hover:to-amber-700/18",
        ].join(" ")}
      >
        <div
          className={[
            "rounded-2xl",
            "bg-white/90 dark:bg-zinc-900/60 backdrop-blur",
            "ring-1 ring-zinc-200/60 dark:ring-zinc-800/70",
            "shadow-[0_10px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.35)]",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={contentId}
            className={[
              "w-full text-left",
              "px-3 sm:px-4 md:px-5 py-3.5 sm:py-4",
              "flex items-start gap-3 sm:gap-4",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              "dark:focus-visible:ring-emerald-400/25 dark:focus-visible:ring-offset-zinc-950",
            ].join(" ")}
          >
            {/* Left accent */}
            <span
              className={[
                "mt-1.5 h-2.5 w-2.5 rounded-full flex-none",
                open ? "bg-emerald-600 dark:bg-emerald-400" : "bg-zinc-300 dark:bg-zinc-700",
                "shadow-[0_0_0_5px_rgba(16,185,129,0.10)] dark:shadow-[0_0_0_5px_rgba(16,185,129,0.14)]",
                open ? "" : "shadow-none dark:shadow-none",
              ].join(" ")}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm md:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 break-words">
                  {item.question}
                </h3>

                <motion.span
                  aria-hidden
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={[
                    "flex-none inline-grid place-items-center",
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-full",
                    open
                      ? "bg-emerald-600 text-white ring-1 ring-emerald-600/30"
                      : "bg-zinc-100/80 text-zinc-700 ring-1 ring-zinc-200/70",
                    "dark:bg-zinc-800/60 dark:text-zinc-100 dark:ring-zinc-700/60",
                    open ? "dark:bg-emerald-500 dark:ring-emerald-400/30" : "",
                    "transition-colors",
                  ].join(" ")}
                >
                  <ChevronDown className="h-4 w-4 sm:h-4 sm:w-4" />
                </motion.span>
              </div>
            </div>
          </button>

          {/* Animated content */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={contentId}
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.18, ease: "easeOut" },
                }}
                className="overflow-hidden"
              >
                <div className="px-3 sm:px-4 md:px-5 pb-4 sm:pb-5">
                  <div className="rounded-xl bg-zinc-50/90 dark:bg-zinc-950/35 ring-1 ring-zinc-200/60 dark:ring-zinc-800/70 px-4 py-3">
                    <motion.p
                      initial={{ y: -4 }}
                      animate={{ y: 0 }}
                      exit={{ y: -4 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line break-words"
                    >
                      {item.answer}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AboutFaqSection({ section }: { section: AboutSectionDTO }) {
  // Single-open feels "premium" and calmer.
  const [openId, setOpenId] = React.useState<string | null>(null);

  const faqs = section.faqs ?? [];
  if (!faqs.length) return null;

  return (
    <AboutCard className="relative overflow-hidden">
      {/* very subtle inner accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/10" />

      <div className="relative">
        <AboutSectionHeading
          title={section.title ?? "Fragen & Antworten"}
          subtitle={section.subtitle ?? "Alles Wichtige auf einen Blick."}
        />

        <div className="mt-5 space-y-3">
          {faqs.map((f) => {
            const open = openId === f.id;
            return (
              <FaqRow
                key={f.id}
                item={f}
                open={open}
                onToggle={() => setOpenId(open ? null : f.id)}
              />
            );
          })}
        </div>
      </div>
    </AboutCard>
  );
}

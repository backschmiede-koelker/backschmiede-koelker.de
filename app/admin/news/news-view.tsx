"use client";

import { useEffect, useState } from "react";
import { useNews } from "../../hooks/use-news";
import ImageUploader from "../../components/image-uploader";
import SelectBox from "../../components/select-box";
import { KNOWN_PAGES } from "../../lib/known-pages";
import AdminPageHeader from "../components/admin-page-header";

const PREDEFINED_TAGS = ["Kein Tag ausgewählt", "Aktion", "Event", "Info"];
const LABEL = "block text-sm font-medium leading-5 h-5 mb-1";
function todayLocalYMD() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function AdminNewsView() {
  const { items, loading, reload, remove } = useNews();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [useKnownTag, setUseKnownTag] = useState(true);
  const [tag, setTag] = useState("Kein Tag ausgewählt");

  const [ctaLabel, setCtaLabel] = useState("");
  const [useKnownPage, setUseKnownPage] = useState(true);
  const [ctaHref, setCtaHref] = useState("Keine");

  const [imageUrl, setImageUrl] = useState("");

  const [publishedAt, setPublishedAt] = useState("");
  useEffect(() => {
    setPublishedAt(todayLocalYMD());
  }, []);

  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const tagValid = useKnownTag ? tag !== "Kein Tag ausgewählt" : !!tag.trim();
  const ctaValid = !ctaLabel || (ctaLabel && (useKnownPage ? true : !!ctaHref));
  const formValid = !!title.trim() && !!body.trim() && tagValid && ctaValid;

  async function create() {
    if (!formValid) return;
    setSaving(true);
    try {
      const hrefFinal = ctaLabel.trim()
        ? (useKnownPage
            ? (ctaHref === "Keine" ? null : (KNOWN_PAGES.find((p) => p.label === ctaHref)?.href || null))
            : (ctaHref || null))
        : null;

      const tagFinal = useKnownTag ? (tag === "Kein Tag ausgewählt" ? null : tag) : (tag.trim() || null);

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body,
          tag: tagFinal,
          imageUrl: imageUrl || null,
          ctaLabel: ctaLabel.trim() || null,
          ctaHref: hrefFinal,
          publishedAt,
          isActive,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Fehler beim Anlegen");
        return;
      }

      setTitle("");
      setBody("");
      setUseKnownTag(true);
      setTag("Kein Tag ausgewählt");
      setImageUrl("");
      setCtaLabel("");
      setUseKnownPage(true);
      setCtaHref("Keine");
      setPublishedAt(todayLocalYMD());
      setIsActive(true);
      await reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="News"
        subtitle="Neuigkeiten, Änderungen und Ankündigungen."
      /> 

      {/* Create-Form */}
      <div className="min-w-0 space-y-6 rounded-2xl border bg-white/90 p-4 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6">
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          {/* Titel */}
          <div className="min-w-0 space-y-2">
            <label className={LABEL}>Titel</label>
            <input
              className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. 🥳 Neuer Sonntagsbrunch"
            />
          </div>

          {/* Tag */}
          <div className="min-w-0 space-y-2">
            <label className={LABEL}>Tag</label>
            {useKnownTag ? (
              <SelectBox
                ariaLabel="Tag wählen"
                value={tag}
                onChange={setTag}
                options={[...PREDEFINED_TAGS]}
                placeholder="Kein Tag ausgewählt"
              />
            ) : (
              <input
                className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                placeholder="(z. B. Ankündigung)"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            )}

            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useKnownTag}
                  onChange={(e) => {
                    const useKnown = e.target.checked;
                    setUseKnownTag(useKnown);
                    if (useKnown) setTag(PREDEFINED_TAGS.includes(tag) ? tag : "Kein Tag ausgewählt");
                    else setTag("");
                  }}
                />
                Aus vordefinierten Tags wählen
              </label>
            </div>

            <div className="min-h-4">
              {!tagValid ? (
                <div className="text-xs text-red-600">Bitte einen Tag auswählen oder eingeben.</div>
              ) : (
                <div className="invisible text-xs">placeholder</div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="md:col-span-2 min-w-0 space-y-2">
            <label className={LABEL}>Text</label>
            <textarea
              rows={4}
              className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Volle Emoji-Power erlaubt 👍✨"
            />
          </div>

          {/* CTA */}
          <div className="md:col-span-2 grid min-w-0 gap-6 md:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <label className={LABEL}>Button-Titel</label>
              <input
                className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                placeholder="z. B. Mehr erfahren"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Optional - nur ausfüllen, wenn bei der News ein Button erscheinen soll.
              </div>
            </div>

            <div className="min-w-0 space-y-1.5">
              <label className={LABEL}>Zielseite (Weiterleitung)</label>

              {useKnownPage ? (
                <SelectBox
                  ariaLabel="Zielseite wählen"
                  value={ctaHref}
                  onChange={setCtaHref}
                  options={["Keine", ...KNOWN_PAGES.map((p) => p.label)]}
                  placeholder="Keine"
                />
              ) : (
                <input
                  className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  placeholder="/pfad-oder-externe-url"
                  value={ctaHref}
                  onChange={(e) => setCtaHref(e.target.value)}
                />
              )}

              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useKnownPage}
                    onChange={(e) => {
                      const useKnown = e.target.checked;
                      setUseKnownPage(useKnown);
                      if (useKnown) {
                        if (!ctaHref.trim() || ctaHref === (KNOWN_PAGES.find((p) => p.href === ctaHref)?.label || "")) {
                          setCtaHref("Keine");
                        }
                      } else {
                        setCtaHref("");
                      }
                    }}
                  />
                  Aus vordefinierten Seiten wählen
                </label>
              </div>

              <div className="text-xs text-zinc-500">
                Tipp: Die Liste der Seiten pflegst du zentral in <code>/app/lib/known-pages.ts</code>.
              </div>
            </div>
          </div>

          {/* Datum */}
          <div className="min-w-0 space-y-2">
            <label className={LABEL}>Datum</label>
            <input
              type="date"
              className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="min-w-0 space-y-2">
            <label className={LABEL}>Status</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm">Aktiv anzeigen</span>
            </div>
          </div>

          {/* Bild */}
          <div className="md:col-span-2 min-w-0 space-y-2">
            <div className={LABEL}>
              Füge der News noch <span className="italic">optional</span> ein Bild hinzu:
            </div>
            <ImageUploader folder="news" imageUrl={imageUrl} onChange={setImageUrl} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={create}
            disabled={saving || !formValid}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Speichere…" : "Anlegen"}
          </button>
        </div>
      </div>

      {/* Liste */}
      <ul className="space-y-3 min-w-0">
        <li className="text-sm text-zinc-500 min-h-[1.5rem] flex items-center">
          {loading ? "Lade…" : items.length === 0 ? "Keine News vorhanden." : null}
        </li>

        {items.map((n) => (
          <NewsCard key={n.id} item={n} onSaved={reload} onDelete={() => remove(n.id)} />
        ))}
      </ul>
    </main>
  );
}

function NewsCard({ item, onSaved, onDelete }: {
  item: any; onSaved?: () => void; onDelete?: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);

  const predefinedHit = ["Aktion", "Event", "Info"].includes(item.tag || "");
  const [useKnownTag, setUseKnownTag] = useState<boolean>(predefinedHit || !item.tag);
  const [tag, setTag] = useState<string>(
    useKnownTag ? (predefinedHit ? (item.tag as string) : "Kein Tag ausgewählt") : (item.tag || "")
  );

  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");

  const initialKnown = KNOWN_PAGES.some((p) => p.href === (item.ctaHref || ""));
  const [useKnownPage, setUseKnownPage] = useState<boolean>(initialKnown);
  const [ctaLabel, setCtaLabel] = useState(item.ctaLabel || "");
  const [ctaHref, setCtaHref] = useState<string>(
    initialKnown ? (KNOWN_PAGES.find((p) => p.href === item.ctaHref)?.label || "Keine") : (item.ctaHref || "")
  );

  const [publishedAt, setPublishedAt] = useState(
    item.publishedAt?.slice(0, 10) || todayLocalYMD()
  );
  const [isActive, setIsActive] = useState<boolean>(!!item.isActive);
  const [saving, setSaving] = useState(false);

  const tagValid = useKnownTag ? tag !== "Kein Tag ausgewählt" : !!tag.trim();
  const formValid = !!title.trim() && !!body.trim() && tagValid;

  async function save() {
    if (!formValid) return;
    setSaving(true);
    try {
      const hrefFinal = ctaLabel.trim()
        ? (useKnownPage
            ? (ctaHref === "Keine" ? null : (KNOWN_PAGES.find((p) => p.label === ctaHref)?.href || null))
            : (ctaHref || null))
        : null;

      const tagFinal = useKnownTag ? (tag === "Kein Tag ausgewählt" ? null : tag) : (tag.trim() || null);

      const res = await fetch(`/api/news/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          tag: tagFinal,
          imageUrl: imageUrl || null,
          ctaLabel: ctaLabel.trim() || null,
          ctaHref: hrefFinal,
          publishedAt,
          isActive,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Konnte News nicht speichern.");
      }
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-2xl border bg-white/90 p-4 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/80 dark:ring-white/10 sm:p-6 overflow-hidden">
      {/* Kopf: Titel links, Slug rechts */}
      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <label className={LABEL}>Titel</label>
          <input
            className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. 🥳 Neuer Sonntagsbrunch"
          />
        </div>
        <div className="flex min-w-0 items-end justify-start md:justify-end">
          <div className="text-xs text-zinc-500 break-words min-h-[40px] flex items-center">
            <span className="whitespace-normal break-all">{item.slug}</span>
          </div>
        </div>
      </div>

      {/* Tag + Datum */}
      <div className="mt-4 grid min-w-0 gap-6 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <label className={LABEL}>Tag</label>

          {useKnownTag ? (
            <SelectBox
              ariaLabel="Tag wählen"
              value={tag}
              onChange={setTag}
              options={[...PREDEFINED_TAGS]}
              placeholder="Kein Tag ausgewählt"
            />
          ) : (
            <input
              className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              placeholder="(z. B. Ankündigung)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          )}

          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={useKnownTag}
                onChange={(e) => {
                  const useKnown = e.target.checked;
                  setUseKnownTag(useKnown);
                  if (useKnown) setTag(PREDEFINED_TAGS.includes(tag) ? tag : "Kein Tag ausgewählt");
                  else setTag("");
                }}
              />
              Aus vordefinierten Tags wählen
            </label>
          </div>

          <div className="min-h-4">
            {!tagValid ? (
              <div className="text-xs text-red-600">Bitte einen Tag auswählen oder eingeben.</div>
            ) : (
              <div className="invisible text-xs">placeholder</div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <label className={LABEL}>Datum</label>
          <input
            type="date"
            className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
          <div className="min-h-4" />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 grid min-w-0 gap-6 md:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <label className={LABEL}>Button-Titel</label>
          <input
            className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="z. B. Mehr erfahren"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
          />
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Optional - nur ausfüllen, wenn bei der News ein Button erscheinen soll.
          </div>
        </div>

        <div className="min-w-0 space-y-1.5">
          <label className={LABEL}>Zielseite (Weiterleitung)</label>

          {useKnownPage ? (
            <SelectBox
              ariaLabel="Zielseite wählen"
              value={ctaHref}
              onChange={setCtaHref}
              options={["Keine", ...KNOWN_PAGES.map((p) => p.label)]}
              placeholder="Keine"
            />
          ) : (
            <input
              className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              placeholder="/pfad-oder-externe-url"
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
            />
          )}

          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={useKnownPage}
                onChange={(e) => {
                  const useKnown = e.target.checked;
                  setUseKnownPage(useKnown);
                  if (useKnown) {
                    if (!ctaHref.trim() || ctaHref === (KNOWN_PAGES.find((p) => p.href === ctaHref)?.label || "")) {
                      setCtaHref("Keine");
                    }
                  } else {
                    setCtaHref("");
                  }
                }}
              />
              Aus vordefinierten Seiten wählen
            </label>
          </div>

          <div className="text-xs text-zinc-500">
            Tipp: Die Liste der Seiten pflegst du zentral in <code>/app/lib/known-pages.ts</code>.
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 min-w-0 space-y-2">
        <label className={LABEL}>Text</label>
        <textarea
          rows={4}
          className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Volle Emoji-Power erlaubt 👍✨"
        />
      </div>

      {/* Bild */}
      <div className="mt-4 min-w-0 space-y-2">
        <div className={LABEL}>
          Füge der News noch <span className="italic">optional</span> ein Bild hinzu:
        </div>
        <ImageUploader folder="news" imageUrl={imageUrl} onChange={setImageUrl} />
      </div>

      {/* Aktionen */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => setIsActive((a) => !a)}
          className={[
            "rounded-md px-3 py-2 text-sm ring-1 transition",
            isActive
              ? "text-emerald-700 ring-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:ring-emerald-800/60 dark:hover:bg-emerald-900/20"
              : "text-zinc-600 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800",
          ].join(" ")}
        >
          {isActive ? "Aktiv" : "Inaktiv"}
        </button>

        <button
          onClick={save}
          className="rounded-md bg-emerald-600 px-3 py-2 text-white whitespace-normal leading-tight text-center text-[13px] md:text-sm hover:bg-emerald-700 disabled:opacity-60"
          disabled={saving || !formValid}
        >
          {saving ? "Speichere…" : "Änderungen speichern"}
        </button>

        <button
          onClick={onDelete}
          className="rounded-md px-3 py-2 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 dark:text-red-400 dark:ring-red-800/60 dark:hover:bg-red-900/20"
        >
          Löschen
        </button>
      </div>
    </li>
  );
}

// /app/imprint/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Impressum | Backschmiede Kölker',
  description: 'Impressum der Backschmiede Kölker mit Anbieterkennzeichnung und Kontakt.',
  alternates: { canonical: "/imprint" },
  openGraph: {
    title: 'Impressum | Backschmiede Kölker',
    description: 'Impressum der Backschmiede Kölker mit Anbieterkennzeichnung und Kontakt.',
    url: "/imprint",
    type: "website",
  },
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1>Impressum</h1>

      <section>
        <h2>Anbieterkennzeichnung gemäß § 5 TMG</h2>
        <p>
          <strong>Backschmiede Kölker</strong><br />
          Hauptstraße 10, 49509 Recke<br />
          Landrat-Schultz-Straße 1, 49497 Mettingen
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          Telefon Recke: <a href="tel:+4915755353999">+49 1575 5353999</a><br />
          Telefon Mettingen: <a href="tel:+495452919611">+49 5452 919611</a><br />
          E-Mail: <a href="mailto:info@backschmiede-koelker.de">info@backschmiede-koelker.de</a>
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>Josua Kölker (Inhaber)</p>
      </section>

      <section>
        <h2>Umsatzsteuer</h2>
        <p>
          USt-IdNr.: {/* DE… falls vorhanden; andernfalls z. B.: „nicht vorhanden / Kleinunternehmer nach § 19 UStG“ */}
        </p>
      </section>

      <section>
        <h2>Zuständige Stelle / Handwerk</h2>
        <p>
          Handwerksbetrieb (Bäckerei). Zuständige Handwerkskammer:{' '}
          {/* z. B. „Handwerkskammer Münster“ */}
        </p>
      </section>

      <section>
        <h2>Haftungsausschluss</h2>
        <h3>Haftung für Inhalte</h3>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung
          der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
        </p>
        <h3>Haftung für Links</h3>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Für diese fremden Inhalte übernehmen wir keine Gewähr; verantwortlich ist stets der jeweilige Anbieter
          oder Betreiber der Seiten.
        </p>
      </section>

      <section>
        <h2>Urheberrecht</h2>
        <p>
          Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
          Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
          Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </section>
    </main>
  );
}

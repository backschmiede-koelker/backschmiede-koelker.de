// /app/imprint/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Backschmiede Kölker",
  description: "Impressum der Backschmiede Kölker mit Anbieterkennzeichnung und Kontakt.",
  alternates: { canonical: "/imprint" },
  openGraph: {
    title: "Impressum | Backschmiede Kölker",
    description: "Impressum der Backschmiede Kölker mit Anbieterkennzeichnung und Kontakt.",
    url: "/imprint",
    type: "website",
  },
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1>Impressum</h1>

      <section>
        <h2>Anbieterkennzeichnung gemäß § 5 DDG</h2>
        <p>
          <strong>Backschmiede Kölker</strong>
          <br />
          [TODO: Rechtsform, z. B. Einzelunternehmen / GmbH]
          <br />
          [TODO: Ladungsfähige Anschrift]
        </p>
        <p>
          Betriebsstätten:
          <br />
          Hauptstraße 10, 49509 Recke
          <br />
          Landrat-Schultz-Straße 1, 49497 Mettingen
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          Telefon Recke: <a href="tel:+4915755353999">+49 1575 5353999</a>
          <br />
          Telefon Mettingen: <a href="tel:+495452919611">+49 5452 919611</a>
          <br />
          E-Mail: <a href="mailto:info@backschmiede-koelker.de">info@backschmiede-koelker.de</a>
        </p>
      </section>

      <section>
        <h2>Vertretungsberechtigter</h2>
        <p>Josua Kölker (Inhaber)</p>
      </section>

      <section>
        <h2>Registereintrag</h2>
        <p>[TODO: Register (z. B. Handelsregister), Registergericht, Registernummer]</p>
      </section>

      <section>
        <h2>Handwerksrolle / Kammer</h2>
        <p>Eintragung in die Handwerksrolle: [TODO: Handwerkskammer und Handwerksrollennummer]</p>
      </section>

      <section>
        <h2>Umsatzsteuer</h2>
        <p>USt-IdNr.: [TODO: vorhanden / nicht vorhanden / Kleinunternehmer nach § 19 UStG]</p>
        <p>Wirtschafts-IdNr.: [TODO: falls vorhanden]</p>
      </section>

      <section>
        <h2>Verantwortlich i.S.d. § 18 Abs. 2 MStV</h2>
        <p>Josua Kölker</p>
      </section>

      <section>
        <h2>Streitbeilegung</h2>
        <p>
          Wir sind [TODO: verpflichtet/nicht verpflichtet] und [TODO: bereit/nicht bereit], an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section>
        <h2>Haftungsausschluss</h2>
        <h3>Haftung für Inhalte</h3>
        <p>
          Wir sind für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch
          nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
          Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
        </p>
        <h3>Haftung für Links</h3>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für
          diese fremden Inhalte übernehmen wir keine Gewähr; verantwortlich ist stets der jeweilige Anbieter oder
          Betreiber der Seiten.
        </p>
      </section>

      <section>
        <h2>Urheberrecht</h2>
        <p>
          Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die
          Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
          Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </section>
    </main>
  );
}

// /app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Datenschutz | Backschmiede Kölker',
  description: 'Datenschutzerklärung der Backschmiede Kölker.',
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: 'Datenschutz | Backschmiede Kölker',
    description: 'Datenschutzerklärung der Backschmiede Kölker.',
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1>Datenschutzerklärung</h1>

      <section>
        <h2>1. Verantwortlicher</h2>
        <p>
          Backschmiede Kölker<br />
          Hauptstraße 10, 49509 Recke<br />
          Landrat-Schultz-Straße 1, 49497 Mettingen<br />
          E-Mail: <a href="mailto:info@backschmiede-koelker.de">info@backschmiede-koelker.de</a><br />
          Telefon: <a href="tel:+49">+49 (Telefon eintragen)</a>
        </p>
      </section>

      <section>
        <h2>2. Hosting & Server-Logfiles</h2>
        <p>
          Unser Hosting-Dienstleister speichert automatisch Informationen in sogenannten Server-Logfiles,
          die Ihr Browser automatisch übermittelt (z.&nbsp;B. IP-Adresse, Datum und Uhrzeit der Anfrage, Referrer,
          User-Agent). Die Verarbeitung erfolgt auf Grundlage von Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO
          (berechtigtes Interesse an der stabilen und sicheren Bereitstellung der Website). Logfiles werden
          nur so lange gespeichert, wie es für die Zwecke erforderlich ist.
        </p>
      </section>

      <section>
        <h2>3. Cookies</h2>
        <p>
          Unsere Website verwendet nur technisch notwendige Cookies, soweit diese für die Bereitstellung
          der Seite erforderlich sind. Sofern zusätzliche, nicht notwendige Cookies eingesetzt werden, holen wir
          zuvor Ihre Einwilligung ein (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO).
        </p>
      </section>

      <section>
        <h2>4. Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der
          Anfrage (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO). Die Daten werden gelöscht, sobald sie für die
          Zweckerfüllung nicht mehr erforderlich sind.
        </p>
      </section>

      <section>
        <h2>5. Social Media</h2>
        <p>
          Auf unserer Website können Verweise auf unsere Instagram-Profile vorhanden sein. Beim Aufruf von
          Instagram gelten die Datenschutzbestimmungen von Instagram/Meta. Eine Datenübermittlung an Instagram
          erfolgt erst, wenn Sie den entsprechenden Link aktiv anklicken.
        </p>
      </section>

      <section>
        <h2>6. Externe Links</h2>
        <p>
          Für Inhalte externer Websites, auf die wir verlinken, übernehmen wir keine Verantwortung. Es gilt die
          Datenschutzerklärung des jeweiligen Anbieters.
        </p>
      </section>

      <section>
        <h2>7. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch
          gegen die Verarbeitung sowie auf Datenübertragbarkeit gemäß Art.&nbsp;15-21 DSGVO. Zudem haben Sie das
          Recht, erteilte Einwilligungen jederzeit für die Zukunft zu widerrufen (Art.&nbsp;7 Abs.&nbsp;3 DSGVO).
          Sie haben ferner das Recht auf Beschwerde bei einer Aufsichtsbehörde (Art.&nbsp;77 DSGVO).
        </p>
      </section>

      <section>
        <h2>8. Rechtsgrundlagen</h2>
        <p>
          Soweit nicht anders angegeben, erfolgt die Verarbeitung Ihrer personenbezogenen Daten auf Grundlage von
          Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO (Vertrag/Vertragsanbahnung), lit.&nbsp;f (berechtigtes Interesse)
          oder, sofern wir eine Einwilligung einholen, lit.&nbsp;a (Einwilligung).
        </p>
      </section>

      <section>
        <h2>9. Änderungen dieser Erklärung</h2>
        <p>
          Wir passen diese Datenschutzerklärung an, wenn dies aufgrund gesetzlicher Änderungen oder technischer
          Anpassungen erforderlich ist. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.
        </p>
      </section>
    </main>
  );
}

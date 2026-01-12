// /app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz | Backschmiede Kölker",
  description: "Datenschutzerklärung der Backschmiede Kölker.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Datenschutz | Backschmiede Kölker",
    description: "Datenschutzerklärung der Backschmiede Kölker.",
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
          Backschmiede Kölker
          <br />
          Hauptstraße 10, 49509 Recke
          <br />
          Landrat-Schultz-Straße 1, 49497 Mettingen
          <br />
          E-Mail: <a href="mailto:info@backschmiede-koelker.de">info@backschmiede-koelker.de</a>
          <br />
          Telefon Recke: <a href="tel:+4915755353999">+49 1575 5353999</a>
          <br />
          Telefon Mettingen: <a href="tel:+495452919611">+49 5452 919611</a>
        </p>
      </section>

      <section>
        <h2>2. Datenschutzbeauftragter</h2>
        <p>[TODO: Kontaktdaten des Datenschutzbeauftragten, falls benannt; andernfalls &quot;nicht benannt&quot;]</p>
      </section>

      <section>
        <h2>3. Hosting, CDN und Server-Logfiles</h2>
        <p>
          Beim Aufruf unserer Website verarbeiten wir Informationen, die Ihr Browser automatisch übermittelt. Dazu
          gehören insbesondere:
        </p>
        <ul>
          <li>IP-Adresse (ggf. gekürzt) und Zeitpunkt der Anfrage</li>
          <li>aufgerufene Seite/Datei, Statuscode und übertragene Datenmenge</li>
          <li>Referrer-URL</li>
          <li>User-Agent und Spracheinstellung</li>
        </ul>
        <p>
          Die Verarbeitung erfolgt zur Bereitstellung der Website, zur Gewährleistung von Stabilität und Sicherheit
          sowie zur Fehleranalyse. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
        </p>
        <p>
          Empfänger: [TODO: Hostinganbieter inkl. Rechtsform, Anschrift und Land] sowie ggf. ein CDN zur
          Auslieferung von Bildern unter cdn.backschmiede-koelker.de.
        </p>
        <p>Speicherdauer der Logfiles: [TODO: z. B. 7-30 Tage].</p>
      </section>

      <section>
        <h2>4. Cookies, Local Storage und ähnliche Technologien</h2>
        <p>Wir verwenden ausschließlich First-Party-Technologien für Funktionen und Einstellungen:</p>
        <ul>
          <li>Local Storage &quot;theme&quot; für die gewählte Darstellung (hell/dunkel)</li>
          <li>Local Storage &quot;bk_snow_enabled&quot; für die Schneefall-Animation</li>
        </ul>
        <p>
          Diese Einstellungen speichern wir lokal auf Ihrem Endgerät, wenn Sie die Standardwerte aktiv ändern.
          Rechtsgrundlage ist § 25 Abs. 2 TDDDG (ehem. TTDSG) i. V. m. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse an der komfortablen Darstellung).
        </p>
        <p>
          Für die Reichweitenmessung setzen wir keine Cookies oder ähnlichen Identifier ein.
        </p>
      </section>

      <section>
        <h2>5. Reichweitenmessung / Analytics (eigene Lösung)</h2>
        <p>
          Wir messen Seitenaufrufe mit einer eigenen, selbst gehosteten Lösung - ohne Cookies und ohne
          geräteübergreifende Identifier. Dabei werden über den Endpunkt /api/collect folgende Daten verarbeitet:
        </p>
        <ul>
          <li>Seitenpfad und Zeitpunkt des Aufrufs</li>
          <li>Referrer-Host (nur der Host, nicht die vollständige URL)</li>
          <li>UTM-Parameter (Quelle, Medium, Kampagne), sofern in der URL vorhanden</li>
          <li>Browser- und Gerätetyp (z. B. Desktop/Mobile) sowie Sprache</li>
          <li>Land (aus technischen Headern des Hostings/CDN)</li>
          <li>gekürzte IP-Adresse, die tagesbezogen gehasht wird (keine Speicherung der Klar-IP)</li>
          <li>Bot-Erkennung (zur Filterung) und Admin-Kennzeichnung</li>
        </ul>
        <p>
          Die Verarbeitung dient der Reichweitenmessung, der Qualitätsverbesserung und der statistischen Auswertung
          unserer Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Für den Zugriff auf
          Endgeräteinformationen ist keine Speicherung oder Auslesung erforderlich (§ 25 Abs. 2 TDDDG).
        </p>
        <p>Wenn Ihr Browser Do-Not-Track (DNT) oder Global Privacy Control (GPC) sendet, messen wir nicht.</p>
        <p>Speicherdauer der Analytics-Daten: [TODO: z. B. 6 oder 12 Monate].</p>
      </section>

      <section>
        <h2>6. Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Vertragsanbahnung) oder Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse an der Kommunikation). Die Daten werden gelöscht, sobald sie für die Zwecke nicht
          mehr erforderlich sind. Speicherdauer: [TODO: z. B. 6-12 Monate].
        </p>
      </section>

      <section>
        <h2>7. Administrationsbereich</h2>
        <p>
          Für den internen Administrationsbereich verarbeiten wir Zugangsdaten (Benutzername, Passwort-Hash, Rolle)
          sowie Sitzungsdaten (Authentifizierungs-Cookies). Zweck ist die Zugriffskontrolle und Verwaltung der Website.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Sicherheits- und Administrationsinteresse). Sitzungen laufen
          nach spätestens 8 Stunden ab. Kontodaten werden mit Beendigung der Administrationsberechtigung gelöscht.
        </p>
      </section>

      <section>
        <h2>8. Externe Links und Social Media</h2>
        <p>
          Unsere Website enthält Links zu externen Diensten (z. B. Instagram, Google Maps, Too Good To Go). Beim
          Anklicken des Links verlassen Sie unsere Website. Es gelten die Datenschutzbestimmungen der jeweiligen
          Anbieter.
        </p>
      </section>

      <section>
        <h2>9. Empfänger und Auftragsverarbeitung</h2>
        <p>
          Wir setzen Auftragsverarbeiter ein (insbesondere Hosting und ggf. E-Mail-Provider). Mit diesen bestehen
          Verträge zur Auftragsverarbeitung gemäß Art. 28 DSGVO. Empfänger: [TODO: Anbieter, Anschrift, Land].
        </p>
      </section>

      <section>
        <h2>10. Drittlandübermittlungen</h2>
        <p>
          Eine Übermittlung in Drittländer findet grundsätzlich nicht statt. Sofern bei externen Diensten eine
          Übermittlung in Drittländer möglich ist, erfolgt diese nur bei Vorliegen geeigneter Garantien (z. B.
          EU-Standardvertragsklauseln). [TODO: Falls zutreffend, konkrete Anbieter und Garantien nennen.]
        </p>
      </section>

      <section>
        <h2>11. Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder
          gesetzliche Aufbewahrungspflichten bestehen. Details zu einzelnen Verarbeitungen finden Sie in den jeweiligen
          Abschnitten.
        </p>
      </section>

      <section>
        <h2>12. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO),
          Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen
          die Verarbeitung (Art. 21 DSGVO). Zudem haben Sie das Recht, eine erteilte Einwilligung jederzeit mit Wirkung
          für die Zukunft zu widerrufen (Art. 7 Abs. 3 DSGVO). Außerdem steht Ihnen ein Beschwerderecht bei einer
          Datenschutzaufsichtsbehörde zu (Art. 77 DSGVO).
        </p>
      </section>

      <section>
        <h2>13. Widerspruch</h2>
        <p>
          Gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können Sie aus Gründen, die sich aus Ihrer
          besonderen Situation ergeben, Widerspruch einlegen. Sie können uns dazu eine Nachricht senden.
        </p>
      </section>

      <section>
        <h2>14. Keine automatisierte Entscheidungsfindung</h2>
        <p>Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.</p>
      </section>

      <section>
        <h2>15. Sicherheit</h2>
        <p>
          Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten gegen Verlust, Missbrauch
          und unbefugten Zugriff zu schützen. Die Übertragung erfolgt verschlüsselt über TLS.
        </p>
      </section>

      <section>
        <h2>16. Änderungen dieser Erklärung</h2>
        <p>
          Wir passen diese Datenschutzerklärung an, sobald dies aufgrund technischer oder rechtlicher Änderungen
          erforderlich ist. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.
        </p>
      </section>
    </main>
  );
}

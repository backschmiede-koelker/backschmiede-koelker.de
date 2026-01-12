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

const STAND = "12.01.2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1>Datenschutzerklärung</h1>
      <p><em>Stand: {STAND}</em></p>

      <section>
        <h2>Verantwortlicher</h2>
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
        <h2>Datenschutzbeauftragter</h2>
        <p>
          Ein Datenschutzbeauftragter ist nicht benannt, da keine gesetzliche Pflicht zur Benennung besteht.
        </p>
      </section>

      <section>
        <h2>Hosting und Server-Logfiles</h2>
        <p>
          Beim Aufruf unserer Website verarbeiten wir Informationen, die Ihr Browser automatisch übermittelt. Dazu
          gehören insbesondere:
        </p>
        <ul>
          <li>IP-Adresse und Zeitpunkt der Anfrage</li>
          <li>aufgerufene Seite/Datei, Statuscode und übertragene Datenmenge</li>
          <li>Referrer-URL</li>
          <li>User-Agent und Spracheinstellung</li>
        </ul>
        <p>
          Die Verarbeitung erfolgt zur Bereitstellung der Website, zur Gewährleistung von Stabilität und Sicherheit
          sowie zur Fehleranalyse. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
        </p>
        <p>
          Hostinganbieter / Auftragsverarbeiter: IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland.
          Die Auslieferung statischer Inhalte erfolgt über denselben Server.
        </p>
        <p>
          Speicherdauer der Logfiles: Wir speichern Server-Logfiles nur so lange, wie es für Sicherheit und Fehleranalyse
          erforderlich ist. Logfiles werden im Rahmen der technischen Logrotation automatisch gelöscht bzw. überschrieben
          (zeit- oder grössenbasiert).
        </p>
      </section>

      <section>
        <h2>Cookies, Local Storage und ähnliche Technologien</h2>
        <p>Wir verwenden ausschließlich First-Party-Technologien für Funktionen und Einstellungen:</p>
        <ul>
          <li>Local Storage &quot;theme&quot; für die gewählte Darstellung (hell/dunkel)</li>
          <li>Local Storage &quot;bk_snow_enabled&quot; für die Schneefall-Animation</li>
        </ul>
        <p>
          Diese Einstellungen speichern wir lokal auf Ihrem Endgerät nur, wenn Sie die Standardwerte aktiv ändern.
          Rechtsgrundlage für das Speichern/Auslesen ist § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich, um eine von
          Ihnen ausdrücklich gewünschte Funktion bereitzustellen). Rechtsgrundlage für die weitere Verarbeitung ist
          Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Für die Reichweitenmessung setzen wir keine Cookies oder Local-Storage-Identifier ein.
        </p>
      </section>

      <section>
        <h2>Reichweitenmessung / Analytics (eigene Lösung, ohne Cookies)</h2>
        <p>
          Wir führen eine serverseitige Reichweitenmessung durch, um Seitenaufrufe und die Kennzahl
          &quot;ungefähre Anzahl unterschiedlicher Besucher pro Tag&quot; (Unique Users/Day) zu ermitteln - ohne Cookies
          und ohne geräteübergreifende Kennungen.
        </p>
        <p>Verarbeitet werden dabei:</p>
        <ul>
          <li>Seitenpfad (ohne Querystring) und Zeitpunkt des Aufrufs (Tagesbezug)</li>
          <li>Referrer-Host (nur Host, nicht die vollständige URL)</li>
          <li>UTM-Parameter (Quelle/Medium/Kampagne), sofern in der URL vorhanden</li>
          <li>Geräteklasse (mobile/desktop) und Sprache</li>
        </ul>
        <p>
          Für die Kennzahl &quot;Unique Users/Day&quot; wird die IP-Adresse technisch beim Seitenaufruf übertragen. Wir
          speichern keine IP-Adressen. Die IP-Adresse wird ausschließlich flüchtig verarbeitet, um aus IP und
          Geräteklasse mit einem täglich wechselnden Geheimnis (HMAC) einen nicht rückrechenbaren Zählwert zu
          erzeugen. Dieser Zählwert wird nur in einer HyperLogLog-Struktur pro Tag zur Schätzung gespeichert; einzelne
          Werte werden nicht gespeichert.
        </p>
        <p>
          Gespeichert werden nur aggregierte Tageszähler (Pageviews) sowie aggregierte Zähler nach Pfad, Referrer-Host,
          UTM, Geräteklasse und Sprache.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Reichweitenmessung und
          Verbesserung der Website). Ein Zugriff auf Informationen in Ihrer Endeinrichtung (Cookies/Local Storage) für
          die Analytics findet nicht statt.
        </p>
        <p>
          Wenn Ihr Browser Global Privacy Control (GPC) oder Do-Not-Track (DNT) sendet, messen wir nicht.
        </p>
        <p>Speicherdauer: Aggregierte Statistiken werden 12 Monate gespeichert.</p>
      </section>

      <section>
        <h2>Kontaktaufnahme</h2>
        <p>
          Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Vertragsanbahnung) oder Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse an der Kommunikation). Speicherdauer: 12 Monate nach Abschluss der Anfrage, sofern
          keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <section>
        <h2>Administrationsbereich</h2>
        <p>
          Für den internen Administrationsbereich verarbeiten wir Zugangsdaten (Benutzername, Passwort-Hash, Rolle)
          sowie Sitzungsdaten (Authentifizierungs-Cookies). Zweck ist die Zugriffskontrolle und Verwaltung der Website.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Sicherheits- und Administrationsinteresse). Sitzungen laufen
          nach spätestens 8 Stunden ab. Authentifizierungs-Cookies werden nur im Rahmen des Logins im Adminbereich
          gesetzt.
        </p>
      </section>

      <section>
        <h2>Externe Links und Social Media</h2>
        <p>
          Unsere Website enthält Links zu externen Diensten (z. B. Instagram, Google Maps, Too Good To Go). Beim
          Anklicken eines Links verlassen Sie unsere Website. Es gelten die Datenschutzbestimmungen der jeweiligen
          Anbieter. Wir verwenden keine Social-Media-Plugins oder eingebettete Inhalte, die ohne Klick automatisch
          Daten an Dritte übertragen.
        </p>
      </section>

      <section>
        <h2>Empfänger und Auftragsverarbeitung</h2>
        <p>
          Wir setzen Auftragsverarbeiter ein (insbesondere Hosting und E-Mail). Mit diesen bestehen Verträge zur
          Auftragsverarbeitung gemäß Art. 28 DSGVO.
        </p>
        <ul>
          <li>IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland (VPS/Hosting, E-Mail)</li>
        </ul>
      </section>

      <section>
        <h2>Drittlandübermittlungen</h2>
        <p>
          Eine Übermittlung in Drittländer (außerhalb EU/EWR) findet durch uns grundsätzlich nicht statt.
        </p>
      </section>

      <section>
        <h2>Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder
          gesetzliche Aufbewahrungspflichten bestehen. Konkrete Speicherdauern finden Sie in den jeweiligen Abschnitten.
        </p>
      </section>

      <section>
        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO),
          Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen
          die Verarbeitung (Art. 21 DSGVO). Außerdem steht Ihnen ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde
          zu (Art. 77 DSGVO).
        </p>
      </section>

      <section>
        <h2>Widerspruch</h2>
        <p>
          Gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können Sie aus Gründen, die sich aus Ihrer
          besonderen Situation ergeben, Widerspruch einlegen. Sie können uns dazu eine Nachricht senden.
        </p>
      </section>

      <section>
        <h2>Keine automatisierte Entscheidungsfindung</h2>
        <p>Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.</p>
      </section>

      <section>
        <h2>Sicherheit</h2>
        <p>
          Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten gegen Verlust, Missbrauch
          und unbefugten Zugriff zu schützen. Die Übertragung erfolgt verschlüsselt über TLS.
        </p>
      </section>

      <section>
        <h2>Änderungen dieser Erklärung</h2>
        <p>
          Wir passen diese Datenschutzerklärung an, sobald dies aufgrund technischer oder rechtlicher Änderungen
          erforderlich ist. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.
        </p>
      </section>
    </main>
  );
}

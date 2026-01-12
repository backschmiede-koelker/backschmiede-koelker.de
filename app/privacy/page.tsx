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
          Hinweis: Server-Logfiles können technisch bedingt auch IP-Adressen und User-Agent-Informationen enthalten.
          Diese Logdaten werden nicht für unsere Analytics-Auswertungen verwendet, sondern dienen dem sicheren Betrieb
          (z. B. Fehleranalyse/Angriffserkennung).
        </p>
        <p>
          Hostinganbieter / Auftragsverarbeiter: IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland.
          Die Auslieferung statischer Inhalte erfolgt über denselben Server.
        </p>
        <p>
          Speicherdauer der Logfiles: Wir speichern Server-Logfiles nur so lange, wie es für Sicherheit und Fehleranalyse
          erforderlich ist. Logfiles werden im Rahmen der technischen Logrotation automatisch gelöscht bzw. überschrieben.
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
          Wir führen eine serverseitige Reichweitenmessung durch, um die Nutzung unserer Website zu verstehen und zu
          verbessern. Wir verwenden dafür keine Cookies, keinen Local Storage und keine geräteübergreifenden Kennungen.
        </p>

        <p>
          Wir verarbeiten dabei kurzzeitig folgende Informationen zur Aggregation und speichern ausschließlich aggregierte Zähler/Schätzwerte:
        </p>
        <ul>
          <li>Seitenpfad (ohne Querystring/Fragment) und Zeitpunkt des Aufrufs (Tagesbezug)</li>
          <li>Referrer-Host (nur der Host, nicht die vollständige URL)</li>
          <li>UTM-Parameter (Quelle/Medium/Kampagne), sofern in der URL vorhanden</li>
          <li>Geräteklasse (mobile/desktop) und Sprache (zweistellig)</li>
          <li>Browser-Familie (z. B. Chrome, Safari, Firefox, Edge, Sonstige) - ohne Versionsnummern</li>
          <li>Betriebssystem-Familie (z. B. iOS, Android, Windows, macOS, Linux, Sonstige) - ohne Versionsnummern</li>
          <li>Aggregierte technische Kennzahlen zur Server-Performance (z. B. Verarbeitungsdauer als p50/p95 und Durchschnitt)</li>
        </ul>

        <p>
          Für Browser-/Betriebssystem-Familien werten wir den User-Agent technisch nur flüchtig aus. Den User-Agent selbst
          speichern wir nicht; gespeichert werden ausschließlich aggregierte Zähler pro Tag.
        </p>

        <p>
          Für die Kennzahl &quot;Unique Users pro Tag&quot; wird die IP-Adresse technisch beim Seitenaufruf übertragen.
          Wir speichern keine IP-Adressen. Die IP-Adresse wird ausschließlich flüchtig verarbeitet, um aus IP-Adresse und
          Geräteklasse mit einem täglich wechselnden Geheimnis (HMAC) einen nicht rückrechenbaren Zählwert zu erzeugen.
        </p>

        <p>
          Dieser Zählwert wird ausschließlich zur Schätzung der Anzahl unterschiedlicher Besucher pro Tag in einer
          probabilistischen Zählstruktur (HyperLogLog) verwendet. Wir speichern keine Roh-Identifikatoren, keine
          IP-Adressen, keine Cookies/IDs und erstellen keine Nutzerprofile. HyperLogLog dient der Schätzung von
          Kardinalitäten ohne Speicherung einzelner Nutzerlisten.
        </p>

        <p>
          Gespeichert werden ausschließlich aggregierte Tageszähler (Pageviews) sowie aggregierte Zähler nach Pfad,
          Referrer-Host, UTM, Geräteklasse, Sprache, Browser-Familie, Betriebssystem-Familie und aggregierte technische
          Kennzahlen zur Server-Performance.
        </p>

        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Reichweitenmessung und Verbesserung
          der Website). Ein Zugriff auf Informationen in Ihrer Endeinrichtung (Cookies/Local Storage) für Analytics findet
          nicht statt.
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
        <h2>Google Maps Platform / Places API (serverseitige Abfrage von Öffnungszeiten)</h2>
        <p>
          Wir rufen in regelmäßigen Abständen Öffnungszeiten unserer Filialen über die Google Maps Platform (Places API) ab,
          um diese auf unserer Website aktuell darzustellen. Die Abfrage erfolgt ausschließlich serverseitig von unserem
          Server aus. Dabei stellt der Browser Ihres Endgeräts keine direkte Verbindung zu Google her.
        </p>
        <p>Verarbeitet/übermittelt werden dabei insbesondere:</p>
        <ul>
          <li>technische Verbindungsdaten des Servers (z. B. Server-IP-Adresse)</li>
          <li>angefragte Place-ID und API-Request-Metadaten (z. B. Zeitpunkt, Statuscodes)</li>
        </ul>
        <p>
          Es werden hierbei keine IP-Adressen oder sonstigen Identifikatoren von Website-Besuchern an Google übermittelt,
          da die Abfrage nicht aus Ihrem Browser heraus erfolgt.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse), unser Angebot mit aktuellen
          Öffnungszeiten bereitzustellen.
        </p>
        <p>
          Empfänger: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
        </p>
        <p>
          Hinweis Drittland: Eine Verarbeitung von Daten durch Google außerhalb der EU/des EWR kann nicht ausgeschlossen
          werden. Google stellt hierfür vertragliche Mechanismen (z. B. Standardvertragsklauseln) bereit.
        </p>
        <p>
          Speicherdauer/Kriterien: Die abgerufenen Öffnungszeiten werden serverseitig zwischengespeichert und regelmäßig
          aktualisiert. Personenbezogene Daten von Website-Besuchern werden in diesem Zusammenhang
          nicht gespeichert.
        </p>
      </section>

      <section>
        <h2>Empfänger und Auftragsverarbeitung</h2>
        <p>
          Wir setzen Dienstleister ein, die für uns als Auftragsverarbeiter tätig sind (insbesondere Hosting und E-Mail).
          Mit diesen bestehen Verträge zur Auftragsverarbeitung gemäß Art. 28 DSGVO.
        </p>
        <ul>
          <li>IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland (VPS/Hosting, E-Mail)</li>
        </ul>

        <p>
          Zusätzlich nutzen wir zur serverseitigen Abfrage von Öffnungszeiten die Google Maps Platform (Places API).
          Dabei kann Google als Empfänger technischer Request-Daten auftreten:
        </p>
        <ul>
          <li>Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (Places API)</li>
        </ul>
      </section>

      <section>
        <h2>Drittlandübermittlungen</h2>
        <p>
          Eine Übermittlung in Drittländer (außerhalb EU/EWR) findet durch uns grundsätzlich nur statt, sofern wir Dienste
          einsetzen, bei denen eine Verarbeitung außerhalb der EU/des EWR nicht ausgeschlossen werden kann (z. B. bei
          bestimmten Google-Diensten). In diesen Fällen erfolgt die Übermittlung nur unter Einhaltung der gesetzlichen
          Vorgaben (z. B. Standardvertragsklauseln).
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

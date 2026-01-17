// app/lib/legal-defaults.ts
export const LEGAL_CONTACT_TOKENS = {
  email: "{{email}}",
  phoneRecke: "{{phoneRecke}}",
  phoneMettingen: "{{phoneMettingen}}",
} as const;

export type LegalBlockSeed =
  | { type: "PARAGRAPH"; text: string }
  | { type: "LIST"; items: string[] };

export type LegalSectionSeed = {
  heading: string;
  blocks: LegalBlockSeed[];
};

export type LegalDocSeed = {
  type: "IMPRINT" | "PRIVACY";
  title: string;
  sections: LegalSectionSeed[];
};

export const DEFAULT_LEGAL_SETTINGS = {
  contactEmail: "info@backschmiede-koelker.de",
  phoneRecke: "+49 1575 5353999",
  phoneMettingen: "+49 5452 919611",
};

export const DEFAULT_LEGAL_DOCUMENTS: LegalDocSeed[] = [
  {
    type: "IMPRINT",
    title: "Impressum",
    sections: [
      {
        heading: "Anbieterkennzeichnung gemäß § 5 DDG",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Backschmiede Kölker\n[TODO: Rechtsform, z. B. Einzelunternehmen / GmbH]\n[TODO: Inhaber/Vertretungsberechtigter Name]\nLandrat-Schultz-Straße 1, 49497 Mettingen",
          },
          {
            type: "PARAGRAPH",
            text:
              "Betriebsstätten:\nHauptstraße 10, 49509 Recke\nLandrat-Schultz-Straße 1, 49497 Mettingen",
          },
        ],
      },
      {
        heading: "Kontakt",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              `Telefon Recke: ${LEGAL_CONTACT_TOKENS.phoneRecke}\n` +
              `Telefon Mettingen: ${LEGAL_CONTACT_TOKENS.phoneMettingen}\n` +
              `E-Mail: ${LEGAL_CONTACT_TOKENS.email}`,
          },
        ],
      },
      {
        heading: "Registereintrag",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "[TODO: Register (z. B. Handelsregister), Registergericht, Registernummer, oder halt nicht vorhanden hinschreiben]",
          },
        ],
      },
      {
        heading: "Handwerksrolle / Kammer",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Eintragung in die Handwerksrolle: [TODO: Handwerkskammer und Handwerksrollennummer (NUR WENN EINTRAGUNGSPFLICHTIG)]",
          },
        ],
      },
      {
        heading: "Umsatzsteuer",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "USt-IdNr.: [TODO: falls vorhanden, sonst entfernen]\nHinweis Kleinunternehmer: [TODO: nur falls wirklich § 19 UStG zutrifft]",
          },
        ],
      },
      {
        heading: "Streitbeilegung",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
          },
        ],
      },
      {
        heading: "Haftungsausschluss",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Haftung für Inhalte\nWir sind für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Haftung für Links\nUnser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte übernehmen wir keine Gewähr; verantwortlich ist stets der jeweilige Anbieter oder Betreiber der Seiten.",
          },
        ],
      },
      {
        heading: "Urheberrecht",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
          },
        ],
      },
    ],
  },
  {
    type: "PRIVACY",
    title: "Datenschutzerklärung",
    sections: [
      {
        heading: "Stand",
        blocks: [{ type: "PARAGRAPH", text: "Stand: 12.01.2026" }],
      },
      {
        heading: "Verantwortlicher",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Backschmiede Kölker\nHauptstraße 10, 49509 Recke\nLandrat-Schultz-Straße 1, 49497 Mettingen\n" +
              `E-Mail: ${LEGAL_CONTACT_TOKENS.email}\n` +
              `Telefon Recke: ${LEGAL_CONTACT_TOKENS.phoneRecke}\n` +
              `Telefon Mettingen: ${LEGAL_CONTACT_TOKENS.phoneMettingen}`,
          },
        ],
      },
      {
        heading: "Datenschutzbeauftragter",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Ein Datenschutzbeauftragter ist nicht benannt, da keine gesetzliche Pflicht zur Benennung besteht.",
          },
        ],
      },
      {
        heading: "Hosting und Server-Logfiles",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Beim Aufruf unserer Website verarbeiten wir Informationen, die Ihr Browser automatisch übermittelt. Dazu gehören insbesondere:",
          },
          {
            type: "LIST",
            items: [
              "IP-Adresse und Zeitpunkt der Anfrage",
              "aufgerufene Seite/Datei, Statuscode und übertragene Datenmenge",
              "Referrer-URL",
              "User-Agent und Spracheinstellung",
            ],
          },
          {
            type: "PARAGRAPH",
            text:
              "Die Verarbeitung erfolgt zur Bereitstellung der Website, zur Gewährleistung von Stabilität und Sicherheit sowie zur Fehleranalyse. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).",
          },
          {
            type: "PARAGRAPH",
            text:
              "Hinweis: Server-Logfiles können technisch bedingt auch IP-Adressen und User-Agent-Informationen enthalten. Diese Logdaten werden nicht für unsere Analytics-Auswertungen verwendet, sondern dienen dem sicheren Betrieb (z. B. Fehleranalyse/Angriffserkennung).",
          },
          {
            type: "PARAGRAPH",
            text:
              "Hostinganbieter / Auftragsverarbeiter: IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland. Die Auslieferung statischer Inhalte erfolgt über denselben Server.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Speicherdauer der Logfiles: Wir speichern Server-Logfiles nur so lange, wie es für Sicherheit und Fehleranalyse erforderlich ist. Logfiles werden im Rahmen der technischen Logrotation automatisch gelöscht bzw. überschrieben.",
          },
        ],
      },
      {
        heading: "Cookies, Local Storage und ähnliche Technologien",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir verwenden ausschließlich First-Party-Technologien für Funktionen und Einstellungen:",
          },
          {
            type: "LIST",
            items: [
              "Local Storage \"theme\" für die gewählte Darstellung (hell/dunkel)",
              "Local Storage \"bk_snow_enabled\" für die Schneefall-Animation",
            ],
          },
          {
            type: "PARAGRAPH",
            text:
              "Diese Einstellungen speichern wir lokal auf Ihrem Endgerät nur, wenn Sie die Standardwerte aktiv ändern. Rechtsgrundlage für das Speichern/Auslesen ist § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich, um eine von Ihnen ausdrücklich gewünschte Funktion bereitzustellen). Rechtsgrundlage für die weitere Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Für die Reichweitenmessung setzen wir keine Cookies oder Local-Storage-Identifier ein.",
          },
        ],
      },
      {
        heading: "Reichweitenmessung / Analytics (eigene Lösung, ohne Cookies)",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir führen eine serverseitige Reichweitenmessung durch, um die Nutzung unserer Website zu verstehen und zu verbessern. Wir verwenden dafür keine Cookies, keinen Local Storage und keine geräteübergreifenden Kennungen.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Wir verarbeiten dabei kurzzeitig folgende Informationen zur Aggregation und speichern ausschließlich aggregierte Zähler/Schätzwerte:",
          },
          {
            type: "LIST",
            items: [
              "Seitenpfad (ohne Querystring/Fragment) und Zeitpunkt des Aufrufs (Tagesbezug)",
              "Referrer-Host (nur der Host, nicht die vollständige URL)",
              "UTM-Parameter (Quelle/Medium/Kampagne), sofern in der URL vorhanden",
              "Geräteklasse (mobile/desktop) und Sprache (zweistellig)",
              "Browser-Familie (z. B. Chrome, Safari, Firefox, Edge, Sonstige) - ohne Versionsnummern",
              "Betriebssystem-Familie (z. B. iOS, Android, Windows, macOS, Linux, Sonstige) - ohne Versionsnummern",
              "Aggregierte technische Kennzahlen zur Server-Performance (z. B. Verarbeitungsdauer als p50/p95 und Durchschnitt)",
            ],
          },
          {
            type: "PARAGRAPH",
            text:
              "Für Browser-/Betriebssystem-Familien werten wir den User-Agent technisch nur flüchtig aus. Den User-Agent selbst speichern wir nicht; gespeichert werden ausschließlich aggregierte Zähler pro Tag.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Für die Kennzahl \"Unique Users pro Tag\" wird die IP-Adresse technisch beim Seitenaufruf übertragen. Wir speichern keine IP-Adressen. Die IP-Adresse wird ausschließlich flüchtig verarbeitet, um aus IP-Adresse und Geräteklasse mit einem täglich wechselnden Geheimnis (HMAC) einen nicht rückrechenbaren Zählwert zu erzeugen.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Dieser Zählwert wird ausschließlich zur Schätzung der Anzahl unterschiedlicher Besucher pro Tag in einer probabilistischen Zählstruktur (HyperLogLog) verwendet. Wir speichern keine Roh-Identifikatoren, keine IP-Adressen, keine Cookies/IDs und erstellen keine Nutzerprofile. HyperLogLog dient der Schätzung von Kardinalitäten ohne Speicherung einzelner Nutzerlisten.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Gespeichert werden ausschließlich aggregierte Tageszähler (Pageviews) sowie aggregierte Zähler nach Pfad, Referrer-Host, UTM, Geräteklasse, Sprache, Browser-Familie, Betriebssystem-Familie und aggregierte technische Kennzahlen zur Server-Performance.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Reichweitenmessung und Verbesserung der Website). Ein Zugriff auf Informationen in Ihrer Endeinrichtung (Cookies/Local Storage) für Analytics findet nicht statt.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Wenn Ihr Browser Global Privacy Control (GPC) oder Do-Not-Track (DNT) sendet, messen wir nicht.",
          },
          {
            type: "PARAGRAPH",
            text: "Speicherdauer: Aggregierte Statistiken werden 12 Monate gespeichert.",
          },
        ],
      },
      {
        heading: "Kontaktaufnahme",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Vertragsanbahnung) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Kommunikation). Speicherdauer: 12 Monate nach Abschluss der Anfrage, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
          },
        ],
      },
      {
        heading: "Administrationsbereich",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Für den internen Administrationsbereich verarbeiten wir Zugangsdaten (Benutzername, Passwort-Hash, Rolle) sowie Sitzungsdaten (Authentifizierungs-Cookies). Zweck ist die Zugriffskontrolle und Verwaltung der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Sicherheits- und Administrationsinteresse). Sitzungen laufen nach spätestens 8 Stunden ab. Authentifizierungs-Cookies werden nur im Rahmen des Logins im Adminbereich gesetzt.",
          },
        ],
      },
      {
        heading: "Externe Links und Social Media",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Unsere Website enthält Links zu externen Diensten (z. B. Instagram, Google Maps, Too Good To Go). Beim Anklicken eines Links verlassen Sie unsere Website. Es gelten die Datenschutzbestimmungen der jeweiligen Anbieter. Wir verwenden keine Social-Media-Plugins oder eingebettete Inhalte, die ohne Klick automatisch Daten an Dritte übertragen.",
          },
        ],
      },
      {
        heading: "Google Business Profile API (serverseitiger Abgleich von Öffnungszeiten)",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir pflegen die Öffnungszeiten (wöchentliche Öffnungszeiten sowie Ausnahmen wie Sonderöffnungen/Schließtage) intern und können diese serverseitig an die Google-Unternehmensprofile unserer Filialen übertragen, damit die Angaben in Google Maps und im Unternehmensprofil aktuell sind. Die Übertragung wird ausschließlich durch autorisierte Mitarbeiter im Administrationsbereich ausgelöst.",
          },
          {
            type: "PARAGRAPH",
            text: "Dabei werden an Google insbesondere übermittelt/verarbeitet:",
          },
          {
            type: "LIST",
            items: [
              "Öffnungszeiten (Regular Hours) je Wochentag",
              "Ausnahmen/Sonderöffnungszeiten (Special Hours), inklusive Schließtage",
              "technische Request-Daten unseres Servers (z. B. Server-IP-Adresse, Zeitpunkt, Statuscodes)",
            ],
          },
          {
            type: "PARAGRAPH",
            text:
              "Es werden hierbei keine Daten von Website-Besuchern an Google übermittelt, da der Abgleich nicht aus dem Browser heraus erfolgt, sondern ausschließlich serverseitig.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse), aktuelle Öffnungszeiten in unseren Google-Unternehmensprofilen bereitzustellen.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Empfänger: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Hinweis Drittland: Eine Verarbeitung von Daten durch Google außerhalb der EU/des EWR kann nicht ausgeschlossen werden. Google stellt hierfür vertragliche Mechanismen (z. B. Standardvertragsklauseln) bereit.",
          },
          {
            type: "PARAGRAPH",
            text:
              "Speicherdauer/Kriterien: Wir speichern die Öffnungszeiten intern in unserer Datenbank. Protokolle/Fehlerlogs zum Abgleich werden nur so lange aufbewahrt, wie es für Betrieb, Sicherheit und Fehleranalyse erforderlich ist.",
          },
        ],
      },
      {
        heading: "Empfänger und Auftragsverarbeitung",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir setzen Dienstleister ein, die für uns als Auftragsverarbeiter tätig sind (insbesondere Hosting und E-Mail). Mit diesen bestehen Verträge zur Auftragsverarbeitung gemäß Art. 28 DSGVO.",
          },
          {
            type: "LIST",
            items: [
              "IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland (VPS/Hosting, E-Mail)",
            ],
          },
          {
            type: "PARAGRAPH",
            text:
              "Für den serverseitigen Abgleich von Öffnungszeiten in unseren Google-Unternehmensprofilen nutzen wir die Google Business Profile API. Dabei kann Google als Empfänger technischer Request-Daten auftreten:",
          },
          {
            type: "LIST",
            items: [
              "Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (Google Business Profile API)",
            ],
          },
        ],
      },
      {
        heading: "Drittlandübermittlungen",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Eine Übermittlung in Drittländer (außerhalb EU/EWR) findet durch uns grundsätzlich nur statt, sofern wir Dienste einsetzen, bei denen eine Verarbeitung außerhalb der EU/des EWR nicht ausgeschlossen werden kann (z. B. bei bestimmten Google-Diensten). In diesen Fällen erfolgt die Übermittlung nur unter Einhaltung der gesetzlichen Vorgaben (z. B. Standardvertragsklauseln).",
          },
        ],
      },
      {
        heading: "Speicherdauer",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Konkrete Speicherdauern finden Sie in den jeweiligen Abschnitten.",
          },
        ],
      },
      {
        heading: "Ihre Rechte",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Außerdem steht Ihnen ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde zu (Art. 77 DSGVO).",
          },
        ],
      },
      {
        heading: "Widerspruch",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben, Widerspruch einlegen. Sie können uns dazu eine Nachricht senden.",
          },
        ],
      },
      {
        heading: "Keine automatisierte Entscheidungsfindung",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.",
          },
        ],
      },
      {
        heading: "Sicherheit",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten gegen Verlust, Missbrauch und unbefugten Zugriff zu schützen. Die Übertragung erfolgt verschlüsselt über TLS.",
          },
        ],
      },
      {
        heading: "Änderungen dieser Erklärung",
        blocks: [
          {
            type: "PARAGRAPH",
            text:
              "Wir passen diese Datenschutzerklärung an, sobald dies aufgrund technischer oder rechtlicher Änderungen erforderlich ist. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.",
          },
        ],
      },
    ],
  },
];

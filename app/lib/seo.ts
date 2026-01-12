// /app/lib/seo.ts
import { locations } from "../data/locations";

export const SITE_URL = "https://backschmiede-koelker.de";
export const DEFAULT_OG_IMAGE = "/mettingen-und-recke.png";

const DAY_MAP: Record<string, string> = {
  Montag: "Monday",
  Dienstag: "Tuesday",
  Mittwoch: "Wednesday",
  Donnerstag: "Thursday",
  Freitag: "Friday",
  Samstag: "Saturday",
  Sonntag: "Sunday",
};

function buildOpeningHoursSpecifications(lines: string[]) {
  const specs: Array<{
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string;
    opens: string;
    closes: string;
  }> = [];

  for (const line of lines) {
    const [rawDay, ...rest] = line.split(":");
    const dayOfWeek = rawDay ? DAY_MAP[rawDay.trim()] : undefined;
    if (!dayOfWeek) continue;

    const times = rest.join(":").trim();
    const ranges = Array.from(
      times.matchAll(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g)
    );

    for (const range of ranges) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek,
        opens: range[1],
        closes: range[2],
      });
    }
  }

  return specs.length ? specs : undefined;
}

export function localBusinessJsonLd() {
  const orgId = `${SITE_URL}#organization`;
  const reckeId = `${SITE_URL}#recke`;
  const mettingenId = `${SITE_URL}#mettingen`;
  const reckeHours = buildOpeningHoursSpecifications(
    locations.recke.fallback.weekday_text
  );
  const mettingenHours = buildOpeningHoursSpecifications(
    locations.mettingen.fallback.weekday_text
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Backschmiede Kölker",
        url: SITE_URL,
        logo: `${SITE_URL}/Logo1-transparent-komplett.png`,
        sameAs: [
          "https://www.instagram.com/backschmiede_koelker",
          "https://www.instagram.com/recke.backschmiede_koelker",
        ],
      },
      {
        "@type": "Bakery",
        "@id": reckeId,
        name: "Backschmiede Kölker - Recke",
        url: SITE_URL,
        image: `${SITE_URL}/recke-tuer-ballons.jpg`,
        telephone: "+49 1575 5353999",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Hauptstraße 10",
          addressLocality: "Recke",
          postalCode: "49509",
          addressCountry: "DE",
        },
        hasMap: "https://maps.app.goo.gl/v7fAobfiUPDe8xTV6",
        parentOrganization: { "@id": orgId },
        priceRange: "€",
        ...(reckeHours ? { openingHoursSpecification: reckeHours } : {}),
      },
      {
        "@type": "Bakery",
        "@id": mettingenId,
        name: "Backschmiede Kölker - Mettingen",
        url: SITE_URL,
        image: `${SITE_URL}/mettingen-draussen-alt.png`,
        telephone: "+49 5452 919611",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Landrat-Schultz-Straße 1",
          addressLocality: "Mettingen",
          postalCode: "49497",
          addressCountry: "DE",
        },
        hasMap: "https://maps.app.goo.gl/gyHqK9nJXGHv4oxX6",
        parentOrganization: { "@id": orgId },
        priceRange: "€",
        ...(mettingenHours ? { openingHoursSpecification: mettingenHours } : {}),
      },
    ],
  };
}

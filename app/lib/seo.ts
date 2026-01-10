// /app/lib/seo.ts
const SITE_URL = "https://backschmiede-koelker.de";

export function localBusinessJsonLd() {
  const orgId = `${SITE_URL}#organization`;
  const reckeId = `${SITE_URL}#recke`;
  const mettingenId = `${SITE_URL}#mettingen`;

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
      },
    ],
  };
}

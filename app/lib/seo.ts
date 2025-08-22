export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: 'Backschmiede Kölker',
    image: '/Logo3-2.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hauptstraße 12',
      addressLocality: 'Recke',
      postalCode: '49509',
      addressCountry: 'DE',
    },
    url: 'https://backschmiede-koelker.de',
    sameAs: [
      'https://www.instagram.com/backschmiede_koelker',
      'https://www.instagram.com/recke.backschmiede_koelker'
    ],
  };
}
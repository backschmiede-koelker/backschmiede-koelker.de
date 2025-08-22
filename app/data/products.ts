export type Product = {
  id: string;
  name: string;
  price: number;
  unit?: string;
  tags: string[]; 
  image?: string;
};

export const products: Product[] = [
  { id: 'brot-bauern-1kg', name: 'Bauernbrot', price: 4.8, unit: '1 kg', tags: ['Brot','Roggen'], image: '/products/bauernbrot.jpg' },
  { id: 'brot-dinkel-1kg', name: 'Dinkelvollkorn', price: 5.4, unit: '1 kg', tags: ['Brot','Dinkel','Vollkorn'], image: '/products/dinkelvollkorn.jpg' },
  { id: 'broetchen-weizen', name: 'Weizenbrötchen', price: 0.36, unit: 'Stück', tags: ['Brötchen','Weizen'], image: '/products/weizenbroetchen.jpg' },
  { id: 'kuchen-apfel', name: 'Apfelkuchen', price: 2.8, unit: 'Stück', tags: ['Kuchen','Vegetarisch'], image: '/products/apfelkuchen.jpg' },
  { id: 'brot-vollkorn-1kg', name: 'Vollkornbrot', price: 5.2, unit: '1 kg', tags: ['Brot','Vollkorn'], image: '/products/vollkornbrot.webp' },
  { id: 'brot-baguette', name: 'Französisches Baguette', price: 2.5, unit: 'Stück', tags: ['Brot','Weizen','Hell'], image: '/products/baguette.webp' },
  { id: 'broetchen-kaese', name: 'Käsebrötchen', price: 0.95, unit: 'Stück', tags: ['Brötchen','Käse'], image: '/products/kaesebroetchen.jpg' },
  { id: 'croissant-butter', name: 'Buttercroissant', price: 1.4, unit: 'Stück', tags: ['Croissant','Blätterteig'], image: '/products/buttercroissant.jpg' },
  { id: 'kuchen-kaese', name: 'Käsekuchen', price: 3.2, unit: 'Stück', tags: ['Kuchen','Vegetarisch'], image: '/products/kaesekuchen.jpg' },
  { id: 'kuchen-schoko', name: 'Schokoladenkuchen', price: 3.5, unit: 'Stück', tags: ['Kuchen','Schokolade'], image: '/products/schokokuchen.jpg' },
  { id: 'gebaeck-nuss', name: 'Nussecke', price: 1.8, unit: 'Stück', tags: ['Gebäck','Nuss'], image: '/products/nussecke.jpg' },
  { id: 'gebaeck-vanillekipferl', name: 'Vanillekipferl', price: 0.7, unit: 'Stück', tags: ['Gebäck','Saisonal','Weihnachten'], image: '/products/vanillekipferl.jpg' },
];

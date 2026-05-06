// Datos mock de productos
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  region: string;
  age?: number;
  abv: number;
  volume: number;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: 'new' | 'sale' | 'limited';
  description: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'macallan-12-double-cask',
    name: 'The Macallan Double Cask 12 Years',
    brand: 'The Macallan',
    category: 'Single Malt Escocés',
    region: 'Speyside',
    age: 12,
    abv: 40,
    volume: 700,
    price: 89990,
    image: '/images/products/macallan-12.jpg',
    badge: 'new',
    description: 'Madurado en barricas de roble americano y europeo con cera de jerez González Byass.',
    inStock: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: '2',
    slug: 'glenfiddich-15',
    name: 'Glenfiddich 15 Year Old Solera',
    brand: 'Glenfiddich',
    category: 'Single Malt Escocés',
    region: 'Speyside',
    age: 15,
    abv: 40,
    volume: 700,
    price: 74990,
    originalPrice: 89990,
    image: '/images/products/glenfiddich-15.jpg',
    badge: 'sale',
    description: 'Sistema Solera único que combina whiskies de tres tipos de barricas distintas.',
    inStock: true,
    rating: 4.7,
    reviews: 98,
  },
  {
    id: '3',
    slug: 'laphroaig-10',
    name: 'Laphroaig 10 Year Old',
    brand: 'Laphroaig',
    category: 'Single Malt Escocés',
    region: 'Islay',
    age: 10,
    abv: 40,
    volume: 700,
    price: 64990,
    image: '/images/products/laphroaig-10.jpg',
    description: 'El sabor más ahumado de Islay. Notas de turba, algas marinas y vainilla.',
    inStock: true,
    rating: 4.9,
    reviews: 210,
  },
  {
    id: '4',
    slug: 'johnnie-walker-blue',
    name: 'Johnnie Walker Blue Label',
    brand: 'Johnnie Walker',
    category: 'Blended Escocés',
    region: 'Escocia',
    abv: 40,
    volume: 700,
    price: 229990,
    image: '/images/products/jw-blue.jpg',
    badge: 'limited',
    description: 'La cúspide del arte de mezcla. Elegancia excepcional en cada sorbo.',
    inStock: true,
    rating: 4.9,
    reviews: 87,
  },
  {
    id: '5',
    slug: 'monkey-shoulder',
    name: 'Monkey Shoulder Blended Malt',
    brand: 'Monkey Shoulder',
    category: 'Blended Malt',
    region: 'Speyside',
    abv: 40,
    volume: 700,
    price: 39990,
    image: '/images/products/monkey-shoulder.jpg',
    badge: 'new',
    description: 'Mezcla suave y cremosa de tres single malts de Speyside. Perfecto para cócteles.',
    inStock: true,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: '6',
    slug: 'jack-daniels-single-barrel',
    name: "Jack Daniel's Single Barrel",
    brand: "Jack Daniel's",
    category: 'Tennessee Whiskey',
    region: 'Tennessee, USA',
    abv: 45,
    volume: 700,
    price: 54990,
    image: '/images/products/jd-single.jpg',
    description: 'Seleccionado a mano de barricas individuales en la cima del almacén.',
    inStock: true,
    rating: 4.7,
    reviews: 73,
  },
  {
    id: '7',
    slug: 'highland-park-12',
    name: 'Highland Park 12 Year Old Viking Honour',
    brand: 'Highland Park',
    category: 'Single Malt Escocés',
    region: 'Orkney',
    age: 12,
    abv: 40,
    volume: 700,
    price: 59990,
    originalPrice: 69990,
    image: '/images/products/highland-park-12.jpg',
    badge: 'sale',
    description: 'El equilibrio perfecto entre ahumado y suavidad. Herencia vikinga de Orkney.',
    inStock: true,
    rating: 4.8,
    reviews: 91,
  },
  {
    id: '8',
    slug: 'glenfarclas-105',
    name: 'Glenfarclas 105 Cask Strength',
    brand: 'Glenfarclas',
    category: 'Single Malt Escocés',
    region: 'Speyside',
    abv: 60,
    volume: 700,
    price: 79990,
    image: '/images/products/glenfarclas-105.jpg',
    badge: 'limited',
    description: 'Potencia de barrica completa. Madurado en jerez Oloroso, rico y complejo.',
    inStock: false,
    rating: 4.9,
    reviews: 44,
  },
];

export const newArrivals = products.filter(p => p.badge === 'new');
export const onSale = products.filter(p => p.badge === 'sale');
export const featured = products.slice(0, 4);

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
};

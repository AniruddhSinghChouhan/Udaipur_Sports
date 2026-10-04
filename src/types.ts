export interface Product {
  id: string;
  name: string;
  category: 'Cricket' | 'Football' | 'Gym' | 'Skating' | 'Accessories';
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // thumbnail details
  description: string;
  subtext: string;
  tags?: string[];
  sizes?: number[];
  weight?: string;
  drop?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: number;
}

export type ScreenType = 'home' | 'catalog' | 'detail' | 'checkout';

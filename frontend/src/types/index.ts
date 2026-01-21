export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  tags?: string[];
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  userId: string;
  productId: string;
  quantity: number;
  addedAt: string;
  product?: Product;
}

export interface Review {
  productId: string;
  reviewId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  address?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'createdAt' | 'price' | 'rating';
  keyword?: string;
}

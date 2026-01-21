import axios from 'axios';
import type { Product, CartItem, Review, SearchFilters } from '../types';

// @ts-ignore - config.js is injected at build time
const API_URL = window.ENV?.API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data.products;
};

export const getProduct = async (productId: string): Promise<Product> => {
  const response = await api.get(`/products/${productId}`);
  return response.data.product;
};

export const searchProducts = async (filters: SearchFilters): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.minRating) params.append('minRating', filters.minRating.toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.keyword) params.append('keyword', filters.keyword);

  const response = await api.get(`/products/search?${params.toString()}`);
  return response.data.products;
};

export const getRecommendations = async (productId: string): Promise<Product[]> => {
  const response = await api.get(`/products/recommendations/${productId}`);
  return response.data.recommendations;
};

// Cart
export const getCart = async (userId: string): Promise<CartItem[]> => {
  const response = await api.get(`/carts/${userId}`);
  return response.data.cartItems;
};

export const addToCart = async (userId: string, productId: string, quantity: number): Promise<void> => {
  await api.post(`/carts/${userId}/items`, {
    productId,
    quantity,
  });
};

export const updateCartItem = async (userId: string, productId: string, quantity: number): Promise<void> => {
  await api.put(`/carts/${userId}/items/${productId}`, {
    quantity,
  });
};

export const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  await api.delete(`/carts/${userId}/items/${productId}`);
};

// Reviews
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data.reviews;
};

export const createReview = async (review: Omit<Review, 'reviewId' | 'helpful' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  await api.post('/reviews', review);
};

export const markReviewHelpful = async (productId: string, reviewId: string): Promise<void> => {
  await api.post(`/reviews/${productId}/${reviewId}/helpful`);
};

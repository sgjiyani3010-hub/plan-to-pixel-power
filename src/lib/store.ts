import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'plain' | 'graphic' | 'polo' | 'custom';
  badge?: 'new' | 'trending' | 'bestseller';
  colors: string[];
  sizes: string[];
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  wishlist: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find(
        (c) => c.product.id === item.product.id && c.size === item.size && c.color === item.color
      );
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.product.id === item.product.id && c.size === item.size && c.color === item.color
              ? { ...c, quantity: c.quantity + item.quantity }
              : c
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.product.id !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: quantity <= 0
        ? state.cart.filter((c) => c.product.id !== productId)
        : state.cart.map((c) => (c.product.id === productId ? { ...c, quantity } : c)),
    })),
  toggleWishlist: (productId) =>
    set((state) => ({
      wishlist: state.wishlist.includes(productId)
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId],
    })),
  cartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
}));

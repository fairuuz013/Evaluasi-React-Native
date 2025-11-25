import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storage } from "../utils/storage";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  thumbnail?: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> | CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getLocalTotal: () => number;
  getTotalItems: () => number;
  // BARU: Function untuk external access (deep link)
  addProductToCartById: (productId: number, quantity?: number) => Promise<void>;
  loading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // LOAD CART DARI STORAGE SAAT APP START
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = async () => {
    try {
      setLoading(true);
      const savedCart = await storage.getCart();
      setCart(savedCart);
      console.log('🛒 Cart loaded from storage:', savedCart.length, 'items');
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // SAVE CART KE STORAGE SETIAP ADA PERUBAHAN
  useEffect(() => {
    if (cart.length > 0 || cart.length === 0) {
      saveCartToStorage();
    }
  }, [cart]);

  const saveCartToStorage = async () => {
    try {
      await storage.saveCart(cart);
    } catch (error: any) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, "quantity"> | CartItem) => {
    setCart((prev) => {
      const id = (item as CartItem).id;
      const exist = prev.find((p) => p.id === id);
      
      if (exist) {
        // Item sudah ada, update quantity
        return prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      
      // Item baru, tambah ke cart
      const toAdd: CartItem = {
        ...(item as any),
        quantity: (item as CartItem).quantity ?? 1,
      };
      return [...prev, toAdd];
    });
  };

  // BARU: Function untuk add product by ID (untuk deep link)
  const addProductToCartById = async (productId: number, quantity: number = 1): Promise<void> => {
    try {
      // Fetch product details dari API
      const product = await productApi.getProduct(productId);
      
      // Add to cart
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        imageUrl: product.thumbnail,
        quantity: quantity,
      });
      
      console.log(`🛒 Product ${productId} added to cart via deep link`);
    } catch (error) {
      console.error(`❌ Error adding product ${productId} to cart:`, error);
      throw error;
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      await storage.mergeCartItem(itemId, { quantity });
      
      setCart(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      setCart(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    setCart([]);
    await storage.clearCart();
  };

  const getLocalTotal = () =>
    cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const getTotalItems = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart,
      updateQuantity,
      clearCart, 
      getLocalTotal,
      getTotalItems,
      addProductToCartById, // BARU
      loading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

// BARU: Import productApi untuk digunakan dalam context
import { productApi } from '../api/productApi';
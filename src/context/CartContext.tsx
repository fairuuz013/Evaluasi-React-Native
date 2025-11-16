import React, { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  thumbnail?: string;
  quantity: number;
  // any other fields you want to keep from product
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> | CartItem) => void;
  clearCart: () => void;
  getLocalTotal: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, "quantity"> | CartItem) => {
    setCart((prev) => {
      const id = (item as CartItem).id;
      const exist = prev.find((p) => p.id === id);
      if (exist) {
        return prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      // ensure quantity exists
      const toAdd: CartItem = {
        ...(item as any),
        quantity: (item as CartItem).quantity ?? 1,
      };
      return [...prev, toAdd];
    });
  };

  const clearCart = () => setCart([]);

  const getLocalTotal = () =>
    cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, getLocalTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

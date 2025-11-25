import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storage } from "../utils/storage";

type WishlistContextType = {
  wishlist: number[];
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist dari storage
  useEffect(() => {
    loadWishlistFromStorage();
  }, []);

  const loadWishlistFromStorage = async () => {
    try {
      setLoading(true);
      const savedWishlist = await storage.getWishlist();
      setWishlist(savedWishlist);
      console.log('💖 Wishlist loaded from storage:', savedWishlist.length, 'items');
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save wishlist ke storage
  useEffect(() => {
    saveWishlistToStorage();
  }, [wishlist]);

  const saveWishlistToStorage = async () => {
    try {
      await storage.saveWishlist(wishlist);
    } catch (error: any) {
      console.error('Error saving wishlist:', error);
    }
  };

  const addToWishlist = async (productId: number) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev;
      }
      return [...prev, productId];
    });
  };

  const removeFromWishlist = async (productId: number) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    const isCurrentlyInWishlist = wishlist.includes(productId);
    
    if (isCurrentlyInWishlist) {
      await removeFromWishlist(productId);
      return false;
    } else {
      await addToWishlist(productId);
      return true;
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.includes(productId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount,
      loading 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};
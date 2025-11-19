import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Category, categoryApi } from '../api/categoryApi';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  loading: false,
  refreshCategories: async () => {},
});

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
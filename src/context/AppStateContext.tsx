import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HydrationResult, hydrateAllData } from '../utils/hydration';

interface AppStateContextType {
  isHydrated: boolean;
  hydrationResult: HydrationResult | null;
  hydrateApp: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType>({
  isHydrated: false,
  hydrationResult: null,
  hydrateApp: async () => {},
});

export const useAppState = () => useContext(AppStateContext);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrationResult, setHydrationResult] = useState<HydrationResult | null>(null);

  const hydrateApp = async () => {
    try {
      console.log('🔄 Starting app hydration...');
      const result = await hydrateAllData();
      setHydrationResult(result);
      setIsHydrated(true);
      console.log('✅ App hydration completed');
    } catch (error) {
      console.error('❌ App hydration failed:', error);
      setIsHydrated(true); // Tetap set true untuk menghindari infinite loading
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        isHydrated,
        hydrationResult,
        hydrateApp,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
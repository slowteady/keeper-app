import React, { createContext, useContext, useState, ReactNode } from 'react';

import { BottomNavigationItem } from './BottomNavigation';

export interface BottomNavigationContextType {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  items: BottomNavigationItem[];
  setItems: (items: BottomNavigationItem[]) => void;
}

const BottomNavigationContext = createContext<BottomNavigationContextType | undefined>(undefined);

export interface BottomNavigationProviderProps {
  children: ReactNode;
  initialTab?: string;
}

export const BottomNavigationProvider: React.FC<BottomNavigationProviderProps> = ({
  children,
  initialTab = 'home'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState<BottomNavigationItem[]>([]);

  const value: BottomNavigationContextType = {
    activeTab,
    setActiveTab,
    items,
    setItems
  };

  return <BottomNavigationContext.Provider value={value}>{children}</BottomNavigationContext.Provider>;
};

export const useBottomNavigation = (): BottomNavigationContextType => {
  const context = useContext(BottomNavigationContext);
  if (!context) {
    throw new Error('useBottomNavigation must be used within a BottomNavigationProvider');
  }
  return context;
};

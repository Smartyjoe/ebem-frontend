import React, { createContext, useContext, useState, useCallback } from 'react';

export type PanelType = 'search' | 'request' | 'cart' | null;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  badge?: string;
}

interface AppContextType {
  activePanel: PanelType;
  openPanel: (panel: PanelType) => void;
  closePanel: () => void;
  prefillRequest: string;
  setPrefillRequest: (text: string) => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [prefillRequest, setPrefillRequest] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const openPanel = useCallback((panel: PanelType) => setActivePanel(panel), []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <AppContext.Provider value={{
      activePanel, openPanel, closePanel,
      prefillRequest, setPrefillRequest,
      cartItems, addToCart, removeFromCart, updateQuantity,
      cartCount, cartTotal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  game?: string;
  selectedTier: 'Günlük' | 'Haftalık' | 'Aylık';
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, tier: string) => void;
  updateQuantity: (id: string, tier: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Tarayıcı hafızasından sepeti yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dexx_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  // Değişince kaydet
  useEffect(() => {
    try {
      localStorage.setItem('dexx_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const tier = item.selectedTier || 'Aylık';
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.selectedTier === tier);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.selectedTier === tier
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, selectedTier: tier, quantity: item.quantity || 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string, tier: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.selectedTier === tier)));
  };

  const updateQuantity = (id: string, tier: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, tier);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.selectedTier === tier ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
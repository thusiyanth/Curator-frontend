import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((food, quantity = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i.food.id === food.id);
      if (exists) {
        return prev.map(i =>
          i.food.id === food.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { food, quantity }];
    });
  }, []);

  const removeItem = useCallback((foodId) => {
    setItems(prev => prev.filter(i => i.food.id !== foodId));
  }, []);

  const updateQuantity = useCallback((foodId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.food.id !== foodId));
      return;
    }
    setItems(prev =>
      prev.map(i => (i.food.id === foodId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.food.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

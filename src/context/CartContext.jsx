import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Enforce stock bounds
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity, maxStock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const boundedQty = Math.min(quantity, maxStock);
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity: boundedQty } : item));
  };

  const applyCoupon = (code) => {
    const upperCode = code.toUpperCase();
    if (upperCode === 'FORTE10') {
      setCoupon(upperCode);
      setDiscountPercent(10);
      return { success: true, message: '%10 İndirim Uygulandı!' };
    } else if (upperCode === 'FORTE20') {
      setCoupon(upperCode);
      setDiscountPercent(20);
      return { success: true, message: '%20 İndirim Uygulandı!' };
    }
    return { success: false, message: 'Geçersiz indirim kodu.' };
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountPercent(0);
  };

  const clearCart = () => {
    setCartItems([]);
    removeCoupon();
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const cartTotal = cartSubtotal - discountAmount;
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      coupon,
      discountPercent,
      discountAmount,
      applyCoupon,
      removeCoupon,
      cartSubtotal,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

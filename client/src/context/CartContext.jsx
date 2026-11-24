import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [packagingGrade, setPackagingGrade] = useState(() => {
    return localStorage.getItem('fv_packaging_grade') || 'standard';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quickViewFigure, setQuickViewFigure] = useState(null);

  useEffect(() => {
    localStorage.setItem('fv_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('fv_packaging_grade', packagingGrade);
  }, [packagingGrade]);

  const addToCart = (figure, quantity = 1, openDrawer = true) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => Number(i.id) === Number(figure.id));
      if (idx > -1) {
        const updated = [...prev];
        const nextQty = Math.min(figure.stock || 99, updated[idx].quantity + quantity);
        updated[idx] = { ...updated[idx], quantity: nextQty };
        return updated;
      }
      return [
        ...prev,
        {
          id: figure.id,
          slug: figure.slug,
          title: figure.title,
          character_name: figure.character_name,
          category_name: figure.category_name,
          team_name: figure.team_name,
          scale: figure.scale,
          price: Number(figure.price),
          original_price: figure.original_price ? Number(figure.original_price) : null,
          image_url: figure.image_url,
          stock: Number(figure.stock || 10),
          badge: figure.badge,
          quantity: Math.max(1, quantity)
        }
      ];
    });
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const updateQuantity = (figureId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(figureId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        Number(item.id) === Number(figureId)
          ? { ...item, quantity: Math.min(item.stock || 99, Number(quantity)) }
          : item
      )
    );
  };

  const removeFromCart = (figureId) => {
    setItems((prev) => prev.filter((item) => Number(item.id) !== Number(figureId)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const packagingFee = items.length > 0 && packagingGrade === 'collector' ? 199 : 0;
  const shippingFee = items.length === 0 ? 0 : subtotal >= 1999 ? 0 : 149;
  const total = subtotal + packagingFee + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        packagingGrade,
        setPackagingGrade,
        packagingFee,
        shippingFee,
        total,
        isDrawerOpen,
        setIsDrawerOpen,
        quickViewFigure,
        setQuickViewFigure,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

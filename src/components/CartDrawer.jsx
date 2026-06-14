import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, Tag, Percent } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, onCheckout }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    coupon,
    discountPercent,
    discountAmount,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartTotal
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode);
    if (res.success) {
      setCouponMsg({ text: res.message, isError: false });
      setCouponCode('');
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMsg({ text: '', isError: false });
  };

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay animate-fade" onClick={onClose}>
      <div className="cart-drawer glass" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <h2 className="drawer-title">Sepetim ({cartItems.length} Ürün)</h2>
          <button onClick={onClose} className="close-btn" id="close-cart-drawer-btn">
            <X size={24} />
          </button>
        </div>

        {/* Drawer Body - Items List */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBagIcon />
              <p className="empty-title">Sepetiniz Boş</p>
              <p className="empty-desc">Forte Plus ürünlerini keşfetmek için kataloğumuza göz atın.</p>
              <button onClick={onClose} className="btn btn-primary">Alışverişe Başla</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image_url} alt={item.name} className="cart-item-img" onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=200&auto=format&fit=crop';
                  }} />
                  <div className="cart-item-details">
                    <h4 className="item-title">{item.name}</h4>
                    <span className="item-price">₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    
                    {/* Quantity controls */}
                    <div className="quantity-controls-row">
                      <div className="qty-selector">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)} className="qty-btn" id={`decrease-qty-${item.id}`}>
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)} className="qty-btn" id={`increase-qty-${item.id}`}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="delete-item-btn" id={`remove-item-${item.id}`} title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer - Calculations & Coupon */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Coupon Application Box */}
            <div className="coupon-box">
              {coupon ? (
                <div className="active-coupon-badge">
                  <div className="coupon-info">
                    <Percent size={16} className="coupon-icon" />
                    <span><strong>{coupon}</strong> (%{discountPercent} İndirim)</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="remove-coupon-btn" id="remove-coupon-btn">
                    Kaldır
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    id="coupon-code-input"
                    type="text"
                    placeholder="İndirim Kodu (örn: FORTE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="form-control coupon-input"
                  />
                  <button type="submit" className="btn btn-secondary apply-btn" id="apply-coupon-btn">Uygula</button>
                </form>
              )}
              {couponMsg.text && (
                <p className={`coupon-message ${couponMsg.isError ? 'error-text' : 'success-text'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="summary-row">
              <span className="summary-label">Ara Toplam:</span>
              <span className="summary-val">₺{cartSubtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="summary-row discount-row">
                <span className="summary-label">İndirim (%{discountPercent}):</span>
                <span className="summary-val">- ₺{discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="summary-row total-row">
              <span className="summary-label">Genel Toplam:</span>
              <span className="summary-val">₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => { onCheckout(); onClose(); }}
              className="btn btn-primary checkout-btn-cta"
              id="checkout-flow-cta-btn"
            >
              Ödemeye Geç
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cart-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          backdrop-filter: blur(4px);
        }
        .cart-drawer {
          width: 440px;
          height: 100%;
          background: var(--surface);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 480px) {
          .cart-drawer { width: 100%; }
        }
        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-title {
          font-size: 20px;
          font-weight: 800;
        }
        .close-btn {
          color: var(--text-muted);
          transition: var(--transition);
        }
        .close-btn:hover {
          color: var(--text);
          transform: rotate(90deg);
        }
        .drawer-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .empty-cart-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 80%;
          gap: 16px;
        }
        .empty-title {
          font-size: 18px;
          font-weight: 700;
          margin-top: 10px;
        }
        .empty-desc {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 280px;
          margin-bottom: 10px;
        }
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cart-item {
          display: flex;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .cart-item-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: var(--border-radius-sm);
          background-color: var(--surface-hover);
          border: 1px solid var(--border);
          padding: 8px;
        }
        .cart-item-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .item-title {
          font-size: 14px;
          font-weight: 700;
          line-height: 1.4;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .item-price {
          font-weight: 800;
          font-size: 15px;
          color: var(--primary);
          margin-bottom: 8px;
        }
        .quantity-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .qty-selector {
          display: flex;
          align-items: center;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          border-radius: 50px;
          padding: 2px;
        }
        .qty-btn {
          width: 28px;
          height: 28px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .qty-btn:hover {
          background-color: var(--border);
          color: var(--text);
        }
        .qty-value {
          width: 30px;
          text-align: center;
          font-weight: 700;
          font-size: 14px;
        }
        .delete-item-btn {
          color: var(--text-muted);
          transition: var(--transition);
        }
        .delete-item-btn:hover {
          color: var(--danger);
          transform: scale(1.1);
        }
        .drawer-footer {
          padding: 24px;
          border-top: 1px solid var(--border);
          background-color: var(--background);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .coupon-box {
          margin-bottom: 8px;
        }
        .coupon-form {
          display: flex;
          gap: 8px;
        }
        .coupon-input {
          flex-grow: 1;
          padding: 8px 12px;
          font-size: 14px;
        }
        .apply-btn {
          padding: 8px 16px;
          font-size: 13px;
        }
        .active-coupon-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 10px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          border: 1px dashed var(--success);
        }
        .coupon-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .remove-coupon-btn {
          font-weight: 700;
          text-decoration: underline;
        }
        .coupon-message {
          font-size: 12px;
          margin-top: 4px;
          font-weight: 600;
        }
        .success-text { color: var(--success); }
        .error-text { color: var(--danger); }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          color: var(--text-muted);
        }
        .discount-row {
          color: var(--success);
          font-weight: 600;
        }
        .total-row {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          border-top: 1px solid var(--border);
          padding-top: 12px;
          margin-top: 4px;
        }
        .checkout-btn-cta {
          width: 100%;
          padding: 14px;
        }
      `}</style>
    </div>
  );
}

// Inline custom SVG component for shopping bag to avoid dependencies
function ShoppingBagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}

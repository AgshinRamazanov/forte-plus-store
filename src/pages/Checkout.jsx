import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import CreditCardForm from '../components/CreditCardForm';
import { ArrowLeft, CheckCircle, Truck, Calendar } from 'lucide-react';

export default function Checkout({ onBack, onNavigate, onToast }) {
  const { cartItems, cartSubtotal, discountPercent, discountAmount, cartTotal, clearCart } = useCart();
  const { token, user } = useAuth();

  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: ''
  });

  // Credit card details state
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isFlipped, setIsFlipped] = useState(false);

  // Success screen details
  const [orderId, setOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    // Auto format card number: add spaces
    if (name === 'number') {
      const trimmed = value.replace(/\s?/g, '');
      if (isNaN(trimmed)) return;
      const formatted = trimmed.replace(/.{4}/g, '$& ').trim();
      setCardDetails(prev => ({ ...prev, number: formatted }));
      return;
    }

    // Auto format expiry date: add slash
    if (name === 'expiry') {
      const cleaned = value.replace(/\//g, '');
      if (isNaN(cleaned)) return;
      if (cleaned.length > 2) {
        setCardDetails(prev => ({ ...prev, expiry: `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` }));
      } else {
        setCardDetails(prev => ({ ...prev, expiry: cleaned }));
      }
      return;
    }

    // Limit CVV
    if (name === 'cvv') {
      if (isNaN(value)) return;
      setCardDetails(prev => ({ ...prev, cvv: value }));
      return;
    }

    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCardFocus = (e) => {
    if (e.target.name === 'cvv') {
      setIsFlipped(true);
    }
  };

  const handleCardBlur = () => {
    setIsFlipped(false);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      if (onToast) onToast('Sipariş oluşturmak için lütfen giriş yapın.', 'error');
      return;
    }

    setSubmitting(true);
    const compiledAddress = `${shippingDetails.name}, ${shippingDetails.phone}, ${shippingDetails.address}, ${shippingDetails.city}`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems,
          shippingAddress: compiledAddress,
          totalAmount: cartTotal
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOrderId(data.orderId);
        clearCart();
        if (onToast) onToast('Siparişiniz başarıyla alındı!', 'success');
      } else {
        if (onToast) onToast(data.message || 'Sipariş oluşturulurken hata oluştu.', 'error');
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Sunucu bağlantı hatası.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully created, show confirmation page
  if (orderId) {
    return (
      <div className="container success-page animate-fade">
        <div className="success-card glass text-center">
          <div className="success-icon-wrapper animate-float">
            <CheckCircle size={64} className="success-icon" />
          </div>
          <h1 className="success-title">Siparişiniz Alındı!</h1>
          <p className="success-lead">Bizi tercih ettiğiniz için teşekkür ederiz. Sipariş detaylarınız aşağıdadır.</p>
          
          <div className="success-details-box glass">
            <div className="detail-row-item">
              <span className="label">Sipariş Numarası:</span>
              <span className="val order-id-highlight">#FP-{orderId}</span>
            </div>
            <div className="detail-row-item">
              <span className="label">Toplam Tutar:</span>
              <span className="val">₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="detail-row-item">
              <span className="label">Teslimat Adresi:</span>
              <span className="val address-val">{shippingDetails.address}, {shippingDetails.city}</span>
            </div>
          </div>

          <div className="shipping-info-grid">
            <div className="info-card glass">
              <Truck className="info-icon" size={24} />
              <h4>Kargo Durumu</h4>
              <p>Siparişiniz 24 saat içinde hazırlanarak kargoya teslim edilecektir.</p>
            </div>
            <div className="info-card glass">
              <Calendar className="info-icon" size={24} />
              <h4>Tahmini Teslimat</h4>
              <p>1-3 iş günü içerisinde adresinize ulaştırılacaktır.</p>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={() => onNavigate('home')} className="btn btn-primary">Alışverişe Devam Et</button>
            <button onClick={() => onNavigate('profile')} className="btn btn-secondary">Siparişlerimi Takip Et</button>
          </div>
        </div>

        <style>{`
          .success-page {
            padding: 80px 0;
            display: flex;
            justify-content: center;
          }
          .success-card {
            max-width: 600px;
            width: 100%;
            padding: 48px;
            border-radius: var(--border-radius-lg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
          }
          .success-icon-wrapper {
            margin-bottom: 24px;
            display: inline-block;
          }
          .success-icon {
            color: var(--success);
          }
          .success-title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
          }
          .success-lead {
            color: var(--text-muted);
            font-size: 15px;
            margin-bottom: 32px;
          }
          .success-details-box {
            padding: 20px;
            border-radius: var(--border-radius-md);
            border: 1px solid var(--border);
            text-align: left;
            margin-bottom: 32px;
          }
          .detail-row-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid var(--border);
            font-size: 14.5px;
          }
          .detail-row-item:last-child {
            border-bottom: none;
          }
          .detail-row-item .label {
            color: var(--text-muted);
            font-weight: 600;
          }
          .detail-row-item .val {
            font-weight: 700;
            color: var(--text);
          }
          .order-id-highlight {
            color: var(--primary) !important;
          }
          .address-val {
            max-width: 250px;
            text-align: right;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .shipping-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 40px;
          }
          .shipping-info-grid .info-card {
            padding: 20px;
            border-radius: var(--border-radius-md);
            border: 1px solid var(--border);
            text-align: center;
          }
          .info-icon {
            color: var(--primary);
            margin-bottom: 12px;
          }
          .shipping-info-grid h4 {
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .shipping-info-grid p {
            font-size: 12.5px;
            color: var(--text-muted);
            line-height: 1.4;
          }
          .success-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
          }
          @media (max-width: 600px) {
            .shipping-info-grid { grid-template-columns: 1fr; }
            .success-actions { flex-direction: column; }
            .success-card { padding: 24px; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade">
      {/* Return Button */}
      <button onClick={onBack} className="btn btn-secondary back-btn-top">
        <ArrowLeft size={16} /> Sepete Dön
      </button>

      <h1 className="page-title">Güvenli Ödeme</h1>

      <form onSubmit={handleSubmitOrder} className="checkout-layout">
        {/* Left Side: Shipping & Payment Form */}
        <div className="checkout-form-panel">
          
          {/* Shipping Box */}
          <div className="checkout-step-box glass">
            <h2 className="step-title">1. Teslimat Adresi</h2>
            
            <div className="form-group">
              <label htmlFor="shipping-name">Ad Soyad</label>
              <input
                id="shipping-name"
                type="text"
                name="name"
                value={shippingDetails.name}
                onChange={handleShippingChange}
                placeholder="Örn: Ahmet Yılmaz"
                className="form-control"
                required
              />
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label htmlFor="shipping-email">E-posta</label>
                <input
                  id="shipping-email"
                  type="email"
                  name="email"
                  value={shippingDetails.email}
                  onChange={handleShippingChange}
                  placeholder="ahmet@example.com"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="shipping-phone">Telefon Numarası</label>
                <input
                  id="shipping-phone"
                  type="tel"
                  name="phone"
                  value={shippingDetails.phone}
                  onChange={handleShippingChange}
                  placeholder="0555 123 45 67"
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="shipping-address">Açık Adres</label>
              <textarea
                id="shipping-address"
                name="address"
                value={shippingDetails.address}
                onChange={handleShippingChange}
                placeholder="Mahalle, sokak, daire no, apartman vb."
                rows="3"
                className="form-control"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="shipping-city">Şehir</label>
              <input
                id="shipping-city"
                type="text"
                name="city"
                value={shippingDetails.city}
                onChange={handleShippingChange}
                placeholder="İstanbul"
                className="form-control"
                required
              />
            </div>
          </div>

          {/* Payment Box */}
          <div className="checkout-step-box glass">
            <h2 className="step-title">2. Ödeme Bilgileri</h2>
            
            <CreditCardForm
              cardDetails={cardDetails}
              onChange={handleCardChange}
              onFocus={handleCardFocus}
              onBlur={handleCardBlur}
              isFlipped={isFlipped}
            />
          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="checkout-summary-panel">
          <div className="summary-sticky-box glass">
            <h3 className="summary-title">Sipariş Özeti</h3>
            
            {/* Items list */}
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item-card">
                  <span className="item-qty">{item.quantity}x</span>
                  <div className="item-info">
                    <p className="item-title">{item.name}</p>
                    <p className="item-subprice">₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <span className="item-total-price">₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pricing-summary">
              <div className="pricing-row">
                <span>Ara Toplam:</span>
                <span>₺{cartSubtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountAmount > 0 && (
                <div className="pricing-row discount">
                  <span>İndirim (%{discountPercent}):</span>
                  <span>- ₺{discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="pricing-row shipping">
                <span>Kargo Ücreti:</span>
                <span className="free-shipping-badge">Ücretsiz</span>
              </div>
              
              <div className="pricing-row total">
                <span>Toplam Tutar:</span>
                <span>₺{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary submit-order-btn"
              id="confirm-checkout-payment-btn"
            >
              {submitting ? 'Sipariş İşleniyor...' : `₺${cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} Öde ve Tamamla`}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .checkout-page {
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .back-btn-top {
          margin-bottom: 24px;
        }
        .page-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 32px;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 40px;
          align-items: start;
        }
        .checkout-form-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .checkout-step-box {
          padding: 32px;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
        }
        .step-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        .checkout-summary-panel {
          position: sticky;
          top: calc(var(--header-height) + 24px);
        }
        .summary-sticky-box {
          padding: 24px;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
        }
        .summary-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }
        .summary-items {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }
        .summary-item-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13.5px;
        }
        .item-qty {
          font-weight: 800;
          color: var(--primary);
          font-size: 14px;
        }
        .item-info {
          flex-grow: 1;
        }
        .item-info .item-title {
          font-weight: 700;
          color: var(--text);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .item-info .item-subprice {
          color: var(--text-muted);
          font-size: 11px;
          margin-top: 2px;
        }
        .item-total-price {
          font-weight: 700;
          color: var(--text);
        }
        .pricing-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .pricing-row {
          display: flex;
          justify-content: space-between;
          font-size: 14.5px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .pricing-row.discount {
          color: var(--success);
        }
        .free-shipping-badge {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 50px;
        }
        .pricing-row.total {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          border-top: 1px solid var(--border);
          padding-top: 16px;
          margin-top: 4px;
        }
        .submit-order-btn {
          width: 100%;
          padding: 14px;
        }

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          .checkout-summary-panel {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

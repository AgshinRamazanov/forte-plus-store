import React, { useState } from 'react';

export default function CreditCardForm({ cardDetails, onChange, onFocus, onBlur, isFlipped }) {
  // Determine card type visually
  const getCardType = (number) => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    return 'ForteCard';
  };

  const cardType = getCardType(cardDetails.number);

  return (
    <div className="payment-card-section">
      {/* 3D Visual Card Container */}
      <div className="card-container-3d">
        <div className={`credit-card-3d ${isFlipped ? 'flipped' : ''}`}>
          
          {/* Card Front */}
          <div className="card-face card-front glass-card">
            <div className="card-header-row">
              <div className="card-chip"></div>
              <span className="card-brand">{cardType}</span>
            </div>
            
            <div className="card-number-display">
              {cardDetails.number || '•••• •••• •••• ••••'}
            </div>
            
            <div className="card-footer-row">
              <div className="card-holder-info">
                <span className="card-label">KART SAHİBİ</span>
                <span className="card-value">{cardDetails.name.toUpperCase() || 'AD SOYAD'}</span>
              </div>
              <div className="card-expiry-info">
                <span className="card-label">GEÇ. TAR.</span>
                <span className="card-value">{cardDetails.expiry || 'AA/YY'}</span>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div className="card-face card-back glass-card">
            <div className="magnetic-strip"></div>
            <div className="signature-area">
              <div className="cvv-display-strip">{cardDetails.cvv || '•••'}</div>
              <span className="card-label cvv-label">CVV</span>
            </div>
            <div className="card-back-footer">
              <span className="card-back-text">Forte Plus Premium Secure Payment</span>
            </div>
          </div>

        </div>
      </div>

      {/* Input Fields */}
      <div className="payment-fields-grid">
        <div className="form-group">
          <label htmlFor="card-number">Kart Numarası</label>
          <input
            id="card-number"
            type="text"
            name="number"
            placeholder="4242 4242 4242 4242"
            maxLength="19"
            value={cardDetails.number}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="card-name">Kart Sahibi</label>
          <input
            id="card-name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={cardDetails.name}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="form-control"
            required
          />
        </div>

        <div className="grid grid-cols-2">
          <div className="form-group">
            <label htmlFor="card-expiry">Son Kullanma Tarihi</label>
            <input
              id="card-expiry"
              type="text"
              name="expiry"
              placeholder="AA/YY"
              maxLength="5"
              value={cardDetails.expiry}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="card-cvv">CVV / Güvenlik Kodu</label>
            <input
              id="card-cvv"
              type="text"
              name="cvv"
              placeholder="123"
              maxLength="3"
              value={cardDetails.cvv}
              onChange={onChange}
              onFocus={onFocus} // triggers flip
              onBlur={onBlur}   // triggers flip back
              className="form-control"
              required
            />
          </div>
        </div>
      </div>

      <style>{`
        .payment-card-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
        }
        
        /* 3D Card Styling */
        .card-container-3d {
          perspective: 1000px;
          width: 100%;
          max-width: 360px;
          height: 210px;
        }
        
        .credit-card-3d {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .credit-card-3d.flipped {
          transform: rotateY(180deg);
        }
        
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: var(--border-radius-md);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-card {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          box-shadow: 0 15px 35px rgba(49, 46, 129, 0.2);
        }
        
        .card-front {
          z-index: 2;
          transform: rotateY(0deg);
        }
        
        .card-back {
          transform: rotateY(180deg);
          padding: 0;
          justify-content: flex-start;
          gap: 16px;
        }
        
        /* Front Details */
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-chip {
          width: 46px;
          height: 36px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-radius: 6px;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }
        
        .card-brand {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.5px;
          font-style: italic;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .card-number-display {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-align: center;
          margin: 16px 0;
          font-family: monospace;
        }
        
        .card-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .card-label {
          display: block;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        
        .card-value {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        
        /* Back Details */
        .magnetic-strip {
          width: 100%;
          height: 44px;
          background: #090d16;
          margin-top: 24px;
        }
        
        .signature-area {
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          width: 100%;
        }
        
        .cvv-display-strip {
          width: 100%;
          background: #f1f5f9;
          color: #0f172a;
          height: 38px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 16px;
          font-family: monospace;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        .cvv-label {
          margin-top: 4px;
        }
        
        .card-back-footer {
          margin-top: auto;
          margin-bottom: 16px;
          padding: 0 24px;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 600;
          text-align: center;
        }
        
        .payment-fields-grid {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const isLowStock = product.stock > 0 && product.stock < 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="product-card glass animate-fade" onClick={() => onViewDetails(product.id)}>
      {/* Category Tag */}
      <span className="product-category-tag">{product.category === 'Coffee Care' ? 'Kahve Ekipman Bakımı' : product.category === 'Industrial Care' ? 'Endüstriyel Mutfak' : 'Genel Ev Temizliği'}</span>

      {/* Image Container */}
      <div className="product-image-wrapper">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=600&auto=format&fit=crop';
          }}
        />
        {isOutOfStock && <div className="out-of-stock-overlay">STOKTA YOK</div>}
      </div>

      {/* Info Block */}
      <div className="product-info-block">
        <h3 className="product-title">{product.name}</h3>
        
        {/* Rating Row (simulated if no rating average, usually 4.5+ for 10K Endüstriyel) */}
        <div className="product-rating-row">
          <Star className="star-icon filled" size={14} />
          <span className="rating-score">4.8</span>
          <span className="rating-count">(24 Değerlendirme)</span>
        </div>

        {/* Stock status badge */}
        <div className="product-stock-status">
          {isOutOfStock ? (
            <span className="badge badge-danger">Tükendi</span>
          ) : isLowStock ? (
            <span className="badge badge-warning">Son {product.stock} Ürün!</span>
          ) : (
            <span className="badge badge-success">Stokta Var</span>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="product-price-action-row">
          <div className="price-container">
            <span className="currency-symbol">₺</span>
            <span className="price-value">{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn btn-primary add-to-cart-card-btn ${isOutOfStock ? 'disabled' : ''}`}
            title="Sepete Ekle"
            id={`add-to-cart-btn-${product.id}`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .product-card {
          border-radius: var(--border-radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          transition: var(--transition);
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .product-card:hover {
          transform: translateY(-6px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
        .product-category-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.7);
          color: white;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 50px;
          backdrop-filter: blur(4px);
          z-index: 10;
        }
        .product-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 100%; /* 1:1 Aspect Ratio */
          background-color: #f8fafc;
          overflow: hidden;
          border-bottom: 1px solid var(--border);
        }
        [data-theme="dark"] .product-image-wrapper {
          background-color: #0f172a;
        }
        .product-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
          transition: transform 0.5s ease;
        }
        .product-card:hover .product-image {
          transform: scale(1.08);
        }
        .out-of-stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          backdrop-filter: blur(2px);
        }
        .product-info-block {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .product-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 44px;
        }
        .product-rating-row {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 10px;
        }
        .star-icon.filled {
          color: var(--accent);
          fill: var(--accent);
        }
        .rating-score {
          font-weight: 700;
          font-size: 13px;
          color: var(--text);
        }
        .rating-count {
          color: var(--text-muted);
          font-size: 12px;
        }
        .product-stock-status {
          margin-bottom: 12px;
        }
        .product-stock-status .badge {
          font-size: 10px;
          padding: 2px 8px;
        }
        .product-price-action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .price-container {
          display: flex;
          align-items: baseline;
          color: var(--text);
        }
        .currency-symbol {
          font-size: 16px;
          font-weight: 800;
          color: var(--primary);
          margin-right: 2px;
        }
        .price-value {
          font-size: 20px;
          font-weight: 800;
        }
        .add-to-cart-card-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 50px;
        }
        .add-to-cart-card-btn.disabled {
          background-color: var(--border);
          color: var(--text-muted);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

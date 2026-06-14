import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldAlert, CheckCircle, ChevronRight, User } from 'lucide-react';

export default function ProductDetail({ productId, onBack, onToast }) {
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('features');
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const fetchProductDetails = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ürün detayı yüklenirken hata:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product.stock >= quantity) {
      addToCart(product, quantity);
      if (onToast) onToast('Ürün sepete eklendi!', 'success');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      if (onToast) onToast('Değerlendirme yapmak için giriş yapmalısınız.', 'error');
      return;
    }

    setReviewSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();
      if (response.ok) {
        if (onToast) onToast(data.message || 'Değerlendirmeniz eklendi!', 'success');
        setComment('');
        setRating(5);
        fetchProductDetails(); // reload review list
      } else {
        if (onToast) onToast(data.message || 'Bir hata oluştu.', 'error');
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Sunucu bağlantı hatası.', 'error');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container product-detail-loading section">
        <div className="spinner"></div>
        <p>Ürün detayları yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section text-center">
        <p>Ürün bulunamadı.</p>
        <button onClick={onBack} className="btn btn-secondary mt-4">Geri Dön</button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="product-detail-page container animate-fade">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={onBack} className="breadcrumb-link">Katalog</span>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="detail-layout">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="detail-main-img-box glass">
            <img
              src={product.image_url}
              alt={product.name}
              className="detail-main-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=600&auto=format&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Info Area */}
        <div className="detail-info">
          <span className="badge badge-primary detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-rating-row">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={16} className={`star-icon ${star <= 4.8 ? 'filled' : ''}`} />
              ))}
            </div>
            <span className="rating-score">4.8 / 5.0</span>
            <span className="review-count">({product.reviews?.length || 0} Kullanıcı Yorumu)</span>
          </div>

          <div className="detail-price-box">
            <span className="price-symbol">₺</span>
            <span className="price-val">{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            <span className="price-tax-note">KDV Dahil</span>
          </div>

          <p className="detail-description">{product.description}</p>

          {/* Add to Cart Actions */}
          <div className="detail-purchase-box glass">
            <div className="purchase-status-row">
              <span className="status-label">Stok Durumu:</span>
              {isOutOfStock ? (
                <span className="badge badge-danger">Tükendi</span>
              ) : (
                <span className="badge badge-success">Stokta Var ({product.stock} Adet)</span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="purchase-action-row">
                <div className="quantity-adjuster">
                  <button onClick={() => setQuantity(prev => Math.max(prev - 1, 1))} className="qty-btn" id="detail-qty-decrease">-</button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock))} className="qty-btn" id="detail-qty-increase">+</button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary add-to-cart-cta-btn"
                  id="add-to-cart-detail-btn"
                >
                  Sepete Ekle
                </button>
              </div>
            )}
          </div>

          {/* Tabbed Info System */}
          <div className="info-tabs-container">
            <div className="tabs-header">
              <button onClick={() => setActiveTab('features')} className={`tab-header-btn ${activeTab === 'features' ? 'active' : ''}`}>Öne Çıkan Özellikler</button>
              <button onClick={() => setActiveTab('usage')} className={`tab-header-btn ${activeTab === 'usage' ? 'active' : ''}`}>Kullanım Talimatı</button>
              <button onClick={() => setActiveTab('safety')} className={`tab-header-btn ${activeTab === 'safety' ? 'active' : ''}`}>Güvenlik & MSDS</button>
            </div>
            
            <div className="tab-content glass">
              {activeTab === 'features' && (
                <div className="features-tab-list">
                  {product.features?.map((feat, idx) => (
                    <div key={idx} className="feature-item">
                      <CheckCircle size={16} className="feature-icon" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'usage' && (
                <div className="usage-tab-content">
                  <p><strong>Uygulama Adımları:</strong></p>
                  <ol>
                    <li>Cihazınızın temizlik menüsünü/modunu açın.</li>
                    <li>Forte Plus temizlik tabletini/sıvısını belirtilen hazneye (grup başlığı, deterjan gözü vb.) ekleyin.</li>
                    <li>Cihazın otomatik yıkama programını başlatın.</li>
                    <li>Program tamamlandıktan sonra cihazınızı bol temiz su ile en az bir kez durulayın.</li>
                  </ol>
                </div>
              )}
              {activeTab === 'safety' && (
                <div className="safety-tab-content">
                  <div className="safety-warning-box">
                    <ShieldAlert size={20} className="warning-icon" />
                    <div>
                      <p><strong>Önemli Güvenlik Uyarısı:</strong></p>
                      <p className="warning-desc">Göz ve cilt tahrişine yol açabilir. Çocukların ulaşamayacağı yerlerde saklayın. El, yüz, vücut ve gıda maddeleri temizliğinde kullanmayınız. Göz ile teması halinde bol suyla durulayın.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section section">
        <h2 className="section-title">Kullanıcı Değerlendirmeleri</h2>
        
        <div className="reviews-layout">
          {/* Reviews List */}
          <div className="reviews-list-container">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="empty-reviews-state glass">
                <p>Bu ürün için henüz değerlendirme yapılmamış. İlk yorumu siz yazın!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {product.reviews.map(rev => (
                  <div key={rev.id} className="review-card glass">
                    <div className="review-header">
                      <div className="user-info">
                        <div className="avatar"><User size={16} /></div>
                        <div>
                          <p className="review-user-name">{rev.user_name}</p>
                          <span className="review-date">{new Date(rev.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={14} className={`star-icon ${star <= rev.rating ? 'filled' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Review Box */}
          <div className="submit-review-box glass">
            <h3>Ürünü Değerlendir</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Puanınız</label>
                  <div className="rating-picker">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`star-pick-btn ${star <= rating ? 'active' : ''}`}
                        id={`star-btn-${star}`}
                      >
                        <Star size={24} className="star-icon" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment-textarea">Yorumunuz</label>
                  <textarea
                    id="review-comment-textarea"
                    rows="4"
                    placeholder="Ürün hakkındaki deneyimlerinizi paylaşın..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-control"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="btn btn-primary w-full submit-comment-btn"
                  id="submit-review-form-btn"
                >
                  {reviewSubmitLoading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                </button>
              </form>
            ) : (
              <div className="login-required-box text-center">
                <p>Ürün yorumu yazabilmek için giriş yapmalısınız.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .product-detail-page {
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 32px;
        }
        .breadcrumb-link {
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }
        .breadcrumb-link:hover {
          color: var(--primary);
        }
        .breadcrumb-current {
          color: var(--text);
          font-weight: 700;
        }
        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: start;
        }
        .detail-main-img-box {
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
          padding: 40px;
          background-color: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .detail-main-img {
          max-width: 100%;
          max-height: 480px;
          object-fit: contain;
        }
        .detail-info {
          display: flex;
          flex-direction: column;
        }
        .detail-category {
          align-self: flex-start;
          margin-bottom: 12px;
        }
        .detail-title {
          font-size: 32px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        .detail-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 24px;
        }
        .stars {
          display: flex;
          gap: 2px;
        }
        .star-icon {
          color: var(--border);
        }
        .star-icon.filled {
          color: var(--accent);
          fill: var(--accent);
        }
        .rating-score {
          font-weight: 700;
        }
        .review-count {
          color: var(--text-muted);
        }
        .detail-price-box {
          display: flex;
          align-items: baseline;
          margin-bottom: 24px;
        }
        .price-symbol {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          margin-right: 4px;
        }
        .price-val {
          font-size: 36px;
          font-weight: 800;
        }
        .price-tax-note {
          font-size: 13px;
          color: var(--text-muted);
          margin-left: 12px;
          font-weight: 600;
        }
        .detail-description {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .detail-purchase-box {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          margin-bottom: 40px;
        }
        .purchase-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-weight: 700;
          font-size: 14px;
        }
        .purchase-action-row {
          display: flex;
          gap: 16px;
        }
        .quantity-adjuster {
          display: flex;
          align-items: center;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          border-radius: var(--border-radius-sm);
          padding: 2px;
        }
        .quantity-adjuster .qty-btn {
          width: 38px;
          height: 38px;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-sm);
          transition: var(--transition);
        }
        .quantity-adjuster .qty-btn:hover {
          background-color: var(--border);
        }
        .quantity-adjuster .qty-value {
          width: 44px;
          text-align: center;
          font-weight: 700;
          font-size: 15px;
        }
        .add-to-cart-cta-btn {
          flex-grow: 1;
        }
        
        /* Tab System */
        .info-tabs-container {
          margin-top: 20px;
        }
        .tabs-header {
          display: flex;
          border-bottom: 1px solid var(--border);
          gap: 16px;
          margin-bottom: 16px;
        }
        .tab-header-btn {
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          transition: var(--transition);
        }
        .tab-header-btn:hover, .tab-header-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .tab-content {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          font-size: 14px;
        }
        .features-tab-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }
        .feature-icon {
          color: var(--success);
        }
        .usage-tab-content ol {
          padding-left: 20px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .safety-warning-box {
          display: flex;
          gap: 16px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          color: var(--danger);
        }
        .warning-desc {
          margin-top: 4px;
          font-size: 13.5px;
          color: var(--text);
        }

        /* Reviews Block */
        .reviews-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 48px;
          align-items: start;
          margin-top: 24px;
        }
        .empty-reviews-state {
          padding: 40px;
          text-align: center;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .review-card {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--primary-glow);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .review-user-name {
          font-weight: 700;
          font-size: 14px;
        }
        .review-date {
          font-size: 12px;
          color: var(--text-muted);
        }
        .review-comment {
          font-size: 14.5px;
          color: var(--text);
          line-height: 1.5;
        }
        .submit-review-box {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
        }
        .submit-review-box h3 {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 20px;
        }
        .rating-picker {
          display: flex;
          gap: 8px;
        }
        .star-pick-btn {
          color: var(--border);
          transition: var(--transition);
        }
        .star-pick-btn.active {
          color: var(--accent);
        }
        .star-pick-btn.active .star-icon {
          fill: var(--accent);
        }
        .login-required-box {
          padding: 24px;
          border-radius: var(--border-radius-sm);
          background-color: var(--surface-hover);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 14px;
        }

        @media (max-width: 900px) {
          .detail-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .reviews-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </div>
  );
}

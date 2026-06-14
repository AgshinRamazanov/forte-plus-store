import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../config';
import { Star, Shield, Sparkles, Award } from 'lucide-react';

export default function Home({ searchTerm, onSelectProduct, activeTab, setActiveTab }) {
  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch products based on filters
  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/products`;
    const params = [];
    
    if (categoryFilter) params.push(`category=${categoryFilter}`);
    if (searchTerm) params.push(`search=${searchTerm}`);
    if (sortOrder) params.push(`sort=${sortOrder}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ürünler yüklenirken hata:', err);
        setLoading(false);
      });
  }, [categoryFilter, searchTerm, sortOrder]);

  return (
    <div className="home-page animate-fade">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-subtitle">Profesyonel Temizlik Teknolojisi</span>
            <h1 className="hero-title">Ekipmanlarınız İçin <span>10K Endüstriyel</span> Güvencesi</h1>
            <p className="hero-desc">
              Kahve makineleri, endüstriyel fırınlar ve profesyonel mutfaklar için geliştirilmiş yüksek performanslı, çevre dostu temizleme tabletleri ve sıvıları.
            </p>
            <div className="hero-actions">
              <button onClick={() => { setActiveTab('products'); setCategoryFilter(''); }} className="btn btn-primary btn-lg">Ürünleri Keşfet</button>
              <button onClick={() => { setActiveTab('products'); setCategoryFilter('Coffee Care'); }} className="btn btn-secondary btn-lg">Kahve Grubu</button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="visual-circle animate-float"></div>
            <div className="visual-badge">
              <Star className="star-icon filled" size={16} />
              <span>4.8/5 Kullanıcı Puanı</span>
            </div>
            {/* Visual placeholder using brand gradient */}
            <div className="visual-gradient-box glass">
              <div className="gradient-brand-title">10K ENDÜSTRİYEL</div>
              <p>Industrial & Domestic Cleaning Tabs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Value Propositions */}
      <section className="values-section">
        <div className="container grid grid-cols-4">
          <div className="value-card glass">
            <Sparkles className="value-icon primary-color" size={24} />
            <h4>Maksimum Hijyen</h4>
            <p>Zorlu kahve yağları ve yanmış gresleri saniyeler içinde çözer.</p>
          </div>
          <div className="value-card glass">
            <Shield className="value-icon secondary-color" size={24} />
            <h4>Makine Koruma</h4>
            <p>Düzenli kullanım ile rezistans ve su borularının ömrünü uzatır.</p>
          </div>
          <div className="value-card glass">
            <Award className="value-icon accent-color" size={24} />
            <h4>Profesyonel Formül</h4>
            <p>Restoranlar, kafeler ve endüstriyel mutfaklar tarafından onaylı.</p>
          </div>
          <div className="value-card glass">
            <Star className="value-icon success-color" size={24} />
            <h4>%100 Çevre Dostu</h4>
            <p>Doğada kolayca çözünebilen, toksik kalıntı bırakmayan güvenli içerik.</p>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section className="catalog-section section" id="catalog-section-target">
        <div className="container">
          <div className="catalog-header-row">
            <div className="catalog-title-group">
              <h2 className="section-title">Ürün Kataloğumuz</h2>
              <p className="section-subtitle">Kullanım alanına göre filtreleyerek ihtiyacınız olan ürünü kolayca bulun.</p>
            </div>
            
            {/* Filtering & Sorting Controls */}
            <div className="catalog-controls">
              <div className="filter-group">
                <button
                  onClick={() => setCategoryFilter('')}
                  className={`filter-btn ${categoryFilter === '' ? 'active' : ''}`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setCategoryFilter('Coffee Care')}
                  className={`filter-btn ${categoryFilter === 'Coffee Care' ? 'active' : ''}`}
                >
                  Kahve Bakımı
                </button>
                <button
                  onClick={() => setCategoryFilter('Industrial Care')}
                  className={`filter-btn ${categoryFilter === 'Industrial Care' ? 'active' : ''}`}
                >
                  Endüstriyel Mutfak
                </button>
                <button
                  onClick={() => setCategoryFilter('Household Care')}
                  className={`filter-btn ${categoryFilter === 'Household Care' ? 'active' : ''}`}
                >
                  Genel Temizlik
                </button>
              </div>

              <select
                id="catalog-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-control sort-select"
              >
                <option value="">Sıralama Seçin</option>
                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="newest">En Yeni Ürünler</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Ürünler yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-catalog-state glass">
              <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
              <button onClick={() => { setCategoryFilter(''); setSortOrder(''); }} className="btn btn-secondary">Aramayı Sıfırla</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 product-catalog-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .hero-section {
          padding: 80px 0;
          background: linear-gradient(180deg, var(--primary-glow) 0%, transparent 100%);
        }
        .hero-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }
        .hero-content {
          flex: 1.2;
          max-width: 600px;
        }
        .hero-subtitle {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--primary);
          letter-spacing: 2px;
          display: inline-block;
          margin-bottom: 16px;
        }
        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }
        .hero-title span {
          color: var(--primary);
        }
        .hero-desc {
          font-size: 17px;
          color: var(--text-muted);
          margin-bottom: 36px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
        }
        .hero-visual {
          flex: 0.8;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 360px;
        }
        .visual-circle {
          position: absolute;
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.25;
          z-index: 1;
        }
        .visual-badge {
          position: absolute;
          top: 40px;
          right: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 10px 16px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-md);
          font-weight: 700;
          font-size: 13px;
          z-index: 10;
        }
        .visual-gradient-box {
          position: relative;
          z-index: 5;
          width: 280px;
          height: 180px;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px;
          color: var(--text);
          text-align: center;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%);
        }
        .gradient-brand-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .visual-gradient-box p {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Values Props */
        .values-section {
          padding: 24px 0 60px 0;
        }
        .value-card {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          transition: var(--transition);
        }
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .value-icon {
          margin-bottom: 16px;
        }
        .primary-color { color: var(--primary); }
        .secondary-color { color: var(--secondary); }
        .accent-color { color: var(--accent); }
        .success-color { color: var(--success); }
        .value-card h4 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .value-card p {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Catalog UI */
        .catalog-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
        }
        .section-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .section-subtitle {
          color: var(--text-muted);
          font-size: 15px;
        }
        .catalog-controls {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .filter-group {
          display: flex;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          padding: 4px;
          border-radius: var(--border-radius-sm);
        }
        .filter-btn {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: 6px;
          transition: var(--transition);
        }
        .filter-btn.active {
          background-color: var(--surface);
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .sort-select {
          padding: 8px 16px;
          font-size: 14px;
          width: 220px;
          height: auto;
          border-radius: var(--border-radius-sm);
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-catalog-state {
          padding: 60px;
          text-align: center;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        @media (max-width: 900px) {
          .hero-container {
            flex-direction: column;
            text-align: center;
            gap: 24px;
          }
          .hero-content {
            max-width: 100%;
          }
          .hero-actions {
            justify-content: center;
          }
          .catalog-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .catalog-controls {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }
          .filter-group {
            overflow-x: auto;
            white-space: nowrap;
          }
          .sort-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

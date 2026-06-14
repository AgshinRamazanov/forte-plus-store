import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

function AppContent() {
  const { user, login, register, token } = useAuth();
  const { cartItems } = useCart();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // home, products (catalog), detail, checkout, profile, admin
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // UI Drawer/Modal States
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, register
  
  // Auth Form Inputs
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleSearch = (term) => {
    setGlobalSearch(term);
    if (activeTab !== 'home' && activeTab !== 'products') {
      setActiveTab('home');
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
        showToast('Giriş yapıldı!', 'success');
      } else {
        await register(authForm.name, authForm.email, authForm.password);
        showToast('Hesabınız oluşturuldu!', 'success');
      }
      setAuthModalOpen(false);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError(err.message || 'Bir hata oluştu.');
    }
  };

  // Prevent loading admin if not permitted
  useEffect(() => {
    if (activeTab === 'admin' && user && user.role !== 'admin') {
      setActiveTab('home');
    }
  }, [activeTab, user]);

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} glass`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Sticky Navbar */}
      <Navbar
        onSearch={handleSearch}
        onCartToggle={() => setCartOpen(!cartOpen)}
        onAuthToggle={setAuthModalOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Cart Sliding Drawer Overlay */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          if (!token) {
            setAuthMode('login');
            setAuthModalOpen(true);
            showToast('Lütfen önce giriş yapın.', 'warning');
          } else {
            setActiveTab('checkout');
          }
        }}
      />

      {/* Auth Modals Overlay */}
      {authModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal glass animate-fade" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAuthModalOpen(false)} className="close-btn" id="close-auth-modal-btn">
              <X size={20} />
            </button>
            
            <div className="modal-header">
              <Lock size={28} className="lock-icon" />
              <h3>{authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h3>
              <p>{authMode === 'login' ? 'Forte Plus güvencesiyle sipariş vermek için giriş yapın.' : 'Yeni bir üyelik oluşturun.'}</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="modal-body">
              {authError && <p className="auth-error-msg">{authError}</p>}
              
              {authMode === 'register' && (
                <div className="form-group">
                  <label htmlFor="auth-name">Ad Soyad</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">E-posta Adresi</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="ahmet@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">Şifre</label>
                <div className="password-input-wrapper">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className="form-control"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full submit-auth-btn" id="submit-auth-form-btn">
                {authMode === 'login' ? 'Giriş Yap' : 'Üyeliği Tamamla'}
              </button>
            </form>

            <div className="modal-footer">
              {authMode === 'login' ? (
                <p>Hesabınız yok mu? <span onClick={() => { setAuthMode('register'); setAuthError(''); }} className="toggle-auth-mode-link">Kayıt Ol</span></p>
              ) : (
                <p>Zaten üye misiniz? <span onClick={() => { setAuthMode('login'); setAuthError(''); }} className="toggle-auth-mode-link">Giriş Yap</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Pages Router Switch */}
      <main className="main-content">
        {(activeTab === 'home' || activeTab === 'products') && (
          <Home
            searchTerm={globalSearch}
            onSelectProduct={handleSelectProduct}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'detail' && (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setActiveTab('home')}
            onToast={showToast}
          />
        )}

        {activeTab === 'checkout' && (
          <Checkout
            onBack={() => setActiveTab('home')}
            onNavigate={(tab) => setActiveTab(tab)}
            onToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3>FORTE PLUS</h3>
            <p>Endüstriyel ve ev tipi kahve makineleri, fırınlar ve profesyonel mutfak ekipmanları için hijyen çözümleri.</p>
          </div>
          <div className="footer-links-col">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li onClick={() => { setActiveTab('home'); setGlobalSearch(''); }}>Ana Sayfa</li>
              <li onClick={() => setActiveTab('products')}>Ürün Kataloğu</li>
              {user && <li onClick={() => setActiveTab('profile')}>Sipariş Takibi</li>}
            </ul>
          </div>
          <div className="footer-contact-col">
            <h4>Bize Ulaşın</h4>
            <p>E-posta: destek@forteplus.com</p>
            <p>Telefon: +90 212 123 45 67</p>
            <p>Adres: Kağıthane, İstanbul, Türkiye</p>
          </div>
        </div>
        <div className="footer-bottom text-center">
          <p>&copy; {new Date().getFullYear()} Forte Plus. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-content {
          flex-grow: 1;
        }
        
        /* Auth Modal Overlays */
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .auth-modal {
          width: 400px;
          background: var(--surface);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 32px;
          position: relative;
        }
        .auth-modal .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .auth-modal .close-btn:hover {
          color: var(--text);
        }
        .auth-modal .modal-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .lock-icon {
          color: var(--primary);
          margin-bottom: 12px;
        }
        .auth-modal .modal-header h3 {
          font-size: 22px;
          font-weight: 800;
        }
        .auth-modal .modal-header p {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .auth-error-msg {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border-radius: var(--border-radius-sm);
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          border: 1px solid rgba(239, 68, 68, 0.1);
          text-align: center;
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-toggle-btn {
          position: absolute;
          right: 14px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .submit-auth-btn {
          margin-top: 8px;
        }
        .auth-modal .modal-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 13.5px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .toggle-auth-mode-link {
          color: var(--primary);
          cursor: pointer;
          font-weight: 700;
          text-decoration: underline;
        }
        
        /* Footer Styling */
        .site-footer {
          background-color: #0f172a;
          color: #f8fafc;
          padding: 60px 0 20px 0;
          border-top: 1px solid #1e293b;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 40px;
        }
        .footer-brand h3 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
        }
        .footer-brand p {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
          max-width: 380px;
        }
        .footer-links-col h4, .footer-contact-col h4 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          color: #e2e8f0;
        }
        .footer-links-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 14px;
          color: #94a3b8;
        }
        .footer-links-col li {
          cursor: pointer;
          transition: var(--transition);
        }
        .footer-links-col li:hover {
          color: var(--primary);
          transform: translateX(4px);
        }
        .footer-contact-col p {
          font-size: 13.5px;
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .footer-bottom {
          border-top: 1px solid #1e293b;
          padding-top: 20px;
          font-size: 12.5px;
          color: #64748b;
        }
        .w-full {
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

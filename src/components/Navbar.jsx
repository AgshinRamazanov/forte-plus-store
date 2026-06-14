import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, Sun, Moon, LogOut, Search, Settings } from 'lucide-react';

export default function Navbar({ onSearch, onCartToggle, onAuthToggle, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { cartCount, cartTotal } = useCart();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="glass sticky-nav">
      <div className="container nav-container">
        {/* Brand Logo */}
        <div className="logo" onClick={() => { setActiveTab('home'); onSearch(''); setSearchTerm(''); }}>
          <span className="logo-badge">FP</span>
          <span className="logo-text">FORTE<span>PLUS</span></span>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-links">
          <button className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); onSearch(''); setSearchTerm(''); }}>Ana Sayfa</button>
          <button className={`nav-link-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Ürünler</button>
          {user && user.role === 'admin' && (
            <button className={`nav-link-btn admin-link ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Settings size={16} /> Admin Paneli
            </button>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            id="global-search-input"
            type="text"
            placeholder="Profesyonel temizlik ürünleri ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Controls */}
        <div className="nav-controls">
          {/* Theme Toggler */}
          <button onClick={toggleTheme} className="control-btn" id="theme-toggle-btn" title="Koyu/Açık Tema">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Account Dropdown */}
          <div className="user-dropdown-container">
            {user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="control-btn user-btn"
                  id="user-profile-menu-btn"
                >
                  <User size={20} />
                  <span className="user-name-label">{user.name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu glass animate-fade">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                      <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                        {user.role === 'admin' ? 'Yönetici' : 'Müşteri'}
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveTab('profile'); setDropdownOpen(false); }}
                      className="dropdown-item"
                    >
                      Siparişlerim
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => { setActiveTab('admin'); setDropdownOpen(false); }}
                        className="dropdown-item"
                      >
                        Yönetim Paneli
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); setActiveTab('home'); }}
                      className="dropdown-item logout-btn"
                    >
                      <LogOut size={16} /> Çıkış Yap
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => onAuthToggle(true)}
                className="btn btn-secondary login-nav-btn"
                id="login-btn-trigger"
              >
                Giriş Yap
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <button onClick={onCartToggle} className="control-btn cart-btn-badge" id="cart-drawer-trigger">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>
        </div>
      </div>

      <style>{`
        .sticky-nav {
          position: sticky;
          top: 0;
          height: var(--header-height);
          z-index: 1000;
          display: flex;
          align-items: center;
          box-shadow: var(--shadow-sm);
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.5px;
        }
        .logo-badge {
          background: var(--primary);
          color: white;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-sm);
          font-size: 16px;
          font-weight: 800;
        }
        .logo-text {
          color: var(--text);
        }
        .logo-text span {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-link-btn {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition);
        }
        .nav-link-btn:hover, .nav-link-btn.active {
          color: var(--primary);
          background-color: var(--primary-glow);
        }
        .admin-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--danger);
        }
        .admin-link:hover, .admin-link.active {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }
        .search-form {
          position: relative;
          width: 300px;
          display: flex;
          align-items: center;
        }
        .search-input {
          width: 100%;
          padding: 10px 40px 10px 16px;
          border: 1px solid var(--border);
          border-radius: 50px;
          background: var(--surface-hover);
          color: var(--text);
          font-size: 14px;
          transition: var(--transition);
        }
        .search-input:focus {
          outline: none;
          background: var(--surface);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
          width: 320px;
        }
        .search-btn {
          position: absolute;
          right: 14px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .nav-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .control-btn {
          background: var(--surface-hover);
          color: var(--text);
          border: 1px solid var(--border);
          width: 42px;
          height: 42px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: var(--transition);
        }
        .control-btn:hover {
          background: var(--border);
          transform: scale(1.05);
        }
        .cart-btn-badge .cart-badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--primary);
          color: white;
          font-size: 11px;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--background);
        }
        .user-dropdown-container {
          position: relative;
        }
        .user-btn {
          width: auto;
          padding: 0 16px;
          gap: 8px;
        }
        .user-name-label {
          font-size: 14px;
          font-weight: 600;
        }
        .dropdown-menu {
          position: absolute;
          top: 50px;
          right: 0;
          width: 240px;
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid var(--border);
          z-index: 1000;
        }
        .dropdown-header {
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
          margin-bottom: 8px;
        }
        .dropdown-user-name {
          font-weight: 700;
          font-size: 15px;
        }
        .dropdown-user-email {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .dropdown-item {
          text-align: left;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 600;
          border-radius: var(--border-radius-sm);
          transition: var(--transition);
          width: 100%;
        }
        .dropdown-item:hover {
          background-color: var(--surface-hover);
          color: var(--primary);
        }
        .logout-btn {
          color: var(--danger);
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid var(--border);
          margin-top: 8px;
          border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
        }
        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.05);
          color: var(--danger);
        }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .search-form { display: none; }
        }
      `}</style>
    </header>
  );
}

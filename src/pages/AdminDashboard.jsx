import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Plus, Edit2, Trash2, Check, DollarSign, ShoppingCart, AlertTriangle, Users, Package, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ onToast }) {
  const { token } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('stats');

  // Product Add/Edit form states
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); // null means adding new
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'Coffee Care',
    stock: '',
    featuresString: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch all products
      const prodRes = await fetch(`${API_BASE_URL}/api/products`);
      const prodData = await prodRes.json();
      setProducts(prodData);

      // 3. Fetch all orders
      const ordRes = await fetch(`${API_BASE_URL}/api/orders`, { headers });
      const ordData = await ordRes.json();
      setOrders(ordData);

    } catch (err) {
      console.error('Admin verileri çekilirken hata:', err);
      if (onToast) onToast('Veriler yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });

      if (response.ok) {
        if (onToast) onToast('Sipariş durumu güncellendi.', 'success');
        fetchData(); // reload
      } else {
        if (onToast) onToast('Sipariş güncellenemedi.', 'error');
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Bağlantı hatası.', 'error');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${prodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        if (onToast) onToast('Ürün başarıyla silindi.', 'success');
        fetchData(); // reload
      } else {
        if (onToast) onToast('Ürün silinemedi.', 'error');
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Bağlantı hatası.', 'error');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image_url: productForm.image_url,
      category: productForm.category,
      stock: parseInt(productForm.stock),
      features: productForm.featuresString.split('\n').filter(f => f.trim() !== '')
    };

    const method = editingProductId ? 'PUT' : 'POST';
    const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        if (onToast) onToast(editingProductId ? 'Ürün güncellendi.' : 'Yeni ürün eklendi.', 'success');
        setProductFormOpen(false);
        setEditingProductId(null);
        setProductForm({
          name: '',
          description: '',
          price: '',
          image_url: '',
          category: 'Coffee Care',
          stock: '',
          featuresString: ''
        });
        fetchData(); // reload
      } else {
        if (onToast) onToast(data.message || 'Ürün kaydedilemedi.', 'error');
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Bağlantı hatası.', 'error');
    }
  };

  const openEditModal = (p) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      category: p.category,
      stock: p.stock,
      featuresString: p.features?.join('\n') || ''
    });
    setProductFormOpen(true);
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: 'Coffee Care',
      stock: '',
      featuresString: ''
    });
    setProductFormOpen(true);
  };

  if (loading && !stats) {
    return (
      <div className="container section text-center">
        <div className="spinner"></div>
        <p>Yönetici paneli yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container animate-fade">
      <div className="admin-header-row">
        <h1 className="page-title">Yönetim Paneli</h1>
        <button onClick={fetchData} className="btn btn-secondary btn-refresh-stats" title="Verileri Yenile">
          <RefreshCw size={16} /> Güncelle
        </button>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-4 metrics-grid">
          <div className="metric-card glass">
            <div className="metric-icon-box sales"><DollarSign size={22} /></div>
            <div>
              <span className="metric-label">Toplam Satış</span>
              <h3 className="metric-val">₺{stats.metrics.totalSales.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
          <div className="metric-card glass">
            <div className="metric-icon-box orders"><ShoppingCart size={22} /></div>
            <div>
              <span className="metric-label">Toplam Sipariş</span>
              <h3 className="metric-val">{stats.metrics.totalOrders} Adet</h3>
            </div>
          </div>
          <div className="metric-card glass">
            <div className="metric-icon-box alerts"><AlertTriangle size={22} /></div>
            <div>
              <span className="metric-label">Kritik Stok Uyarısı</span>
              <h3 className="metric-val">{stats.metrics.lowStockAlerts} Ürün</h3>
            </div>
          </div>
          <div className="metric-card glass">
            <div className="metric-icon-box customers"><Users size={22} /></div>
            <div>
              <span className="metric-label">Kayıtlı Müşteri</span>
              <h3 className="metric-val">{stats.metrics.totalCustomers} Üye</h3>
            </div>
          </div>
        </div>
      )}

      {/* Admin Sub Navigation */}
      <div className="admin-sub-tabs">
        <button onClick={() => setActiveSubTab('stats')} className={`sub-tab-btn ${activeSubTab === 'stats' ? 'active' : ''}`}>Panel Raporu</button>
        <button onClick={() => setActiveSubTab('products')} className={`sub-tab-btn ${activeSubTab === 'products' ? 'active' : ''}`}>Ürün Yönetimi</button>
        <button onClick={() => setActiveSubTab('orders')} className={`sub-tab-btn ${activeSubTab === 'orders' ? 'active' : ''}`}>Sipariş Yönetimi</button>
      </div>

      {/* Sub Panel Content */}
      <div className="admin-sub-content">
        
        {/* REPORT TAB */}
        {activeSubTab === 'stats' && stats && (
          <div className="report-panel animate-fade">
            <div className="grid grid-cols-2">
              
              {/* Category Sales Chart Block */}
              <div className="report-card glass">
                <h3>Kategori Ciro Dağılımı</h3>
                {stats.categorySales.length === 0 ? (
                  <p className="no-data-text">Henüz satış yapılmamış.</p>
                ) : (
                  <div className="bar-chart-list">
                    {stats.categorySales.map((cat, idx) => (
                      <div key={idx} className="chart-bar-item">
                        <div className="bar-labels">
                          <span className="cat-name">{cat.category}</span>
                          <span className="cat-rev">₺{cat.revenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="bar-outer">
                          <div className="bar-inner" style={{ width: `${Math.min((cat.revenue / (stats.metrics.totalSales || 1)) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Critical Stocks List */}
              <div className="report-card glass">
                <h3>Kritik Stok Seviyeleri</h3>
                <div className="critical-stock-list">
                  {stats.stockStatus.map((p, idx) => (
                    <div key={idx} className="stock-list-item">
                      <span className="prod-name">{p.name}</span>
                      <span className={`badge ${p.stock < 10 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.stock} Adet Kaldı
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeSubTab === 'products' && (
          <div className="products-manager-panel animate-fade">
            <div className="manager-header-row">
              <h3>Ürün Envanteri ({products.length} Ürün)</h3>
              <button onClick={openAddModal} className="btn btn-primary" id="add-product-dashboard-btn">
                <Plus size={16} /> Yeni Ürün Ekle
              </button>
            </div>

            <table className="admin-table glass">
              <thead>
                <tr>
                  <th>Resim</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.image_url} alt={p.name} className="table-thumbnail" onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=100&auto=format&fit=crop';
                      }} />
                    </td>
                    <td className="bold">{p.name}</td>
                    <td>{p.category}</td>
                    <td className="bold">₺{p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${p.stock < 10 ? 'badge-danger' : p.stock < 20 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock} Adet
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button onClick={() => openEditModal(p)} className="action-btn edit" title="Düzenle">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="action-btn delete" title="Sil">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeSubTab === 'orders' && (
          <div className="orders-manager-panel animate-fade">
            <h3>Tüm Siparişler ({orders.length} Sipariş)</h3>
            
            <table className="admin-table glass">
              <thead>
                <tr>
                  <th>Sipariş ID</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Adres</th>
                  <th>Toplam Tutar</th>
                  <th>Durum</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="bold">#10K-{order.id}</td>
                    <td>
                      <div className="customer-cell">
                        <p className="cust-name">{order.user_name}</p>
                        <p className="cust-email">{order.user_email}</p>
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="address-cell-table" title={order.shipping_address}>
                      {order.shipping_address.split(',').slice(2).join(',')}
                    </td>
                    <td className="bold">₺{order.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${
                        order.order_status === 'Delivered' ? 'badge-success' :
                        order.order_status === 'Shipped' ? 'badge-primary' : 'badge-warning'
                      }`}>
                        {
                          order.order_status === 'Delivered' ? 'Teslim Edildi' :
                          order.order_status === 'Shipped' ? 'Kargoya Verildi' : 'Hazırlanıyor'
                        }
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="form-control table-status-select"
                      >
                        <option value="Pending">Hazırlanıyor</option>
                        <option value="Shipped">Kargoya Ver</option>
                        <option value="Delivered">Teslim Et</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal Overlay */}
      {productFormOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass animate-fade">
            <div className="modal-header">
              <h3>{editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
              <button onClick={() => setProductFormOpen(false)} className="close-btn">X</button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="modal-body">
              <div className="form-group">
                <label>Ürün Adı</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="form-control"
                  >
                    <option value="Coffee Care">Kahve Bakımı</option>
                    <option value="Industrial Care">Endüstriyel Mutfak</option>
                    <option value="Household Care">Genel Temizlik</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fiyat (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label>Stok Adedi</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Görsel URL / Dosya Adı</label>
                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="/products/filename.jpeg"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="form-control"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Öne Çıkan Özellikler (Satır başına 1 özellik)</label>
                <textarea
                  value={productForm.featuresString}
                  onChange={(e) => setProductForm(prev => ({ ...prev, featuresString: e.target.value }))}
                  placeholder="2.5g ideal tablet boyutu&#10;Kahve yağlarını söker"
                  rows="3"
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setProductFormOpen(false)} className="btn btn-secondary">İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard {
          padding-top: 40px;
          padding-bottom: 80px;
        }
        .admin-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .btn-refresh-stats {
          padding: 8px 16px;
          font-size: 13.5px;
        }
        .metrics-grid {
          margin-bottom: 40px;
        }
        .metric-card {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .metric-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .metric-icon-box.sales { background: var(--success); }
        .metric-icon-box.orders { background: var(--primary); }
        .metric-icon-box.alerts { background: var(--danger); }
        .metric-icon-box.customers { background: var(--secondary); }
        .metric-label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }
        .metric-val {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          margin-top: 2px;
        }
        .admin-sub-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          gap: 16px;
          margin-bottom: 28px;
        }
        .sub-tab-btn {
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          transition: var(--transition);
        }
        .sub-tab-btn:hover, .sub-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        
        /* Reports panel */
        .report-card {
          padding: 24px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
        }
        .report-card h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 20px;
        }
        .no-data-text {
          font-size: 14px;
          color: var(--text-muted);
        }
        .bar-chart-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chart-bar-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
        }
        .bar-outer {
          width: 100%;
          height: 10px;
          background-color: var(--surface-hover);
          border-radius: 50px;
          overflow: hidden;
        }
        .bar-inner {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 50px;
        }
        .critical-stock-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .stock-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
          font-size: 13.5px;
          font-weight: 600;
        }
        
        /* Tables general */
        .manager-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          overflow: hidden;
          font-size: 14px;
        }
        .admin-table th, .admin-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .admin-table th {
          background-color: var(--surface-hover);
          font-weight: 700;
          color: var(--text);
        }
        .admin-table td.bold {
          font-weight: 700;
        }
        .table-thumbnail {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: var(--border-radius-sm);
          background-color: var(--surface-hover);
          padding: 4px;
          border: 1px solid var(--border);
        }
        .customer-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cust-name {
          font-weight: 700;
        }
        .cust-email {
          font-size: 12px;
          color: var(--text-muted);
        }
        .address-cell-table {
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .action-buttons-cell {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          transition: var(--transition);
        }
        .action-btn.edit { color: var(--primary); }
        .action-btn.edit:hover { background-color: var(--primary-glow); }
        .action-btn.delete { color: var(--danger); }
        .action-btn.delete:hover { background-color: rgba(239, 68, 68, 0.05); }
        .table-status-select {
          padding: 6px 12px;
          font-size: 12.5px;
          height: auto;
          width: auto;
        }

        /* Modal styling */
        .admin-modal-overlay {
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
        .admin-modal {
          width: 600px;
          background: var(--surface);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-body {
          padding: 24px;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }
      `}</style>
    </div>
  );
}

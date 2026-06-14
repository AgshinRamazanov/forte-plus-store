import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { ShoppingBag, Calendar, MapPin, CheckCircle, Package } from 'lucide-react';

export default function Profile({ onNavigate }) {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Siparişler yüklenirken hata:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="container section text-center">
        <div className="spinner"></div>
        <p>Sipariş geçmişiniz yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="profile-page container animate-fade">
      <div className="profile-layout">
        {/* User Summary Sidebar */}
        <div className="profile-sidebar glass">
          <div className="avatar-large">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="user-name">{user?.name}</h2>
          <p className="user-email">{user?.email}</p>
          
          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-val">{orders.length}</span>
              <span className="stat-label">Toplam Sipariş</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">₺{orders.reduce((acc, o) => acc + o.total_amount, 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
              <span className="stat-label">Toplam Harcama</span>
            </div>
          </div>
        </div>

        {/* Orders Listing Area */}
        <div className="profile-content">
          <h2 className="content-title">Sipariş Geçmişim</h2>
          
          {orders.length === 0 ? (
            <div className="empty-orders-state glass text-center">
              <Package size={48} className="empty-icon" />
              <h3>Henüz Siparişiniz Bulunmuyor</h3>
              <p>Forte Plus temizlik ürünleriyle tanışmak ve sipariş oluşturmak için ürün sayfamızı ziyaret edin.</p>
              <button onClick={() => onNavigate('home')} className="btn btn-primary">Alışverişe Başla</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-group-card glass">
                  {/* Order Card Header */}
                  <div className="order-card-header">
                    <div className="meta-left">
                      <span className="order-id">Sipariş #FP-{order.id}</span>
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    
                    <div className="meta-right">
                      <span className={`badge ${
                        order.order_status === 'Delivered' ? 'badge-success' :
                        order.order_status === 'Shipped' ? 'badge-primary' : 'badge-warning'
                      }`}>
                        {
                          order.order_status === 'Delivered' ? 'Teslim Edildi' :
                          order.order_status === 'Shipped' ? 'Kargoya Verildi' : 'Hazırlanıyor'
                        }
                      </span>
                      <span className="order-price">₺{order.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="order-card-body">
                    {order.items?.map(item => (
                      <div key={item.id} className="order-subitem">
                        <img src={item.image_url} alt={item.name} className="subitem-img" onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=100&auto=format&fit=crop';
                        }} />
                        <div className="subitem-info">
                          <p className="subitem-title">{item.name}</p>
                          <p className="subitem-qty-price">{item.quantity} Adet x ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer - Shipping Address */}
                  <div className="order-card-footer">
                    <MapPin size={14} className="address-icon" />
                    <span><strong>Teslimat Adresi:</strong> {order.shipping_address.split(',').slice(2).join(',')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          padding-top: 60px;
          padding-bottom: 80px;
        }
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 2.5fr;
          gap: 40px;
          align-items: start;
        }
        .profile-sidebar {
          padding: 32px;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          font-size: 32px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: var(--shadow-md);
        }
        .user-name {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .user-email {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .sidebar-stats {
          display: flex;
          width: 100%;
          border-top: 1px solid var(--border);
          padding-top: 20px;
          gap: 16px;
        }
        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .stat-val {
          font-size: 18px;
          font-weight: 800;
          color: var(--primary);
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          margin-top: 2px;
        }
        .profile-content {
          display: flex;
          flex-direction: column;
        }
        .content-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 24px;
        }
        .empty-orders-state {
          padding: 60px;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-icon {
          color: var(--text-muted);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .order-group-card {
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .order-card-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          background-color: var(--surface-hover);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .meta-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .order-id {
          font-weight: 800;
          font-size: 15px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .meta-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .order-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--primary);
        }
        .order-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-subitem {
          display: flex;
          gap: 16px;
        }
        .subitem-img {
          width: 50px;
          height: 50px;
          object-fit: contain;
          border-radius: var(--border-radius-sm);
          background-color: var(--surface-hover);
          border: 1px solid var(--border);
          padding: 4px;
        }
        .subitem-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .subitem-title {
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.4;
        }
        .subitem-qty-price {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
          margin-top: 2px;
        }
        .order-card-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background-color: var(--surface-hover);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .address-icon {
          color: var(--primary);
        }
        @media (max-width: 900px) {
          .profile-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../contexts/AuthContext';
import { getShipments, createShipment } from '../services/shipments';
import { Package, Truck, CheckCircle, Clock, Plus, MapPin } from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    pickup_location: '',
    drop_location: '',
    package_details: ''
  });

  const fetchShipments = React.useCallback(async () => {
    setLoading(true);
    const data = await getShipments({ customer_id: user.id });
    setShipments(data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createShipment(formData, user.id);
    setShowForm(false);
    setFormData({ pickup_location: '', drop_location: '', package_details: '' });
    fetchShipments();
  };

  const stats = {
    total: shipments.length,
    active: shipments.filter(s => s.status !== 'Delivered').length,
    completed: shipments.filter(s => s.status === 'Delivered').length,
  };

  const getStatusBadge = (status) => {
    let sInfo = { color: 'var(--text-muted)', class: 'badge-pending', icon: <Clock size={12}/> };
    if (status === 'Pending') sInfo = { class: 'badge-pending', icon: <Clock size={12}/> };
    if (status === 'Picked Up') sInfo = { class: 'badge-picked-up', icon: <Package size={12}/> };
    if (status === 'In Transit') sInfo = { class: 'badge-transit', icon: <Truck size={12}/> };
    if (status === 'Delivered') sInfo = { class: 'badge-delivered', icon: <CheckCircle size={12}/> };
    
    return (
      <span className={`badge ${sInfo.class}`}>
        {sInfo.icon} {status}
      </span>
    );
  };

  const filteredShipments = shipments.filter(s => 
     s.id.toString().includes(searchTerm) || 
     (s.pickup_location && s.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())) || 
     (s.drop_location && s.drop_location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content" style={{ padding: 0 }}>
        <Topbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div style={{ padding: '40px 60px' }}>
          <div className="flex-between page-header">
            <div>
            <h2 className="page-title">My Shipments</h2>
            <p className="page-subtitle">Welcome back, {user?.name}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : <><Plus size={18} /> New Shipment</>}
          </button>
        </div>

        {/* Stats Row */}
        {!showForm && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Shipments</h4>
                  <Package size={24} color="var(--primary)" />
               </div>
               <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.total}</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>In Progress</h4>
                  <Truck size={24} color="var(--warning)" />
               </div>
               <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.active}</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Completed</h4>
                  <CheckCircle size={24} color="var(--success)" />
               </div>
               <div style={{ fontSize: '36px', fontWeight: 800 }}>{stats.completed}</div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Create New Shipment</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
               <div className="input-group">
                 <label className="input-label">Pickup Location</label>
                 <div style={{ position: 'relative' }}>
                    <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                    <input required className="input-field" style={{ paddingLeft: '44px', width: '100%' }} placeholder="e.g. New York, NY" value={formData.pickup_location} onChange={e => setFormData({...formData, pickup_location: e.target.value})} />
                 </div>
               </div>
               <div className="input-group">
                 <label className="input-label">Drop Location</label>
                 <div style={{ position: 'relative' }}>
                    <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                    <input required className="input-field" style={{ paddingLeft: '44px', width: '100%' }} placeholder="e.g. Los Angeles, CA" value={formData.drop_location} onChange={e => setFormData({...formData, drop_location: e.target.value})} />
                 </div>
               </div>
               <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                 <label className="input-label">Package Details & Weight</label>
                 <div style={{ position: 'relative' }}>
                    <Package size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                    <input required className="input-field" style={{ paddingLeft: '44px', width: '100%' }} placeholder="e.g. Electronics (10kg)" value={formData.package_details} onChange={e => setFormData({...formData, package_details: e.target.value})} />
                 </div>
               </div>
               <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                 <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>Instantly Create Shipment</button>
               </div>
            </form>
          </div>
        )}

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
           <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px' }}>Recent Order History</h3>
           </div>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : shipments.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No shipments found. Start by creating a new shipment.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Route</th>
                    <th>Details</th>
                    <th>Delivery Cost</th>
                    <th>Est. Delivery</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map(s => (
                    <tr key={s.id} className="hover-glass">
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <span style={{ fontSize: '14px', fontWeight: 500 }}>{s.pickup_location}</span>
                           <span style={{ color: 'var(--text-muted)' }}>→</span>
                           <span style={{ fontSize: '14px', fontWeight: 500 }}>{s.drop_location}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '14px' }}>{s.package_details}</td>
                      <td style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>
                         ${s.deliveryCost ? s.deliveryCost.toFixed(2) : '--'}
                      </td>
                      <td style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                         {s.estimatedDeliveryTime ? new Date(s.estimatedDeliveryTime).toLocaleDateString() : 'TBD'}
                      </td>
                      <td>{getStatusBadge(s.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

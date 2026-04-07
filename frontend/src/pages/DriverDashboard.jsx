import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../contexts/AuthContext';
import { getShipments, updateShipmentStatus } from '../services/shipments';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShipments({ assigned_driver_id: user.id });
      setShipments(data);
    } catch {
      toast.error("Network sync failed");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (shipmentId, status) => {
    const tId = toast.loading(`Updating order #${shipmentId}...`);
    try {
      await updateShipmentStatus(shipmentId, status);
      if (status === 'Delivered') {
        toast.success("Delivery confirmed! Payout processed to your wallet.", { id: tId, duration: 5000 });
      } else {
        toast.success(`Status updated to ${status}`, { id: tId });
      }
      fetchData();
    } catch {
      toast.error("Failed to update status. Check connection.", { id: tId });
    }
  };

  const handleFileUpload = async (shipmentId, file) => {
    if (!file) return;
    const tId = toast.loading(`Uploading proof for #${shipmentId} to 5TB Drive...`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/upload-proof/${shipmentId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Proof synced to Google One!", { id: tId });
        fetchData();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch {
      toast.error("Cloud sync failed. Check Render secrets.", { id: tId });
    }
  };

  const stats = {
    total: shipments.length,
    active: shipments.filter(s => s.status === 'Picked Up' || s.status === 'In Transit').length,
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
        <div className="page-header">
          <h2 className="page-title">My Deliveries</h2>
          <p className="page-subtitle">Manage your assigned routes</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Assigned</h4>
                <Package size={24} color="var(--primary)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.total}</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>My Wallet</h4>
                <div style={{ color: 'var(--accent)', fontWeight: 700 }}>$</div>
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>${user?.earnings?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active Deliveries</h4>
                <Truck size={24} color="var(--warning)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.active}</div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Delivered</h4>
                <CheckCircle size={24} color="var(--success)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.completed}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
           <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px' }}>Active Queue</h3>
           </div>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : shipments.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No assigned deliveries right now.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Route</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Update</th>
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
                      <td>{getStatusBadge(s.status)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select 
                            value={s.status} 
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                            disabled={s.status === 'Delivered'}
                            style={{
                               background: s.status === 'Delivered' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
                               opacity: s.status === 'Delivered' ? 0.5 : 1
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          
                          {s.status !== 'Delivered' && (
                            <>
                              <input 
                                type="file" 
                                id={`file-${s.id}`} 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileUpload(s.id, e.target.files[0])}
                                accept="image/*,.pdf"
                              />
                              <button 
                                className="btn-primary" 
                                onClick={() => document.getElementById(`file-${s.id}`).click()}
                                style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                              >
                                {s.packageDetails && s.packageDetails.includes('Proof:') ? 'Update Proof' : 'Upload Proof'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
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

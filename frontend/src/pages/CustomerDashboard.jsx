import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../contexts/AuthContext';
import { getShipments, createShipment, getNearbyDrivers } from '../services/shipments';
import { Package, Truck, CheckCircle, Clock, Plus, MapPin, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    pickup_location: '',
    drop_location: '',
    package_details: '',
    assignedDriverId: null
  });
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [isSearchingDrivers, setIsSearchingDrivers] = useState(false);

  const fetchShipments = React.useCallback(async () => {
    setLoading(true);
    const data = await getShipments({ customer_id: user.id });
    setShipments(data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  useEffect(() => {
    const searchDrivers = async () => {
      if (formData.pickup_location.length > 3) {
        setIsSearchingDrivers(true);
        try {
          const drivers = await getNearbyDrivers(formData.pickup_location);
          setNearbyDrivers(drivers);
          // Auto-select the first nearby driver
          if (drivers.length > 0) {
            setFormData(prev => ({ ...prev, assignedDriverId: drivers[0].id }));
          }
        } catch (error) {
          console.error("Failed to fetch drivers", error);
        } finally {
          setIsSearchingDrivers(false);
        }
      } else {
        setNearbyDrivers([]);
      }
    };

    const timer = setTimeout(searchDrivers, 800);
    return () => clearTimeout(timer);
  }, [formData.pickup_location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Connecting with your driver...");
    try {
      const result = await createShipment(formData, user.id);
      const assignedDriver = nearbyDrivers.find(d => d.id === formData.assignedDriverId);
      
      setShowForm(false);
      setFormData({ pickup_location: '', drop_location: '', package_details: '', assignedDriverId: null });
      fetchShipments();
      
      if (assignedDriver) {
        toast.success(`🚀 Order taken by ${assignedDriver.name}!`, { id: tId, duration: 5000 });
      } else {
        toast.success("Shipment created successfully!", { id: tId });
      }
    } catch {
      toast.error("Failed to create shipment", { id: tId });
    }
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

               {/* Nearby Drivers UI */}
               <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                     <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <Sparkles size={16} color="var(--primary)" /> 
                        {isSearchingDrivers ? "Scrutinizing Nearby Fleet..." : "Available Logistics Heroes"}
                     </h4>
                     {nearbyDrivers.length > 0 && <span style={{ fontSize: '12px', color: 'var(--success)' }}>{nearbyDrivers.length} Found Nearby</span>}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                     {nearbyDrivers.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enter a pickup location to see nearby delivery persons.</p>
                     ) : (
                        nearbyDrivers.map(driver => (
                           <div 
                              key={driver.id} 
                              onClick={() => setFormData({...formData, assignedDriverId: driver.id})}
                              style={{ 
                                 minWidth: '200px', 
                                 padding: '12px', 
                                 borderRadius: '10px', 
                                 border: `2px solid ${formData.assignedDriverId === driver.id ? 'var(--primary)' : 'transparent'}`,
                                 background: formData.assignedDriverId === driver.id ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,0,0,0.2)',
                                 cursor: 'pointer',
                                 transition: 'all 0.2s ease',
                                 position: 'relative'
                              }}
                           >
                              {formData.assignedDriverId === driver.id && (
                                 <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--primary)', borderRadius: '50%', padding: '2px' }}>
                                    <Check size={10} color="white" />
                                 </div>
                              )}
                              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{driver.name}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{driver.address || 'Verified Active'}</p>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                 <button 
                  className="btn btn-primary" 
                  type="submit" 
                  style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  Confirm & Match with Hero
                </button>
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

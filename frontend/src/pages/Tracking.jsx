import React, { useState } from 'react';
import { getShipmentById } from '../services/shipments';
import { Search, MapPin, Truck, CheckCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Tracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId) return;
    
    setLoading(true);
    setError('');
    setShipment(null);
    try {
      const data = await getShipmentById(trackingId);
      setShipment(data);
    } catch (err) {
      setError('Shipment not found. Please check your Tracking ID.');
    }
    setLoading(false);
  };

  const getStepStatus = (step) => {
    if (!shipment) return 'pending';
    const status = shipment.status;
    const steps = ['Pending', 'Picked Up', 'In Transit', 'Delivered'];
    const currentIndex = steps.indexOf(status);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
       <nav className="flex-between" style={{ padding: '24px 48px' }}>
          <Link to="/" className="gradient-text" style={{ fontSize: '24px', fontWeight: 700 }}>SLMS.</Link>
          <Link to="/login" className="btn btn-outline">Login</Link>
       </nav>

       <div className="flex-center" style={{ flex: 1, padding: '48px 20px', flexDirection: 'column' }}>
         <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Track Your Shipment</h2>
         <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter your Tracking ID to view the current status</p>
         
         <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px', marginBottom: '48px' }}>
           <input 
             className="input-field" 
             style={{ flex: 1 }} 
             placeholder="e.g. SHP-1001" 
             value={trackingId}
             onChange={e => setTrackingId(e.target.value)}
           />
           <button type="submit" className="btn btn-primary">
             <Search size={20} />
             Track
           </button>
         </form>

         {loading && <div style={{ color: 'var(--accent)' }}>Searching logistics network...</div>}
         
         {error && <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 24px', borderRadius: '8px' }}>{error}</div>}

         {shipment && (
           <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '40px' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{shipment.id}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Posted on: {new Date(shipment.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Status</p>
                  <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)' }}>{shipment.status}</p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '40px' }}>
                {/* Visual Line */}
                <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                
                {[
                  { label: 'Order Placed', icon: <Package size={20} />, statusObj: 'Pending' },
                  { label: 'Picked Up', icon: <MapPin size={20} />, statusObj: 'Picked Up' },
                  { label: 'In Transit', icon: <Truck size={20} />, statusObj: 'In Transit' },
                  { label: 'Delivered', icon: <CheckCircle size={20} />, statusObj: 'Delivered' }
                ].map((step, idx) => {
                  const state = getStepStatus(step.statusObj);
                  const color = state === 'completed' ? 'var(--success)' : state === 'active' ? 'var(--accent)' : 'var(--text-muted)';
                  const bg = state === 'completed' || state === 'active' ? 'var(--bg-secondary)' : 'var(--bg-color)';
                  const shadow = state === 'active' ? '0 0 15px var(--accent)' : 'none';

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '12px', width: '25%' }}>
                       <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: bg, color: color, border: `2px solid ${color}`, boxShadow: shadow }}>
                         {step.icon}
                       </div>
                       <p style={{ fontSize: '14px', color: color, fontWeight: 500, textAlign: 'center' }}>{step.label}</p>
                    </div>
                  )
                })}
              </div>
              
              <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                   <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>From</h4>
                   <p style={{ fontSize: '16px' }}>{shipment.pickup_location}</p>
                </div>
                <div>
                   <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>To</h4>
                   <p style={{ fontSize: '16px' }}>{shipment.drop_location}</p>
                </div>
              </div>
           </div>
         )}
       </div>
    </div>
  );
};

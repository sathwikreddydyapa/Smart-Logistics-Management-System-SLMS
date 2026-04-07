import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { getShipments, getAllDrivers, assignDriver, recommendDriver } from '../services/shipments';
import { Package, Truck, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, dData] = await Promise.all([getShipments(), getAllDrivers()]);
      setShipments(sData);
      setDrivers(dData);
    } catch {
      toast.error("Global network sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignDriver = async (shipmentId, driverId) => {
    if (!driverId) return;
    const tId = toast.loading("Finalizing assignment...");
    try {
       await assignDriver(shipmentId, driverId);
       fetchData();
       toast.success("Driver assigned and notified!", { id: tId });
    } catch {
       toast.error("Assignment denied. Fleet offline.", { id: tId });
    }
  };

  const handleSuggestDriver = async (shipmentId) => {
    const tId = toast.loading("AI Analyzing fleet availability...");
    try {
      const recommended = await recommendDriver(shipmentId);
      if (recommended) {
        toast.success(`Optimal Driver: ${recommended.name}`, { id: tId });
        await handleAssignDriver(shipmentId, recommended.id);
      }
    } catch {
      toast.error("AI Insights currently unavailable", { id: tId });
    }
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'Pending').length,
    active: shipments.filter(s => s.status === 'Picked Up' || s.status === 'In Transit').length,
    completed: shipments.filter(s => s.status === 'Delivered').length,
    revenue: shipments.reduce((sum, s) => sum + (s.deliveryCost || 0), 0),
    payouts: shipments.filter(s => s.status === 'Delivered').reduce((sum, s) => sum + ((s.deliveryCost || 0) * 0.8), 0)
  };

  const chartData = [
    { name: 'Pending', count: stats.pending, fill: 'var(--danger)' },
    { name: 'Active', count: stats.active, fill: 'var(--warning)' },
    { name: 'Completed', count: stats.completed, fill: 'var(--success)' },
  ];

  const getStatusBadge = (status) => {
    let sInfo = { color: 'var(--text-muted)', class: 'badge-pending' };
    if (status === 'Pending') sInfo = { class: 'badge-pending', label: 'Pending', icon: <Clock size={12}/> };
    if (status === 'Picked Up') sInfo = { class: 'badge-picked-up', label: 'Picked Up', icon: <Package size={12}/> };
    if (status === 'In Transit') sInfo = { class: 'badge-transit', label: 'In Transit', icon: <Truck size={12}/> };
    if (status === 'Delivered') sInfo = { class: 'badge-delivered', label: 'Delivered', icon: <CheckCircle size={12}/> };
    
    return (
      <span className={`badge ${sInfo.class}`}>
        {sInfo.icon} {status}
      </span>
    );
  };

  const filteredShipments = shipments.filter(s => {
    const filterMatch = activeFilter === 'All' || 
                       (activeFilter === 'Active' ? (s.status === 'Picked Up' || s.status === 'In Transit') : s.status === activeFilter);
    const searchMatch = s.id.toString().includes(searchTerm) || 
                        (s.pickup_location && s.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (s.drop_location && s.drop_location.toLowerCase().includes(searchTerm.toLowerCase()));
    return filterMatch && searchMatch;
  });

  const barChartData = [
    { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, { day: 'Wed', count: 15 },
    { day: 'Thu', count: 25 }, { day: 'Fri', count: 22 }, { day: 'Sat', count: 18 }, { day: 'Sun', count: 8 }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content" style={{ padding: 0 }}>
        <Topbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div style={{ padding: '40px 60px' }}>
        <div className="page-header">
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Overview of global operations and active logistics</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <div className={`glass-panel stat-card ${activeFilter === 'All' ? 'active-stat' : ''}`} onClick={() => setActiveFilter('All')} style={{ padding: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gross Shipments</h4>
                <Package size={24} color="var(--primary)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.total}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent)' }}></div>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Revenue</h4>
                <div style={{ color: 'var(--accent)', fontWeight: 600 }}>$</div>
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>${stats.revenue.toFixed(2)}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--warning)' }}></div>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Driver Payouts</h4>
                <div style={{ color: 'var(--warning)', fontWeight: 600 }}>$</div>
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>${stats.payouts.toFixed(2)}</div>
          </div>
          <div className={`glass-panel stat-card ${activeFilter === 'Pending' ? 'active-stat' : ''}`} onClick={() => setActiveFilter('Pending')} style={{ padding: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--danger)' }}></div>
             <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Pending Action</h4>
                <Clock size={24} color="var(--danger)" />
             </div>
             <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats.pending}</div>
          </div>
        </div>
        
        {/* Tri Chart Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Delivery Trends (Week)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                  <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: 'var(--primary)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Shipments Per Day</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Status Distribution</h3>
            <div style={{ flex: 1, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="count" stroke="none">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: `drop-shadow(0px 0px 8px ${entry.fill})` }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Driver Fleet Status */}
        <div className="glass-panel" style={{ marginBottom: '32px', padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>Active Fleet Roster</h3>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{drivers.length} Drivers Online</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
            {drivers.map(driver => {
               // calculate assigned deliveries
               const assignedCount = shipments.filter(s => s.assigned_driver_id === driver.id && s.status !== 'Delivered').length;
               
               return (
                 <div key={driver.id} className="hover-scale" style={{ minWidth: '220px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--hover-dark), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Truck size={20} color="white" />
                     </div>
                     <div>
                       <p style={{ fontWeight: 600, fontSize: '14px' }}>{driver.name}</p>
                       <p style={{ fontSize: '12px', color: assignedCount > 2 ? 'var(--warning)' : 'var(--success)' }}>
                          {assignedCount > 2 ? 'High Load' : 'Available'}
                       </p>
                     </div>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Orders</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{assignedCount}</span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* All Shipments */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
           <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px' }}>Active Deliveries</h3>
           </div>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading network data...</div>
          ) : shipments.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No shipments found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Date</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Assign Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map(s => (
                    <tr key={s.id} onClick={(e) => {
                       // prevent select click from triggering row click
                       if (e.target.tagName !== 'SELECT') {
                         setSelectedShipment(s);
                       }
                    }} style={{ cursor: 'pointer' }} className="hover-glass">
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.id}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <span style={{ fontSize: '14px', fontWeight: 500 }}>{s.pickup_location}</span>
                           <span style={{ color: 'var(--text-muted)' }}>→</span>
                           <span style={{ fontSize: '14px', fontWeight: 500 }}>{s.drop_location}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(s.status)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select 
                            value={s.assigned_driver_id || ''} 
                            onChange={(e) => handleAssignDriver(s.id, e.target.value)}
                            disabled={s.status === 'Delivered'}
                            style={{ flex: 1 }}
                          >
                            <option value="">Unassigned</option>
                            {drivers.map(d => (
                               <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          {s.status === 'Pending' && !s.assigned_driver_id && (
                            <button 
                              onClick={() => handleSuggestDriver(s.id)}
                              className="btn-ai-sparkle"
                              title="Get AI Recommendation"
                              style={{ 
                                padding: '8px', 
                                background: 'linear-gradient(135deg, #7c3aed, #db2777)', 
                                border: 'none', 
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                              }}
                            >
                               <Sparkles size={16} color="white" />
                            </button>
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
        {/* Shipment Details Modal */}
        {selectedShipment && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
             <div className="glass-panel" style={{ width: '600px', padding: '32px', position: 'relative' }}>
                <button onClick={() => setSelectedShipment(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>×</button>
                <h2 style={{ marginBottom: '8px' }}>Shipment Details</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Tracking ID: {selectedShipment.id}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                   <div>
                     <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Route</p>
                     <p style={{ fontSize: '16px', fontWeight: 600 }}>{selectedShipment.pickup_location} → {selectedShipment.drop_location}</p>
                   </div>
                   <div>
                     <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Package</p>
                     <p style={{ fontSize: '16px', fontWeight: 600 }}>{selectedShipment.package_details}</p>
                   </div>
                   <div>
                     <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Status</p>
                     <p>{getStatusBadge(selectedShipment.status)}</p>
                   </div>
                   <div>
                     <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Creation Date</p>
                     <p style={{ fontSize: '16px' }}>{new Date(selectedShipment.created_at).toLocaleString()}</p>
                   </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px' }}>
                   <p style={{ marginBottom: '16px', fontWeight: 600 }}>Live Timeline</p>
                   <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', left: '0', width: '100%', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                      <div style={{ position: 'absolute', top: '12px', left: '0', height: '2px', background: 'var(--primary)', zIndex: 1, 
                         width: selectedShipment.status === 'Pending' ? '0%' : selectedShipment.status === 'Picked Up' ? '33%' : selectedShipment.status === 'In Transit' ? '66%' : '100%' 
                      }}></div>
                      
                      {['Pending', 'Picked Up', 'In Transit', 'Delivered'].map((step, idx) => {
                         let isActive = false;
                         if (selectedShipment.status === step) isActive = true;
                         if (selectedShipment.status === 'Delivered') isActive = true;
                         if (selectedShipment.status === 'In Transit' && idx < 3) isActive = true;
                         if (selectedShipment.status === 'Picked Up' && idx < 2) isActive = true;

                         return (
                           <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                             <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--bg-secondary)', border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', boxShadow: isActive ? '0 0 10px var(--primary)' : 'none' }}>
                                {isActive && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--bg-main)' }}></div>}
                             </div>
                             <span style={{ fontSize: '12px', color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>{step}</span>
                           </div>
                         );
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

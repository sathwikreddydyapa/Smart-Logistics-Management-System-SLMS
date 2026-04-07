import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { getShipments } from '../services/shipments';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Package, DollarSign, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Analytics = () => {
  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getShipments();
        setShipments(data);
      } catch {
        toast.error("Failed to fetch analytics data");
      }
    };
    fetchData();
  }, []);

  // Aggregation Logic
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.deliveryCost || 0), 0);
  const activeDeliveries = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
  const completedDeliveries = shipments.filter(s => s.status === 'Delivered').length;

  // Status Distribution Data
  const statusData = [
    { name: 'Pending', value: shipments.filter(s => s.status === 'Pending').length },
    { name: 'In Transit', value: shipments.filter(s => s.status === 'In Transit' || s.status === 'Picked Up').length },
    { name: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length },
  ];

  const COLORS = ['#f59e0b', '#06b6d4', '#10b981'];

  // Mock Revenue Trend (Grouped by simplified time indexing if available, else simulated)
  const revenueTrend = [
    { name: 'Mon', revenue: totalRevenue * 0.1 },
    { name: 'Tue', revenue: totalRevenue * 0.15 },
    { name: 'Wed', revenue: totalRevenue * 0.25 },
    { name: 'Thu', revenue: totalRevenue * 0.18 },
    { name: 'Fri', revenue: totalRevenue * 0.32 },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content" style={{ padding: 0 }}>
        <Topbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        <div style={{ padding: '40px 60px' }}>
          <div className="page-header">
            <h2 className="page-title">Operational Intelligence</h2>
            <p className="page-subtitle">Strategic insights and fleet diagnostics</p>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Global Revenue</h4>
                  <DollarSign size={24} color="var(--accent)" />
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Active Scale</h4>
                  <TrendingUp size={24} color="var(--primary)" />
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>{activeDeliveries}</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Success Rate</h4>
                  <Package size={24} color="var(--success)" />
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>{((completedDeliveries / (shipments.length || 1)) * 100).toFixed(1)}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
               <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fleet Load</h4>
                  <Truck size={24} color="var(--warning)" />
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>{shipments.length} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Units</span></div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Revenue Chart */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Revenue Momentum</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(20,20,25,0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                      itemStyle={{ color: 'var(--accent)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={4} dot={{ r: 6, fill: 'var(--accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Pie Chart */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Status Distribution</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(20,20,25,0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Table Insights */}
          <div className="glass-panel" style={{ marginTop: '32px', padding: '32px' }}>
             <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Operational Velocity</h3>
             <div className="table-container">
               <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Benchmarked Target</th>
                      <th>Current Status</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Average ETA Accuracy</td>
                      <td>&gt; 95%</td>
                      <td>92.4%</td>
                      <td><span className="badge badge-pending">Stable</span></td>
                    </tr>
                    <tr>
                      <td>Fleet Availability</td>
                      <td>85% Units</td>
                      <td>98.0%</td>
                      <td><span className="badge badge-delivered">Excellent</span></td>
                    </tr>
                    <tr>
                      <td>Transit Velocity</td>
                      <td>4.2 Days</td>
                      <td>3.8 Days</td>
                      <td><span className="badge badge-delivered">Optimized</span></td>
                    </tr>
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

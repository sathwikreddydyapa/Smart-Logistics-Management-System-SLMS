import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, Package, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ searchTerm = '', onSearchChange = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, text: "Shipment #1042 just picked up", time: "2m ago", icon: <Package size={14}/> },
    { id: 2, text: "Route optimization updated", time: "15m ago", icon: <Clock size={14}/> },
    { id: 3, text: "Delivery #1039 successful", time: "1h ago", icon: <CheckCircle size={14}/> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 60px', background: 'rgba(22, 24, 29, 0.4)',
      backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      {/* Search Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-color)', borderRadius: '20px',
        padding: '10px 20px', width: '400px', gap: '12px', transition: 'all 0.3s ease',
        boxShadow: searchTerm ? '0 0 10px rgba(0, 195, 255, 0.2)' : 'none'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by Tracking ID, Route, or Driver..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-main)',
            width: '100%', outline: 'none', fontSize: '14px', fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Right Side Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        
        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
           <div onClick={() => setShowNotifications(!showNotifications)}>
             <Bell size={22} color="var(--text-muted)" style={{ transition: 'color 0.3s' }} className="hover-active" />
             <div style={{
               position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', 
               background: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--bg-secondary)',
               boxShadow: '0 0 10px var(--primary)'
             }}></div>
           </div>
           
           {/* Dropdown */}
           {showNotifications && (
             <div style={{
               position: 'absolute', top: '40px', right: '-10px', width: '320px',
               background: 'rgba(22, 24, 29, 0.95)', backdropFilter: 'blur(16px)',
               border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px',
               boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100
             }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Recent Alerts</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {notifications.map(n => (
                     <div key={n.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px', cursor: 'pointer', borderRadius: '8px' }} className="hover-glass">
                        <div style={{ background: 'rgba(0,195,255,0.1)', padding: '8px', borderRadius: '50%', color: 'var(--primary)' }}>{n.icon}</div>
                        <div>
                           <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>{n.text}</p>
                           <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Profile Card */}
        <div style={{ position: 'relative' }}>
          <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} className="hover-scale">
             <div style={{
               width: '40px', height: '40px', borderRadius: '50%',
               background: 'linear-gradient(135deg, var(--hover-dark), var(--primary))',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               border: '2px solid var(--accent)'
             }}>
                <User size={20} color="white" />
             </div>
             <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || 'Administrator'}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'System'}</p>
             </div>
             <ChevronDown size={16} color="var(--text-muted)" />
          </div>
          
          {showProfileMenu && (
             <div style={{
               position: 'absolute', top: '50px', right: '0', width: '200px',
               background: 'rgba(22, 24, 29, 0.95)', backdropFilter: 'blur(16px)',
               border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px',
               boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100
             }}>
                <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} style={{
                  width: '100%', padding: '10px 16px', background: 'transparent',
                  border: 'none', color: 'var(--text-main)', textAlign: 'left',
                  cursor: 'pointer', borderRadius: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '4px'
                }} className="hover-glass">
                  My Profile
                </button>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '10px 16px', background: 'transparent',
                  border: 'none', color: 'var(--danger)', textAlign: 'left',
                  cursor: 'pointer', borderRadius: '8px', fontSize: '14px', fontWeight: 500
                }} className="hover-glass">
                  Logout Session
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

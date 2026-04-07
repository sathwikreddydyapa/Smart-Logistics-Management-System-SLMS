import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, LayoutDashboard, Truck, LogOut, Map, BarChart2 } from 'lucide-react';

export const Sidebar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getLinks = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/map', name: 'Live Map', icon: <Map size={20} /> },
        { path: '/admin/analytics', name: 'Analytics', icon: <BarChart2 size={20} /> },
        { path: '/profile', name: 'User Profile', icon: <Package size={20} /> } // Placeholder icon
      ];
    }
    if (user?.role === 'customer') {
      return [
        { path: '/customer', name: 'My Shipments', icon: <Package size={20} /> },
        { path: '/map', name: 'Live Map', icon: <Map size={20} /> },
        { path: '/profile', name: 'User Profile', icon: <Package size={20} /> }
      ];
    }
    if (user?.role === 'driver') {
      return [
        { path: '/driver', name: 'Deliveries', icon: <Truck size={20} /> },
        { path: '/map', name: 'Live Map', icon: <Map size={20} /> },
        { path: '/driver/wallet', name: 'My Wallet', icon: <Package size={20} /> },
        { path: '/profile', name: 'User Profile', icon: <Package size={20} /> }
      ];
    }
    return [];
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo gradient-text">SLMS.</div>
      <div className="sidebar-nav">
        {getLinks().map((link) => (
          <NavLink 
            key={link.path} 
            to={link.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
        
        <div style={{ flex: 1 }}></div>

        <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

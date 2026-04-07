import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, MapPin, Mail, Shield, Briefcase, Camera, Save } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '+91 00000 00000',
    address: user?.address || 'Not Provided',
    bio: user?.bio || 'No bio available.',
    role: user?.role || 'Guest'
  });

  const handleSave = () => {
    // Mock save logic
    setIsEditing(false);
    alert("Profile features are currently in 'View-Only' for this SLMS version. Business logic for updates is coming in the next build.");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content" style={{ padding: 0 }}>
        <Topbar />
        
        <div style={{ padding: '40px 60px' }}>
          <div className="page-header" style={{ marginBottom: '40px' }}>
            <h2 className="page-title">User Profile</h2>
            <p className="page-subtitle">Manage your personal information and account settings</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            
            {/* Left Column: Avatar & Role */}
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', height: 'fit-content' }}>
              <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 24px' }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--hover-dark), var(--primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '4px solid var(--accent)', boxShadow: '0 0 20px var(--primary)'
                }}>
                  <User size={80} color="white" />
                </div>
                <div style={{ 
                  position: 'absolute', bottom: '5px', right: '5px', 
                  background: 'var(--bg-secondary)', padding: '8px', borderRadius: '50%',
                  border: '1px solid var(--border-color)', cursor: 'pointer' 
                }}>
                  <Camera size={18} color="var(--primary)" />
                </div>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{profileData.name}</h3>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                background: 'rgba(0,195,255,0.1)', color: 'var(--primary)',
                padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                <Shield size={14} /> {profileData.role}
              </div>
              
              <div style={{ marginTop: '32px', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>About Me</p>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{profileData.bio}</p>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="glass-panel" style={{ padding: '40px' }}>
              <div className="flex-between" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Personal Information</h3>
                <button 
                  className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`} 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isEditing ? <><Save size={18} /> Save Changes</> : 'Edit Profile'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} /> Full Name
                  </label>
                  <input 
                    type="text" className="input-field" value={profileData.name} 
                    disabled={!isEditing} onChange={e => setProfileData({...profileData, name: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} /> Email Address
                  </label>
                  <input 
                    type="email" className="input-field" value={profileData.email} 
                    disabled={!isEditing} onChange={e => setProfileData({...profileData, email: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} /> Phone Number
                  </label>
                  <input 
                    type="text" className="input-field" value={profileData.phoneNumber} 
                    disabled={!isEditing} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} /> Location Address
                  </label>
                  <input 
                    type="text" className="input-field" value={profileData.address} 
                    disabled={!isEditing} onChange={e => setProfileData({...profileData, address: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Briefcase size={20} color="var(--primary)" />
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Active Startup Session</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Session Status</p>
                    <p style={{ color: 'var(--success)', fontWeight: 700 }}>Encrypted</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Access Level</p>
                    <p style={{ fontWeight: 700 }}>Admin-Tier</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Last Activity</p>
                    <p style={{ fontWeight: 700 }}>Active Now</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

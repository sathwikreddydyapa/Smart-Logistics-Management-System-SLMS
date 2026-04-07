import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Globe, ShieldCheck, Zap } from 'lucide-react';

export const Landing = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="flex-between" style={{ padding: '24px 48px' }}>
        <h1 className="gradient-text" style={{ fontSize: '28px', fontWeight: 700 }}>SLMS.</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
           <Link to="/track" className="btn btn-outline">Track Shipment</Link>
           <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-center" style={{ flexDirection: 'column', textAlign: 'center', padding: '100px 20px', minHeight: '80vh' }}>
        <div style={{ padding: '8px 16px', background: 'rgba(78, 68, 206, 0.1)', color: 'var(--accent)', borderRadius: '20px', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
          🚀 The Future of Logistics
        </div>
        <h1 style={{ fontSize: '64px', maxWidth: '800px', lineHeight: 1.1, marginBottom: '24px', fontWeight: 700 }}>
          Smart <span className="gradient-text">Logistics</span> Management System
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.5 }}>
          Streamline your supply chain with real-time tracking, intelligent route assignments, and comprehensive analytics.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Get Started For Free
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Book a Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        {[
          { icon: <Globe size={32} color="var(--accent)" />, title: 'Global Tracking', desc: 'Real-time visibility into all your shipments across the world.' },
          { icon: <Zap size={32} color="var(--warning)" />, title: 'Instant Updates', desc: 'Get notified immediately when shipment status changes.' },
          { icon: <ShieldCheck size={32} color="var(--success)" />, title: 'Secure & Reliable', desc: 'Enterprise-grade security for your vital logistics data.' }
        ].map((feature, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '20px' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

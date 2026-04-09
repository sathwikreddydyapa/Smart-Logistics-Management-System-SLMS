import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/auth';
import { getBaseURL } from '../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      loginUser(user);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
      else navigate('/customer');
    } catch (err) {
      setError(err.message === 'Authentication error' 
        ? "Invalid credentials or account does not exist. Please try again or sign up." 
        : err.message);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>Sign in to continue to SLMS.</p>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" required className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" required className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Sign In</button>
        </form>
        
        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        
        <div style={{ marginTop: '30px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '16px', wordBreak: 'break-all' }}>
           <p><strong>🛠️ Debug Connection:</strong></p>
           <p>Intended API Path: <code style={{ color: 'var(--primary)' }}>{getBaseURL()}/api/auth/login</code></p>
           <p>Host Identity: {window.location.hostname}</p>
        </div>

        <div style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
           <p><strong>Demo Users (Password: password):</strong></p>
           <p>admin@test.com</p>
           <p>driver@test.com</p>
           <p>user@test.com</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AIChatbot } from './components/AIChatbot';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Tracking } from './pages/Tracking';
import { LiveTracking } from './pages/LiveTracking';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
           style: {
             background: 'rgba(20, 20, 25, 0.9)',
             color: '#fff',
             border: '1px solid var(--border-color)',
             backdropFilter: 'blur(10px)'
           }
        }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/track" element={<Tracking />} />
          <Route path="/map" element={
            <ProtectedRoute allowedRoles={['admin', 'customer', 'driver']}>
              <LiveTracking />
            </ProtectedRoute>
          } />
          
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          
          <Route path="/driver" element={
            <ProtectedRoute allowedRoles={['driver']}>
               <DriverDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['admin', 'customer', 'driver']}>
               <Profile />
            </ProtectedRoute>
          } />
        </Routes>
        <AIChatbot />
      </AuthProvider>
    </Router>
  );
}

export default App;

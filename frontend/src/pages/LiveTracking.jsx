import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Activity } from 'lucide-react';
import { getShipments } from '../services/shipments';

// Fix Leaflet's default icon issue with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icon for active shipments
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2764/2764333.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

export const LiveTracking = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const indiaCenter = [20.5937, 78.9629]; // Center of India

  useEffect(() => {
    // Load Shipments
    const fetchAndSimulate = async () => {
      try {
        const shipments = await getShipments();
        
        // Generate random starting coordinates in India for each shipment
        const simulatedVehicles = shipments.map(s => ({
          ...s,
          lat: 20 + (Math.random() * 8 - 4),
          lng: 78 + (Math.random() * 8 - 4),
          targetLat: 20 + (Math.random() * 8 - 4),
          targetLng: 78 + (Math.random() * 8 - 4)
        }));
        setVehicles(simulatedVehicles);
      } catch (err) {
        console.error("Failed to fetch shipments for tracking");
      }
    };
    fetchAndSimulate();
  }, []);

  useEffect(() => {
    // Live simulation loop
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Delivered') return v; // Keep delivered static
        
        // Move slowly towards target
        const latStep = (v.targetLat - v.lat) * 0.05;
        const lngStep = (v.targetLng - v.lng) * 0.05;
        
        return {
          ...v,
          lat: v.lat + latStep,
          lng: v.lng + lngStep
        };
      }));
    }, 2000); // update every 2s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0' }}>
        <Topbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div style={{ padding: '20px 40px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
             <Activity size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Global Fleet Tracking</h1>
            <p style={{ color: 'var(--text-muted)' }}>Real-time GPS synchronization</p>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer 
            center={indiaCenter} 
            zoom={5} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {vehicles.filter(v => 
               v.id.toString().includes(searchTerm) || 
               (v.pickup_location && v.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())) || 
               (v.drop_location && v.drop_location.toLowerCase().includes(searchTerm.toLowerCase()))
            ).map((v) => (
              <Marker 
                key={v.id} 
                position={[v.lat, v.lng]} 
                icon={v.status === 'Delivered' ? new L.Icon.Default() : truckIcon}
              >
                <Popup className="custom-popup">
                  <strong style={{fontSize:'16px'}}>Tracking #{v.id}</strong><br/>
                  Route: {v.pickup_location} &rarr; {v.drop_location}<br/>
                  <span style={{ color: v.status === 'Delivered' ? 'green' : 'orange', fontWeight:'bold' }}>
                    Status: {v.status}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

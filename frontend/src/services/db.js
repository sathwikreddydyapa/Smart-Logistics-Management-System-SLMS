export const getStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Seed initial data if not present
export const initializeDB = () => {
  if (!getStorage('users')) {
    setStorage('users', [
      { id: '1', name: 'Admin User', email: 'admin@test.com', password: 'password', role: 'admin' },
      { id: '2', name: 'Driver Dan', email: 'driver@test.com', password: 'password', role: 'driver' },
      { id: '3', name: 'Customer Chris', email: 'user@test.com', password: 'password', role: 'customer' }
    ]);
  }
  
  if (!getStorage('shipments')) {
    const pastDate1 = new Date(Date.now() - 86400000 * 5).toISOString();
    const pastDate2 = new Date(Date.now() - 86400000 * 2).toISOString();
    const pastDate3 = new Date(Date.now() - 3600000 * 4).toISOString();
    
    setStorage('shipments', [
      {
        id: 'SHP-1001',
        pickup_location: 'New York, NY',
        drop_location: 'Los Angeles, CA',
        package_details: 'Electronics (10kg)',
        status: 'Pending',
        assigned_driver_id: null,
        created_at: pastDate1,
        customer_id: '3'
      },
      {
        id: 'SHP-1002',
        pickup_location: 'Chicago, IL',
        drop_location: 'Miami, FL',
        package_details: 'Furniture (50kg)',
        status: 'In Transit',
        assigned_driver_id: '2',
        created_at: pastDate2,
        customer_id: '3'
      },
      {
        id: 'SHP-1003',
        pickup_location: 'Austin, TX',
        drop_location: 'Seattle, WA',
        package_details: 'Documents (0.5kg)',
        status: 'Delivered',
        assigned_driver_id: '2',
        created_at: pastDate3,
        customer_id: '3'
      },
      {
        id: 'SHP-1004',
        pickup_location: 'Boston, MA',
        drop_location: 'Denver, CO',
        package_details: 'Medical Supplies (5kg)',
        status: 'Picked Up',
        assigned_driver_id: '2',
        created_at: new Date().toISOString(),
        customer_id: '3'
      }
    ]);
  }
};

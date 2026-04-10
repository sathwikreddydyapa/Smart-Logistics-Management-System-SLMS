import api from './api';

export const getShipments = async (filters = {}) => {
  if (filters.customer_id) {
    const res = await api.get(`/shipments/customer/${filters.customer_id}`);
    return res.data;
  }
  if (filters.assigned_driver_id) {
    const res = await api.get(`/shipments/driver/${filters.assigned_driver_id}`);
    return res.data;
  }
  const res = await api.get('/shipments/all');
  return res.data;
};

export const getShipmentById = async (id) => {
  try {
    const res = await api.get(`/shipments/track/${id}`);
    return res.data;
  } catch {
    throw new Error('Shipment not found');
  }
};

export const createShipment = async (data, customer_id) => {
  const payload = { ...data, customerId: customer_id };
  const res = await api.post('/shipments/create', payload);
  return res.data;
};

export const updateShipmentStatus = async (id, status) => {
  const res = await api.put(`/shipments/update-status/${id}`, { status });
  return res.data;
};

export const assignDriver = async (id, driver_id) => {
  const res = await api.put(`/shipments/assign-driver/${id}`, { driverId: driver_id });
  return res.data;
};

export const getAllDrivers = async () => {
  const res = await api.get('/shipments/drivers');
  return res.data;
};

export const getNearbyDrivers = async (location) => {
  const res = await api.get('/shipments/drivers/nearby', { params: { location } });
  return res.data;
};

export const recommendDriver = async (shipmentId) => {
  const res = await api.get(`/shipments/recommend-driver/${shipmentId}`);
  return res.data;
};

export const resetShipments = async () => {
  const res = await api.delete('/shipments/reset');
  return res.data;
};

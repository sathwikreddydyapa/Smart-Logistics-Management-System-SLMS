import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response || error.message);
    if (error.response && error.response.status === 401) {
      throw new Error("Invalid email or password");
    }
    throw new Error("Authentication error: " + (error.message || "Unknown error"));
  }
};

export const register = async (name, email, password, role = 'customer') => {
  try {
    await api.post('/auth/register', { name, email, password, role });
    // After registration, directly attempt login.
    return await login(email, password);
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Registration failed');
  }
};

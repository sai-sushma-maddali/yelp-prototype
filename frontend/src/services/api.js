import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({ baseURL: API_URL });

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────
export const signup = (data)  => api.post('/auth/signup', data);
export const login  = (data)  => api.post('/auth/login', data);
export const getMe  = ()      => api.get('/auth/me');

// ── User Profile ──────────────────────────────────────────────
export const getProfile       = ()     => api.get('/users/profile');
export const updateProfile    = (data) => api.put('/users/profile', data);
export const uploadProfilePic = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/users/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ── Preferences ───────────────────────────────────────────────
export const getPreferences    = ()     => api.get('/users/preferences');
export const updatePreferences = (data) => api.put('/users/preferences', data);

// ── Restaurants ───────────────────────────────────────────────
export const getRestaurants = (params) =>
  api.get('/restaurants', { params });
export const getRestaurant  = (id)     => api.get(`/restaurants/${id}`);
export const createRestaurant = (data) => api.post('/restaurants', data);
export const updateRestaurant = (id, data) => api.put(`/restaurants/${id}`, data);
export const deleteRestaurant = (id)   => api.delete(`/restaurants/${id}`);
export const getMyRestaurants = ()     => api.get('/restaurants/me/listings');

// ── Reviews ───────────────────────────────────────────────────
export const getReviews    = (restaurantId)         =>
  api.get(`/restaurants/${restaurantId}/reviews`);
export const createReview  = (restaurantId, data)   =>
  api.post(`/restaurants/${restaurantId}/reviews`, data);
export const updateReview  = (restaurantId, reviewId, data) =>
  api.put(`/restaurants/${restaurantId}/reviews/${reviewId}`, data);
export const deleteReview  = (restaurantId, reviewId) =>
  api.delete(`/restaurants/${restaurantId}/reviews/${reviewId}`);
export const getMyReviews  = () => api.get('/users/me/reviews');

// ── Favorites ─────────────────────────────────────────────────
export const addFavorite    = (restaurantId) =>
  api.post(`/restaurants/${restaurantId}/favorite`);
export const removeFavorite = (restaurantId) =>
  api.delete(`/restaurants/${restaurantId}/favorite`);
export const getMyFavorites = () => api.get('/users/me/favorites');
export const getMyHistory   = () => api.get('/users/me/history');

// ── Owner ─────────────────────────────────────────────────────
export const getOwnerRestaurants = ()     => api.get('/owner/restaurants');
export const updateOwnerRestaurant = (id, data) =>
  api.put(`/owner/restaurants/${id}`, data);
export const claimRestaurant = (data)     => api.post('/owner/claim', data);
export const getOwnerReviews = (id)       =>
  api.get(`/owner/restaurants/${id}/reviews`);
export const getOwnerDashboard = (id)     => api.get(`/owner/dashboard/${id}`);

// ── AI Assistant ──────────────────────────────────────────────
export const sendChatMessage = (message, conversationHistory) =>
  api.post('/ai-assistant/chat', {
    message,
    conversation_history: conversationHistory
  });

export default api;

// ── Restaurant Photos ─────────────────────────────────────────
export const getRestaurantPhotos  = (restaurantId) =>
  api.get(`/restaurants/${restaurantId}/photos`);
export const uploadRestaurantPhoto = (restaurantId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/restaurants/${restaurantId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteRestaurantPhoto = (restaurantId, photoId) =>
  api.delete(`/restaurants/${restaurantId}/photos/${photoId}`);
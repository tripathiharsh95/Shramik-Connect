import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});


// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const verifyEmail = (token, email) => api.get(`/auth/verify-email?token=${token}${email ? `&email=${encodeURIComponent(email)}` : ''}`);
export const resendVerificationEmail = (email) => api.post('/auth/resend-verification', { email });
export const getMe = () => api.get('/auth/me');

// ---- Workers ----
export const getWorkers = (params) => api.get('/users/workers', { params });
export const getWorker = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.patch('/users/updateMe', data);

// ---- Bookings ----
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = (params) => api.get('/bookings', { params });
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status });
export const getAllBookings = () => api.get('/bookings/all');

// ---- Admin ----
export const getAdminStats = () => api.get('/admin/stats');

// ---- Chat ----
export const getChatMessages = (bookingId) => api.get(`/chat/${bookingId}`);
export const getDirectConversations = () => api.get('/chat/direct/conversations');
export const getDirectMessages = (partnerId) => api.get(`/chat/direct/${partnerId}`);
export const sendDirectMessage = (recipientId, text) => api.post('/chat/direct/send', { recipientId, text });
export const askChatbot = (message, history) => api.post('/chatbot', { message, history });

// ---- Notifications ----
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const deleteAllNotifications = () => api.delete('/notifications');

export default api;

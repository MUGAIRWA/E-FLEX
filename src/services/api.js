import axios from 'axios';

// Create axios instance with base configuration
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (!isLocalhost || import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isJwtExpired = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    // Consider expired if within 15 seconds of expiry
    return payload.exp * 1000 < Date.now() + 15000;
  } catch (e) {
    return true;
  }
};

const getValidStoredToken = (key, checkExpiry = false) => {
  const val = localStorage.getItem(key);
  if (!val || val === 'undefined' || val === 'null') {
    if (val === 'undefined' || val === 'null') {
      localStorage.removeItem(key);
    }
    return null;
  }
  if (checkExpiry && isJwtExpired(val)) {
    return null;
  }
  return val;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    let token = getValidStoredToken('accessToken', true);
    const refreshToken = getValidStoredToken('refreshToken', true);
    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/refresh');

    // Proactively refresh if accessToken is missing, corrupted ("undefined"), or expired
    if (!token && refreshToken && !isAuthEndpoint) {
      try {
        const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = refreshRes.data?.accessToken || refreshRes.data?.token;
        if (newAccessToken && newAccessToken !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          token = newAccessToken;
        }
      } catch (e) {
        // Ignore here; response interceptor will handle 401 if needed
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = getValidStoredToken('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = response.data?.accessToken || response.data?.token;

        if (!newAccessToken || newAccessToken === 'undefined') {
          throw new Error('Refresh endpoint did not return a valid access token');
        }

        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed or no refresh token available: clear dead session and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: (refreshTokenOrObj) => {
    const refreshToken =
      typeof refreshTokenOrObj === 'object' && refreshTokenOrObj !== null
        ? refreshTokenOrObj.refreshToken
        : refreshTokenOrObj;
    return api.post('/auth/logout', { refreshToken });
  },
  refreshToken: (refreshTokenOrObj) => {
    const refreshToken =
      typeof refreshTokenOrObj === 'object' && refreshTokenOrObj !== null
        ? refreshTokenOrObj.refreshToken
        : refreshTokenOrObj;
    return axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  },
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
};

// User Management API (Admin)
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStudents: (params) => api.get('/users/students', { params }),
  getTeachers: (params) => api.get('/users/teachers', { params }),
  getParents: (params) => api.get('/users/parents', { params }),
  getUserStats: () => api.get('/users/stats'),
};

// Course API
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollStudent: (id, studentId) => api.post(`/courses/${id}/enroll`, { studentId }),
  removeStudent: (id, studentId) => api.delete(`/courses/${id}/students/${studentId}`),
  getMaterials: (params) => api.get('/courses/materials', { params }),
  uploadMaterial: (formData) => api.post('/courses/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Assignment API
export const assignmentAPI = {
  getAssignments: (params) => api.get('/assignments', { params }),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (formData) => api.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAssignment: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  submitAssignment: (id, formData) => api.post(`/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  gradeAssignment: (id, studentId, gradeData) => api.put(`/assignments/${id}/grade/${studentId}`, gradeData),
};

// Attendance API
export const attendanceAPI = {
  markAttendance: (attendanceData) => api.post('/attendance', attendanceData),
  bulkMarkAttendance: (attendanceData) => api.post('/attendance/bulk', attendanceData),
  getCourseAttendance: (courseId, params) => api.get(`/attendance/course/${courseId}`, { params }),
  getStudentAttendance: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  updateAttendance: (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
};

// Exam API
export const examAPI = {
  getExams: (params) => api.get('/exams', { params }),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (examData) => api.post('/exams', examData),
  createExamWithFile: (formData) => api.post('/exams/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateExam: (id, examData) => api.put(`/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  submitExamResult: (id, resultData) => api.post(`/exams/${id}/submit`, resultData),
};

// Grade API
export const gradeAPI = {
  getStudentGrades: (studentId, params) => api.get(`/grades/student/${studentId}`, { params }),
  getCourseGrades: (courseId) => api.get(`/grades/course/${courseId}`),
  addGrade: (gradeData) => api.post('/grades', gradeData),
  updateGrade: (gradeId, itemId, gradeData) => api.put(`/grades/${gradeId}/item/${itemId}`, gradeData),
  deleteGrade: (gradeId, itemId) => api.delete(`/grades/${gradeId}/item/${itemId}`),
};

// Message API
export const messageAPI = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  getConversations: () => api.get('/messages/conversations'),
  getConversationMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
  markAsRead: (conversationId) => api.put(`/messages/${conversationId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  createHelpRequest: (helpData) => api.post('/notifications/help-request', helpData),
  getHelpRequests: () => api.get('/notifications/help-requests'),
  replyToHelpRequest: (id, replyData) => api.post(`/notifications/help-requests/${id}/reply`, replyData),
};

// Announcement API
export const announcementAPI = {
  getAnnouncements: (params) => api.get('/announcements', { params }),
  getAnnouncement: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (announcementData) => api.post('/announcements', announcementData),
  updateAnnouncement: (id, announcementData) => api.put(`/announcements/${id}`, announcementData),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

// Parent API
export const parentAPI = {
  getChildren: () => api.get('/parent/children'),
  getChildProgress: (childId) => api.get(`/parent/children/${childId}/progress`),
  getChildAttendance: (childId, params) => api.get(`/parent/children/${childId}/attendance`, { params }),
  getChildGrades: (childId, params) => api.get(`/parent/children/${childId}/grades`, { params }),
  updateSettings: (settings) => api.put('/parent/settings', settings),
};

// Subject API
export const subjectAPI = {
  getSubjects: () => api.get('/subjects'),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (subjectData) => api.post('/subjects', subjectData),
  updateSubject: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
  addTeacherToSubject: (id, teacherId) => api.post(`/subjects/${id}/teachers`, { teacherId }),
};

export default api;

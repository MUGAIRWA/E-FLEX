import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
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

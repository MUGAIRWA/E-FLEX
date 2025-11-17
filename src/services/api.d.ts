import { AxiosResponse } from 'axios';

// Generic API response type
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

// Auth API
export interface AuthAPI {
  login: (credentials: { email: string; password: string; role: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
  register: (userData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  logout: (refreshToken: { refreshToken: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
  refreshToken: (refreshToken: { refreshToken: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
  getCurrentUser: () => Promise<AxiosResponse<ApiResponse<any>>>;
  updateProfile: (userData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// User Management API
export interface UserAPI {
  getUsers: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getUser: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createUser: (userData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateUser: (id: string, userData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteUser: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  getStudents: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getTeachers: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getParents: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Course API
export interface CourseAPI {
  getCourses: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getCourse: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createCourse: (courseData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateCourse: (id: string, courseData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteCourse: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  enrollStudent: (id: string, studentId: { studentId: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
  removeStudent: (id: string, studentId: string) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Assignment API
export interface AssignmentAPI {
  getAssignments: (params?: any) => Promise<AxiosResponse<ApiResponse<{ assignments: any[] }>>>;
  getAssignment: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createAssignment: (formData: FormData) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateAssignment: (id: string, assignmentData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteAssignment: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  submitAssignment: (id: string, formData: FormData) => Promise<AxiosResponse<ApiResponse<any>>>;
  gradeAssignment: (id: string, studentId: string, gradeData: { marks: number; feedback?: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Attendance API
export interface AttendanceAPI {
  markAttendance: (attendanceData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  bulkMarkAttendance: (attendanceData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getCourseAttendance: (courseId: string, params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getStudentAttendance: (studentId: string, params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateAttendance: (id: string, attendanceData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteAttendance: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Exam API
export interface ExamAPI {
  getExams: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getExam: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createExam: (examData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateExam: (id: string, examData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteExam: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  submitExamResult: (id: string, resultData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Grade API
export interface GradeAPI {
  getStudentGrades: (studentId: string, params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getCourseGrades: (courseId: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  addGrade: (gradeData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateGrade: (gradeId: string, itemId: string, gradeData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteGrade: (gradeId: string, itemId: string) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Message API
export interface MessageAPI {
  sendMessage: (messageData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getConversations: () => Promise<AxiosResponse<ApiResponse<any>>>;
  getConversationMessages: (conversationId: string, params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  markAsRead: (conversationId: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  getUnreadCount: () => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Notification API
export interface NotificationAPI {
  getNotifications: (params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  markAsRead: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  markAllAsRead: () => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteNotification: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Announcement API
export interface AnnouncementAPI {
  getAnnouncements: (params?: { page?: number; limit?: number; type?: string; targetAudience?: string }) => Promise<AxiosResponse<ApiResponse<{ announcements: any[]; totalPages: number; currentPage: number; total: number }>>>;
  getAnnouncement: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createAnnouncement: (announcementData: { title: string; message: string; type?: string; targetAudience?: string; priority?: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateAnnouncement: (id: string, announcementData: Partial<{ title: string; message: string; type: string; targetAudience: string; priority: string; isActive: boolean }>) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteAnnouncement: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Parent API
export interface ParentAPI {
  getChildren: () => Promise<AxiosResponse<ApiResponse<any>>>;
  getChildProgress: (childId: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  getChildAttendance: (childId: string, params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  getChildGrades: (childId: string, params?: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateSettings: (settings: any) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Subject API
export interface SubjectAPI {
  getSubjects: () => Promise<AxiosResponse<ApiResponse<any>>>;
  getSubject: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  createSubject: (subjectData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  updateSubject: (id: string, subjectData: any) => Promise<AxiosResponse<ApiResponse<any>>>;
  deleteSubject: (id: string) => Promise<AxiosResponse<ApiResponse<any>>>;
  addTeacherToSubject: (id: string, teacherId: { teacherId: string }) => Promise<AxiosResponse<ApiResponse<any>>>;
}

// Exported APIs
export declare const authAPI: AuthAPI;
export declare const userAPI: UserAPI;
export declare const courseAPI: CourseAPI;
export declare const assignmentAPI: AssignmentAPI;
export declare const attendanceAPI: AttendanceAPI;
export declare const examAPI: ExamAPI;
export declare const gradeAPI: GradeAPI;
export declare const messageAPI: MessageAPI;
export declare const notificationAPI: NotificationAPI;
export declare const announcementAPI: AnnouncementAPI;
export declare const parentAPI: ParentAPI;
export declare const subjectAPI: SubjectAPI;

// Default export (axios instance)
declare const api: import('axios').AxiosInstance;
export default api;

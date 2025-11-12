import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LandingPage } from './pages/Home/LandingPage';
import { StudentDashboard } from './pages/Dashboard/StudentDashboard';
import { TeacherDashboard } from './pages/Dashboard/TeacherDashboard';
import { ParentDashboard } from './pages/Dashboard/ParentDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';
import AuthPage from './pages/Auth/AuthPage';

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/admin" element={<AuthPage />} />
            <Route path="/auth/teacher" element={<AuthPage />} />
            <Route path="/auth/student" element={<AuthPage />} />
            <Route path="/auth/parent" element={<AuthPage />} />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

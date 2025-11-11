import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/Home/LandingPage';
import { StudentDashboard } from './pages/Dashboard/StudentDashboard';
import { TeacherDashboard } from './pages/Dashboard/TeacherDashboard';
import { ParentDashboard } from './pages/Dashboard/ParentDashboard';
import { AdminDashboard } from './pages/Dashboard/AdminDashboard';
import AuthPage from './pages/Auth/AuthPage';

export function App() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        <Route path="/parent/*" element={<ParentDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>;
}

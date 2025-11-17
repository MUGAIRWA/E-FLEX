import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { TeacherOverviewTab } from './Teacher/OverviewTab';
import { ContentUploadTab } from './Teacher/ContentUploadTab';
import { GradebookTab } from './Teacher/GradebookTab.tsx';
import { StudentProgressTab } from './Teacher/StudentProgressTab';
import { TeacherAnnouncementsTab } from './Teacher/AnnouncementsTab';
export function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverviewTab onTabChange={setActiveTab} />;
      case 'upload':
        return <ContentUploadTab />;
      case 'gradebook':
        return <GradebookTab />;
      case 'progress':
        return <StudentProgressTab />;
      case 'announcements':
        return <TeacherAnnouncementsTab />;
      default:
        return <TeacherOverviewTab onTabChange={setActiveTab} />;
    }
  };
  return <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} userRole="teacher">
      {renderContent()}
    </DashboardLayout>;
}
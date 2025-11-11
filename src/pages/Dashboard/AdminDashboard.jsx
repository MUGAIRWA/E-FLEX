import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { AdminDashboardTab } from './Admin/AdminDashboardTab';
import { UserManagement } from './Admin/UserManagement';
import { ContentModeration } from './Admin/ContentModeration';
import { FinanceDashboard } from './Admin/FinanceDashboard';
import { AnalyticsReports } from './Admin/AnalyticsReports';
import { ClassesStreams } from './Admin/ClassesStreams';
import { TeachersOverview } from './Admin/TeachersOverview';
import { TicketsSupport } from './Admin/TicketsSupport';
import { Announcements } from './Admin/Announcements';
import { Settings } from './Admin/Settings';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardTab />;
      case 'user-management':
        return <UserManagement />;
      case 'content-moderation':
        return <ContentModeration />;
      case 'finance-dashboard':
        return <FinanceDashboard />;
      case 'analytics-reports':
        return <AnalyticsReports />;
      case 'classes-streams':
        return <ClassesStreams />;
      case 'teachers-overview':
        return <TeachersOverview />;
      case 'tickets-support':
        return <TicketsSupport />;
      case 'announcements':
        return <Announcements />;
      case 'settings':
        return <Settings />;
      default:
        return <AdminDashboardTab />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} userRole="admin">
      {renderContent()}
    </DashboardLayout>
  );
}

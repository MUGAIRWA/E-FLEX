import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { DashboardTab } from './Parent/DashboardTab';
import { ProgressReportTab } from './Parent/ProgressReportTab';
import { PaymentsTab } from './Parent/PaymentsTab';
import { AnnouncementsTab } from './Parent/AnnouncementsTab';
import { MessagesSupportTab } from './Parent/MessagesSupportTab';
import { SettingsTab } from './Parent/SettingsTab';

export function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'progress-report':
        return <ProgressReportTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'announcements':
        return <AnnouncementsTab />;
      case 'messages-support':
        return <MessagesSupportTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} userRole="parent">
      {renderContent()}
    </DashboardLayout>
  );
}

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { OverviewTab } from './Student/OverviewTab';
import { ModulesTab } from './Student/ModulesTab';
import { AssignmentsTab } from './Student/AssignmentsTab';
import { Community } from './Student/CommunityTab';
import { AnnouncementsTab } from './Student/AnnouncementsTab';
import { SupportTab } from './Student/SupportTab';
import { Payment } from './Student/Payment';
export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'modules':
        return <ModulesTab />;
      case 'assignments':
        return <AssignmentsTab />;
      case 'community':
        return <Community />;
      case 'announcements':
        return <AnnouncementsTab />;
      case 'support':
        return <SupportTab />;
      case 'payment':
        return <Payment />;
      default:
        return <OverviewTab />;
    }
  };
  return <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} userRole="student">
      {renderContent()}
    </DashboardLayout>;
}
import React from 'react';
import { GraduationCapIcon, UsersIcon, BookOpenIcon, ShieldIcon } from 'lucide-react';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      id: 'student',
      label: 'Student',
      icon: <GraduationCapIcon className="w-4 h-4" />
    },
    {
      id: 'parent',
      label: 'Parent',
      icon: <UsersIcon className="w-4 h-4" />
    },
    {
      id: 'teacher',
      label: 'Teacher',
      icon: <BookOpenIcon className="w-4 h-4" />
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <ShieldIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#F4F1EA] p-1.5 rounded-xl mb-6 border border-[#E5E0D5]">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onRoleChange(role.id)}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
            selectedRole === role.id
              ? 'bg-[#134E4A] text-white shadow-sm'
              : 'text-[#4A5552] hover:text-[#16211E]'
          }`}
        >
          {role.icon}
          <span>{role.label}</span>
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;

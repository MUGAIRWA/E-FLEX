import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCapIcon, UsersIcon, BookOpenIcon, ShieldIcon } from 'lucide-react';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      id: 'student',
      label: 'Student',
      icon: <GraduationCapIcon className="w-5 h-5" />,
      emoji: '👨‍🎓'
    },
    {
      id: 'parent',
      label: 'Parent',
      icon: <UsersIcon className="w-5 h-5" />,
      emoji: '👨‍👩‍👧'
    },
    {
      id: 'teacher',
      label: 'Teacher',
      icon: <BookOpenIcon className="w-5 h-5" />,
      emoji: '👩‍🏫'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <ShieldIcon className="w-5 h-5" />,
      emoji: '🧑‍💼'
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {roles.map((role) => (
        <motion.button
          key={role.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onRoleChange(role.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedRole === role.id
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary'
          }`}
        >
          <span className="text-lg">{role.emoji}</span>
          {role.label}
        </motion.button>
      ))}
    </div>
  );
};

export default RoleSelector;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RoleSelector from '../../components/ui/RoleSelector';
import LoginFormStudent from '../../components/auth/LoginFormStudent';
import RegisterFormStudent from '../../components/auth/RegisterFormStudent';
import LoginFormParent from '../../components/auth/LoginFormParent';
import RegisterFormParent from '../../components/auth/RegisterFormParent';
import LoginFormTeacher from '../../components/auth/LoginFormTeacher';
import RegisterFormTeacher from '../../components/auth/RegisterFormTeacher';
import LoginFormAdmin from '../../components/auth/LoginFormAdmin';
import RegisterFormAdmin from '../../components/auth/RegisterFormAdmin';

const AuthPage = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);

  const renderForm = () => {
    const formKey = `${isLogin ? 'Login' : 'Register'}Form${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`;

    const forms = {
      LoginFormStudent: <LoginFormStudent />,
      RegisterFormStudent: <RegisterFormStudent />,
      LoginFormParent: <LoginFormParent />,
      RegisterFormParent: <RegisterFormParent />,
      LoginFormTeacher: <LoginFormTeacher />,
      RegisterFormTeacher: <RegisterFormTeacher />,
      LoginFormAdmin: <LoginFormAdmin />,
      RegisterFormAdmin: <RegisterFormAdmin />
    };

    return forms[formKey] || <LoginFormStudent />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-poppins font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2"
            >
              {isLogin ? 'Login to E-Flex' : 'Create an Account'}
            </motion.h1>
            <p className="text-gray-600">
              {isLogin ? 'Welcome back!' : 'Join the E-Flex community'}
            </p>
          </div>

          {/* Role Selector */}
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

          {/* Form */}
          <div className="mt-8">
            {renderForm()}
          </div>

          {/* Toggle between Login/Register */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary hover:text-accent font-medium transition-colors"
              >
                {isLogin ? 'Create Account' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

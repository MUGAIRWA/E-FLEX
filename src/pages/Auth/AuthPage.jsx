import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginFormStudent from '../../components/auth/LoginFormStudent';
import LoginFormTeacher from '../../components/auth/LoginFormTeacher';
import LoginFormParent from '../../components/auth/LoginFormParent';
import LoginFormAdmin from '../../components/auth/LoginFormAdmin';
import RegisterFormStudent from '../../components/auth/RegisterFormStudent';
import RegisterFormTeacher from '../../components/auth/RegisterFormTeacher';
import RegisterFormParent from '../../components/auth/RegisterFormParent';
import RegisterFormAdmin from '../../components/auth/RegisterFormAdmin';
import RoleSelector from '../../components/ui/RoleSelector';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user type from URL path
  const userType = location.pathname.split('/').pop() || 'student';

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect based on user role
      const roleRoutes = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard'
      };
      navigate(roleRoutes[result.user?.role] || '/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');

    const result = await register(formData);

    if (result.success) {
      // Redirect based on user role after successful registration
      const roleRoutes = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard'
      };
      navigate(roleRoutes[result.user?.role] || '/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLogin ? (
            <>
              {selectedRole === 'student' && <LoginFormStudent onSubmit={handleLogin} loading={loading} />}
              {selectedRole === 'teacher' && <LoginFormTeacher onSubmit={handleLogin} loading={loading} />}
              {selectedRole === 'parent' && <LoginFormParent onSubmit={handleLogin} loading={loading} />}
              {selectedRole === 'admin' && <LoginFormAdmin onSubmit={handleLogin} loading={loading} />}
            </>
          ) : (
            <>
              {selectedRole === 'student' && <RegisterFormStudent onSubmit={handleRegister} loading={loading} />}
              {selectedRole === 'teacher' && <RegisterFormTeacher onSubmit={handleRegister} loading={loading} />}
              {selectedRole === 'parent' && <RegisterFormParent onSubmit={handleRegister} loading={loading} />}
              {selectedRole === 'admin' && <RegisterFormAdmin onSubmit={handleRegister} loading={loading} />}
            </>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLogin ? 'Create new account' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

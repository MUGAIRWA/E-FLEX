import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import LoginFormStudent from '../../components/auth/LoginFormStudent';
import LoginFormTeacher from '../../components/auth/LoginFormTeacher';
import LoginFormParent from '../../components/auth/LoginFormParent';
import LoginFormAdmin from '../../components/auth/LoginFormAdmin';
import RegisterFormStudent from '../../components/auth/RegisterFormStudent';
import RegisterFormTeacher from '../../components/auth/RegisterFormTeacher';
import RegisterFormParent from '../../components/auth/RegisterFormParent';
import RegisterFormAdmin from '../../components/auth/RegisterFormAdmin';
import RoleSelector from '../../components/ui/RoleSelector';

const VALID_ROLES = ['student', 'teacher', 'parent', 'admin'];

const AuthPage = () => {
  const location = useLocation();
  const pathRole = location.pathname.split('/').pop();
  const initialRole = VALID_ROLES.includes(pathRole) ? pathRole : 'student';

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const { login, register, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const roleFromPath = location.pathname.split('/').pop();
    if (VALID_ROLES.includes(roleFromPath)) {
      setSelectedRole(roleFromPath);
      setError('');
    }
  }, [location.pathname]);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const actualRole = result.user?.role;
      if (actualRole && actualRole !== selectedRole) {
        await logout();
        setError(
          `This email is registered as a ${actualRole.toUpperCase()} account, not a ${selectedRole.toUpperCase()} account. Please sign in with a ${selectedRole} email or click "Create new account" below to register as a ${selectedRole}.`
        );
        setLoading(false);
        return;
      }

      // Redirect based on user role
      const roleRoutes = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard'
      };
      navigate(roleRoutes[actualRole] || '/');
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
    <div className="min-h-screen bg-[#F8F6F1] grid lg:grid-cols-12">
      {/* Left Editorial Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#134E4A] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="font-poppins font-bold text-2xl tracking-tight">
              E-Flex<span className="text-[#C85A28]">.</span>
            </span>
          </button>

          <div className="mt-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F4E9DC]/80">
              Academic Continuity Platform
            </span>
            <h1 className="font-poppins font-bold text-3xl xl:text-4xl mt-3 leading-tight">
              Structured weekly revision and transparent progress tracking.
            </h1>
            <p className="text-white/80 text-sm xl:text-base mt-4 leading-relaxed">
              Sign in to access your Form 1–4 subject modules, submit holiday coursework, or review
              real-time class and child performance.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl overflow-hidden border border-white/15">
            <img
              src="/images/hero-students.jpg"
              alt="Kenyan secondary school students studying"
              className="w-full h-52 object-cover"
            />
          </div>
          <p className="text-xs text-white/70">
            © 2026 E-Flex Digital Learning • Form 1 – Form 4 Secondary Curriculum
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center py-12 px-4 sm:px-8 lg:px-14">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#16211E]">
                {isLogin ? 'Sign in to your portal' : 'Create your E-Flex account'}
              </h2>
              <p className="text-sm text-[#5C6663] mt-1">
                Select your role below to continue as a {selectedRole}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-[#134E4A] hover:underline"
            >
              ← Back to Home
            </button>
          </div>

          <div className="bg-white py-8 px-5 sm:px-9 rounded-2xl border border-[#E5E0D5] shadow-[0_4px_20px_-6px_rgba(22,33,30,0.06)]">
            <RoleSelector
              selectedRole={selectedRole}
              onRoleChange={(role) => {
                setSelectedRole(role);
                setError('');
              }}
            />
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
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

            <div className="mt-6 pt-6 border-t border-[#EFECE4]">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full flex justify-center py-2.5 px-4 border border-[#D8D1C4] rounded-xl text-sm font-semibold text-[#16211E] bg-[#F8F6F1] hover:border-[#134E4A] hover:text-[#134E4A] transition-colors"
              >
                {isLogin ? "Don't have an account? Create new account" : 'Already have an account? Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

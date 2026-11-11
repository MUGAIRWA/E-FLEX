import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BookOpenIcon,
  GraduationCapIcon,
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  CheckCircle2Icon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { userAPI, courseAPI, assignmentAPI, examAPI } from '../../../services/api';

const formatClassLabel = (cls, stream) => {
  if (!cls && !stream) return 'Unassigned';
  const norm = String(cls || '').toLowerCase().replace(/\s+/g, '');
  const match = norm.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ');
};

export function AdminDashboardTab({ onTabChange }) {
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalAdmins: 0,
    activeCourses: 0,
    totalAssignments: 0,
    totalExams: 0
  });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, assignmentsRes, examsRes] = await Promise.all([
        userAPI.getUserStats().catch(() => ({ data: {} })),
        userAPI.getUsers({ page: 1, limit: 100 }).catch(() => ({ data: { users: [] } })),
        assignmentAPI.getAssignments({ page: 1, limit: 10 }).catch(() => ({ data: { assignments: [] } })),
        examAPI.getExams({ page: 1, limit: 10 }).catch(() => ({ data: { exams: [] } }))
      ]);

      const st = statsRes.data || {};
      const allUsers = Array.isArray(usersRes.data?.users) ? usersRes.data.users : [];
      const studentList = allUsers.filter((u) => u.role === 'student');
      const teacherList = allUsers.filter((u) => u.role === 'teacher');
      const parentList = allUsers.filter((u) => u.role === 'parent');

      setStudents(studentList);
      setTeachers(teacherList);
      setParents(parentList);

      setStats({
        totalUsers: st.totalUsers ?? allUsers.length,
        totalStudents: st.totalStudents ?? st.students ?? studentList.length,
        totalTeachers: st.totalTeachers ?? st.teachers ?? teacherList.length,
        totalParents: st.totalParents ?? st.parents ?? parentList.length,
        totalAdmins: st.totalAdmins ?? st.admins ?? 0,
        activeCourses: st.activeCourses ?? 0,
        totalAssignments: st.totalAssignments ?? 0,
        totalExams: st.totalExams ?? 0
      });

      const assignments = Array.isArray(assignmentsRes.data?.assignments)
        ? assignmentsRes.data.assignments
        : [];
      const exams = Array.isArray(examsRes.data?.exams) ? examsRes.data.exams : [];

      const feed = [
        ...assignments.slice(0, 4).map((a) => ({
          id: `asg-${a.id}`,
          label: `Assignment posted: "${a.title}" (${a.course?.subject || 'Course'} • ${formatClassLabel(a.course?.class, a.course?.stream)})`,
          time: a.createdAt
        })),
        ...exams.slice(0, 4).map((ex) => ({
          id: `ex-${ex.id}`,
          label: `Quiz posted: "${ex.title}" (${ex.course?.subject || 'Course'} • ${formatClassLabel(ex.course?.class, ex.course?.stream)})`,
          time: ex.createdAt
        })),
        ...allUsers.slice(0, 5).map((u) => ({
          id: `usr-${u.id}`,
          label: `${u.firstName} ${u.lastName} registered as ${u.role.toUpperCase()}${
            u.role === 'student' ? ` (${formatClassLabel(u.class, u.stream)})` : ''
          }`,
          time: u.createdAt
        }))
      ]
        .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
        .slice(0, 8);

      setRecentItems(feed);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const metricCards = [
    {
      label: 'Registered Students',
      value: stats.totalStudents,
      icon: <GraduationCapIcon className="w-6 h-6" />,
      badge: 'bg-[#134E4A]/10 text-[#134E4A]',
      tab: 'user-management'
    },
    {
      label: 'Registered Teachers',
      value: stats.totalTeachers,
      icon: <BookOpenIcon className="w-6 h-6" />,
      badge: 'bg-[#1E7A50]/10 text-[#1E7A50]',
      tab: 'teachers-overview'
    },
    {
      label: 'Registered Parents',
      value: stats.totalParents,
      icon: <UsersIcon className="w-6 h-6" />,
      badge: 'bg-[#C85A28]/10 text-[#C85A28]',
      tab: 'user-management'
    },
    {
      label: 'Active Class Courses',
      value: stats.activeCourses,
      icon: <BookOpenIcon className="w-6 h-6" />,
      badge: 'bg-[#134E4A]/10 text-[#134E4A]',
      tab: 'classes-streams'
    },
    {
      label: 'Active Assignments',
      value: stats.totalAssignments,
      icon: <FileTextIcon className="w-6 h-6" />,
      badge: 'bg-[#C85A28]/10 text-[#C85A28]',
      tab: 'content-moderation'
    },
    {
      label: 'Active Quizzes & Exams',
      value: stats.totalExams,
      icon: <CheckCircle2Icon className="w-6 h-6" />,
      badge: 'bg-[#1E7A50]/10 text-[#1E7A50]',
      tab: 'content-moderation'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-poppins font-bold text-3xl text-[#16211E]">
            Welcome back, {userName}
          </h1>
          <p className="text-[#5C6663] mt-1">
            Live school directory and academic activity connected directly to the database.
          </p>
        </div>
        <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
          <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </motion.div>

      {/* Top Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="p-6 cursor-pointer hover:border-[#134E4A] transition-colors"
              onClick={() => onTabChange && onTabChange(metric.tab)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5C6663]">{metric.label}</p>
                  <p className="text-3xl font-bold text-[#16211E] mt-1">
                    {loading ? '—' : metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${metric.badge}`}>{metric.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-[#16211E] mb-4">Quick Administration Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="flex items-center justify-center space-x-2 py-3.5"
            onClick={() => onTabChange && onTabChange('user-management')}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Manage All Users ({stats.totalUsers})</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 py-3.5"
            onClick={() => onTabChange && onTabChange('classes-streams')}
          >
            <BookOpenIcon className="w-5 h-5" />
            <span>View Classes & Streams</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 py-3.5"
            onClick={() => onTabChange && onTabChange('announcements')}
          >
            <MessageSquareIcon className="w-5 h-5" />
            <span>Post School Announcement</span>
          </Button>
        </div>
      </Card>

      {/* Live Overview of Teachers, Students, and Parents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teachers Directory Snapshot */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#16211E]">Teachers ({teachers.length})</h2>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('user-management')}
                className="text-xs font-semibold text-[#134E4A] hover:underline inline-flex items-center"
              >
                View all <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
            {teachers.length === 0 ? (
              <p className="text-sm text-[#5C6663] py-6 text-center">No teachers registered yet.</p>
            ) : (
              <div className="space-y-3">
                {teachers.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#16211E] truncate">
                        {t.firstName} {t.lastName}
                      </p>
                      <p className="text-xs text-[#5C6663] truncate">{t.email}</p>
                      {Array.isArray(t.subjects) && t.subjects.length > 0 && (
                        <p className="text-xs text-[#134E4A] font-medium mt-0.5 truncate">
                          {t.subjects.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#134E4A]/10 text-[#134E4A]">
                      Teacher
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Students Directory Snapshot */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#16211E]">Students ({students.length})</h2>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('user-management')}
                className="text-xs font-semibold text-[#134E4A] hover:underline inline-flex items-center"
              >
                View all <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
            {students.length === 0 ? (
              <p className="text-sm text-[#5C6663] py-6 text-center">No students registered yet.</p>
            ) : (
              <div className="space-y-3">
                {students.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#16211E] truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-[#5C6663] truncate">{s.email}</p>
                      <p className="text-xs text-[#C85A28] font-medium mt-0.5">
                        {formatClassLabel(s.class, s.stream)}
                        {s.admissionNumber ? ` • ${s.admissionNumber}` : ''}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#C85A28]/10 text-[#C85A28]">
                      Student
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Parents Directory Snapshot */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#16211E]">Parents ({parents.length})</h2>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('user-management')}
                className="text-xs font-semibold text-[#134E4A] hover:underline inline-flex items-center"
              >
                View all <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
            {parents.length === 0 ? (
              <p className="text-sm text-[#5C6663] py-6 text-center">No parents registered yet.</p>
            ) : (
              <div className="space-y-3">
                {parents.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#16211E] truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-[#5C6663] truncate">{p.email}</p>
                      <p className="text-xs text-[#1E7A50] font-medium mt-0.5 truncate">
                        {Array.isArray(p.children) && p.children.length > 0
                          ? `Child: ${p.children.map((c) => `${c.firstName} ${c.lastName}`).join(', ')}`
                          : p.childEmail
                          ? `Linked: ${p.childEmail}`
                          : p.phoneNumber || 'Parent Account'}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1E7A50]/10 text-[#1E7A50]">
                      Parent
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Live Activity Feed */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-[#16211E] mb-4">Recent Platform Activity</h2>
        {recentItems.length === 0 ? (
          <p className="text-sm text-[#5C6663]">No platform activity recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-[#F8F6F1] border border-[#E5E0D5] rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#134E4A] rounded-full flex-shrink-0" />
                  <p className="text-sm text-[#16211E]">{item.label}</p>
                </div>
                {item.time && (
                  <span className="text-xs text-[#5C6663] ml-4 whitespace-nowrap">
                    {new Date(item.time).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

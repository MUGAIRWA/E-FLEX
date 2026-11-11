import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  BellIcon,
  TrendingUpIcon,
  HelpCircleIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AnnouncementModal } from '../../../components/AnnouncementModal';
// @ts-ignore: no types for JS AuthContext module
import { useAuth } from '../../../contexts/AuthContext';
import { notificationAPI, courseAPI, assignmentAPI, examAPI } from '../../../services/api';
import { useSocket } from '../../../contexts/SocketContext';

const formatClassStream = (cls?: string, stream?: string) => {
  if (!cls && !stream) return 'All Streams';
  const norm = String(cls || '').toLowerCase().replace(/\s+/g, '');
  const match = norm.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ');
};

export function TeacherOverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [helpRes, coursesRes, assignmentsRes, examsRes] = await Promise.all([
          notificationAPI.getHelpRequests().catch(() => ({ data: { helpRequests: [] } })),
          courseAPI.getCourses({ limit: 100 }).catch(() => ({ data: { courses: [] } })),
          assignmentAPI.getAssignments({ limit: 100 }).catch(() => ({ data: { assignments: [] } })),
          examAPI.getExams({ limit: 100 }).catch(() => ({ data: { exams: [] } }))
        ]);

        setHelpRequests((helpRes.data?.helpRequests || []).filter((r: any) => !r.isRead));
        setCourses(
          Array.isArray(coursesRes.data?.courses)
            ? coursesRes.data.courses
            : Array.isArray(coursesRes.data)
            ? coursesRes.data
            : []
        );
        setAssignments(
          Array.isArray(assignmentsRes.data?.assignments)
            ? assignmentsRes.data.assignments
            : []
        );
        setExams(Array.isArray(examsRes.data?.exams) ? examsRes.data.exams : []);
      } catch (err) {
        // ignore
      }
    };

    loadData();
    if (socket) {
      socket.on('student_help_request', loadData);
      return () => {
        socket.off('student_help_request', loadData);
      };
    }
  }, [socket]);

  // Compute live stats from database records
  const uniqueStudentIds = new Set<string>();
  for (const c of courses) {
    if (Array.isArray(c.students)) {
      for (const s of c.students) {
        if (s?.id || s?._id) uniqueStudentIds.add(s.id || s._id);
      }
    }
  }

  const allSubmissions: any[] = [];
  for (const a of assignments) {
    if (Array.isArray(a.submissions)) {
      for (const sub of a.submissions) {
        allSubmissions.push({
          ...sub,
          assignmentTitle: a.title,
          subject: a.course?.subject || a.course?.title || 'Subject',
          totalMarks: a.totalMarks || 100
        });
      }
    }
  }

  const pendingSubmissions = allSubmissions.filter(
    (s) => s.marks === null || s.marks === undefined
  );
  const gradedSubmissions = allSubmissions.filter(
    (s) => s.marks !== null && s.marks !== undefined
  );
  const avgScore =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce(
            (sum, s) => sum + (Number(s.marks || 0) / Number(s.totalMarks || 100)) * 100,
            0
          ) / gradedSubmissions.length
        )
      : null;

  const stats = [
    {
      label: 'Enrolled Students',
      value: String(uniqueStudentIds.size),
      icon: <UsersIcon className="w-6 h-6" />,
      badge: 'bg-[#134E4A] text-white'
    },
    {
      label: 'Pending Grading',
      value: String(pendingSubmissions.length),
      icon: <ClipboardCheckIcon className="w-6 h-6" />,
      badge: 'bg-[#C85A28] text-white'
    },
    {
      label: 'Assignments & Quizzes',
      value: String(assignments.length + exams.length),
      icon: <FileTextIcon className="w-6 h-6" />,
      badge: 'bg-[#1E7A50] text-white'
    },
    {
      label: 'Avg. Graded Score',
      value: avgScore !== null ? `${avgScore}%` : '—',
      icon: <TrendingUpIcon className="w-6 h-6" />,
      badge: 'bg-[#134E4A] text-white'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 text-[#16211E]">
          Welcome back, {userName}
        </h1>
        <p className="text-[#5C6663]">Here is your live teaching overview for today.</p>
      </motion.div>

      {helpRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-amber-300 bg-amber-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                  <HelpCircleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-gray-900">
                    {helpRequests.length} Student{helpRequests.length > 1 ? 's Need' : ' Needs'} Help
                  </h3>
                  <p className="text-sm text-gray-700 mt-0.5">
                    Latest: <span className="font-semibold">{helpRequests[0].subject} — {helpRequests[0].topic}</span>
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => onTabChange('progress')}>
                Review & Help Students
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card>
              <div className={`w-12 h-12 rounded-xl ${stat.badge} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-sm text-[#5C6663] mb-1">{stat.label}</p>
              <p className="font-poppins font-bold text-2xl text-[#16211E]">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Submissions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-poppins font-bold text-xl text-[#16211E]">Recent Submissions</h3>
            <span className="text-xs bg-[#C85A28]/10 text-[#C85A28] px-3 py-1 rounded-full font-semibold">
              {pendingSubmissions.length} Pending
            </span>
          </div>
          {allSubmissions.length === 0 ? (
            <p className="text-sm text-[#5C6663] py-6 text-center">
              No student submissions received yet.
            </p>
          ) : (
            <div className="space-y-3">
              {allSubmissions.slice(0, 5).map((sub, index) => (
                <div
                  key={sub.id || index}
                  className="p-3.5 bg-[#F8F6F1] border border-[#E5E0D5] rounded-xl flex items-start justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#16211E]">
                      {sub.student
                        ? `${sub.student.firstName} ${sub.student.lastName}`
                        : 'Student'}
                    </p>
                    <p className="text-sm text-[#5C6663]">{sub.assignmentTitle}</p>
                    <p className="text-xs text-[#5C6663] mt-0.5">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => onTabChange('gradebook')}>
                    {sub.marks !== null && sub.marks !== undefined ? `${sub.marks}/${sub.totalMarks}` : 'Grade'}
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full mt-4" onClick={() => onTabChange('gradebook')}>
            Open Gradebook
          </Button>
        </Card>

        {/* Active Class Streams */}
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-4 text-[#16211E]">
            Your Active Class Streams ({courses.length})
          </h3>
          {courses.length === 0 ? (
            <p className="text-sm text-[#5C6663] py-6 text-center">
              No active courses yet. Upload notes, an assignment, or a quiz to initialize a class stream.
            </p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id || course._id}
                  className="p-3.5 bg-[#F8F6F1] rounded-xl border border-[#E5E0D5] flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#16211E]">{course.title || course.subject}</p>
                    <p className="text-xs text-[#C85A28] font-medium">
                      {formatClassStream(course.class, course.stream)}
                    </p>
                  </div>
                  <span className="text-xs bg-[#134E4A]/10 text-[#134E4A] px-2.5 py-1 rounded-full font-semibold">
                    {Array.isArray(course.students) ? course.students.length : 0} students
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-poppins font-bold text-xl mb-4 text-[#16211E]">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="flex items-center justify-center space-x-2"
            onClick={() => onTabChange('upload')}
          >
            <FileTextIcon className="w-5 h-5" />
            <span>Post Notes / Assignment / Quiz</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => setIsAnnouncementModalOpen(true)}
          >
            <BellIcon className="w-5 h-5" />
            <span>Send Announcement</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => onTabChange('progress')}
          >
            <TrendingUpIcon className="w-5 h-5" />
            <span>View Student Progress</span>
          </Button>
        </div>
      </Card>

      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

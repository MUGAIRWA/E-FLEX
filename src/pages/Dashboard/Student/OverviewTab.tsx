import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  TrendingUpIcon,
  CalendarIcon,
  StarIcon,
  FileTextIcon,
  ClipboardListIcon,
  BookOpenIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { SubjectCard } from '../../../components/dashboard/SubjectCard';
import { QuoteCard } from '../../../components/dashboard/QuoteCard';
import { ProgressBar } from '../../../components/dashboard/ProgressBar';
// @ts-ignore: no types for JS AuthContext module
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import { courseAPI, assignmentAPI, examAPI } from '../../../services/api';
// @ts-ignore: no types for JS constants module
import { SUBJECTS } from '../../../constants/subjects';

export function OverviewTab() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const [materialsCount, setMaterialsCount] = useState(0);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);
  const [submittedAssignmentsCount, setSubmittedAssignmentsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState(0);
  const [recentStreamItems, setRecentStreamItems] = useState<any[]>([]);

  const formatClassLabel = (cls?: string, stream?: string) => {
    const prettyClass = cls ? cls.replace(/^form(\d)$/i, 'Form $1') : '';
    return [prettyClass, stream].filter(Boolean).join(' ').trim();
  };

  const studentStreamLabel = formatClassLabel(
    (user as any)?.class,
    (user as any)?.stream
  );

  const loadOverviewData = useCallback(async () => {
    try {
      const [matsRes, assignRes, examsRes] = await Promise.allSettled([
        courseAPI.getMaterials(),
        assignmentAPI.getAssignments({ limit: 25 }),
        examAPI.getExams({ limit: 25 })
      ]);

      const feed: any[] = [];

      if (matsRes.status === 'fulfilled') {
        const mats = matsRes.value.data?.materials || [];
        setMaterialsCount(mats.length);
        mats.forEach((m: any) => {
          feed.push({
            id: m.id,
            kind: m.type === 'video' ? 'Video' : 'Notes',
            title: m.title,
            subject: m.subject,
            teacher: m.teacherName,
            date: m.uploadedAt
          });
        });
      }

      if (assignRes.status === 'fulfilled') {
        const assigns = (assignRes.value.data as any)?.assignments || [];
        const pending = assigns.filter(
          (a: any) => !a.submissions || a.submissions.length === 0
        ).length;
        const submitted = assigns.filter(
          (a: any) => a.submissions && a.submissions.length > 0
        ).length;
        setPendingAssignmentsCount(pending);
        setSubmittedAssignmentsCount(submitted);

        assigns.forEach((a: any) => {
          feed.push({
            id: a.id || a._id,
            kind: 'Assignment',
            title: a.title,
            subject: a.course?.subject || '',
            teacher: a.teacher
              ? `${a.teacher.firstName} ${a.teacher.lastName}`
              : '',
            dueDate: a.dueDate,
            date: a.createdAt
          });
        });
      }

      if (examsRes.status === 'fulfilled') {
        const exams = (examsRes.value.data as any)?.exams || [];
        setQuizzesCount(exams.length);
        setCompletedQuizzesCount(
          exams.filter((e: any) => e.results && e.results.length > 0).length
        );
        exams.forEach((ex: any) => {
          feed.push({
            id: ex.id || ex._id,
            kind: 'Quiz',
            title: ex.title,
            subject: ex.course?.subject || '',
            teacher: ex.teacher
              ? `${ex.teacher.firstName} ${ex.teacher.lastName}`
              : '',
            date: ex.createdAt
          });
        });
      }

      feed.sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
      setRecentStreamItems(feed.slice(0, 6));
    } catch (err) {
      console.error('Failed to load student overview:', err);
    }
  }, []);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  useEffect(() => {
    if (!socket) return;
    const handleRealtimeUpdate = () => {
      loadOverviewData();
    };
    socket.on('notification', handleRealtimeUpdate);
    return () => {
      socket.off('notification', handleRealtimeUpdate);
    };
  }, [socket, loadOverviewData]);

  const subjects = [
    {
      subject: SUBJECTS[0] as string, // Mathematics
      progress: 75,
      totalModules: 12,
      completedModules: 9,
      nextClass: 'Monday, 2:00 PM',
      color: 'bg-[#134E4A]'
    },
    {
      subject: SUBJECTS[1] as string, // English
      progress: 60,
      totalModules: 10,
      completedModules: 6,
      nextClass: 'Tuesday, 10:00 AM',
      color: 'bg-[#C85A28]'
    },
    {
      subject: SUBJECTS[2] as string, // Kiswahili
      progress: 85,
      totalModules: 8,
      completedModules: 7,
      nextClass: 'Wednesday, 1:00 PM',
      color: 'bg-[#1E7A50]'
    }
  ];

  const stats = [
    {
      label: 'Study Notes & Videos',
      value: String(materialsCount),
      icon: <BookOpenIcon className="w-6 h-6" />,
      color: 'bg-[#134E4A]'
    },
    {
      label: 'Assignments Due',
      value: String(pendingAssignmentsCount),
      icon: <CalendarIcon className="w-6 h-6" />,
      color: 'bg-[#C85A28]'
    },
    {
      label: 'Class Quizzes',
      value: String(quizzesCount),
      icon: <TrophyIcon className="w-6 h-6" />,
      color: 'bg-[#D97706]'
    },
    {
      label: 'Average Score',
      value: '87%',
      icon: <StarIcon className="w-6 h-6" />,
      color: 'bg-[#1E7A50]'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-1 text-[#16211E]">
            Welcome back, {userName}!
          </h1>
          <p className="text-[#5C6663]">
            Ready to continue your learning journey?
          </p>
        </div>
        {studentStreamLabel && (
          <span className="inline-flex items-center self-start px-4 py-1.5 rounded-full text-xs font-semibold bg-[#134E4A] text-white shadow-sm">
            Class Stream: {studentStreamLabel}
          </span>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white mb-3 shadow-sm`}
              >
                {stat.icon}
              </div>
              <p className="text-sm text-[#5C6663] mb-1">{stat.label}</p>
              <p className="font-poppins font-bold text-2xl text-[#16211E]">
                {stat.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Latest Teacher Content for this Stream */}
      {recentStreamItems.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-poppins font-bold text-xl text-[#16211E]">
              Latest Posted for {studentStreamLabel || 'Your Stream'}
            </h2>
            <span className="text-xs font-semibold text-[#134E4A] bg-[#E8F1EF] px-3 py-1 rounded-full">
              Live Stream Feed
            </span>
          </div>
          <div className="divide-y divide-[#E5E0D5]">
            {recentStreamItems.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                      item.kind === 'Assignment'
                        ? 'bg-[#C85A28]'
                        : item.kind === 'Quiz'
                        ? 'bg-[#1E7A50]'
                        : 'bg-[#134E4A]'
                    }`}
                  >
                    {item.kind === 'Quiz' ? (
                      <ClipboardListIcon className="w-5 h-5" />
                    ) : (
                      <FileTextIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#16211E]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#5C6663]">
                      <span className="font-semibold text-[#134E4A]">
                        {item.kind}
                      </span>
                      {item.subject ? ` • ${item.subject}` : ''}
                      {item.teacher ? ` • By ${item.teacher}` : ''}
                      {item.dueDate
                        ? ` • Due ${new Date(item.dueDate).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#8A9490] whitespace-nowrap">
                  {item.date ? new Date(item.date).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quote Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <QuoteCard />
      </motion.div>

      {/* Enrolled Subjects */}
      <div>
        <h2 className="font-poppins font-bold text-2xl mb-6 text-[#16211E]">
          Your Subjects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <SubjectCard {...subject} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-4 text-[#16211E]">
            Overall Progress
          </h3>
          <div className="space-y-4">
            <ProgressBar
              progress={73}
              label="Total Course Completion"
              color="bg-[#134E4A]"
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-[#F4F1EA] border border-[#E5E0D5] rounded-xl">
                <p className="text-2xl font-bold text-[#134E4A]">
                  {completedQuizzesCount}
                </p>
                <p className="text-sm text-[#5C6663]">Quizzes Completed</p>
              </div>
              <div className="text-center p-4 bg-[#F3E8DF] border border-[#E8D5C4] rounded-xl">
                <p className="text-2xl font-bold text-[#C85A28]">
                  {submittedAssignmentsCount}
                </p>
                <p className="text-sm text-[#5C6663]">Assignments Submitted</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
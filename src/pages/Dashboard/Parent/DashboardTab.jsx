import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  TrendingUpIcon,
  ClockIcon,
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  BellIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClipboardListIcon
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import {
  parentAPI,
  assignmentAPI,
  examAPI,
  courseAPI
} from '../../../services/api';

export function DashboardTab() {
  const { user } = useAuth();
  const { socket, notifications } = useSocket();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Parent';

  const [children, setChildren] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadParentData = useCallback(async () => {
    try {
      setLoading(true);
      const [childRes, assignRes, examRes, matRes] = await Promise.allSettled([
        parentAPI.getChildren(),
        assignmentAPI.getAssignments({ limit: 30 }),
        examAPI.getExams({ limit: 30 }),
        courseAPI.getMaterials()
      ]);

      if (childRes.status === 'fulfilled') {
        const list = Array.isArray(childRes.value.data)
          ? childRes.value.data
          : [];
        setChildren(list);
      }
      if (assignRes.status === 'fulfilled') {
        setAssignments(assignRes.value.data?.assignments || []);
      }
      if (examRes.status === 'fulfilled') {
        setQuizzes(examRes.value.data?.exams || []);
      }
      if (matRes.status === 'fulfilled') {
        setMaterials(matRes.value.data?.materials || []);
      }
    } catch (err) {
      console.error('Failed to load parent dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParentData();
  }, [loadParentData]);

  useEffect(() => {
    if (!socket) return;
    const handleRealtime = () => {
      loadParentData();
    };
    socket.on('notification', handleRealtime);
    return () => {
      socket.off('notification', handleRealtime);
    };
  }, [socket, loadParentData]);

  const activeChild = children[0] || {
    name: 'John Doe',
    classLabel: 'Form 3 Blue',
    admissionNumber: 'ADM-2026-001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe'
  };

  const pendingAssignments = assignments.filter(
    (a) => !a.submissions || a.submissions.length === 0
  );
  const completedAssignments = assignments.filter(
    (a) => a.submissions && a.submissions.length > 0
  );
  const completedQuizzes = quizzes.filter(
    (q) => q.results && q.results.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-[#16211E] mb-1">
            Welcome back, {userName}!
          </h1>
          <p className="text-[#5C6663]">
            Live academic updates and assignment alerts for {activeChild.name} ({activeChild.classLabel || 'Form 3 Blue'})
          </p>
        </div>
        <span className="inline-flex items-center self-start px-4 py-1.5 rounded-full text-xs font-semibold bg-[#134E4A] text-white shadow-sm">
          Child Stream: {activeChild.classLabel || 'Form 3 Blue'}
        </span>
      </div>

      {/* Child Progress Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E5E0D5] shadow-sm p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={activeChild.avatar}
              alt={activeChild.name}
              className="w-16 h-16 rounded-full border-2 border-[#134E4A] bg-[#EFECE4]"
            />
            <div>
              <h3 className="font-poppins text-xl font-bold text-[#16211E]">
                {activeChild.name}
              </h3>
              <p className="text-sm font-medium text-[#134E4A]">
                {activeChild.classLabel || 'Form 3 Blue'}
                {activeChild.admissionNumber
                  ? ` • Adm: ${activeChild.admissionNumber}`
                  : ''}
              </p>
              <p className="text-xs text-[#5C6663] mt-0.5">
                {materials.length} study notes/videos • {assignments.length} assignments • {quizzes.length} quizzes posted to stream
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-[#1E7A50]">
                {completedAssignments.length}/{assignments.length || 0}
              </p>
              <p className="text-xs text-[#5C6663]">Assignments Submitted</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-11 h-11 rounded-xl bg-[#134E4A] text-white flex items-center justify-center mx-auto mb-3">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#5C6663] text-sm">Stream Notes & Videos</h4>
          <p className="text-2xl font-bold text-[#16211E] mt-1">{materials.length}</p>
          <p className="text-xs text-[#8A9490]">shared by teachers</p>
        </Card>

        <Card className="text-center">
          <div className="w-11 h-11 rounded-xl bg-[#C85A28] text-white flex items-center justify-center mx-auto mb-3">
            <FileTextIcon className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#5C6663] text-sm">Pending Assignments</h4>
          <p className="text-2xl font-bold text-[#C85A28] mt-1">
            {pendingAssignments.length}
          </p>
          <p className="text-xs text-[#8A9490]">assigned to stream</p>
        </Card>

        <Card className="text-center">
          <div className="w-11 h-11 rounded-xl bg-[#1E7A50] text-white flex items-center justify-center mx-auto mb-3">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#5C6663] text-sm">Completed Work</h4>
          <p className="text-2xl font-bold text-[#1E7A50] mt-1">
            {completedAssignments.length + completedQuizzes.length}
          </p>
          <p className="text-xs text-[#8A9490]">assignments & quizzes</p>
        </Card>

        <Card className="text-center">
          <div className="w-11 h-11 rounded-xl bg-[#D97706] text-white flex items-center justify-center mx-auto mb-3">
            <ClipboardListIcon className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#5C6663] text-sm">Stream Quizzes</h4>
          <p className="text-2xl font-bold text-[#16211E] mt-1">{quizzes.length}</p>
          <p className="text-xs text-[#8A9490]">posted for class</p>
        </Card>
      </div>

      {/* Assignments Given to Child's Stream */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-poppins text-lg font-bold text-[#16211E]">
              Assignments Given to {activeChild.name}&apos;s Stream
            </h3>
            <p className="text-xs text-[#5C6663]">
              Whenever a teacher posts an assignment for {activeChild.classLabel || 'your child\'s stream'}, you are alerted here and via notifications
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F3E8DF] text-[#C85A28]">
            {assignments.length} total
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-[#5C6663] py-4">Loading stream assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-[#5C6663] py-4">
            No assignments have been posted for this stream yet.
          </p>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const sub = assignment.submissions?.[0];
              const isOverdue =
                !sub &&
                assignment.dueDate &&
                new Date(assignment.dueDate) < new Date();
              return (
                <div
                  key={assignment.id || assignment._id}
                  className="p-4 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#16211E]">
                        {assignment.title}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F1EF] text-[#134E4A]">
                        {assignment.course?.subject || 'Subject'}
                      </span>
                      {sub ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E9F5EE] text-[#1E7A50]">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          <span>
                            {sub.status === 'graded'
                              ? `Graded: ${sub.marks}/${assignment.totalMarks || 100}`
                              : 'Submitted by Student'}
                          </span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F3E8DF] text-[#C85A28]">
                          <AlertCircleIcon className="w-3.5 h-3.5" />
                          <span>Overdue — Not Yet Submitted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>Pending Submission</span>
                        </span>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="text-xs text-[#3B4744]">
                        {assignment.description}
                      </p>
                    )}
                    <p className="text-xs text-[#5C6663]">
                      {assignment.teacher
                        ? `Teacher: ${assignment.teacher.firstName} ${assignment.teacher.lastName} • `
                        : ''}
                      Due:{' '}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : 'N/A'}{' '}
                      • Marks: {assignment.totalMarks || 100}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Live Parent Alerts & Notifications Widget */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <BellIcon className="w-5 h-5 text-[#C85A28]" />
          <h4 className="font-poppins font-bold text-lg text-[#16211E]">
            Recent Parent Alerts & Notifications
          </h4>
        </div>
        {notifications && notifications.length > 0 ? (
          <div className="space-y-2.5">
            {notifications.slice(0, 6).map((notif, idx) => (
              <div
                key={notif.id || notif._id || idx}
                className="flex items-start space-x-3 p-3.5 bg-[#F8F6F1] border border-[#E5E0D5] rounded-xl"
              >
                <div className="w-2.5 h-2.5 mt-1.5 bg-[#C85A28] rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#16211E]">
                    {notif.title}
                  </p>
                  <p className="text-xs text-[#3B4744] mt-0.5">{notif.message}</p>
                </div>
                <span className="text-[11px] text-[#8A9490]">
                  {notif.createdAt
                    ? new Date(notif.createdAt).toLocaleDateString()
                    : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#5C6663]">
            No alerts yet. You will receive an instant alert whenever a teacher posts an assignment or quiz for your child&apos;s stream.
          </p>
        )}
      </Card>
    </div>
  );
}

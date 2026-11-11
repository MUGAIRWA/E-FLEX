import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  FileTextIcon,
  VideoIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  SendIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { courseAPI, examAPI, notificationAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
// @ts-ignore: third-party JS module without type declarations
import { SUBJECTS } from '../../../constants/subjects';

export function ModulesTab() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const subjects: string[] = SUBJECTS as string[];
  const [teacherMaterials, setTeacherMaterials] = useState<any[]>([]);
  const [teacherQuizzes, setTeacherQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [helpTarget, setHelpTarget] = useState<{
    subject: string;
    topic: string;
  } | null>(null);
  const [helpDetails, setHelpDetails] = useState('');
  const [helpUrgency, setHelpUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [sendingHelp, setSendingHelp] = useState(false);
  const [helpToast, setHelpToast] = useState('');

  const formatClassLabel = (cls?: string, stream?: string) => {
    const prettyClass = cls ? cls.replace(/^form(\d)$/i, 'Form $1') : '';
    return [prettyClass, stream].filter(Boolean).join(' ').trim();
  };

  const loadStreamResources = useCallback(async () => {
    try {
      const [matsRes, examsRes] = await Promise.allSettled([
        courseAPI.getMaterials(),
        examAPI.getExams({ limit: 50 })
      ]);
      if (matsRes.status === 'fulfilled') {
        setTeacherMaterials(matsRes.value.data?.materials || []);
      }
      if (examsRes.status === 'fulfilled') {
        setTeacherQuizzes((examsRes.value.data as any)?.exams || []);
      }
    } catch (err) {
      console.error('Failed to load teacher resources:', err);
    }
  }, []);

  useEffect(() => {
    loadStreamResources();
  }, [loadStreamResources]);

  useEffect(() => {
    if (!socket) return;
    const handleRealtimeUpdate = () => {
      loadStreamResources();
    };
    socket.on('notification', handleRealtimeUpdate);
    return () => {
      socket.off('notification', handleRealtimeUpdate);
    };
  }, [socket, loadStreamResources]);

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    try {
      const qList = Array.isArray(activeQuiz.questions) ? activeQuiz.questions : [];
      const formattedAnswers = qList.map((_: any, idx: number) => ({
        questionIndex: idx,
        answer: quizAnswers[idx] || ''
      }));

      const res = await examAPI.submitExamResult(activeQuiz.id || activeQuiz._id, {
        answers: formattedAnswers
      });
      const result = (res.data as any)?.result;
      setActiveQuiz(null);
      setQuizAnswers({});
      setHelpToast(
        result
          ? `Quiz submitted! You scored ${result.marks}/${activeQuiz.totalMarks} (${result.percentage}% — Grade ${result.grade}).`
          : 'Quiz submitted! Your teacher and parent have been notified.'
      );
      loadStreamResources();
      setTimeout(() => setHelpToast(''), 5000);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setHelpToast(err.response?.data?.message || 'Failed to submit quiz.');
      setTimeout(() => setHelpToast(''), 4000);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSendHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpTarget || !helpDetails.trim()) return;
    setSendingHelp(true);
    try {
      await notificationAPI.createHelpRequest({
        subject: helpTarget.subject,
        topic: helpTarget.topic,
        urgency: helpUrgency,
        details: helpDetails.trim()
      });
      setHelpTarget(null);
      setHelpDetails('');
      setHelpToast('Your teacher has been notified that you need help in this area!');
      setTimeout(() => setHelpToast(''), 3500);
    } catch (err) {
      console.error('Failed to send help request:', err);
    } finally {
      setSendingHelp(false);
    }
  };

  const modules = [
    {
      week: 1,
      title: 'Introduction to Algebra',
      status: 'completed',
      quizScore: 85,
      topics: ['Variables and Expressions', 'Linear Equations', 'Practice Problems']
    },
    {
      week: 2,
      title: 'Quadratic Equations',
      status: 'completed',
      quizScore: 92,
      topics: ['Standard Form', 'Factoring', 'Quadratic Formula']
    },
    {
      week: 3,
      title: 'Functions and Graphs',
      status: 'current',
      quizScore: null,
      topics: ['Function Notation', 'Graphing Techniques', 'Domain and Range']
    },
    {
      week: 4,
      title: 'Polynomials',
      status: 'locked',
      quizScore: null,
      topics: ['Polynomial Operations', 'Factoring Polynomials', 'Remainder Theorem']
    },
    {
      week: 5,
      title: 'Rational Expressions',
      status: 'locked',
      quizScore: null,
      topics: ['Simplifying Rationals', 'Operations', 'Complex Fractions']
    }
  ];

  const subjectMaterials = teacherMaterials.filter(
    (m) =>
      selectedSubject === 'ALL' ||
      !m.subject ||
      m.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const subjectQuizzes = teacherQuizzes.filter(
    (q) =>
      selectedSubject === 'ALL' ||
      !q.course?.subject ||
      q.course.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const studentStreamLabel = formatClassLabel(
    (user as any)?.class,
    (user as any)?.stream
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-[#1E7A50]" />;
      case 'current':
        return <PlayCircleIcon className="w-6 h-6 text-[#C85A28]" />;
      case 'locked':
        return <LockIcon className="w-6 h-6 text-[#8A9490]" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#1E7A50]';
      case 'current':
        return 'bg-[#134E4A]';
      case 'locked':
        return 'bg-[#8A9490]';
      default:
        return 'bg-[#8A9490]';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins font-bold text-3xl mb-1 text-[#16211E]">
            Stream Notes, Quizzes & Weekly Modules
          </h1>
          <p className="text-[#5C6663]">
            Access study notes, videos, and quizzes posted by your teachers for your class stream
          </p>
        </div>
        {studentStreamLabel && (
          <span className="inline-flex items-center self-start px-4 py-1.5 rounded-full text-xs font-semibold bg-[#134E4A] text-white shadow-sm">
            Stream: {studentStreamLabel}
          </span>
        )}
      </div>

      {helpToast && (
        <div className="p-4 rounded-xl bg-[#E9F5EE] border border-[#BFE3CE] text-[#1E7A50] text-sm font-medium flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>{helpToast}</span>
        </div>
      )}

      {/* Subject Selector */}
      <div className="flex flex-wrap gap-2.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedSubject('ALL')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            selectedSubject === 'ALL'
              ? 'bg-[#134E4A] text-white shadow-sm'
              : 'bg-white text-[#3B4744] border border-[#E5E0D5] hover:border-[#134E4A] hover:bg-[#F4F1EA]'
          }`}
        >
          All Subjects
        </motion.button>
        {subjects.slice(0, 8).map((subject: string) => (
          <motion.button
            key={subject}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSubject(subject)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              selectedSubject === subject
                ? 'bg-[#134E4A] text-white shadow-sm'
                : 'bg-white text-[#3B4744] border border-[#E5E0D5] hover:border-[#134E4A] hover:bg-[#F4F1EA]'
            }`}
          >
            {subject}
          </motion.button>
        ))}
      </div>

      {/* Teacher Uploaded Notes & Videos for this Stream */}
      {subjectMaterials.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-xl text-[#16211E]">
            Teacher Notes & Videos{' '}
            {selectedSubject !== 'ALL' ? `(${selectedSubject})` : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectMaterials.map((mat) => {
              const streamTag = formatClassLabel(mat.class, mat.stream);
              return (
                <Card key={mat.id} className="flex flex-col justify-between space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 rounded-xl bg-[#E8F1EF] text-[#134E4A]">
                      {mat.type === 'video' ? (
                        <VideoIcon className="w-6 h-6" />
                      ) : (
                        <FileTextIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#16211E]">{mat.title}</h3>
                        {mat.subject && (
                          <span className="text-[11px] font-semibold bg-[#E8F1EF] text-[#134E4A] px-2.5 py-0.5 rounded-full">
                            {mat.subject}
                          </span>
                        )}
                        {streamTag && (
                          <span className="text-[11px] font-medium bg-[#F4F1EA] border border-[#E5E0D5] text-[#3B4744] px-2.5 py-0.5 rounded-full">
                            {streamTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5C6663]">
                        {mat.teacherName ? `By ${mat.teacherName} • ` : ''}
                        {mat.uploadedAt
                          ? new Date(mat.uploadedAt).toLocaleDateString()
                          : ''}
                      </p>
                      {mat.description && (
                        <p className="text-sm text-[#3B4744] mt-2 whitespace-pre-wrap">
                          {mat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D5]">
                    {mat.url ? (
                      <a
                        href={
                          mat.url.startsWith('http')
                            ? mat.url
                            : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''}${mat.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-sm font-semibold text-[#134E4A] hover:underline"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        <span>Open {mat.type === 'video' ? 'Video' : 'Notes'}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-[#8A9490]">Study Notes</span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setHelpTarget({
                          subject: mat.subject || selectedSubject,
                          topic: mat.title
                        })
                      }
                    >
                      <HelpCircleIcon className="w-4 h-4 mr-1" />
                      Need Help?
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Posted Quizzes & Assessments */}
      {subjectQuizzes.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-xl text-[#16211E]">
            Class Quizzes & Assessments{' '}
            {selectedSubject !== 'ALL' ? `(${selectedSubject})` : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectQuizzes.map((quiz) => {
              const qId = quiz.id || quiz._id;
              const myResult = quiz.results?.[0];
              const streamTag = formatClassLabel(
                quiz.course?.class,
                quiz.course?.stream
              );
              const qCount = Array.isArray(quiz.questions)
                ? quiz.questions.length
                : 0;
              const attUrl = quiz.attachments?.[0]?.url;

              return (
                <Card key={qId} className="flex flex-col justify-between space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 rounded-xl bg-[#F3E8DF] text-[#C85A28]">
                      <ClipboardListIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#16211E]">{quiz.title}</h3>
                        {quiz.course?.subject && (
                          <span className="text-[11px] font-semibold bg-[#E8F1EF] text-[#134E4A] px-2.5 py-0.5 rounded-full">
                            {quiz.course.subject}
                          </span>
                        )}
                        {streamTag && (
                          <span className="text-[11px] font-medium bg-[#F4F1EA] border border-[#E5E0D5] text-[#3B4744] px-2.5 py-0.5 rounded-full">
                            {streamTag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5C6663]">
                        {quiz.teacher
                          ? `By ${quiz.teacher.firstName} ${quiz.teacher.lastName} • `
                          : ''}
                        {quiz.duration ? `${quiz.duration} mins • ` : ''}
                        {quiz.totalMarks || 100} marks
                      </p>
                      {quiz.description && (
                        <p className="text-sm text-[#3B4744] mt-2 whitespace-pre-wrap">
                          {quiz.description}
                        </p>
                      )}
                      {myResult && (
                        <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E9F5EE] text-[#1E7A50] text-xs font-bold">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>
                            Score: {myResult.marks}/{quiz.totalMarks} (
                            {myResult.percentage}% — Grade {myResult.grade})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E0D5]">
                    {attUrl ? (
                      <a
                        href={
                          attUrl.startsWith('http')
                            ? attUrl
                            : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''}${attUrl}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-sm font-semibold text-[#134E4A] hover:underline"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        <span>Download Quiz Paper</span>
                      </a>
                    ) : (
                      <span className="text-xs text-[#5C6663]">
                        {qCount > 0 ? `${qCount} question(s)` : 'Assessment'}
                      </span>
                    )}

                    {!myResult && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveQuiz(quiz);
                          setQuizAnswers({});
                        }}
                      >
                        Take Quiz
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((module, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={module.status === 'locked' ? 'opacity-65' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`w-16 h-16 rounded-xl ${getStatusColor(
                      module.status
                    )} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
                  >
                    <span className="font-bold text-xl">W{module.week}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-poppins font-bold text-xl text-[#16211E]">
                        {module.title}
                      </h3>
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {module.topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#F4F1EA] border border-[#E5E0D5] text-[#3B4744] font-medium px-3 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    {module.status === 'completed' && module.quizScore && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-[#5C6663]">Quiz Score:</span>
                        <span className="font-bold text-[#1E7A50]">
                          {module.quizScore}%
                        </span>
                      </div>
                    )}
                    {module.status === 'current' && (
                      <div className="flex items-center space-x-2 text-sm text-[#C85A28]">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-semibold">In Progress</span>
                      </div>
                    )}
                    {module.status === 'locked' && (
                      <p className="text-sm text-[#5C6663]">
                        Complete Week {module.week - 1} quiz to unlock
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {module.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  )}
                  {module.status === 'current' && (
                    <>
                      <Button variant="primary" size="sm">
                        Continue
                      </Button>
                      <Button variant="outline" size="sm">
                        Take Quiz
                      </Button>
                    </>
                  )}
                  {module.status !== 'locked' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setHelpTarget({
                          subject: selectedSubject,
                          topic: module.title
                        })
                      }
                    >
                      <HelpCircleIcon className="w-4 h-4 mr-1" />
                      Need Help?
                    </Button>
                  )}
                  {module.status === 'locked' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-50 cursor-not-allowed"
                    >
                      Locked
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Interactive Take Quiz Modal */}
      {activeQuiz && (
        <div
          className="fixed inset-0 bg-[#16211E]/50 flex items-center justify-center z-50 p-4"
          onClick={() => setActiveQuiz(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E0D5] max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <div>
                <h3 className="font-poppins text-xl font-bold text-[#16211E]">
                  {activeQuiz.title}
                </h3>
                <p className="text-xs text-[#5C6663]">
                  {activeQuiz.course?.subject || 'Quiz'} • {activeQuiz.duration || 30} mins •{' '}
                  {activeQuiz.totalMarks || 100} marks
                </p>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-[#5C6663] hover:text-[#16211E] text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitQuiz} className="space-y-5">
              {Array.isArray(activeQuiz.questions) && activeQuiz.questions.length > 0 ? (
                activeQuiz.questions.map((q: any, qIdx: number) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] space-y-3"
                  >
                    <p className="font-semibold text-sm text-[#16211E]">
                      {qIdx + 1}. {q.question}{' '}
                      <span className="text-xs text-[#5C6663] font-normal">
                        ({q.marks || 5} marks)
                      </span>
                    </p>
                    {Array.isArray(q.options) && q.options.length > 0 ? (
                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <label
                            key={optIdx}
                            className={`flex items-center space-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              quizAnswers[qIdx] === opt
                                ? 'bg-[#E8F1EF] border-[#134E4A] text-[#134E4A] font-medium'
                                : 'bg-white border-[#E5E0D5] text-[#3B4744]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${qIdx}`}
                              value={opt}
                              checked={quizAnswers[qIdx] === opt}
                              onChange={() =>
                                setQuizAnswers((prev) => ({ ...prev, [qIdx]: opt }))
                              }
                              className="accent-[#134E4A]"
                              required
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={quizAnswers[qIdx] || ''}
                        onChange={(e) =>
                          setQuizAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))
                        }
                        placeholder="Type your answer..."
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E0D5] bg-white focus:border-[#134E4A] focus:outline-none"
                        required
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#3B4744]">
                  {activeQuiz.instructions ||
                    activeQuiz.description ||
                    'Review the attached quiz document and click submit when completed.'}
                </p>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveQuiz(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submittingQuiz}>
                  {submittingQuiz ? 'Submitting Quiz...' : 'Submit Quiz'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Help Modal */}
      {helpTarget && (
        <div
          className="fixed inset-0 bg-[#16211E]/50 flex items-center justify-center z-50 p-4"
          onClick={() => setHelpTarget(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E0D5] max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#16211E]">
                Ask Teacher for Help
              </h3>
              <button
                onClick={() => setHelpTarget(null)}
                className="text-[#5C6663] hover:text-[#16211E] text-sm font-medium"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[#5C6663]">
              Subject: <span className="font-semibold text-[#16211E]">{helpTarget.subject}</span> • Topic:{' '}
              <span className="font-semibold text-[#16211E]">{helpTarget.topic}</span>
            </p>
            <form onSubmit={handleSendHelpRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#3B4744] mb-1">
                  Urgency
                </label>
                <select
                  value={helpUrgency}
                  onChange={(e) => setHelpUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#3B4744] mb-1">
                  What do you need help with in this topic? *
                </label>
                <textarea
                  rows={3}
                  value={helpDetails}
                  onChange={(e) => setHelpDetails(e.target.value)}
                  placeholder="Describe what part of this topic you are struggling with..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E0D5] bg-[#F8F6F1] focus:bg-white focus:border-[#134E4A] focus:outline-none resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={sendingHelp}
              >
                <SendIcon className="w-4 h-4 mr-1.5" />
                {sendingHelp ? 'Notifying Teacher...' : 'Notify Teacher'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  ClockIcon,
  HelpCircleIcon,
  FileTextIcon,
  VideoIcon,
  ExternalLinkIcon,
  SendIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { courseAPI, notificationAPI } from '../../../services/api';
// @ts-ignore: third-party JS module without type declarations
import { SUBJECTS } from '../../../constants/subjects';

export function ModulesTab() {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    SUBJECTS[0] as string
  );
  const subjects: string[] = SUBJECTS as string[];
  const [teacherMaterials, setTeacherMaterials] = useState<any[]>([]);
  const [helpTarget, setHelpTarget] = useState<{
    subject: string;
    topic: string;
  } | null>(null);
  const [helpDetails, setHelpDetails] = useState('');
  const [helpUrgency, setHelpUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [sendingHelp, setSendingHelp] = useState(false);
  const [helpToast, setHelpToast] = useState('');

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const res = await courseAPI.getMaterials();
        setTeacherMaterials(res.data?.materials || []);
      } catch (err) {
        console.error('Failed to load teacher materials:', err);
      }
    };
    loadMaterials();
  }, []);

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
    (m) => !m.subject || m.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-success" />;
      case 'current':
        return <PlayCircleIcon className="w-6 h-6 text-primary" />;
      case 'locked':
        return <LockIcon className="w-6 h-6 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-success to-green-400';
      case 'current':
        return 'from-primary to-blue-400';
      case 'locked':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Weekly Modules & Teacher Resources
        </h1>
        <p className="text-gray-600">
          Access notes and videos uploaded by your teachers or request help on any topic
        </p>
      </div>

      {helpToast && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>{helpToast}</span>
        </div>
      )}

      {/* Subject Selector */}
      <div className="flex flex-wrap gap-3">
        {subjects.slice(0, 8).map((subject: string) => (
          <motion.button
            key={subject}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedSubject(subject)}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              selectedSubject === subject
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
            }`}
          >
            {subject}
          </motion.button>
        ))}
      </div>

      {/* Teacher Uploaded Notes & Videos for this Subject */}
      {subjectMaterials.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-xl text-gray-800">
            Teacher Notes & Videos ({selectedSubject})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectMaterials.map((mat) => (
              <Card key={mat.id} className="flex flex-col justify-between space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {mat.type === 'video' ? (
                      <VideoIcon className="w-6 h-6" />
                    ) : (
                      <FileTextIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{mat.title}</h3>
                    <p className="text-xs text-gray-500">
                      {mat.teacherName ? `By ${mat.teacherName} • ` : ''}
                      {mat.uploadedAt
                        ? new Date(mat.uploadedAt).toLocaleDateString()
                        : ''}
                    </p>
                    {mat.description && (
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                        {mat.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {mat.url ? (
                    <a
                      href={
                        mat.url.startsWith('http')
                          ? mat.url
                          : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''}${mat.url}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      <span>Open {mat.type === 'video' ? 'Video' : 'Notes'}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Study Notes</span>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setHelpTarget({ subject: selectedSubject, topic: mat.title })
                    }
                  >
                    <HelpCircleIcon className="w-4 h-4 mr-1" />
                    Need Help?
                  </Button>
                </div>
              </Card>
            ))}
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
            <Card className={module.status === 'locked' ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getStatusColor(
                      module.status
                    )} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    <span className="font-bold text-xl">W{module.week}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-poppins font-bold text-xl text-gray-800">
                        {module.title}
                      </h3>
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {module.topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    {module.status === 'completed' && module.quizScore && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-600">Quiz Score:</span>
                        <span className="font-bold text-success">
                          {module.quizScore}%
                        </span>
                      </div>
                    )}
                    {module.status === 'current' && (
                      <div className="flex items-center space-x-2 text-sm text-primary">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-medium">In Progress</span>
                      </div>
                    )}
                    {module.status === 'locked' && (
                      <p className="text-sm text-gray-500">
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

      {/* Quick Help Modal */}
      {helpTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setHelpTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Ask Teacher for Help
              </h3>
              <button
                onClick={() => setHelpTarget(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Subject: <span className="font-semibold">{helpTarget.subject}</span> • Topic:{' '}
              <span className="font-semibold">{helpTarget.topic}</span>
            </p>
            <form onSubmit={handleSendHelpRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Urgency
                </label>
                <select
                  value={helpUrgency}
                  onChange={(e) => setHelpUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  What do you need help with in this topic? *
                </label>
                <textarea
                  rows={3}
                  value={helpDetails}
                  onChange={(e) => setHelpDetails(e.target.value)}
                  placeholder="Describe what part of this topic you are struggling with..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:outline-none resize-none"
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

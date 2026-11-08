import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UploadIcon,
  FileTextIcon,
  VideoIcon,
  FileIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  PlusIcon,
  Trash2Icon,
  ExternalLinkIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { courseAPI, assignmentAPI, examAPI } from '../../../services/api';
// @ts-ignore
import { SUBJECTS, STREAMS } from '../../../constants/subjects';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  type: 'multiple-choice' | 'short-answer';
}

export function ContentUploadTab() {
  const { user } = useAuth();
  const [selectedContentType, setSelectedContentType] = useState<string>('notes');

  const availableSubjects: string[] =
    user?.subjects && user.subjects.length > 0 ? user.subjects : SUBJECTS;

  const availableClasses: { label: string; className: string; stream: string }[] =
    user?.classesTaught && user.classesTaught.length > 0
      ? user.classesTaught.map((c: any, idx: number) => {
          if (typeof c === 'string') {
            const str = user?.streamsTaught?.[idx] || '';
            return {
              label: `${c} ${str}`.trim(),
              className: c,
              stream: str
            };
          }
          return {
            label: `${c.class} ${c.stream || ''}`.trim(),
            className: c.class,
            stream: c.stream || ''
          };
        })
      : ['form1', 'form2', 'form3', 'form4'].flatMap((cls) =>
          (STREAMS || ['Blue', 'Green']).slice(0, 2).map((str: string) => ({
            label: `${cls} ${str}`,
            className: cls,
            stream: str
          }))
        );

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(availableSubjects[0] || 'Mathematics');
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [duration, setDuration] = useState('30');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 5,
      type: 'multiple-choice'
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const contentTypes = [
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileTextIcon className="w-6 h-6" />,
      color: 'from-primary to-blue-400'
    },
    {
      id: 'video',
      label: 'Video',
      icon: <VideoIcon className="w-6 h-6" />,
      color: 'from-accent to-purple-400'
    },
    {
      id: 'assignment',
      label: 'Assignment',
      icon: <FileIcon className="w-6 h-6" />,
      color: 'from-warning to-red-400'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: <ClipboardListIcon className="w-6 h-6" />,
      color: 'from-success to-green-400'
    }
  ];

  const fetchRecentUploads = useCallback(async () => {
    try {
      setLoadingUploads(true);
      const [matsRes, assignRes, examsRes] = await Promise.allSettled([
        courseAPI.getMaterials(),
        assignmentAPI.getAssignments({ limit: 10 }),
        examAPI.getExams({ limit: 10 })
      ]);

      const items: any[] = [];

      if (matsRes.status === 'fulfilled') {
        const mats = matsRes.value.data?.materials || [];
        mats.forEach((m: any) => {
          items.push({
            id: m.id,
            title: m.title,
            description: m.description,
            type: m.type === 'video' ? 'Video' : 'Notes',
            subject: m.subject,
            classLabel: `${m.class || ''} ${m.stream || ''}`.trim() || m.courseTitle,
            url: m.url,
            createdAt: m.uploadedAt
          });
        });
      }

      if (assignRes.status === 'fulfilled') {
        const assigns = (assignRes.value.data as any)?.assignments || [];
        assigns.forEach((a: any) => {
          items.push({
            id: a.id || a._id,
            kind: 'assignment',
            title: a.title,
            description: a.description,
            type: 'Assignment',
            subject: a.course?.subject || '',
            classLabel: a.course?.title || '',
            dueDate: a.dueDate,
            url: a.attachments?.[0]?.url || '',
            createdAt: a.createdAt
          });
        });
      }

      if (examsRes.status === 'fulfilled') {
        const exams = (examsRes.value.data as any)?.exams || [];
        exams.forEach((ex: any) => {
          items.push({
            id: ex.id || ex._id,
            kind: 'exam',
            title: ex.title,
            description: ex.description,
            type: 'Quiz',
            subject: ex.course?.subject || '',
            classLabel: ex.course?.title || '',
            duration: ex.duration,
            questionsCount: Array.isArray(ex.questions) ? ex.questions.length : 0,
            url: ex.attachments?.[0]?.url || '',
            createdAt: ex.createdAt
          });
        });
      }

      items.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setRecentUploads(items.slice(0, 15));
    } catch (err) {
      console.error('Failed to load recent uploads:', err);
    } finally {
      setLoadingUploads(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentUploads();
  }, [fetchRecentUploads]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContentUrl('');
    setDueDate('');
    setTotalMarks('100');
    setDuration('30');
    setUploadedFile(null);
    setError('');
    setQuestions([
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 5,
        type: 'multiple-choice'
      }
    ]);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 5,
        type: 'multiple-choice'
      }
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOpts = [...q.options];
        nextOpts[optIdx] = value;
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the content');
      return;
    }

    const chosenClass = availableClasses[selectedClassIdx] || {
      className: '',
      stream: ''
    };

    setSubmitting(true);
    setError('');

    try {
      if (selectedContentType === 'notes' || selectedContentType === 'video') {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('type', selectedContentType);
        formData.append('subject', subject);
        formData.append('class', chosenClass.className);
        formData.append('stream', chosenClass.stream);
        if (contentUrl.trim()) {
          formData.append('contentUrl', contentUrl.trim());
        }
        if (uploadedFile) {
          formData.append('file', uploadedFile);
        }

        await courseAPI.uploadMaterial(formData);
      } else if (selectedContentType === 'assignment') {
        if (!dueDate) {
          setError('Please select a due date for the assignment');
          setSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('instructions', description.trim());
        formData.append('subject', subject);
        formData.append('class', chosenClass.className);
        formData.append('stream', chosenClass.stream);
        formData.append('dueDate', dueDate);
        formData.append('totalMarks', totalMarks || '100');
        if (uploadedFile) {
          formData.append('attachments', uploadedFile);
        }

        await assignmentAPI.createAssignment(formData);
      } else if (selectedContentType === 'quiz') {
        const validQuestions = questions
          .filter((q) => q.question.trim())
          .map((q) => ({
            question: q.question.trim(),
            options: q.options.filter((o) => o.trim()),
            correctAnswer: q.correctAnswer.trim() || q.options[0] || '',
            marks: Number(q.marks) || 5,
            type: q.type
          }));

        const computedTotal =
          validQuestions.length > 0
            ? validQuestions.reduce((sum, q) => sum + q.marks, 0)
            : Number(totalMarks) || 100;

        if (uploadedFile) {
          const formData = new FormData();
          formData.append('title', title.trim());
          formData.append('description', description.trim());
          formData.append('instructions', description.trim());
          formData.append('type', 'quiz');
          formData.append('subject', subject);
          formData.append('class', chosenClass.className);
          formData.append('stream', chosenClass.stream);
          formData.append('duration', duration || '30');
          formData.append('totalMarks', String(computedTotal));
          formData.append(
            'examDate',
            dueDate || new Date(Date.now() + 7 * 86400000).toISOString()
          );
          if (validQuestions.length > 0) {
            formData.append('questions', JSON.stringify(validQuestions));
          }
          formData.append('files', uploadedFile);
          await examAPI.createExamWithFile(formData);
        } else {
          await examAPI.createExam({
            title: title.trim(),
            description: description.trim(),
            instructions: description.trim(),
            type: 'quiz',
            subject,
            class: chosenClass.className,
            stream: chosenClass.stream,
            duration: Number(duration) || 30,
            totalMarks: computedTotal,
            examDate:
              dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
            questions: validQuestions
          });
        }
      }

      setShowSuccess(true);
      resetForm();
      fetchRecentUploads();
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to upload content. Please check your inputs and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: any) => {
    try {
      if (item.kind === 'assignment') {
        await assignmentAPI.deleteAssignment(item.id);
      } else if (item.kind === 'exam') {
        await examAPI.deleteExam(item.id);
      }
      fetchRecentUploads();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-2 text-gray-800">
          Upload Content
        </h1>
        <p className="text-gray-600">
          Easily create and share notes, videos, assignments, and interactive quizzes with your students
        </p>
      </div>

      {/* Content Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contentTypes.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelectedContentType(type.id);
              setError('');
            }}
            className={`p-6 rounded-2xl transition-all ${
              selectedContentType === type.id
                ? 'bg-gradient-to-r ' + type.color + ' text-white shadow-xl'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              {type.icon}
              <span className="font-semibold">{type.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-6 text-gray-800">
            Create & Upload{' '}
            {contentTypes.find((t) => t.id === selectedContentType)?.label}
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${selectedContentType} title (e.g. Quadratic Equations Notes)`}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                >
                  {availableSubjects.map((subj: string, index: number) => (
                    <option key={index} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class / Stream
                </label>
                <select
                  value={selectedClassIdx}
                  onChange={(e) => setSelectedClassIdx(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                >
                  {availableClasses.map((item, index) => (
                    <option key={index} value={index}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedContentType === 'notes'
                  ? 'Study Notes / Summary Content'
                  : 'Description & Instructions'}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  selectedContentType === 'notes'
                    ? 'Write or paste study notes, key formulas, or summary points...'
                    : 'Add description or instructions for your students...'
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            {(selectedContentType === 'notes' || selectedContentType === 'video') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Resource / Video Link (Optional)
                </label>
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            )}

            {selectedContentType === 'assignment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {selectedContentType === 'quiz' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="30"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Until (Optional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Interactive Quiz Question Builder */}
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Quiz Questions (Optional if uploading a file)
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>

                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Question {qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(qIdx, 'question', e.target.value)
                        }
                        placeholder="Enter question prompt..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none text-sm"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              updateOption(qIdx, optIdx, e.target.value)
                            }
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none text-sm"
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(qIdx, 'correctAnswer', e.target.value)
                          }
                          placeholder="Correct answer (exact option text)"
                          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none text-sm"
                        />
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) =>
                            updateQuestion(qIdx, 'marks', Number(e.target.value))
                          }
                          placeholder="Marks (e.g. 5)"
                          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={
                    selectedContentType === 'video'
                      ? 'video/*'
                      : '.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png'
                  }
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Click to attach a file (Optional if notes/questions provided above)
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedContentType === 'video'
                        ? 'MP4, AVI, MOV (Max 50MB)'
                        : 'PDF, DOC, DOCX, PPT, TXT (Max 10MB)'}
                    </p>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center space-x-2 text-success">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {uploadedFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleUpload}
                disabled={submitting}
              >
                {submitting
                  ? 'Publishing...'
                  : `Publish ${
                      contentTypes.find((t) => t.id === selectedContentType)?.label
                    }`}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Success Toast */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 bg-success text-white px-6 py-4 rounded-xl shadow-xl flex items-center space-x-3 z-50"
        >
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">
            Content published & students notified!
          </span>
        </motion.div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {previewItem.type} • {previewItem.subject}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{previewItem.title}</h3>
            {previewItem.classLabel && (
              <p className="text-xs text-gray-500">Class: {previewItem.classLabel}</p>
            )}
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {previewItem.description || 'No additional description provided.'}
            </p>
            {previewItem.url && (
              <a
                href={
                  previewItem.url.startsWith('http')
                    ? previewItem.url
                    : `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''}${previewItem.url}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>Open Attached File / Resource</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="font-poppins font-bold text-xl mb-4 text-gray-800">
            Your Published Content
          </h3>
          {loadingUploads ? (
            <p className="text-sm text-gray-500">Loading your published content...</p>
          ) : recentUploads.length === 0 ? (
            <p className="text-sm text-gray-500">
              You haven&apos;t uploaded any content yet. Use the form above to publish notes, videos, assignments, or quizzes!
            </p>
          ) : (
            <div className="space-y-3">
              {recentUploads.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <FileTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {item.type}
                        {item.subject ? ` • ${item.subject}` : ''}
                        {item.classLabel ? ` • ${item.classLabel}` : ''}
                        {item.createdAt
                          ? ` • ${new Date(item.createdAt).toLocaleDateString()}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewItem(item)}
                    >
                      View
                    </Button>
                    {(item.kind === 'assignment' || item.kind === 'exam') && (
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

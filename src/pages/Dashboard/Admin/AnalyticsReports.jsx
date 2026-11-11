import React, { useState, useEffect } from 'react';
import { UsersIcon, BookOpenIcon, BarChart3Icon, RefreshCwIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { userAPI, assignmentAPI, examAPI } from '../../../services/api';

const formatClassStream = (cls, stream) => {
  if (!cls && !stream) return 'Unassigned';
  const norm = String(cls || '').toLowerCase().replace(/\s+/g, '');
  const match = norm.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ');
};

export function AnalyticsReports() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [studentsRes, teachersRes, parentsRes, assignmentsRes, examsRes] = await Promise.all([
        userAPI.getStudents().catch(() => ({ data: [] })),
        userAPI.getTeachers().catch(() => ({ data: [] })),
        userAPI.getParents().catch(() => ({ data: [] })),
        assignmentAPI.getAssignments({ limit: 100 }).catch(() => ({ data: { assignments: [] } })),
        examAPI.getExams({ limit: 100 }).catch(() => ({ data: { exams: [] } }))
      ]);

      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setParents(Array.isArray(parentsRes.data) ? parentsRes.data : []);
      setAssignments(
        Array.isArray(assignmentsRes.data?.assignments) ? assignmentsRes.data.assignments : []
      );
      setExams(Array.isArray(examsRes.data?.exams) ? examsRes.data.exams : []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Group students by Class & Stream
  const streamCounts = {};
  for (const s of students) {
    const label = formatClassStream(s.class, s.stream);
    streamCounts[label] = (streamCounts[label] || 0) + 1;
  }
  const streamEntries = Object.entries(streamCounts);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16211E]">Analytics & Reports</h1>
          <p className="text-sm text-[#5C6663] mt-1">
            Live enrollment, coursework, and stream distribution metrics from the database.
          </p>
        </div>
        <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
          <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-7 h-7 text-[#134E4A]" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Enrollment Breakdown</p>
              <p className="text-2xl font-bold text-[#16211E]">
                {students.length} Students • {parents.length} Parents
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="w-7 h-7 text-[#C85A28]" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Teaching Staff</p>
              <p className="text-2xl font-bold text-[#16211E]">{teachers.length} Teachers</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <BarChart3Icon className="w-7 h-7 text-[#1E7A50]" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Published Coursework</p>
              <p className="text-2xl font-bold text-[#16211E]">
                {assignments.length} Assignments • {exams.length} Quizzes
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-[#16211E] mb-4">Students by Class & Stream</h2>
        {streamEntries.length === 0 ? (
          <p className="text-sm text-[#5C6663]">No students enrolled yet.</p>
        ) : (
          <div className="space-y-3">
            {streamEntries.map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5]"
              >
                <span className="font-semibold text-[#16211E]">{label}</span>
                <span className="text-sm font-bold text-[#134E4A]">{count} student(s)</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

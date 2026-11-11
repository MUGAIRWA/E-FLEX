import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, TrashIcon, RefreshCwIcon, ExternalLinkIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { userAPI, courseAPI, assignmentAPI, examAPI } from '../../../services/api';

const formatClassStream = (cls, stream) => {
  if (!cls && !stream) return 'All Streams';
  const norm = String(cls || '').toLowerCase().replace(/\s+/g, '');
  const match = norm.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ');
};

export function ContentModeration() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [teachersRes, materialsRes, assignmentsRes, examsRes] = await Promise.all([
        userAPI.getTeachers().catch(() => ({ data: [] })),
        courseAPI.getMaterials().catch(() => ({ data: { materials: [] } })),
        assignmentAPI.getAssignments({ limit: 100 }).catch(() => ({ data: { assignments: [] } })),
        examAPI.getExams({ limit: 100 }).catch(() => ({ data: { exams: [] } }))
      ]);

      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);

      const rawMaterials = Array.isArray(materialsRes.data?.materials)
        ? materialsRes.data.materials
        : Array.isArray(materialsRes.data)
        ? materialsRes.data
        : [];
      const rawAssignments = Array.isArray(assignmentsRes.data?.assignments)
        ? assignmentsRes.data.assignments
        : [];
      const rawExams = Array.isArray(examsRes.data?.exams) ? examsRes.data.exams : [];

      const combined = [
        ...rawMaterials.map((m) => ({
          id: `mat-${m.id}`,
          rawId: m.id,
          source: 'material',
          type: m.type === 'video' ? 'Video' : 'Notes',
          title: m.title,
          uploadedBy: m.uploadedBy || 'Teacher',
          subject: m.subject || 'General',
          classStream: formatClassStream(m.class, m.stream),
          date: m.uploadedAt || m.createdAt,
          url: m.url || '',
          status: 'Published'
        })),
        ...rawAssignments.map((a) => ({
          id: `asg-${a.id}`,
          rawId: a.id,
          source: 'assignment',
          type: 'Assignment',
          title: a.title,
          uploadedBy: a.teacher
            ? `${a.teacher.firstName} ${a.teacher.lastName}`
            : 'Teacher',
          subject: a.course?.subject || a.course?.title || 'Course',
          classStream: formatClassStream(a.course?.class, a.course?.stream),
          date: a.createdAt,
          url: Array.isArray(a.attachments) && a.attachments[0]?.url ? a.attachments[0].url : '',
          status: a.isActive !== false ? 'Published' : 'Inactive'
        })),
        ...rawExams.map((ex) => ({
          id: `ex-${ex.id}`,
          rawId: ex.id,
          source: 'exam',
          type: 'Quiz',
          title: ex.title,
          uploadedBy: ex.teacher
            ? `${ex.teacher.firstName} ${ex.teacher.lastName}`
            : 'Teacher',
          subject: ex.course?.subject || ex.course?.title || 'Course',
          classStream: formatClassStream(ex.course?.class, ex.course?.stream),
          date: ex.createdAt,
          url: '',
          status: ex.isActive !== false ? 'Published' : 'Inactive'
        }))
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      setItems(combined);
    } catch (err) {
      console.error('Error loading content moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete ${item.type} "${item.title}"?`)) return;
    try {
      if (item.source === 'assignment') {
        await assignmentAPI.deleteAssignment(item.rawId);
      } else if (item.source === 'exam') {
        await examAPI.deleteExam(item.rawId);
      }
      await loadContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  };

  const filteredData = items.filter((item) => {
    const matchesType = selectedType === 'all' || item.type.toLowerCase() === selectedType;
    const matchesSubject =
      selectedSubject === 'all' || item.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesTeacher =
      selectedTeacher === 'all' ||
      item.uploadedBy.toLowerCase() === selectedTeacher.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.classStream.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSubject && matchesTeacher && matchesSearch;
  });

  const allSubjects = [...new Set(items.map((i) => i.subject).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16211E]">Content & Coursework Directory</h1>
          <p className="text-sm text-[#5C6663] mt-1">
            Review all notes, videos, assignments, and quizzes posted by teachers across streams.
          </p>
        </div>
        <Button variant="outline" onClick={loadContent} disabled={loading}>
          <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-3 h-5 w-5 text-[#5C6663]" />
            <input
              type="text"
              placeholder="Search title, teacher, or stream..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2 border border-[#D8D1C4] rounded-xl w-full"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Types</option>
            <option value="notes">Notes</option>
            <option value="video">Video</option>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Subjects</option>
            {allSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Teachers</option>
            {teachers.map((teacher) => (
              <option
                key={teacher.id || teacher._id}
                value={`${teacher.firstName} ${teacher.lastName}`}
              >
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Content Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134E4A]" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-[#5C6663]">
            No uploaded notes, assignments, or quizzes found in the database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F6F1] border-b border-[#E5E0D5]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Title
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Teacher
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Subject & Stream
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#5C6663] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EFECE4]">
                {filteredData.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#F8F6F1]/60"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-[#134E4A]/10 text-[#134E4A]">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#16211E]">
                      {item.title}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#5C6663]">
                      {item.uploadedBy}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#16211E]">
                      <div>{item.subject}</div>
                      <div className="text-xs text-[#C85A28] font-medium">{item.classStream}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-[#5C6663]">
                      {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#D8D1C4] text-[#134E4A] hover:bg-[#F8F6F1]"
                        >
                          <ExternalLinkIcon className="w-3.5 h-3.5 mr-1" />
                          Open
                        </a>
                      )}
                      {(item.source === 'assignment' || item.source === 'exam') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteItem(item)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

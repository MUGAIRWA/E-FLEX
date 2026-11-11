import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, BookOpenIcon, SearchIcon, RefreshCwIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { userAPI, courseAPI } from '../../../services/api';

const formatClassStream = (cls, stream) => {
  if (!cls && !stream) return '';
  const norm = String(cls || '').toLowerCase().replace(/\s+/g, '');
  const match = norm.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ');
};

export function TeachersOverview() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersRes, studentsRes, coursesRes] = await Promise.all([
        userAPI.getTeachers().catch(() => ({ data: [] })),
        userAPI.getStudents().catch(() => ({ data: [] })),
        courseAPI.getCourses({ limit: 100 }).catch(() => ({ data: { courses: [] } }))
      ]);

      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setCourses(
        Array.isArray(coursesRes.data?.courses)
          ? coursesRes.data.courses
          : Array.isArray(coursesRes.data)
          ? coursesRes.data
          : []
      );
    } catch (err) {
      console.error('Failed to load teachers overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrichedTeachers = teachers.map((t) => {
    const rawClasses = Array.isArray(t.classesTaught) ? t.classesTaught : [];
    const classLabels = rawClasses
      .map((item) =>
        typeof item === 'object' && item !== null
          ? formatClassStream(item.class, item.stream)
          : formatClassStream(item, '')
      )
      .filter(Boolean);

    const teacherCourses = courses.filter(
      (c) => (c.teacher?.id || c.teacher?._id || c.teacherId) === (t.id || t._id)
    );

    // Count students in any class/stream taught by this teacher
    const matchingStudents = students.filter((s) => {
      const sLabel = formatClassStream(s.class, s.stream).toLowerCase();
      return classLabels.some((cl) => cl.toLowerCase() === sLabel);
    });

    return {
      ...t,
      id: t.id || t._id,
      name: `${t.firstName} ${t.lastName}`,
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
      classLabels,
      rawClasses,
      courseCount: teacherCourses.length,
      studentCount: matchingStudents.length
    };
  });

  const filteredTeachers = enrichedTeachers.filter((teacher) => {
    const matchesSubject =
      selectedSubject === 'all' ||
      teacher.subjects.some((sub) => sub.toLowerCase() === selectedSubject.toLowerCase());
    const matchesStream =
      selectedStream === 'all' ||
      teacher.classLabels.some((cl) => cl.toLowerCase().includes(selectedStream.toLowerCase()));
    const matchesClass =
      selectedClass === 'all' ||
      teacher.rawClasses.some((rc) => {
        const cVal = typeof rc === 'object' && rc !== null ? rc.class : rc;
        return String(cVal || '').toLowerCase().replace(/\s+/g, '') === selectedClass.toLowerCase();
      });
    const matchesSearch =
      !searchTerm.trim() ||
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((sub) => sub.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSubject && matchesStream && matchesClass && matchesSearch;
  });

  const allSubjectOptions = [
    ...new Set(enrichedTeachers.flatMap((t) => t.subjects).filter(Boolean))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16211E]">Teachers Overview</h1>
          <p className="text-sm text-[#5C6663] mt-1">
            Live directory of registered teachers, assigned streams, and active courses.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
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
              placeholder="Search teacher or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2 border border-[#D8D1C4] rounded-xl w-full"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Subjects</option>
            {allSubjectOptions.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Classes</option>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="form3">Form 3</option>
            <option value="form4">Form 4</option>
          </select>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Streams</option>
            {['Blue', 'Yellow', 'Green', 'Red', 'White', 'Pink'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134E4A]" />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12 text-[#5C6663]">
            No registered teachers match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F6F1] border-b border-[#E5E0D5]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Teacher
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Subjects
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Classes & Streams Taught
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Active Courses
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Students in Stream(s)
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EFECE4]">
                {filteredTeachers.map((teacher) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#F8F6F1]/60"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#16211E]">{teacher.name}</div>
                      <div className="text-xs text-[#5C6663]">{teacher.email}</div>
                      {teacher.phoneNumber && (
                        <div className="text-xs text-[#5C6663]">{teacher.phoneNumber}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2.5 py-1 text-xs font-semibold bg-[#134E4A]/10 text-[#134E4A] rounded-lg"
                            >
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#5C6663]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.classLabels.length > 0 ? (
                          teacher.classLabels.map((cls, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2.5 py-1 text-xs font-medium bg-[#F8F6F1] border border-[#E5E0D5] text-[#16211E] rounded-lg"
                            >
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#5C6663]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#16211E] font-medium">
                      <span className="inline-flex items-center">
                        <BookOpenIcon className="w-4 h-4 mr-1.5 text-[#134E4A]" />
                        {teacher.courseCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[#16211E] font-medium">
                      <span className="inline-flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1.5 text-[#C85A28]" />
                        {teacher.studentCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                          teacher.isActive !== false
                            ? 'bg-[#1E7A50]/10 text-[#1E7A50]'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
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

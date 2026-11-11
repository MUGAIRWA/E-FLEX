import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, UsersIcon, UserCheckIcon, EyeIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { userAPI, courseAPI } from '../../../services/api';

const normalizeClassKey = (cls) => {
  if (!cls) return '';
  return String(cls).trim().toLowerCase().replace(/\s+/g, '');
};

const prettyClassName = (cls) => {
  const key = normalizeClassKey(cls);
  const m = key.match(/^form(\d+)$/);
  return m ? `Form ${m[1]}` : cls || 'Unassigned';
};

export function ClassesStreams() {
  const [selectedForm, setSelectedForm] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingStream, setViewingStream] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        userAPI.getStudents().catch(() => ({ data: [] })),
        userAPI.getTeachers().catch(() => ({ data: [] })),
        courseAPI.getCourses({ limit: 100 }).catch(() => ({ data: { courses: [] } }))
      ]);

      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setTeachers(Array.isArray(teachersRes.data) ? teachersRes.data : []);
      setCourses(
        Array.isArray(coursesRes.data?.courses)
          ? coursesRes.data.courses
          : Array.isArray(coursesRes.data)
          ? coursesRes.data
          : []
      );
    } catch (err) {
      console.error('Failed to load classes and streams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamically build stream groups from actual registered students, teachers, and courses
  const streamMap = new Map();

  const ensureGroup = (cls, stream) => {
    const cKey = normalizeClassKey(cls) || 'unassigned';
    const sKey = (stream || 'General').trim();
    const mapKey = `${cKey}::${sKey.toLowerCase()}`;
    if (!streamMap.has(mapKey)) {
      streamMap.set(mapKey, {
        id: mapKey,
        classKey: cKey,
        className: prettyClassName(cls),
        stream: sKey,
        students: [],
        teachers: new Set(),
        subjects: new Set()
      });
    }
    return streamMap.get(mapKey);
  };

  for (const s of students) {
    if (s.class || s.stream) {
      const grp = ensureGroup(s.class, s.stream);
      grp.students.push(s);
    }
  }

  for (const t of teachers) {
    const rawClasses = Array.isArray(t.classesTaught) ? t.classesTaught : [];
    for (const rc of rawClasses) {
      const cls = typeof rc === 'object' && rc !== null ? rc.class : rc;
      const strm = typeof rc === 'object' && rc !== null ? rc.stream : '';
      if (cls) {
        const grp = ensureGroup(cls, strm || 'General');
        grp.teachers.add(`${t.firstName} ${t.lastName}`);
        if (Array.isArray(t.subjects)) {
          t.subjects.forEach((subj) => grp.subjects.add(subj));
        }
      }
    }
  }

  for (const c of courses) {
    if (c.class || c.stream) {
      const grp = ensureGroup(c.class, c.stream || 'General');
      if (c.subject) grp.subjects.add(c.subject);
      if (c.teacher) {
        grp.teachers.add(`${c.teacher.firstName} ${c.teacher.lastName}`);
      }
    }
  }

  const allStreams = Array.from(streamMap.values()).sort((a, b) =>
    `${a.className} ${a.stream}`.localeCompare(`${b.className} ${b.stream}`)
  );

  const filteredClasses = allStreams.filter((cls) => {
    const matchesForm = selectedForm === 'all' || cls.classKey === selectedForm;
    const matchesStream =
      selectedStream === 'all' || cls.stream.toLowerCase() === selectedStream.toLowerCase();
    return matchesForm && matchesStream;
  });

  const allSubjectsCount = new Set(
    allStreams.flatMap((s) => Array.from(s.subjects))
  ).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16211E]">Classes & Streams</h1>
          <p className="text-sm text-[#5C6663] mt-1">
            Live breakdown of classes, streams, enrolled students, and assigned teachers.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex items-center">
            <BookOpenIcon className="w-8 h-8 text-[#134E4A] mr-3" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Active Streams</p>
              <p className="text-2xl font-bold text-[#16211E]">{allStreams.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-[#C85A28] mr-3" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Total Students</p>
              <p className="text-2xl font-bold text-[#16211E]">{students.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center">
            <UserCheckIcon className="w-8 h-8 text-[#1E7A50] mr-3" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Total Teachers</p>
              <p className="text-2xl font-bold text-[#16211E]">{teachers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center">
            <BookOpenIcon className="w-8 h-8 text-[#134E4A] mr-3" />
            <div>
              <p className="text-xs font-semibold uppercase text-[#5C6663]">Active Subjects</p>
              <p className="text-2xl font-bold text-[#16211E]">{allSubjectsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="px-4 py-2 border border-[#D8D1C4] bg-white rounded-xl"
          >
            <option value="all">All Forms</option>
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

      {/* Class & Stream Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134E4A]" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12 text-[#5C6663]">
            No active classes or streams found in the database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F6F1] border-b border-[#E5E0D5]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Class
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Stream
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Enrolled Students
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Assigned Teacher(s)
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#5C6663] uppercase">
                    Subjects Active
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#5C6663] uppercase">
                    Students List
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EFECE4]">
                {filteredClasses.map((cls) => {
                  const teacherNames = Array.from(cls.teachers);
                  const subjectNames = Array.from(cls.subjects);
                  return (
                    <motion.tr
                      key={cls.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#F8F6F1]/60"
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-[#16211E]">
                        {cls.className}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-[#134E4A]/10 text-[#134E4A]">
                          {cls.stream}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-[#16211E] font-medium">
                        <span className="inline-flex items-center">
                          <UsersIcon className="w-4 h-4 mr-1.5 text-[#C85A28]" />
                          {cls.students.length}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#16211E]">
                        {teacherNames.length > 0 ? teacherNames.join(', ') : 'No teacher assigned yet'}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex flex-wrap gap-1.5">
                          {subjectNames.length > 0 ? (
                            subjectNames.map((subj, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-2 py-0.5 text-xs font-medium bg-[#F8F6F1] border border-[#E5E0D5] text-[#16211E] rounded"
                              >
                                {subj}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#5C6663]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingStream(cls)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1.5" />
                          View Students ({cls.students.length})
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal showing students in the selected Class & Stream */}
      {viewingStream && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E0D5] max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#16211E]">
                  {viewingStream.className} — {viewingStream.stream} Stream
                </h2>
                <p className="text-xs text-[#5C6663]">
                  {viewingStream.students.length} student(s) enrolled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingStream(null)}
                className="text-[#5C6663] hover:text-[#16211E]"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {viewingStream.students.length === 0 ? (
              <p className="text-sm text-[#5C6663] py-6 text-center">
                No students registered in this stream yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {viewingStream.students.map((st) => (
                  <div
                    key={st.id || st._id}
                    className="p-3.5 rounded-xl bg-[#F8F6F1] border border-[#E5E0D5] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#16211E]">
                        {st.firstName} {st.lastName}
                      </p>
                      <p className="text-xs text-[#5C6663]">{st.email}</p>
                      {Array.isArray(st.linkedParents) && st.linkedParents.length > 0 && (
                        <p className="text-xs text-[#1E7A50] mt-0.5">
                          Parent: {st.linkedParents.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
                        </p>
                      )}
                    </div>
                    {st.admissionNumber && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#D8D1C4] text-[#16211E]">
                        {st.admissionNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

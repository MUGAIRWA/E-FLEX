import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DownloadIcon, BookOpenIcon } from 'lucide-react';
import { parentAPI, assignmentAPI, examAPI } from '../../../services/api';

export function ProgressReportTab() {
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [overallMastery, setOverallMastery] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [childRes, assignRes, examRes] = await Promise.allSettled([
        parentAPI.getChildren(),
        assignmentAPI.getAssignments({ limit: 50 }),
        examAPI.getExams({ limit: 50 })
      ]);

      const childList =
        childRes.status === 'fulfilled' && Array.isArray(childRes.value.data)
          ? childRes.value.data
          : [];
      setChildren(childList);
      if (childList.length > 0 && !selectedStudent) {
        setSelectedStudent(childList[0].id);
      }

      const assignments =
        assignRes.status === 'fulfilled'
          ? assignRes.value.data?.assignments || []
          : [];
      const exams =
        examRes.status === 'fulfilled' ? examRes.value.data?.exams || [] : [];

      const bySubject = {};
      assignments.forEach((a) => {
        const subj = a.course?.subject || 'General';
        if (!bySubject[subj]) {
          bySubject[subj] = {
            subject: subj,
            totalItems: 0,
            completedItems: 0,
            scores: [],
            teacher: a.teacher
              ? `${a.teacher.firstName} ${a.teacher.lastName}`
              : 'Assigned Teacher'
          };
        }
        bySubject[subj].totalItems += 1;
        const sub = a.submissions?.[0];
        if (sub) {
          bySubject[subj].completedItems += 1;
          if (sub.marks !== null && sub.marks !== undefined) {
            const pct = Math.round(
              (Number(sub.marks) / Number(a.totalMarks || 100)) * 100
            );
            bySubject[subj].scores.push(pct);
          }
        }
      });

      exams.forEach((ex) => {
        const subj = ex.course?.subject || 'General';
        if (!bySubject[subj]) {
          bySubject[subj] = {
            subject: subj,
            totalItems: 0,
            completedItems: 0,
            scores: [],
            teacher: ex.teacher
              ? `${ex.teacher.firstName} ${ex.teacher.lastName}`
              : 'Assigned Teacher'
          };
        }
        bySubject[subj].totalItems += 1;
        const res = ex.results?.[0];
        if (res) {
          bySubject[subj].completedItems += 1;
          if (res.percentage !== null && res.percentage !== undefined) {
            bySubject[subj].scores.push(Math.round(Number(res.percentage)));
          }
        }
      });

      const rows = Object.values(bySubject).map((item) => {
        const progress =
          item.totalItems > 0
            ? Math.round((item.completedItems / item.totalItems) * 100)
            : 0;
        const averageScore =
          item.scores.length > 0
            ? `${Math.round(
                item.scores.reduce((s, n) => s + n, 0) / item.scores.length
              )}%`
            : 'Not graded yet';
        return {
          subject: item.subject,
          progress,
          averageScore,
          completedLabel: `${item.completedItems}/${item.totalItems} completed`,
          teacher: item.teacher
        };
      });

      setSubjectPerformance(rows);

      if (rows.length > 0) {
        const avgProgress = Math.round(
          rows.reduce((sum, r) => sum + r.progress, 0) / rows.length
        );
        setOverallMastery(avgProgress);
      } else {
        setOverallMastery(0);
      }
    } catch (err) {
      console.error('Failed to load parent progress report:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Linked Student
        </h3>
        {children.length === 0 ? (
          <p className="text-sm text-gray-500">
            No student linked to your parent account yet.
          </p>
        ) : (
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {children.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}{' '}
                {student.classLabel ? `(${student.classLabel})` : ''}
              </option>
            ))}
          </select>
        )}
      </Card>

      {/* Subject Performance Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Subject Performance
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500 py-4">
            Loading academic performance...
          </p>
        ) : subjectPerformance.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <BookOpenIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">
              No coursework or quiz grades recorded yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Once teachers post assignments or quizzes for your child&apos;s stream, live subject performance will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Completion
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Average Score
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Coursework
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Teacher
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectPerformance.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{item.subject}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#134E4A] h-2 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {item.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{item.averageScore}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {item.completedLabel}
                    </td>
                    <td className="py-3 px-4">{item.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Progress Circle */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Overall Coursework Completion
        </h3>
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#134E4A"
                strokeWidth="3"
                strokeDasharray={`${overallMastery}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {overallMastery}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" onClick={() => window.print()}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Print / Save Report (PDF)
        </Button>
      </div>
    </div>
  );
}

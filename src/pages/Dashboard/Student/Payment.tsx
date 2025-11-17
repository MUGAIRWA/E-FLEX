import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, CreditCardIcon, CheckCircleIcon, LockIcon } from 'lucide-react';
// @ts-ignore: no types for JS API module
import { subjectAPI } from '../../../services/api';

type SubjectItem = {
  id: number;
  name: string;
  status: 'paid' | 'unpaid';
  amount: number;
  date?: string;
};

export function Payment(): JSX.Element {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectAPI.getSubjects();
        // Map API response to SubjectItem format, limit to first 4
        const subjectsData = Array.isArray(response.data) ? response.data : [];
        const formattedSubjects: SubjectItem[] = subjectsData
          .slice(0, 4)
          .map((subject: any, index: number) => ({
            id: index + 1,
            name: subject.name,
            status: index < 2 ? 'paid' : 'unpaid',
            amount: 250,
            date: index < 2 ? 'Dec 1, 2024' : undefined
          }));
        setSubjects(formattedSubjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        // Fallback to empty array
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Payments</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Payment Info */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Unlock Your Learning Journey
          </h2>
          <p className="text-lg mb-4">Each subject costs just KSh 250</p>
          <p className="text-sm opacity-90">
            Get access to structured weekly modules, interactive quizzes,
            assignments, and community support.
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subjects.map((subject: SubjectItem) => (
            <div key={subject.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {subject.name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    KSh {subject.amount}
                  </p>
                </div>
                {subject.status === 'paid' ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                ) : (
                  <LockIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>

              {subject.status === 'paid' ? (
                <div className="text-sm text-gray-600">
                  <p>✅ Paid on {subject.date}</p>
                  <p className="mt-2 text-green-600 font-medium">
                    Full access unlocked
                  </p>
                </div>
              ) : (
                <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2">
                  <CreditCardIcon className="w-5 h-5" />
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Payment History
          </h2>
          <div className="space-y-3">
            {subjects
              .filter((s: SubjectItem) => s.status === 'paid')
              .map((subject: SubjectItem) => (
                <div key={subject.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-800">{subject.name}</p>
                    <p className="text-sm text-gray-500">{subject.date}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    KSh {subject.amount}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

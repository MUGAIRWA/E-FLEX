import { useEffect, useState } from 'react';
import { CreditCardIcon, CheckCircleIcon, LockIcon, BookOpenIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
// @ts-ignore: no types for JS API module
import { courseAPI } from '../../../services/api';

type SubjectItem = {
  id: string | number;
  name: string;
  teacher?: string;
  status: 'paid' | 'unpaid';
  amount: number;
  date?: string;
};

export function Payment(): JSX.Element {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await courseAPI.getCourses({ limit: 50 });
        const courses = (response.data as any)?.courses || [];
        const formattedSubjects: SubjectItem[] = courses.map(
          (course: any, index: number) => ({
            id: course.id || course._id || index + 1,
            name: course.subject || course.title,
            teacher: course.teacher
              ? `${course.teacher.firstName} ${course.teacher.lastName}`
              : undefined,
            status: 'unpaid',
            amount: 250
          })
        );
        setSubjects(formattedSubjects);
      } catch (error) {
        console.error('Failed to fetch student courses for payment:', error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins font-bold text-3xl mb-1 text-[#16211E]">
          Subject Subscriptions & Payments
        </h1>
        <p className="text-[#5C6663]">
          Manage your active subject access and M-Pesa / card payment history
        </p>
      </div>

      {/* Payment Info Banner */}
      <div className="bg-[#134E4A] border border-[#0E3B38] rounded-2xl p-7 sm:p-8 text-white shadow-sm">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-2">
          Affordable Access
        </span>
        <h2 className="font-poppins text-2xl font-bold mb-2">
          Unlock Your Learning Journey
        </h2>
        <p className="text-lg font-medium text-[#E8F1EF] mb-3">
          Each subject costs just KSh 250 per term
        </p>
        <p className="text-sm text-[#C2D9D4] max-w-2xl">
          Get full access to structured weekly modules, teacher notes, interactive quizzes,
          graded assignments, and direct academic support.
        </p>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <Card>
          <p className="text-sm text-[#5C6663] py-6 text-center">
            Loading subjects for your stream...
          </p>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <div className="text-center py-8 space-y-2">
            <BookOpenIcon className="w-10 h-10 text-[#8A9490] mx-auto" />
            <h3 className="font-poppins font-bold text-lg text-[#16211E]">
              No active stream subjects yet
            </h3>
            <p className="text-sm text-[#5C6663]">
              Once your teachers publish courses for your class stream, they will appear here for subscription.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {subjects.map((subject: SubjectItem) => (
            <Card key={subject.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-poppins text-lg font-bold text-[#16211E] mb-1">
                    {subject.name}
                  </h3>
                  {subject.teacher && (
                    <p className="text-xs text-[#5C6663] mb-1">
                      Teacher: {subject.teacher}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-[#134E4A]">
                    KSh {subject.amount}
                  </p>
                </div>
                {subject.status === 'paid' ? (
                  <div className="w-10 h-10 rounded-xl bg-[#E9F5EE] flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-[#1E7A50]" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] flex items-center justify-center">
                    <LockIcon className="w-6 h-6 text-[#8A9490]" />
                  </div>
                )}
              </div>

              {subject.status === 'paid' ? (
                <div className="text-sm text-[#5C6663] pt-2 border-t border-[#E5E0D5]">
                  <p>Paid on {subject.date}</p>
                  <p className="mt-1 text-[#1E7A50] font-semibold">
                    Full subject access unlocked
                  </p>
                </div>
              ) : (
                <Button variant="accent" className="w-full mt-4">
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Pay Now (KSh {subject.amount})
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Payment History */}
      <Card>
        <h2 className="font-poppins text-lg font-bold text-[#16211E] mb-4">
          Payment History
        </h2>
        {subjects.filter((s: SubjectItem) => s.status === 'paid').length === 0 ? (
          <p className="text-sm text-[#5C6663]">
            No payment transactions recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-[#E5E0D5]">
            {subjects
              .filter((s: SubjectItem) => s.status === 'paid')
              .map((subject: SubjectItem) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-[#16211E]">{subject.name}</p>
                    <p className="text-sm text-[#5C6663]">{subject.date}</p>
                  </div>
                  <span className="text-lg font-bold text-[#134E4A]">
                    KSh {subject.amount}
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}

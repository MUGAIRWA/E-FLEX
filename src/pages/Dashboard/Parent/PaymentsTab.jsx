import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CheckCircleIcon, ClockIcon, EyeIcon, ReceiptIcon } from 'lucide-react';
import { courseAPI } from '../../../services/api';

export function PaymentsTab() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectPayments, setSubjectPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const res = await courseAPI.getCourses({ limit: 100 });
        const courses = res.data?.courses || [];
        const uniqueSubjects = Array.from(
          new Set(courses.map((c) => c.subject).filter(Boolean))
        );
        setSubjectPayments(
          uniqueSubjects.map((subject) => ({
            subject,
            status: 'pending',
            amount: 250,
            date: '—',
            receipt: false
          }))
        );
      } catch (err) {
        console.error('Failed to load payment courses:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const paidItems = subjectPayments.filter((p) => p.status === 'paid');
  const pendingItems = subjectPayments.filter((p) => p.status === 'pending');
  const totalPaid = paidItems.reduce((sum, p) => sum + p.amount, 0);

  const handlePayNow = (subject) => {
    setSelectedSubject(subject);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#134E4A] text-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-xl font-bold mb-4">Payment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">
              KSh {totalPaid.toLocaleString()}
            </p>
            <p className="text-sm opacity-90">Total Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{pendingItems.length}</p>
            <p className="text-sm opacity-90">Pending Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {paidItems.length > 0 ? paidItems[0].date : 'No payments yet'}
            </p>
            <p className="text-sm opacity-90">Last Payment</p>
          </div>
        </div>
      </motion.div>

      {/* Subject Payment Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Subject Payments
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500 py-4">
            Loading subject fee details...
          </p>
        ) : subjectPayments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <ReceiptIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">
              No billable subjects assigned yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Once courses are created for your child&apos;s stream, subject fee status will appear here.
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
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Receipt
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectPayments.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{payment.subject}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {payment.status === 'paid' ? (
                          <>
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span className="text-green-600 font-medium">
                              Paid
                            </span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-5 h-5 text-orange-500" />
                            <span className="text-orange-600 font-medium">
                              Pending
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">KSh {payment.amount}</td>
                    <td className="py-3 px-4">{payment.date}</td>
                    <td className="py-3 px-4">
                      {payment.receipt ? (
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {payment.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayNow(payment.subject)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Payment
            </h3>
            <p className="text-gray-600 mb-6">
              Pay KSh 250 for {selectedSubject || 'this'} subject? This will be
              processed via M-Pesa.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                Confirm Payment
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

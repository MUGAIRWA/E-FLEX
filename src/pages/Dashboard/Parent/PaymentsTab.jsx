import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CreditCardIcon, CheckCircleIcon, ClockIcon, EyeIcon } from 'lucide-react';

export function PaymentsTab() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const paymentSummary = {
    totalPaid: 1250,
    pending: 2,
    lastPayment: '1st Nov 2025'
  };

  const subjectPayments = [
    { subject: 'Math', status: 'paid', amount: 250, date: 'Oct 21', receipt: true },
    { subject: 'English', status: 'paid', amount: 250, date: 'Oct 21', receipt: true },
    { subject: 'Science', status: 'pending', amount: 250, date: '—', receipt: false },
    { subject: 'History', status: 'pending', amount: 250, date: '—', receipt: false },
    { subject: 'Geography', status: 'paid', amount: 250, date: 'Oct 15', receipt: true }
  ];

  const handlePayNow = (subject) => {
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-accent text-white rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Payment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">KSh {paymentSummary.totalPaid.toLocaleString()}</p>
            <p className="text-sm opacity-90">Total Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{paymentSummary.pending}</p>
            <p className="text-sm opacity-90">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{paymentSummary.lastPayment}</p>
            <p className="text-sm opacity-90">Last Payment</p>
          </div>
        </div>
      </motion.div>

      {/* Subject Payment Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Receipt</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
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
                          <span className="text-green-600 font-medium">Paid</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon className="w-5 h-5 text-orange-500" />
                          <span className="text-orange-600 font-medium">Pending</span>
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Payment</h3>
            <p className="text-gray-600 mb-6">
              Pay KSh 250 for Science subject? This will be processed via M-Pesa.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Confirm Payment
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Download Receipt */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Receipts</h3>
        <p className="text-gray-600 mb-4">
          Download receipts for your payments.
        </p>
        <Button variant="outline">
          <EyeIcon className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
      </Card>
    </div>
  );
}

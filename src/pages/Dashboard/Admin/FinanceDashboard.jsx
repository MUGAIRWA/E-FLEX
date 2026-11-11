import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSignIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  DownloadIcon,
  SearchIcon,
  ReceiptIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { userAPI, courseAPI } from '../../../services/api';
import { SUBJECTS } from '../../../constants/subjects';

export function FinanceDashboard() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentsData, setPaymentsData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadFinanceData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.allSettled([
        userAPI.getStudents({ limit: 500 }),
        courseAPI.getCourses({ limit: 500 })
      ]);

      const students =
        studentsRes.status === 'fulfilled'
          ? studentsRes.value.data?.students || []
          : [];
      const allCourses =
        coursesRes.status === 'fulfilled'
          ? coursesRes.value.data?.courses || []
          : [];

      setStudentsCount(students.length);
      setCourses(allCourses);
      // Until online M-Pesa / card transactions are recorded in the database, start with 0 transactions
      setPaymentsData([]);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const paidPayments = paymentsData.filter(
    (p) => (p.status || '').toLowerCase() === 'paid'
  );
  const pendingPayments = paymentsData.filter(
    (p) => (p.status || '').toLowerCase() === 'pending'
  );

  const totalRevenue = paidPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const totalPendingAmount = pendingPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `KSh ${totalRevenue.toLocaleString()}`,
      icon: <DollarSignIcon className="w-6 h-6" />,
      color: 'text-[#1E7A50]',
      subtext: `${paidPayments.length} paid transaction${paidPayments.length === 1 ? '' : 's'}`
    },
    {
      label: 'Pending Payments',
      value: `KSh ${totalPendingAmount.toLocaleString()}`,
      icon: <ClockIcon className="w-6 h-6" />,
      color: 'text-[#C85A28]',
      subtext: `${pendingPayments.length} pending invoice${pendingPayments.length === 1 ? '' : 's'}`
    },
    {
      label: 'Completed Transactions',
      value: paidPayments.length.toLocaleString(),
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: 'text-[#134E4A]',
      subtext: `${studentsCount} registered student${studentsCount === 1 ? '' : 's'}`
    },
    {
      label: 'Active Subject Courses',
      value: courses.length.toLocaleString(),
      icon: <TrendingUpIcon className="w-6 h-6" />,
      color: 'text-[#134E4A]',
      subtext: 'KSh 250 standard subject rate'
    }
  ];

  // Build subject revenue breakdown dynamically from live courses / subjects
  const subjectNames = Array.from(
    new Set([
      ...courses.map((c) => c.subject).filter(Boolean),
      ...(SUBJECTS || []).slice(0, 6)
    ])
  );

  const paymentsBySubject = subjectNames.map((subject) => {
    const amount = paidPayments
      .filter((p) => (p.subject || '').toLowerCase() === subject.toLowerCase())
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { subject, amount };
  });

  const maxSubjectAmount = Math.max(
    ...paymentsBySubject.map((s) => s.amount),
    1
  );

  const filteredPayments = paymentsData.filter((payment) => {
    const matchesStatus =
      selectedStatus === 'all' ||
      (payment.status || '').toLowerCase() === selectedStatus;
    const matchesSubject =
      selectedSubject === 'all' ||
      (payment.subject || '').toLowerCase() === selectedSubject.toLowerCase();
    const matchesClass =
      selectedClass === 'all' ||
      (payment.class || '').toLowerCase() === selectedClass.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (payment.student || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (payment.parent || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSubject && matchesClass && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Student,Subject,Amount (KSh),Status,Date,Parent,Receipt'];
    const rows = filteredPayments.map(
      (p) =>
        `"${p.student || ''}","${p.subject || ''}",${p.amount || 0},"${p.status || ''}","${p.date || ''}","${p.parent || ''}","${p.receipt || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'eflex-finance-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <div className="text-sm text-gray-500">
            Live subject payments and financial records from the database
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadFinanceData}>
          <RefreshCwIcon className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? '...' : card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
                </div>
                <div className={card.color}>{card.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            {(SUBJECTS || []).map((subj) => (
              <option key={subj} value={subj.toLowerCase()}>
                {subj}
              </option>
            ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="form1">Form 1</option>
            <option value="form2">Form 2</option>
            <option value="form3">Form 3</option>
            <option value="form4">Form 4</option>
          </select>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payments Overview</h2>
        {loading ? (
          <p className="text-sm text-gray-500 py-6">
            Loading financial records...
          </p>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <ReceiptIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">
              No payment transactions recorded yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              When parents or students make subject payments, live transaction records and receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.student}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      KSh {payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.parent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.receipt ? (
                        <Button size="sm" variant="outline">
                          <ReceiptIcon className="w-4 h-4 mr-1" />
                          {payment.receipt}
                        </Button>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payments by Subject Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue by Subject</h2>
        {paymentsBySubject.length === 0 ? (
          <p className="text-sm text-gray-500">No subjects available yet.</p>
        ) : (
          <div className="space-y-4">
            {paymentsBySubject.map((item) => (
              <div
                key={item.subject}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700">
                  {item.subject}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="w-48 bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#134E4A] h-3 rounded-full transition-all"
                      style={{
                        width:
                          item.amount > 0
                            ? `${Math.max((item.amount / maxSubjectAmount) * 100, 6)}%`
                            : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    KSh {item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, DollarSignIcon, CheckCircleIcon, ClockIcon, TrendingUpIcon, DownloadIcon, FilterIcon, SearchIcon, ReceiptIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function FinanceDashboard() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const summaryCards = [
    { label: 'Total Revenue', value: 'KSh 312,500', icon: <DollarSignIcon className="w-6 h-6" />, color: 'text-green-600', change: '+12%' },
    { label: 'Pending Payments', value: 'KSh 45,000', icon: <ClockIcon className="w-6 h-6" />, color: 'text-yellow-600', change: '-5%' },
    { label: 'Completed Transactions', value: '1,245', icon: <CheckCircleIcon className="w-6 h-6" />, color: 'text-blue-600', change: '+8%' },
    { label: 'Monthly Growth', value: '+15%', icon: <TrendingUpIcon className="w-6 h-6" />, color: 'text-purple-600', change: '+3%' }
  ];

  const paymentsData = [
    { id: 1, student: 'John Doe', subject: 'Mathematics', amount: 250, status: 'Paid', date: '2024-01-15', parent: 'Jane Doe', receipt: 'RCP001' },
    { id: 2, student: 'Jane Smith', subject: 'English', amount: 250, status: 'Pending', date: '2024-01-14', parent: 'Bob Smith', receipt: null },
    { id: 3, student: 'Mike Johnson', subject: 'Science', amount: 250, status: 'Paid', date: '2024-01-13', parent: 'Sarah Johnson', receipt: 'RCP002' },
    { id: 4, student: 'Alice Brown', subject: 'History', amount: 250, status: 'Paid', date: '2024-01-12', parent: 'Tom Brown', receipt: 'RCP003' },
    { id: 5, student: 'David Wilson', subject: 'Geography', amount: 250, status: 'Pending', date: '2024-01-11', parent: 'Lisa Wilson', receipt: null }
  ];

  const paymentsBySubject = [
    { subject: 'Mathematics', amount: 75000 },
    { subject: 'English', amount: 62500 },
    { subject: 'Science', amount: 50000 },
    { subject: 'History', amount: 43750 },
    { subject: 'Geography', amount: 31250 }
  ];

  const filteredPayments = paymentsData.filter(payment => {
    const matchesStatus = selectedStatus === 'all' || payment.status.toLowerCase() === selectedStatus;
    const matchesSubject = selectedSubject === 'all' || payment.subject.toLowerCase() === selectedSubject;
    const matchesSearch = payment.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.parent.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSubject && matchesSearch;
  });

  const handleExport = (format) => {
    console.log(`Exporting data as ${format}`);
    // Here you would implement the export functionality
  };

  const getStatusColor = (status) => {
    return status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="text-sm text-gray-500">Manage subject payments and financial reports</div>
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
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className={`text-sm ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change} from last month
                  </p>
                </div>
                <div className={card.color}>
                  {card.icon}
                </div>
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
            <option value="mathematics">Mathematics</option>
            <option value="english">English</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="geography">Geography</option>
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
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payments Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {payment.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.parent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.receipt ? (
                      <Button size="sm" variant="outline" onClick={() => console.log('View receipt', payment.receipt)}>
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
      </Card>

      {/* Payments by Subject Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payments by Subject</h2>
        <div className="space-y-4">
          {paymentsBySubject.map((subject, index) => (
            <div key={subject.subject} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
              <div className="flex items-center space-x-4">
                <div className="bg-primary h-4 rounded" style={{ width: `${(subject.amount / 75000) * 200}px` }}></div>
                <span className="text-sm font-medium">KSh {subject.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

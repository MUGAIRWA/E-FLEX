import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  EditIcon,
  TrashIcon,
  UserPlusIcon,
  XIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { userAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const formatClassStream = (cls, stream) => {
  if (!cls && !stream) return '—';
  const norm = String(cls || '').toLowerCase().replace(/\s+/g, '');
  const match = norm.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ') || '—';
};

const formatTeacherClasses = (classesTaught, streamsTaught) => {
  if (Array.isArray(classesTaught) && classesTaught.length > 0) {
    return classesTaught
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return formatClassStream(item.class, item.stream);
        }
        return formatClassStream(item, '');
      })
      .filter(Boolean)
      .join(', ');
  }
  if (Array.isArray(streamsTaught) && streamsTaught.length > 0) {
    return streamsTaught.join(', ');
  }
  return '—';
};

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalAdmins: 0
  });

  // Add / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    phoneNumber: '',
    admissionNumber: '',
    class: 'form1',
    stream: 'Blue',
    childEmail: '',
    subjects: ''
  });

  const tabs = [
    { id: 'all', label: 'All Users', count: userStats.totalUsers },
    { id: 'students', label: 'Students', count: userStats.totalStudents },
    { id: 'teachers', label: 'Teachers', count: userStats.totalTeachers },
    { id: 'parents', label: 'Parents', count: userStats.totalParents },
    { id: 'admins', label: 'Admins', count: userStats.totalAdmins }
  ];

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      const d = response.data || {};
      setUserStats({
        totalUsers: d.totalUsers ?? 0,
        totalStudents: d.totalStudents ?? d.students ?? 0,
        totalTeachers: d.totalTeachers ?? d.teachers ?? 0,
        totalParents: d.totalParents ?? d.parents ?? 0,
        totalAdmins: d.totalAdmins ?? d.admins ?? 0
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 50
      };

      if (activeTab !== 'all') {
        params.role = activeTab.slice(0, -1); // students -> student, teachers -> teacher, etc.
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await userAPI.getUsers(params);
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, searchTerm, selectedStatus]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormError('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: activeTab !== 'all' ? activeTab.slice(0, -1) : 'student',
      phoneNumber: '',
      admissionNumber: '',
      class: 'form1',
      stream: 'Blue',
      childEmail: '',
      subjects: ''
    });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormError('');
    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      phoneNumber: u.phoneNumber || '',
      admissionNumber: u.admissionNumber || '',
      class: u.class || 'form1',
      stream: u.stream || 'Blue',
      childEmail: u.childEmail || '',
      subjects: Array.isArray(u.subjects) ? u.subjects.join(', ') : '',
      isActive: u.isActive !== false
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phoneNumber: formData.phoneNumber.trim()
      };

      if (!editingUser) {
        payload.password = formData.password;
      } else if (formData.isActive !== undefined) {
        payload.isActive = formData.isActive;
      }

      if (formData.role === 'student') {
        payload.admissionNumber = formData.admissionNumber.trim();
        payload.class = formData.class;
        payload.stream = formData.stream;
      } else if (formData.role === 'teacher') {
        payload.subjects = formData.subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (formData.role === 'parent') {
        payload.childEmail = formData.childEmail.trim();
      }

      if (editingUser) {
        const uid = editingUser.id || editingUser._id;
        await userAPI.updateUser(uid, payload);
      } else {
        await userAPI.createUser(payload);
      }

      setShowModal(false);
      await Promise.all([fetchUsers(), fetchUserStats()]);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (u) => {
    const uid = u.id || u._id;
    if (!window.confirm(`Are you sure you want to permanently delete ${u.firstName} ${u.lastName} (${u.email})?`)) {
      return;
    }
    try {
      await userAPI.deleteUser(uid);
      await Promise.all([fetchUsers(), fetchUserStats()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const renderUserDetails = (u) => {
    if (u.role === 'student') {
      const parentsList = Array.isArray(u.linkedParents) && u.linkedParents.length > 0
        ? u.linkedParents.map((p) => `${p.firstName} ${p.lastName}`).join(', ')
        : 'None linked';
      return (
        <div className="space-y-0.5">
          <div className="font-medium text-[#16211E]">
            {formatClassStream(u.class, u.stream)}
            {u.admissionNumber ? ` • Adm: ${u.admissionNumber}` : ''}
          </div>
          <div className="text-xs text-[#5C6663]">Parent: {parentsList}</div>
        </div>
      );
    }

    if (u.role === 'teacher') {
      const subjects = Array.isArray(u.subjects) && u.subjects.length > 0 ? u.subjects.join(', ') : 'No subjects set';
      const classes = formatTeacherClasses(u.classesTaught, u.streamsTaught);
      return (
        <div className="space-y-0.5">
          <div className="font-medium text-[#16211E]">{subjects}</div>
          <div className="text-xs text-[#5C6663]">Streams: {classes}</div>
        </div>
      );
    }

    if (u.role === 'parent') {
      const childrenList = Array.isArray(u.children) && u.children.length > 0
        ? u.children.map((c) => `${c.firstName} ${c.lastName} (${formatClassStream(c.class, c.stream)})`).join(', ')
        : u.childEmail || 'No child linked';
      return (
        <div className="space-y-0.5">
          <div className="font-medium text-[#16211E]">Child: {childrenList}</div>
          {u.phoneNumber && <div className="text-xs text-[#5C6663]">Tel: {u.phoneNumber}</div>}
        </div>
      );
    }

    return <span className="text-xs text-[#5C6663]">System Administrator</span>;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return 'bg-[#C85A28]/10 text-[#C85A28]';
      case 'teacher':
        return 'bg-[#134E4A]/10 text-[#134E4A]';
      case 'parent':
        return 'bg-[#1E7A50]/10 text-[#1E7A50]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16211E]">User Directory & Management</h1>
          <p className="text-sm text-[#5C6663] mt-1">
            View and manage all registered students, teachers, parents, and administrators.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => { fetchUsers(); fetchUserStats(); }}>
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateModal}>
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="border-b border-[#E5E0D5]">
        <nav className="-mb-px flex flex-wrap gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[#134E4A] text-[#134E4A]'
                  : 'border-transparent text-[#5C6663] hover:text-[#16211E]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Search & Status Filter */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3.5 top-3 h-5 w-5 text-[#5C6663]" />
            <input
              type="text"
              placeholder="Search by name, email, or admission number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 pr-4 py-2.5 border border-[#D8D1C4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134E4A] w-full"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-[#D8D1C4] bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134E4A]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134E4A]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-[#5C6663]">
            No users found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F6F1] border-b border-[#E5E0D5]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[#5C6663] uppercase tracking-wider">
                    Name & Contact
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[#5C6663] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[#5C6663] uppercase tracking-wider">
                    Class / Stream / Linked Accounts
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-[#5C6663] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-[#5C6663] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EFECE4]">
                {users.map((u) => {
                  const uid = u.id || u._id;
                  const isSelf = currentUser && (currentUser.id === uid || currentUser._id === uid);
                  return (
                    <tr key={uid} className="hover:bg-[#F8F6F1]/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#16211E]">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-xs text-[#5C6663]">{u.email}</div>
                        {u.phoneNumber && (
                          <div className="text-xs text-[#5C6663]">{u.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">{renderUserDetails(u)}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            u.isActive !== false
                              ? 'bg-[#1E7A50]/10 text-[#1E7A50]'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(u)}>
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteUser(u)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-[#16211E]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E0D5] max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#16211E]">
                {editingUser ? `Edit ${editingUser.firstName} ${editingUser.lastName}` : 'Add New User'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#5C6663] hover:text-[#16211E]"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#16211E] mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                    placeholder="At least 6 characters"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">Role *</label>
                  <select
                    value={formData.role}
                    disabled={Boolean(editingUser)}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D1C4] bg-white rounded-xl"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                  />
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1">Admission No.</label>
                    <input
                      type="text"
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1">Class</label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D8D1C4] bg-white rounded-xl"
                    >
                      <option value="form1">Form 1</option>
                      <option value="form2">Form 2</option>
                      <option value="form3">Form 3</option>
                      <option value="form4">Form 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#16211E] mb-1">Stream</label>
                    <select
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D8D1C4] bg-white rounded-xl"
                    >
                      {['Blue', 'Yellow', 'Green', 'Red', 'White', 'Pink'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formData.role === 'teacher' && (
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">
                    Subjects Taught (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="Mathematics, Chemistry, Biology"
                    className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                  />
                </div>
              )}

              {formData.role === 'parent' && (
                <div>
                  <label className="block text-xs font-semibold text-[#16211E] mb-1">
                    Child Student Email or Admission Number
                  </label>
                  <input
                    type="text"
                    value={formData.childEmail}
                    onChange={(e) => setFormData({ ...formData, childEmail: e.target.value })}
                    placeholder="student@email.com or ADM-001"
                    className="w-full px-3 py-2 border border-[#D8D1C4] rounded-xl"
                  />
                </div>
              )}

              {editingUser && (
                <label className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-[#134E4A] w-4 h-4"
                  />
                  <span className="text-sm font-medium text-[#16211E]">Account is Active</span>
                </label>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE4]">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

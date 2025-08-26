import React, { useState, useEffect } from 'react';
import { getallUsers, getDocumentsByUser, getTransactionsByUser } from '../api/api';

const AdminDashboard = ({ onLogout, onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({}); // Store pending docs and revenue for each user
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [adminData, setAdminData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Get admin data from localStorage
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    }
    
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await getallUsers();

      if (response.success && response.data) {
        const usersData = response.data.users || [];
        setUsers(usersData);
        setCurrentPage(response.data.page || 1);
        setTotalPages(response.data.pages || 1);
        setTotal(response.data.total || 0);

        // Fetch stats for each user
        await fetchUsersStats(usersData);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersStats = async (usersData) => {
    if (!usersData || usersData.length === 0) return;

    try {
      setIsLoadingStats(true);
      const stats = {};

      // Fetch data for each user in parallel
      const promises = usersData.map(async (user) => {
        try {
          const [documentsResponse, transactionsResponse] = await Promise.all([
            getDocumentsByUser(user.id),
            getTransactionsByUser(user.id)
          ]);

          // Calculate pending documents
          const documents = documentsResponse?.data || [];
          const pendingDocs = documents.filter(doc =>
            doc.documentStatus &&
            !['completed', 'signed'].includes(doc.documentStatus.toLowerCase())
          ).length;

          // Calculate total revenue from completed transactions
          const transactions = transactionsResponse?.data || [];
          const totalRevenue = transactions
            .filter(txn => txn.status === 'completed')
            .reduce((sum, txn) => {
              const amount = txn.pricing?.total_amount || 0;
              return sum + amount;
            }, 0);

          return {
            userId: user.id,
            pendingDocuments: pendingDocs,
            totalRevenue: totalRevenue,
            totalDocuments: documents.length,
            totalTransactions: transactions.length
          };
        } catch (err) {
          console.error(`Error fetching stats for user ${user.id}:`, err);
          return {
            userId: user.id,
            pendingDocuments: 0,
            totalRevenue: 0,
            totalDocuments: 0,
            totalTransactions: 0
          };
        }
      });

      const results = await Promise.all(promises);

      // Convert array to object keyed by userId
      results.forEach(result => {
        stats[result.userId] = result;
      });

      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    localStorage.removeItem('isAdmin');
    localStorage.clear();
    onLogout?.();
  };

  const handleUserClick = (userId) => {
    onUserSelect?.(userId);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getUserStat = (userId, stat) => {
    return userStats[userId]?.[stat] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      user.state?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-2">Loading admin dashboard...</p>
          <p className="text-gray-500 text-sm">Fetching user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔐</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Admin Dashboard</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {adminData && (
                <div className="hidden md:block text-sm">
                  <span className="text-gray-600">Admin: </span>
                  <span className="text-gray-900 font-medium">
                    {adminData.user?.firstName || adminData.firstName || 'Administrator'}
                  </span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {isLoadingStats ? (
                <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                Object.values(userStats).reduce((sum, stat) => sum + stat.pendingDocuments, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Pending Documents</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? (
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                formatCurrency(Object.values(userStats).reduce((sum, stat) => sum + stat.totalRevenue, 0))
              )}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(user => new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600">New This Week</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">Search users</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search users by name, email, phone, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedUsers.length} of {users.length} users
              {isLoadingStats && (
                <span className="ml-2 text-yellow-600">• Loading user statistics...</span>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
          </div>

          {filteredAndSortedUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No users have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <span>{getSortIcon('firstName')}</span>
                      </div>
                    </th>
                    <th
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        <span>{getSortIcon('email')}</span>
                      </div>
                    </th>
                    <th
                      className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('phoneNumber')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Phone</span>
                        <span>{getSortIcon('phoneNumber')}</span>
                      </div>
                    </th>
                    <th
                      className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('state')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Location</span>
                        <span>{getSortIcon('state')}</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">Docs</span>
                        <span className="hidden sm:inline">Docs</span>
                        {isLoadingStats && (
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span className="hidden sm:inline">Total</span>
                        <span>Revenue</span>
                        {isLoadingStats && (
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </th>
                    <th
                      className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Registered</span>
                        <span>{getSortIcon('createdAt')}</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="flex items-center">
                          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                            <span className="text-purple-600 font-medium text-xs sm:text-sm">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">ID: {user.id.slice(-8)}</div>
                            <div className="lg:hidden text-xs text-gray-500 mt-1">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="text-sm text-gray-900">{user.state}</div>
                        <div className="text-sm text-gray-500">{user.pinCode}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserStat(user.id, 'pendingDocuments')}
                          </div>
                          {getUserStat(user.id, 'pendingDocuments') > 0 && (
                            <span className="ml-1 sm:ml-2 inline-flex items-center px-1 sm:px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <span className="hidden sm:inline">Pending</span>
                              <span className="sm:hidden">!</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="hidden sm:inline">Total: </span>{getUserStat(user.id, 'totalDocuments')}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(getUserStat(user.id, 'totalRevenue'))}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="hidden sm:inline">From </span>{getUserStat(user.id, 'totalTransactions')} <span className="hidden sm:inline">transactions</span><span className="sm:hidden">txns</span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap" onClick={() => handleUserClick(user.id)}>
                        <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                        {user.updatedAt !== user.createdAt && (
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(user.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user.id);
                          }}
                          className="text-purple-600 hover:text-purple-800 font-medium text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

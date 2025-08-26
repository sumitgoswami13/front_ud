import React, { useState, useEffect } from 'react';
import {
  getDocumentsByUser,
  getTransactionsByUser,
  updateDocumentStatus,
  uploadSignedDocument
} from '../api/api';
import DocumentNotes from './DocumentNotes';

const AdminUserDetail = ({ userId, onBack, onLogout }) => {
  const [documents, setDocuments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedDocumentForNotes, setSelectedDocumentForNotes] = useState(null);

  useEffect(() => {
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    }
    
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const [documentsResponse, transactionsResponse] = await Promise.all([
        getDocumentsByUser(userId),
        getTransactionsByUser(userId)
      ]);
      
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      } else {
        setDocuments([]);
      }
      
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    localStorage.removeItem('isAdmin');
    localStorage.clear();
    onLogout?.();
  };

  const handleStatusChange = (document) => {
    setSelectedDocument(document);
    setSelectedStatus(document.documentStatus || 'pending');
    setShowStatusModal(true);
  };

  const handleUploadSigned = (document) => {
    setSelectedDocument(document);
    setShowUploadModal(true);
  };

  const handleShowNotes = (document) => {
    setSelectedDocumentForNotes(document);
    setShowNotesModal(true);
  };

  const handleCloseNotes = () => {
    setShowNotesModal(false);
    setSelectedDocumentForNotes(null);
  };

  const updateStatus = async () => {
    if (!selectedDocument || !selectedStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      const response = await updateDocumentStatus(selectedDocument._id, selectedStatus);
      
      if (response.success) {
        // Update the document in the local state
        setDocuments(prev => 
          prev.map(doc => 
            doc._id === selectedDocument._id 
              ? { ...doc, documentStatus: selectedStatus }
              : doc
          )
        );
        setShowStatusModal(false);
        setSelectedDocument(null);
      } else {
        setError('Failed to update document status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update document status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const uploadSignedFile = async () => {
    if (!selectedDocument || !selectedFile) return;
    
    try {
      setIsUploadingFile(true);
      const response = await uploadSignedDocument(selectedDocument._id, selectedFile);
      
      if (response.success) {
        // Update the document with signed file info
        setDocuments(prev => 
          prev.map(doc => 
            doc._id === selectedDocument._id 
              ? { 
                  ...doc, 
                  signedDocumentLink: response.data?.signedDocumentLink || 'uploaded',
                  documentStatus: 'signed'
                }
              : doc
          )
        );
        setShowUploadModal(false);
        setSelectedDocument(null);
        setSelectedFile(null);
      } else {
        setError('Failed to upload signed document');
      }
    } catch (err) {
      console.error('Error uploading signed document:', err);
      setError('Failed to upload signed document. Please try again.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      signed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const getTransactionStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
        statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDownload = (documentLink, fileName) => {
    if (documentLink) {
      window.open(documentLink, '_blank');
    }
  };

  const getDocumentTypeIcon = (type) => {
    const icons = {
      aadhaar: '🆔',
      pan: '📄',
      passport: '📘',
      driving_license: '🚗',
      voter_id: '🗳️',
      birth_certificate: '👶',
      marriage_certificate: '💒',
      income_certificate: '💰',
      caste_certificate: '📋',
      domicile_certificate: '🏠',
      other: '📎'
    };

    return icons[type] || icons.other;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-2">Loading user details...</p>
          <p className="text-gray-500 text-sm">Fetching documents and transactions</p>
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
                  <span className="text-white font-bold text-sm">👤</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">User Details</span>
              </div>
              
              <div className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === 'documents'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Documents ({documents.length})
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === 'transactions'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transactions ({transactions.length})
                </button>
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
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Dashboard
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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User ID: {userId}</h2>
          <div className="text-sm text-gray-600">
            Managing documents and transactions for user: {userId.slice(-8)}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Documents Management</h2>
            </div>

            {documents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">This user hasn't uploaded any documents yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Signed Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">
                              {getDocumentTypeIcon(doc.documentType)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Document #{doc._id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Transaction: {doc.transactionId?.slice(-8) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {doc.documentType?.replace('_', ' ').toUpperCase() || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doc.documentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(doc.uploadedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {doc.signedDocumentLink ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-green-600 font-medium">✓ Available</span>
                              <button
                                onClick={() => handleDownload(doc.signedDocumentLink, 'signed-document')}
                                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                              >
                                Download
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not available</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleDownload(doc.documentLink, 'original-document')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Download original document"
                            >
                              📥
                            </button>
                            <button
                              onClick={() => handleStatusChange(doc)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Change status"
                            >
                              ⚙️
                            </button>
                            <button
                              onClick={() => handleUploadSigned(doc)}
                              className="text-green-600 hover:text-green-800"
                              title="Upload signed document"
                            >
                              📤
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">This user hasn't made any transactions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Breakdown
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents & Types
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{transaction.transactionId || transaction._id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-500">
                              DB ID: {transaction._id.slice(-8)}
                            </div>
                            {transaction.userInfo && (
                              <div className="text-xs text-gray-400 mt-1">
                                {transaction.userInfo.first_name} {transaction.userInfo.last_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(transaction.pricing?.total_amount || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Subtotal: {formatCurrency(transaction.pricing?.subtotal || 0)}
                          </div>
                          {transaction.pricing?.gst_amount && (
                            <div className="text-xs text-gray-500">
                              GST ({transaction.pricing.gst_percentage}%): {formatCurrency(transaction.pricing.gst_amount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTransactionStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(transaction.createdAt)}
                          </div>
                          {transaction.updatedAt !== transaction.createdAt && (
                            <div className="text-xs text-gray-500">
                              Updated: {formatDate(transaction.updatedAt)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs inline-block w-fit">
                              {transaction.metadata?.total_documents || transaction.documents?.length || 0} docs
                            </span>
                            {transaction.documents && transaction.documents.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {transaction.documents.map((doc, index) => (
                                  <div key={index} className="truncate max-w-32">
                                    {doc.document_type?.replace(/-/g, ' ') || 'Document'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Change Document Status</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Document: {selectedDocument?._id.slice(-8)}
                </p>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="signed">Signed</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateStatus}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Signed Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Signed Document</h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Document: {selectedDocument?._id.slice(-8)}
                </p>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadSignedFile}
                  disabled={!selectedFile || isUploadingFile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                >
                  {isUploadingFile ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;

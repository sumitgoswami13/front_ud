import React, { useState } from 'react';
import { getDocumentCategories } from '../data/pricing.js';

const AddDocumentModal = ({ isOpen, onClose, onContinue }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);

  const documentCategories = getDocumentCategories();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      documentType: '',
      status: 'uploaded'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDocumentTypeChange = (fileId, documentType) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, documentType } : file
      )
    );
  };

  const removeFile = (fileId) => {
    setDeletingFileId(fileId);
    setTimeout(() => {
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      setDeletingFileId(null);
    }, 200);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allFilesHaveDocumentType = uploadedFiles.length > 0 && uploadedFiles.every(file => file.documentType);

  const handleContinueToPayment = () => {
    const filesWithDocumentType = uploadedFiles.filter(f => f.documentType);
    onContinue(filesWithDocumentType);
  };

  const handleClose = () => {
    setUploadedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Documents</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload additional documents for UDIN processing
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Upload Area */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your files here
              </h3>
              <p className="text-gray-600 mb-4">
                or click to browse from your computer
              </p>
              <input
                type="file"
                multiple
                onChange={handleChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                id="add-file-upload"
              />
              <label
                htmlFor="add-file-upload"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md cursor-pointer transition-colors inline-block"
              >
                Select Files
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, JPEG, PDF, Word Files, Excel. Size: 1KB - 50MB
              </p>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <span className="text-sm text-gray-600">
                  {uploadedFiles.filter(f => f.documentType).length} completed
                </span>
              </div>

              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-white rounded flex items-center justify-center border">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <select
                          value={file.documentType}
                          onChange={(e) => handleDocumentTypeChange(file.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select document type</option>
                          {Object.entries(documentCategories).map(([category, documents]) => (
                            <optgroup key={category} label={category}>
                              {documents.map(doc => (
                                <option key={doc.key} value={doc.key}>
                                  {doc.name} - ₹{doc.price}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {file.documentType && (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        disabled={deletingFileId === file.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          deletingFileId === file.id
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-red-100 hover:bg-red-200'
                        }`}
                      >
                        {deletingFileId === file.id ? (
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          
          <div className="flex items-center space-x-4">
            {uploadedFiles.length > 0 && !allFilesHaveDocumentType && (
              <p className="text-sm text-gray-500">
                Please select document types for all files
              </p>
            )}
            
            <button
              onClick={handleContinueToPayment}
              disabled={!allFilesHaveDocumentType}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                allFilesHaveDocumentType
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;

import React, { useState, useEffect } from "react";
import { uploadDocuments, getTransaction, processDocuments } from "../api/api.jsx";

const AddDocumentProgress = ({
  isOpen,
  onClose,
  onUploadComplete,
  files,
  transactionId,
  paymentId
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFilePct, setCurrentFilePct] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [status, setStatus] = useState("preparing"); // 'preparing' | 'validating' | 'uploading' | 'processing' | 'completed'
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadSummary, setUploadSummary] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const startUploadFlow = async () => {
      try {
        setStatus("preparing");
        
        // Short delay for UX
        setTimeout(() => {
          if (!files || files.length === 0) {
            setStatus("completed");
            setErrorMessage("No files found to upload.");
            setTimeout(() => onUploadComplete?.(), 1000);
            return;
          }
          handleUploadFlow(files);
        }, 400);
      } catch (err) {
        console.error("Upload preparation error:", err);
        setErrorMessage("Failed to prepare files for upload.");
        setStatus("completed");
        setTimeout(() => onUploadComplete?.(), 1000);
      }
    };

    startUploadFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleUploadFlow = async (uploadFiles) => {
    try {
      // 1) Validate transaction
      setStatus("validating");

      let businessTxId = transactionId || localStorage.getItem("current_add_document_transaction_id");
      if (!businessTxId) {
        throw new Error("No transaction found. Please complete payment first.");
      }

      const txRes = await getTransaction(businessTxId);
      if (!txRes?.success) throw new Error("Transaction not found. Please contact support.");

      const tx = txRes.data || txRes;
      const paid =
        tx.status === "completed" ||
        tx.status === "paid" ||
        tx.paymentStatus === "completed";
      if (!paid) {
        throw new Error("Payment not completed. Please finish payment before uploading.");
      }

      // 2) Upload files one-by-one
      setStatus("uploading");
      setCurrentFileIndex(0);
      setCurrentFilePct(0);
      setUploadedCount(0);

      const summary = await uploadDocuments(businessTxId, uploadFiles, (idx, pct, fileName) => {
        setCurrentFileIndex(idx);
        setCurrentFilePct(Math.round(pct));

        if (Math.round(pct) >= 100) {
          setUploadedCount((prev) => Math.max(prev, idx + 1));
        }
      });

      setUploadSummary(summary?.data || summary);

      // 3) Optional server-side processing step
      setStatus("processing");
      try {
        const proc = await processDocuments(businessTxId);
        console.log("Processing result:", proc);
      } catch (e) {
        console.warn("Processing step skipped/failed:", e?.message);
      }

      // 4) Clean up
      try {
        localStorage.removeItem("current_add_document_transaction_id");
      } catch (e) {
        console.warn("Cleanup warning:", e);
      }

      setStatus("completed");
    } catch (err) {
      console.error("Upload flow error:", err);
      setErrorMessage(err.message || "Upload failed");
      setStatus("completed");
      setTimeout(() => {
        alert(`Upload failed: ${err.message}`);
      }, 300);
    }
  };

  if (!isOpen) return null;

  // Calculate overall progress
  const total = files?.length || 0;
  const overallPct =
    total > 0 ? Math.min(100, Math.round(((uploadedCount * 100 + currentFilePct) / (total * 100)) * 100)) : 0;

  const isComplete = status === "completed" && !errorMessage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {isComplete ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isComplete ? "Upload Complete!" : "Uploading Additional Documents"}
          </h1>
          <p className="text-green-100 text-sm mt-2">
            {status === "preparing" && "Preparing your documents for upload..."}
            {status === "validating" && "Validating payment and transaction status..."}
            {status === "uploading" && "Your additional documents are being securely uploaded"}
            {status === "processing" && "Processing documents..."}
            {status === "completed" && (errorMessage ? "Upload finished with errors" : "All additional documents processed successfully!")}
          </p>
        </div>

        <div className="p-8">
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {uploadedCount}/{total} files
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{overallPct}% complete</p>
          </div>

          {/* Current File Progress */}
          {status === "uploading" && currentFileIndex < total && (
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {files[currentFileIndex]?.name}
                  </p>
                  <p className="text-xs text-gray-500">Uploading...</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${currentFilePct}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Blocks */}
          {status === "validating" && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Validating Transaction</p>
                    <p className="text-sm text-blue-700">Checking payment status and permissions…</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Processing Documents</p>
                    <p className="text-sm text-purple-700">Generating UDINs and finalizing…</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Blocks */}
          {status === "completed" && !errorMessage && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Additional Documents Processed Successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      All documents have been uploaded and processed.
                    </p>
                    {uploadSummary && (
                      <div className="mt-2 text-xs text-green-600">
                        <p>Upload ID: {uploadSummary.upload_id}</p>
                        <p>Files Processed: {uploadSummary.total_files}</p>
                        <p>Status: {uploadSummary.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "completed" && errorMessage && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Upload Failed</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    <p className="text-xs text-red-600 mt-2">Please contact support if this persists.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer action */}
          <button
            onClick={() => (status === "completed" ? onUploadComplete?.() : onClose?.())}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              status === "completed"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status === "completed" ? "Back to Dashboard" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentProgress;

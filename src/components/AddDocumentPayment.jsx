import React, { useState, useEffect } from "react";
import { calculateTotal } from "../data/pricing.js";
import {
  createTransaction,
  updateTransactionPayment,
} from "../api/api.jsx";

const LOCAL_USER_KEY = "udin:user";

const AddDocumentPayment = ({ files, onBack, onPaymentSuccess }) => {
  console.log("AddDocumentPayment: Component mounted with props", { files, onBack, onPaymentSuccess });

  const [calculation, setCalculation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setRazorpayLoaded(false);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    console.log("AddDocumentPayment: useEffect triggered", { files });
    setIsLoading(true);
    try {
      if (files && files.length > 0) {
        console.log("AddDocumentPayment: Processing files for calculation", files);
        const calc = calculateTotal(files);
        console.log("AddDocumentPayment: Calculation result", calc);
        setCalculation(calc);
      } else {
        console.log("AddDocumentPayment: No files provided", { files });
      }

      // Try multiple user storage keys
      let raw = localStorage.getItem(LOCAL_USER_KEY);
      if (!raw) {
        raw = localStorage.getItem('userData');
      }

      if (raw) {
        const user = JSON.parse(raw);
        console.log("AddDocumentPayment: User found in localStorage", user);
        setLocalUser(user);
      } else {
        console.log("AddDocumentPayment: No user found in localStorage");
        // Log all localStorage keys for debugging
        console.log("All localStorage keys:", Object.keys(localStorage));
      }
    } catch (e) {
      console.error("Error processing payment data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const getUserId = () => localUser?.id || localStorage.getItem('userId') || null;

  const buildUserInfoForTransaction = () => {
    const l = localUser || {};
    return {
      firstName: l.firstName ?? "",
      lastName: l.lastName ?? "",
      email: l.email ?? "",
      phone: l.phoneNumber ?? "",
      address: l.address ?? "",
      state: l.state ?? "",
      pinCode: l.pinCode ?? "",
    };
  };

  const handlePayment = async () => {
    // Try to load Razorpay if not available
    if (!window.Razorpay) {
      console.log("Razorpay not found, attempting to load...");
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => {
            setRazorpayLoaded(true);
            resolve();
          };
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error("Failed to load Razorpay:", error);
        alert("Payment system could not be loaded. Please check your internet connection and try again.");
        return;
      }
    }

    if (!window.Razorpay) {
      alert("Payment system not available. Please refresh and try again.");
      return;
    }
    if (!calculation) {
      alert("Calculation data missing. Please go back and try again.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const uid = getUserId();
      if (!uid) throw new Error("User not found. Please log in again.");

      const txUserInfo = buildUserInfoForTransaction();

      // Prepare documents with document_type
      const documents = files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        document_type: f.documentType || "other",
        document_category:
          calculation.items.find((i) => i.documentType === f.documentType)?.name ||
          "general",
      }));

      const pricing = {
        subtotal: calculation.subtotal,
        gst_amount: calculation.gst,
        total_amount: calculation.total,
        currency: "INR",
      };

      // 1) Create transaction
      const txRes = await createTransaction({
        userId: uid,
        userInfo: txUserInfo,
        documents,
        pricing,
      });

      const txData = txRes?.data || txRes;
      const transactionId = txData?.transaction_id || txData?.transactionId;
      if (!transactionId) throw new Error("Could not create transaction");
      localStorage.setItem("current_add_document_transaction_id", transactionId);

      // 2) Open Razorpay
      const key =
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        (import.meta.env.DEV ? "rzp_test_R93byKz54qIzaa" : null);
      if (!key) throw new Error("Razorpay key not configured (VITE_RAZORPAY_KEY_ID).");

      const rzp = new window.Razorpay({
        key,
        amount: Math.round(calculation.total * 100),
        currency: "INR",
        name: "UDIN Professional Services",
        description: `Additional document processing - ${transactionId}`,
        prefill: {
          name: `${txUserInfo.firstName || ""} ${txUserInfo.lastName || ""}`.trim(),
          email: txUserInfo.email || "",
          contact: txUserInfo.phone || "",
        },
        theme: { color: "#7C3AED" },
        retry: { enabled: true, max_count: 3 },
        timeout: 300,
        remember_customer: false,
        modal: {
          ondismiss: () => setIsProcessingPayment(false),
          confirm_close: true,
          escape: true,
          animation: true,
          backdrop_close: false,
        },
        handler: async (resp) => {
          try {
            // 3) Mark transaction as paid on backend
            await updateTransactionPayment(transactionId, {
              payment_id: resp.razorpay_payment_id,
              order_id: transactionId,
              signature: resp.razorpay_signature || "direct_payment_no_signature",
              method: "razorpay",
              currency: "INR",
              paid_at: new Date().toISOString(),
            });

            setIsProcessingPayment(false);

            // Pass both transaction and payment IDs to parent
            onPaymentSuccess?.(transactionId, resp.razorpay_payment_id);
          } catch (e) {
            setIsProcessingPayment(false);
            console.error("Payment post-update failed:", e);
            alert(
              "Payment succeeded but updating records failed. Please contact support with Transaction ID: " +
                transactionId
            );
          }
        },
      });

      rzp.on("payment.failed", (res) => {
        setIsProcessingPayment(false);
        alert(
          `Payment failed: ${res.error.description}\nError Code: ${res.error.code}\nReason: ${
            res.error.reason || "Unknown"
          }\nTransaction ID: ${transactionId}`
        );
      });

      rzp.on("payment.error", (res) => {
        setIsProcessingPayment(false);
        alert(`Payment error occurred: ${res.error?.description || "Unknown error"}`);
      });

      rzp.open();
    } catch (err) {
      setIsProcessingPayment(false);
      console.error("Error in payment flow:", err);
      alert(`Error initiating payment: ${err.message}. Please try again.`);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!calculation || !files || files.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No documents found for payment.</p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Payment Summary</h1>
          <p className="text-purple-100 text-sm mt-2">Additional Documents</p>
        </div>

        <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Items */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                {files.length} document{files.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {calculation.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{files[idx]?.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Standard</span>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">UDIN Required</span>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{calculation.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">GST (18%)</span>
                <span className="font-medium text-gray-900">
                  ₹{calculation.gst.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{calculation.total.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-gray-500">(Including all taxes)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing */}
          {localUser && (
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h3 className="font-medium text-gray-900 mb-2">Billing Information</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>{localUser.firstName} {localUser.lastName}</p>
                <p>{localUser.email}</p>
                <p>{localUser.phoneNumber}</p>
                <p>{localUser.address}</p>
                <p>{localUser.state}, {localUser.pinCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="p-4 bg-yellow-50 border-t border-yellow-200 text-xs">
          <div>Debug Info:</div>
          <div>razorpayLoaded: {razorpayLoaded.toString()}</div>
          <div>isProcessingPayment: {isProcessingPayment.toString()}</div>
          <div>calculation: {calculation ? 'exists' : 'null'}</div>
          <div>files count: {files ? files.length : 0}</div>
          <div>Razorpay available: {typeof window.Razorpay !== 'undefined' ? 'yes' : 'no'}</div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t bg-gray-50">
          <button
            onClick={onBack}
            disabled={isProcessingPayment}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-medium transition-all duration-200"
          >
            Back
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isProcessingPayment
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 shadow-lg"
            } text-white`}
          >
            {isProcessingPayment ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening Payment...</span>
              </span>
            ) : !razorpayLoaded ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading Razorpay... (Click anyway to test)</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Pay ₹{calculation.total.toLocaleString("en-IN")} Now</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentPayment;

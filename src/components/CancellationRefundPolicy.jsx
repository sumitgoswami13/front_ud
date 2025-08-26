import React from 'react';
import { useNavigate } from 'react-router-dom';

const CancellationRefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Cancellation & Refund Policy</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <h3 className="font-semibold text-red-900">Important Cancellation Window</h3>
                </div>
                <p className="text-red-800 text-sm">
                  Cancellations are allowed only before document verification starts.
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Once verification or signing begins, cancellation is not possible.</li>
                <li>The cancellation window closes when our team begins processing your documents.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Conditions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <h3 className="font-semibold text-green-900">Full Refund</h3>
                  </div>
                  <p className="text-green-800 text-sm">
                    If service cannot be provided due to internal/system error.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-white text-sm">~</span>
                    </div>
                    <h3 className="font-semibold text-yellow-900">Partial Refund</h3>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    If only part of the service is delivered (case-by-case basis).
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-white text-sm">✕</span>
                    </div>
                    <h3 className="font-semibold text-red-900">No Refund</h3>
                  </div>
                  <p className="text-red-800 text-sm">
                    If user submits wrong/incomplete documents or cancels after processing starts.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Process</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">How to Request a Refund</h3>
                <div className="space-y-2 text-blue-800 text-sm">
                  <p>📧 <strong>Email:</strong> support@udin.in</p>
                  <p>⏰ <strong>Time Limit:</strong> Within 7 days of payment</p>
                  <p>💳 <strong>Processing Time:</strong> 7–10 business days to original payment method</p>
                </div>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All refund requests must include your transaction ID and reason for refund.</li>
                <li>Refunds are processed to the original payment method used for the transaction.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Exceptions (Non-Refundable)</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">The following are not eligible for refunds:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Customized/manual services once initiated.</li>
                  <li>Cases of misuse, fraud, or breach of terms by the user.</li>
                  <li>Services completed as per agreed specifications.</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Contact Customer Support</h3>
                    <p className="text-gray-700 text-sm">
                      Users should first approach our customer support team at support@udin.in for resolution.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Legal Resolution</h3>
                    <p className="text-gray-700 text-sm">
                      If unresolved, disputes shall be settled under Indian Arbitration Act, 1996.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Need Help?</h3>
              <p className="text-orange-800">
                If you have questions about cancellations or refunds, our support team is here to help. 
                Contact us at support@udin.in and we'll assist you with your request.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p><strong>Website:</strong> www.udin.in</p>
              <p><strong>Email:</strong> info@udin.in</p>
              <p><strong>Contact:</strong> +91-9836777722</p>
              <p className="mt-2"><strong>Prepared by:</strong> DialMyCA Private Limited</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefundPolicy;

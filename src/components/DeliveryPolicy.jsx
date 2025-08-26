import React from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Delivery Policy</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                  <span className="text-white text-sm">📧</span>
                </div>
                <h3 className="font-semibold text-blue-900">Digital Delivery Platform</h3>
              </div>
              <p className="text-blue-800">
                As udin.in is a digital platform, no physical delivery is involved. All services are delivered electronically.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Delivery</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Uploaded documents are verified and signed digitally.</li>
                <li>Final signed documents are delivered in PDF format through the user dashboard.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Turnaround Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                    <h3 className="font-semibold text-green-900">Standard Documents</h3>
                  </div>
                  <p className="text-green-800 text-sm">24–72 hours</p>
                  <p className="text-green-700 text-xs mt-2">Most common document types and standard processing</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-white text-xs">🔧</span>
                    </div>
                    <h3 className="font-semibold text-orange-900">Complex/Manual Jobs</h3>
                  </div>
                  <p className="text-orange-800 text-sm">Up to 7 business days</p>
                  <p className="text-orange-700 text-xs mt-2">Specialized documents requiring manual review</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Any delays beyond timelines will be notified to the user via email/SMS.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking & Communication</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Document Progress Tracking</h3>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">1</div>
                    <span className="text-sm text-gray-600 mt-2 text-center">Uploaded</span>
                  </div>
                  <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">2</div>
                    <span className="text-sm text-gray-600 mt-2 text-center">Verified</span>
                  </div>
                  <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">3</div>
                    <span className="text-sm text-gray-600 mt-2 text-center">Signed</span>
                  </div>
                  <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">✓</div>
                    <span className="text-sm text-gray-600 mt-2 text-center">Downloadable</span>
                  </div>
                </div>
              </div>

              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Each job gets a unique work ID for easy tracking.</li>
                <li>Users can track real-time progress through their dashboard.</li>
                <li>Status notifications are sent by SMS, email, and dashboard alerts.</li>
              </ul>
            </section>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Stay Updated</h3>
              <p className="text-purple-800">
                We keep you informed at every step of the process. Track your document status in real-time and receive 
                notifications when your documents are ready for download.
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

export default DeliveryPolicy;

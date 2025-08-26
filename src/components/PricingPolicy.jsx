import React from 'react';
import { useNavigate } from 'react-router-dom';

const PricingPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Pricing Policy</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
              <p className="text-purple-800 font-medium">
                At udin.in, we ensure complete transparency in pricing. Our pricing model is structured to suit
                multiple document types and compliance requirements.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scope</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Prices are quoted in Indian Rupees (INR).</li>
                <li>Applicable GST will be added wherever required.</li>
                <li>All service charges are listed clearly on the website.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Charges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Audit Services</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Statutory Audit (turnover slabs)</li>
                    <li>• Tax Audit</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Other Services</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Balance Sheet (final & provisional)</li>
                    <li>• Auditor Appointment, ROC, Certificates</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-yellow-800 text-xs font-bold">!</span>
                  </div>
                  <h3 className="font-semibold text-yellow-800">Important Payment Information</h3>
                </div>
                <p className="text-yellow-800 text-sm">
                  100% advance payment is required for all services.
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Payments are processed through Razorpay or other RBI-approved payment gateways.</li>
                <li>No hidden charges—if any additional charges apply, they are disclosed before checkout.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Revision</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Prices may be revised from time to time without prior notice.</li>
                <li>Revised pricing does not affect already-paid jobs.</li>
              </ul>
            </section>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Transparent Pricing Promise</h3>
              <p className="text-green-800">
                We believe in complete transparency. All charges are clearly displayed on our website before you proceed 
                with your payment. No surprises, no hidden fees.
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

export default PricingPolicy;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Personal details: Name, contact number, email, address.</li>
                <li>Uploaded documents for signing.</li>
                <li>Payment details (handled by third-party gateway, not stored by us).</li>
                <li>Technical data (IP address, browser, device info).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Data</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Verify and authenticate documents.</li>
                <li>Deliver services and provide updates.</li>
                <li>Process payments securely.</li>
                <li>Internal research, audits, and compliance.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Protection Measures</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encrypted data storage and transfer.</li>
                <li>Access to data restricted to authorized staff only.</li>
                <li>Multi-level authentication for document vault access.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Rights</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Right to access and download stored documents.</li>
                <li>Right to request deletion of personal data (except regulatory records).</li>
                <li>Right to withdraw consent at any time (services will stop accordingly).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-party Sharing</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We do not sell user data.</li>
                <li>Data may be shared with regulators, government bodies, or courts if required by law.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies Policy</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We use cookies for analytics, session management, and better UX.</li>
                <li>Users can disable cookies via browser settings.</li>
              </ul>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Your Privacy Matters</h3>
              <p className="text-blue-800">
                At UDIN.in, we are committed to protecting your privacy and ensuring the security of your personal information. 
                If you have any questions about this privacy policy or how we handle your data, please contact us at info@udin.in.
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

export default PrivacyPolicy;

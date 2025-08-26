import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance</h2>
              <p className="text-gray-700 leading-relaxed">
                By using udin.in, you agree to abide by these terms. If you do not agree, please discontinue use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Obligations</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide genuine documents. Fake or fraudulent submissions will lead to termination and legal action.</li>
                <li>Maintain confidentiality of your login credentials.</li>
                <li>Ensure timely payment to avoid delays in services.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scope of Services</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>UDIN.in acts as a facilitator of document verification and signing.</li>
                <li>Responsibility is limited to delivering verified and digitally signed files.</li>
                <li>We do not represent or guarantee acceptance of documents by external authorities/regulators.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Payments are non-transferable.</li>
                <li>Refunds, if applicable, are subject to the Refund Policy.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>UDIN.in shall not be liable for indirect, incidental, or consequential damages.</li>
                <li>Our maximum liability is limited to the amount paid for the disputed service.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Uploading malicious, offensive, or fraudulent content.</li>
                <li>Attempting to hack, reverse-engineer, or misuse the platform.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Governing Law & Jurisdiction</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Governed by the laws of India.</li>
                <li>Jurisdiction lies with courts in Kolkata, West Bengal.</li>
              </ul>
            </section>
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

export default TermsConditions;

import React from 'react';

const TermsOfService = () => (
  <div className="pt-24 min-h-screen bg-bg-light px-4 pb-16">
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-4xl font-bold text-header mb-6 flex items-center gap-2">
        <span role="img" aria-label="document">📄</span> Terms of Service – LifeLane
      </h1>
      <p className="text-gray-700 mb-8">
        By using LifeLane, you agree to the following terms. These govern your access to the platform, emergency services, and siren code system.
      </p>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">1. Purpose of LifeLane</h2>
          <p className="text-gray-700">LifeLane allows users to turn private vehicles into temporary emergency transport when ambulances aren't available. Verification is done manually by LifeLane's internal admin team, not by hospitals.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">2. Eligibility</h2>
          <p className="text-gray-700">You must be 18+ or have guardian consent to use the platform.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">3. Emergency Request Guidelines</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>All details submitted must be accurate and truthful</li>
            <li>False or non-emergency requests will result in:
              <ul className="list-disc pl-6">
                <li>Suspension of account</li>
                <li>Denial of future requests</li>
                <li>Legal action if required</li>
              </ul>
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">4. Siren Activation Code</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Each approved request generates a unique, one-time-use code</li>
            <li>This code is linked to your request and becomes invalid after use or expiry</li>
            <li>Codes must be entered into your authorized LifeLane siren device only</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">5. Siren Device Use</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Device must be installed securely and used only when a valid code is active</li>
            <li>Misuse of the device (e.g., fake emergencies, code sharing) is strictly prohibited</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">6. Limitations & Liability</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>LifeLane is a supportive tool and does not replace medical transport services. We are not responsible for:</li>
            <ul className="list-disc pl-6">
              <li>Delay in admin approvals</li>
              <li>Failure to reach destination</li>
              <li>Legal or traffic issues resulting from improper siren use</li>
            </ul>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">7. Account Suspension</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>We reserve the right to suspend or terminate accounts that:</li>
            <ul className="list-disc pl-6">
              <li>Abuse the emergency system</li>
              <li>Repeatedly submit invalid requests</li>
              <li>Violate these terms</li>
            </ul>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfService; 
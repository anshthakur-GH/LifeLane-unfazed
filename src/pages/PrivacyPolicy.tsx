import React from 'react';

const PrivacyPolicy = () => (
  <div className="pt-24 min-h-screen bg-bg-light px-4 pb-16">
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-4xl font-bold text-header mb-6 flex items-center gap-2">
        <span role="img" aria-label="lock">🔐</span> Privacy Policy – LifeLane
      </h1>
      <p className="text-gray-700 mb-8">
        At LifeLane, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your information when you use our platform to request emergency transport assistance.
      </p>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">1. Information We Collect</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li><span className="font-semibold">User Details:</span> Name, phone number, email, and login credentials</li>
            <li><span className="font-semibold">Emergency Details:</span> Patient name, age, description of the medical issue, and optional uploaded image</li>
            <li><span className="font-semibold">Device Info:</span> Browser type, device type, IP address</li>
            <li><span className="font-semibold">Location Info:</span> If manually shared by the user</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>To verify emergency requests through our internal admin team</li>
            <li>To generate and assign one-time siren activation codes</li>
            <li>To notify you of request status (approved, rejected)</li>
            <li>To improve the safety and reliability of our services</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">3. Data Sharing</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Your data is only accessed by our internal admin team for verification.</li>
            <li>We do not share, sell, or distribute your information to hospitals or third parties.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">4. Data Security</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>We use secure backend infrastructure and role-based access control to protect your data.</li>
            <li>All sensitive actions (like code generation) are logged and monitored.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">5. Your Rights</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>You can request to view, update, or delete your information.</li>
            <li>You can deactivate your account at any time.</li>
            <li>Contact: <a href="mailto:lifelanesupport@gmail.com" className="text-primary underline">lifelanesupport@gmail.com</a> for any data concerns.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-header mb-2">6. Policy Updates</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>This policy may be updated as needed. You'll be notified of significant changes through app or email alerts.</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy; 
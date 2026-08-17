import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-blue">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using SmartCare, you accept and agree to be bound by the terms and provision of this agreement.
      </p>

      <h2>2. User Registration</h2>
      <p>
        In order to use most of the features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
      </p>

      <h2>3. Medical Disclaimer</h2>
      <p>
        SmartCare is a technology platform connecting patients with healthcare providers. We do not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
      </p>

      <h2>4. User Conduct</h2>
      <p>
        You agree not to use the platform to:
      </p>
      <ul>
        <li>Violate any local, state, national, or international law</li>
        <li>Impersonate any person or entity</li>
        <li>Interfere with or disrupt the services or servers</li>
      </ul>

      <h2>5. Modifications to Service</h2>
      <p>
        SmartCare reserves the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
      </p>
    </div>
  );
}

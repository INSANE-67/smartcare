import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-blue">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <p>
        At SmartCare, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our platform.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We may collect personal identification information from Users in a variety of ways, including, but not limited to, when Users visit our site, register on the site, fill out a form, and in connection with other activities, services, features or resources we make available on our Site.
      </p>

      <h2>2. How We Use Collected Information</h2>
      <p>
        SmartCare may collect and use Users personal information for the following purposes:
      </p>
      <ul>
        <li>To improve customer service</li>
        <li>To personalize user experience</li>
        <li>To improve our Site</li>
        <li>To process payments</li>
        <li>To send periodic emails</li>
      </ul>

      <h2>3. How We Protect Your Information</h2>
      <p>
        We adopt appropriate data collection, storage and processing practices and security measures to protect against unauthorized access, alteration, disclosure or destruction of your personal information, username, password, transaction information and data stored on our Site.
      </p>

      <h2>4. Changes to This Privacy Policy</h2>
      <p>
        SmartCare has the discretion to update this privacy policy at any time. When we do, we will revise the updated date at the top of this page.
      </p>
    </div>
  );
}

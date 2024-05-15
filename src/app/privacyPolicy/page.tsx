// pages/privacy-policy.tsx

import React from "react";
import Link from "next/link";

const PrivacyPolicy: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "zinc-100",
        color: "zinc-900",
        padding: "3rem",
      }}
    >
      <h1 className="title text-center">Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> 4/10/24
      </p>

      <p>
        We value your privacy and are committed to protecting your personal
        information. This Privacy Policy outlines the data we collect, how we
        use it, and your rights regarding your data.
      </p>

      <h2 className="subtitle-style p-2">Information We Collect</h2>
      <ol>
        <li>
          <strong>Personal Information:</strong> When you interact with our
          platform, you may voluntarily provide us with personal information
          such as your name, email address, and contact details.
        </li>
        <li>
          <strong>Usage Information:</strong> We may collect data on how you
          interact with our platform, including your IP address, browser type,
          and interaction data to improve our services.
        </li>
        <li>
          <strong>Cookies:</strong> Our website uses cookies to enhance the user
          experience, providing features like remembering your preferences.
        </li>
      </ol>

      <h2 className="subtitle-style p-2">How We Use Information</h2>
      <ol>
        <li>Improve user experience and services.</li>
        <li>Analyze usage patterns for platform optimization.</li>
        <li>Respond to user inquiries and support requests.</li>
      </ol>

      <h2 className="subtitle-style p-2">Data Sharing</h2>
      <ol>
        <li>To comply with legal obligations.</li>
        <li>To protect our rights, users, and third parties.</li>
        <li>In connection with a merger or acquisition.</li>
      </ol>

      <h2 className="subtitle-style p-2">Your Rights</h2>
      <ol>
        <li>Access, correct, or delete your data.</li>
        <li>Withdraw consent where we rely on it for data processing.</li>
        <li>Opt-out of any marketing communications.</li>
      </ol>

      <h2 className="subtitle-style p-2">Changes to This Policy</h2>
      <p>
        We may update this policy periodically. Any changes will be communicated
        on our platform, and your continued use indicates acceptance of the new
        terms.
      </p>

      <h2 className="subtitle-style p-2">Contact Us</h2>
      <p>
        For questions or concerns, reach out to us at{" "}
        <a href="mailto:njwright92@gmail.com">njwright92@gmail.com</a>.
      </p>

      <div style={{ marginTop: "4rem" }}>
      <Link className="btn hover:underline hover:text-blue-500" href="/">
          Go back to Home</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

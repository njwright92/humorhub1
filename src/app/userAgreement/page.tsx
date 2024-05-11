// pages/user-agreement.tsx

import React from "react";
import Link from "next/link";

const UserAgreement: React.FC = () => {
  return (
    <div style={{ backgroundColor: "white", color: "black", padding: "20px" }}>
      <h1>User Agreement (Terms of Use)</h1>
      <p>
        <strong>Last updated:</strong> 4/10/24
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By using this platform, you agree to the following Terms of Use. If you
        do not agree with these terms, please discontinue use immediately.
      </p>

      <h2>Open Source and MIT License</h2>
      <p>
        This project is open source and available under the MIT License, meaning
        that:
      </p>
      <ol>
        <li>
          Permission is granted to use, copy, modify, and distribute the
          software with or without modification, free of charge.
        </li>
        <li>
          The software is provided "as is," without warranty of any kind. Use at
          your own risk.
        </li>
      </ol>

      <h2>Responsibilities</h2>
      <ol>
        <li>
          <strong>Content:</strong> You are responsible for any content or
          information you share or upload. Ensure it complies with local and
          international laws.
        </li>
        <li>
          <strong>Conduct:</strong> You agree not to misuse the platform by
          engaging in harmful, unlawful, or abusive behavior.
        </li>
        <li>
          <strong>Compliance:</strong> Use of the platform must comply with
          applicable laws, regulations, and best practices.
        </li>
      </ol>

      <h2>Disclaimer of Warranties</h2>
      <p>
        The software is provided "as is," without warranties or guarantees of
        any kind. The platform operators disclaim any implied warranties of
        merchantability, fitness for a particular purpose, or non-infringement.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        In no event shall the platform operators or contributors be liable for
        any direct, indirect, incidental, or consequential damages arising from
        the use or inability to use the software.
      </p>

      <h2>Changes to This Agreement</h2>
      <p>
        We may update this agreement periodically. Your continued use of the
        platform constitutes acceptance of the new terms.
      </p>

      <h2>Contact Information</h2>
      <p>
        For questions or feedback, contact us at{" "}
        <a
          className="hover:underline hover:text-blue-500"
          href="mailto:njwright92@gmail.com"
        >
          njwright92@gmail.com
        </a>
        .
      </p>

      <div style={{ marginTop: "20px" }}>
        <Link className="hover:underline hover:text-blue-500" href="/">
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default UserAgreement;

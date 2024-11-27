import React from "react";
import Link from "next/link";
import Head from "next/head";

const UserAgreement: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "zinc-100",
        color: "zinc-900",
        padding: "3rem",
      }}
    >
      <Head>
        <title>User Agreement - Humor Hub</title>
        <meta
          name="description"
          content="Read the terms and conditions of using Humor Hub. Understand your rights and responsibilities as a user of our platform."
        />
        <meta
          name="keywords"
          content="User Agreement, terms and conditions, Humor Hub policy"
        />
        <link
          rel="canonical"
          href="https://www.thehumorhub.com/userAgreement"
        />
        <meta property="og:title" content="User Agreement - Humor Hub" />
        <meta
          property="og:description"
          content="Read the terms and conditions of using Humor Hub. Understand your rights and responsibilities as a user of our platform."
        />
        <meta
          property="og:url"
          content="https://www.thehumorhub.com/userAgreement"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-useragreement.jpg"
        />
      </Head>

      <h1 className="title text-center content-with-sidebar">
        User Agreement (Terms of Use)
      </h1>
      <p>
        <strong>Last updated:</strong> 4/10/24
      </p>

      <h2 className="subtitle-style p-2">UserAcceptance of Terms</h2>
      <p>
        By using this platform, you agree to the following Terms of Use. If you
        do not agree with these terms, please discontinue use immediately.
      </p>

      <h2 className="subtitle-style p-2">UserOpen Source and MIT License</h2>
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
          The software is provided &#34;as is,&#34; without warranty of any
          kind. Use at your own risk.
        </li>
      </ol>

      <h2 className="subtitle-style p-2">UserResponsibilities</h2>
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

      <h2 className="subtitle-style p-2">UserDisclaimer of Warranties</h2>
      <p>
        The software is provided &#34;as is,&#34; without warranties or
        guarantees of any kind. The platform operators disclaim any implied
        warranties of merchantability, fitness for a particular purpose, or
        non-infringement.
      </p>

      <h2 className="subtitle-style p-2">UserLimitation of Liability</h2>
      <p>
        In no event shall the platform operators or contributors be liable for
        any direct, indirect, incidental, or consequential damages arising from
        the use or inability to use the software.
      </p>

      <h2 className="subtitle-style p-2">UserChanges to This Agreement</h2>
      <p>
        We may update this agreement periodically. Your continued use of the
        platform constitutes acceptance of the new terms.
      </p>

      <h2 className="subtitle-style p-2">UserContact Information</h2>
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

      <div style={{ marginTop: "4rem" }}>
        <Link className="btn hover:underline hover:text-blue-500" href="/">
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default UserAgreement;

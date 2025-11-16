import React from "react";
import Link from "next/link";
import Head from "next/head";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("../components/header"), {});
const Footer = dynamic(() => import("../components/footer"), {});

const About: React.FC = () => (
  <>
    <Head>
      <title>About Humor Hub Mission &amp; Tools</title>
      <meta
        name="description"
        content="Humor Hub empowers comedians with real-time event listings, AI brainstorming, a digital notebook, and curated news to supercharge your career."
      />
      <link rel="canonical" href="https://www.thehumorhub.com/about" />
      <meta property="og:title" content="About Humor Hub Mission &amp; Tools" />
      <meta
        property="og:description"
        content="Discover how Humor Hub helps you find gigs, capture ideas, refine routines, and stay inspired."
      />
      <meta property="og:url" content="https://www.thehumorhub.com/about" />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content="https://www.thehumorhub.com/images/og-image-about.jpg"
      />
    </Head>

    <Header />

    <div className="screen-container p-4 m-4 text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-orange-500 mb-4">About Us</h1>

      <p className="mb-8">
        Humor Hub was built by working comics who needed a better workflow: find
        the next gig, and get inspiration from real-time headlines.
      </p>

      <section className="mb-8 text-left">
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">
          Mic Finder
        </h2>
        <p className="mb-2">
          Search 500+ cities for Comedy Mics, Music/All arts and
          festivals/Competitions. Filter by date, genre or venue size.
        </p>
        <p>
          Venue managers can list events in seconds. The wider our database, the
          more chances you get stage time whether you are testing new material
          or headlining.
        </p>
      </section>

      {/* <section className="mb-8 text-left">
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">JokePad</h2>
        <p className="mb-2">
          Your digital comedy notebook: tag by topic, stage, or date. Track
          audience reactions, log notes on delivery, and revisit old riffs with
          search, sort, and archive functionality.
        </p>
        <p>
          Whether it is late-night set prep or on-the-road revisions, JokePad
          keeps your material organized and actionable.
        </p>
      </section> */}

      <section className="mb-8 text-left">
        <h2 className="text-2xl font-semibold text-orange-500 mb-2">
          Hub News
        </h2>
        <p>
          Curated headlines across Business, Entertainment, Tech, Sports,
          Science and more—updated every hour. Perfect for topical jokes,
          current-event callbacks, or finding that unexpected angle for your
          next routine.
        </p>
      </section>

      <Link href="/">
        <span className="text-blue-500 hover:underline">← Back to Home</span>
      </Link>
    </div>

    <Footer />
  </>
);

export default About;

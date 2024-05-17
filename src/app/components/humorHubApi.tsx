import React from "react";
import Link from "next/link";
import news from "../../app/news.webp";
import Image from "next/image";

const HumorHubAPISection: React.FC = () => {
  return (
    <div
      className="card-style rounded-lg shadow-lg p-4 bg-zinc-900 text-zinc-200"
      data-aos="fade-up"
    >
      <h1 className="title-style text-3xl font-bold text-center drop-shadow-md">
        Humor Hub News
      </h1>
      <h2 className="text-center text-lg">
        Your Go-To Source for the Latest Trends
      </h2>

      {/* Main Content Section with Image and Text */}
      <div
        className="card-style rounded-lg shadow-lg bg-zinc-900 text-zinc-200 flex flex-col md:flex-row items-center justify-center p-4"
        data-aos="fade-up"
      >
        <Image
          src={news}
          alt="Visual Representation of Humor Hub News"
          width={250}
          height={250}
          className="rounded-xl shadow-lg -mt-10 md:mr-4 mb-4 md:mb-0"
        />
        <div className="flex-1">
          <p className="mb-4 mt-4 text-md">
            Dive into the latest trends in humor and entertainment with Humor
            Hub News, your premier destination for curated, insightful updates
            across various categories.
          </p>
          <Link href="/HHapi">
            <button className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
              Discover More Here
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HumorHubAPISection;

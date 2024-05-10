import React from "react";
import Link from "next/link";
import news from "../../app/news.webp";
import Image from "next/image";

const HumorHubAPISection: React.FC = () => {
  const exampleTechnologyPosts = [
    {
      title: "AI and Laughter: Revolutionizing Comedy",
      content:
        "Dive deep into how cutting-edge AI technologies are not just learning to understand humor, but are also starting to create it. From writing punchlines to crafting entire stand-up routines, see how AI is becoming a game-changer in the comedy industry.",
    },
  ];

  return (
    <div
      className="screen-container card-style rounded-lg shadow-lg my-8 bg-zinc-900 text-zinc-200"
      data-aos="fade-up"
    >
      <h1 className="title-style text-3xl font-bold text-center drop-shadow-md">
        Humor Hub News
      </h1>
      <h2 className="text-center  text-lg">
        Your Go-To Source for the Latest Trends
      </h2>

      {/* Main Content Section with Image and Text */}
      <div
        className="card-style rounded-lg shadow-lg bg-zinc-900 text-zinc-200 flex flex-col md:flex-row items-center justify-center"
        data-aos="fade-up"
      >
        <div className="md:w-1/2 flex justify-center mb-4 md:mb-0 md:mr-4">
          <Image
            src={news}
            alt="Visual Representation of Humor Hub News"
            width={250}
            height={250}
            className="rounded-xl shadow-lg -mt-5 -mb-5"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          {/* Example Posts Section above the main text */}
          <div className="mb-4">
            {exampleTechnologyPosts.map((post, index) => (
              <div key={index} className="p-4 justify-end">
                <h3 className="text-lg text-center text-orange-500 font-bold mb-4">
                  {post.title}
                </h3>
                <p className="text-md mb-20 text-center">{post.content}<br/>Example Article</p>
              </div>
            ))}
          </div>
          <p className="mb-4 text-md">
            Dive into the latest trends in humor and entertainment with Humor
            Hub News, your premier destination for curated, insightful updates
            across various categories.
          </p>
          <div className="text-center md:text-left">
            <Link href="/HHapi">
              <button className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
                Discover More Here
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumorHubAPISection;

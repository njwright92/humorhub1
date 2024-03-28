import React from "react";
import Link from "next/link";

const HumorHubAPISection: React.FC = () => {
  // Updated example data to reflect the new focus on technology and entertainment
  const exampleTechnologyPosts = [
    {
      title: "The Future of AI in Comedy",
      content:
        "Exploring how artificial intelligence is shaping the future of humor and entertainment.",
    },
  ];

  const exampleEntertainmentPosts = [
    {
      title: "Comedy Specials to Watch This Year",
      content:
        "A roundup of the most anticipated comedy specials and stand-up shows coming your way.",
    },
  ];

  return (
    <div
    className="card-style p-6 rounded-lg shadow-lg my-8 bg-zinc-900 text-zinc-200"
    data-aos="fade-up"
  >
    <h1 className="title-style text-2xl font-bold text-center mb-6">
      Humor Hub News API
    </h1>
    <p className="text-center mb-6">
      Stay updated with the latest trends and happenings in technology,
      entertainment, and more to keep your jokes and content current.
    </p>
    <p>
      <em>Examples</em>
    </p>
    <h2 className="subtitle-style text-lg font-semibold mb-4">
      Latest in Technology
    </h2>
    {exampleTechnologyPosts.map((post, index) => (
      <div key={index} className="border border-white p-4 rounded-lg mb-4">
        <h4 className="font-bold text-zinc-200">{post.title}</h4>
        <p className="text-zinc-200">{post.content}</p>
      </div>
    ))}
  
    <h2 className="subtitle-style text-lg font-semibold mb-4">
      Latest in Entertainment
    </h2>
    {exampleEntertainmentPosts.map((post, index) => (
      <div key={index} className="border border-white p-4 rounded-lg mb-4">
        <h4 className="font-bold text-zinc-200">{post.title}</h4>
        <p className="text-zinc-200">{post.content}</p>
      </div>
    ))}
  
    <div className="text-center mt-8">
      <Link href="/HHapi">
        <button className="btn inline-block bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
          Discover More
        </button>
      </Link>
    </div>
  </div>
  );
};

export default HumorHubAPISection;

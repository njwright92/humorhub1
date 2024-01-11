import React from "react";
import Link from "next/link";

const HumorHubAPISection: React.FC = () => {
  const exampleTweets = [
    {
      username: "@comedy_fan123",
      content:
        "Just discovered this hilarious joke via Humor Hub API! 😂 #ComedyGold",
    },
  ];

  const exampleNewsPosts = [
    {
      title: "Breaking Comedy News: Stand-Up Revolution!",
      content: "Latest comedy trends analyzed by Humor Hub API...",
    },
  ];
  return (
    <div className="card-style" data-aos="fade-up">
      <h1 className="title-style">Humor Hub API</h1>
      <p>
        Receive the latest in news, politics, comedy, and more. Customize to
        your preference.
      </p>

      <h2 className="subtitle-style mb-2 mt-4">See What&apos;s Trending!</h2>
      {exampleTweets.map((tweet, index) => (
        <div key={index} className="border p-2 rounded-lg">
          <p className="font-bold">{tweet.username}</p>
          <p>{tweet.content}</p>
        </div>
      ))}

      <h2 className="subtitle-style mb-2 mt-4">Latest Comedy News!</h2>
      {exampleNewsPosts.map((post, index) => (
        <div key={index} className="border p-2 rounded-lg">
          <h4 className="font-bold">{post.title}</h4>
          <p>{post.content}</p>
        </div>
      ))}

      <Link href="/api-signup">
        <button className="btn">Subsribe for our API</button>
      </Link>
    </div>
  );
};

export default HumorHubAPISection;

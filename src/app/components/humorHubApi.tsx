import React from "react";
import Link from "next/link";

const HumorHubAPISection: React.FC = () => {
  const exampleTechnologyPosts = [
    {
      title: "AI and Laughter: Revolutionizing Comedy",
      content:
        "Dive deep into how cutting-edge AI technologies are not just learning to understand humor, but are also starting to create it. From writing punchlines to crafting entire stand-up routines, see how AI is becoming a game-changer in the comedy industry.",
    },
    {
      title: "Virtual Comedy Clubs: The Next Frontier",
      content:
        "Explore the rise of virtual reality comedy clubs where technology brings audiences and performers together in immersive environments from the comfort of home. Discover how VR is expanding the boundaries of how and where comedy can be enjoyed.",
    },
  ];

  const exampleEntertainmentPosts = [
    {
      title: "2024's Must-See Comedy Tours",
      content:
        "Get the lowdown on this year's most awaited comedy tours. From seasoned veterans to rising stars, find out who's hitting the road and where you can catch their performances live.",
    },
    {
      title: "Streaming Laughs: Top Comedy Specials",
      content:
        "Check out the hottest comedy specials streaming right now. From Netflix to Hulu, we've rounded up specials that are guaranteed to have you in stitches. Don't miss these hilarious acts bringing their best material to your screens.",
    },
  ];

  return (
    <div
      className="card-style p-6 rounded-lg shadow-lg my-8 bg-zinc-900 text-zinc-200"
      data-aos="fade-up"
    >
      <h1 className="title-style text-3xl font-bold text-center mb-6">
        Humor Hub News API: Your Go-To Source for the Latest Trends
      </h1>
      <p className="text-center mb-6">
        In the fast-evolving world of humor and entertainment, staying updated
        is key. The Humor Hub News API provides a curated feed of the latest
        news across seven crucial categories: Business, Entertainment, General,
        Health, Science, Sports, and Technology. This wealth of information
        ensures your material is not only current but also diverse and engaging.
      </p>
      <p className="mb-4">
        <em>Examples:</em>
      </p>
      <h2 className="subtitle-style text-xl font-semibold mb-4">
        Dive Into the Latest in Technology
      </h2>
      {exampleTechnologyPosts.map((post, index) => (
        <div key={index} className="border border-white p-4 rounded-lg mb-4">
          <h4 className="font-bold text-zinc-200">{post.title}</h4>
          <p className="text-zinc-200">{post.content}</p>
        </div>
      ))}

      <h2 className="subtitle-style text-xl font-semibold mb-4">
        What's New in Entertainment
      </h2>
      {exampleEntertainmentPosts.map((post, index) => (
        <div key={index} className="border border-white p-4 rounded-lg mb-4">
          <h4 className="font-bold text-zinc-200">{post.title}</h4>
          <p className="text-zinc-200">{post.content}</p>
        </div>
      ))}

      <h2 className="subtitle-style text-xl font-semibold my-4">
        Explore More Categories:
      </h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          Business: Get the scoop on the economic forces shaping the comedy
          scene.
        </li>
        <li>
          General: Stay informed with a broad spectrum of news relevant to
          humorists.
        </li>
        <li>
          Health: Discover how wellness trends can influence comedy and
          performance.
        </li>
        <li>
          Science: Find inspiration in the latest scientific discoveries for
          your skits and jokes.
        </li>
        <li>
          Sports: Inject your comedy with the latest updates from the sports
          world.
        </li>
      </ul>

      <div className="text-center mt-8">
        <Link href="/HHapi">
          <button className="btn inline-block bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
            Discover More on Here
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HumorHubAPISection;

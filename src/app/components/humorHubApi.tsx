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
    {
      title: "Virtual Comedy Clubs: The Next Frontier",
      content:
        "Explore the rise of virtual reality comedy clubs where technology brings audiences and performers together in immersive environments from the comfort of home. Discover how VR is expanding the boundaries of how and where comedy can be enjoyed.",
    },
  ];

  const exampleEntertainmentPosts = [
    {
      title: "2024&rsquo;s Must-See Comedy Tours",
      content:
        "Get the lowdown on this year&rsquo;s most awaited comedy tours. From seasoned veterans to rising stars, find out who&rsquo;s hitting the road and where you can catch their performances live.",
    },
    {
      title: "Streaming Laughs: Top Comedy Specials",
      content:
        "Check out the hottest comedy specials streaming right now. From Netflix to Hulu, we&rsquo;ve rounded up specials that are guaranteed to have you in stitches. Don&rsquo;t miss these hilarious acts bringing their best material to your screens.",
    },
  ];

  return (
    <div
      className="Screen-container card-style p-6 rounded-lg shadow-lg my-8 bg-zinc-900 text-zinc-200"
      data-aos="fade-up"
    >
      <h1 className="title-style text-3xl font-bold text-center mb-6">
        Humor Hub News: Your Go-To Source for the Latest Trends
      </h1>
      <div
        className="card-style p-6 rounded-lg shadow-lg my-8 bg-zinc-900 text-zinc-200 flex flex-col md:flex-row items-center"
        data-aos="fade-up"
      >
        <div className="flex-1 text-center md:text-left md:max-w-md">
          <h1 className="title-style text-3xl font-bold mb-6">
            Humor Hub News: Your Go-To Source for the Latest Trends
          </h1>
          <p className="mb-4">
            Dive into the latest trends in humor and entertainment with Humor
            Hub News, your premier destination for curated, insightful updates
            across various categories.
          </p>
          <div className="text-center md:text-left mb-6">
            <Link href="/HHapi">
              <button className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors">
                Discover More Here
              </button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex items-start  mb-4 md:mb-0">
          <Image
            src={news}
            alt="Visual Representation of Humor Hub News"
            width={200} // Specify width
            height={200} // Specify height
            className="rounded-lg shadow-lg"
            layout="responsive" // This makes the image responsive
          />
        </div>
      </div>
    </div>
  );
};

export default HumorHubAPISection;

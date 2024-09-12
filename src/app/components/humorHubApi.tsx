import React, { useState, useEffect } from "react";
import Image from "next/image";
import news from "../../app/news.webp";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AuthModal from "./authModal";

const HumorHubAPISection: React.FC = () => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  return (
    <div
      className="card-style rounded-lg shadow-lg p-4 bg-zinc-900 text-zinc-200"
      data-aos="fade-up"
    >
      <h2 className="title-style text-3xl font-bold text-center drop-shadow-md">
        Hub News!
      </h2>
      <h3 className="text-center text-lg mb-6 p-2">
        Your Go-To Source for the Latest News!
      </h3>

      {/* Main Content Section with Image and Text */}
      <div className="rounded-lg shadow-lg bg-zinc-900 text-zinc-200 flex flex-col md:flex-row-reverse items-center justify-center p-4">
        <div
          onClick={() => {
            if (!isUserSignedIn) {
              setIsAuthModalOpen(true); // Open AuthModal if not signed in
            } else {
              location.href = "/HHapi";
            }
          }}
        >
          <Image
            src={news}
            alt="Visual Representation of Humor Hub News"
            width={250}
            height={250}
            className="rounded-xl shadow-lg -mt-10 md:ml-4 mb-4 md:mb-0 cursor-pointer"
            loading="eager"
          />
        </div>

        <div className="flex-1">
          <p className="mb-4 mt-4 text-md">
            Stay ahead of the latest trends in humor, entertainment, and comedy
            events with Humor Hub News. Powered by the Humor Hub API, your
            source for fresh jokes, curated comedy content, and updates from
            across the entertainment industry.
          </p>

          <button
            onClick={() => {
              if (!isUserSignedIn) {
                setIsAuthModalOpen(true); // Open AuthModal if not signed in
              } else {
                location.href = "/HHapi";
              }
            }}
            className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors cursor-pointer"
          >
            Discover More Here
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          isOpen={isAuthModalOpen}
        />
      )}
    </div>
  );
};

export default HumorHubAPISection;

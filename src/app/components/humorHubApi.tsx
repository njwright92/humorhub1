import React, { useState, useEffect } from "react";
import Image from "next/image";
import news from "../../app/news.webp";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AuthModal from "./authModal";

const HumorHubAPISection: React.FC = () => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Monitor authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  return (
    <div
      className="card-style rounded-lg shadow-lg p-4 bg-zinc-900 text-zinc-200 xs:p-2 sm:p-4"
      data-aos="fade-up"
    >
      <h2 className="title-style text-2xl xs:text-xl sm:text-2xl font-bold text-center drop-shadow-md">
        Hub News!
      </h2>
      <h3 className="text-center text-md sm:text-lg mb-4 p-2">
        Your Go-To Source for the Latest News!
      </h3>

      {/* Main Content Section with Image and Text */}
      <div className="rounded-lg shadow-lg bg-zinc-900 text-zinc-200 flex flex-col sm:flex-row-reverse items-center justify-center p-4 xs:p-2 ">
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
            width={200} // Reduce size for mobile
            height={200}
            className="rounded-xl shadow-lg -mt-6 sm:mt-0 sm:ml-4 mb-4 cursor-pointer"
            loading="eager"
            priority
            style={{ objectFit: "contain", maxWidth: "80%" }} // Reduce width for smaller screens
            sizes="(max-width: 640px) 80vw, (max-width: 768px) 90vw, 250px" // Adjust sizes for small screens
          />
        </div>

        <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
          <p className="mb-4 mt-2 sm:mb-2 text-sm xs:text-xs sm:text-sm">
            Stay ahead of the latest trends in humor, entertainment, and comedy
            events with Humor Hub News. Your source for fresh content to write
            jokes.
          </p>

          <button
            onClick={() => {
              if (!isUserSignedIn) {
                setIsAuthModalOpen(true); // Open AuthModal if not signed in
              } else {
                location.href = "/HHapi";
              }
            }}
            className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 xs:px-1 sm:px-2 rounded hover:bg-green-600 transition-colors cursor-pointer w-full sm:w-auto"
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

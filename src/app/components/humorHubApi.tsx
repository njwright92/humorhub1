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
    <div className="card-style rounded-lg shadow-lg p-4 xs:p-2 sm:p-4">
      <h2 className="title-style text-2xl xs:text-xl sm:text-2xl font-bold text-center drop-shadow-md">
        Hub News!
      </h2>
      <h3 className="text-center text-md sm:text-lg mb-4 p-2">
        Your Source for Fresh Headlines!
      </h3>

      <div className="rounded-lg shadow-lg bg-zinc-750 text-zinc-200 flex flex-col sm:flex-row-reverse items-center justify-center p-4 xs:p-2">
        <div
          onClick={() => {
            if (!isUserSignedIn) {
              setIsAuthModalOpen(true);
            } else {
              location.href = "/HHapi";
            }
          }}
        >
          <Image
            src={news}
            alt="Comedy News Update"
            width={200}
            height={200}
            className="rounded-xl shadow-lg -mt-6 sm:mt-0 sm:ml-4 mb-4 cursor-pointer"
            loading="lazy"
            style={{ objectFit: "contain", maxWidth: "80%" }}
            sizes="(max-width: 640px) 80vw, (max-width: 768px) 90vw, 250px"
          />
        </div>

        <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
          <p className="mb-4 mt-2 sm:mb-2 text-sm xs:text-xs sm:text-sm">
            Stay in the loop with the latest headlines across all topics—perfect
            for sparking new joke ideas. Get inspired with Humor Hub News.
          </p>

          <button
            onClick={() => {
              if (!isUserSignedIn) {
                setIsAuthModalOpen(true);
              } else {
                location.href = "/HHapi";
              }
            }}
            className="btn bg-green-500 text-zinc-200 font-semibold py-2 px-4 xs:px-1 sm:px-2 rounded hover:bg-green-600 transition-colors cursor-pointer w-full sm:w-auto"
          >
            Check It Out
          </button>
        </div>
      </div>

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

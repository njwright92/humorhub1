"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import news from "../../app/news.webp";
import { auth } from "../../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";

const AuthModal = dynamic(() => import("./authModal"));

const HumorHubAPISection: React.FC = () => {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = useCallback(() => {
    if (isUserSignedIn) {
      router.push("/HHapi");
    } else {
      setIsAuthModalOpen(true);
    }
  }, [isUserSignedIn, router]);

  return (
    <section className="card-style bg-zinc-800 p-6 rounded-xl shadow-xl max-w-5xl mx-auto">
      <h2 className="title-style mb-8 text-center sm:mb-10">Hub News!</h2>

      <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 w-full">
        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right space-y-6">
          <p className="text-md lg:text-lg text-zinc-200 leading-relaxed max-w-lg drop-shadow-lg">
            Your Source for <span className="font-bold">Fresh Headlines!</span>
            <br />
            Looking for something topical?
            <br />
            <span className="mt-2 block">
              Check out the Hub News for the latest updates!
            </span>
          </p>

          <button
            onClick={handleAction}
            className="btn w-80 text-center self-center md:self-end"
          >
            Check It Out
          </button>
        </div>

        <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
          <div
            className="relative group cursor-pointer"
            onClick={handleAction}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleAction()}
          >
            <Image
              src={news}
              alt="Comedy News Update"
              width={180}
              height={180}
              placeholder="blur"
              className="relative rounded-full shadow-2xl border-4 border-zinc-700 transform transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
              loading="lazy"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          isOpen={isAuthModalOpen}
        />
      )}
    </section>
  );
};

export default HumorHubAPISection;

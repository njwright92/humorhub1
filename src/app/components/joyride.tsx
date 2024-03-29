"use client";

import React, { Suspense, useState, useEffect } from "react";
import ReactJoyride, { CallBackProps, Step } from "react-joyride";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";

const TourComponent: React.FC = () => {
  const [run, setRun] = useState<boolean>(true);
  const [isUserSignedIn, setIsUserSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      setRun(false);
    } else if ((index === 2 || index === 3 || index === 5) && !isUserSignedIn) {
      // Prompt the user to sign in if they reach a step that requires authentication
      alert("Please sign in to continue the tour.");
      setRun(false);
    }
  };

  const steps: Step[] = [
    {
      target: "#navbar",
      content: "This is our awesome navbar! You can find everything from here.",
      title: "Welcome!",
    },
    {
      target: "#create-account",
      content:
        "Create an account to save your jokes, conversations, and open mic events. Join our community!",
      title: "Join Us",
    },
    {
      target: "#comicbot",
      content:
        "Click here to start a conversation with ComicBot, your comedic companion.",
      title: "Meet ComicBot",
    },
    {
      target: "#jokepad",
      content:
        "Here's your JokePad! Write, edit, and save your jokes to perfection.",
      title: "Your JokePad",
    },
    {
      target: "#search-bar",
      content:
        "Type in your city here to find open mic events near you. Discover where you can share your jokes!",
      title: "Find Open Mics",
    },
    {
      target: "#news-api",
      content:
        "Check out the latest articles here. Stay updated with the comedy world.",
      title: "Latest Articles",
    },
    {
      target: "#send-joke",
      content:
        'Send your joke to ComicBot and see what it thinks. Just hit the "ComicBot\'s Take" button!',
      title: "Share with ComicBot",
    },
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactJoyride
        continuous
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#007bff",
          },
        }}
      />
    </Suspense>
  );
};

export default TourComponent;

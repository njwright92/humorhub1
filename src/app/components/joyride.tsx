import React, { useState, useEffect } from "react";
import ReactJoyride, { CallBackProps, Step } from "react-joyride";

const MyComponent: React.FC = () => {
  const [run, setRun] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (hasSeenTour === "true") {
      setRun(false);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Store the fact that the user has seen the tour in local storage
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  const steps: Step[] = [
    {
      target: ".navbar",
      content: "This is our awesome navbar! You can find everything from here.",
      title: "Welcome!",
    },
    {
      target: ".create-account",
      content:
        "Create an account to save your jokes, conversations, and open mic events. Join our community!",
      title: "Join Us",
    },
    {
      target: ".comicbot-page-link",
      content:
        "Click here to start a conversation with ComicBot, your comedic companion.",
      title: "Meet ComicBot",
    },
    {
      target: ".jokepad",
      content:
        "Here’s your JokePad! Write, edit, and save your jokes to perfection.",
      title: "Your JokePad",
    },
    {
      target: ".search-bar",
      content:
        "Type in your city here to find open mic events near you. Discover where you can share your jokes!",
      title: "Find Open Mics",
    },
    {
      target: ".news-api-section",
      content:
        "Check out the latest articles here. Stay updated with the comedy world.",
      title: "Latest Articles",
    },
    {
      target: ".send-joke",
      content:
        'Send your joke to ComicBot and see what it thinks. Just hit the "ComicBot’s Take" button!',
      title: "Share with ComicBot",
    },
  ];

  return (
    <div>
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
    </div>
  );
};

export default MyComponent;

"use client";

import "@sjmc11/tourguidejs/src/scss/tour.scss"; // Styles
import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour"; // JS

export const startTour = () => {
  // Initialize the tour with global options
  const tg = new TourGuideClient({
    backdropColor: "rgba(20,20,21,0.84)",
    closeButton: true,
    nextLabel: "Next",
    prevLabel: "Back",
    finishLabel: "Finish",
    showStepDots: true,
    showButtons: true,
    rememberStep: true,
    exitOnClickOutside: true,
    exitOnEscape: true,
    keyboardControls: true,
  });

  // Define your tour steps
  tg.addSteps([
    {
      content:
        "Welcome! Let's start by exploring the navbar. Navigate through the options to get familiar.",
      title: "Navbar",
      target: "#navbar",
    },
    {
      content: "Please sign up or sign in to continue with the tour.",
      title: "Sign In/Sign Up",
      target: "#signInSignUp",
    },
    {
      content: "Click on the ComicBot link to continue.",
      title: "ComicBot",
      target: "#comicBot",
    },
    {
      content: "Here you can enter your prompt for inspiration. Give it a try!",
      title: "Enter Prompt",
      target: "#enterPrompt",
    },
    {
      content: "Now, let's head over to the JokePad by clicking this link.",
      title: "JokePad Link",
      target: "#jokePad",
    },
    {
      content: "This is the JokePad. Write, edit, and save your jokes here!",
      title: "JokePad",
      target: "#joke",
    },
    {
      content: "Let's fetch some news! Click on the News API link to proceed.",
      title: "Fetch News",
      target: "#news-api",
    },
    {
      content: "Choose a category to fetch news. Try it out!",
      title: "News Category",
      target: "#newsCategory",
    },
    {
      content: "Use this button to send your selected article to ComicBot.",
      title: "Send Joke",
      target: "#send-joke",
    },
    {
      content:
        "Finally, search for open mic events in your city here. Type in your city and press enter to find events near you.",
      title: "Search Events",
      target: "#searchBar",
    },
  ]);

  // Start the tour
  tg.start();
};

"use client";

import "@sjmc11/tourguidejs/src/scss/tour.scss"; // Styles
import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour"; // JS

export const startTour = () => {
  const interactedElements = new Set(); // Track interacted elements

  // Initialize the tour with global options
  const tg = new TourGuideClient({
    autoScroll: true,
    autoScrollSmooth: true,
    autoScrollOffset: 50,
    dialogPlacement: "top",
    dialogClass: "custom-dialog",
    backdropClass: "custom-backdrop",
    backdropColor: "transparent", // Ensure the backdrop is transparent
    dialogAnimate: true,
    hideNext: true,
    hidePrev: false,
    nextLabel: "Next",
    prevLabel: "Back",
    finishLabel: "Finish",
    completeOnFinish: true,
    exitOnEscape: true,
    exitOnClickOutside: false,
    keyboardControls: true,
    showStepDots: true,
    stepDotsPlacement: "footer",
    showButtons: true,
    showStepProgress: true,
    progressBar: "#007bff",
    closeButton: true,
    rememberStep: true,
  });
  // Define your tour steps
  tg.addSteps([
    {
      content:
        "Welcome! Let's start by exploring the navbar. Navigate through the options to get familiar.",
      title: "Navbar",
      target: "#navbar",
      order: 1,
      group: "Introduction",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Please sign up or sign in to continue with the tour.",
      title: "Sign In/Sign Up",
      target: "#signInSignUp",
      order: 2,
      group: "Authentication",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Click on the ComicBot link to continue.",
      title: "ComicBot",
      target: "#comicBot",
      order: 3,
      group: "ComicBot",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Here you can enter your prompt for inspiration. Give it a try!",
      title: "Enter Prompt",
      target: "#enterPrompt",
      order: 4,
      group: "ComicBot",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Now, let's head over to the JokePad by clicking this link.",
      title: "JokePad Link",
      target: "#jokePad",
      order: 5,
      group: "JokePad",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "This is the JokePad. Write, edit, and save your jokes here!",
      title: "JokePad",
      target: "#joke",
      order: 6,
      group: "JokePad",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Let's fetch some news! Click on the News API link to proceed.",
      title: "Fetch News",
      target: "#news-api",
      order: 7,
      group: "News",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Choose a category to fetch news. Try it out!",
      title: "News Category",
      target: "#newsCategory",
      order: 8,
      group: "News",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content: "Use this button to send your selected article to ComicBot.",
      title: "Send Joke",
      target: "#send-joke",
      order: 9,
      group: "ComicBot",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
    {
      content:
        "Finally, search for open mic events in your city here. Type in your city and press enter to find events near you.",
      title: "Search Events",
      target: "#searchBar",
      order: 10,
      group: "Events",
      afterEnter: (currentStep) => {
        let targetElement;
        if (typeof currentStep.target === "string") {
          targetElement = document.querySelector(currentStep.target);
        } else if (currentStep.target instanceof HTMLElement) {
          targetElement = currentStep.target;
        }

        if (targetElement) {
          targetElement.addEventListener(
            "click",
            () => {
              interactedElements.add(currentStep.target);
              tg.nextStep()
                .then(() => {
                  // Successfully moved to the next step
                })
                .catch((error) => {
                  console.error("Failed to move to the next step:", error);
                });
            },
            { once: true }
          );
        }
      },
    },
  ]);

  // Custom event listeners
  const initCustomListeners = () => {
    tg.tourSteps.forEach((step) => {
      if (typeof step.target === "string") {
        const targetElement = document.querySelector(step.target);
        targetElement?.addEventListener(
          "click",
          () => {
            interactedElements.add(step.target);
            tg.nextStep()
              .then(() => {
                console.log("Successfully moved to the next step.");
              })
              .catch((error) => {
                console.error("Failed to move to the next step:", error);
              });
          },
          { once: true }
        );
      }
    });
  };

  const destroyCustomListeners = () => {
    tg.tourSteps.forEach((step) => {
      if (typeof step.target === "string") {
        const targetElement = document.querySelector(step.target);
        targetElement?.removeEventListener("click", () => {});
      }
    });
  };

  // Initialize custom event listeners
  initCustomListeners();

  // Event handlers
  tg.onFinish(async () => {
    if (!tg.isFinished()) {
      alert("Tour complete, you are ready to use the application.");
    }
    destroyCustomListeners();
  });

  tg.onBeforeExit(() => {
    return new Promise((resolve, reject) => {
      if (confirm("Are you sure you want to close the tour?")) {
        resolve(true);
        destroyCustomListeners();
      } else {
        reject();
      }
    });
  });

  tg.onAfterExit(() => {
    console.info("The tour has closed");
    destroyCustomListeners();
  });

  // Start the tour
  tg.start();
};

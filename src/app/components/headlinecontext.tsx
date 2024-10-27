"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";

// Define the HeadlineContext and its initial value
const HeadlineContext = createContext<{
  selectedHeadline: string;
  setSelectedHeadline: (headline: string) => void;
  selectedDescription: string;
  setSelectedDescription: (description: string) => void;
}>({
  selectedHeadline: "",
  setSelectedHeadline: () => {},
  selectedDescription: "",
  setSelectedDescription: () => {},
});

// Create a custom hook to simplify using the HeadlineContext
export const useHeadline = () => {
  const context = useContext(HeadlineContext);
  if (!context) {
    throw new Error(
      "Oops! It looks like you're trying to use the headline context outside of its provider. Please make sure your component is wrapped in a HeadlineProvider.",
    );
  }
  return context;
};

// Create the HeadlineProvider component
export const HeadlineProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedHeadline, setSelectedHeadline] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");

  return (
    <HeadlineContext.Provider
      value={{
        selectedHeadline,
        setSelectedHeadline,
        selectedDescription,
        setSelectedDescription,
      }}
    >
      {children}
    </HeadlineContext.Provider>
  );
};

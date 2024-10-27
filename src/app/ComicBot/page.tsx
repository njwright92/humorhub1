"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import Header from "../components/header";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase.config";
import {
  addDoc,
  collection,
  query,
  where,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import Footer from "../components/footer";
import Loading from "../components/loading";
import { useHeadline } from "../components/headlinecontext";
import logo from "../../app/comicLogo.webp";
import comic from "../../app/favicon.ico";
import Image from "next/image";
import Head from "next/head";
import Script from "next/script";

type ConversationMessage = {
  from: string;
  text: string;
  content: string;
  role: string;
};

type Conversation = {
  id: string;
  messages: ConversationMessage[];
};

const ComicBot = () => {
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userUID, setUserUID] = useState<string | null>(
    auth.currentUser ? auth.currentUser.uid : null,
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedHeadline, selectedDescription } = useHeadline();

  useEffect(() => {
    if (selectedHeadline && selectedDescription) {
      const newInput = `Write an absurd take on the following news: ${selectedHeadline}\n\n${selectedDescription}`;
      setInput((prevInput) => (prevInput !== newInput ? newInput : prevInput));
    }
  }, [selectedHeadline, selectedDescription]);

  const handleInputChange = ({
    target: { value },
  }: ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(value);
  };

  const handleSend = useCallback(async () => {
    const userInput = input.trim();

    if (!userInput) {
      alert("Please enter a message before sending.");
      return;
    }

    setConversation((prev) => [
      ...prev,
      { from: "You", content: userInput, role: "user", text: userInput },
      { from: "ComicBot", content: "", role: "bot", text: "" },
    ]);
    setIsLoading(true);

    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_REACT_APP_BACKEND_URL ||
        "http://143.244.186.144:8000";

      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }), // Stringify input properly
      });

      if (!response.ok) {
        throw new Error(
          `Fetch failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setConversation((prev) => [
        ...prev,
        {
          from: "ComicBot",
          content: data.response,
          role: "bot",
          text: data.response,
        },
      ]);
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("Error: Could not process the request. Please try again later.");
    } finally {
      setIsLoading(false);
      setInput(""); // Reset input after sending
    }
  }, [input]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null); // Simplified ternary check
    });

    return unsubscribe; // Directly return the cleanup function
  }, []);

  const fetchConvos = useCallback(async () => {
    if (!userUID) return;

    try {
      const convoQuery = query(
        collection(db, "conversations"),
        where("uid", "==", userUID),
      );
      const querySnapshot = await getDocs(convoQuery);

      const fetchedConvos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        messages: doc.data().messages,
      }));

      setAllConversations(fetchedConvos);
    } catch (error) {
      console.error("Error fetching conversations:", error); // Improved error handling
    }
  }, [userUID]);

  useEffect(() => {
    fetchConvos();
  }, [fetchConvos]);

  const saveConversation = useCallback(async () => {
    if (!conversation.length) return; // Prevent saving if there's no conversation

    try {
      const userUID = auth.currentUser?.uid;
      if (userUID) {
        const convoCollection = collection(db, "conversations");
        const docRef = await addDoc(convoCollection, {
          uid: userUID,
          messages: conversation.map((msg) => ({
            content: msg.content,
            role: msg.role,
          })),
        });

        setAllConversations((prevConvos) => [
          ...prevConvos,
          { id: docRef.id, messages: conversation },
        ]);
        setIsSaved(true);
      }

      setConversation([]); // Clear conversation after saving
    } catch (error) {
      console.error("Error saving conversation:", error); // Log error for debugging
      alert(
        "Oops! Something went wrong while saving the conversation. Please try again.",
      );
    }
  }, [conversation]);

  const deleteConversation = async (docID: string) => {
    try {
      await deleteDoc(doc(db, "conversations", docID));

      setAllConversations((prevConvos) =>
        prevConvos.filter((convo) => convo.id !== docID),
      );
    } catch (error) {
      console.error("Error deleting conversation:", error); // Improved error handling
      alert(
        "Oops! Something went wrong while deleting the conversation. Please try again.",
      );
    }
  };

  const sendConversationToJokepad = async (
    conversation: ConversationMessage[],
  ) => {
    if (!userUID) {
      alert("User is not signed in.");
      return;
    }

    if (!conversation.length) {
      alert("Conversation is empty. Cannot send to Jokepad.");
      return;
    }

    try {
      const jokeCollection = collection(db, "jokes");
      const conversationText = conversation
        .map((message) => `${message.from}: ${message.content}`)
        .join("\n");

      await addDoc(jokeCollection, {
        joke: conversationText,
        uid: userUID,
      });

      alert("Joke successfully sent to Jokepad!");
    } catch (error) {
      console.error("Error sending conversation to Jokepad:", error); // Better error logging
      alert(
        "Oops! Something went wrong while sending the joke to Jokepad. Please try again.",
      );
    }
  };

  return (
    <>
      <Head>
        <title>ComicBot - Your Personal AI Comedy Companion</title>
        <meta
          name="description"
          content="Meet ComicBot, the AI-powered bot that brings you the best jokes and humor tailored just for you. Get ready to laugh!"
        />
        <meta
          name="keywords"
          content="ComicBot, AI comedy, jokes, humor, funny bot, AI humor"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/ComicBot" />
        <meta
          property="og:title"
          content="ComicBot - Your Personal AI Comedy Companion"
        />
        <meta
          property="og:description"
          content="Meet ComicBot, the AI-powered bot that brings you the best jokes and humor tailored just for you. Get ready to laugh!"
        />
        <meta
          property="og:url"
          content="https://www.thehumorhub.com/ComicBot"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-comicbot.jpg"
        />
      </Head>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-L4N0VS2TW8"
      ></Script>
      <Header />
      <main className="screen-container flex flex-col">
        <h1 className="title text-4xl font-bold text-center mb-4">
          Welcome to ComicBot!
        </h1>
        <p className="mb-6 text-center">
          Explore the world of humor with ComicBot, your AI-powered comedy
          assistant. Whether you&apos;re crafting jokes, developing sketches, or
          finding funny takes on daily life, ComicBot sparks creativity and
          delivers tailored humor.
        </p>

        <div className="flex flex-row justify-center items-center space-x-4 md:space-x-6 mb-6">
          <Image
            src={comic}
            alt="Comic Image"
            className="rounded-2xl shadow-lg"
            width={150}
            height={150}
            loading="lazy"
            style={{ objectFit: "contain", maxWidth: "100%" }} // Ensure image doesn't exceed screen width
            sizes="(max-width: 768px) 90vw, 250px" // Make the image 90% width on mobile
          />
          <Image
            src={logo}
            alt="Comic Logo"
            className="rounded-full shadow-lg"
            width={150}
            height={150}
            loading="lazy"
            style={{ objectFit: "contain", maxWidth: "100%" }} // Ensure image doesn't exceed screen width
            sizes="(max-width: 768px) 90vw, 250px" // Make the image 90% width on mobile
          />
        </div>
        <p className="mb-2 text-center italic text-sm text-red-500">
          Please note: ComicBots service is a research preview. It may generate
          offensive content. It must not be used for any illegal, harmful,
          violent, racist, or sexual purposes.
        </p>
        <section className="card-style p-6 rounded-xl shadow-lg">
          <div className="form-container mb-4">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="input-field w-full h-40 p-4 text-black rounded-xl shadow-inner"
              placeholder="What funny idea are you exploring today?"
              id="enterPrompt"
            />
          </div>
          <button
            onClick={() => alert("ComicBot coming soon!")}
            className="send-button bg-orange-500 hover:bg-orange-700 text-zinc-900 hover:text-zinc-200 text-lg px-12 py-2 rounded-xl shadow-lg transition-all duration-150 ease-in-out hover:animate-pulse mb-2"
          >
            Send
          </button>

          <section className="section-style">
            {/* Loading indicator at the end of the conversation list */}
            {isLoading && (
              <div className="loading-indicator m-1">
                <Loading />
              </div>
            )}
            {/* Render messages including the ones from API */}
            {[...conversation].reverse().map((message, index) => (
              <article
                key={index}
                className="bot-message-container text-zinc-200"
              >
                <span className="text-zinc-200">{message.from}:..</span>
                <p className="text-zinc-200">{message.content}</p>
              </article>
            ))}
          </section>

          <button
            onClick={saveConversation}
            className="px-4 py-2 mt-4 text-lg rounded-xl shadow-lg text-zinc-900 bg-green-500 hover:animate-pulse hover:bg-green-700  hover:text-zinc-200"
            disabled={isSaved}
          >
            {isSaved ? "Conversation Saved" : "Save Conversation"}
          </button>

          <section className="previous-conversations">
            <h2 className="subtitle-style">Previous Conversations</h2>
            {allConversations.map((convo) => (
              <div key={convo.id}>
                {convo.messages.map((message, messageIndex) => (
                  <article
                    key={`${convo.id}-message-${messageIndex}`}
                    className="bot-message-container"
                  >
                    <span>
                      {message.role === "user" ? "...You" : "ComicBot:.."}
                    </span>
                    <p>{message.content}</p>
                  </article>
                ))}
                <button
                  className="px-4 py-2 mt-4 mr-1 hover:animate-pulse rounded-xl shadow-lg  bg-red-500 hover:bg-red-700 text-zinc-900  hover:text-zinc-200 mb-2"
                  onClick={() => deleteConversation(convo.id)}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 mt-4 ml-1 hover:animate-pulse rounded-xl shadow-lg  bg-blue-500 hover:bg-blue-700 text-zinc-900  hover:text-zinc-200 mb-2 "
                  onClick={() => sendConversationToJokepad(convo.messages)}
                >
                  Send to Jokepad
                </button>
              </div>
            ))}
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ComicBot;

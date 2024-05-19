"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
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
import comic from "../../app/icon.png";
import Image from "next/image";
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
    auth.currentUser ? auth.currentUser.uid : null
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedHeadline, selectedDescription } = useHeadline();

  useEffect(() => {
    if (selectedHeadline && selectedDescription) {
      setInput(
        `Write an absurd take on the following news: ${selectedHeadline}\n\n ${selectedDescription}`
      );
    }
  }, [selectedHeadline, selectedDescription]);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const { value } = event.target;
    setInput(value);
  };

  const API_URL =
    "https://api-inference.huggingface.co/models/njwright92/ComicBotv.02";
  const API_TOKEN = process.env.REACT_APP_API_TOKEN;

  const handleSend = useCallback(async () => {
    const userInput = input.trim();

    if (!userInput) {
      console.warn("Your message is empty. Please enter text to send.");
      return;
    }

    setConversation((prev) => [
      ...prev,
      { from: "You", content: userInput, role: "user", text: userInput },
      { from: "ComicBot", content: "...", role: "bot", text: "..." },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `an abusrd funny take on: ${userInput}`,
          n_predict: 400,
          temperature: 0.9,
          repetition_penalty: 1.2,
          ctx_size: 1024,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("Response body is null");
        setIsLoading(false);
        return;
      }

      let accumulatedResponse = "";

      // Process stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = new TextDecoder().decode(value);
        if (chunkText.startsWith("data: ")) {
          const chunkData = chunkText.slice(6);
          try {
            const chunk = JSON.parse(chunkData);
            accumulatedResponse += chunk.content;
            // Update the last message with new content
            setConversation((prev) =>
              prev.map((message, index) =>
                index === prev.length - 1
                  ? {
                      ...message,
                      content: accumulatedResponse,
                      text: accumulatedResponse,
                    }
                  : message
              )
            );
          } catch (error) {
            console.warn("Received non-JSON chunk data:", chunkData);
          }
        }
      }
    } catch (error) {
      console.error("Error while generating response:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  }, [input, API_TOKEN]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchConvos = useCallback(async () => {
    if (!userUID) return;

    const convoQuery = query(
      collection(db, "conversations"),
      where("uid", "==", userUID)
    );
    const querySnapshot = await getDocs(convoQuery);

    const fetchedConvos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      messages: doc.data().messages,
    }));

    setAllConversations(fetchedConvos);
  }, [userUID]);

  useEffect(() => {
    fetchConvos();
  }, [fetchConvos]);

  const saveConversation = useCallback(async () => {
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
      setConversation([]);
    } catch (error) {
      console.error("Error saving conversation: ", error);
    }
  }, [conversation]);

  const deleteConversation = async (docID: string) => {
    try {
      await deleteDoc(doc(db, "conversations", docID));

      setAllConversations(
        allConversations.filter((convo) => convo.id !== docID)
      );
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const sendConversationToJokepad = async (
    conversation: ConversationMessage[]
  ) => {
    if (!userUID) {
      alert("User is not signed in.");
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
      alert("Joke successfully sent to Jokepad!"); // This line provides user feedback
    } catch (error) {
      console.error("Error sending conversation to Jokepad: ", error);
      alert("Failed to send joke to Jokepad."); // Provide feedback on failure
    }
  };

  return (
    <>
      <Header />
      <main className="screen-container flex flex-col">
        <h1 className="title text-4xl font-bold text-center mb-4">
          Welcome to ComicBot!
        </h1>
        <p className="mb-6 text-center">
          Dive into the world of humor with ComicBot, your AI-powered comedy
          writing assistant. Whether you&rsquo;re crafting jokes, developing
          sketches, or exploring funny takes on everyday life, ComicBot is here
          to spark your creativity.
        </p>
        <div className="flex flex-row justify-center items-center space-x-4 md:space-x-6 mb-6">
          <Image
            src={comic}
            alt="Comic Image"
            className="rounded-2xl shadow-lg"
            width={150}
            height={150}
          />
          <Image
            src={logo}
            alt="Comic Logo"
            className="rounded-full shadow-lg"
            width={150}
            height={150}
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
              placeholder="What funny idea are you exploring today? Type here and press Send to see what ComicBot can add to your comedy..."
              id="enterPrompt"
            />
          </div>
          <button
            onClick={handleSend}
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

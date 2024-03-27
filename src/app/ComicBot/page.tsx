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
import { SpinnerInfinity } from "spinners-react";
import Footer from "../components/footer";

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

const fetchStream = async function* (prompt: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  if (!response.body) {
    throw new Error("Response body is missing");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
    yield result;
    result = ""; // Reset the result after yielding
  }
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

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const { value } = event.target;
    setInput(value);
  };

  const handleSend = useCallback(async () => {
    const userInput = input.trim();
    if (!userInput) {
      console.warn("Your message is empty. Please enter text to send.");
      return;
    }

    // Append user input with a placeholder for ComicBot response
    setConversation((prevConversation) => [
      ...prevConversation,
      { from: "You", content: userInput, role: "user", text: userInput },
      { from: "ComicBot", content: "...", role: "bot", text: "..." }, // Placeholder for streaming response
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/completion", {
        method: "POST",
        body: JSON.stringify({
          prompt: userInput,
          n_predict: 312, // Increased from 212 to generate longer responses
          maxTokens: 312, // Match n_predict to allow full output
          temperature: 0.9, // Higher temperature for more creative/random outputs
          top_k: 40, // Use top_k sampling with k=40
          top_p: 0.9, // Use top_p sampling with p=0.9
          repetition_penalty: 1.2, // Add a small repetition penalty
          stream: true,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const reader = response.body?.getReader();
      if (!reader) {
        console.error("Response body is null");
        setIsLoading(false);
        return;
      }

      let accumulatedResponse = "";

      const processText: (
        result: ReadableStreamReadResult<Uint8Array>
      ) => void = async (result) => {
        const { done, value } = result;

        if (done) {
          console.log("Stream complete");
          setIsLoading(false);
          return;
        }

        if (value) {
          const chunkText = new TextDecoder().decode(value);
          console.log(`Received chunk: ${chunkText}`);

          // Check if the chunk starts with "data: "
          if (chunkText.startsWith("data: ")) {
            const chunkData = chunkText.slice(6); // Remove the "data: " prefix

            // Check if the chunk data is a valid JSON string
            try {
              const chunk = JSON.parse(chunkData);
              accumulatedResponse += chunk.content;

              // Update the ComicBot message with accumulated response
              setConversation((prevConversation) =>
                prevConversation.map((message, index) =>
                  index === prevConversation.length - 1
                    ? {
                        ...message,
                        content: accumulatedResponse,
                        text: accumulatedResponse,
                      }
                    : message
                )
              );
            } catch (error) {
              // Ignore non-JSON chunk data
              console.warn("Received non-JSON chunk data:", chunkData);
            }
          }
        }

        // Read the next chunk
        const nextResult = await reader.read();
        return processText(nextResult);
      };

      reader.read().then(processText);
    } catch (error) {
      console.error("Error while generating response:", error);
      setIsLoading(false);
    } finally {
      setInput(""); // Clear input field regardless of success/failure
    }
  }, [input]);

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

  return (
    <>
      <Header />
      <main className="screen-container flex flex-col">
        <h1 className="title">ComicBot!</h1>
        <section className="card-style">
          <div className="form-container">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="input-field"
              placeholder="Write a funny take on everyday life..."
            />
            <button onClick={handleSend} className="btn">
              Send
            </button>
          </div>
          <section className="section-style">
            {/* Render messages including the ones from API */}
            {[...conversation].reverse().map((message, index) => (
              <article key={index} className="bot-message-container">
                <span>{message.from}:..</span>
                <p>{message.content}</p>
              </article>
            ))}
            {/* Loading indicator at the end of the conversation list */}
            {isLoading && (
              <div className="loading-indicator">
                <SpinnerInfinity
                  color="green"
                  size="90"
                  secondaryColor="gray"
                />
                <p>Loading...</p>
              </div>
            )}
          </section>

          <button onClick={saveConversation} className="btn" disabled={isSaved}>
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
                  className="px-4 py-2 mt-4 hover:animate-pulse rounded-soft bg-red-500 hover:bg-red-700 text-gray-100"
                  onClick={() => deleteConversation(convo.id)}
                >
                  Delete
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

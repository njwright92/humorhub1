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
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Assuming the server response format is { response: "text" }
      const jsonResponse = await response.json(); // Parse the JSON response
      const textResponse = jsonResponse.response; // Extract the text response from the JSON object

      setConversation((prevConversation) => [
        ...prevConversation,
        {
          from: "You",
          content: userInput, // Display the user's input
          role: "user",
          text: userInput, // Repeat for consistency, consider if only one of content or text is necessary
        },
        {
          from: "ComicBot",
          content: textResponse, // Use the extracted text response here
          role: "bot",
          text: textResponse, // Repeat for consistency, consider if only one of content or text is necessary
        },
      ]);
    } catch (error) {
      console.error("Error while generating response:", error);
    }
    setIsLoading(false);
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
                  setInput("");
                }
              }}
              className="input-field"
              placeholder="Write a funny take on everyday life..."
            />
            <button onClick={handleSend} className="btn">
              Send
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center">
              <div>
                <SpinnerInfinity
                  color="green"
                  size="90"
                  secondaryColor="gray"
                />
                <p>Loading...</p>
              </div>
            </div>
          ) : (
            <section className="section-style">
              {/* Render messages including the ones from API */}
              {[...conversation].reverse().map((message, index) => (
                <article key={index} className="bot-message-container">
                  <span>{message.from}:..</span>
                  <p>{message.content}</p>
                </article>
              ))}
            </section>
          )}

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

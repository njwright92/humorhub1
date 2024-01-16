"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import axios from "axios";
import Footer from "../components/footer";
import LoadingSpinner from "../components/loading";

type ConversationMessage = {
  from: string;
  text: string;
};

type Conversation = {
  id: string;
  messages: ConversationMessage[];
};

const API_ENDPOINT =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-instruct-v0.2";
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: "Bearer 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",
};

const ComicBot = () => {
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userUID, setUserUID] = useState<string | null>(
    auth.currentUser ? auth.currentUser.uid : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const askComicbot = useCallback(async (Prompt: string) => {
    try {
      const response = await axios.post(
        API_ENDPOINT,
        { inputs: Prompt },
        { headers: HEADERS }
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error making request:", error);
        throw new Error("Error in askComicbot: " + error.message);
      } else {
        console.error("An unknown error occurred:", error);
        throw new Error("Error in askComicbot: An unknown error occurred");
      }
    }
  }, []);

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
          messages: conversation,
        });
        setAllConversations((prevConvos) => [
          {
            id: docRef.id,
            messages: conversation,
          },
          ...prevConvos,
        ]);
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUserInput(e.target.value);
    },
    []
  );

  const handleSend = useCallback(async () => {
    setIsLoading(true);
    setIsSaved(false);

    try {
      const botResponses = await askComicbot(userInput);
      if (botResponses && botResponses.length > 0) {
        const botResponse = botResponses[0].generated_text;
        setConversation((prevConversation) => [
          { from: "user", text: userInput },
          { from: "bot", text: botResponse },
          ...prevConversation,
        ]);
      } else {
        console.error("Unexpected response format:", botResponses);
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      alert("Error please try again");
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  }, [userInput, conversation, askComicbot]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
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
              name="userInput"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder="Write a funny take on everyday life..."
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="btn">
              Send
            </button>
          </div>

          {isLoading && <LoadingSpinner />}

          <section className="section-style">
            {conversation.map((message, index) => (
              <article
                key={`${message.from}-${index}`}
                className="bot-message-container"
              >
                <span>{message.from === "bot" ? "ComicBot:.." : "...You"}</span>
                <p>{message.text}</p>
              </article>
            ))}
          </section>

          <button onClick={saveConversation} className="btn" disabled={isSaved}>
            {isSaved ? "Conversation Saved" : "Save Conversation"}
          </button>

          <section className="previous-conversations">
            <h2 className="subtitle-style">Previous Conversations</h2>
            {allConversations
              .slice()
              .reverse()
              .map((convo) => (
                <React.Fragment key={convo.id}>
                  {convo.messages.map((message, messageIndex) => (
                    <article
                      key={`${convo.id}-message-${messageIndex}`}
                      className="bot-message-container"
                    >
                      <span>
                        {message.from === "bot" ? "ComicBot:.." : "...You"}
                      </span>
                      <p>{message.text}</p>
                    </article>
                  ))}
                  <button
                    className="btn"
                    onClick={() => deleteConversation(convo.id)}
                  >
                    Delete
                  </button>
                </React.Fragment>
              ))}
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ComicBot;

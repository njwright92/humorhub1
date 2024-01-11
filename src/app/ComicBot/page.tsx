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
import Footer from "../components/footer";

type ConversationMessage = {
  from: string;
  text: string;
};

type Conversation = {
  id: string;
  messages: ConversationMessage[];
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

  const askComicbot = useCallback(async (prompt: string | null) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer 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",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error making request:", error);
      alert("Error please try again");
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

  useEffect(() => {
    const fetchConvos = async () => {
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
    };

    if (userUID) {
      fetchConvos();
    }
  }, [userUID]);

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
    setConversation([...conversation, { from: "user", text: userInput }]);
    setUserInput("");

    try {
      const botResponses = await askComicbot(userInput);
      if (botResponses && botResponses.length > 0) {
        const botResponse = botResponses[0].generated_text;
        setConversation((prevConversation) => [
          ...prevConversation,
          { from: "bot", text: botResponse },
        ]);
      } else {
        console.error("Unexpected response format:", botResponses);
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      alert("Error please try again");
    } finally {
      setIsLoading(false);
    }
  }, [userInput, conversation, askComicbot]);

  return (
    <>
      <Header />
      <main className="screen-container flex flex-col">
        <h1 className="title">ComicBot!</h1>

        <div className="card-style">
          <div className="form-container">
            <textarea
              name="userInput"
              value={userInput}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Write a funny take on everyday life, like 'Why is pizza round, but comes in a square box?'"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="btn">
              Send
            </button>
          </div>

          <div className="section-style">
            {isLoading && (
              <div className="modal-container">
                <span>Loading...</span>
                {/* Loading spinner */}
              </div>
            )}
            {/* Conversations */}
            {conversation &&
              conversation.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.from === "bot"
                      ? "bot-message-container"
                      : "user-message-container"
                  }
                >
                  <span>
                    {message.from === "bot" ? "ComicBot:.." : "...You"}
                  </span>
                  <p
                    className={
                      message.from === "bot" ? "bot-message" : "user-message"
                    }
                  >
                    {message.text}
                  </p>
                </div>
              ))}
          </div>

          <button onClick={saveConversation} className="btn" disabled={isSaved}>
            {isSaved ? "Conversation Saved" : "Save Conversation"}
          </button>

          <div className="previous-conversations">
            <h2 className="subtitle-style">Previous Conversations</h2>
            {/* Previous Conversations */}
            {allConversations.map((convo, index) => (
              <div key={index} className="event-item">
                {/* Conversation Messages */}
                {convo.messages.map((message, i) => (
                  <div
                    key={i}
                    className={
                      message.from === "bot"
                        ? "bot-message-container"
                        : "user-message-container"
                    }
                  >
                    <span>
                      {message.from === "bot" ? "ComicBot:.." : "...You"}
                    </span>
                    <p>{message.text}</p>
                  </div>
                ))}
                <button
                  className="btn"
                  onClick={() => deleteConversation(convo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ComicBot;

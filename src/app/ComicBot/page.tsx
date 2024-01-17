"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import LoadingSpinner from "../components/loading";

type ConversationMessage = {
  from: string;
  text: string;
};

type Conversation = {
  id: string;
  messages: ConversationMessage[];
};

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const ComicBot = () => {
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userUID, setUserUID] = useState<string | null>(
    auth.currentUser ? auth.currentUser.uid : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const genAI = useMemo(() => {
    return new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  }, []);

  const askComicbot = useCallback(async (userInput: string) => {
    // Log the API key for debugging purposes
    console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    // Define the comedy prompt
    const comedyPrompt = `You are a witty and humorous AI, known for your sharp and clever comedy. Your style is light-hearted and playful, often finding humor in everyday situations. Here's what someone said: "${userInput}" How would you respond humorously?`;

    try {
      // Configure safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        // Add other categories as needed
      ];

      // Get the generative model with safety settings
      const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        safetySettings,
      });

      const result = await model.generateContentStream(comedyPrompt);

      let generatedContent = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log("Received chunk:", chunkText);
        generatedContent += chunkText;
      }

      return { generated_text: generatedContent };
    } catch (error) {
      console.error("Error in askComicbot:", error);
      throw new Error("Error in askComicbot: " + error);
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
      const botResponse = await askComicbot(userInput);
      if (botResponse && botResponse.generated_text) {
        setConversation((prevConversation) => [
          { from: "user", text: userInput },
          { from: "bot", text: botResponse.generated_text },
          ...prevConversation,
        ]);
      } else {
        console.error("No response from bot");
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      alert("Error please try again");
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  }, [userInput, askComicbot]);

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

"use client";

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  query,
  where,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Header from "../components/header";
import Footer from "../components/footer";
import Head from "next/head";

type Joke = {
  id: string;
  joke: string;
};

const Jokes = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [newJoke, setNewJoke] = useState<string>("");
  const [editingJokeId, setEditingJokeId] = useState<string | null>(null);
  const [userUID, setUserUID] = useState<string | null>(
    auth.currentUser ? auth.currentUser.uid : null
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setNewJoke(e.target.value);

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

  const fetchJokes = useCallback(async () => {
    if (!userUID) return;

    const jokeQuery = query(
      collection(db, "jokes"),
      where("uid", "==", userUID)
    );
    const unsubscribe = onSnapshot(jokeQuery, (querySnapshot) => {
      const fetchedJokes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        joke: doc.data().joke,
      }));
      setJokes(fetchedJokes);
    });
    return () => unsubscribe();
  }, [userUID]);

  useEffect(() => {
    fetchJokes();
  }, [fetchJokes]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userUID) return;
    try {
      const jokeCollection = collection(db, "jokes");
      const docRef = await addDoc(jokeCollection, {
        joke: newJoke,
        uid: userUID,
      });
      const newDocId = docRef.id;
      setJokes([{ id: newDocId, joke: newJoke }, ...jokes]);
      setNewJoke("");
    } catch (error) {
      console.error("Error adding joke: ", error);
      alert(
        "Oops! Something went wrong while adding your joke. Please try again."
      );
    }
  };

  const handleCancelEdit = () => setEditingJokeId(null);

  const handleEditClick = (jokeId: string) => setEditingJokeId(jokeId);

  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, jokeId: string) => {
      setJokes((currentJokes) => {
        const updatedJokes = currentJokes.map((joke) =>
          joke.id === jokeId ? { ...joke, joke: e.target.value } : joke
        );
        return updatedJokes;
      });
    },
    []
  );

  const handleEditSubmit = async (jokeId: string) => {
    const editedJoke = jokes.find((j) => j.id === jokeId);
    if (!editedJoke) return; // Check if the joke is found

    try {
      // Update the joke using Firestore operations
      const jokeDoc = doc(db, "jokes", jokeId); // Use jokeId which is a string
      await updateDoc(jokeDoc, {
        joke: editedJoke.joke,
        uid: userUID,
      });
      setEditingJokeId(null); // Reset the editing state
    } catch (error) {
      console.error("Error updating joke: ", error);
      alert(
        "Oops! Something went wrong while updating your joke. Please try again."
      );
    }
  };

  const handleDelete = async (jokeId: string) => {
    try {
      const jokeDoc = doc(db, "jokes", jokeId);
      await deleteDoc(jokeDoc);
      setJokes(jokes.filter((joke) => joke.id !== jokeId));
    } catch (error) {
      console.error("Error deleting joke: ", error);
      alert(
        "Oops! Something went wrong while deleting your joke. Please try again."
      );
    }
  };

  return (
    <>
      <Head>
        <title>Jokepad - Write, Edit, and Perfect Your Jokes</title>
        <meta
          name="description"
          content="Use Jokepad to craft, edit, and refine your jokes. The ultimate tool for comedians to keep their humor sharp."
        />
        <meta
          name="keywords"
          content="Jokepad, joke writing, comedy tools, edit jokes, humor writing"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/Jokepad" />
        <meta
          property="og:title"
          content="Jokepad - Write, Edit, and Perfect Your Jokes"
        />
        <meta
          property="og:description"
          content="Use Jokepad to craft, edit, and refine your jokes. The ultimate tool for comedians to keep their humor sharp."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/Jokepad" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-jokepad.jpg"
        />
      </Head>

      <Header />
      <main className="flex flex-col">
        <h1 className="title text-2xl font-bold text-center mb-8">
          Welcome to JokePad!
        </h1>
        <p className="text-center mb-6">
          Your personal digital notebook for capturing jokes, bits, and comedic
          ideas. Whether it&apos;s a sudden spark of inspiration or refining your
          work in progress, Jokepad helps you organize and perfect your comedic
          genius.
        </p>

        <section className="p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="joke"
              className="block text-lg font-semibold text-zinc-200 text-center mb-2"
            >
              Write Your Joke/Bit:
            </label>
            <textarea
              id="joke"
              value={newJoke}
              onChange={handleInputChange}
              placeholder="What's making you laugh today? Share it here..."
              className="input-field w-full h-35 p-4 text-zinc-900 rounded-xl shadow-inner"
              required
            />
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-700 text-zinc-200 px-4 py-2 rounded-xl shadow-lg text-md transition-all duration-150 ease-in-out hover:animate-pulse"
              >
                Add Joke
              </button>
            </div>
          </form>
        </section>
        <section className="jokes-list p-4">
          {jokes.map((joke) => (
            <article key={joke.id} className="event-item">
              {editingJokeId === joke.id ? (
                <>
                  <textarea
                    value={joke.joke}
                    onChange={(e) => handleEditChange(e, joke.id)}
                    className="input-field w-full h-35 p-4 text-zinc-900 rounded-xl shadow-inner"
                  />
                  <div className="button-container flex justify-start">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-zinc-200 px-2 py-1 rounded-xl shadow-lg text-md transition-all duration-150 ease-in-out hover:animate-pulse mr-2"
                      onClick={() => handleEditSubmit(joke.id)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-zinc-200 px-2 py-1 rounded-xl shadow-lg text-md transition-all duration-150 ease-in-out hover:animate-pulse"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center w-full">
                  <p className="flex-grow">{joke.joke}</p>
                  <div className="icon-container flex-shrink-0 flex">
                    <PencilIcon
                      className="h-6 w-6 m-2 cursor-pointer text-green-500"
                      onClick={() => handleEditClick(joke.id)}
                    />
                    <TrashIcon
                      className="h-6 w-6 m-2 cursor-pointer text-red-500"
                      onClick={() => handleDelete(joke.id)}
                    />
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Jokes;

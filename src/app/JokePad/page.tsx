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
    auth.currentUser ? auth.currentUser.uid : null,
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

  useEffect(() => {
    if (!userUID) return;

    const debounceFetchJokes = setTimeout(() => {
      const jokeQuery = query(
        collection(db, "jokes"),
        where("uid", "==", userUID),
      );

      const unsubscribe = onSnapshot(jokeQuery, (querySnapshot) => {
        const fetchedJokes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          joke: doc.data().joke,
        }));
        setJokes(fetchedJokes);
      });

      return () => unsubscribe();
    }, 300); // Debounced to 300ms

    return () => clearTimeout(debounceFetchJokes);
  }, [userUID]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userUID || !newJoke) return; // Ensure the joke isn't empty

    try {
      const jokeCollection = collection(db, "jokes");
      const docRef = await addDoc(jokeCollection, {
        joke: newJoke,
        uid: userUID,
      });
      const newDocId = docRef.id;
      // Only update the state once the Firestore operation succeeds
      setJokes((prevJokes) => [{ id: newDocId, joke: newJoke }, ...prevJokes]);
      setNewJoke("");
    } catch (error) {
      alert(
        "Oops! Something went wrong while adding your joke. Please try again.",
      );
    }
  };

  const handleCancelEdit = () => setEditingJokeId(null);

  const handleEditClick = (jokeId: string) => setEditingJokeId(jokeId);

  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, jokeId: string) => {
      setJokes((currentJokes) => {
        return currentJokes.map((joke) => {
          if (joke.id === jokeId && joke.joke !== e.target.value) {
            return { ...joke, joke: e.target.value };
          }
          return joke;
        });
      });
    },
    [],
  );

  const handleEditSubmit = useCallback(
    async (jokeId: string) => {
      const editedJoke = jokes.find((j) => j.id === jokeId);
      if (!editedJoke) return;

      try {
        const jokeDoc = doc(db, "jokes", jokeId);
        await updateDoc(jokeDoc, {
          joke: editedJoke.joke,
          uid: userUID,
        });
        setEditingJokeId(null);
      } catch (error) {
        alert(
          "Oops! Something went wrong while updating your joke. Please try again.",
        );
      }
    },
    [jokes, userUID],
  );

  const handleDelete = useCallback(async (jokeId: string) => {
    try {
      const jokeDoc = doc(db, "jokes", jokeId);
      await deleteDoc(jokeDoc);
      setJokes((prevJokes) => prevJokes.filter((joke) => joke.id !== jokeId));
    } catch (error) {
      alert(
        "Oops! Something went wrong while deleting your joke. Please try again.",
      );
    }
  }, []);

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
      <main className="flex flex-col content-with-sidebar">
        <h1 className="title text-2xl font-bold text-center mb-8">
          Welcome to JokePad!
        </h1>
        <p className="text-center mb-6">
          Your personal digital notebook for capturing jokes, bits, and comedic
          ideas. Whether it&apos;s a sudden spark of inspiration or refining
          your work in progress, Jokepad helps you organize and perfect your
          comedic genius.
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 m-2 cursor-pointer text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleEditClick(joke.id)}
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 m-2 cursor-pointer text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleDelete(joke.id)}
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14H7L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V3h6v3" />
                    </svg>
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

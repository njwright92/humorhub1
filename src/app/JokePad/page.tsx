"use client";

import React, { useState, useEffect } from "react";
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

type Joke = {
  id: string;
  joke: string;
};

const Jokes = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [newJoke, setNewJoke] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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

  useEffect(() => {
    const fetchJokes = async () => {
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
    };
    if (userUID) {
      fetchJokes();
    }
    return () => {};
  }, [userUID]);

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
    }
  };

  const handleCancelEdit = () => setEditingIndex(null);

  const handleEditClick = (index: React.SetStateAction<number | null>) =>
    setEditingIndex(index);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    setJokes((jokes) => {
      const newJokes = [...jokes];
      newJokes[index].joke = e.target.value;
      return newJokes;
    });
  };
  const handleEditSubmit = async (index: number) => {
    const editedJoke = jokes[index];
    try {
      const jokeDoc = doc(db, "jokes", editedJoke.id);
      await updateDoc(jokeDoc, {
        joke: editedJoke.joke,
        uid: userUID,
      });
      setEditingIndex(null);
    } catch (error) {
      console.error("Error updating joke: ", error);
    }
  };

  const handleDelete = async (jokeId: string) => {
    try {
      const jokeDoc = doc(db, "jokes", jokeId);
      await deleteDoc(jokeDoc);
      setJokes(jokes.filter((joke) => joke.id !== jokeId));
    } catch (error) {
      console.error("Error deleting joke: ", error);
    }
  };

  return (
    <>
      <Header />
      <main className="screen-container flex flex-col">
        <h1 className="title">JokePad!</h1>

        <section className="card-style">
          <form onSubmit={handleSubmit} className="form-container">
            <label htmlFor="joke" className="the-text">
              Write Your Joke/Bit:
            </label>
            <textarea
              id="joke"
              value={newJoke}
              onChange={handleInputChange}
              placeholder="Write your bit.."
              className="input-field"
              required
            />
            <button type="submit" className="btn">
              Add Joke
            </button>
          </form>

          <section className="jokes-list">
            {jokes.map((joke, index) => (
              <article key={index} className="event-item">
                {editingIndex === index ? (
                  <>
                    <textarea
                      value={joke.joke}
                      onChange={(e) => handleEditChange(e, index)}
                      className="input-field flex-grow mb-2"
                    />
                    <div className="button-container flex justify-start">
                      <button
                        className="btn mr-2"
                        onClick={() => handleEditSubmit(index)}
                      >
                        Save
                      </button>
                      <button className="btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <p className="flex-grow">{joke.joke}</p>
                    <div className="icon-container flex-shrink-0 flex">
                      <PencilIcon
                        className="h-6 w-6 mr-2 cursor-pointer"
                        onClick={() => handleEditClick(index)}
                      />
                      <TrashIcon
                        className="h-6 w-6 cursor-pointer"
                        onClick={() => handleDelete(joke.id)}
                      />
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Jokes;

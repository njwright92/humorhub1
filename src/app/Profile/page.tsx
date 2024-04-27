"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import { EventContext, Event } from "../components/eventContext";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../../firebase.config";
import Header from "../components/header";
import Footer from "../components/footer";

export default function UserProfile() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { saveEvent, savedEvents, deleteEvent } = useContext(EventContext);
  const auth = getAuth();
  const storage = getStorage();
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const uidRef = useRef<string | null>(null);

  const profileImageObjectURL = useMemo(() => {
    return profileImage ? URL.createObjectURL(profileImage) : null;
  }, [profileImage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
      if (user) {
        uidRef.current = user.uid;
      } else {
        uidRef.current = null;
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchUserDataAndEvents = useCallback(
    async (user: User) => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userEventsRef = doc(db, "userEvents", user.uid);

        const [userDocSnap, userEventsDocSnap] = await Promise.all([
          getDoc(userRef),
          getDoc(userEventsRef),
        ]);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setName(userData.name);
          setBio(userData.bio);
          setProfileImageUrl(userData.profileImageUrl);
        }

        if (userEventsDocSnap.exists() && userEventsDocSnap.data().events) {
          const eventsFromFirestore: Event[] = userEventsDocSnap.data().events;
          eventsFromFirestore.forEach((event) => {
            if (!savedEvents.some((e) => e.id === event.id)) {
              saveEvent(event);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user data and events:", error);
      }
    },
    [saveEvent, savedEvents]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserDataAndEvents(user);
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUserDataAndEvents]);

  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setProfileImage(file);

        const storageRef = ref(storage, `profileImages/${uidRef.current}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setProfileImageUrl(url);
      }
    },
    [storage]
  );

  const handleSubmit = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            name,
            bio,
            profileImageUrl,
          },
          { merge: true }
        );
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating/creating profile:", error);
      }
    }
  }, [auth, name, bio, profileImageUrl]);

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      try {
        await deleteEvent(eventId);
        alert("Event deleted successfully");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete the event. Please try again.");
      }
    },
    [deleteEvent]
  );

  const handleEdit = useCallback(() => {
    if (!isUserSignedIn) {
      alert("You must be signed in to edit your profile.");
      return;
    }
    setIsEditing(true);
  }, [isUserSignedIn]);

  const handleCancel = useCallback(() => {
    setName(name);
    setBio(bio);
    setProfileImageUrl(profileImageUrl);

    setIsEditing(false);
  }, [name, bio, profileImageUrl]);

  return (
    <>
      <Header />
      <main className="screen-container">
        <h1 className="title text-4xl font-bold text-center mb-6">
          Your Profile
        </h1>

        <section className="card-style p-6 rounded-lg shadow-lg bg-zinc-200 mb-6">
          <div className="mb-6">
            {isEditing ? (
              <>
                <label
                  htmlFor="profilePicture"
                  className="block text-lg font-medium mb-2"
                >
                  Profile Picture:
                </label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  onChange={handleImageChange}
                  className="standard-input mb-4"
                />
                {profileImageObjectURL && (
                  <Image
                    src={profileImageObjectURL}
                    alt="Profile Preview"
                    width={300}
                    height={300}
                    className="profile-image rounded-full mx-auto"
                    priority
                  />
                )}
              </>
            ) : (
              profileImageUrl && (
                <Image
                  src={profileImageUrl}
                  alt="Profile Preview"
                  width={200}
                  height={200}
                  className="profile-image rounded-full mx-auto"
                  unoptimized
                  priority
                />
              )
            )}
          </div>

          <div className="form-container mb-4">
            {isEditing ? (
              <>
                <label
                  htmlFor="name"
                  style={{ color: "#d4d4d8" }}
                  className="block text-lg font-medium mb-2"
                >
                  Name:
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ backgroundColor: "#1f2022", color: "#d4d4d8" }}
                  className="standard-input"
                />
              </>
            ) : (
              <p
                className="subtitle-style font-semibold text-xl"
                style={{ color: "#d4d4d8" }}
              >
                {name}
              </p>
            )}
          </div>

          <div className="form-container mb-6">
            {isEditing ? (
              <>
                <label
                  htmlFor="bio"
                  style={{ color: "#d4d4d8" }}
                  className="block text-lg font-medium mb-2"
                >
                  Bio:
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{
                    backgroundColor: "#1f2022",
                    color: "#d4d4d8",
                    height: "6rem",
                  }}
                  className="standard-input"
                />
              </>
            ) : (
              <p
                className="subtitle-style text-md"
                style={{ color: "#d4d4d8" }}
              >
                {bio}
              </p>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={isEditing ? handleSubmit : handleEdit}
              className="btn bg-orange-500 hover:bg-orange-700 text-zinc-200 font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-150 ease-in-out hover:animate-pulse"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>

            {isEditing && (
              <button
                onClick={handleCancel}
                className="btn bg-zinc-500 hover:bg-zinc-700 text-zinc-200 font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-150 ease-in-out hover:animate-pulse"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2
            className="title-style text-3xl font-bold mb-4"
            style={{ color: "#d4d4d8" }}
          >
            Saved Events
          </h2>
          {savedEvents.length > 0 ? (
            savedEvents.map((event) => (
              <article
                key={event.id}
                className="event-item mb-4 p-4 rounded-lg shadow-lg"
                style={{ backgroundColor: "#1f2022", color: "#d4d4d8" }}
              >
                <h3 className="subtitle-style text-xl font-semibold">
                  {event.name}
                </h3>
                <p className="text-md mb-2">Location: {event.location}</p>
                <div className="details mb-2">
                  <span className="the-text font-medium">ℹ️ Details:</span>
                  <div
                    dangerouslySetInnerHTML={{ __html: event.details }}
                    style={{ color: "#d4d4d8" }}
                  />
                </div>
                <button
                  className="btn bg-red-500 hover:bg-red-700 text-zinc-200 font-bold py-1 px-3 rounded hover:animate-pulse transition-colors duration-150 ease-in-out"
                  onClick={() => handleDeleteEvent(event.id)}
                  style={{ color: "#d4d4d8" }}
                >
                  Delete
                </button>
              </article>
            ))
          ) : (
            <p style={{ color: "#d4d4d8" }}>No saved events to show.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

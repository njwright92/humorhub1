"use client";

import React, { useState, useEffect, useContext, useMemo } from "react";
import Image from "next/image";
import { EventContext, Event } from "../components/eventContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

  const profileImageObjectURL = useMemo(() => {
    return profileImage ? URL.createObjectURL(profileImage) : null;
  }, [profileImage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setName(userData.name);
            setBio(userData.bio);
            setProfileImageUrl(userData.profileImageUrl);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        try {
          const userEventsRef = doc(db, "userEvents", user.uid);
          const docSnapEvents = await getDoc(userEventsRef);
          if (docSnapEvents.exists() && docSnapEvents.data().events) {
            const eventsFromFirestore: Event[] = docSnapEvents.data().events;
            eventsFromFirestore.forEach((event: Event) => {
              if (!savedEvents.some((e) => e.id === event.id)) {
                saveEvent(event);
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user events:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [auth, saveEvent, savedEvents]);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfileImage(file);

      const storageRef = ref(storage, `profileImages/${auth.currentUser?.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileImageUrl(url);
    }
  };

  const handleSubmit = async () => {
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
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete the event. Please try again.");
    }
  };

  const handleEdit = () => {
    if (!isUserSignedIn) {
      alert("You must be signed in to edit your profile.");
      return;
    }
    setIsEditing(true);
  };

  return (
    <>
      <Header />
      <div className="screen-container">
        <h1 className="title">User Profile</h1>
        <div className="card-style">
          <div className="mb-6">
            {isEditing && (
              <label htmlFor="profilePicture">Profile Picture:</label>
            )}
            {isEditing ? (
              <>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  onChange={handleImageChange}
                  className="standard-input"
                />
                {profileImageObjectURL && (
                  <div className="inline-block">
                    <Image
                      src={profileImageObjectURL}
                      alt="Profile Preview"
                      width={300}
                      height={300}
                      className="profile-image"
                      priority
                    />
                  </div>
                )}
              </>
            ) : (
              profileImageUrl && (
                <div className="inline-block">
                  <Image
                    src={profileImageUrl}
                    alt="Profile Preview"
                    width={200}
                    height={200}
                    className="profile-image"
                    unoptimized
                    priority
                  />
                </div>
              )
            )}
          </div>

          <div className="form-container">
            {isEditing && <label htmlFor="name">Name:</label>}
            {isEditing ? (
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="standard-input"
              />
            ) : (
              <p className="subtitle-style">{name}</p>
            )}
          </div>

          <div className="form-container">
            {isEditing && <label htmlFor="bio">Bio:</label>}
            {isEditing ? (
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="standard-input h-24"
              />
            ) : (
              <p className="subtitle-style">{bio}</p>
            )}
          </div>

          {isEditing ? (
            <button onClick={handleSubmit} className="btn">
              Save Changes
            </button>
          ) : (
            <button onClick={handleEdit} className="btn">
              Edit Profile
            </button>
          )}
        </div>

        <div className="mb-6">
          <h2 className="title-style">Saved Events</h2>
          {savedEvents.map((event) => (
            <div key={event.id} className="event-item">
              <h3 className="subtitle-style">{event.name}</h3>
              <p className="standard-input">Location: {event.location}</p>
              <div className="details">
                <span className="the-text">ℹ️ Details:</span>
                <div dangerouslySetInnerHTML={{ __html: event.details }} />
              </div>
              <button
                className="btn"
                onClick={() => handleDeleteEvent(event.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { type User, getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../../firebase.config";
import Head from "next/head";
import Script from "next/script";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("../components/header"), {});
const Footer = dynamic(() => import("../components/footer"), {});

type Event = {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
  location: string;
  details: string;
  lng: number;
  lat: number;
  googleTimestamp: string;
  festival?: boolean;
  userId?: string;
};

export default function UserProfile() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const auth = getAuth();
  const storage = getStorage();
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const uidRef = useRef<string | null>(null);

  // Memoize profile image object URL creation
  const profileImageObjectURL = useMemo(() => {
    if (!profileImage) return null;

    const objectURL = URL.createObjectURL(profileImage);
    return objectURL;
  }, [profileImage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
      uidRef.current = user?.uid || null; // Simplified ternary operator
    });

    return unsubscribe; // Cleanup the subscription on unmount
  }, [auth]);

  const fetchUserDataAndEvents = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setName(userData?.name || "");
        setBio(userData?.bio || "");
        setProfileImageUrl(userData?.profileImageUrl || "");
      }

      // Fetch saved events directly from 'savedEvents'
      const q = query(
        collection(db, "savedEvents"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const fetchedEvents: Event[] = querySnapshot.docs.map(
        (doc) => doc.data() as Event,
      );
      setSavedEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching profile data and events:", error);
      alert("Oops! We couldn't load your profile data and events.");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserDataAndEvents(user);
      }
    });

    return unsubscribe; // Cleanup the subscription on unmount
  }, [auth, fetchUserDataAndEvents]);

  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setProfileImage(file); // Set image state early

      try {
        const storageRef = ref(storage, `profileImages/${uidRef.current}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setProfileImageUrl(url); // Set profile image URL after upload
      } catch (error) {
        console.error("Error uploading image:", error); // Better error logging
        alert("Oops! Something went wrong while uploading the image.");
      }
    },
    [storage],
  );

  const handleSubmit = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return; // Return early if the user is not authenticated

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { name, bio, profileImageUrl }, { merge: true });
      setIsEditing(false); // Disable editing mode after successful save
    } catch (error) {
      console.error("Error saving profile:", error); // Log the error
      alert("Oops! Something went wrong while saving your profile.");
    }
  }, [auth, name, bio, profileImageUrl]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "savedEvents", eventId));
      setSavedEvents((prevEvents) =>
        prevEvents.filter((e) => e.id !== eventId),
      );
      alert("Event deleted successfully.");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Oops! Something went wrong while deleting the event.");
    }
  }, []);

  const handleEdit = useCallback(() => {
    if (!isUserSignedIn) {
      alert("You must be signed in to edit your profile.");
      return;
    }
    setIsEditing(true); // Enable editing mode
  }, [isUserSignedIn]);

  const handleCancel = useCallback(() => {
    setName(name); // Reset name
    setBio(bio); // Reset bio
    setProfileImageUrl(profileImageUrl); // Reset profile image URL
    setIsEditing(false); // Exit editing mode
  }, [name, bio, profileImageUrl]);

  function sendDataLayerEvent(
    event_name: string,
    params: { event_category: string; event_label: string },
  ) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: event_name,
      ...params,
    });
  }

  return (
    <>
      <Head>
        <title>Your Profile - Manage Your Humor Hub Account</title>
        <meta
          name="description"
          content="Access and manage your Humor Hub profile. Update your information, preferences, and view your favorite content."
        />
        <meta
          name="keywords"
          content="Humor Hub profile, manage account, update profile, comedy account"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/Profile" />
        <meta
          property="og:title"
          content="Your Profile - Manage Your Humor Hub Account"
        />
        <meta
          property="og:description"
          content="Access and manage your Humor Hub profile. Update your information, preferences, and view your favorite content."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/Profile" />
        <meta property="og:type" content="website" />
        {/* Only keep if this image actually exists */}
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-profile.jpg"
        />
      </Head>

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-WH6KKVYT8F"
      />

      <Header />

      <main className="screen-container content-with-sidebar">
        <h1 className="title text-center mb-6">Your Profile</h1>

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
                  className="standard-input mb-4 "
                  onClick={() => {
                    sendDataLayerEvent("click_upload_profile_image", {
                      event_category: "Profile_Interaction",
                      event_label: "Profile_Image_Upload",
                    });
                  }}
                />
                {profileImageObjectURL && (
                  <Image
                    src={profileImageObjectURL}
                    alt="Profile Preview"
                    width={240}
                    height={240}
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

          <div className="mb-4">
            {isEditing ? (
              <>
                <label htmlFor="name" className="block text-xl mb-2">
                  Name:
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="standard-input w-full"
                />
              </>
            ) : (
              <p className="subtitle-style font-semibold text-xl">{name}</p>
            )}
          </div>

          <div className="mb-6">
            {isEditing ? (
              <>
                <label htmlFor="bio" className="block text-lg mb-2">
                  Bio:
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="standard-input"
                />
              </>
            ) : (
              <p className="subtitle-style text-md">{bio}</p>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                if (!isUserSignedIn) {
                  alert("You must be signed in to edit your profile.");
                  return;
                }
                if (isEditing) {
                  sendDataLayerEvent("click_save_changes", {
                    event_category: "Profile_Interaction",
                    event_label: "Save_Changes_Click",
                  });
                  handleSubmit();
                } else {
                  sendDataLayerEvent("click_edit_profile", {
                    event_category: "Profile_Interaction",
                    event_label: "Edit_Profile_Click",
                  });
                  handleEdit();
                }
              }}
              className="btn bg-orange-500 hover:bg-orange-700 py-2 px-4"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </button>

            {isEditing && (
              <button
                onClick={() => {
                  sendDataLayerEvent("click_cancel_edit", {
                    event_category: "Profile_Interaction",
                    event_label: "Cancel_Edit_Click",
                  });
                  handleCancel();
                }}
                className="btn bg-zinc-500 hover:bg-zinc-700 py-2 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="title text-zinc-200 mb-4">Saved Events</h2>

          {savedEvents.length > 0 ? (
            savedEvents.map((event) => (
              <article
                key={event.id}
                className="event-item mb-4 p-4 rounded-lg shadow-lg bg-zinc-800 text-zinc-200"
              >
                <h3 className="subtitle-style text-xl font-semibold">
                  {event.name}
                </h3>
                <p className="text-md mb-2">Location: {event.location}</p>
                <div className="details mb-2">
                  <span className="the-text font-medium block mb-1">
                    ℹ️ Details:
                  </span>
                  <div dangerouslySetInnerHTML={{ __html: event.details }} />
                </div>
                <button
                  className="btn bg-red-500 hover:bg-red-700 py-1 px-3"
                  onClick={() => {
                    handleDeleteEvent(event.id);
                    sendDataLayerEvent("click_delete_saved_event", {
                      event_category: "Event_Management",
                      event_label: "Delete_Saved_Event_Click",
                    });
                  }}
                >
                  Delete
                </button>
              </article>
            ))
          ) : (
            <p className="text-zinc-400 text-center">
              No saved events to show.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
// 1. IMPORT signOut
import { type User, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../../firebase.config";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import router for redirect

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

export default function ProfileClient() {
  // --- STATE ---
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Used to reset data on cancel
  const [originalName, setOriginalName] = useState("");
  const [originalBio, setOriginalBio] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- FIREBASE HOOKS ---
  const auth = getAuth();
  const storage = getStorage();
  const uidRef = useRef<string | null>(null);
  const router = useRouter();

  // --- MEMOS ---
  const profileImageObjectURL = useMemo(() => {
    if (!profileImage) return null;
    return URL.createObjectURL(profileImage);
  }, [profileImage]);

  // --- DATA FETCHING ---
  const fetchUserDataAndEvents = useCallback(async (user: User) => {
    try {
      setIsLoading(true);
      const userRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const dbName = userData?.name || "";
        const dbBio = userData?.bio || "";
        const dbImage = userData?.profileImageUrl || "";

        setName(dbName);
        setBio(dbBio);
        setProfileImageUrl(dbImage);
        setOriginalName(dbName);
        setOriginalBio(dbBio);
      }

      const q = query(
        collection(db, "savedEvents"),
        where("userId", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);
      const fetchedEvents: Event[] = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Event,
      );
      setSavedEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserSignedIn(!!user);
      uidRef.current = user?.uid || null;

      if (user) {
        fetchUserDataAndEvents(user);
      } else {
        setSavedEvents([]);
        setName("");
        setBio("");
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [auth, fetchUserDataAndEvents]);

  // --- HANDLERS ---

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [auth, router]);

  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setProfileImage(file);
      if (!uidRef.current) return;

      try {
        const storageRef = ref(storage, `profileImages/${uidRef.current}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setProfileImageUrl(url);
      } catch (error) {
        alert("Error uploading image.");
      }
    },
    [storage],
  );

  const handleSubmit = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { name, bio, profileImageUrl }, { merge: true });
      setOriginalName(name);
      setOriginalBio(bio);
      setIsEditing(false);
    } catch (error) {
      alert("Error saving profile.");
    }
  }, [auth, name, bio, profileImageUrl]);

  const handleCancel = useCallback(() => {
    setName(originalName);
    setBio(originalBio);
    setIsEditing(false);
  }, [originalName, originalBio]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    if (!confirm("Are you sure you want to remove this event?")) return;
    try {
      await deleteDoc(doc(db, "savedEvents", eventId));
      setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      alert("Error deleting event.");
    }
  }, []);

  function sendDataLayerEvent(
    event_name: string,
    params: { event_category: string; event_label: string },
  ) {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: event_name, ...params });
    }
  }

  // --- RENDER ---

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="screen-container flex items-center justify-center h-[60vh]">
          <div className="text-zinc-200 animate-pulse font-bold text-xl">
            Loading Profile...
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="screen-container content-with-sidebar">
        <div className="flex flex-col items-center mb-8">
          <h1 className="title text-center">My Dashboard</h1>
          <p className="text-zinc-300 text-sm">Manage your personal schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {/* --- LEFT COLUMN: PROFILE CARD --- */}
          <div className="lg:col-span-1">
            <section className="bg-zinc-200 border border-zinc-300 p-6 rounded-lg shadow-lg sticky top-24">
              <div className="flex flex-col items-center">
                {!isEditing && (
                  <h2 className="text-2xl font-bold text-zinc-900 mb-4 text-center">
                    {name || "Anonymous Comic"}
                  </h2>
                )}

                <div className="relative w-36 h-36 mb-4 mx-auto group rounded-full overflow-hidden border-4 border-zinc-900 shadow-lg bg-zinc-300">
                  {profileImageObjectURL || profileImageUrl ? (
                    <Image
                      src={profileImageObjectURL || profileImageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-300 text-zinc-500">
                      <span className="text-4xl">🎤</span>
                    </div>
                  )}

                  {isEditing && (
                    <label
                      htmlFor="profilePicture"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-xs font-bold text-zinc-100">
                        Change
                      </span>
                      <input
                        id="profilePicture"
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-900 uppercase mb-1 block">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-100 border border-zinc-400 rounded-lg p-2 text-zinc-900 focus:border-blue-500 outline-none"
                        placeholder="Stage Name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-900 uppercase mb-1 block">
                        Personal Note / Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-zinc-100 border border-zinc-400 rounded-lg p-2 text-zinc-900 focus:border-blue-500 outline-none text-sm"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-900 hover:bg-blue-700 text-zinc-100 py-2 rounded-lg font-bold text-sm transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-600 text-zinc-100 py-2 rounded-lg font-bold text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    {bio ? (
                      <p className="text-zinc-700 text-sm mb-6 italic border-t border-zinc-300 pt-4">
                        &rdquo;{bio}&rdquo;
                      </p>
                    ) : (
                      <p className="text-zinc-500 text-xs mb-6 mt-2">
                        No bio set.
                      </p>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-zinc-800 hover:bg-zinc-900 text-zinc-100 py-2 rounded-lg font-semibold text-sm transition shadow-lg"
                      >
                        Edit Profile
                      </button>
                      {/* 2. NEW SIGN OUT BUTTON */}
                      <button
                        onClick={handleSignOut}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-sm transition shadow-lg"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 min-h-[500px]">
              <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                <span>🎟️</span> Saved Events
                <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">
                  {savedEvents.length}
                </span>
              </h2>

              {savedEvents.length > 0 ? (
                <div className="space-y-4">
                  {savedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative bg-zinc-900 border border-zinc-700 rounded-lg p-5 hover:border-blue-500/50 transition-all hover:shadow-lg flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                            {event.name}
                          </h3>
                          {event.festival && (
                            <span className="bg-purple-900 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                              Festival
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-300 text-sm mb-1 flex items-center gap-1">
                          <span>📍</span> {event.location}
                        </p>
                        <p className="text-zinc-400 text-xs mb-3 flex items-center gap-1">
                          <span>📅</span> {event.date}{" "}
                          {event.isRecurring ? "(Recurring)" : ""}
                        </p>
                        <div className="text-zinc-500 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          <div
                            dangerouslySetInnerHTML={{ __html: event.details }}
                          />
                        </div>
                      </div>
                      <div className="flex sm:flex-col justify-between items-end gap-2 min-w-[100px]">
                        <Link
                          href={`/MicFinder?city=${
                            event.location.split(",")[1]?.trim() || ""
                          }`}
                          className="text-xs text-zinc-400 hover:text-zinc-100 underline"
                        >
                          Find on Map
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20 px-3 py-1 rounded-lg text-sm font-semibold transition w-auto border border-red-500 hover:border-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg">
                  <span className="text-4xl mb-2">📭</span>
                  <p className="text-lg font-semibold">No events saved yet</p>
                  <p className="text-sm mb-4">Go find some mics to hit!</p>
                  <Link
                    href="/MicFinder"
                    className="bg-blue-600 hover:bg-blue-700 text-zinc-100 px-4 py-2 rounded-lg font-bold transition"
                  >
                    Go to MicFinder
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

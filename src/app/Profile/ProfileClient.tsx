"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../../firebase.config";
import { useToast } from "../components/ToastContext";
import Header from "../components/header";
import Footer from "../components/footer";
import type { Auth, User } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

type Event = {
  id: string;
  date: string;
  name: string;
  isRecurring: boolean;
  location: string;
  details: string;
  festival?: boolean;
};

export default function ProfileClient() {
  const { showToast } = useToast();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const authRef = useRef<Auth | null>(null);
  const storageRef = useRef<FirebaseStorage | null>(null);
  const uidRef = useRef<string | null>(null);

  const profileImageObjectURL = useMemo(() => {
    return profileImage ? URL.createObjectURL(profileImage) : null;
  }, [profileImage]);

  const fetchUserDataAndEvents = useCallback(async (user: User) => {
    try {
      setIsLoading(true);
      const { doc, getDoc, collection, getDocs, query, where } =
        await import("firebase/firestore");

      const userDocSnap = await getDoc(doc(db, "users", user.uid));

      if (userDocSnap.exists()) {
        const {
          name: dbName = "",
          bio: dbBio = "",
          profileImageUrl: dbImage = "",
        } = userDocSnap.data();
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
      setSavedEvents(
        querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Event,
        ),
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      const { getStorage } = await import("firebase/storage");
      const { app } = await import("../../../firebase.config");

      const auth = await getAuth();
      authRef.current = auth;
      storageRef.current = getStorage(app);

      unsubscribe = onAuthStateChanged(auth, (user) => {
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
    };

    initAuth();
    return () => unsubscribe?.();
  }, [fetchUserDataAndEvents]);

  const handleSignOut = useCallback(async () => {
    showToast("Signed out successfully", "success");
    try {
      const { signOut } = await import("firebase/auth");
      if (authRef.current) {
        await signOut(authRef.current);
        router.push("/");
      }
    } catch {
      showToast("Error signing out", "error");
    }
  }, [router, showToast]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !uidRef.current || !storageRef.current) return;

      setProfileImage(file);
      try {
        const { ref, uploadBytes, getDownloadURL } =
          await import("firebase/storage");
        const imageRef = ref(
          storageRef.current,
          `profileImages/${uidRef.current}`,
        );
        await uploadBytes(imageRef, file);
        setProfileImageUrl(await getDownloadURL(imageRef));
        showToast("Image uploaded!", "success");
      } catch {
        showToast("Error uploading image.", "error");
      }
    },
    [showToast],
  );

  const handleSubmit = useCallback(async () => {
    const user = authRef.current?.currentUser;
    if (!user) return;

    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(
        doc(db, "users", user.uid),
        { name, bio, profileImageUrl },
        { merge: true },
      );
      setOriginalName(name);
      setOriginalBio(bio);
      setIsEditing(false);
      showToast("Profile saved!", "success");
    } catch {
      showToast("Error saving profile.", "error");
    }
  }, [name, bio, profileImageUrl, showToast]);

  const handleCancel = useCallback(() => {
    setName(originalName);
    setBio(originalBio);
    setIsEditing(false);
  }, [originalName, originalBio]);

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      if (!confirm("Are you sure you want to remove this event?")) return;
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "savedEvents", eventId));
        setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
        showToast("Event removed!", "success");
      } catch {
        showToast("Error deleting event.", "error");
      }
    },
    [showToast],
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="screen-container flex items-center justify-center min-h-screen">
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
          <h1 className="title text-center">Profile</h1>
          <p className="text-zinc-300 text-sm">Manage your personal schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
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
                      priority
                      fetchPriority="high"
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
                      <label
                        htmlFor="display-name"
                        className="text-xs font-bold text-zinc-900 uppercase mb-1 block"
                      >
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="display-name"
                        name="displayName"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-100 border border-zinc-400 rounded-lg p-2 text-zinc-900 focus:border-blue-500 outline-none"
                        placeholder="Stage Name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="text-xs font-bold text-zinc-900 uppercase mb-1 block"
                      >
                        Personal Note / Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        autoComplete="off"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-zinc-100 border border-zinc-400 rounded-lg p-2 text-zinc-900 focus:border-blue-500 outline-none text-sm"
                        rows={4}
                        placeholder="Tell us a bit about yourself..."
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
                        className="flex-1 bg-red-900 hover:bg-red-700 text-zinc-100 py-2 rounded-lg font-bold text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    {bio ? (
                      <p className="text-zinc-800 text-md mb-6 italic border-t border-zinc-400 pt-4">
                        &rdquo;{bio}&rdquo;
                      </p>
                    ) : (
                      <p className="text-zinc-800 text-sm mb-6 mt-2">
                        No bio set.
                      </p>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-green-900 hover:bg-green-700 text-zinc-100 py-2 rounded-lg font-semibold text-sm transition shadow-lg"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full bg-red-900 hover:bg-red-700 text-zinc-100 py-2 rounded-lg font-semibold text-sm transition shadow-lg"
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
                        <p className="text-zinc-300 text-xs mb-3 flex items-center gap-1">
                          <span>📅</span> {event.date}{" "}
                          {event.isRecurring ? "(Recurring)" : ""}
                        </p>
                        <div className="text-zinc-300 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          <div
                            dangerouslySetInnerHTML={{ __html: event.details }}
                          />
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-between items-end gap-2 min-w-[100px]">
                        <Link
                          href={`/MicFinder?city=${event.location.split(",")[1]?.trim() || ""}`}
                          className="text-xs text-zinc-400 hover:text-zinc-100 underline"
                        >
                          Find on Map
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1 rounded-lg text-sm font-semibold transition w-auto border border-red-500 hover:border-red-400"
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

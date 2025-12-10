"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastContext";
import type { Auth, User } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

type SavedEvent = {
  id: string;
  date: string;
  name: string;
  isRecurring?: boolean;
  location: string;
  details: string;
  festival?: boolean;
  isMusic?: boolean;
  savedAt?: string;
};

export default function ProfileClient() {
  const { showToast } = useToast();
  const router = useRouter();

  // Profile state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Separate loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  // Events state
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Refs
  const authRef = useRef<Auth | null>(null);
  const storageRef = useRef<FirebaseStorage | null>(null);
  const userRef = useRef<User | null>(null);

  const profileImageObjectURL = useMemo(() => {
    return profileImage ? URL.createObjectURL(profileImage) : null;
  }, [profileImage]);

  useEffect(() => {
    return () => {
      if (profileImageObjectURL) {
        URL.revokeObjectURL(profileImageObjectURL);
      }
    };
  }, [profileImageObjectURL]);

  // Fetch profile via API route (uses Admin SDK - fast & reliable)
  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setName(result.profile.name || "");
        setBio(result.profile.bio || "");
        setProfileImageUrl(result.profile.profileImageUrl || "");
        setOriginalName(result.profile.name || "");
        setOriginalBio(result.profile.bio || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  // Fetch saved events via API route
  const fetchSavedEvents = useCallback(async (user: User) => {
    setIsEventsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/events/saved", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setSavedEvents(result.events || []);
      }
    } catch (error) {
      console.error("Error fetching saved events:", error);
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

  // Initialize auth and fetch data
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth, getStorage } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");

      const auth = await getAuth();
      authRef.current = auth;
      storageRef.current = await getStorage();

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        userRef.current = user;

        if (user) {
          // Load profile via API (fast)
          await fetchUserProfile(user);
          setIsLoading(false);

          // Load events in background
          fetchSavedEvents(user);
        } else {
          setSavedEvents([]);
          setName("");
          setBio("");
          setProfileImageUrl("");
          setIsLoading(false);
          setIsEventsLoading(false);
        }
      });
    };

    initAuth();
    return () => unsubscribe?.();
  }, [fetchUserProfile, fetchSavedEvents]);

  const handleSignOut = useCallback(async () => {
    try {
      const { signOut } = await import("firebase/auth");
      if (authRef.current) {
        await signOut(authRef.current);
        showToast("Signed out successfully", "success");
        router.push("/");
      }
    } catch {
      showToast("Error signing out", "error");
    }
  }, [router, showToast]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const user = userRef.current;

      if (!file || !user || !storageRef.current) return;

      setProfileImage(file);

      try {
        const { ref, uploadBytes, getDownloadURL } =
          await import("firebase/storage");

        const imageRef = ref(storageRef.current, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        setProfileImageUrl(url);
        showToast("Image uploaded!", "success");
      } catch {
        showToast("Error uploading image.", "error");
      }
    },
    [showToast],
  );

  // Save profile via API route
  const handleSubmit = useCallback(async () => {
    const user = userRef.current;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, profileImageUrl }),
      });

      const result = await response.json();
      if (result.success) {
        setOriginalName(name);
        setOriginalBio(bio);
        setIsEditing(false);
        showToast("Profile saved!", "success");
      } else {
        throw new Error(result.error);
      }
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

      const user = userRef.current;
      if (!user) return;

      setIsDeleting(eventId);

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/events/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId }),
        });

        const result = await response.json();
        if (result.success) {
          setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
          showToast("Event removed!", "success");
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        showToast("Error deleting event.", "error");
      } finally {
        setIsDeleting(null);
      }
    },
    [showToast],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col p-2 text-zinc-200 text-center md:ml-20 min-h-screen">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-8 bg-zinc-700 rounded w-1/2 mx-auto" />
            <div className="h-36 w-36 bg-zinc-700 rounded-full mx-auto" />
            <div className="h-4 bg-zinc-700 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-zinc-700 rounded w-1/2 mx-auto" />
          </div>
          <p className="text-zinc-400 mt-4 font-semibold">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!userRef.current) {
    return (
      <div className="flex flex-col p-2 text-zinc-200 text-center md:ml-20 min-h-screen">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 max-w-md">
            <span className="text-6xl mb-4 block">🔐</span>
            <h1 className="text-2xl font-bold text-amber-300 mb-4 font-heading">
              Sign In Required
            </h1>
            <p className="text-zinc-400 mb-6">
              Please sign in to view your profile and saved events.
            </p>
            <Link
              href="/MicFinder"
              className="inline-block bg-amber-300 hover:bg-amber-400 text-zinc-950 px-6 py-3 rounded-lg font-bold transition shadow-lg"
            >
              Go to MicFinder
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col p-2 text-zinc-200 text-center md:ml-20 min-h-screen">
      <div className="flex flex-col items-center mb-8 mt-10">
        <h1 className="text-amber-300 font-bold tracking-wide drop-shadow-xl rounded-lg text-3xl sm:text-5xl md:text-6xl lg:text-6xl text-center font-heading">
          Profile
        </h1>
        <p className="text-zinc-300 text-sm md:text-base mt-2">
          Manage your personal schedule
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <section className="bg-zinc-200 border border-zinc-300 p-4 rounded-lg shadow-lg sticky top-24 text-zinc-900">
            <div className="flex flex-col items-center">
              {!isEditing && (
                <h2 className="text-2xl font-bold text-zinc-900 mb-4 text-center font-heading">
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
                      accept="image/*"
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
                      className="text-md font-bold text-zinc-900 uppercase mb-1 block"
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="display-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-100 border border-zinc-400 rounded-lg p-2 text-zinc-900 focus:border-amber-300 outline-none"
                      placeholder="Stage Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bio"
                      className="text-sm font-bold text-zinc-900 uppercase mb-1 block"
                    >
                      Personal Note / Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-zinc-100 border border-zinc-400 rounded-lg p-2 text-zinc-900 focus:border-amber-300 outline-none text-sm"
                      rows={4}
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-900 hover:bg-blue-700 text-zinc-100 py-2 rounded-lg font-bold text-sm transition cursor-pointer shadow-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-red-900 hover:bg-red-700 text-zinc-100 py-2 rounded-lg font-bold text-sm transition cursor-pointer shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full">
                  {bio ? (
                    <p className="text-zinc-800 text-md mb-6 italic border-t border-zinc-400 pt-4">
                      &ldquo;{bio}&rdquo;
                    </p>
                  ) : (
                    <p className="text-zinc-800 text-sm mb-6 mt-2">
                      No bio set.
                    </p>
                  )}
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-green-900 hover:bg-green-700 text-zinc-100 py-2 rounded-lg font-semibold text-sm transition shadow-lg cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full bg-red-900 hover:bg-red-700 text-zinc-100 py-2 rounded-lg font-semibold text-sm transition shadow-lg cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Saved Events */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-6 min-h-[500px] shadow-xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center justify-center lg:justify-start gap-2 font-heading">
              <span>🎟️</span> Saved Events
              {!isEventsLoading && (
                <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">
                  {savedEvents.length}
                </span>
              )}
            </h2>

            {isEventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 animate-pulse"
                  >
                    <div className="h-5 bg-zinc-700 rounded w-1/2 mb-3" />
                    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-zinc-700 rounded w-1/4 mb-3" />
                    <div className="h-3 bg-zinc-700 rounded w-full" />
                  </div>
                ))}
                <p className="text-center text-zinc-500 mt-4">
                  Loading saved events...
                </p>
              </div>
            ) : savedEvents.length > 0 ? (
              <div className="space-y-4">
                {savedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative bg-zinc-900 border border-zinc-700 rounded-lg p-5 hover:border-amber-300 transition-all hover:shadow-lg flex flex-col sm:flex-row gap-4 justify-between text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-amber-300 group-hover:text-amber-200 transition-colors font-heading">
                          {event.name}
                        </h3>
                        {event.festival && (
                          <span className="bg-purple-900 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            Festival
                          </span>
                        )}
                        {event.isMusic && (
                          <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            Music
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-300 text-sm mb-1 flex items-center gap-1">
                        <span>📍</span> {event.location}
                      </p>
                      <p className="text-zinc-300 text-xs mb-3 flex items-center gap-1">
                        <span>📅</span> {event.date}{" "}
                        {event.isRecurring && "(Recurring)"}
                      </p>
                      {event.details && (
                        <div className="text-zinc-300 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          <div
                            dangerouslySetInnerHTML={{ __html: event.details }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col justify-between items-end gap-2 min-w-[100px]">
                      <Link
                        href={`/MicFinder?city=${encodeURIComponent(event.location.split(",")[1]?.trim() || "")}`}
                        className="text-sm text-zinc-300 hover:text-amber-300 underline transition-colors"
                      >
                        Find on Map
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={isDeleting === event.id}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition border cursor-pointer ${isDeleting === event.id ? "bg-zinc-700 text-zinc-500 border-zinc-600 cursor-not-allowed" : "text-red-400 hover:text-red-100 hover:bg-red-900/50 border-red-500 hover:border-red-400"}`}
                      >
                        {isDeleting === event.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg">
                <span className="text-4xl mb-2">📭</span>
                <p className="text-lg font-semibold font-heading">
                  No events saved yet
                </p>
                <p className="text-sm mb-4">Go find some mics to hit!</p>
                <Link
                  href="/MicFinder"
                  className="bg-amber-300 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-lg font-bold transition shadow-lg transform hover:scale-105"
                >
                  Go to MicFinder
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

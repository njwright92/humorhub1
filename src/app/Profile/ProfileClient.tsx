"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastContext";
import type { Auth, User } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";
import type { Event } from "@/app/lib/types";

const btnBase =
  "w-full rounded-lg py-2 text-sm font-semibold text-zinc-100 shadow-lg transition";
const btnEdit = `${btnBase} bg-green-900 hover:bg-green-700`;
const btnSignOut = `${btnBase} bg-red-900 hover:bg-red-700`;

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

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  // Events state
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
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
      if (profileImageObjectURL) URL.revokeObjectURL(profileImageObjectURL);
    };
  }, [profileImageObjectURL]);

  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        const { name = "", bio = "", profileImageUrl = "" } = result.profile;
        setName(name);
        setBio(bio);
        setProfileImageUrl(profileImageUrl);
        setOriginalName(name);
        setOriginalBio(bio);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const fetchSavedEvents = useCallback(async (user: User) => {
    setIsEventsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/events/saved", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) setSavedEvents(result.events || []);
    } catch (error) {
      console.error("Error fetching saved events:", error);
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

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
          await fetchUserProfile(user);
          setIsLoading(false);
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
    [showToast]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
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
    },
    [name, bio, profileImageUrl, showToast]
  );

  const handleCancel = useCallback(() => {
    setName(originalName);
    setBio(originalBio);
    setIsEditing(false);
  }, [originalName, originalBio]);

  const handleDeleteEvent = useCallback(
    async (eventId: string, eventName: string) => {
      if (!confirm(`Remove "${eventName}" from your saved events?`)) return;

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
    [showToast]
  );

  // Loading State
  if (isLoading) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center"
        role="status"
        aria-label="Loading profile"
      >
        <div className="w-full max-w-md animate-pulse space-y-4">
          <div className="mx-auto h-8 w-1/2 rounded bg-zinc-700" />
          <div className="mx-auto size-36 rounded-full bg-zinc-700" />
          <div className="mx-auto h-4 w-3/4 rounded bg-zinc-700" />
          <div className="mx-auto h-4 w-1/2 rounded bg-zinc-700" />
        </div>
        <p className="sr-only">Loading Profile...</p>
      </div>
    );
  }

  // Not Signed In State
  if (!userRef.current) {
    return (
      <div className="mt-10 flex flex-1 flex-col items-center justify-center">
        <section className="max-w-md rounded-lg border border-zinc-700 bg-zinc-800 p-8 text-center">
          <span className="mb-4 block text-6xl" aria-hidden="true">
            🔐
          </span>
          <h2 className="font-heading mb-4 text-2xl font-bold text-amber-300">
            Sign In Required
          </h2>
          <p className="mb-6 text-zinc-400">
            Please sign in to view your profile and saved events.
          </p>
          <Link
            href="/MicFinder"
            className="inline-block rounded-lg bg-amber-300 px-6 py-3 font-bold text-zinc-950 shadow-lg transition-transform hover:scale-105 hover:bg-amber-400"
          >
            Go to MicFinder
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-3">
      {/* Profile Card */}
      <aside className="lg:col-span-1">
        <section
          aria-labelledby="profile-heading"
          className="sticky top-24 rounded-lg border border-zinc-300 bg-zinc-200 p-4 text-zinc-900 shadow-lg"
        >
          <h2 id="profile-heading" className="sr-only">
            Your Profile
          </h2>

          <div className="flex flex-col items-center">
            {!isEditing && (
              <p className="font-heading mb-4 text-center text-2xl font-bold">
                {name || "Anonymous Comic"}
              </p>
            )}

            <figure className="group relative mx-auto mb-4 size-36 overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-300 shadow-lg">
              {profileImageObjectURL || profileImageUrl ? (
                <Image
                  src={profileImageObjectURL || profileImageUrl}
                  alt={`${name || "User"}'s profile picture`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center text-4xl text-zinc-500"
                  aria-hidden="true"
                >
                  🎤
                </div>
              )}

              {isEditing && (
                <label
                  htmlFor="profilePicture"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <span className="text-xs font-bold text-zinc-100">
                    Change
                  </span>
                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
            </figure>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label
                    htmlFor="display-name"
                    className="mb-1 block text-sm font-bold uppercase"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="display-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-400 bg-zinc-100 p-2 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50"
                    placeholder="Stage Name"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1 block text-sm font-bold uppercase"
                  >
                    Personal Note / Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full resize-none rounded-lg border border-zinc-400 bg-zinc-100 p-2 text-sm focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50"
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-900 py-2 text-sm font-bold text-zinc-100 shadow-md transition hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-lg bg-red-900 py-2 text-sm font-bold text-zinc-100 shadow-md transition hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full text-center">
                {bio ? (
                  <blockquote className="mb-6 border-t border-zinc-400 pt-4 text-zinc-800 italic">
                    &ldquo;{bio}&rdquo;
                  </blockquote>
                ) : (
                  <p className="mt-2 mb-6 text-sm text-zinc-500 italic">
                    No bio set.
                  </p>
                )}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className={btnEdit}
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={btnSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </aside>

      {/* Saved Events */}
      <section aria-labelledby="events-heading" className="lg:col-span-2">
        <div className="min-h-[500px] rounded-lg border border-zinc-700 bg-zinc-800/80 p-6 shadow-xl backdrop-blur-sm">
          <h2
            id="events-heading"
            className="font-heading mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-zinc-100 lg:justify-start"
          >
            <span aria-hidden="true">🎟️</span> Saved Events
            {!isEventsLoading && (
              <span className="rounded-full bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                <span className="sr-only">Total: </span>
                {savedEvents.length}
              </span>
            )}
          </h2>

          {isEventsLoading ? (
            <div
              role="status"
              aria-label="Loading events"
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-zinc-700 bg-zinc-900 p-5"
                >
                  <div className="mb-3 h-5 w-1/2 rounded bg-zinc-700" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-zinc-700" />
                  <div className="mb-3 h-4 w-1/4 rounded bg-zinc-700" />
                  <div className="h-3 w-full rounded bg-zinc-700" />
                </div>
              ))}
              <p className="sr-only">Loading saved events...</p>
            </div>
          ) : savedEvents.length > 0 ? (
            <ul className="space-y-4">
              {savedEvents.map((event) => (
                <li key={event.id}>
                  <article className="group relative flex flex-col justify-between gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-5 text-left transition-all hover:border-amber-300 hover:shadow-lg sm:flex-row">
                    <div className="flex-1">
                      <header className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-amber-300 transition-colors group-hover:text-amber-200">
                          {event.name}
                        </h3>
                        {event.festival && (
                          <span className="rounded bg-purple-900 px-2 py-0.5 text-[10px] font-bold text-purple-200 uppercase">
                            Festival
                          </span>
                        )}
                        {event.isMusic && (
                          <span className="rounded bg-blue-900 px-2 py-0.5 text-[10px] font-bold text-blue-200 uppercase">
                            Music
                          </span>
                        )}
                      </header>
                      <p className="mb-1 flex items-center gap-1 text-sm text-zinc-300">
                        <span aria-hidden="true">📍</span>
                        <span className="sr-only">Location:</span>
                        {event.location}
                      </p>
                      <p className="mb-3 flex items-center gap-1 text-xs text-zinc-300">
                        <span aria-hidden="true">📅</span>
                        <span className="sr-only">Date:</span>
                        {event.date}
                        {event.isRecurring && " (Recurring)"}
                      </p>
                      {event.details && (
                        <div
                          className="line-clamp-2 text-sm text-zinc-300 transition-all duration-300 group-hover:line-clamp-none"
                          dangerouslySetInnerHTML={{ __html: event.details }}
                        />
                      )}
                    </div>
                    <footer className="flex min-w-[100px] items-end justify-between gap-2 sm:flex-col">
                      <Link
                        href={`/MicFinder?city=${encodeURIComponent(event.location.split(",")[1]?.trim() || "")}`}
                        className="text-sm text-zinc-300 underline transition-colors hover:text-amber-300"
                      >
                        Find on Map
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        disabled={isDeleting === event.id}
                        className={`rounded-lg border px-3 py-1 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isDeleting === event.id
                            ? "border-zinc-600 bg-zinc-700 text-zinc-500"
                            : "border-red-500 text-red-400 hover:border-red-400 hover:bg-red-900/50 hover:text-red-100"
                        }`}
                        aria-label={`Remove ${event.name}`}
                      >
                        {isDeleting === event.id ? "Removing..." : "Remove"}
                      </button>
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 text-center text-zinc-500">
              <span className="mb-2 text-4xl" aria-hidden="true">
                📭
              </span>
              <p className="font-heading text-lg font-semibold">
                No events saved yet
              </p>
              <p className="mb-4 text-sm">Go find some mics to hit!</p>
              <Link
                href="/MicFinder"
                className="rounded-lg bg-amber-300 px-4 py-2 font-bold text-zinc-950 shadow-lg transition-transform hover:scale-105 hover:bg-amber-400"
              >
                Go to MicFinder
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

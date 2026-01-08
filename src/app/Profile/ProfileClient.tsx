"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../components/ToastContext";
import type { Auth, User } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";
import type { Event } from "@/app/lib/types";

const SKELETON_ITEMS = [1, 2, 3] as const;

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white p-2 outline-hidden focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

interface Profile {
  name: string;
  bio: string;
  profileImageUrl: string;
}

interface ProfileClientProps {
  skeleton: ReactNode;
  signInPrompt: ReactNode;
}

const EMPTY_PROFILE: Profile = { name: "", bio: "", profileImageUrl: "" };

const SavedEventCard = memo(function SavedEventCard({
  event,
  isDeleting,
  onDelete,
}: {
  event: Event;
  isDeleting: boolean;
  onDelete: (id: string, name: string) => void;
}) {
  const city = event.location.split(",")[1]?.trim() || "";
  const mapHref = `/mic-finder?city=${encodeURIComponent(city)}`;

  return (
    <article
      role="listitem"
      className="group grid gap-4 rounded-2xl border border-stone-600 p-4 text-left shadow-lg hover:border-amber-700 sm:grid-cols-[1fr_auto]"
    >
      <div>
        <h3 className="mb-1 inline text-amber-700">{event.name}</h3>

        {event.isFestival && (
          <span className="ml-2 inline-block rounded-2xl bg-purple-900 px-2 py-0.5 align-middle text-xs font-bold text-purple-200 uppercase">
            Festival
          </span>
        )}

        {event.isMusic && (
          <span className="ml-2 inline-block rounded-2xl bg-blue-900 px-2 py-0.5 align-middle text-xs font-bold text-blue-200 uppercase">
            Music
          </span>
        )}

        <p className="mt-1 text-sm">
          <span aria-hidden="true">📍</span> {event.location}
        </p>

        <p className="mb-3 text-xs">
          <span aria-hidden="true">📅</span> {event.date}
          {event.isRecurring && " (Recurring)"}
        </p>

        {event.details && (
          <div
            className="line-clamp-2 text-sm group-hover:line-clamp-none"
            dangerouslySetInnerHTML={{ __html: event.details }}
          />
        )}
      </div>

      <div className="grid auto-cols-auto grid-flow-col items-end justify-between gap-2 sm:grid-flow-row sm:justify-items-end">
        <Link
          prefetch={false}
          href={mapHref}
          className="text-sm underline transition-colors hover:text-amber-700"
        >
          Find on Map
        </Link>

        <button
          type="button"
          onClick={() => onDelete(event.id, event.name)}
          disabled={isDeleting}
          className="cursor-pointer rounded-2xl border border-red-500 px-3 py-1 text-sm font-semibold text-red-400 transition-colors hover:bg-red-900/50 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </article>
  );
});

function EventsSkeleton() {
  return (
    <div role="status" className="grid gap-4">
      {SKELETON_ITEMS.map((i) => (
        <div
          key={i}
          className="grid animate-pulse gap-2 rounded-2xl border border-stone-600 p-4 shadow-lg"
        >
          <div className="h-5 w-1/2 rounded-2xl bg-stone-700" />
          <div className="h-4 w-3/4 rounded-2xl bg-stone-700" />
          <div className="h-4 w-1/4 rounded-2xl bg-stone-700" />
        </div>
      ))}
      <span className="sr-only">Loading events...</span>
    </div>
  );
}

function EmptyEvents() {
  return (
    <div className="grid h-64 place-content-center gap-2 rounded-2xl border-2 border-dashed border-stone-600 text-center text-stone-400">
      <span className="text-4xl" aria-hidden="true">
        📭
      </span>
      <p className="text-lg font-semibold">No events saved yet</p>
      <p>Go find some mics to hit!</p>
      <Link
        href="/mic-finder"
        className="mt-2 justify-self-center rounded-2xl bg-amber-700 px-4 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        Go to MicFinder
      </Link>
    </div>
  );
}

export default function ProfileClient({
  skeleton,
  signInPrompt,
}: ProfileClientProps) {
  const { showToast } = useToast();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [editForm, setEditForm] = useState<Profile>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const authRef = useRef<Auth | null>(null);
  const storageRef = useRef<FirebaseStorage | null>(null);
  const userRef = useRef<User | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const user = userRef.current;
    if (!user) return null;
    return user.getIdToken();
  }, []);

  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success && result.profile) {
        const { name = "", bio = "", profileImageUrl = "" } = result.profile;
        const newProfile = { name, bio, profileImageUrl };
        setProfile(newProfile);
        setEditForm(newProfile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  const fetchSavedEvents = useCallback(async (user: User) => {
    setIsEventsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/events/saved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        setSavedEvents(result.events || []);
      }
    } catch (err) {
      console.error("Error fetching saved events:", err);
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth, getStorage } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");

      authRef.current = await getAuth();
      storageRef.current = await getStorage();

      unsubscribe = onAuthStateChanged(authRef.current, async (user) => {
        userRef.current = user;

        if (user) {
          await fetchUserProfile(user);
          setIsLoading(false);
          fetchSavedEvents(user);
        } else {
          setSavedEvents([]);
          setProfile(EMPTY_PROFILE);
          setEditForm(EMPTY_PROFILE);
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
  }, [showToast, router]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const user = userRef.current;
      if (!file || !user || !storageRef.current) return;

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);

      try {
        const { ref, uploadBytes, getDownloadURL } =
          await import("firebase/storage");
        const imageRef = ref(storageRef.current, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);

        setEditForm((prev) => ({ ...prev, profileImageUrl: url }));
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

      const token = await getToken();
      if (!token) return;

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        });

        const result = await res.json();

        if (result.success) {
          setProfile(editForm);
          setIsEditing(false);
          showToast("Profile saved!", "success");
        } else {
          throw new Error(result.error);
        }
      } catch {
        showToast("Error saving profile.", "error");
      }
    },
    [editForm, getToken, showToast]
  );

  const handleCancel = useCallback(() => {
    setEditForm(profile);
    setIsEditing(false);
  }, [profile]);

  const handleDeleteEvent = useCallback(
    async (eventId: string, eventName: string) => {
      if (!confirm(`Remove "${eventName}" from your saved events?`)) return;

      const token = await getToken();
      if (!token) return;

      setDeletingId(eventId);

      try {
        const res = await fetch("/api/events/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId }),
        });

        const result = await res.json();

        if (result.success) {
          setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
          showToast("Event removed!", "success");
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Error deleting event:", err);
        showToast("Error deleting event.", "error");
      } finally {
        setDeletingId(null);
      }
    },
    [getToken, showToast]
  );

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const displayImageUrl = previewUrlRef.current || profile.profileImageUrl;
  const editImageUrl = previewUrlRef.current || editForm.profileImageUrl;

  if (isLoading) {
    return skeleton;
  }

  if (!userRef.current) {
    return signInPrompt;
  }

  return (
    <div className="animate-slide-in mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-3">
      <aside className="lg:col-span-1">
        <section className="sticky top-20 grid gap-4 rounded-2xl border border-stone-300 bg-zinc-200 p-4 text-stone-900 shadow-lg">
          {!isEditing && (
            <p className="text-center text-2xl font-bold">
              {profile.name || "Anonymous Comic"}
            </p>
          )}
          <figure className="group relative mx-auto size-32 overflow-hidden rounded-full border-2 border-stone-900 bg-stone-300 shadow-lg">
            {(isEditing ? editImageUrl : displayImageUrl) ? (
              <Image
                src={isEditing ? editImageUrl : displayImageUrl}
                alt={`${profile.name || "User"}'s profile picture`}
                fill
                sizes="128px"
                className="object-cover"
                priority
                quality={70}
              />
            ) : (
              <span
                className="grid size-full place-content-center text-4xl"
                aria-hidden="true"
              >
                🎤
              </span>
            )}

            {isEditing && (
              <label
                htmlFor="profilePicture"
                className="absolute inset-0 grid cursor-pointer place-content-center bg-stone-900/50 opacity-50 transition-opacity hover:opacity-100"
              >
                <span className="text-xs font-bold text-white">
                  {editImageUrl ? "Change" : "Upload"}
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
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1">
                <label
                  htmlFor="display-name"
                  className="text-sm font-bold uppercase"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="display-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Stage Name"
                  required
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="bio" className="text-sm font-bold uppercase">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className={`${inputClass} resize-none text-sm`}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  className="cursor-pointer rounded-2xl bg-amber-700 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cursor-pointer rounded-2xl border border-stone-300 py-2 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 text-center">
              {profile.bio ? (
                <blockquote className="border-t border-stone-300 pt-4 text-stone-800">
                  &ldquo;{profile.bio}&rdquo;
                </blockquote>
              ) : (
                <p className="text-sm text-stone-600">No bio set.</p>
              )}

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="cursor-pointer rounded-2xl bg-stone-900 py-2.5 font-bold text-zinc-200 shadow-lg transition-transform hover:scale-105"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mx-auto w-1/2 cursor-pointer rounded-2xl border-2 border-red-300 bg-red-100 py-2 font-bold text-red-700 shadow-lg transition-colors hover:bg-red-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </section>
      </aside>

      <section className="min-h-125 rounded-2xl border border-stone-600 bg-stone-950/80 p-4 shadow-lg lg:col-span-2">
        <h2 className="mb-4 grid grid-flow-col place-content-center gap-2 text-xl md:place-content-start">
          <span aria-hidden="true">🎟️</span>
          Saved Events
          {!isEventsLoading && (
            <span className="rounded-full bg-stone-800 px-2 py-1 text-xs">
              {savedEvents.length}
            </span>
          )}
        </h2>

        {isEventsLoading ? (
          <EventsSkeleton />
        ) : savedEvents.length > 0 ? (
          <div role="list" className="grid gap-4">
            {savedEvents.map((event) => (
              <SavedEventCard
                key={event.id}
                event={event}
                isDeleting={deletingId === event.id}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        ) : (
          <EmptyEvents />
        )}
      </section>
    </div>
  );
}

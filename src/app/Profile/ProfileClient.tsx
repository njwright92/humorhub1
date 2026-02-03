"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useToast } from "../components/ToastContext";
import type { Event, ProfileData } from "@/app/lib/types";
import { deleteSavedEvent } from "@/app/actions/events";
import { updateProfile } from "@/app/actions/profile";
import { useSession } from "@/app/components/SessionContext";

const ProfileSidebar = dynamic(() => import("./ProfileSidebar"));
const SavedEventsPanel = dynamic(() => import("./SavedEventsPanel"));

interface ProfileClientProps {
  signInPrompt: ReactNode;
  initialProfile: ProfileData;
  initialSavedEvents: Event[];
  initialUserId: string | null;
}

type PendingDelete = {
  eventId: string;
  eventName: string;
};

const EMPTY_PROFILE: ProfileData = { name: "", bio: "", profileImageUrl: "" };

export default function ProfileClient({
  signInPrompt,
  initialProfile,
  initialSavedEvents,
  initialUserId,
}: ProfileClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { setSignedIn } = useSession();

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editForm, setEditForm] = useState<ProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Event[]>(initialSavedEvents);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const userIdRef = useRef<string | null>(initialUserId);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    userIdRef.current = initialUserId;
  }, [initialUserId]);

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setSignedIn(false);
      userIdRef.current = null;
      setSavedEvents([]);
      setProfile(EMPTY_PROFILE);
      setEditForm(EMPTY_PROFILE);
      showToast("Signed out successfully", "success");
      router.push("/");
    } catch {
      showToast("Error signing out", "error");
    }
  }, [setSignedIn, showToast, router]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const userId = userIdRef.current;
      if (!file || !userId) return;

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/profile/image", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const result = (await res.json()) as {
          success?: boolean;
          imageUrl?: string;
          error?: string;
        };

        if (!res.ok || !result.success || !result.imageUrl) {
          throw new Error(result.error || "Upload failed");
        }

        setEditForm((prev) => ({ ...prev, profileImageUrl: result.imageUrl! }));
        showToast("Image uploaded!", "success");
      } catch {
        showToast("Error uploading image.", "error");
      }
    },
    [showToast],
  );

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        const result = await updateProfile(editForm);

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
    [editForm, showToast],
  );

  const handleCancel = useCallback(() => {
    setEditForm(profile);
    setIsEditing(false);
  }, [profile]);

  const performDeleteEvent = useCallback(
    async (eventId: string, eventName: string) => {
      setDeletingId(eventId);

      try {
        const result = await deleteSavedEvent(eventId);

        if (result.success) {
          setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
          showToast(`Removed "${eventName}"`, "success");
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
    [showToast],
  );

  const handleDeleteEvent = useCallback(
    (eventId: string, eventName: string) => {
      setPendingDelete({ eventId, eventName });
    },
    [],
  );

  const closeDeleteConfirm = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const confirmDeleteEvent = useCallback(() => {
    if (!pendingDelete) return;
    const { eventId, eventName } = pendingDelete;
    setPendingDelete(null);
    void performDeleteEvent(eventId, eventName);
  }, [pendingDelete, performDeleteEvent]);

  useEffect(() => {
    if (!pendingDelete) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingDelete(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [pendingDelete]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const displayImageUrl = previewUrlRef.current || profile.profileImageUrl;
  const editImageUrl = isEditing
    ? previewUrlRef.current || editForm.profileImageUrl
    : "";
  const handleFieldChange = useCallback(
    (field: "name" | "bio", value: string) => {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );
  const isDeletingPendingEvent =
    pendingDelete != null && deletingId === pendingDelete.eventId;

  if (!userIdRef.current) {
    return signInPrompt;
  }

  return (
    <>
      <div className="animate-slide-in mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-3">
        <ProfileSidebar
          profile={profile}
          editForm={editForm}
          isEditing={isEditing}
          displayImageUrl={displayImageUrl}
          editImageUrl={editImageUrl}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onEdit={startEditing}
          onSignOut={handleSignOut}
          onFieldChange={handleFieldChange}
        />

        <SavedEventsPanel
          savedEvents={savedEvents}
          deletingId={deletingId}
          onDelete={handleDeleteEvent}
        />
      </div>

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm remove saved event"
          className="fixed inset-0 z-50 grid place-items-center p-2 backdrop-blur-sm"
          onClick={closeDeleteConfirm}
        >
          <div
            className="card-base grid w-full max-w-sm gap-4 border-stone-600 bg-stone-900/90 p-4 text-center text-zinc-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold">
              Remove &quot;{pendingDelete.eventName}&quot; from your saved
              events?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="rounded-2xl border border-zinc-300 px-4 py-1.5 text-sm font-semibold transition-colors hover:border-white hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                disabled={isDeletingPendingEvent}
                className="rounded-2xl bg-red-700 px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingPendingEvent ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

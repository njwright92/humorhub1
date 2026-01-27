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
import type { Event } from "@/app/lib/types";
import { deleteSavedEvent } from "@/app/actions/events";
import { updateProfile } from "@/app/actions/profile";
import { useSession } from "@/app/components/SessionContext";

const ProfileSidebar = dynamic(() => import("./ProfileSidebar"));
const SavedEventsPanel = dynamic(() => import("./SavedEventsPanel"));

interface Profile {
  name: string;
  bio: string;
  profileImageUrl: string;
}

interface ProfileClientProps {
  skeleton: ReactNode;
  signInPrompt: ReactNode;
  initialProfile: Profile;
  initialSavedEvents: Event[];
  initialUserId: string | null;
}

const EMPTY_PROFILE: Profile = { name: "", bio: "", profileImageUrl: "" };

export default function ProfileClient({
  skeleton,
  signInPrompt,
  initialProfile,
  initialSavedEvents,
  initialUserId,
}: ProfileClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { setSignedIn } = useSession();

  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [editForm, setEditForm] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading] = useState(false);
  const [isEventsLoading] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Event[]>(initialSavedEvents);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    async (e: React.FormEvent) => {
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

  const handleDeleteEvent = useCallback(
    async (eventId: string, eventName: string) => {
      if (!confirm(`Remove "${eventName}" from your saved events?`)) return;

      setDeletingId(eventId);

      try {
        const result = await deleteSavedEvent(eventId);

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
    [showToast],
  );

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

  if (isLoading) {
    return skeleton;
  }

  if (!userIdRef.current) {
    return signInPrompt;
  }

  return (
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
        isEventsLoading={isEventsLoading}
        deletingId={deletingId}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

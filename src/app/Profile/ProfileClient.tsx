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
import type { FirebaseStorage } from "firebase/storage";
import type { Event } from "@/app/lib/types";
import { getSession } from "@/app/lib/auth-client";

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
}

const EMPTY_PROFILE: Profile = { name: "", bio: "", profileImageUrl: "" };

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

  const storageRef = useRef<FirebaseStorage | null>(null);
  const userIdRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
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

  const fetchSavedEvents = useCallback(async () => {
    setIsEventsLoading(true);
    try {
      const res = await fetch("/api/events/saved", {
        credentials: "include",
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
    const initAuth = async () => {
      const [{ getStorage }, session] = await Promise.all([
        import("@/app/lib/firebase-storage"),
        getSession(),
      ]);
      storageRef.current = await getStorage();
      userIdRef.current = session.signedIn ? (session.uid ?? null) : null;

      if (session.signedIn) {
        await fetchUserProfile();
        setIsLoading(false);
        fetchSavedEvents();
      } else {
        setSavedEvents([]);
        setProfile(EMPTY_PROFILE);
        setEditForm(EMPTY_PROFILE);
        setIsLoading(false);
        setIsEventsLoading(false);
      }
    };

    initAuth();
  }, [fetchUserProfile, fetchSavedEvents]);

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      userIdRef.current = null;
      setSavedEvents([]);
      setProfile(EMPTY_PROFILE);
      setEditForm(EMPTY_PROFILE);
      showToast("Signed out successfully", "success");
      router.push("/");
    } catch {
      showToast("Error signing out", "error");
    }
  }, [showToast, router]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const userId = userIdRef.current;
      if (!file || !userId || !storageRef.current) return;

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);

      try {
        const { ref, uploadBytes, getDownloadURL } =
          await import("firebase/storage");
        const imageRef = ref(storageRef.current, `profileImages/${userId}`);
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

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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
    [editForm, showToast]
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
        const res = await fetch("/api/events/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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
    [showToast]
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
    []
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

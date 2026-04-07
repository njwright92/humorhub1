"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useToast } from "../components/ToastContext";
import { deleteSavedEvent } from "@/app/actions/events";
import { updateProfile } from "@/app/actions/profile";
import { useSession } from "@/app/components/SessionContext";
import type { Event, ProfileData } from "@/app/lib/types";
import DeleteConfirmModal from "./DeleteConfirmModal";

const ProfileSidebar = dynamic(() => import("./ProfileSidebar"));
const SavedEventsPanel = dynamic(() => import("./SavedEventsPanel"));

export default function ProfileClient({
  initialProfile,
  initialSavedEvents,
}: {
  initialProfile: ProfileData;
  initialSavedEvents: Event[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const { setSignedIn } = useSession();

  const [profile, setProfile] = useState(initialProfile);
  const [savedEvents, setSavedEvents] = useState(initialSavedEvents);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleImageChange = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = (await res.json().catch(() => null)) as {
        success?: boolean;
        imageUrl?: string;
        error?: string;
      } | null;

      if (
        res.ok &&
        result?.success &&
        typeof result.imageUrl === "string" &&
        result.imageUrl.length > 0
      ) {
        const imageUrl = result.imageUrl;
        setProfile((prev) => ({ ...prev, profileImageUrl: imageUrl }));
        showToast("Image updated!", "success");
        return;
      }

      showToast(result?.error ?? "Upload failed", "error");
    } catch {
      showToast("Upload failed", "error");
    }
  };

  const handleSaveProfile = async (formData: ProfileData) => {
    const nextProfile: ProfileData = {
      ...profile,
      ...formData,
      name: formData.name.trim(),
      bio: formData.bio.trim(),
      profileImageUrl: profile.profileImageUrl || formData.profileImageUrl,
    };
    const result = await updateProfile(nextProfile);
    if (result.success) {
      setProfile(nextProfile);
      setIsEditing(false);
      showToast("Profile updated!", "success");
      return;
    }

    showToast(result.error ?? "Failed to save profile", "error");
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSignedIn(false);
    router.push("/");
  };

  return (
    <div className="animate-slide-in mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-3">
      <ProfileSidebar
        profile={profile}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSaveProfile}
        onImageUpload={handleImageChange}
        onSignOut={handleSignOut}
      />

      <SavedEventsPanel
        savedEvents={savedEvents}
        onDelete={(id, name) => setPendingDelete({ id, name })}
      />

      {pendingDelete && (
        <DeleteConfirmModal
          eventName={pendingDelete.name}
          onClose={() => setPendingDelete(null)}
          onConfirm={async () => {
            const res = await deleteSavedEvent(pendingDelete.id);
            if (res.success) {
              setSavedEvents((s) => s.filter((e) => e.id !== pendingDelete.id));
            } else {
              showToast(res.error ?? "Failed to remove saved event", "error");
            }
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}

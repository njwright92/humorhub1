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
  userId,
}: {
  initialProfile: ProfileData;
  initialSavedEvents: Event[];
  userId: string;
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
      const result = await res.json();

      if (result.success && result.imageUrl) {
        setProfile((prev) => ({ ...prev, profileImageUrl: result.imageUrl }));
        showToast("Image updated!", "success");
      }
    } catch {
      showToast("Upload failed", "error");
    }
  };

  const handleSaveProfile = async (formData: ProfileData) => {
    const result = await updateProfile(formData);
    if (result.success) {
      setProfile(formData);
      setIsEditing(false);
      showToast("Profile updated!", "success");
    }
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
            if (res.success)
              setSavedEvents((s) => s.filter((e) => e.id !== pendingDelete.id));
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}

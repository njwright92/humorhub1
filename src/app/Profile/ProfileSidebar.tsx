import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProfileData } from "@/app/lib/types";

export default function ProfileSidebar({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onImageUpload,
  onSignOut,
}: {
  profile: ProfileData;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: ProfileData) => void;
  onImageUpload: (file: File) => void;
  onSignOut: () => void;
}) {
  const [form, setForm] = useState(profile);

  // Sync internal form if external profile changes (like after an image upload)
  useEffect(() => {
    setForm(profile);
  }, [profile]);

  return (
    <aside className="lg:col-span-1">
      <section className="card-base sticky top-20 border-stone-300 bg-zinc-200 p-6 text-stone-900 shadow-2xl">
        <figure className="group relative mx-auto mb-4 size-32 overflow-hidden rounded-full border-2 border-stone-900 bg-stone-300 shadow-xl">
          {profile.profileImageUrl ? (
            <Image
              src={profile.profileImageUrl}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <span className="grid size-full place-content-center text-4xl">
              🎤
            </span>
          )}

          {isEditing && (
            <label className="absolute inset-0 grid cursor-pointer place-content-center bg-stone-900/60 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {profile.profileImageUrl ? "Change" : "Upload"}
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && onImageUpload(e.target.files[0])
                }
              />
            </label>
          )}
        </figure>

        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}
            className="grid gap-4 text-left"
          >
            <div>
              <label className="text-[10px] font-black text-stone-500 uppercase">
                Stage Name
              </label>
              <input
                className="input-amber-soft mt-1 w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-stone-500 uppercase">
                Bio
              </label>
              <textarea
                className="input-amber-soft mt-1 w-full resize-none text-sm"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="submit" className="btn-primary py-2 text-sm">
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-2xl border border-stone-400 py-2 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">
              {profile.name || "Anonymous Comic"}
            </h2>
            <div className="mx-auto mb-4 h-1 w-1/2 bg-stone-300" />
            <p className="mb-6 text-sm text-stone-700 italic">
              {profile.bio ? `"${profile.bio}"` : "No bio set."}
            </p>
            <div className="grid gap-3">
              <button
                onClick={onEdit}
                className="rounded-2xl bg-stone-900 py-2 font-bold text-zinc-200 transition-transform hover:scale-105 active:scale-95"
              >
                Edit Profile
              </button>
              <button
                onClick={onSignOut}
                className="mx-auto w-1/2 text-xs font-bold text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}

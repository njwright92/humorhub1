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

  useEffect(() => {
    setForm((prev) =>
      isEditing
        ? { ...prev, profileImageUrl: profile.profileImageUrl }
        : profile,
    );
  }, [isEditing, profile]);

  return (
    <aside className="lg:col-span-1">
      {/* panel-light handles bg-zinc-200, text-stone-900, border, and sticky/shadow props */}
      <section className="panel-light sticky top-20 p-6">
        <figure className="group relative mx-auto mb-4 size-32 shrink-0 overflow-hidden rounded-full border-2 border-stone-900 bg-stone-300">
          {profile.profileImageUrl ? (
            <Image
              src={profile.profileImageUrl}
              alt="Profile"
              fill
              className="object-cover"
              sizes="128px"
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
              <label className="text-xs font-bold uppercase opacity-60">
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
              <label className="text-xs font-bold uppercase opacity-60">
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
                className="rounded-2xl border border-stone-400 py-2 text-sm font-bold hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            {/* Global H2 handles font/weight/shadow */}
            <h2 className="my-2 text-2xl italic">
              {profile.name || "Anonymous Comic"}
            </h2>
            <div className="mx-auto mb-4 h-0.5 w-16 bg-amber-700" />
            <p className="my-6 text-sm text-stone-600 italic">
              {profile.bio ? `"${profile.bio}"` : "No bio set."}
            </p>
            <div className="mt-4 grid gap-3">
              <button onClick={onEdit} className="btn-dark mx-auto w-3/4 py-2">
                Edit Profile
              </button>
              <button
                onClick={onSignOut}
                className="mx-auto text-xs font-bold text-red-700 underline opacity-70 hover:opacity-100"
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

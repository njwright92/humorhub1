import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProfileData } from "@/app/lib/types";

const PROFILE_NAME_ID = "profile-stage-name";
const PROFILE_BIO_ID = "profile-bio";

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
      <section className="card-base shadow-panel sticky top-20 border-stone-300 bg-zinc-200 p-4 text-stone-900">
        <figure className="group relative mx-auto mb-4 aspect-square size-32 shrink-0 overflow-hidden rounded-full border-2 border-zinc-900 bg-zinc-200">
          {profile.profileImageUrl ? (
            <Image
              src={profile.profileImageUrl}
              alt="Profile"
              fill
              className="object-cover"
              sizes="128px"
              priority={false}
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
                accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
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
              <label
                htmlFor={PROFILE_NAME_ID}
                className="text-[10px] font-black text-stone-500 uppercase"
              >
                Stage Name
              </label>
              <input
                id={PROFILE_NAME_ID}
                name="name"
                className="input-amber-soft mt-1 min-h-10 w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label
                htmlFor={PROFILE_BIO_ID}
                className="text-[10px] font-black text-stone-500 uppercase"
              >
                Bio
              </label>
              <textarea
                id={PROFILE_BIO_ID}
                name="bio"
                className="input-amber-soft mt-1 min-h-24 w-full resize-none text-sm"
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
            <h2 className="my-2 text-2xl font-bold italic">
              {profile.name || "Anonymous Comic"}
            </h2>
            <div className="mx-auto mb-4 h-1 rounded bg-stone-900" />
            <p className="my-6 text-sm text-stone-800">
              {profile.bio ? `"${profile.bio}"` : "No bio set."}
            </p>
            <div className="mt-4 grid gap-3">
              <button
                onClick={onEdit}
                className="mx-auto w-3/4 rounded-2xl bg-stone-900 py-2 font-bold text-zinc-200 transition-transform hover:scale-105 active:scale-95"
              >
                Edit Profile
              </button>
              <button
                onClick={onSignOut}
                className="mx-auto w-1/4 rounded-xl border-2 border-red-800 text-xs font-bold text-red-800 shadow-lg hover:bg-red-800 hover:text-zinc-200"
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

import Image from "next/image";

type Profile = {
  name: string;
  bio: string;
  profileImageUrl: string;
};

export default function ProfileSidebar({
  profile,
  editForm,
  isEditing,
  displayImageUrl,
  editImageUrl,
  onImageChange,
  onSubmit,
  onCancel,
  onEdit,
  onSignOut,
  onFieldChange,
}: {
  profile: Profile;
  editForm: Profile;
  isEditing: boolean;
  displayImageUrl: string;
  editImageUrl: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onEdit: () => void;
  onSignOut: () => void;
  onFieldChange: (field: "name" | "bio", value: string) => void;
}) {
  return (
    <aside className="lg:col-span-1">
      <section className="card-shell card-border card-light sticky top-20 grid gap-4 border-stone-300 p-4">
        {!isEditing && (
          <p className="text-center text-2xl font-bold">
            {profile.name || "Anonymous Comic"}
          </p>
        )}
        <figure className="group relative mx-auto size-32 overflow-hidden rounded-full border-2 border-stone-900 bg-stone-300 shadow-xl">
          {(isEditing ? editImageUrl : displayImageUrl) ? (
            <Image
              src={isEditing ? editImageUrl : displayImageUrl}
              alt={`${profile.name || "User"}'s profile picture`}
              fill
              sizes="128px"
              className="object-cover"
              priority
              fetchPriority="high"
              loading="eager"
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
                onChange={onImageChange}
                className="sr-only"
              />
            </label>
          )}
        </figure>

        {isEditing ? (
          <form onSubmit={onSubmit} className="grid gap-4">
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
                onChange={(e) => onFieldChange("name", e.target.value)}
                className="input-amber-soft"
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
                onChange={(e) => onFieldChange("bio", e.target.value)}
                className="input-amber-soft resize-none text-sm"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                className="btn-amber cursor-pointer px-4 py-2 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn-outline-stone cursor-pointer py-2 text-sm"
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
                onClick={onEdit}
                className="btn-solid btn-stone cursor-pointer py-2.5"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="mx-auto w-1/2 cursor-pointer rounded-2xl border-2 border-red-300 bg-red-100 py-2 font-bold text-red-700 shadow-xl transition-colors hover:bg-red-200"
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

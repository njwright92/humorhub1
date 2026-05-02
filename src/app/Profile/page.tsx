import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import AuthGatePrompt from "../components/AuthGatePrompt";
import { getServerAuth, getServerDb } from "@/app/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth-session";
import { COLLECTIONS, SAVED_EVENT_FIELDS } from "@/app/lib/constants";
import { mapSavedEventDocs } from "@/app/lib/saved-events";
import type { Event, ProfileData } from "@/app/lib/types";

export const metadata: Metadata = {
  title: "Your Profile - Manage Your Humor Hub Account",
  description:
    "Access and manage your Humor Hub profile. Update your information, preferences, and view your favorite content.",
  keywords: [
    "Humor Hub profile",
    "manage account",
    "update profile",
    "comedy account",
  ],
  alternates: {
    canonical: "https://www.thehumorhub.com/Profile",
  },
  openGraph: {
    title: "Your Profile - Manage Your Humor Hub Account",
    description:
      "Access and manage your Humor Hub profile. Update your information, preferences, and view your favorite content.",
    url: "https://www.thehumorhub.com/Profile",
    type: "website",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const EMPTY_PROFILE: ProfileData = { name: "", bio: "", profileImageUrl: "" };

type ProfilePageData = {
  uid: string | null;
  profile: ProfileData;
  savedEvents: Event[];
};

async function loadProfileData(): Promise<ProfilePageData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie)
    return { uid: null, profile: EMPTY_PROFILE, savedEvents: [] };

  try {
    const decoded = await getServerAuth().verifySessionCookie(sessionCookie);
    const uid = decoded.uid;
    const db = getServerDb();

    const [userDoc, savedSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.users).doc(uid).get(),
      db
        .collection(COLLECTIONS.savedEvents)
        .where("userId", "==", uid)
        .select(...SAVED_EVENT_FIELDS)
        .get(),
    ]);

    const userData = userDoc.data();
    return {
      uid,
      profile: {
        name: userData?.name || "",
        bio: userData?.bio || "",
        profileImageUrl: userData?.profileImageUrl || "",
      },
      savedEvents: mapSavedEventDocs(savedSnapshot.docs),
    };
  } catch {
    return { uid: null, profile: EMPTY_PROFILE, savedEvents: [] };
  }
}

function SignInPrompt() {
  return (
    <AuthGatePrompt message="Please sign in to view your profile and saved events." />
  );
}

export default function ProfilePage() {
  const dataPromise = loadProfileData();

  return (
    <main className="page-shell gap-4 text-center">
      <div className="min-h-fit space-y-2">
        <h1 className="page-title">Profile Management</h1>
        <p className="text-sm text-stone-300 md:text-lg">
          Manage your personal schedule
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mt-10 animate-pulse text-stone-500">
            Syncing with the Hub...
          </div>
        }
      >
        <ProfileClientWrapper dataPromise={dataPromise} />
      </Suspense>
    </main>
  );
}

async function ProfileClientWrapper({
  dataPromise,
}: {
  dataPromise: Promise<ProfilePageData>;
}) {
  const { uid, profile, savedEvents } = await dataPromise;
  if (!uid) return <SignInPrompt />;

  return (
    <ProfileClient initialProfile={profile} initialSavedEvents={savedEvents} />
  );
}

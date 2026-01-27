import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import ProfileClient from "./ProfileClient";
import { getServerAuth, getServerDb } from "@/app/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth-session";
import { COLLECTIONS, SAVED_EVENT_FIELDS } from "@/app/lib/constants";
import { buildEventFromData } from "@/app/lib/event-mappers";
import { sanitizeHtml } from "@/app/lib/sanitizeHtml";
import type { Event } from "@/app/lib/types";

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

function ProfileSkeleton() {
  return (
    <div className="grid flex-1 place-content-center" role="status">
      <div className="grid w-64 animate-pulse gap-4">
        <div className="h-8 rounded-2xl bg-stone-700" />
        <div className="mx-auto size-36 rounded-full bg-stone-700" />
        <div className="h-4 rounded-2xl bg-stone-700" />
        <div className="mx-auto h-4 w-1/2 rounded-2xl bg-stone-700" />
      </div>
      <span className="sr-only">Loading profile...</span>
    </div>
  );
}

function SignInPrompt() {
  return (
    <section className="mx-auto mt-10 grid max-w-md gap-4 rounded-2xl border border-stone-700 bg-stone-800 p-8 text-center shadow-xl">
      <span className="text-6xl" aria-hidden="true">
        🔐
      </span>
      <h2 className="text-2xl text-amber-700">Sign In Required</h2>
      <p className="text-stone-400">
        Please sign in to view your profile and saved events.
      </p>
      <Link
        href="/mic-finder"
        className="btn-primary justify-self-center px-6 py-3"
      >
        Go to MicFinder
      </Link>
    </section>
  );
}

type Profile = {
  name: string;
  bio: string;
  profileImageUrl: string;
};

const EMPTY_PROFILE: Profile = { name: "", bio: "", profileImageUrl: "" };

async function loadProfileData() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return {
      signedIn: false,
      uid: null,
      profile: EMPTY_PROFILE,
      savedEvents: [] as Event[],
    };
  }

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

    const userData = userDoc.exists ? userDoc.data() : undefined;
    const profile = {
      name: userData?.name || "",
      bio: userData?.bio || "",
      profileImageUrl: userData?.profileImageUrl || "",
    };

    const savedEvents: Event[] = [];

    for (let i = 0; i < savedSnapshot.docs.length; i++) {
      const doc = savedSnapshot.docs[i];
      const data = doc.data();
      const eventId =
        typeof data.eventId === "string" && data.eventId.length > 0
          ? data.eventId
          : doc.id;
      const event = buildEventFromData(eventId, data);
      event.sanitizedDetails = event.details ? sanitizeHtml(event.details) : "";
      savedEvents.push(event);
    }

    return { signedIn: true, uid, profile, savedEvents };
  } catch (error) {
    console.error("Profile server load error:", error);
    return {
      signedIn: false,
      uid: null,
      profile: EMPTY_PROFILE,
      savedEvents: [] as Event[],
    };
  }
}

export default function ProfilePage() {
  const dataPromise = loadProfileData();

  return (
    <>
      <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      <link rel="preconnect" href="https://humorhub-73ff9.firebaseapp.com" />
      <main className="page-shell gap-4 text-center">
        <h1 className="page-title">Profile Management</h1>
        <p className="text-sm text-stone-300 md:text-lg">
          Manage your personal schedule
        </p>
        <ProfileClientWrapper dataPromise={dataPromise} />
      </main>
    </>
  );
}

async function ProfileClientWrapper({
  dataPromise,
}: {
  dataPromise: ReturnType<typeof loadProfileData>;
}) {
  const data = await dataPromise;

  return (
    <ProfileClient
      skeleton={<ProfileSkeleton />}
      signInPrompt={<SignInPrompt />}
      initialProfile={data.profile}
      initialSavedEvents={data.savedEvents}
      initialUserId={data.uid}
    />
  );
}

// import type { NextApiRequest, NextApiResponse } from "next";
// import { getFirestore } from "firebase-admin/firestore";
// import { initializeApp, getApps } from "firebase-admin/app";
// import { credential } from "firebase-admin";

// // Initialize Firebase Admin SDK if it hasn't been initialized yet
// if (!getApps().length) {
//   initializeApp({
//     credential: credential.cert({
//       projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//       clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY,
//     }),
//   });
// }

// const db = getFirestore();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "GET") {
//     try {
//       const { search } = req.query;
//       if (typeof search !== "string") {
//         return res.status(400).json({ error: "Invalid search query" });
//       }

//       const comediansRef = db.collection("comedians");
//       const snapshot = await comediansRef
//         .where("name", ">=", search)
//         .where("name", "<=", search + "\uf8ff")
//         .limit(10)
//         .get();

//       const comedians = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       res.status(200).json(comedians);
//     } catch (error) {
//       console.error("Error searching comedians:", error);
//       res.status(500).json({ error: "Failed to search comedians" });
//     }
//   } else {
//     res.setHeader("Allow", ["GET"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

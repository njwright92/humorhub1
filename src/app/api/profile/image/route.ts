import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import { getServerDb, getServerStorage } from "@/app/lib/firebase-admin";
import { COLLECTIONS } from "@/app/lib/constants";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function buildImageUrl(bucket: string, path: string, token: string) {
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonResponse(
        { success: false, error: "Image file is required" },
        400,
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return jsonResponse(
        {
          success: false,
          error: "Upload a PNG, JPG, WEBP, GIF, or AVIF image",
        },
        400,
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return jsonResponse(
        { success: false, error: "Image must be 5MB or less" },
        400,
      );
    }

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return jsonResponse(
        { success: false, error: "Storage bucket not configured" },
        500,
      );
    }

    const filePath = `profileImages/${auth.uid}`;
    const token = randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());

    await getServerStorage()
      .bucket(bucketName)
      .file(filePath)
      .save(buffer, {
        contentType: file.type,
        resumable: false,
        metadata: {
          cacheControl: "public, max-age=31536000",
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });

    const imageUrl = buildImageUrl(bucketName, filePath, token);

    await getServerDb()
      .collection(COLLECTIONS.users)
      .doc(auth.uid)
      .set({ profileImageUrl: imageUrl }, { merge: true });

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return jsonResponse(
      { success: false, error: "Failed to upload image" },
      500,
    );
  }
}

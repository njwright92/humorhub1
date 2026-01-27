import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authenticateRequest, jsonResponse } from "@/app/lib/auth-helpers";
import { getServerStorage } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

    if (!file.type.startsWith("image/")) {
      return jsonResponse(
        { success: false, error: "Only image uploads are allowed" },
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

    return NextResponse.json({
      success: true,
      imageUrl: buildImageUrl(bucketName, filePath, token),
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return jsonResponse(
      { success: false, error: "Failed to upload image" },
      500,
    );
  }
}

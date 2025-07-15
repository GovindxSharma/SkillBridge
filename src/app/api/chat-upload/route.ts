// app/api/chat-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "chat_uploads" },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
          } else {
            resolve(result);
          }
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    return NextResponse.json({ secure_url: uploadResult.secure_url });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

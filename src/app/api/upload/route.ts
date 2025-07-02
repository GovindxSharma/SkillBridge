import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stream = cloudinary.uploader.upload_stream({ folder: "profile_images" }, (error, result) => {
      if (error || !result) {
        console.error("❌ Cloudinary error:", error);
        return;
      }
    });

    const readable = Readable.from(buffer);
    readable.pipe(stream);

    const result = await new Promise<any>((resolve, reject) => {
      stream.on("finish", () => resolve(stream));
      stream.on("error", reject);
    });

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "profile_images" }, (err, res) => {
        if (err || !res) reject(err);
        else resolve(res);
      }).end(buffer);
    });

    console.log("✅ Uploaded to Cloudinary:", uploaded.secure_url);
    return NextResponse.json({ secure_url: uploaded.secure_url });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

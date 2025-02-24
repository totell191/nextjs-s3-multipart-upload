import { NextResponse } from "next/server";
import { S3Client, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const bucket = process.env.AWS_S3_BUCKET_NAME;

export async function POST(req: Request) {
  try {
    const { uploadId, fileKey, parts } = await req.json();

    if (!uploadId || !fileKey || !parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const formattedParts = parts.map(part => ({
      PartNumber: part.partNumber,
      ETag: part.ETag.replace(/^"|"$/g, ""),
    }));

    const params = {
      Bucket: bucket,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: formattedParts,
      },
    };

    await s3.send(new CompleteMultipartUploadCommand(params));

    return NextResponse.json({ message: "Upload completed!", fileKey });
  } catch (error) {
    console.error("Complete Upload Error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}

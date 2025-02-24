import { NextResponse } from "next/server";
import { S3Client, UploadPartCommand } from "@aws-sdk/client-s3";

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
    const formData = await req.formData();
    const uploadId = formData.get("uploadId") as string;
    const fileKey = formData.get("fileKey") as string;
    const partNumber = Number(formData.get("partNumber"));
    const chunk = formData.get("chunk");

    if (!uploadId || !fileKey || !partNumber || !chunk) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let body: Buffer;
    if (chunk instanceof File) {
      const arrayBuffer = await chunk.arrayBuffer();
      body = Buffer.from(arrayBuffer);
    } else {
      body = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    }

    const params = {
      Bucket: bucket,
      Key: fileKey,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
    };

    const { ETag } = await s3.send(new UploadPartCommand(params));
    
    return NextResponse.json({ partNumber, ETag });
  } catch (error) {
    console.error("Upload Part Error:", error);
    return NextResponse.json({ error: "Failed to upload part" }, { status: 500 });
  }
}

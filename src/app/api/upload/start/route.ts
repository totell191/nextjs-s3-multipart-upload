import { NextResponse } from "next/server";
import { S3Client, CreateMultipartUploadCommand } from "@aws-sdk/client-s3";

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
    const { fileName, fileType } = await req.json();

    const params = {
      Bucket: bucket,
      Key: `uploads/${Date.now()}-${fileName}`,
      ContentType: fileType,
    };

    const { UploadId, Key } = await s3.send(new CreateMultipartUploadCommand(params));

    return NextResponse.json({ uploadId: UploadId, fileKey: Key });
  } catch (error) {
    console.error("Start Upload Error:", error);
    return NextResponse.json({ error: "Failed to start upload" }, { status: 500 });
  }
}

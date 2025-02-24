'use client';
import { useState } from "react";

const chunkSize = parseInt(process.env.NEXT_PUBLIC_CHUNK_SIZE_MB || "5", 10) * 1024 * 1024;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);
    setProgress(0);

    try {
      const startResponse = await fetch("/api/upload/start", {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        headers: { "Content-Type": "application/json" },
      });
      const { uploadId, fileKey } = await startResponse.json();

      const parts = [];
      const totalChunks = Math.ceil(file.size / chunkSize);
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);

        const formData = new FormData();
        formData.append("uploadId", uploadId);
        formData.append("fileKey", fileKey);
        formData.append("partNumber", String(i + 1));
        formData.append("chunk", chunk);
        const chunkResult = await fetch("/api/upload/part", {
          method: "POST",
          body: formData,
        });
        const chunkData = await chunkResult.json();

        parts.push(chunkData);
        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      const completeResult = await fetch("/api/upload/complete", {
        method: "POST",
        body: JSON.stringify({ uploadId, fileKey, parts }),
        // headers: { "Content-Type": "application/json" },
      });
      
      setUploadStatus(completeResult.status);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed: " + error);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-center mb-4">Upload to S3</h2>
        <input
          id="file_input"
          type="file"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          onChange={handleFileChange}
          disabled={loading}
        />
        <button
          type="button"
          className="w-full mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg disabled:opacity-50"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {progress > 0 && progress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        {uploadStatus === 200 && (
          <div className="mt-4 p-3 text-sm text-green-800 bg-green-50 border border-green-300 rounded-lg">
            ✅ Upload complete
          </div>
        )}
      </div>
    </div>
  );
}

# Next.js S3 Multipart Upload

This project is a Next.js application that demonstrates how to upload large files to Amazon S3 using **multipart upload**. The frontend is built with **React (Client Component)** and Tailwind CSS, while the backend API handles the multipart upload process.

✅ **Client:** Splits the file into chunks and uploads each part to the backend  
✅ **Backend:** Receives each chunk and forwards it to S3 using AWS SDK  
✅ **Cloud (S3):** Reconstructs the file from multiple uploaded chunks  

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

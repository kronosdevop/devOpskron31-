// src/mixins/S3GetStorageFile.js
import { Storage } from 'aws-amplify';

export async function getS3SignedUrl(rawUrl, store) {
  try {
    if (!rawUrl || !store) throw new Error("Missing URL or store");

    const url = new URL(rawUrl);

    const rawPath = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    // console.log('rawpath', rawPath)// remove starting slash if present
    const details = store;

    const keywords = ["workflow", "AllorganizationLogos", "chat", 'broadcast', 'task', 'tickets', 'tvboard', 'guesthouseimages', 'quotations', 'products', 'resources', 'customer', 'assets', 'asset']; // you can add more if needed
    let key = null;

    // Check if any keyword exists
    for (const keyword of keywords) {
      const index = rawPath.indexOf(keyword);
      if (index !== -1) {
        key = rawPath.substring(index); // From keyword onwards
        break;
      }
    }
    // console.log(key,'key');

    // ❗ If no matching keyword is found, fallback to full path
    if (!key) {
      console.warn("⚠️ No keyword found in URL, using full path as key");
      key = rawPath;
    }

    key = key.trim(); // Clean just in case

    if (!details) throw new Error("Missing S3 details in store");

    const bucket = details.bucket_name;
    const region = details.region;

    const options = {
      level: "public",
      customPrefix: { public: "" },
      bucket,
      region,
      expires: 900, // 15 minutes
    };

    const signedUrl = await Storage.get(key, options);
    return signedUrl;
  } catch (err) {
    console.error("❌ Failed to get signed URL:", err.message || err);
    return null;
  }
}

// import { Storage } from "aws-amplify";

// export async function getS3SignedUrl(rawUrl, store) {
//   try {
//     if (!rawUrl || !store) throw new Error("Missing URL or store");

//     const url = new URL(rawUrl);
//     const key = url.pathname.slice(1).trim();
//     console.log(key)
//     const details = store;
//     // console.log('ssss', details)
//     if (!details) throw new Error("Missing S3 details in store");

//     const bucket = details.bucket_name;
//     const region = details.region;

//     const options = {
//       level: "public",
//       customPrefix: { public: "" },
//       bucket,
//       region,
//       expires: 900,
//     };

//     const signedUrl = await Storage.get(key, options);
//     // const cleanUrl = signedUrl.replace(/%20/g, "_")
//     //   .replace(/%28/g, "(")
//     //   .replace(/%29/g, ")");
//     return signedUrl;
//   } catch (err) {
//     // console.error("❌ Failed to get signed URL:", err.message || err);
//     return null;
//   }
// }

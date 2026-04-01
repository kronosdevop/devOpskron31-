// src/mixins/S3UploadFile.js

import { Storage, Auth } from "aws-amplify";

export async function uploadToS3(file, orgDetails, key, metadata = {}) {
  if (!file || !orgDetails) {
    console.warn("Missing required file or org details for upload.");
    return null;
  }

  try {
    // Get fresh credentials and handle token refresh
    const credentials = await Auth.currentCredentials();

    // Check if credentials are valid, if not refresh them
    if (!credentials || !credentials.accessKeyId) {
      // console.log("Refreshing credentials...");
      await Auth.currentAuthenticatedUser();
    }

    const bucket = orgDetails.bucket_name;
    const region = orgDetails.region;

    // Ensure key is a string, not an array
    const finalKey = Array.isArray(key) ? key.join("/") : key;

    const uploadOptions = {
      contentType: file.type,
      bucket,
      region,
      level: "public",
      customPrefix: { public: "" },
    };

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      uploadOptions.metadata = metadata;
    }

    const result = await Storage.put(finalKey, file, uploadOptions);

    const fileUrl = `https://${bucket}.s3.amazonaws.com/${result.key}`;
    console.log("fileUrl111", fileUrl)
    return fileUrl;
  } catch (err) {
    console.error("❌ Upload error:", err);

    // If it's a token expiration error, try to refresh and retry once
    if (
      (err.message && err.message.includes("expired")) ||
      err.name === "ExpiredToken"
    ) {
      // console.log("Token expired, attempting to refresh and retry...");
      try {
        // Force refresh credentials
        await Auth.currentAuthenticatedUser();

        const bucket = orgDetails.bucket_name;
        const region = orgDetails.region;
        const finalKey = Array.isArray(key) ? key.join("/") : key;

        const uploadOptions = {
          contentType: file.type,
          bucket,
          region,
          level: "public",
          customPrefix: { public: "" },
        };

        // Add metadata if provided
        if (metadata && Object.keys(metadata).length > 0) {
          uploadOptions.metadata = metadata;
        }

        const result = await Storage.put(finalKey, file, uploadOptions);

        const fileUrl = `https://${bucket}.s3.amazonaws.com/${result.key}`;
        return fileUrl;
      } catch (retryErr) {
        console.error("❌ Retry upload failed:", retryErr);
        throw retryErr;
      }
    }

    throw err;
  }
}

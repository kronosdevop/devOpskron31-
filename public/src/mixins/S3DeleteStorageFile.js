// src/mixins/S3GetStorageFile.js
import { Storage } from "aws-amplify";

export async function deleteS3SignedUrl(key) {
  try {
    const result = await Storage.remove(key, {
        level: "public",
        customPrefix: {
          public: "", 
        },
      });
    return result;
  } catch (err) {

    return "Error";
  }
}

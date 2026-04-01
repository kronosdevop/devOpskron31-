import { Storage } from "aws-amplify";

export async function getImgS3(key) {
  if (!key) return null;

  try {
    return await Storage.get(key, {
      level: "public",
      expires: 900,
    });
  } catch (err) {
    console.error("S3 get error:", err);
    return null;
  }
}

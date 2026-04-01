import { Storage } from "aws-amplify";

export async function uploadToS3(file, key) {
  const result = await Storage.put(key, file, {
    level: "public",
    contentType: file.type,
  });

  return `https://${result.bucket}.s3.amazonaws.com/${result.key}`;
}

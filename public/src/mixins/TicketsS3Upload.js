import { Storage, Auth } from "aws-amplify";

export async function uploadToS3(file, orgDetails, key) {
  if (!file) return null;

  const uploadOptions = {
    contentType: file.type,
    level: "public",
    customPrefix: { public: "" },
  };

  const result = await Storage.put(key, file, uploadOptions);

  return `https://${orgDetails.bucket_name}.s3.${orgDetails.region}.amazonaws.com/${result.key}`;
}

import { Storage } from "aws-amplify";

const BUCKET = "stichh-default-mumbai";
const REGION = "ap-south-1";

export async function uploadToS3(file, key) {
  await Storage.put(key, file, {
    level: "public",
    contentType: file.type,
    bucket: BUCKET,
    region: REGION,
    customPrefix: { public: "" },
  });
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

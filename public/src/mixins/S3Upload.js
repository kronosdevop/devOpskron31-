import { Storage } from "aws-amplify";

const BUCKET = "stichh-medias";
const REGION = "us-east-1";

export async function uploadImgS3(file, key) {
  await Storage.put(key, file, {
    level: "public",
    contentType: file.type,
  });

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/public/${key}`;
}

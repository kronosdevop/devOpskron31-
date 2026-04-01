import { Storage } from "aws-amplify";

const BUCKET = "stichh-default-mumbai";
const REGION = "ap-south-1";

export async function getS3SignedUrl(dbUrl) {
  try {
    const url = new URL(dbUrl);
    const key = decodeURIComponent(url.pathname.slice(1));

    return await Storage.get(key, {
      bucket: BUCKET,
      region: REGION,
      level: "public",
      customPrefix: { public: "" },
      expires: 900,
    });
  } catch (err) {
    return null;
  }
}
import { Storage } from "aws-amplify";

export default {
  methods: {
    async getSignedPreviewUrl(rawUrl, s3Store) {
      try {
        if (!rawUrl || !s3Store) return rawUrl;

        if (rawUrl.includes("undefined.s3")) {
          return rawUrl;
        }

        const { bucket_name, region } = s3Store;

        const url = new URL(rawUrl);
        const key = url.pathname.replace(/^\/+/, "");

        if (!rawUrl.includes(bucket_name)) {
          return rawUrl;
        }

        return await Storage.get(key, {
          level: "public",
          bucket: bucket_name,
          region,
          expires: 900,
        });
      } catch (err) {
        console.warn("Signed URL failed, using raw:", err);
        return rawUrl;
      }
    },
  },
};

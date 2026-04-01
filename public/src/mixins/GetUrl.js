import { getUrl } from "aws-amplify/storage";

export const GetUrl = {
  methods: {
    async GetUrlMethod(file_key) {
      try {
        const result = await getUrl({
          path: file_key,
          options: {
            accessLevel: "public",
          },
        });

        return result.url.href;
      } catch (error) {
        console.error("Get URL failed:", error);
        return null;
      }
    },
  },
};

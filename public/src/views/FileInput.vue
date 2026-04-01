<template>
  <v-container>
    <v-card class="pa-4" elevation="2" max-width="500">
      <v-card-title class="text-h6">Upload File to S3</v-card-title>

      <v-card-text>
        <v-file-input
          v-model="file"
          label="Select file"
          outlined
          dense
          show-size
        ></v-file-input>

        <v-btn
          :disabled="!file"
          color="primary"
          class="mt-2"
          @click="uploadToS3"
        >
          Upload
        </v-btn>

        <v-alert
          v-if="uploadStatus"
          :type="uploadStatusType"
          dense
          class="mt-4"
        >
          {{ uploadStatus }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
/* eslint-disable */
import { Storage, Auth } from "aws-amplify";

export default {
  data() {
    return {
      file: null,
      uploadStatus: "",
      uploadStatusType: "info",
    };
  },
  mounted() {
    this.testCreds();
  },

  methods: {
    async testCreds() {
      try {
        const creds = await Auth.currentCredentials();
        // console.log("✅ AWS Credentials:", creds);
      } catch (e) {
        console.error("❌ No credentials:", e);
      }
    },

    async uploadToS3() {
      if (!this.file) return;
      // console.log(this.file.name);
      try {
        // Force credentials fetch before upload
        await Auth.currentCredentials();

        // const level = "public";
        const bucket = "stichh-default-nvirginia";
        const region = "us-east-1";
        const folderPath = "AllorganizationLogos";
        const key = `${folderPath}/${this.file.name}`;
        const result = await Storage.put(key, this.file, {
          contentType: this.file.type,
          bucket,
          region,
          level: "public",
          customPrefix: {
            public: "",
          },
          // required by Amplify's internal flow
          keyPrefix: "", // override default bucket set in Amplify config
        });
        // const result = await Storage.put(this.file.name, this.file, {
        //   contentType: this.file.type,
        //   level: 'public',
        //  bucket: 'stichh-some-other-bucket',
        //  contentType: 'text/plain'
        // });

        this.uploadStatus = `✅ Uploaded: ${result.key}`;
        this.uploadStatusType = "success";
        this.file = null;
      } catch (err) {
        console.error("Upload error:", err);
        this.uploadStatus = "❌ Upload failed. Check console.";
        this.uploadStatusType = "error";
      }
    },
  },
};
</script>

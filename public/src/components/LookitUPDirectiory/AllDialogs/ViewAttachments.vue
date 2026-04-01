<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="mediaView" @update:model-value="$emit('update:mediaView', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Attachments</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-row>
            <v-col
              v-for="(media, index) in mediaAttachments"
              :key="index"
              cols="3"
            >
              <v-img
                :src="media"
                height="150"
                width="100%"
                class="rounded elevation-1"
                contain
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  props: {
    mediaView: Boolean,
    entryInfo: Object,
  },

  data() {
    return {
      mediaAttachments: [],
    };
  },
  watch: {
    mediaView: {
      async handler() {
        if (this.mediaView == true) {
          this.mediaAttachments = [];
          for (let i = 0; i < this.entryInfo.attachments_keys.length; i++) {
            let details = this.$store.getters.GetOrgDetails;
            let signedUrl = await getS3SignedUrl(
              this.entryInfo.attachments_keys[i],
              details.s3_details
            );
            if (signedUrl) {
              this.mediaAttachments.push(signedUrl);
            }
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>
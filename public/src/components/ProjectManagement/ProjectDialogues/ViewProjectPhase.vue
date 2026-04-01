<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="viewPhaseDialog"
    @update:model-value="$emit('update:viewPhaseDialog', $event)"
    persistent
    max-width="650"
    transition="dialog-bottom-transition"
  >
    <v-card class="task-card">

      <!-- HEADER -->
      <v-toolbar density="comfortable" class="navBar">
        <v-icon class="ml-4">mdi-format-list-checks</v-icon>
        <v-toolbar-title class="font-weight-bold">
          Task Details
        </v-toolbar-title>

        <v-spacer />

        <v-btn icon variant="text" @click="close_dialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- CONTENT -->
      <v-card-text class="pa-6">

        <!-- Task Name -->
        <v-row class="mb-3">
          <v-col cols="12">
            <div class="task-title">
              {{ viewItem.task_name }}
            </div>
          </v-col>
        </v-row>

        <!-- Assigned Info -->
        <v-row dense>

          <v-col cols="12" md="6">
            <v-card variant="tonal" class="info-card">
              <v-icon color="primary">mdi-account-plus</v-icon>
              <div>
                <div class="info-label">Assigned By</div>
                <div class="info-value">
                  {{ fetch_name(viewItem.task_created_by) }}
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="tonal" class="info-card">
              <v-icon color="success">mdi-account-check</v-icon>
              <div>
                <div class="info-label">Assigned To</div>
                <div class="info-value">
                  {{ fetch_name(viewItem.assign_to) }}
                </div>
              </div>
            </v-card>
          </v-col>

        </v-row>

        <!-- Status + Date -->
        <v-row dense class="mt-3">

          <v-col cols="12" md="6">
            <v-card variant="tonal" class="info-card">
              <v-icon color="orange">mdi-flag</v-icon>

              <div>
                <div class="info-label">Priority</div>

                <v-chip
                  color="orange"
                  variant="flat"
                  size="small"
                >
                  {{ viewItem.task_priority }}
                </v-chip>

              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="tonal" class="info-card">
              <v-icon color="red">mdi-calendar</v-icon>

              <div>
                <div class="info-label">Due Date</div>
                <div class="info-value">
                  {{ viewItem.task_completion_date }}
                </div>
              </div>
            </v-card>
          </v-col>

        </v-row>

        <!-- Progress -->
        <v-row class="mt-5">

          <v-col cols="12">
            <div class="info-label mb-2">
              Task Progress
            </div>

            <v-progress-linear
              :model-value="viewItem.task_completion_percentage || 0"
              color="green"
              height="12"
              rounded
            >
              <template v-slot:default>
                {{ viewItem.task_completion_percentage || 0 }} %
              </template>
            </v-progress-linear>
          </v-col>

        </v-row>

        <!-- Attachments -->
        <v-row class="mt-6">
          <v-col cols="12">
            <div class="attachment-title">
              <v-icon class="mr-2">mdi-paperclip</v-icon>
              Attachments
            </div>
          </v-col>
        </v-row>

        <v-row v-if="images.length" dense>

          <v-col
            v-for="(attachment, index) in images"
            :key="index"
            cols="6"
            md="4"
          >

            <!-- IMAGE -->
            <v-card
              v-if="isImageFile(attachment.url)"
              class="attachment-card"
              @click="openFile(attachment.url)"
            >
              <v-img
                :src="attachment.url"
                height="120"
                cover
              />

              <v-card-subtitle class="text-truncate">
                {{ attachment.filename }}
              </v-card-subtitle>
            </v-card>

            <!-- PDF -->
            <v-card
              v-else-if="isPdfFile(attachment.url)"
              class="attachment-card"
              @click="openFile(attachment.url)"
            >
              <v-card-text class="text-center">

                <v-icon size="50" color="red">
                  mdi-file-pdf-box
                </v-icon>

                <div class="file-name">
                  {{ attachment.filename }}
                </div>

              </v-card-text>
            </v-card>

            <!-- OTHER -->
            <v-card
              v-else
              class="attachment-card"
              @click="openFile(attachment.url)"
            >
              <v-card-text class="text-center">

                <v-icon size="50">
                  mdi-file
                </v-icon>

                <div class="file-name">
                  {{ attachment.filename }}
                </div>

              </v-card-text>
            </v-card>

          </v-col>

        </v-row>

        <v-row v-else>
          <v-col>
            <v-alert
              type="info"
              variant="tonal"
            >
              No attachments available
            </v-alert>
          </v-col>
        </v-row>

      </v-card-text>

      <v-divider></v-divider>

      <!-- FOOTER -->
      <v-card-actions class="justify-end pa-4">

        <v-btn
          color="primary"
          variant="flat"
          rounded
          @click="close_dialog"
        >
          Close
        </v-btn>

      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  mixins: [get_all_org_users],
  props: {
    viewPhaseDialog: Boolean,
    viewItem: Object,
  },
  data() {
    return {
      images: [],
    };
  },
  async mounted() {
    await this.get_all_org_users();
    await this.get_s3_storage();
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_name(value) {
      let data = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          data = element.full_user_name;
        }
      });
      return data;
    },
    async get_s3_storage() {
      const rawUrls = this.viewItem?.attachments_keys;
      const details = this.$store.getters.GetOrgDetails;

      if (!Array.isArray(rawUrls) || !details?.s3_details) return;

      const processedAttachments = await Promise.all(
        rawUrls.map(async (url) => {
          const signedUrl = await getS3SignedUrl(url, details.s3_details);
          if (signedUrl) {
            return {
              url: signedUrl,
              filename: this.extractFilename(url),
              originalUrl: url
            };
          }
          return null;
        })
      );

      this.images = processedAttachments.filter(Boolean); // Remove any undefined/null
    },
    extractFilename(url) {
      // Extract filename from S3 URL
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename || 'Unknown file';
    },
    isImageFile(url) {
      if (!url) return false;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    },
    isPdfFile(url) {
      if (!url) return false;
      return url.toLowerCase().includes('.pdf');
    },
    openFile(url) {
      // Open file in new tab
      window.open(url, '_blank');
    },
  },
};
</script>


<style scoped>
.task-card{
border-radius:14px;
}

.task-title{
font-size:20px;
font-weight:600;
color:#333;
}

.info-card{
display:flex;
gap:12px;
align-items:center;
padding:14px;
border-radius:10px;
}

.info-label{
font-size:12px;
color:#888;
}

.info-value{
font-size:14px;
font-weight:500;
}

.attachment-title{
font-weight:600;
font-size:16px;
display:flex;
align-items:center;
}

.attachment-card{
cursor:pointer;
border-radius:10px;
transition:0.25s;
}

.attachment-card:hover{
transform:translateY(-4px);
box-shadow:0 6px 18px rgba(0,0,0,0.1);
}

.file-name{
font-size:12px;
margin-top:6px;
word-break:break-all;
}

.navBar{
background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
color:white;
}
</style>

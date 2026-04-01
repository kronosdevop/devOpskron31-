  <template>
    <!-- eslint-disable -->
    <div>
      <v-dialog
        :model-value="viewPhaseDialog"
        @update:model-value="$emit('update:viewPhaseDialog', $event)"
        persistent
        max-width="500"
        transition="dialog-top-transition"
      >
        <v-card>
          <v-toolbar flat density="compact" class="navBar">
            <v-toolbar-title class="text-black ml-2">
              <div class="custom-title">
                Task Details
              </div>
            </v-toolbar-title>
            <v-spacer />
            <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
          </v-toolbar>
          <v-card-text class="mt-4">
            <p><strong>Task Name : </strong> {{ viewItem.task_name }}</p>
            <p>
              <strong>Task Description : </strong> {{ viewItem.task_description }}
            </p>
            <p>
              <strong>Task Assigned By : </strong>
              {{ fetch_name(viewItem.task_created_by) }}
            </p>
            <p>
              <strong>Task Assigned To : </strong>
              {{ fetch_name(viewItem.assign_to) }}
            </p>
            <p><strong>Task Status : </strong> {{ viewItem.task_priority }}</p>
            <p>
              <strong>Task Due Date : </strong>
              {{ viewItem.task_completion_date }}
            </p>
            <p>
              <strong>Task Progression : </strong>
              {{
                viewItem.task_completion_percentage == undefined
                  ? 0
                  : viewItem.task_completion_percentage
              }}
            </p>
            <p><strong>Attachments:</strong></p>
            <div v-if="images.length">
              <v-row dense>
                <v-col v-for="(attachment, index) in images" :key="index" cols="6">
                  <!-- Image files -->
                  <div v-if="isImageFile(attachment.url)">
                    <v-img
                      :src="attachment.url"
                      contain
                      max-width="100%"
                      class="my-2"
                      height="100"
                      alt="Attachment Image"
                    />
                  </div>
                  <!-- PDF files -->
                  <div v-else-if="isPdfFile(attachment.url)" class="my-2">
                    <v-card variant="outlined" class="pdf-card">
                      <v-card-text class="text-center pa-4">
                        <v-icon size="48" color="red" class="mb-2">mdi-file-pdf-box</v-icon>
                        <div class="text-caption">{{ attachment.filename }}</div>
                      </v-card-text>
                      <v-card-actions class="justify-center pa-2">
                        <v-btn
                          size="small"
                          color="primary"
                          variant="text"
                          @click="openFile(attachment.url)"
                        >
                          View PDF
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </div>
                  <!-- Other files -->
                  <div v-else class="my-2">
                    <v-card variant="outlined" class="file-card">
                      <v-card-text class="text-center pa-4">
                        <v-icon size="48" color="grey" class="mb-2">mdi-file</v-icon>
                        <div class="text-caption">{{ attachment.filename }}</div>
                      </v-card-text>
                      <v-card-actions class="justify-center pa-2">
                        <v-btn
                          size="small"
                          color="primary"
                          variant="text"
                          @click="openFile(attachment.url)"
                        >
                          Download
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </div>
                </v-col>
              </v-row>
            </div>
            <p v-else>No attachments</p>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              @click="close_dialog()"
              dark
              class="text-capitalize cardCss button-corner"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
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
.v-img {
  border-radius: 8px;
  border: 1px solid #ccc;
}

.custom-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.icon-class {
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-class:hover {
  color: #f44336;
}

.navBar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.cardCss {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.button-corner {
  border-radius: 8px;
}

.pdf-card, .file-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.pdf-card:hover, .file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pdf-card {
  border-color: #f44336;
}

.file-card {
  border-color: #9e9e9e;
}
</style>

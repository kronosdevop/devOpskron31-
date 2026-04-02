<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="assignToMeDialog" @update:model-value="$emit('update:assignToMeDialog', $event)"
      persistent
      max-width="900"
      transition="dialog-bottom-transition"
    >
      <v-card class="modern-dialog">
        <!-- Header: Task Title -->
        <v-card-title class="modern-title-row dense-toolbar">
          <div class="modern-title-wrap">
            <span class="modern-title">{{ taskName }}</span>
          </div>
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="close_dialog()" class="close-btn dense-close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="modern-card-text">
          <v-row>
            <!-- Left: Task Details & Status Update -->
            <v-col cols="12" md="6" class="modern-info-col">
              <div class="modern-info-list mb-6">
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 modern-info-icon" size="18">mdi-calendar</v-icon>
                  <span class="modern-label regular-label">Task Assigned On:</span>
                  <span class="modern-value">{{ taskAssignedOn }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 modern-info-icon" size="18">mdi-account</v-icon>
                  <span class="modern-label regular-label">Task Assigned By:</span>
                  <span class="modern-value">{{ rowInfo.task_assign_by_name == undefined ? taskAssignBy : rowInfo.task_assign_by_name }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 modern-info-icon" size="18">mdi-calendar-check</v-icon>
                  <span class="modern-label regular-label">Task Completion Date:</span>
                  <span class="modern-value">{{ taskCompletion }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 modern-info-icon" size="18">mdi-flag</v-icon>
                  <span class="modern-label regular-label">Task Status:</span>
                  <v-select
                    v-model="taskStatus"
                    :items="fetchStatus"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="modern-status-select ml-2"
                    prepend-inner-icon="mdi-flag"
                    :disabled="statusValue === 'COMPLETED' || statusValue === 'HOLD'"
                  />
                  <!-- Percentage bar for INPROGRESS status -->
                
                </div>
                <div v-if="taskStatus === 'INPROGRESS'" class="mt-4">
                    <v-slider
                      v-model="taskPercentage"
                      :max="100"
                      :min="0"
                      step="1"
                      label="Task Completion (%)"
                      thumb-label
                      class="mb-2"
                    ></v-slider>
                    <div class="text-caption">Progress: {{ taskPercentage }}%</div>
                  </div>
              </div>
              <v-btn
              v-if="statusValue !== 'COMPLETED' && statusValue !== 'HOLD'"
                color="primary"
                variant="flat"
                size="small"
                :loading="loading"
                @click="save_status_change"
                class="modern-btn compact-btn mt-2"
              >
                Submit
              </v-btn>
            </v-col>

            <!-- Right: Comments -->
            <v-col cols="12" md="6" class="modern-comments-col">
              <div v-if="taskStatus !== 'COMPLETED'">
                <div class="modern-label mb-2 regular-label">Comments</div>
                <!-- Comment Input -->
                <div class="d-flex align-center mb-3">
                  <v-avatar size="28" class="mr-2 modern-comment-avatar"><v-icon>mdi-account</v-icon></v-avatar>
                  <v-text-field
                    v-model="commentMessage"
                    placeholder="Add a comment"
                    variant="outlined"
                    hide-details
                    density="compact"
                    class="flex-grow-1 modern-comment-input compact-input"
                    @keyup.enter="save_comments"
                  />
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    :loading="loadindSub"
                    @click="save_comments"
                    :disabled="!commentMessage.trim()"
                    class="ml-2 modern-btn compact-btn"
                  >
                    <v-icon left size="16">mdi-send</v-icon>
                    Save
                  </v-btn>
                </div>
              </div>
              <div class="modern-label mb-2 mt-3 regular-label">Previous Comments</div>
              <div class="modern-comments-list">
                <div
                  v-for="(item, idx) in fetchComments"
                  :key="idx"
                  class="modern-comment-card mb-2 compact-comment-card"
                >
                  <v-avatar size="24" class="mr-2 modern-comment-avatar"><v-icon>mdi-account</v-icon></v-avatar>
                  <div class="flex-grow-1">
                    <div class="modern-comment-meta mb-1">
                      <span class="modern-comment-author">{{ item.commented_by_name }}</span>
                      <span class="modern-comment-date ml-2">({{ fetch_date(item.commented_on) }})</span>
                    </div>
                    <div class="modern-comment-text">{{ item.comment_texts }}</div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
          
          <!-- Attachments Section -->
          <v-row v-if="attachments.length > 0" class="mt-4">
            <v-col cols="12">
              <div class="modern-label mb-3 regular-label">
                <v-icon class="mr-2" size="18">mdi-paperclip</v-icon>
                Task Attachments ({{ attachments.length }})
              </div>
              <div class="attachments-grid">
                <div
                  v-for="(attachment, index) in attachments"
                  :key="index"
                  class="attachment-card"
                >
                  <div class="attachment-content">
                    <div class="attachment-preview">
                      <v-img
                        v-if="isImageFile(attachment.fileName)"
                        :src="attachment.presignedUrl"
                        :alt="attachment.fileName"
                        width="80"
                        height="80"
                        cover
                        class="attachment-image"
                      />
                      <div v-else class="attachment-icon">
                        <v-icon size="40" color="primary">mdi-file</v-icon>
                      </div>
                    </div>
                    <div class="attachment-name">{{ attachment.fileName }}</div>
                    <div class="attachment-actions">
                      <v-btn
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="downloadAttachment(attachment)"
                        class="download-btn"
                      >
                        <v-icon size="16">mdi-download</v-icon>
                        Download
                      </v-btn>
                      <v-btn
                        v-if="isImageFile(attachment.fileName)"
                        size="x-small"
                        variant="text"
                        color="secondary"
                        @click="previewImage(attachment)"
                        class="preview-btn"
                      >
                        <v-icon size="16">mdi-eye</v-icon>
                        Preview
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/

import { task_completion } from "@/graphql/mutations.js";
import { get_particular_task_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import axios from "axios";
const FileSaver = require("file-saver");
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  props: {
    assignToMeDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      taskName: "",
      taskDescription: "",
      taskAssignedOn: "",
      taskAssignBy: "",
      taskCompletion: "",
      statusValue: "",
      imageregularUrl: [],
      attachments: [],
      taskStatus: "",
      fetchStatus: ["INPROGRESS", "HOLD", "COMPLETED"],
      taskPercentage: 0,
      percentageNumber: 0,
      loading: false,
      loadindSub: false,
      commentMessage: "",
      fetchComments: [],
      model3: false,
      model4: false,
    };
  },
  watch: {
    assignToMeDialog: {
      async handler() {
        if (this.assignToMeDialog == true) {
          // console.log(this.rowInfo);
          this.taskName = "";
          this.taskDescription = "";
          this.taskAssignedOn = "";
          this.taskAssignBy = "";
          this.taskCompletion = "";
          this.imageregularUrl = [];
          this.taskPercentage = 0;
          this.percentageNumber = 0;
          this.fetchStatus = ["INPROGRESS", "HOLD", "COMPLETED"];
          this.fetch_task_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_percentage() {
      if (this.percentageNumber != "") {
        this.taskPercentage = this.percentageNumber;
      }
    },

    save_comments() {
      this.loadindSub = true;
      this.complete_task("comments");
    },

    save_status_change() {
      this.loading = true;
      this.complete_task("statusChange");
    },

    extract_file_name(url) {
      var data = url.original.substring(url.original.lastIndexOf("/") + 1);
      return data;
    },

    fetch_date(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        year
      );
    },

    async complete_task(value) {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(task_completion, {
            input: {
              task_id: this.rowInfo.task_id,
              user_email_id: data.user.user_email_id,
              comments: value == "comments" ? this.commentMessage : undefined,
              progress_status: this.taskStatus,
              action_type: value == "comments" ? "COMMENTS" : "STATUS_CHANGE",
              attachments_keys: [],
              task_completion_percentage:
                this.taskStatus == "INPROGRESS"
                  ? this.taskPercentage
                  : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.task_completion);

        this.loading = false;
        this.withdrawAction = false;
        this.loadindSub = false;
        if (response.Status == "SUCCESS") {
          this.commentMessage = "";
          if (value == "statusChange") {
            this.$emit("successMsg", response.Message);
            this.commentMessage = "";
          } else {
            await this.fetch_task_details();
            this.commentMessage = "";
          }

          // this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    async downloadimage(url) {
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(url.original, details.s3_details);
      if (signedUrl) {
        const fileName = signedUrl.split("/").pop().split("?")[0];
        this.download_func(signedUrl, fileName);
      }
    },

    async download_func(signedUrl, fileName) {
      try {
        const response = await axios({
          url: signedUrl,
          method: "GET",
          responseType: "blob",
        });

        const blob = new Blob([response.data]);
        FileSaver.saveAs(blob, fileName);
      } catch (err) {
        this.$emit("errorMsg", "Download failed. Please try again.");
        console.error("Download error:", err);
      }
    },
    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    check_max_value(event) {
      if (parseInt(event.target.value + event.key) > 100) {
        event.preventDefault();
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async fetch_task_details() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_task_details, {
            input: {
              task_id: this.rowInfo.task_id,
            },
          })
        );
        this.fetchComments = [];
        this.imageregularUrl = [];
        this.attachments = [];
        var response = JSON.parse(result.data.get_particular_task_details);

        if (response.Status == "SUCCESS") {
          // this.taskDescription = response.data.task_description;
          this.taskName = response.data.task_name;
          this.taskAssignedOn = this.fetch_value(response.data.task_created_on);
          this.taskCompletion = response.data.task_completion_date;
          this.taskStatus = response.data.task_progress_status;
          this.statusValue = response.data.task_progress_status;
          this.taskPercentage =
            response.data.task_completion_percentage != undefined
              ? Number(response.data.task_completion_percentage)
              : 0;
          this.percentageNumber =
            response.data.task_completion_percentage != undefined
              ? Number(response.data.task_completion_percentage)
              : 0;
          this.fetchComments =
            response.data.task_comments == undefined
              ? []
              : response.data.task_comments;
          this.taskAssignBy = response.data.task_assign_by;

          // Process attachments and generate presigned URLs
          var attachmentsKeys = response.data.attachments_keys || [];
          if (attachmentsKeys.length > 0) {
            await this.processAttachments(attachmentsKeys);
          }
        }
      } catch (error) {}
    },

    fetch_value(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        year
      );
    },

    getStatusColor(status) {
      if (status === "COMPLETED") {
        return "success";
      } else if (status === "INPROGRESS") {
        return "warning";
      } else if (status === "HOLD") {
        return "info";
      } else if (status === "WITHDRAWN") {
        return "error";
      } else if (status === "WITHDRAW") {
        return "error";
      } else if (status === "ASSIGNED") {
        return "primary";
      }
      return "grey";
    },

    async processAttachments(attachmentsKeys) {
      const details = this.$store.getters.GetOrgDetails;
      
      for (let i = 0; i < attachmentsKeys.length; i++) {
        const attachmentKey = attachmentsKeys[i];
        try {
          const presignedUrl = await getS3SignedUrl(attachmentKey, details.s3_details);
          if (presignedUrl) {
            const fileName = this.extractFileNameFromKey(attachmentKey);
            this.attachments.push({
              original: attachmentKey,
              presignedUrl: presignedUrl,
              fileName: fileName
            });
          }
        } catch (error) {
          console.error("Error processing attachment:", attachmentKey, error);
        }
      }
    },

    extractFileNameFromKey(key) {
      // Extract filename from S3 key
      const parts = key.split('/');
      return parts[parts.length - 1] || key;
    },

    isImageFile(fileName) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      return imageExtensions.includes(extension);
    },

    async downloadAttachment(attachment) {
      try {
        const response = await axios({
          url: attachment.presignedUrl,
          method: "GET",
          responseType: "blob",
        });

        const blob = new Blob([response.data]);
        FileSaver.saveAs(blob, attachment.fileName);
      } catch (err) {
        this.$emit("errorMsg", "Download failed. Please try again.");
        console.error("Download error:", err);
      }
    },

    previewImage(attachment) {
      // Open image in new tab for preview
      window.open(attachment.presignedUrl, '_blank');
    },
  },
};
</script>

<style scoped>
.modern-dialog {
  border-radius: 14px;
  /* background: #f7f8fa; */
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}
.modern-title-row {
  font-size: 1.2rem;
  font-weight: 700;
  padding: 16px 24px 8px 24px;
  background: #fff;
  border-radius: 14px 14px 0 0;
  min-height: 40px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.modern-title-wrap {
  max-width: 80%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.modern-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #222;
  line-height: 1.3;
  word-break: break-word;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.dense-toolbar {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  min-height: 40px !important;
}
.dense-close-btn {
  margin-left: 8px;
  min-width: 32px;
  min-height: 32px;
  align-self: flex-start;
}
.modern-card-text {
  /* background: #f7f8fa; */
  border-radius: 0 0 14px 14px;
  padding: 24px 24px 24px 24px;
}
.modern-info-col {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 18px;
}
.modern-info-list {
  margin-bottom: 10px;
}
.modern-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.modern-info-icon {
  color: #888;
}
.modern-label {
  font-weight: 400;
  color: #222;
  font-size: 0.98rem;
  min-width: 140px;
}
.regular-label {
  font-weight: 400 !important;
}
.modern-value {
  font-weight: 400;
  color: #444;
  font-size: 0.98rem;
}
.modern-status-select {
  min-width: 140px;
  border-radius: 999px !important;
  font-size: 0.98rem;
}
.modern-btn {
  border-radius: 999px;
  min-width: 80px;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 0.98rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 0 18px !important;
  height: 36px !important;
}
.compact-btn {
  min-width: 70px;
  font-size: 0.95rem;
  padding: 0 12px !important;
  height: 32px !important;
}
.modern-comments-col {
  /* background: #f4f6fa; */
  border-radius: 10px;
  padding: 18px;
}
.modern-comment-input {
  border-radius: 999px !important;
  background: #fff;
  font-size: 0.98rem;
  height: 32px !important;
}
.compact-input {
  height: 32px !important;
  font-size: 0.95rem;
}
.modern-comment-avatar {
  background: #e9e9e9;
  color: #888;
}
.modern-comments-list {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 8px;
  padding-top: 8px;
}
.modern-comment-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin-bottom: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
}
.compact-comment-card {
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.95rem;
}
.modern-comment-meta {
  font-size: 0.92rem;
  color: #666;
  font-weight: 500;
}
.modern-comment-author {
  font-weight: 600;
  color: #333;
}
.modern-comment-date {
  font-size: 0.92rem;
  color: #888;
  margin-left: 8px;
}
.modern-comment-text {
  font-size: 0.98rem;
  color: #222;
  margin-left: 8px;
  margin-top: 2px;
}

/* Attachments Styles */
.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

.attachment-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 12px;
  transition: all 0.2s ease;
}

.attachment-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.attachment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.attachment-preview {
  display: flex;
  justify-content: center;
}

.attachment-image {
  border-radius: 6px;
  object-fit: cover;
}

.attachment-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
}

.attachment-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #222;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
  white-space: normal;
  overflow-wrap: break-word;
  max-width: 100%;
}

.attachment-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.download-btn,
.preview-btn {
  font-size: 0.8rem;
  min-width: auto;
  padding: 4px 8px;
  height: 24px;
}

.download-btn:hover,
.preview-btn:hover {
  background: rgba(25, 118, 210, 0.1);
}
</style>
<template>
  <v-dialog
    :model-value="assignByMeDialog"
    @update:model-value="$emit('update:assignByMeDialog', $event)"
    persistent
    max-width="950"
  >
    <v-card class="modern-dialog">
      <!-- HEADER -->
      <v-card-title class="modern-title-row dense-toolbar">
        <div class="modern-title-wrap">
          <span class="modern-title mt-3">{{ rowInfo.task_name }}</span>
        </div>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
          @click="close_dialog()"
          class="close-btn dense-close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text>
        <!-- MAIN GRID -->
        <v-row>
          <!-- LEFT: TASK DETAILS -->
          <v-col cols="12" md="6">
            <v-card class="section-card">
              <div class="section-header">📋 Task Details</div>

              <div class="info-row">
                <v-icon size="18">mdi-account</v-icon>
                <span>Assigned:</span>
                <b>
                  {{
                    rowInfo.task_type == "ALL_MEMBERS"
                      ? "All Members"
                      : rowInfo.task_assign_to.join(", ")
                  }}
                </b>
              </div>

              <div class="info-row">
                <v-icon size="18">mdi-calendar</v-icon>
                <span>Assigned On:</span>
                <b>{{ taskAssignedOn }}</b>
              </div>

              <div class="info-row">
                <v-icon size="18">mdi-repeat</v-icon>
                <span>Type:</span>
                <v-chip size="small" color="primary">
                  {{ rowInfo.enabled_recursion ? "Recurring" : "One Time" }}
                </v-chip>
              </div>

              <div class="info-row">
                <v-icon size="18">mdi-flag</v-icon>
                <span>Status:</span>
                <v-chip
                  size="small"
                  :color="getStatusColor(rowInfo.task_progress_status)"
                >
                  {{ rowInfo.task_progress_status }}
                </v-chip>
              </div>

              <div class="info-row">
                <v-icon size="18">mdi-calendar-check</v-icon>
                <span>Completion:</span>
                <b>{{ taskCompletion }}</b>
              </div>

              <div class="info-row">
                <v-icon size="18">mdi-calendar-star</v-icon>
                <span>Target:</span>
                <b>{{ targetCompletionDate }}</b>
              </div>
            </v-card>
          </v-col>

          <!-- RIGHT: PROGRESS -->
          <v-col cols="12" md="6" v-if="rowInfo.task_type == 'ALL_MEMBERS'">
            <v-card class="section-card">
              <div class="section-header">📊 Progress</div>

              <div
                v-for="user in inProgressTasks"
                :key="user.task_id"
                class="user-progress"
              >
                <div class="d-flex justify-space-between">
                  <span>{{ user.task_assign_to_name }}</span>
                  <b>{{ user.task_completion_percentage }}%</b>
                </div>

                <v-progress-linear
                  :model-value="user.task_completion_percentage"
                  height="6"
                  class="mt-1"
                />

                <v-btn
                  size="x-small"
                  color="error"
                  class="mt-2"
                  @click="withdrawTask(user)"
                >
                  Withdraw
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ATTACHMENTS -->
        <v-row v-if="attachments.length" class="mt-4">
          <v-col cols="6">
            <v-card class="section-card">
              <div class="section-header">
                📎 Attachments ({{ attachments.length }})
              </div>

              <div class="attachments-grid">
                <div
                  v-for="(attachment, i) in attachments"
                  :key="i"
                  class="attachment-card"
                >
                  <v-img
                    v-if="isImageFile(attachment.fileName)"
                    :src="attachment.presignedUrl"
                    height="100"
                    cover
                    class="rounded"
                  />

                  <v-icon v-else size="40">mdi-file</v-icon>

                  <div class="attachment-name">
                    {{ attachment.fileName }}
                  </div>

                  <div class="text-center mt-2">
                    <v-btn
                      size="x-small"
                      @click="downloadAttachment(attachment)"
                    >
                      Download
                    </v-btn>

                    <v-btn
                      v-if="isImageFile(attachment.fileName)"
                      size="x-small"
                      class="ml-2"
                      @click="previewImage(attachment)"
                    >
                      View
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- COMMENTS -->
          <v-col cols="16">
            <v-card class="section-card">
              <div class="section-header">
                💬 Comments ({{ fetchComments.length }})
              </div>

              <div class="comments-wrapper">
                <!-- ✅ If comments exist -->
                <template v-if="fetchComments.length">
                  <div
                    v-for="(comment, i) in fetchComments"
                    :key="i"
                    class="comment-bubble"
                  >
                    <div class="comment-header">
                      <b>{{ comment.commented_by_name }}</b>
                      <span>{{ fetch_date(comment.commented_on) }}</span>
                    </div>

                    <div class="comment-body">
                      {{ comment.comment_texts }}
                    </div>
                  </div>
                </template>

                <!-- ❌ If no comments -->
                <div v-else class="no-comments">
                  <v-icon size="28" color="grey">mdi-comment-outline</v-icon>
                  <div>No comments yet</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <!-- Actions Footer -->
      <v-card-actions
        v-if="rowInfo.task_progress_status == 'INPROGRESS'"
        class="modern-footer-actions"
      >
        <v-spacer />
        <v-btn
          color="error"
          variant="flat"
          size="small"
          :loading="loading1"
          class="modern-btn compact-btn mr-2"
          @click="hold_withdraw_action('HOLD')"
        >
          Hold
        </v-btn>
        <v-btn
          color="success"
          variant="flat"
          size="small"
          :loading="loading2"
          class="modern-btn compact-btn"
          @click="hold_withdraw_action('WITHDRAWN')"
        >
          Withdraw
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/

import { task_completion } from "@/graphql/mutations.js";
import { get_particular_task_details } from "@/graphql/queries.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

import axios from "axios";
const FileSaver = require("file-saver");
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    assignByMeDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      taskDescription: "",
      taskAssignedOn: "",
      taskAssignBy: "",
      taskCompletion: "",
      imageregularUrl: [],
      attachments: [],
      taskStatus: "",
      fetchStatus: [],
      taskPercentage: 0,
      percentageNumber: 0,
      loading: false,
      loadindSub: false,
      commentMessage: "",
      fetchComments: [],
      model3: false,
      model4: false,
      imageregularUrl: [],
      loading1: false,
      loading2: false,
      targetCompletionDate: "",
      assignedTasks: null,
    };
  },
  watch: {
    assignByMeDialog: {
      async handler() {
        if (this.assignByMeDialog == true) {
          if (this.rowInfo.task_type == "ALL_MEMBERS") {
          }
          // console.log(this.rowInfo);
          this.taskName = "";
          this.taskDescription = "";
          this.taskAssignedOn = "";
          this.taskAssignBy = "";
          this.taskCompletion = "";
          this.imageregularUrl = [];
          this.taskPercentage = 0;
          this.percentageNumber = 0;
          this.fetchStatus = ["HOLD", "WITHDRAWN"];
          this.fetch_task_details();
        }
      },
      immediate: true,
    },
  },
  computed: {
    inProgressTasks() {
      return (
        this.assignedTasks?.filter(
          (task) => task.task_progress_status === "INPROGRESS"
        ) || []
      );
    },
    completedTasks() {
      return (
        this.assignedTasks?.filter(
          (task) => task.task_progress_status === "COMPLETED"
        ) || []
      );
    },
  },
  methods: {
    fetch_percentage() {
      // console.log(this.percentageNumber);
      if (this.percentageNumber != "") {
        this.taskPercentage = this.percentageNumber;
      }
    },

    hold_withdraw_action(value) {
      if (value == "HOLD") {
        this.loading1 = true;
        this.fetch_actions("HOLD");
      } else if (value == "WITHDRAWN") {
        this.loading2 = true;
        this.fetch_actions("WITHDRAWN");
      }
    },
    withdrawTask(user) {
      this.fetch_actions("individual", user);
      // console.log(user);
    },
    async fetch_actions(value, user) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(task_completion, {
            input: {
              task_id:
                value == "individual"
                  ? user.task_id
                  : this.rowInfo.main_task_id,
              user_email_id: data.user.user_email_id,
              progress_status: value == "individual" ? "WITHDRAWN" : value,
              action_type: value == "individual" ? "STATUS_CHANGE" : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.task_completion);

        this.withdrawAction = false;
        this.loading1 = false;
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.loading1 = false;
          this.loading2 = false;
          this.loading = false;
          // this.commentMessage = "";
          // if (value == "statusChange") {
          //   this.$emit("successMsg", response.Message);
          //   // this.commentMessage = "";
          // } else {
          //   this.$emit("errorMsg", response.Message);
          //   // await this.fetch_task_details();
          //   // this.commentMessage = "";
          // }

          //   // this.$refs.form.reset();
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    display_frequency_info(value) {
      if (value.recursion_frequency == "DAILY") {
        return "DAILY";
      } else if (value.recursion_frequency == "MONTHLY") {
        return "MONTHLY" + " " + "Date" + ": " + value.recursion_date;
      } else if (value.recursion_frequency == "WEEKLY") {
        return "WEEKLY" + " (" + value.recursion_day + ")";
      } else if (
        value.recursion_frequency == "QUATERLY" ||
        value.recursion_frequency == "HALFYEARLY" ||
        value.recursion_frequency == "YEARLY"
      ) {
        return (
          value.recursion_frequency +
          "-" +
          value.recursion_month +
          "(" +
          value.recursion_date +
          ")"
        );
      }
    },

    fetch_org_format(value) {
      if (value != undefined) {
        return formatdisplayDate(value);
      }
    },
    save_comments() {
      this.complete_task("comments");
    },
    save_status_change() {
      this.complete_task("statusChange");
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
    // async complete_task(value) {
    //   this.loading = true;
    //   var data = this.$store.getters.GetUserObj;
    //   try {
    //     let result = await API.graphql(
    //       graphqlOperation(task_completion, {
    //         input: {
    //           task_id: this.rowInfo.task_id,
    //           user_email_id: data.user.user_email_id,
    //           comments: value == "comments" ? this.commentMessage : undefined,
    //           progress_status: this.taskStatus,
    //           action_type: value == "comments" ? "COMMENTS" : "STATUS_CHANGE",
    //           attachments_keys: [],
    //           task_completion_percentage:
    //             this.taskStatus == "INPROGRESS"
    //               ? Math.ceil(this.taskPercentage)
    //               : undefined,
    //         },
    //       })
    //     );
    //     var response = JSON.parse(result.data.task_completion);
    //     c;
    //     this.loading = false;
    //     this.withdrawAction = false;
    //     if (response.Status == "SUCCESS") {
    //       this.commentMessage = "";
    //       if (value == "statusChange") {
    //         this.$emit("successMsg", response.Message);
    //         this.commentMessage = "";
    //       } else {
    //         await this.fetch_task_details();
    //         this.commentMessage = "";
    //       }

    //       // this.$refs.form.reset();
    //     } else {
    //       this.$emit("errorMsg", response.Message);
    //     }
    //   } catch (error) {
    //     this.$emit("errorMsg", error.errors[0].message);
    //     this.loading = false;
    //   }
    // },

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
    extract_file_name(url) {
      var data = url.original.substring(url.original.lastIndexOf("/") + 1);
      return data;
    },

    async download_func(url) {
      var filename = url.presigned.split("/").pop().split("?")[0];
      axios({
        url: url.presigned,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          // Create a blob from the response
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, filename);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },

    async fetch_task_details() {
      try {
        this.attachments = [];
        this.fetchComments = [];

        let result = await API.graphql(
          graphqlOperation(get_particular_task_details, {
            input: { task_id: this.rowInfo.main_task_id },
          })
        );

        const response = JSON.parse(result.data.get_particular_task_details);

        if (response.Status === "SUCCESS") {
          const data = response.data[0];

          // ✅ FIXED ARRAYS
          this.assignedTasks = Object.values(data.assigned_tasks || {});
          this.fetchComments = Object.values(data.task_comments || {});

          this.taskDescription = data.task_description;
          this.taskName = data.task_name;
          this.taskAssignedOn = this.fetch_value(data.task_created_on);
          this.taskCompletion = this.fetch_org_format(
            data.task_completion_date
          );
          this.taskStatus = data.task_progress_status;

          this.taskPercentage = data.task_completion_percentage || 0;
          this.percentageNumber = data.task_completion_percentage || 0;

          this.targetCompletionDate = data.task_completed_on
            ? this.fetch_org_format(data.task_completed_on)
            : "-";

          // ✅ Attachments (FIXED)
          if (data.attachments_keys?.length) {
            this.processAttachments(data.attachments_keys);
          }
        }
      } catch (error) {
        console.error(error);
      }
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
      const parts = key.split("/");
      return parts[parts.length - 1] || key;
    },

    isImageFile(fileName) {
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
        ".svg",
      ];
      const extension = fileName
        .toLowerCase()
        .substring(fileName.lastIndexOf("."));
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
      window.open(attachment.presignedUrl, "_blank");
    },

    s3convert(urls) {
      var response = this.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "task/" + urls.split("task/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      // var array = [];
      // array.unshift(url);
      return url;
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
      switch (status) {
        case "COMPLETED":
          return "green";
        case "INPROGRESS":
          return "orange";
        case "HOLD":
          return "red";
        case "WITHDRAWN":
        case "WITHDRAW":
          return "primary";
        case "ASSIGNED":
          return "brown";
        default:
          return "grey";
      }
    },
  },
};
</script>
<style scoped>
.modern-dialog {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
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
  padding: 24px 24px 12px 24px;
}
/* HEADER */
.dialog-header {
  font-weight: 600;
  font-size: 16px;
}

.dialog-title {
  font-weight: 600;
}

/* SECTION CARD */
.section-card {
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* SECTION TITLE */
.section-header {
  font-weight: 600;
  margin-bottom: 12px;
  color: #1976d2;
}

/* INFO ROW */
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* PROGRESS */
.user-progress {
  margin-bottom: 12px;
}

/* ATTACHMENTS */
.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.attachment-card {
  padding: 10px;
  border-radius: 10px;
  background: #fafafa;
  text-align: center;
  transition: 0.2s;
}

.attachment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.attachment-name {
  font-size: 12px;
  margin-top: 6px;
  word-break: break-word;
}

/* COMMENTS */
.comments-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-bubble {
  background: #eef4ff;
  padding: 10px;
  border-radius: 12px;
  max-width: 80%;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.comment-body {
  margin-top: 4px;
  font-size: 14px;
}
.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: #999;
  font-size: 14px;
  gap: 6px;
}
</style>
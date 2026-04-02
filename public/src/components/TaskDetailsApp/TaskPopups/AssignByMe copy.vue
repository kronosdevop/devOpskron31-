<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="assignByMeDialog" @update:model-value="$emit('update:assignByMeDialog', $event)"
      persistent
      max-width="900"
      transition="dialog-top-transition"
    >
      <v-card class="modern-dialog">
        <v-card-title class="modern-title-row dense-toolbar">
          <div class="modern-title-wrap">
            <span class="modern-title">{{ rowInfo.task_name }}</span>
          </div>
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="close_dialog()" class="close-btn dense-close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <!-- Modern Dense Toolbar/Header -->

       
        <v-card-text class="modern-card-text">
          <v-row>
            <!-- Left: Task Details -->
            <v-col cols="12" md="6" class="modern-info-col">
              <div class="section-header mb-2">Task Details</div>
              <div class="modern-info-list mb-6">
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-account-multiple</v-icon>
                  <span class="modern-label">Assigned to:</span>
                  <span class="modern-value">
                    {{ rowInfo.task_type == "ALL_MEMBERS" ? "All Members" : rowInfo.task_assign_to.join(", ") }}
                  </span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-calendar</v-icon>
                  <span class="modern-label">Assigned On:</span>
                  <span class="modern-value">{{ taskAssignedOn }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-repeat</v-icon>
                  <span class="modern-label">Type:</span>
                  <v-chip x-small :color="rowInfo.enabled_recursion ? 'primary' : 'info'" text-color="white" class="ml-2">
                    {{ rowInfo.enabled_recursion ? 'Recurring Task' : 'One Time' }}
                  </v-chip>
                </div>
                <div v-if="rowInfo.enabled_recursion == true" class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-calendar-clock</v-icon>
                  <span class="modern-label">Frequency:</span>
                  <span class="modern-value">{{ display_frequency_info(rowInfo.task_recursion_frequency) }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-calendar-check</v-icon>
                  <span class="modern-label">Completion Date:</span>
                  <span class="modern-value">{{ taskCompletion }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-calendar-star</v-icon>
                  <span class="modern-label">Target Completion:</span>
                  <span class="modern-value">{{ targetCompletionDate }}</span>
                </div>
                <div class="modern-info-row mb-2">
                  <v-icon class="mr-2 info-icon" size="18">mdi-flag</v-icon>
                  <span class="modern-label">Status:</span>
                  <v-chip x-small :color="getStatusColor(rowInfo.task_progress_status)" text-color="white" class="ml-2">
                    {{ rowInfo.task_progress_status }}
                  </v-chip>
                </div>
              </div>
              <div v-if="rowInfo.task_progress_status == 'ASSIGNED' || rowInfo.task_progress_status == 'HOLD'" class="mb-2">
                <label class="modern-label"><b>Change Status</b></label>
                <v-select variant="outlined" density="compact" class="mt-2" :items="fetchStatus" v-model="taskStatus" ></v-select>
              </div>
              <div v-if="taskStatus == 'INPROGRESS'" class="mb-2">
                <label class="modern-label"><b>Completion %</b></label>
                <v-progress-linear v-model="taskPercentage" class="mt-3 mr-3" color="primary" disabled height="20" style="border-radius: 12px">
                  <template #default="{ value }">
                    <strong>{{ percentageNumber }}%</strong>
                  </template>
                </v-progress-linear>
              </div>
              <div v-if="rowInfo.task_progress_status !== 'COMPLETED' && rowInfo.task_progress_status !== 'WITHDRAWN' && rowInfo.task_progress_status !== 'INPROGRESS'" class="mt-4">
                <v-btn small color="primary" class="mr-2" :loading="loading" @click="hold_withdraw_action(taskStatus)">
                  Submit
                </v-btn>
              </div>
            </v-col>
            <v-divider vertical class="mx-2" />
            <!-- Right: Progress Section for ALL_MEMBERS -->
            <v-col v-show="rowInfo.task_type == 'ALL_MEMBERS'" cols="12" md="6" class="modern-progress-col">
              <div class="section-header mb-2">Progress</div>
              <v-expansion-panels class="mt-2" multiple>
                <!-- In Progress Panel -->
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <b style="font-size: 13px">Pending on ({{ inProgressTasks.length }} Users)</b>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list v-if="inProgressTasks.length">
                      <v-list-item v-for="user in inProgressTasks" :key="user.task_assign_to">
                        <v-list-item-content>
                          <v-row justify="space-between" align="center">
                            <v-col cols="8">
                              <v-list-item-title>{{ user.task_assign_to_name }}</v-list-item-title>
                            </v-col>
                            <v-col cols="4" class="text-right">
                              <span class="progress-text">{{ user.task_completion_percentage }}%</span>
                            </v-col>
                          </v-row>
                          <v-progress-linear :model-value="user.task_completion_percentage" color="primary" height="8" class="mt-2" />
                          <v-btn color="success" class="mt-2 custom-withdraw-btn text-capitalize" @click="withdrawTask(user)" size="x-small">
                            Withdraw
                          </v-btn>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <p v-else class="ml-4">No In Progress Tasks</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <!-- Completed Panel -->
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <b style="font-size: 13px">Completed by ({{ completedTasks.length }} Users)</b>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list v-if="completedTasks.length">
                      <v-list-item v-for="(user, index) in completedTasks" :key="user.task_assign_to">
                        <template #prepend>
                          <v-icon color="green">mdi-check-circle</v-icon>
                        </template>
                        <v-list-item-content>
                          <v-list-item-title class="font-weight-medium">{{ user.task_assign_to_name }}</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-icon size="small" color="grey">mdi-calendar-check</v-icon>
                            Completed On:
                            <b>{{ fetch_org_format(user.task_completed_on) || fetch_org_format(user.task_completion_date) }}</b>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-divider v-if="index !== completedTasks.length - 1" class="mt-2 mb-2"></v-divider>
                      </v-list-item>
                    </v-list>
                    <p v-else class="ml-4">No Completed Tasks</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
          
          <!-- Attachments Section -->
          <v-row v-if="attachments.length > 0" class="mt-4">
            <v-col cols="12">
              <div class="section-header mb-3">
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
        <v-divider />
        <!-- Actions Footer -->
        <v-card-actions v-if="rowInfo.task_progress_status == 'INPROGRESS'" class="modern-footer-actions">
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
  </div>
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
        let result = await API.graphql(
          graphqlOperation(get_particular_task_details, {
            input: {
              task_id: this.rowInfo.main_task_id,
            },
          })
        );
        this.fetchComments = [];
        var response = JSON.parse(result.data.get_particular_task_details);
        // var res =
        // console.log("response", response.data[0]);
        this.imageregularUrl = [];

        if (response.Status == "SUCCESS") {
        
          this.assignedTasks = response.data[0].assigned_tasks;
          this.taskDescription = response.data[0].task_description;
          this.taskName = response.data[0].task_name;
          this.taskAssignedOn = this.fetch_value(
            response.data[0].task_created_on
          );
          this.taskCompletion = this.fetch_org_format(
            response.data[0].task_completion_date
          );
          this.taskStatus = response.data[0].task_progress_status;
          this.taskPercentage =
            response.data[0].task_completion_percentage != undefined
              ? response.data[0].task_completion_percentage
              : 0;
          this.percentageNumber =
            response.data[0].task_completion_percentage != undefined
              ? response.data[0].task_completion_percentage
              : 0;
          this.targetCompletionDate =
            response.data[0].task_completed_on != undefined
              ? this.fetch_org_format(
                  fetch_org_formaresponse.data[0].task_completed_on
                )
              : "-";
          // console.log(this.percentageNumber);
          this.fetchComments =
            response.data[0].task_comments == undefined
              ? []
              : response.data[0].task_comments;
          this.taskAssignBy = response.data[0].task_assign_to_name;
              
          this.commented = resposne.data.commented_by_name
          // Process attachments and generate presigned URLs
          var attachmentsKeys = response.data[0].attachments_keys || [];
          if (attachmentsKeys.length > 0) {
            await this.processAttachments(attachmentsKeys);
          }
        }
      } catch (error) {}
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
        case 'COMPLETED':
          return 'green';
        case 'INPROGRESS':
          return 'orange';
        case 'HOLD':
          return 'red';
        case 'WITHDRAWN':
        case 'WITHDRAW':
          return 'primary';
        case 'ASSIGNED':
          return 'brown';
        default:
          return 'grey';
      }
    },
  },
};
</script>
<style scoped>
.modern-dialog {
  border-radius: 14px;
  background: #fff;
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
  padding: 24px 24px 12px 24px;
}
.section-header {
  font-size: 1.08rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.modern-info-list {
  background: none;
  border-radius: 0;
  padding: 0 0 10px 0;
  margin-bottom: 18px;
  box-shadow: none;
}
.modern-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 1rem;
}
.info-icon {
  color: #1976d2;
}
.modern-label {
  font-weight: 500;
  color: #444;
  margin-right: 6px;
  min-width: 110px;
}
.modern-value {
  color: #222;
  font-weight: 500;
  word-break: break-word;
}
.modern-progress-col {
  background: none;
  border-radius: 0;
  padding: 0 0 10px 0;
  margin-bottom: 18px;
  box-shadow: none;
}
.progress-text {
  font-weight: 500;
  font-size: 14px;
  color: #1976d2;
}
.custom-withdraw-btn {
  width: 85px !important;
  min-width: 85px !important;
  max-width: 85px !important;
  font-size: 12px;
}
.modern-footer-actions {
  background: #f8fafd;
  border-top: 1px solid #eee;
  border-radius: 0 0 14px 14px;
  padding: 12px 24px;
}
.modern-footer-btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  min-width: 120px;
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
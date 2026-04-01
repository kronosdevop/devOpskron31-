<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="directoryApprovalsDialog" @update:model-value="$emit('update:directoryApprovalsDialog', $event)"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="overflow-hidden">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">{{ formDetails.workflow_name }}</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-row no-gutters>
          <v-col cols="7">
            <v-card-title class="mt-n2 subFont" v-if="forwardAction == false">
              {{
                "Initiated By" + " " + "-" + " " + initiatedUser
              }}
            </v-card-title>
            <!-- <v-card-title class="mt-n2 subFont">Approval Details</v-card-title> -->
            <v-divider class="mt-n2" />
            <v-card-text
              v-show="formuniqueType == 'DIRECTORY_EDIT_ENTRY_FORM'"
              class="scrollable-content"
            >
              <div class="subFont">Old Entry</div>
              <v-form ref="form1">
                <v-row
                  v-for="(n, idx) in oldTemplate"
                  :key="idx"
                  no-gutters
                  class="mt-2 FontSize"
                >
                  <v-col cols="12" v-if="n.data_type == 'label'">
                    <div class="text-left font-weight-bold FontSize">
                      {{ n.display_label }}
                    </div>
                  </v-col>
                  <v-col cols="12" v-else>
                    <v-row>
                      <v-col class="" cols="5">
                        <div
                          v-if="n.display_label != 'Attachment Media'"
                          class="text-left font-weight-bold FontSize"
                        >
                          {{ n.display_label }}
                        </div>
                      </v-col>
                      <v-col
                        v-show="
                          n.key !== 'prfl_pic_s3_key' && n.key !== 'media_keys'
                        "
                        cols="7"
                      >
                        <div
                          class="text-left FontSize"
                          v-if="n.data_type == 'media'"
                        >
                          <div v-show="n.respectiveValue == 'N/A'">
                            <b>
                              {{
                                n.key == "epoch"
                                  ? ":" + " " + fetch_time(n.respectiveValue)
                                  : ":" + " " + fetch_data(n)
                              }}</b
                            >
                          </div>
                          <div>
                            <v-tooltip location="bottom">
                              <template #activator="{ props }">
                                <div
                                  class="FontSize"
                                  v-show="
                                    n.respectiveValue != 'N/A' &&
                                    n.respectiveValue != ''
                                  "
                                  v-bind="props"
                                >
                                  <b
                                    >:
                                    {{
                                      +n.respectiveValue
                                        .split("/")
                                        .pop()
                                        .split("?")[0].length >= 20
                                        ? n.respectiveValue
                                            .split("/")
                                            .pop()
                                            .split("?")[0]
                                            .substr(0, 20) + "..."
                                        : n.respectiveValue
                                            .split("/")
                                            .pop()
                                            .split("?")[0]
                                    }}
                                  </b>
                                  <v-icon
                                    dense
                                    v-show="
                                      n.respectiveValue != 'N/A' &&
                                      n.respectiveValue != ''
                                    "
                                    color="primaryColor"
                                    class="ml-1"
                                    @click="downloadlist(n)"
                                  >
                                    mdi-download</v-icon
                                  >
                                </div>
                                <div
                                  class="FontSize"
                                  v-show="n.respectiveValue == ''"
                                >
                                  <b>: {{ "N/A" }}</b>
                                </div>
                              </template>
                              <div class="textWrap" style="max-width: 250px">
                                {{
                                  n.respectiveValue
                                    .split("/")
                                    .pop()
                                    .split("?")[0]
                                }}
                              </div>
                            </v-tooltip>
                          </div>
                        </div>
                        <div v-if="n.data_type == 'gallery'">
                          <b> : </b>
                          <v-carousel
                            v-model="model1"
                            height="auto"
                            hide-delimiters
                            :show-arrows="false"
                            v-if="n.input_array_value.length == 1"
                          >
                            <v-carousel-item
                              v-for="images1 in n.input_array_value"
                              :key="images1"
                            >
                              <v-img
                                height="150"
                                :src="s3convert(images1.type)"
                                contain
                              ></v-img>
                            </v-carousel-item>
                          </v-carousel>
                          <v-carousel
                            v-model="model2"
                            height="auto"
                            hide-delimiters
                            v-else
                          >
                            <v-carousel-item
                              v-for="images1 in n.input_array_value"
                              :key="images1"
                            >
                              <v-img
                                height="150"
                                :src="s3convert(images1.type)"
                                contain
                              ></v-img>
                            </v-carousel-item>
                          </v-carousel>
                        </div>
                        <div
                          class="text-left FontSize"
                          v-else-if="
                            n.data_type != 'gallery' && n.data_type != 'media'
                          "
                        >
                          <b>
                            {{
                              n.key == "epoch"
                                ? ":" + " " + fetch_time(n.respectiveValue)
                                : n.respectiveValue == ""
                                ? ":" + " " + "N/A"
                                : ":" + " " + "fffff"
                            }}</b
                          >
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-divider v-show="formuniqueType == 'DIRECTORY_EDIT_ENTRY_FORM'" />
            <v-card-text class="mt-n3">
              <div
                class="subFont"
                v-show="formuniqueType == 'DIRECTORY_EDIT_ENTRY_FORM'"
              >
                New Entry
              </div>
              <!-- v-show="formuniqueType != 'DIRECTORY_ACCESS_FORM'" -->
              <div>
                <v-form ref="form1">
                  <v-row
                    v-for="(n, idx) in formTemplate"
                    :key="idx"
                    no-gutters
                    class="mt-2"
                  >
                    <v-col cols="12" v-if="n.data_type == 'label'">
                      <div class="text-left font-weight-bold FontSize">
                        {{ n.display_label }}
                      </div>
                    </v-col>
                    <v-col cols="12" v-else>
                      <v-row>
                        <v-col class="" cols="5">
                          <div
                            v-if="n.display_label != 'Attachment Media'"
                            class="text-left font-weight-bold FontSize"
                          >
                            {{ n.display_label }}
                          </div>
                        </v-col>
                        <v-col
                          v-show="
                            n.key !== 'prfl_pic_s3_key' &&
                            n.key !== 'media_keys'
                          "
                          cols="7"
                        >
                          <div
                            class="text-left FontSize"
                            v-if="n.data_type == 'media'"
                          >
                            <div v-show="n.respectiveValue == 'N/A'">
                              <b>
                                {{
                                  n.key == "epoch"
                                    ? ":" + " " + fetch_time(n.respectiveValue)
                                    : ":" + " " + fetch_data(n)
                                }}</b
                              >
                            </div>
                            <div>
                              <v-tooltip location="bottom">
                                <template #activator="{ props }">
                                  <div
                                    class="FontSize"
                                    v-show="
                                      n.respectiveValue != 'N/A' &&
                                      n.respectiveValue != ''
                                    "
                                    v-bind="props"
                                  >
                                    <b
                                      >:
                                      {{
                                        +n.respectiveValue
                                          .split("/")
                                          .pop()
                                          .split("?")[0].length >= 20
                                          ? n.respectiveValue
                                              .split("/")
                                              .pop()
                                              .split("?")[0]
                                              .substr(0, 20) + "..."
                                          : n.respectiveValue
                                              .split("/")
                                              .pop()
                                              .split("?")[0]
                                      }}
                                    </b>
                                    <v-icon
                                      dense
                                      v-show="
                                        n.respectiveValue != 'N/A' &&
                                        n.respectiveValue != ''
                                      "
                                      color="primaryColor"
                                      class="ml-1"
                                      @click="downloadlist(n)"
                                    >
                                      mdi-download</v-icon
                                    >
                                  </div>
                                  <div
                                    class="FontSize"
                                    v-show="n.respectiveValue == ''"
                                  >
                                    <b>: {{ "N/A" }}</b>
                                  </div>
                                </template>
                                <div
                                  class="textWrap FontSize"
                                  style="max-width: 250px"
                                >
                                  {{
                                    n.respectiveValue
                                      .split("/")
                                      .pop()
                                      .split("?")[0]
                                  }}
                                </div>
                              </v-tooltip>
                            </div>
                          </div>
                          <div v-if="n.data_type == 'gallery'">
                            <b> : </b>
                            <v-carousel
                              v-model="model1"
                              height="auto"
                              hide-delimiters
                              :show-arrows="false"
                              v-if="n.input_array_value.length == 1"
                            >
                              <v-carousel-item
                                v-for="images1 in n.input_array_value"
                                :key="images1"
                              >
                                <v-img
                                  height="150"
                                  :src="s3convert(images1.type)"
                                  contain
                                ></v-img>
                              </v-carousel-item>
                            </v-carousel>
                            <v-carousel
                              v-model="model2"
                              height="auto"
                              hide-delimiters
                              v-else
                            >
                              <v-carousel-item
                                v-for="images1 in n.input_array_value"
                                :key="images1"
                              >
                                <v-img
                                  height="150"
                                  :src="s3convert(images1.type)"
                                  contain
                                ></v-img>
                              </v-carousel-item>
                            </v-carousel>
                          </div>
                          <div
                            class="text-left FontSize"
                            v-else-if="
                              n.data_type != 'gallery' && n.data_type != 'media'
                            "
                          >
                            <b>
                              {{
                                n.key == "epoch"
                                  ? ":" + " " + fetch_time(n.respectiveValue)
                                  : ":" + " " + fetch_data(n)
                              }}</b
                            >
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row v-if="formAction == 'Pending'">
                    <v-col cols="12">
                      <v-textarea
                        density="compact"
                        label="Comments"
                        variant="outlined"
                        rows="0"
                        auto-grow
                        v-model="approvalComments"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </div>
            </v-card-text>
            <!-- <v-card-text v-show="formuniqueType == 'DIRECTORY_ACCESS_FORM'">
              {{ this.formDetails.workflow_payload.Message }}
            </v-card-text> -->
          </v-col>
          <v-divider
            class="mt-n3"
            vertical
            v-if="
              formAction == 'Submited' ||
              formAction == 'ALL' ||
              formAction == 'Pending'
            "
          />
          <v-col v-if="formDetails.approval_status == 'WITHDRAWN'" cols="5">
            <v-card-text>
              Workflow is withdrawn by {{ formDetails.workflow_initiated_by }}
            </v-card-text>
          </v-col>
          <v-col v-else cols="5">
            <v-card-title
              class="mt-n2 subFont"
              v-if="
                formAction == 'Submited' ||
                formAction == 'ALL' ||
                formAction == 'Pending'
              "
              >Approval History</v-card-title
            >
            <v-divider class="mt-n2" />
            <v-card-text
              class="mt-n2"
              v-if="
                formAction == 'Submited' ||
                formAction == 'ALL' ||
                formAction == 'Pending'
              "
            >
              <v-list-item dense class="ml-3">
                <template #prepend>
                  <v-avatar>
                    <v-icon color="green" dark> mdi-cog </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="red-text">Start </v-list-item-title>
              </v-list-item>
              <v-timeline density="compact">
                <v-timeline-item
                  class="text-left FontSize"
                  size="small"
                  v-for="(n, idx) in approvalFlowHistory"
                  :key="idx"
                  :dot-color="getItemColor(n)"
                >
                  <span class="FontSize">
                    <b> {{ n.user_name }}</b></span
                  >
                  <br />
                  {{
                    n.approval_status == "INPROGRESS"
                      ? "(PENDING ON)"
                      : "(" + n.approval_status + ")"
                  }}
                  <br />
                  {{ fetch_steps_flow_data(n) }}
                  <br />
                  <!-- {{ "(" + n.approval_status  + ")" }} <br /> -->
                  <div class="FontSize" v-if="n.comments != undefined">
                    <b>Comments :</b>
                    <br />
                    <span class="FontSize"> {{ n.comments }} </span>
                  </div>
                </v-timeline-item>
              </v-timeline>
              <v-list-item dense class="ml-3">
                <template #prepend>
                  <v-avatar>
                    <v-icon color="red" dark> mdi-cog </v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="red-text">Stop </v-list-item-title>
              </v-list-item>
            </v-card-text>
          </v-col>
        </v-row>

        <v-card-actions
          class="justify-end"
          v-if="
            formAction == 'Submited' &&
            formDetails.approval_status != 'WITHDRAWN'
          "
        >
          <v-btn
            v-if="withdrawCheck == true"
            dark
            @click="approve_action('WITHDRAWN')"
            :loading="loading"
            color="#ef3f6e"
            class="text-capitalize ml-1 mt-n6"
            >Withdraw</v-btn
          >
        </v-card-actions>
        <v-card-actions v-if="formAction == 'Pending'" class="justify-end">
          <v-btn
            dark
            @click="validate_aprrovals('APPROVED')"
            :loading="loading"
            color="#4747fe"
            class="text-capitalize ml-2 mt-n6"
            >Approve</v-btn
          >
          <v-btn
            dark
            @click="reject_workflow('REJECTED')"
            :loading="loading1"
            color="red"
            class="text-capitalize ml-1 mt-n6"
            >Reject</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <ViewProfile
        :viewProfilePic="viewProfilePic"
        :rowInfoData="rowInfoData"
        @clicked="viewProfilePic = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { workflow_appr_rej } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewProfile from "@/components/FormFields/ViewProfile.vue";
const FileSaver = require("file-saver");
import axios from "axios";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

var AWS = require("aws-sdk");
export default {
  mixins: [
    get_all_org_users,
    // update_audit_logs
  ],
  components: {
    ViewProfile,
  },

  props: {
    directoryApprovalsDialog: Boolean,
    formDetails: Object,
    formAction: String,
    rowInfo: Object,
  },
  data() {
    return {
      formTemplate: [],
      model2: false,
      model1: false,
      loading1: false,
      forwardAction: false,
      forwardList: [],
      forwardUser: "",
      loading: false,
      search: "",
      approvalComments: "",
      loading2: false,
      approvalAction: false,
      componentCheck: 0,
      viewProfilePic: false,
      rowInfoData: {},
      withdrawCheck: false,
      currentStep: null,
      formuniqueType: {},
      oldTemplate: [],
      newfromtemplate: [],
      initiatedUser: "",
      approvalFlowHistory: [],
      previousApprovedata: null,
    };
  },
  watch: {
    directoryApprovalsDialog: {
      async handler() {
        if (this.directoryApprovalsDialog == true) {
          this.initiatedUser = localStorage.getItem("initiatedBy");
          this.approvalFlowHistory = [];
          this.fetch_approval_history();
          this.formuniqueType = this.formDetails.form_unique_type;
          this.formTemplate = [];
          this.forwardAction = false;
          this.approvalAction = false;
          this.oldTemplate = [];
          this.find_current_step();
          this.fetch_pending_data(
            this.formDetails.workflow_payload,
            "new_data"
          );
          this.fetch_directory_payload();

          if (this.formAction == "Submited") {
            this.get_action_info();
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_data(val) {
      if (val.data_type == "date") {
        return formatdisplayDate(val.respectiveValue);
      }
      return val.respectiveValue;
    },

    fetch_approval_history() {
      this.approvalFlowHistory = this.formDetails.approval_user_list || [];
      const initiatedData = {
        approval_status: "INITIATED BY",
        user_name: this.initiatedUser,
        workflow_approval_on: this.rowInfo.workflow_initiated_on,
        step_no: 0,
      };
      const alreadyExists = this.approvalFlowHistory.some(
        (item) =>
          item.user_name === this.initiatedUser &&
          item.approval_status === "INITIATED BY"
      );
      if (!alreadyExists) {
        this.approvalFlowHistory.unshift(initiatedData);
      }
      this.approvalFlowHistory = this.approvalFlowHistory.map((element) => {
        if (element.workflow_approval_on) {
          return {
            ...element,
            formattedApprovalDate: this.fetch_org_format(
              element.workflow_approval_on
            ),
          };
        }
        return element;
      });
    },

    fetch_org_format(val) {
      return format_Date(val);
    },
    fetch_steps_flow_data(val) {
      // console.log(val, this.currentStep);
      var data1 = "";
      if (val.approval_status == "INITIATED BY") {
        data1 = "Initialted on " + "(" + val.formattedApprovalDate + ")";
        this.previousApprovedata = val.workflow_approval_on;
      }
      // else if (
      //   val.approval_status == "INPROGRESS" &&
      //   val.step_no === this.currentStep
      // ) {
      //   data1 =
      //     "Pending since" +
      //     "(" +
      //     this.calculateDaysFromEpoch(this.previousApprovedata) +
      //     ")";
      //   // this.calculateDaysFromEpoch(this.rowInfo.workflow_initiated_on) +
      // }
      else if (val.approval_status == "APPROVED") {
        data1 = "Approved On" + "(" + val.formattedApprovalDate + ")";
        this.previousApprovedata = val.workflow_approval_on;
      }
      return data1;
    },
    calculateDaysFromEpoch(epochTimestamp) {
      // Convert the epoch timestamp to a Date object
      const epochDate = new Date(epochTimestamp * 1000); // Convert seconds to milliseconds

      // Get the current date
      const currentDate = new Date();

      // Calculate the difference in time (in milliseconds)
      const differenceInTime = currentDate - epochDate;

      // Convert the difference from milliseconds to days
      const differenceInDays = Math.floor(
        differenceInTime / (1000 * 60 * 60 * 24)
      );

      return differenceInDays + " " + "days";
    },
    s3convert(urls) {
      // console.log(urls);
      var response = this.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "workflow/" + urls.split("workflow/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      // var array = [];
      // array.unshift(url);
      // console.log(url);
      return url;
    },
    async downloadlist(url) {
      // console.log(url);
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(
        url.respectiveValue,
        details.s3_details
      );
      if (signedUrl) {
        this.dwonload_pdf(
          signedUrl,
          `${signedUrl.split("/").pop().split("?")[0]}`
        );
      }
      // var data = this.$store.getters.GetOrgDetails;

      // const s3 = new AWS.S3({
      //   region: data.s3_details.region,
      //   accessKeyId: data.s3_details.access_key,
      //   secretAccessKey: data.s3_details.secret_key,
      // });
      // const params = {
      //   Bucket: data.s3_details.bucket_name,
      //   Key:
      //     url.key == "broadcast_media_url"
      //       ? "broadcast/" + url.respectiveValue.split("broadcast/")[1]
      //       : "workflow/" + url.respectiveValue.split("workflow/")[1],
      //   Expires: 3600,
      // };

      // const imageElement = s3.getSignedUrl("getObject", params);

      // this.dwonload_pdf(
      //   imageElement,
      //   `${imageElement.split("/").pop().split("?")[0]}`
      // );
    },

    fetch_time(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;
      var time = new Date(val);
      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
      return concatDateTime;
    },

    close_dialog() {
      this.approvalComments = "";
      this.forwardUser = "";
      this.withdrawCheck = false;
      this.approvalFlowHistory = [];

      this.$emit("clicked", 0);
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.forwardList.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
          });
        }
      });
      this.forwardList.sort((a, b) =>
        a.full_user_name.localeCompare(b.full_user_name)
      );
    },

    checkImageExtension(value) {
      return (
        value.endsWith(".img") ||
        value.endsWith(".png") ||
        value.endsWith(".jpeg") ||
        value.endsWith(".jpg")
      );
    },

    find_current_step() {
      // console.log(this.formDetails.approval_user_list);
      var filteredArray = [];
      this.formDetails.approval_user_list.sort(function (a, b) {
        return a.step_no - b.step_no;
      });
      var rejectedIndex = this.formDetails.approval_user_list.findIndex(
        (obj) => obj.approval_status === "REJECTED"
      );

      this.formDetails.approval_user_list.filter(
        (obj, index) => index <= rejectedIndex
      );
      // console.log(this.formDetails.approval_user_list);
      const completedItem = this.formDetails.approval_user_list.find(
        (item) => item.approval_status === "INPROGRESS"
      );

      if (completedItem) {
        this.currentStep = completedItem.step_no;
      }

      for (var i = 0; i < this.formDetails.approval_user_list.length; i++) {
        filteredArray.push(this.formDetails.approval_user_list[i]);

        if (
          this.formDetails.approval_user_list[i].approval_status === "REJECTED"
        ) {
          // If so, break out of the loop
          break;
        }
      }
      this.formDetails.approval_user_list = filteredArray;
    },

    getItemColor(item) {
      if (
        item.approval_status === "INPROGRESS" &&
        item.step_no === this.currentStep
      ) {
        return "orange"; // Color for completed items at the current step
      } else if (item.approval_status === "APPROVED") {
        return "green"; // Color for items in progress
      } else if (item.approval_status === "INITIATED BY") {
        return "blue"; // Color for items in progress
      } else if (item.approval_status === "REJECTED") {
        return "red"; // Color for items in progress
      } else {
        return "white"; // Default color for other items
      }
    },

    fetch_value(val) {
      if (val == undefined) {
        return "N/A";
      } else {
        const d = new Date(parseInt(val) * 1000);
        var date = d.getDate().toLocaleString();
        var month = (d.getMonth() + 1).toLocaleString();
        var year = d.getFullYear();

        return (
          (+date <= 9 ? "0" + date : date) +
          "/" +
          (+month <= 9 ? "0" + month : month) +
          "/" +
          year
        );
      }
    },

    get_action_info() {
      var dataCheck = this.formDetails.approval_user_list.every(
        (obj) => obj.approval_status === "INPROGRESS"
      );
      if (dataCheck) {
        this.withdrawCheck = true;
      }
    },

    getImageSrc(val, rowData) {
      var data = this.$store.getters.GetOrgDetails;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,
        Key: "workflow/" + rowData.respectiveValue.split("workflow/")[1],
        Expires: 3600,
      };

      const presignedUrl = s3.getSignedUrl("getObject", params);

      if (val == "image") {
        return presignedUrl;
      } else {
        this.dwonload_pdf(
          presignedUrl,
          `${
            rowData.respectiveValue
              .substring(rowData.respectiveValue.lastIndexOf("/") + 1)
              .split("__")[1]
          }.pdf`
        );
        // window.open(presignedUrl, "_blank");
      }
    },

    async dwonload_pdf(url, fileName) {
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          // Create a blob from the response
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },

    download_image(val, n) {
      var data = this.$store.getters.GetOrgDetails;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,
        Key: "workflow/" + n.respectiveValue.split("workflow/")[1],
        Expires: 3600,
      };

      const imageElement = s3.getSignedUrl("getObject", params);

      var data = imageElement;
      const imageUrl = imageElement;
      // console.log(imageUrl);
      // Fetch the image
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "downloaded-image.jpg"; // Specify the filename for the download
          a.style.display = "none";

          document.body.appendChild(a);
          a.click();

          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch((error) => {
          // console.error("Error downloading image:", error);
        });
    },

    get_name(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },

    fetch_pending_data(payloadData, payloodtype) {
      this.newfromtemplate = [];
      this.newfromtemplate = this.formDetails.workflow_template.map((obj) => {
        const newObj = { ...obj };

        const correspondingKey = newObj.key;
        const correspondingValue = payloadData[correspondingKey];

        if (correspondingValue !== undefined) {
          newObj.respectiveValue = correspondingValue;
        } else {
          newObj.respectiveValue = "";
        }

        return newObj;
      });

      const replacedArray = this.newfromtemplate.map((obj) => ({
        ...obj,
        respectiveValue:
          obj.respectiveValue !== undefined ? obj.respectiveValue : "N/A",
      }));
      if (payloodtype == "old_data") {
        this.oldTemplate = replacedArray;
      } else {
        if (
          this.formuniqueType == "DIRECTORY_ADD_ENTRY_FORM" &&
          this.formDetails.workflow_initiated_by == "EXTERNAL USER"
        ) {
          var modifedvalue = replacedArray;

          this.formTemplate = modifedvalue.filter(
            (item) => item.hide_on_creation === false
          );
        } else {
          this.formTemplate = replacedArray;
        }
      }
    },

    fetch_directory_payload() {
      if (this.formuniqueType == "DIRECTORY_EDIT_ENTRY_FORM") {
        this.fetch_pending_data(this.formDetails.entry_old_payload, "old_data");
        this.fetch_updated_payload();
      }
    },

    fetch_updated_payload() {
      var array1 = this.oldTemplate;
      var array2 = this.formTemplate;
      var differences = [];
      for (let i = 0; i < array1.length; i++) {
        // Compare respective values
        if (array1[i].respectiveValue !== array2[i].respectiveValue) {
          differences.push(array2[i]);
        }
      }
      this.formTemplate = differences;
    },

    reject_workflow(val) {
      if (this.approvalComments.trim().length != 0) {
        this.approve_action(val);
      } else {
        this.$emit("popupmessage", 0);
      }
    },

    validate_aprrovals(val) {
      this.approvalAction = false;
      this.approve_action(val);
    },

    async approve_action(val) {
      if (val == "REJECTED") {
        this.loading1 = true;
      } else {
        this.loading = true;
      }
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(workflow_appr_rej, {
            input: {
              user_email_id: data.user.user_email_id,
              initiate_id: this.formDetails.initiate_id,
              approval_status: val,
              workflow_payload: JSON.stringify(
                this.formDetails.workflow_payload
              ),
              comments: this.approvalComments,
              forward_user_email_id:
                val == "FORWARD" ? this.forwardUser : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.workflow_appr_rej);
        this.loading = false;
        this.loading1 = false;
        if (response.Status == "SUCCESS") {
          this.approvalFlowHistory = [];
          this.$emit("successMsg", response.Message);
          this.approvalComments = "";
          this.forwardUser = "";
          // this.formCheck = false;
        } else {
          this.loading = false;
          this.loading1 = false;
          // this.formCheck = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
        this.loading1 = false;
        this.approvalFlowHistory = [];
      }
    },

    back_data() {
      this.forwardUser = "";
      this.forwardAction = false;
    },
  },
};
</script>
<style scoped>
</style>

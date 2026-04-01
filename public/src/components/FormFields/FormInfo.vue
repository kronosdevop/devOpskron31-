<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="submittedInfo"
      @update:model-value="$emit('clicked', false)"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="overflow-hidden">
        <v-toolbar
          v-if="forwardAction == false"
          elevation="0"
          dark
          dense
          class="navBar"
        >
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              {{ formDetails.workflow_name }} (
              {{ formDetails.transaction_id }} )
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-toolbar
          v-if="forwardAction == true"
          elevation="0"
          dark
          dense
          class="navBar"
        >
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">
              {{ formDetails.workflow_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="back_data()"
            >mdi-arrow-left-bold</v-icon
          >
        </v-toolbar>
        <v-card-text class="scrollable-content">
          <v-row no-gutters>
            <v-col cols="7">
              <v-card-title class="mt-n2 subFont" v-if="forwardAction == false">
                {{
                  "Initiated By" + " " + "-" + " " + initiatedUser
                }}</v-card-title
              >
              <!-- <v-card-title class="mt-n2 subFont" v-if="forwardAction == false"
              >Approval Details</v-card-title
            > -->
              <v-divider class="mt-n2" />
              <v-card-text v-if="forwardAction == false" class="mt-n3">
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
                        <v-col
                          class=""
                          cols="12"
                          v-if="isFirstInSection(n.section)"
                        >
                          <div class="text-left font-weight-bold FontSize">
                            {{ n.section }}
                          </div>
                        </v-col>
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
                                <template v-slot:activator="{ props }">
                                  <div
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
                                      density="compact"
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

                              <!-- {{
                            n.respectiveValue == "N/A"
                              ? n.respectiveValue
                              : n.respectiveValue == ""
                              ? "N/A"
                              : n.respectiveValue.split("/").pop().split("?")[0]
                          }}</b
                        > -->
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
                                v-for="images1 in imageregularUrl"
                                :key="images1"
                              >
                                <v-img
                                  height="150"
                                  :src="images1"
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
                                v-for="images1 in imageregularUrl"
                                :key="images1"
                              >
                                <v-img
                                  height="150"
                                  :src="images1"
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
                                  : ":" + " " + fetch_data(n)
                              }}</b
                            >
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row
                    v-if="formAction == 'Pending' && forwardAction == false"
                  >
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
                  <v-toolbar
                    v-if="
                      formDetails.attachments_keys.length < 5 &&
                      geoenable == false
                    "
                    density="compact"
                    class="rounded elevation-1 FontSize"
                    v-show="
                      formDetails.workflow_type == 'CUSTOM_FLOWS' &&
                      formAction == 'Pending'
                    "
                    ><b> Add Attachments</b> <v-spacer />
                    <input
                      type="file"
                      ref="fileInput"
                      @change="handleFileChange"
                      style="display: none"
                      accept="image/*,application/pdf"
                    />
                    <v-btn
                      v-show="
                        signimagesarrayurls.length +
                          formDetails.attachments_keys.length <
                        5
                      "
                      elevation="0"
                      class="text-capitalize cardCss"
                      @click="$refs.fileInput.click()"
                      size="small"
                      :loading="uploadload"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-row
                    v-show="
                      formDetails.workflow_type == 'CUSTOM_FLOWS' &&
                      formAction == 'Pending'
                    "
                  >
                    <v-col cols="12">
                      <v-row>
                        <v-col cols="12">
                          <div
                            class="mt-2"
                            v-if="signimagesarrayurls.length > 0"
                            v-show="
                              signimagesarrayurls.length +
                                formDetails.attachments_keys.length -
                                5 !=
                              0
                            "
                          >
                            Max
                            {{
                              signimagesarrayurls.length +
                              formDetails.attachments_keys.length -
                              5
                            }}
                            Attachments
                          </div>
                          <v-card
                            class="mt-5 ma-2 rounded-lg elevation-1"
                            v-for="(signimagesarrayurls, index) in converteUrl"
                            :key="index"
                          >
                            <v-row class="pa-5">
                              <v-col
                                :cols="
                                  displayPDFFileName(
                                    signimagesarrayurls.substring(
                                      signimagesarrayurls.lastIndexOf('/') + 1,
                                      signimagesarrayurls.indexOf('?') !== -1
                                        ? signimagesarrayurls.indexOf('?')
                                        : undefined
                                    )
                                  ) == true
                                    ? '5'
                                    : '10'
                                "
                              >
                                <div>
                                  {{
                                    signimagesarrayurls.substring(
                                      signimagesarrayurls.lastIndexOf("/") + 1,
                                      signimagesarrayurls.indexOf("?") !== -1
                                        ? signimagesarrayurls.indexOf("?")
                                        : undefined
                                    )
                                  }}
                                </div>
                              </v-col>
                              <v-col
                                cols="5"
                                v-show="
                                  displayPDFFileName(
                                    signimagesarrayurls.substring(
                                      signimagesarrayurls.lastIndexOf('/') + 1,
                                      signimagesarrayurls.indexOf('?') !== -1
                                        ? signimagesarrayurls.indexOf('?')
                                        : undefined
                                    )
                                  ) == true
                                "
                              >
                                <v-img
                                  max-height="80"
                                  contain
                                  :src="signimagesarrayurls"
                                  v-if="signimagesarrayurls.length > 1"
                                >
                                </v-img>
                              </v-col>
                              <v-col cols="2">
                                <v-btn
                                  icon
                                  @click="
                                    delete_item(signimagesarrayurls, index)
                                  "
                                >
                                  <v-icon color="red">mdi-delete</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-col>
            <v-divider
              class="mt-n3"
              vertical
              v-if="
                forwardAction == false &&
                (formAction == 'Submited' ||
                  formAction == 'ALL' ||
                  formAction == 'Pending')
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
                  forwardAction == false &&
                  (formAction == 'Submited' ||
                    formAction == 'ALL' ||
                    formAction == 'Pending')
                "
                >Approval History</v-card-title
              >
              <v-divider class="mt-n2" />
              <v-card-text
                class="mt-n2"
                v-if="
                  forwardAction == false &&
                  (formAction == 'Submited' ||
                    formAction == 'ALL' ||
                    formAction == 'Pending')
                "
              >
                <v-list-item density="compact" class="ml-3">
                  <v-list-item-avatar>
                    <v-icon color="green" dark> mdi-cog </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="red-text"
                      >Start
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-timeline density="compact" class="ml-6">
                  <v-timeline-item
                    class="text-left FontSize"
                    size="small"
                    v-for="(n, idx) in approvalFlowHistory"
                    :key="idx"
                    :dot-color="getItemColor(n)"
                  >
                    <b> {{ n.user_name }}</b>
                    <br />
                    {{
                      n.approval_status == "INPROGRESS"
                        ? "(PENDING ON)"
                        : "(" + n.approval_status + ")"
                    }}
                    <br />
                    {{ fetch_steps_flow_data(n) }}
                    <br />
                    <div v-if="n.comments != undefined">
                      <b>Comments :</b>
                      <br />
                      <span> {{ n.comments }} </span>
                    </div>
                  </v-timeline-item>
                </v-timeline>
                <v-list-item density="compact" class="ml-3">
                  <v-list-item-avatar>
                    <v-icon color="red" dark> mdi-cog </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="red-text"
                      >Stop
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-card-text>
              <div
                v-if="
                  formDetails.attachments_keys != undefined &&
                  forwardAction == false
                "
              >
                <v-divider
                  v-if="formDetails.attachments_keys.length != 0"
                ></v-divider>
                <v-card-title
                  class="subFont"
                  v-if="formDetails.attachments_keys.length != 0"
                  >Uploaded Attachments</v-card-title
                >
                <v-divider
                  class="mt-n2"
                  v-if="formDetails.attachments_keys.length != 0"
                />
                <v-card-text v-if="formDetails.attachments_keys.length != 0">
                  <div
                    v-for="(url, index) in formDetails.attachments_keys"
                    :key="index"
                  >
                    <v-row class="pa-3 ml-4">
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <div v-if="url" v-bind="props">
                            {{
                              +url.split("/").pop().split("?")[0].length >= 30
                                ? url
                                    .split("/")
                                    .pop()
                                    .split("?")[0]
                                    .substr(0, 30) + "..."
                                : url.split("/").pop().split("?")[0]
                            }}
                          </div>
                          <div v-else>-</div>
                        </template>
                        <div class="textWrap" style="max-width: 250px">
                          {{ url.split("/").pop().split("?")[0] }}
                        </div>
                      </v-tooltip>

                      <v-icon
                        color="primaryColor"
                        class="ml-1"
                        @click="downloadimage(url)"
                      >
                        mdi-download</v-icon
                      >
                    </v-row>
                  </div>
                </v-card-text>
              </div>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="5">
              <div v-for="(n, idx) in formTemplate" :key="idx">
                <div v-if="n.key == 'prfl_pic_s3_key' || n.key == 'media_keys'">
                  <v-card-title
                    class="mt-n2 subFont"
                    v-if="n.respectiveValue != 'N/A' && n.respectiveValue != ''"
                    >Attachment Files</v-card-title
                  >
                  <!-- <div class="text-left ml-2 mt-2" v-if="n.respectiveValue != 'N/A'>
                  <b> Attachment Files</b>
                </div> -->
                  <v-card-text v-if="n.key == 'prfl_pic_s3_key'" class="mt-4">
                    <v-img
                      height="200"
                      contain
                      :src="n.respectiveValue"
                    ></v-img>
                  </v-card-text>
                  <v-card-text v-else>
                    <template v-if="checkImageExtension(n.respectiveValue)">
                      <v-toolbar density="compact" flat class="bg-white">
                        <v-btn
                          @click="zoom_in"
                          size="x-small"
                          class="ml-4"
                          fab
                          dark
                          color="primary"
                        >
                          <v-icon dark> mdi-plus </v-icon>
                        </v-btn>
                        <v-btn
                          @click="zoom_out"
                          size="x-small"
                          class="ml-1"
                          fab
                          dark
                          color="primary"
                        >
                          <v-icon dark> mdi-minus </v-icon>
                        </v-btn>
                      </v-toolbar>
                      <v-img
                        height="200"
                        ref="printImage"
                        :style="{ width: zoomLevel + 'px', height: 'auto' }"
                        contain
                        :src="n.signedUrl"
                      ></v-img>

                      <v-row v-if="n.respectiveValue != 'N/A'" no-gutters>
                        <div class="text-left">
                          <v-icon
                            @click="getImageSrc('image', n)"
                            color="primaryColor"
                            class="mt-2"
                            left
                          >
                            mdi-download</v-icon
                          >
                          <v-icon
                            color="primaryColor"
                            @click="print_image(n)"
                            class="mt-2 ml-4"
                            left
                            >mdi-printer</v-icon
                          >
                        </div>
                      </v-row>
                    </template>
                    <template v-else>
                      <v-row class="mt-4">
                        <v-col cols="6">
                          {{
                            n.respectiveValue
                              .substring(n.respectiveValue.lastIndexOf("/") + 1)
                              .split("__")[1]
                          }}
                        </v-col>
                        <v-col cols="6">
                          <v-icon
                            class=""
                            @click="getImageSrc('file', n)"
                            v-if="
                              n.respectiveValue != 'N/A' &&
                              n.respectiveValue != ''
                            "
                            color="primaryColor"
                            >mdi-download</v-icon
                          >
                        </v-col>
                      </v-row>
                    </template>
                  </v-card-text>
                </div>
              </div>
            </v-col>
          </v-row>
          <v-card-text v-if="forwardAction == true" class="mt-4">
            <v-form ref="form1">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-autocomplete
                    label="Select User"
                    :rules="[(v) => !!v || 'Required']"
                    item-title="full_user_name"
                    item-value="user_email_id"
                    :items="forwardList"
                    v-model="forwardUser"
                    density="compact"
                    variant="outlined"
                    :menu-props="{ maxHeight: 200 }"
                    return-object
                    clearable
                    hide-no-data
                    placeholder="Start typing to search users..."
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    density="compact"
                    label="Comments"
                    :rules="[(v) => !!v || 'Required']"
                    variant="outlined"
                    rows="0"
                    auto-grow
                    v-model="approvalComments"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card-text>

        <v-card-actions v-if="forwardAction == true" class="justify-end">
          <v-btn
            @click="validate_aprrovals('FORWARD')"
            :loading="loading"
            class="text-capitalize ml-1 mt-n6 cardCss"
            >Submit</v-btn
          >
        </v-card-actions>
        <v-card-actions
          class="justify-end"
          v-if="
            forwardAction == false &&
            formAction == 'Submited' &&
            formDetails.approval_status != 'WITHDRAWN'
          "
        >
          <v-btn
            v-if="withdrawCheck == true"
            @click="approve_action('WITHDRAWN')"
            :loading="loading"
            class="text-capitalize ml-1 mt-n6 cardCss"
            >Withdraw</v-btn
          >
        </v-card-actions>
        <v-card-actions
          v-if="
            formAction == 'Pending' &&
            forwardAction == false &&
            geoenable == false
          "
          class="justify-end mt-2"
        >
          <v-btn
            @click="validate_aprrovals('APPROVED')"
            :loading="loading"
            class="text-capitalize ml-2 mt-n6 "
            color="#008000"
            variant="flat"
            >Approve</v-btn
          >
          <v-btn
            @click="reject_workflow('REJECTED')"
            :loading="loading1"
            color="red"
            variant="flat"
            class="text-capitalize ml-1 mt-n6"
            >Reject</v-btn
          >
          <v-btn
            v-if="
              approvestep.action_buttons != 'approveReject' &&
              approvestep.action_buttons != 'approveRejectRestart'
            "
            @click="forward_data()"
            :loading="forwardLoading"
            class="text-capitalize ml-1 mt-n6 "
            color="secondary"
            variant="flat"
            >Forward</v-btn
          >

          <v-btn
            v-if="
              approvestep.action_buttons == 'approveRejectRestart' ||
              approvestep.action_buttons == 'approveRejectForwardRestart'
            "
            @click="restart_data()"
            color="#FB8C00"
            variant="flat"
            :loading="restartLoading"
            class="text-capitalize ml-1 mt-n6"
            >Restart</v-btn
          >
        </v-card-actions>

        <v-card-actions
          v-if="
            formAction == 'Pending' &&
            forwardAction == false &&
            geoenable == true
          "
          class="justify-end"
        >
          <v-btn class="text-capitalize cardCss">
            Action From Mobile Only</v-btn
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
import { workflow_appr_rej, restart_workflow } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation, Auth } from "aws-amplify";
import ViewProfile from "@/components/FormFields/ViewProfile.vue";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
const FileSaver = require("file-saver");
import axios from "axios";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import { Buffer } from "buffer";
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
    submittedInfo: Boolean,
    formDetails: Object,
    formAction: String,
    rowInfo: Object,
  },
  data() {
    return {
      formTemplate: [],
      geoenable: false,
      model2: false,
      model1: false,
      loading1: false,
      forwardAction: false,
      forwardList: [],
      converteUrl: [],
      forwardUser: "",
      loading: false,
      search: "",
      approvalComments: "",
      loading2: false,
      approvalAction: false,
      restartLoading: false,
      componentCheck: 0,
      viewProfilePic: false,
      rowInfoData: {},
      withdrawCheck: false,
      zoomLevel: 200,
      currentStep: null,
      forwardLoading: false,
      uploadload: false,
      signimagesarrayurls: [],
      attachmentarray: [],
      approvestep: {},
      initiatedUser: "",
      approvalFlowHistory: [],
      previousApprovedata: null,
      imageregularUrl: [],
    };
  },
  watch: {
    submittedInfo: {
      async handler() {
        if (this.submittedInfo == true) {
          this.withdrawCheck = false;
          this.initiatedUser = localStorage.getItem("initiatedBy");
          this.approvalFlowHistory = [];
          this.fetch_approval_history();
          this.formTemplate = [];
          this.forwardAction = false;
          this.approvalAction = false;
          this.find_current_step();
          this.fetch_pending_data();

          if (this.formAction == "Pending") {
            this.attachmentarray = [];
            if (
              this.formDetails.attachments_keys != undefined &&
              this.formDetails.attachments_keys.length != 0
            ) {
              this.attachmentarray.push(...this.formDetails.attachments_keys);
            }
            this.approvestep = this.findFirstInProgress(
              this.formDetails.approval_user_list
            );
            this.geoenable =
              this.approvestep.enable_geoLocation == undefined
                ? false
                : this.approvestep.enable_geoLocation;
          }
          // console.log(this.approvestep);
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
    async restart_data() {
      if (this.approvalComments.trim().length != 0) {
        this.restartLoading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(restart_workflow, {
              input: {
                user_email_id: data.user.user_email_id,
                initiate_id: this.formDetails.initiate_id,
                comments: this.approvalComments,
              },
            })
          );
          this.restartLoading = false;

          var response = JSON.parse(result.data.restart_workflow);
          if (response.Status == "SUCCESS") {
            this.restartLoading = false;
            this.$emit("successMsg", response.Message);
            this.approvalComments = "";
          } else {
            this.restartLoading = false;
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.restartLoading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      } else {
        this.$emit("errorMsg", "Comments is Mandatory");
      }
    },
    isFirstInSection(section) {
      if (!this.seenSections) {
        this.seenSections = new Set();
      }

      if (!this.seenSections.has(section)) {
        this.seenSections.add(section);
        return true;
      }
      return false;
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
      // console.log(this.approvalFlowHistory, " this.approvalFlowHistorybefore");
      this.approvalFlowHistory.sort((a, b) => {
        const aStep = Number(a.step_no || 0);
        const bStep = Number(b.step_no || 0);
        return aStep - bStep;
      });
      // console.log(this.approvalFlowHistory, " this.approvalFlowHistoryafter");
      // this.approvalFlowHistory = this.formDetails.approval_user_list;
      // var data = {
      //   approval_status: "INITIATED BY",
      //   user_name: this.initiatedUser,
      //   workflow_approval_on: this.rowInfo.workflow_initiated_on,
      //   step_no: 0,
      // };

      // this.approvalFlowHistory.unshift(data);
    },
    fetch_org_format(val) {
      return format_Date(val);
    },
    findFirstInProgress(approvalUserList) {
      const inProgressList = approvalUserList.filter(
        (item) => item.approval_status === "INPROGRESS"
      );

      inProgressList.sort((a, b) => a.step_no - b.step_no);

      return inProgressList.length > 0 ? inProgressList[0] : null;
    },

    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }

      return this.arrayurls;
    },
    convertToRegularS3URL(presignedURL) {
      const url = new URL(presignedURL);

      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },
    displayPDFFileName(url) {
      if (url.endsWith(".jpg")) {
        // const filename = url.substring(url.lastIndexOf("/") + 1);
        return true;
      } else if (url.endsWith(".png")) {
        return true;
      } else if (url.endsWith(".jpeg")) {
        return true;
      } else {
        return false;
      }
    },
    async delete_item(val, index) {
      try {
        const matchedurl = this.signimagesarrayurls.find((url) =>
          val.includes(url)
        );

        const baseIndex =
          matchedurl.indexOf("amazonaws.com/") + "amazonaws.com/".length;
        const key = matchedurl.substring(baseIndex);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.signimagesarrayurls.splice(index, 1);
          this.converteUrl.splice(index, 1);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
      // var self = this;
      // var deatils = self.$store.getters.GetOrgDetails;
      // this.delLoading = true;
      // var s3Bucket = new AWS.S3({
      //   region: deatils.s3_details.region,
      //   accessKeyId: deatils.s3_details.access_key,
      //   secretAccessKey: deatils.s3_details.secret_key,
      // });
      // var bucketName = deatils.s3_details.bucket_name;

      // var params = {
      //   Bucket: bucketName,
      //   Key: val,
      // };

      // await s3Bucket.deleteObject(params, function (err, data) {
      //   if (err) {
      //     console.log(err);
      //   } else if (data) {
      //     self.signimagesarrayurls.forEach((element) => {
      //       if (element == val) {
      //         self.signimagesarrayurls.splice(index, 1);
      //       }
      //     });
      //   }
      // });
    },
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },
    async handleFileChange(event) {
      const files = event.target.files[0];
      // Process the selected files
      if (!files) {
        // console.log("No fileData, exiting function");
        return;
      }
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user.user_id;

      const key =
        "workflow" +
        "/" +
        orgDetails.organization.organization_id +
        "/" +
        userId +
        "/" +
        Date.now() +
        "/" +
        this.replaceSpecialCharacters(files.name);
      try {
        const fileUrl = await uploadToS3(files, orgDetails.s3_details, key);
        if (fileUrl) {
          this.signimagesarrayurls.push(fileUrl);
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(fileUrl, details.s3_details);
          if (signedUrl) {
            this.converteUrl.push(signedUrl);
          }
        }
      } catch (err) {
        console.log(err);
      }
      // await this.upload_S3(files[0]);
    },
    // async upload_S3(files) {
    //   this.uploadload = true;
    //   var imageUrl = [];
    //   var newUrl = [];
    //   var baseData = [];
    //   var file = files;
    //   this.uploadload = false;
    //   const fr = new FileReader();
    //   fr.readAsDataURL(file);
    //   fr.addEventListener("load", () => {
    //     imageUrl = fr.result;
    //     newUrl = imageUrl;
    //     newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

    //     baseData.push(newUrl);

    //     this.upload_S3_bucket(baseData[0], file);
    //   });
    // },
    // async upload_S3_bucket(baseData, file) {
    //   this.uploadload = true;
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;

    //   var buf = Buffer.from(baseData, "base64");

    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key:
    //       "workflow" +
    //       "/" +
    //       deatils.organization.organization_id +
    //       "/" +
    //       self.$store.getters.GetUserObj.user.user_id +
    //       "/" +
    //       Date.now() +
    //       "/" +
    //       self.replaceSpecialCharacters(file.name),
    //     Body: buf,
    //     ContentType: file.type,
    //   };
    //   var bucketurl =
    //     "https://" +
    //     bucketName +
    //     ".s3." +
    //     deatils.s3_details.region +
    //     ".amazonaws.com/" +
    //     params.Key;

    //   await s3Bucket.putObject(params, function (err, data) {
    //     if (err) {
    //       this.loading1 = false;
    //     } else if (data) {
    //       bucketurl;
    //       var deatil = self.$store.getters.GetOrgDetails;
    //       self.urls = bucketurl;
    //       self.s3get(deatil);
    //     }

    //     self.contentdocumentFiles = [];
    //   });
    //   this.uploadload = false;
    // },
    // s3get(response) {
    //   var s3Bucket = new AWS.S3({
    //     region: response.s3_details.region,
    //     accessKeyId: response.s3_details.access_key,
    //     secretAccessKey: response.s3_details.secret_key,
    //     signatureVersion: "v4",
    //   });
    //   var params = {
    //     Bucket: response.s3_details.bucket_name,
    //     Key: "workflow/" + this.urls.split("workflow/")[1],
    //     Expires: 60000 * 5,
    //   };
    //   var url = s3Bucket.getSignedUrl("getObject", params);
    //   this.signimagesarrayurls.unshift(url);
    //   //   return url;
    // },
    // s3convert(urls) {
    //   // console.log(urls);
    //   var response = this.$store.getters.GetOrgDetails;
    //   var s3Bucket = new AWS.S3({
    //     region: response.s3_details.region,
    //     accessKeyId: response.s3_details.access_key,
    //     secretAccessKey: response.s3_details.secret_key,
    //     signatureVersion: "v4",
    //   });
    //   var params = {
    //     Bucket: response.s3_details.bucket_name,
    //     Key: "workflow/" + urls.split("workflow/")[1],
    //     Expires: 60000 * 5,
    //   };
    //   var url = s3Bucket.getSignedUrl("getObject", params);
    //   // var array = [];
    //   // array.unshift(url);
    //   // console.log(url);
    //   return url;
    // },
    async downloadlist(url) {
      // alert(2);
      // console.log(url);
      const details = this.$store.getters.GetOrgDetails;
      // console.log("sss", url);
      const signedUrl = await getS3SignedUrl(
        url.respectiveValue,
        details.s3_details
      );
      // console.log(signedUrl, "sss");
      this.dwonload_pdf(
        signedUrl,
        `${signedUrl.split("/").pop().split("?")[0]}`
      );
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
    async downloadimage(url) {
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(url, details.s3_details);
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
      //   Key: "workflow/" + url.split("workflow/")[1],
      //   Expires: 3600,
      // };

      // const imageElement = s3.getSignedUrl("getObject", params);
      // // var extensions = imageElement
      // //   .split("/")
      // //   .pop()
      // //   .split("?")[0]
      // //   .split(".")
      // //   .pop();
      // // console.log(imageElement.split("/").pop().split("?")[0].split(".").pop());
    },
    zoom_in() {
      this.zoomLevel += 20;
    },
    zoom_out() {
      this.zoomLevel -= 20;
    },

    fetch_time(val) {
   
      let timestamp;
      
      // Check if val is already a numeric timestamp
      if (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val))) {
        // It's a numeric timestamp (string of digits or number)
        timestamp = typeof val === 'string' ? parseFloat(val) : Number(val);
        
        // Check if timestamp is in seconds (typically 10 digits) vs milliseconds (13 digits)
        // If timestamp is less than 10000000000 (10 billion), it's likely in seconds
        // This covers timestamps from 1970 to year 2286
        if (timestamp > 0 && timestamp < 10000000000) {
          timestamp = timestamp * 1000;
        }
      } else {
        // It's a date string (like "2025-12-05,5:10 PM" or other formats)
        // Convert the date string to timestamp first
        const dateObj = new Date(val);
        if (isNaN(dateObj.getTime())) {
          return "Invalid Date";
        }
        timestamp = dateObj.getTime();
      }
      
      const d = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(d.getTime())) {
        return "Invalid Date";
      }
      
      var date = d.getDate();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var dateValue =
        (date <= 9 ? "0" + date : date) +
        "/" +
        (month <= 9 ? "0" + month : month) +
        "/" +
        year;
      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
  
      return concatDateTime;
    },

    async close_dialog() {
      if (this.signimagesarrayurls.length != 0) {
        await this.deleteall_item(this.signimagesarrayurls);
      }
      this.approvalFlowHistory = [];
      this.signimagesarrayurls = [];
      this.approvalComments = "";
      this.forwardUser = "";
      this.withdrawCheck = false;
      this.$emit("clicked", 0);
    },
    async deleteall_item(keysToDelete) {
      for (let i = 0; i < keysToDelete.length; i++) {
        let baseIndex =
          keysToDelete[i].indexOf("amazonaws.com/") + "amazonaws.com/".length;
        let key = keysToDelete[i].substring(baseIndex);
        await deleteS3SignedUrl(key);
      }
      this.signimagesarrayurls = [];
      this.converteUrl = [];
      // var self = this;
      // var details = self.$store.getters.GetOrgDetails;
      // this.delLoading = true;
      // var s3Bucket = new AWS.S3({
      //   region: details.s3_details.region,
      //   accessKeyId: details.s3_details.access_key,
      //   secretAccessKey: details.s3_details.secret_key,
      // });
      // var bucketName = details.s3_details.bucket_name;

      // for (let key of keysToDelete) {
      //   var params = {
      //     Bucket: bucketName,
      //     Key: key,
      //   };

      //   await s3Bucket.deleteObject(params, function (err, data) {
      //     if (err) {
      //       console.log(err);
      //     } else {
      //       self.signimagesarrayurls.forEach((element, index) => {
      //         if (element == key) {
      //           self.signimagesarrayurls.splice(index, 1);
      //         }
      //       });
      //     }
      //   });
      // }
    },
    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (element.user_email_id != data.user.user_email_id) {
            this.forwardList.push({
              full_user_name: element.full_user_name,
              user_email_id: element.user_email_id,
            });
          }
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
      if (item.approval_status === "INPROGRESS") {
        return "orange";
      } else if (item.approval_status === "APPROVED") {
        return "green";
      } else if (item.approval_status === "INITIATED BY") {
        return "blue";
      } else if (item.approval_status === "REJECTED") {
        return "red";
      } else if (
        item.approval_status === "FORWARD" ||
        item.approval_status === "FORWARDED"
      ) {
        return "purple";
      } else {
        return "grey";
      }
    },
    fetch_steps_flow_data(val) {
      // console.log(val, this.currentStep);
      var data1 = "";
      if (val.approval_status == "INITIATED BY") {
        data1 = "Initialted on " + "(" + val.formattedApprovalDate + ")";
        this.previousApprovedata = val.workflow_approval_on;
      }
      //  else if (
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
        (obj) =>
          obj.approval_status === "INPROGRESS" ||
          obj.approval_status === "INITIATED BY"
      );
      if (dataCheck) {
        this.withdrawCheck = true;
      }
    },
    async getImageSrc(val, rowData) {
      // console.log(rowData, val);
      const rawUrl = rowData.respectiveValue;
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
      if (val == "image") {
        this.dwonload_pdf(
          signedUrl,
          `${
            rowData.respectiveValue
              .substring(rowData.respectiveValue.lastIndexOf("/") + 1)
              .split("__")[1]
          }.jpg`
        );
      } else {
        this.dwonload_pdf(
          signedUrl,
          `${
            rowData.respectiveValue
              .substring(rowData.respectiveValue.lastIndexOf("/") + 1)
              .split("__")[1]
          }.pdf`
        );
        // window.open(presignedUrl, "_blank");
      }
    },
    // getImageSrcs(val, rowData) {
    //   var data = this.$store.getters.GetOrgDetails;

    //   const s3 = new AWS.S3({
    //     region: data.s3_details.region,
    //     accessKeyId: data.s3_details.access_key,
    //     secretAccessKey: data.s3_details.secret_key,
    //   });
    //   const params = {
    //     Bucket: data.s3_details.bucket_name,
    //     Key: "workflow/" + rowData.respectiveValue.split("workflow/")[1],
    //     Expires: 3600,
    //   };

    //   const presignedUrl = s3.getSignedUrl("getObject", params);

    //   if (val == "image") {
    //     return presignedUrl;
    //   } else {
    //     this.dwonload_pdf(
    //       presignedUrl,
    //       `${
    //         rowData.respectiveValue
    //           .substring(rowData.respectiveValue.lastIndexOf("/") + 1)
    //           .split("__")[1]
    //       }.pdf`
    //     );
    //     // window.open(presignedUrl, "_blank");
    //   }
    // },

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

    // download_image(val, n) {
    //   var data = this.$store.getters.GetOrgDetails;

    //   const s3 = new AWS.S3({
    //     region: data.s3_details.region,
    //     accessKeyId: data.s3_details.access_key,
    //     secretAccessKey: data.s3_details.secret_key,
    //   });
    //   const params = {
    //     Bucket: data.s3_details.bucket_name,
    //     Key: "workflow/" + n.respectiveValue.split("workflow/")[1],
    //     Expires: 3600,
    //   };

    //   const imageElement = s3.getSignedUrl("getObject", params);

    //   var data = imageElement;
    //   const imageUrl = imageElement;

    //   fetch(imageUrl)
    //     .then((response) => response.blob())
    //     .then((blob) => {
    //       const url = window.URL.createObjectURL(blob);
    //       const a = document.createElement("a");
    //       a.href = url;
    //       a.download = "downloaded-image.jpg"; // Specify the filename for the download
    //       a.style.display = "none";

    //       document.body.appendChild(a);
    //       a.click();

    //       window.URL.revokeObjectURL(url);
    //       document.body.removeChild(a);
    //     })
    //     .catch((error) => {
    //       // console.error("Error downloading image:", error);
    //     });
    // },

    print_image() {
      // window.print();
      const imageElement = this.$refs.printImage;
      var data = imageElement[0].image;
      const printWindow = window.open("", "", "width=600,height=600");
      printWindow.document.open();
      printWindow.document.write(
        "<html><head><title>Print Image</title></head><body>"
      );
      printWindow.document.write(
        '<img src="' + data.currentSrc + '" style="width: 100%;" />'
      );
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    },

    view_profile_data(data) {
      this.componentCheck = 1;
      this.viewProfilePic = true;
      this.rowInfoData = data;
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

    async fetch_pending_data() {
      var array = [];
      this.imageregularUrl = [];
      array = this.formDetails.workflow_template;
      array.map((obj) => ({ ...obj, respectiveValue: "" }));

      const obj = this.formDetails.workflow_payload;

      const appendedValues = {};
      const otherValues = {};

      Object.keys(obj).forEach((key) => {
        if (key.endsWith("_text")) {
          const originalKey = key.slice(0, -5);

          if (obj.hasOwnProperty(originalKey)) {
            const appendedTextValue = obj[key];
            // console.log("appendedTextValue", appendedTextValue);
            // console.log(appendedTextValue);
            appendedValues[originalKey] = appendedTextValue;
          }
        } else {
          otherValues[key] = obj[key];
          // console.log("elsee", otherValues);
        }
      });
      const concatenatedObject = Object.assign({}, otherValues, appendedValues);

      for (var i = 0; i < array.length; i++) {
        for (let data in concatenatedObject) {
          if (array[i].key == `${data}`) {
            array[i].respectiveValue = `${concatenatedObject[data]}`;
          }
        }
      }
      const replacedArray = array.map((obj) => ({
        ...obj,
        respectiveValue:
          obj.respectiveValue !== undefined ? obj.respectiveValue : "N/A",
      }));
      const details = this.$store.getters.GetOrgDetails;
      const updatedData = await Promise.all(
        replacedArray.map(async (row) => {
          if (row.data_type === "media") {
            const rawUrl = row.respectiveValue;
            const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
            return {
              ...row,
              signedUrl,
            };
          }
          if (row.data_type === "gallery") {
            // console.log(row);
            const details = this.$store.getters.GetOrgDetails;
            if (row.input_array_value.length != 0) {
              for (let i = 0; i < row.input_array_value.length; i++) {
                const urlupdate = await getS3SignedUrl(
                  row.input_array_value[i].type,
                  details.s3_details
                );
                this.imageregularUrl.push(urlupdate);
                // console.log(row.input_array_value[i].type);
              }
            }
            return {
              ...row,
              signedUrl: null,
            };
          }

          return {
            ...row,
            signedUrl: null, // Or leave it undefined
          };
        })
      );
      this.formTemplate = updatedData;
      this.formTemplate = this.formTemplate.filter(
        (obj) => obj.is_displayed == true
      );
    },

    // fetch_pending_data() {
    //   var array = [];

    //   array = this.formDetails.workflow_template;
    //   // console.log(array);
    //   array.map((obj) => ({ ...obj, respectiveValue: "" }));

    //   const obj = this.formDetails.workflow_payload;

    //   const appendedValues = {};
    //   const otherValues = {};

    //   Object.keys(obj).forEach((key) => {
    //     otherValues[key] = obj[key];
    //   });

    //   const concatenatedObject = Object.assign({}, otherValues, appendedValues);

    //   for (var i = 0; i < array.length; i++) {
    //     for (let data in concatenatedObject) {
    //       if (array[i].key == `${data}`) {
    //         array[i].respectiveValue = `${concatenatedObject[data]}`;
    //       }
    //     }
    //   }
    //   const replacedArray = array.map((obj) => ({
    //     ...obj,
    //     respectiveValue:
    //       obj.respectiveValue !== undefined ? obj.respectiveValue : "",
    //   }));
    //   this.formTemplate = replacedArray;
    // },

    reject_workflow(val) {
      if (this.approvalComments.trim().length != 0) {
        this.approve_action(val);
      } else {
        this.$emit("popupmessage", 0);
      }
    },

    validate_aprrovals(val) {
      if (this.$refs.form1.validate()) {
        this.approvalAction = false;
        if (this.formDetails.attachments_keys.length != 0) {
          if (this.signimagesarrayurls.length != 0) {
            var attachememt = [];
            attachememt = this.convertArrayToRegularS3URLs(
              this.signimagesarrayurls
            );
            this.attachmentarray.push(...attachememt);
          }
          this.approve_action(val);
        } else {
          if (
            this.approvestep.enable_attachments != undefined &&
            val == "APPROVED"
          ) {
            if (
              this.approvestep.enable_attachments == true &&
              this.signimagesarrayurls.length == 0
            ) {
              this.$emit("errorMsg", "Attachments are mandatory");
            } else {
              if (this.signimagesarrayurls.length != 0) {
                var attachememt = [];
                attachememt = this.convertArrayToRegularS3URLs(
                  this.signimagesarrayurls
                );
                this.attachmentarray.push(...attachememt);
              }
              this.approve_action(val);
            }
          } else {
            if (this.signimagesarrayurls.length != 0) {
              var attachememt = [];
              attachememt = this.convertArrayToRegularS3URLs(
                this.signimagesarrayurls
              );
              this.attachmentarray.push(...attachememt);
            }
            this.approve_action(val);
          }
        }
        // if (
        //   this.approvestep.enable_attachments != undefined &&
        //   val == "APPROVED"
        // ) {
        //   if (
        //     this.approvestep.enable_attachments == true &&
        //     this.formDetails.attachments_keys.length < 5
        //   ) {
        //     if (this.signimagesarrayurls.length == 0) {
        //       this.$emit("errorMsg", "Attachments are mandatory");
        //     } else {
        //       if (this.signimagesarrayurls.length != 0) {
        //         var attachememt = [];
        //         attachememt = this.convertArrayToRegularS3URLs(
        //           this.signimagesarrayurls
        //         );
        //         this.attachmentarray.push(...attachememt);
        //       }
        //       this.approve_action(val);
        //     }
        //   } else {
        //     if (this.signimagesarrayurls.length != 0) {
        //       var attachememt = [];
        //       attachememt = this.convertArrayToRegularS3URLs(
        //         this.signimagesarrayurls
        //       );
        //       this.attachmentarray.push(...attachememt);
        //     }
        //     this.approve_action(val);
        //   }
        // } else {
        //   if (this.signimagesarrayurls.length != 0) {
        //     var attachememt = [];
        //     attachememt = this.convertArrayToRegularS3URLs(
        //       this.signimagesarrayurls
        //     );
        //     this.attachmentarray.push(...attachememt);
        //   }
        //   this.approve_action(val);
        // }
      }
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
                val == "FORWARD" ? this.forwardUser.user_email_id : undefined,
              attachments_keys: this.attachmentarray,
              geo_lat: 0,
              geo_long: 0,
            },
          })
        );
        var response = JSON.parse(result.data.workflow_appr_rej);
        this.loading = false;
        this.loading1 = false;
        if (response.Status == "SUCCESS") {
          // this.get_audit_message(val, data);
          this.approvalFlowHistory = [];
          this.$emit("successMsg", response.Message);
          this.signimagesarrayurls = [];
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
        this.approvalFlowHistory = [];
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
        this.loading1 = false;
      }
    },

    async forward_data() {
      this.forwardLoading = true;
      await this.get_all_org_users();
      this.forwardLoading = false;
      await this.fetch_details();
      this.forwardUser = "";
      this.forwardAction = true;
    },

    back_data() {
      this.forwardUser = "";
      this.forwardAction = false;
    },
  },
};
</script>
<style>
.scrollable-content {
  max-height: 400px !important;
  overflow-y: auto !important; /* Enable vertical scrolling */
  padding-bottom: 16px !important; /* Optional padding for better aesthetics */
}
</style>
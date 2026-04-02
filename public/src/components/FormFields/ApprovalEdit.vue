<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editableField"
      @update:model-value="$emit('clicked', false)"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="">
        <v-toolbar
          v-if="forwardAction == false && getimage == false"
          elevation="0"
          density="compact"
          class="navBar"
        >
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{ formDetails.workflow_name }} (
              {{ formDetails.transaction_id }} )
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-5"  @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-toolbar
          v-if="forwardAction == true"
          elevation="0"
          density="compact"
          class="navBar"
        >
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">
              {{ formDetails.workflow_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <!-- <v-icon
            v-if="pdfCheck == false"
            @click="download_image('file', imageonly)"
            color="primaryColor"
            class="mr-2"
            left
          >
            mdi-download</v-icon
          > -->
          <v-icon class="icon-class mr-6" @click="back_data()"
            >mdi-arrow-left-bold</v-icon
          >
        </v-toolbar>
        <v-card-text class="scrollable-content">
          <v-row no-gutters>
            <v-col :cols="forwardAction == false ? 7 : 12">
              <v-card-title class="mt-n2 subFont" v-if="forwardAction == false">
                {{
                  "Initiated By" + " " + "-" + " " + initiatedUser
                }}</v-card-title
              >
              <v-divider class="mt-n2" />
              <v-card-text
                v-if="
                  formReset == true &&
                  forwardAction == false &&
                  getimage == false
                "
              >
                <v-form ref="form1">
                  <v-row class="mt-4">
                    <v-col
                      v-for="(index, Idx) in formDetails.workflow_template"
                      :key="Idx"
                      :cols="Idx === 0 ? '12' : '12  mt-n5'"
                      sm="12"
                      md="12"
                      xs="12"
                      
                    >
                      <TextField
                        v-if="
                          index.data_type == 'string' ||
                          index.data_type == 'paragraph'
                        "
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:textinput="fetch_input_value"
                      />

                      <EmailField
                        v-if="index.data_type == 'email'"
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:emailValue="fetch_input_value"
                      />

                      <NumberField
                        v-if="index.data_type == 'number'"
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:numberFieldData="fetch_input_value"
                      />
                      <CheckboxField
                        v-if="index.data_type == 'checkbox'"
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:checkboxvalue="fetch_input_value"
                      />

                      <DateField
                        :formActionType="formActionType"
                        v-if="index.data_type == 'date'"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:dateField="fetch_input_value"
                      />

                      <DropdowmField
                        v-if="index.data_type == 'single_choice'"
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:dropDownField="fetch_input_value"
                      />

                      <TimePicker
                        :formActionType="formActionType"
                        v-if="index.data_type == 'time'"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        :index="index"
                        v-on:timeInput="fetch_input_value"
                      />

                      <RatingFile
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="index.data_type == 'rating'"
                        :index="index"
                        v-on:ratingField="fetch_input_value"
                      />

                      <!-- <DividerComp :formActionType="formActionType" :index="index" /> -->
                      <FlipSwitch
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="index.data_type == 'boolean'"
                        :index="index"
                        v-on:flipSwitchh="fetch_input_value"
                      />
                      <UrlField
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="
                          index.data_type == 'url' ||
                          index.data_type == 'youtube' ||
                          index.data_type == 'link'
                        "
                        :index="index"
                        v-on:urlInput="fetch_input_value"
                      />
                      <LabelField
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="index.data_type == 'label'"
                        :index="index"
                      />
                      <MediaField
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="index.data_type == 'media'"
                        v-on:mediaUploaded="fetch_input_value"
                        :index="index"
                      />
                      <!-- v-on:imageNavigation="show_image" -->
                      <YearField
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="index.data_type == 'year'"
                        v-on:YearField="fetch_input_value"
                        :index="index"
                        v-on:yearField="fetch_input_value"
                      />
                      <ImageviewField
                        :formActionType="formActionType"
                        :formAction="formAction"
                        :formTemplate="formTemplate"
                        v-if="index.data_type == 'gallery'"
                        :index="index"
                      />
                      <TeamsList
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        v-if="index.data_type == 'team_list'"
                        :index="index"
                      />
                      <LoctionList
                        v-if="index.data_type == 'location_list'"
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        :index="index"
                      />
                      <DesginationList
                        v-if="index.data_type == 'designation_list'"
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        :index="index"
                      />
                      <GroupList
                        v-if="index.data_type == 'group_list'"
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        :index="index"
                      />
                      <MobileNumberField
                        v-if="index.data_type == 'phonenumber'"
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        v-on:phonenumberData="fetch_input_value"
                        :index="index"
                      />

                      <DateTimeField
                        v-if="index.data_type == 'datetime'"
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        v-on:dateTimeVal="fetch_input_value"
                        :index="index"
                      />
                      <UserMultiChoice
                        v-if="index.data_type == 'multi_choice'"
                        :formActionType="formActionType"
                        :formTemplate="formTemplate"
                        :formAction="formAction"
                        v-on:multichoice="fetch_input_value"
                        :index="index"
                      />

                      <!-- v-on:flipSwitchh="fetch_input_value" -->
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
                      this.geoenable == false
                    "
                    density="compact"
                    class="rounded elevation-1 FontSize bg-white pa-2"
                    v-show="formDetails.workflow_type == 'CUSTOM_FLOWS'"
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
                  <v-row v-show="formDetails.workflow_type == 'CUSTOM_FLOWS'">
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
                            v-for="(
                              signimagesarrayurls, index
                            ) in signimagesarrayurls"
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
              <v-card-text v-if="getimage == true">
                <v-row v-if="pdfCheck == true" class="mt-5">
                  <v-col cols="10">
                    {{ pdfName }}
                  </v-col>
                  <v-col cols="2">
                    <v-icon
                      class=""
                      @click="dwonload_pdf(imageonly, `${pdfName}.pdf`)"
                      color="primaryColor"
                      >mdi-download</v-icon
                    >
                  </v-col>
                </v-row>
                <!-- <div v-if="pdfCheck == true" class="mt-5">{{ pdfName }}</div> -->
                <div v-else="pdfCheck == false">
                  <v-img height="300" contain :src="imageonly"></v-img>

                  <!-- <v-icon
              @click="download_image('file', imageonly)"
              color="primaryColor"
              class="mt-2"
              left
            >
              mdi-download</v-icon
            > -->
                </div>
              </v-card-text>
              <v-card-text v-if="forwardAction == true" class="mt-4">
                <v-form ref="form1">
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-autocomplete
                        :key="forwardAction"
                        label="Select User"
                        :rules="[(v) => !!v || 'Required']"
                        item-title="full_user_name"
                        item-value="user_email_id"
                        :items="forwardList"
                        v-model="forwardUser"
                        density="compact"
                        variant="outlined"
                        return-object
                        :menu-props="{ maxHeight: 200 }"
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
            <!-- <v-col v-if="formDetails.approval_status == 'WITHDRAWN'" cols="5">
            <v-card-text>
              Workflow is withdrawn by {{ formDetails.workflow_initiated_by }}
            </v-card-text>
          </v-col> -->
            <v-col cols="5" v-if="forwardAction == false">
              <v-card-title class="mt-n2 subFont"
                >Approval History</v-card-title
              >
              <v-divider class="mt-n2" />
              <v-card-text class="mt-n2">
                <v-list-item density="compact" class="ml-2">
                  <v-list-item-avatar>
                    <v-icon color="green" dark> mdi-cog </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="red-text"
                      >Start
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-timeline density="compact" class="ml-5">
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
                    <!-- {{
                    n.approval_status == "INITIATED BY"
                      ? "(PENDING ON)"
                      : "(" + n.approval_status + ")"
                  }} -->
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
                v-if="formDetails.attachments_keys != undefined"
                class="mb-4"
              >
                <v-divider
                  v-if="formDetails.attachments_keys.length != 0"
                ></v-divider>

                <v-card-title
                  class="mt-n2 subFont"
                  v-if="formDetails.attachments_keys.length != 0"
                  >Uploaded Attachments</v-card-title
                >
                <v-divider class="mt-n2" />
                <v-card-text class="mt-n2">
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
                        class="ml-2"
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
        </v-card-text>
        <v-card-actions v-if="forwardAction == true" class="justify-end mt-2">
          <v-btn
            @click="validate_aprrovals('FORWARD')"
            :loading="loading"
            class="text-capitalize ml-1 mt-n7 cardCss"
            >Submit</v-btn
          >
        </v-card-actions>

        <v-card-actions
          v-if="
            formAction == 'Pending' &&
            forwardAction == false &&
            getimage == false &&
            geoenable == false
          "
          class="justify-end mt-2"
        >
          <v-btn
            @click="validate_aprrovals('APPROVED')"
            :loading="loading"
            class="text-capitalize ml-1 mt-n7"
            color="#008000"
            variant="flat"
            >{{
              formDetails.form_unique_type == "PROJECT_REPORT"
                ? "Submit"
                : "Approve"
            }}</v-btn
          >
          <v-btn
            @click="reject_workflow('REJECTED')"
            :loading="loading1"
            color="red"
            variant="flat"
            class="text-capitalize ml-1 mt-n7"
            >Reject</v-btn
          >
          <v-btn
            v-if="
              approvestep.action_buttons != 'approveReject' &&
              approvestep.action_buttons != 'approveRejectRestart'
            "
            @click="forward_data()"
            :loading="forwardLoading"
            v-show="formDetails.form_unique_type != 'PROJECT_REPORT'"
            class="text-capitalize ml-1 mt-n7 "
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
            class="text-capitalize ml-1 mt-n7"
            >Restart</v-btn
          >
        </v-card-actions>
        <v-card-actions
          v-if="
            formAction == 'Pending' &&
            forwardAction == false &&
            getimage == false &&
            geoenable == true
          "
          class="justify-end"
        >
          <v-btn class="text-capitalize cardCss">
            Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import ImageviewField from "@/components/FormDesigner/FormFields/ImageviewField.vue";
import TextField from "@/components/FormDesigner/FormFields/TextField.vue";
import NumberField from "@/components/FormDesigner/FormFields/NumberField.vue";
import CheckboxField from "@/components/FormDesigner/FormFields/CheckboxField.vue";
import TextAreaField from "@/components/FormDesigner/FormFields/TextAreaField.vue";
import DateField from "@/components/FormDesigner/FormFields/DateField.vue";
import DropdowmField from "@/components/FormDesigner/FormFields/DropdowmField.vue";
import TimePicker from "@/components/FormDesigner/FormFields/TimePicker.vue";
import RatingFile from "@/components/FormDesigner/FormFields/RatingFile.vue";
import DividerComp from "@/components/FormDesigner/FormFields/DividerComp.vue";
import FlipSwitch from "@/components/FormDesigner/FormFields/FlipSwitch.vue";
import EmailField from "@/components/FormDesigner/FormFields/EmailField.vue";
import UrlField from "@/components/FormDesigner/FormFields/UrlField.vue";
import LabelField from "@/components/FormDesigner/FormFields/LabelField.vue";
import MediaField from "@/components/FormDesigner/FormFields/MediaField.vue";
import TeamsList from "@/components/FormDesigner/ActiiveFileds/TeamsList.vue";
import LoctionList from "@/components/FormDesigner/ActiiveFileds/LoctionList.vue";
import DesginationList from "@/components/FormDesigner/ActiiveFileds/DesginationList.vue";
import GroupList from "@/components/FormDesigner/ActiiveFileds/GroupList.vue";
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { workflow_appr_rej, restart_workflow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
const FileSaver = require("file-saver");
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

import axios from "axios";
export default {
  props: {
    editableField: Boolean,
    formDetails: Object,
    formActionType: String,
    formAction: String,
    rowInfo: Object,
  },
  mixins: [
    get_all_org_users,
    // update_audit_logs
  ],
  components: {
    TextField,
    NumberField,
    ImageviewField,
    CheckboxField,
    TextAreaField,
    DateField,
    DropdowmField,
    TimePicker,
    RatingFile,
    DividerComp,
    FlipSwitch,
    EmailField,
    UrlField,
    LabelField,
    MediaField,
    YearField,
    TeamsList,
    LoctionList,
    DesginationList,
    GroupList,
    MobileNumberField,
    DateTimeField,
    UserMultiChoice,
  },
  watch: {
    editableField: {
      async handler() {
        if (this.editableField == true) {
          this.initiatedUser = localStorage.getItem("initiatedBy");
          this.approvalFlowHistory = [];
          this.fetch_approval_history();
          // console.log(this.formDetails);
          this.formReset = true;
          this.getimage = false;
          this.modifiedValue = [];
          this.fetch_pending_data();
          this.find_current_step();
          this.forwardAction = false;
          this.approvalAction = false;

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
        } else {
          this.formReset = false;
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      formReset: false,
      currentStep: null,
      uploadload: false,
      geoenable: false,
      restartLoading: false,
      approvestep: {},
      formTemplate: [],
      signimagesarrayurls: [],
      forwardAction: false,
      forwardList: [],
      forwardUser: "",
      search: "",
      approvalAction: false,
      approvalComments: "",
      loading: false,
      loading1: false,
      loading2: false,
      modifiedValue: [],
      getimage: true,
      imageUrl: "",
      imageonly: "",
      pdfName: "",
      pdfCheck: false,
      forwardLoading: false,
      attachmentarray: [],
      initiatedUser: "",
      approvalFlowHistory: [],
      previousApprovedata: null,
      documentFiles: null,
      actualURLs: [],
      delLoading: false,
    };
  },
  computed: {
    commentsrules() {
      if (this.approvalAction == true) {
        return [(v) => !!v || "Required"];
      } else {
        return [];
      }
    },
  },
  methods: {
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

    async delete_item(val, index) {
      this.delLoading = true;
      try {
        const urlObj = new URL(val);
        const key = urlObj.pathname.slice(1);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.signimagesarrayurls.splice(index, 1);
          this.actualURLs.splice(index, 1);
          // console.log(this.signimagesarrayurls, this.actualURLs);
        }
      } catch (err) {
        this.delLoading = false;
        console.error("Delete error:", err);
      }
    },
    // async delete_item(val, index) {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;
    //   this.delLoading = true;
    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key: val,
    //   };

    //   await s3Bucket.deleteObject(params, function (err, data) {
    //     if (err) {
    //     } else if (data) {
    //       self.signimagesarrayurls.forEach((element) => {
    //         if (element == val) {
    //           self.signimagesarrayurls.splice(index, 1);
    //         }
    //       });
    //     }
    //   });
    // },
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
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },
    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();
      // const files = event.target.files;
      // // Process the selected files
      // await this.upload_S3(files[0]);
    },
    async upload_new_func() {
      if (!this.documentFiles) return;
      this.uploadload = true;
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user?.user_id;

      const Key = [
        "workflow",
        orgDetails.organization.organization_id,
        userId,
        Date.now(),
        this.replaceSpecialCharacters(this.documentFiles.name),
      ].join("/");

      try {
        const fileUrl = await uploadToS3(
          this.documentFiles,
          orgDetails.s3_details,
          Key
        );
        if (fileUrl) {
          this.actualURLs.push(fileUrl);

          const signedUrl = await getS3SignedUrl(
            fileUrl,
            orgDetails.s3_details
          );
          if (signedUrl) {
            // console.log(signedUrl);
            this.signimagesarrayurls.push(signedUrl);
            this.uploadload = false;
          }
          // console.log("✅ Uploaded file URL:", fileUrl);
          // await this.create_expense(fileUrl);
          // this.documentFiles = null;
        }
      } catch (err) {
        // this.uploadStatus = "❌ Upload failed. Check console.";
        // this.uploadStatusType = "error";
        this.loading = false;
      }
    },
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async upload_S3(files) {
      this.uploadload = true;
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      this.uploadload = false;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);

        this.upload_S3_bucket(baseData[0], file);
      });
    },

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
    //       self.$store.getters.GetUserObj.user?.user_id +
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
      // alert(4);
      // console.log(val);
      // var data1 = "";
      // if (val.approval_status == "INITIATED BY") {
      //   data1 = "Initialted on " + "(" + val.formattedApprovalDate + ")";
      //   // this.previousApprovedata = val.workflow_approval_on;
      // } else if (val.approval_status == "APPROVED") {
      //   data1 = "Approved On" + "(" + val.formattedApprovalDate + ")";
      //   this.previousApprovedata = val.workflow_approval_on;
      // }

      var data1 = "";
      const previousApprovedDate = this.previousApprovedData;
      if (val.approval_status == "INITIATED BY") {
        data1 = "Initialted on " + "(" + val.formattedApprovalDate + ")";
        this.previousApprovedata = val.workflow_approval_on;
      } else if (val.approval_status == "APPROVED") {
        data1 = "Approved On" + "(" + val.formattedApprovalDate + ")";
        this.previousApprovedata = val.workflow_approval_on;
      }
      //  else if (
      //   val.approval_status == "INPROGRESS" &&
      //   val.step_no === this.currentStep
      // ) {
      //   if (previousApprovedDate) {
      //     const daysPending = this.calculateDaysFromEpoch(previousApprovedDate);
      //     data1 = "Pending since (" + daysPending + ")";
      //   } else {

      //     data1 = "";
      //   }

      // }
      return data1;
    },

    calculateDaysFromEpoch(epochTimestamp) {
      if (!epochTimestamp) return "N/A";
      const epochDate = new Date(epochTimestamp * 1000);
      const currentDate = new Date();
      const differenceInTime = currentDate - epochDate;
      const differenceInDays = Math.floor(
        differenceInTime / (1000 * 60 * 60 * 24)
      );
      return differenceInDays + " days";
    },

    download_image(val, n) {
      // var data = this.$store.getters.GetOrgDetails;

      // const s3 = new AWS.S3({
      //   region: data.s3_details.region,
      //   accessKeyId: data.s3_details.access_key,
      //   secretAccessKey: data.s3_details.secret_key,
      // });
      // const params = {
      //   Bucket: data.s3_details.bucket_name,
      //   Key: "workflow/" + n.respectiveValue.split("workflow/")[1],
      //   Expires: 3600,
      // };

      // const imageElement = s3.getSignedUrl("getObject", params);

      // var data = imageElement;
      const imageUrl = n;
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

    async close_dialog() {
      if (this.signimagesarrayurls.length != 0) {
        await this.deleteAllImagesFromS3(this.signimagesarrayurls);
      }
      this.approvalFlowHistory = [];
      this.signimagesarrayurls = [];
      this.$emit("clicked", 0);
    },

    async deleteAllImagesFromS3() {
      this.delLoading = true;

      try {
        for (const val of this.actualURLs) {
          const urlObj = new URL(val);
          const key = urlObj.pathname.slice(1); // remove the leading slash

          await deleteS3SignedUrl(key);
        }

        this.signimagesarrayurls = [];
        this.actualURLs = [];
      } catch (err) {
        console.error("Error deleting all images:", err);
      }
    },

    // async deleteall_item(keysToDelete) {
    //   var self = this;
    //   var details = self.$store.getters.GetOrgDetails;
    //   this.delLoading = true;
    //   var s3Bucket = new AWS.S3({
    //     region: details.s3_details.region,
    //     accessKeyId: details.s3_details.access_key,
    //     secretAccessKey: details.s3_details.secret_key,
    //   });
    //   var bucketName = details.s3_details.bucket_name;

    //   for (let key of keysToDelete) {
    //     var params = {
    //       Bucket: bucketName,
    //       Key: key,
    //     };

    //     await s3Bucket.deleteObject(params, function (err, data) {
    //       if (err) {
    //       } else {
    //         self.signimagesarrayurls.forEach((element, index) => {
    //           if (element == key) {
    //             self.signimagesarrayurls.splice(index, 1);
    //           }
    //         });
    //       }
    //     });
    //   }
    // },

    async downloadimage(url) {
      var data = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(url, data.s3_details);
      if (signedUrl) {
        this.dwonload_pdf(
          signedUrl,
          `${signedUrl.split("/").pop().split("?")[0]}`
        );
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

    getImageSrc(val) {
      var data = this.$store.getters.GetOrgDetails;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,

        Key:
          this.formDetails.form_unique_type == "BROADCAST_MESSAGE"
            ? "broadcast/" + this.imageUrl.split("broadcast/")[1]
            : "workflow/" + this.imageUrl.split("workflow/")[1],
        Expires: 3600,
      };

      const presignedUrl = s3.getSignedUrl("getObject", params);

      if (val == "image") {
        var fileExtension = this.imageUrl.split(".").pop();
        // console.log(fileExtension);
        // Check if the extension is ".pdf"
        if (fileExtension === "pdf") {
          this.getimage = true;
          this.pdfCheck = true;
          this.imageonly = presignedUrl;
          this.pdfName = this.imageUrl
            .split("/")
            .pop()
            .split(".")
            .slice(0, -1)
            .join(".");
        } else {
          this.pdfCheck = false;
          this.imageonly = presignedUrl;
          this.getimage = true;
        }
        // this.imageonly
        // return presignedUrl;
      } else {
        window.open(presignedUrl, "_blank");
      }
    },

    back_data() {
      this.forwardUser = "";
      this.forwardAction = false;
      this.getimage = false;
        this.forwardList = [];

    },

    fetch_master_lists() {
      var data = this.$store.getters.GetUserObj;
      this.forwardList = []
            this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
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

    async show_image(value) {
      this.imageUrl = value;
      await this.getImageSrc("image");
      // this.getimage = true;
    },

    fetch_input_value(value) {
      this.modifiedValue.push(value);
      // console.log(this.modfifiedValue);
    },

    fetch_pending_data() {
      var array = [];

      array = this.formDetails.workflow_template;
      // console.log(array);
      array.map((obj) => ({ ...obj, respectiveValue: "" }));

      const obj = this.formDetails.workflow_payload;

      // console.log(obj);
      // console.log(Object.keys(obj));
      const appendedValues = {};
      const otherValues = {};

      Object.keys(obj).forEach((key) => {
        otherValues[key] = obj[key];
        // if (key.endsWith("_text")) {
        //   const originalKey = key.slice(0, -5);

        //   if (obj.hasOwnProperty(originalKey)) {
        //     const appendedTextValue = obj[key];

        //     appendedValues[originalKey] = appendedTextValue;
        //   }
        // } else {
        //   otherValues[key] = obj[key];
        // }
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
          obj.respectiveValue !== undefined ? obj.respectiveValue : "",
      }));
      this.formTemplate = replacedArray;
    },

    reject_workflow(val) {
      if (this.approvalComments.trim().length != 0) {
        this.approve_action(val);
      } else {
        this.$emit("popupmessage", 0);
      }
    },

    async validate_aprrovals(val) {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        if (this.formDetails.attachments_keys.length != 0) {
          if (this.signimagesarrayurls.length != 0) {
            // var attachememt = [];
            // attachememt = this.convertArrayToRegularS3URLs(
            //   this.signimagesarrayurls
            // );
            this.attachmentarray.concat(this.actualURLs);
            // this.attachmentarray.push(...attachememt);
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
                // var attachememt = [];
                // attachememt = this.convertArrayToRegularS3URLs(
                //   this.signimagesarrayurls
                // );
                this.attachmentarray.concat(this.actualURLs);
                // this.attachmentarray.push(...attachememt);
              }
              this.approve_action(val);
            }
          } else {
            if (this.signimagesarrayurls.length != 0) {
              var attachememt = [];
              attachememt = this.convertArrayToRegularS3URLs(
                this.signimagesarrayurls
              );
              // this.attachmentarray.concat(this.actualURLs);
              // this.attachmentarray.push(...attachememt);
            }
            this.approve_action(val);
          }
        }
      }
    },
    // async modified_paylod() {
    //   var payloadData = {};
    //   var allKeys = this.formDetails.workflow_template;
    //   var data = this.formDetails.workflow_payload;

    //   var array2 = allKeys.map((element) => element.key);
    //   var allTempKeys = array2;

    //   this.modifiedValue.forEach((element) => {
    //     if (allTempKeys.includes(element.key)) {
    //       if (data[element.key].data_type === "single_choice") {
    //         payloadData[element.key] = {
    //           value: element.value,
    //           _text: element.text,
    //         };
    //       } else {
    //         payloadData[element.key] = {
    //           value: element.value,
    //         };
    //       }
    //     }
    //   });
    //   console.log(payloadData);
    //   return JSON.stringify(payloadData);
    // },

    modified_paylod() {
      var allKeys = this.formDetails.workflow_template;
      var data = this.formDetails.workflow_payload;
      // console.log(this.modifiedValue);
      var array2 = [];
      allKeys.forEach((element) => {
        array2.push(element.key);
      });
      var allTempKeys = array2;

      var payloadKeys = Object.keys(data);

      this.modifiedValue.forEach((element) => {
        if (
          allTempKeys.includes(element.key) ||
          payloadKeys.includes(element.key)
        ) {
          data[element.key] = element.value;
          data[element.key + "_text"] = element.text;
        } else {
          data[element.key] = element.value;
        }
      });

      // console.log(data);
      return JSON.stringify(data);
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
              workflow_payload: await this.modified_paylod(),
              comments: this.approvalComments,
              forward_user_email_id:
                val == "FORWARD" ? this.forwardUser.user_email_id : undefined,
              attachments_keys: this.fetch_attachment_keys(),
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
          this.signimagesarrayurls = [];
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
      }
    },

    fetch_attachment_keys() {
      var finalArray = this.attachmentarray.concat(this.actualURLs);
      return finalArray;
    },

    async forward_data() {
    
      this.forwardLoading = true;
      this.$store.commit("Setnamesearch", this.search);
      await this.get_all_org_users();
      this.forwardLoading = false;
      this.fetch_master_lists();
      this.forwardUser = "";
      this.forwardAction = true;
    },
  },
};
</script>

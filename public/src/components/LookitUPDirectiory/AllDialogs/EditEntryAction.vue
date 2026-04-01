<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="editEntriesDialog" @update:model-value="$emit('update:editEntriesDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{ $store.getters.GetFormObject.directory_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon
            class="icon-class"
            v-show="imageExistsCheck == 0"
            @click="close_dialog()"
            >mdi-close</v-icon
          >
          <v-icon
            class="icon-class"
            v-show="imageExistsCheck == 1"
            @click="close_image_func()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-row v-show="imageExistsCheck == 0" no-gutters>
          <v-col cols="12">
            <v-card-text>
              <v-form ref="form1">
                <v-row class="mt-4">
                  <v-col
                    v-for="(index, Idx) in directoryFormArray"
                    :key="Idx"
                    :cols="Idx === 0 ? '12' : '12 mt-n5'"
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
                      class="mt-n1"
                      :formActionType="formActionType"
                      :formAction="formAction"
                      :formTemplate="formTemplate"
                      v-if="index.data_type == 'rating'"
                      :index="index"
                      v-on:ratingField="fetch_input_value"
                    />

                    <!-- <DividerComp :formActionType="formActionType" :index="index" /> -->
                    <FlipSwitch
                      class="mt-n2"
                      :formActionType="formActionType"
                      :formAction="formAction"
                      :formTemplate="formTemplate"
                      v-if="index.data_type == 'boolean'"
                      :index="index"
                      v-on:flipSwitchh="fetch_input_value"
                    />
                    <UrlField
                      class="mt-n2"
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
                      class="mt-n2"
                      :formActionType="formActionType"
                      :formAction="formAction"
                      :formTemplate="formTemplate"
                      v-if="index.data_type == 'label'"
                      :index="index"
                    />
                    <MediaField
                      class="mt-n2"
                      :formActionType="formActionType"
                      :formAction="formAction"
                      :formTemplate="formTemplate"
                      v-if="index.data_type == 'media'"
                      v-on:imageNavigation="show_image"
                      :index="index"
                      v-on:mediaUploaded="fetch_input_value"
                      v-on:mediaurlExists="show_image_docs"
                    />
                    <!-- <YearField
                      class="mt-n2"
                      :formActionType="formActionType"
                      :formAction="formAction"
                      :formTemplate="formTemplate"
                      v-if="index.data_type == 'year'"
                      :index="index"
                    /> -->
                    <ImageviewField
                      :formActionType="formActionType"
                      :formAction="formAction"
                      :formTemplate="formTemplate"
                      v-if="index.data_type == 'gallery'"
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
                      v-on:dateTimeVal="fetch_input_value"
                      :formTemplate="formTemplate"
                      :formAction="formAction"
                      :index="index"
                    />

                    <YearField
                      v-if="index.data_type == 'year'"
                      :formActionType="formActionType"
                      v-on:yearField="fetch_input_value"
                      :formTemplate="formTemplate"
                      :formAction="formAction"
                      :index="index"
                    />

                    <UserMultiChoice
                      v-if="index.data_type == 'multi_choice'"
                      :formActionType="formActionType"
                      v-on:multichoice="fetch_input_value"
                      :formTemplate="formTemplate"
                      :formAction="formAction"
                      :index="index"
                    />

                    <!-- v-on:flipSwitchh="fetch_input_value" -->
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-col>
        </v-row>
        <v-row v-show="imageExistsCheck == 1" no-gutters>
          <v-col cols="12">
            <v-card-text>
              <div class="ma-2">
                <iframe height="200" width="400" :src="emitedUrl" />
              </div>
              <div>
                <v-btn
                  @click="download_file(emitedUrl)"
                  class="mx-2"
                  fab
                  dark
                  small
                  color="primary"
                >
                  <v-icon dark> mdi-download </v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-col>
        </v-row>

        <v-card-actions v-show="imageExistsCheck == 0" class="justify-end">
          <v-btn
            dark
            @click="validate_aprrovals()"
            :loading="loading"
            color="#ef3f6e"
            class="text-capitalize ml-1 mt-n7"
            >Submit</v-btn
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

// import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { update_Entry_for_directory } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
const FileSaver = require("file-saver");
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var AWS = require("aws-sdk");

import axios from "axios";
export default {
  props: {
    editEntriesDialog: Boolean,
    formDetails: Object,
    formActionType: String,
    formAction: String,
  },
  // mixins: [update_audit_logs],
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
    editEntriesDialog: {
      async handler() {
        if (this.editEntriesDialog == true) {
          this.workflowPayloadInfo = {};
          var newobj = localStorage.getItem("drectoryPayload");
          var checkObj = JSON.parse(newobj);
          // console.log(checkObj);
          this.workflowPayloadInfo = checkObj;
          this.getimage = false;
          this.modifiedValue = [];
          this.formTemplate = [];
          this.directoryFormArray = [];
          this.checkNew = 0;

          await this.fetch_pending_data();

          this.directoryFormArray = this.workflowPayloadInfo.directory_template;
          this.forwardAction = false;
          this.approvalAction = false;
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      formReset: false,
      formTemplate: [],
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
      checkNew: 0,
      directoryFormArray: [],
      workflowPayloadInfo: {},
      imageExistsCheck: 0,
      emitedUrl: "",
    };
  },

  methods: {
    download_image(val, n) {
      const imageUrl = n;
      // console.log(imageUrl);
      // Fetch the image
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "downloaded-image.jpg";
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

    close_dialog() {
      this.checkNew = 0;
      this.formTemplate = [];
      this.$emit("clicked", 0);
      this.$refs.form1.reset();
    },

    close_image_func() {
      this.emitedUrl = "";
      this.imageExistsCheck = 0;
    },

    // async get_url_data() {
    //   var data = this.$store.getters.GetOrgDetails;
    //   console.log("url", this.emitedUrl);
    //   var url = this.emitedUrl;
    //   const s3 = new AWS.S3({
    //     region: data.s3_details.region,
    //     accessKeyId: data.s3_details.access_key,
    //     secretAccessKey: data.s3_details.secret_key,
    //   });
    //   const params = {
    //     Bucket: data.s3_details.bucket_name,
    //     Key: "workflow/" + url.split("workflow/")[1],
    //     Expires: 3600,
    //   };

    //   const imageElement = s3.getSignedUrl("getObject", params);
    //   console.log(imageElement);
    //   return imageElement;
    //   // this.dwonload_pdf(
    //   //   imageElement,
    //   //   `${imageElement.split("/").pop().split("?")[0]}`
    //   // );
    // },

    show_image_docs(value) {
      this.emitedUrl = value;

      this.imageExistsCheck = 1;
    },

    async download_file(url) {
      var fileName = url.split("/").pop().split("?")[0];
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
          this.workflowPayloadInfo.form_unique_type == "BROADCAST_MESSAGE"
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
    },

    fetch_master_lists() {
      this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
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

    async show_image(value) {
      this.imageUrl = value;
      await this.getImageSrc("image");
      // this.getimage = true;
    },

    fetch_input_value(value) {
      this.modifiedValue.push(value);
    },

    fetch_pending_data() {
      var array = [];
      this.formTemplate = [];
      const appendedValues = {};
      const otherValues = {};
      // var newobj = localStorage.getItem("drectoryPayload");
      // array = JSON.parse(newobj).directory_template;
      array = this.workflowPayloadInfo.directory_template;
      array.map((obj) => ({ ...obj, respectiveValue: "" }));

      const obj = this.workflowPayloadInfo.responseObject.workflow_payload;

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

      const concatenatedObject = Object.assign({}, otherValues);
      // console.log("concatenatedObject", concatenatedObject);
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
      this.checkNew++;
    },

    async validate_aprrovals() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        // console.log(this.$refs.form1.validate());

        // this.modified_paylod();
        this.approve_action();
      }
    },

    modified_paylod() {
      var allKeys = this.workflowPayloadInfo.directory_template;
      var data = this.workflowPayloadInfo.responseObject.workflow_payload;

      var array2 = [];
      allKeys.forEach((element) => {
        array2.push(element.key);
      });
      var allTempKeys = array2;
      var payloadKeys = Object.keys(data);

      this.modifiedValue.forEach((item) => {
        if (allTempKeys.includes(item.key)) {
          data[item.key] = item.value;

          if (item.text) {
            data[item.key + "_text"] = item.text;
          }
        } else {
          data[item.key] = item.value;

          if (item.text) {
            data[item.key + "_text"] = item.text;
          }
        }
      });

      return JSON.stringify(data);
    },

    async approve_action(val) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(update_Entry_for_directory, {
            input: {
              organization_id: data.organization.organization_id,
              directory_id: this.workflowPayloadInfo.directory_id,
              // directory_id:
              //   this.workflowPayloadInfo.responseObject.directory_id,
              entry_id: this.workflowPayloadInfo.responseObject.entry_id,
              workflow_payload: await this.modified_paylod(),
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.update_Entry_for_directory);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.fetch_audit_message();
          this.loading = false;
          this.checkNew = 0;
          this.formTemplate = [];
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
          this.formTemplate = [];
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
        this.formTemplate = [];
      }
    },

    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "DIRECTORY_ACTION",
        AuditAction: "UPDATE_DIRECTORY_ENTRY",
        AuditMessage: `${data.user.full_user_name} Updated  Entry for ${this.$store.getters.GetFormObject.directory_name} Directory`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>

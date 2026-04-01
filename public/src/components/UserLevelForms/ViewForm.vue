<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="formDialog"
      @update:model-value="$emit('update:formDialog', $event)"
      persistent
      max-width="1100"
      transition="dialog-top-transition"
      class="doalig"
    >
      <v-card class="rounded-xl">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title>
            <div class="custom-title">
              {{ formInfo.workflow_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="scrollable-content">
          <div class="font-weight-bold mt-2 subFont">
            Workflow Name : {{ formInfo.workflow_name }}
          </div>
          <div class="font-weight-bold subFont mt-3 mb-2">
            Workflow Description : {{ formInfo.workflow_description }}
          </div>
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-row class="mt-4">
                  <v-col
                    v-for="(index, Idx) in formInfo.workflow_template"
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
                      v-on:textinput="fetch_input_value"
                      :index="index"
                    />
                    <EmailField
                      v-if="index.data_type == 'email'"
                      :formActionType="formActionType"
                      v-on:emailValue="fetch_input_value"
                      :index="index"
                    />
                    <NumberField
                      v-if="index.data_type == 'number'"
                      :formActionType="formActionType"
                      v-on:numberFieldData="fetch_input_value"
                      :index="index"
                    />
                    <CheckboxField
                      v-if="index.data_type == 'checkbox'"
                      :formActionType="formActionType"
                      v-on:checkboxvalue="fetch_input_value"
                      :index="index"
                    />
                    <!-- <TextAreaField
                v-if="index.data_type == 'PARAGRAPH'"
                :index="index"
                @clicked="emit_fields"
              /> -->
                    <DateField
                      :formActionType="formActionType"
                      v-if="index.data_type == 'date'"
                      v-on:dateField="fetch_input_value"
                      :index="index"
                    />
                    <DropdowmField
                      v-if="index.data_type == 'single_choice'"
                      :formActionType="formActionType"
                      v-on:dropDownField="fetch_input_value"
                      :index="index"
                    />
                    <TimePicker
                      :formActionType="formActionType"
                      v-if="index.data_type == 'time'"
                      v-on:timeInput="fetch_input_value"
                      :index="index"
                    />
                    <RatingFile
                      class="mt-n2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'rating'"
                      v-on:ratingField="fetch_input_value"
                      :index="index"
                    />
                    <DividerComp
                      :formActionType="formActionType"
                      v-if="index.data_type == 'divider'"
                      :index="index"
                    />
                    <FlipSwitch
                      class="mt-n2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'boolean'"
                      v-on:flipSwitchh="fetch_input_value"
                      :index="index"
                    />
                    <LabelField
                      class="mt-n2 mb-2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'label'"
                      :index="index"
                    />
                    <MediaField
                      class="mt-n2"
                      v-if="index.data_type == 'media'"
                      v-on:mediaUploaded="fetch_input_value"
                      :formActionType="formActionType"
                      :index="index"
                      :key="componentKey"
                    />
                    <CountryListField
                      class="mt-n2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'countrylist'"
                      :index="index"
                    />
                    <ImageviewField
                      :formActionType="formActionType"
                      v-if="index.data_type == 'gallery'"
                      :index="index"
                    />
                    <UrlField
                      :formActionType="formActionType"
                      v-if="
                        index.data_type == 'url' || index.data_type == 'youtube'
                      "
                      :index="index"
                      v-on:urlInput="fetch_input_value"
                    />
                    <!-- <TeamsList
                      :formActionType="formActionType"
                      v-if="index.data_type == 'team_list'"
                      v-on:teamuserselected="fetch_input_value"
                      :index="index"
                    />
                    <LoctionList
                      :formActionType="formActionType"
                      v-if="index.data_type == 'location_list'"
                      v-on:locationselected="fetch_input_value"
                      :index="index"
                    />
                    <DesginationList
                      v-if="index.data_type == 'designation_list'"
                      :formActionType="formActionType"
                      v-on:designationSelected="fetch_input_value"
                      :index="index"
                    />
                    <GroupList
                      v-if="index.data_type == 'group_list'"
                      :formActionType="formActionType"
                      v-on:groupSelected="fetch_input_value"
                      :index="index"
                    /> -->
                    <MobileNumberField
                      v-if="index.data_type == 'phonenumber'"
                      :formActionType="formActionType"
                      v-on:phonenumberData="fetch_input_value"
                      :index="index"
                    />

                    <DateTimeField
                      v-if="index.data_type == 'datetime'"
                      :formActionType="formActionType"
                      v-on:dateTimeVal="fetch_input_value"
                      :index="index"
                    />

                    <YearField
                      v-if="index.data_type == 'year'"
                      :formActionType="formActionType"
                      v-on:yearField="fetch_input_value"
                      :index="index"
                    />

                    <UserMultiChoice
                      v-if="index.data_type == 'multi_choice'"
                      :formActionType="formActionType"
                      v-on:multichoice="fetch_input_value"
                      :index="index"
                    />

                    <!-- <CountryListField
                  class="mt-n2"
                  :formActionType="formActionType"
                  v-if="index.data_type == 'countrylist'"
                  :index="index"
                /> -->
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6" class="mt-5">
                <v-toolbar
                  density="compact"
                  class="rounded elevation-1 FontSize bg-white pa-2"
                  ><b> Add Attachments</b> <v-spacer />
                  <!-- <v-file-input
                    v-model="documentFiles"
                    label="Select file"
                    outlined
                    dense
                    show-size
                    @change="handleFileChange"
                  ></v-file-input> -->
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none"
                    accept="image/*,application/pdf"
                  />
                  <v-btn
                    v-show="signimagesarrayurls.length < 5"
                    dark
                    elevation="0"
                    class="text-capitalize cardCss text-white"
                    @click="$refs.fileInput.click()"
                    size="small"
                    :loading="uploadload"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
                <!-- <v-file-input
                  small-chips
                  outlined
                  dense
                  label="Add Attachments"
                  accept="image/*,application/pdf"
                  v-model="contentdocumentFiles"
                  @change="upload_S3(contentdocumentFiles)"
                  v-show="signimagesarrayurls.length < 5"
                ></v-file-input> -->
                <v-row>
                  <v-col cols="12">
                    <!-- <v-card flat class="overflow-auto overflow-x-hidden"> -->
                    <v-row>
                      <v-col cols="12">
                        <div class="mt-2" v-if="signimagesarrayurls.length > 0">
                          Max 5 Attachments
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
                                @click="delete_item(signimagesarrayurls, index)"
                                :loading="delLoading"
                              >
                                <v-icon color="red">mdi-delete</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                    <!-- </v-card> -->
                    <!-- <v-card flat class="overflow-auto overflow-x-hidden">
                      <v-row>
                        <v-col
                          cols="12"
                          v-for="(
                            signimagesarrayurls, index
                          ) in signimagesarrayurls"
                          :key="index"
                        >
                          <v-card class="mt-5">
                            <v-img
                              max-height="80"
                              contain
                              :src="signimagesarrayurls"
                              v-if="signimagesarrayurls.length > 1"
                            >
                            </v-img>
                            <div>
                              {{
                                displayPDFFileName(
                                  signimagesarrayurls.substring(
                                    signimagesarrayurls.lastIndexOf("/") + 1,
                                    signimagesarrayurls.indexOf("?") !== -1
                                      ? signimagesarrayurls.indexOf("?")
                                      : undefined
                                  )
                                )
                              }}
                            </div>
                            <div
                              class="d-flex align-centers justify-centers h-100"
                              v-if="signimagesarrayurls.length == 0"
                            >
                              No Image
                            </div>
                            <v-btn
                              icon
                              @click="delete_item(signimagesarrayurls, index)"
                            >
                              <v-icon color="red">mdi-delete</v-icon>
                            </v-btn>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card> -->
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            elevation="0"
            @click="validate_data()"
            :loading="loading"
            v-show="formInfo.is_geo_enabled == false"
            class="text-capitalize ml-1 cardCss button-corner text-white"
            >Submit</v-btn
          >
          <v-btn
            dark
            text
            elevation="0"
            @click="validate_data()"
            :loading="loading"
            v-show="formInfo.is_geo_enabled == true"
            class="text-capitalize ml-1 cardCss button-corner text-white"
            >Action From Mobile Only</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import GroupList from "@/components/FormDesigner/ActiiveFileds/GroupList.vue";
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
import SnackBar from "@/components/SnackBar.vue";
import EmailField from "@/components/FormDesigner/FormFields/EmailField.vue";
import UrlField from "@/components/FormDesigner/FormFields/UrlField.vue";
import LabelField from "@/components/FormDesigner/FormFields/LabelField.vue";
import MediaField from "@/components/FormDesigner/FormFields/MediaField.vue";
import CountryListField from "@/components/FormDesigner/FormFields/CountryListField.vue";
import { workflow_initiates } from "@/graphql/mutations.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import TeamsList from "@/components/FormDesigner/ActiiveFileds/TeamsList.vue";
import LoctionList from "@/components/FormDesigner/ActiiveFileds/LoctionList.vue";
import DesginationList from "@/components/FormDesigner/ActiiveFileds/DesginationList.vue";
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";
// import { Storage, Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { API, graphqlOperation } from "aws-amplify";
export default {
  // mixins: [update_audit_logs],
  components: {
    TextField,
    ImageviewField,
    NumberField,
    LoctionList,
    TeamsList,
    CheckboxField,
    TextAreaField,
    DateField,
    DropdowmField,
    TimePicker,
    RatingFile,
    DividerComp,
    FlipSwitch,
    SnackBar,
    EmailField,
    UrlField,
    LabelField,
    MediaField,
    CountryListField,
    DesginationList,
    GroupList,
    MobileNumberField,
    YearField,
    DateTimeField,
    UserMultiChoice,
  },
  props: {
    formDialog: Boolean,
    formInfo: Object,
    formActionType: String,
  },

  data() {
    return {
      loading: false,
      formValues: [],
      // formActionType: "initiate",
      contentdocumentFiles: [],
      uploadload: false,
      regularS3URLsnew: [],
      arrayurls: [],
      signimagesarrayurls: [],
      componentKey: 0,
      documentFiles: null,
      actualURLs: [],
      delLoading: false,
    };
  },

  watch: {
    formDialog: {
      async handler() {
        if (this.formDialog == true) {
          this.signimagesarrayurls = [];
          this.actualURLs = [];
          this.formValues = [];
          this.componentKey += 1;
        }
      },
      immediate: true,
    },
  },
  methods: {
    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();
    },
    async upload_new_func() {
      if (!this.documentFiles) return;
      this.uploadload = true;
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user.user_id;
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

    async close_dialog() {
      if (this.signimagesarrayurls.length != 0) {
        this.deleteAllImagesFromS3();
        // await this.deleteall_item(this.signimagesarrayurls);
      }

      this.signimagesarrayurls = [];
      this.regularS3URLsnew = [];
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },

    async deleteAllImagesFromS3() {
      this.delLoading = true;

      try {
        for (const val of this.actualURLs) {
          const urlObj = new URL(val);
          const key = urlObj.pathname.slice(1); // remove the leading slash

          await deleteS3SignedUrl(key);
        }

        // After all deletes succeed
        this.signimagesarrayurls = [];
        this.actualURLs = [];
      } catch (err) {
        console.error("Error deleting all images:", err);
      }
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

    // async deleteall_item(keysToDelete) {
    //   var self = this;
    //   var details = self.$store.getters.GetOrgDetails;
    //   // this.delLoading = true;
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
    //         // console.log(err);
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

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (
          this.formInfo.no_of_attachments == 1 &&
          this.signimagesarrayurls.length == 0
        ) {
          this.$emit("validateData", "Attachments are mandatory");
        } else {
          this.initiate_action();
        }
      }
    },

    convertToRegularS3URL(presignedURL) {
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },
    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }

      return this.arrayurls;
    },

    fetch_input_value(val) {
      // console.log(val);
      this.formValues.push(val);
    },

    async initiate_action() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(workflow_initiates, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              workflow_id: this.formInfo.workflow_id,
              workflow_payload: await this.fetch_paylod_values(),
              attachments_keys:
                this.signimagesarrayurls.length != 0 ? this.actualURLs : [],
            },
          })
        );

        var response = JSON.parse(result.data.workflow_initiates);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.signimagesarrayurls = [];
          this.regularS3URLsnew = [];
          var data = {
            AuditType: "WORKFLOW_ACTION",
            AuditAction: "WORKFLOW_INITIATE",
            AuditMessage: `${data.user.full_user_name}  initiated  ${this.formInfo.workflow_name} Workflow`,
          };
          this.$store.commit("SetAuditActions", data);
          // this.update_audit_logs();

          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.signimagesarrayurls = [];
          this.regularS3URLsnew = [];
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    async fetch_paylod_values() {
      var staticArray = [];
      var payloadData = [];
      var obj = {};
      var data = "";

      staticArray = this.formInfo.workflow_template;

      staticArray.forEach((element) => {
        for (var i = 0; i < this.formValues.length; i++) {
          if (element.key == this.formValues[i].key) {
            if (
              element.data_type == "single_choice" ||
              element.data_type == "multi_choice"
            ) {
              payloadData.push({
                label: this.formValues[i].key,
                value: this.formValues[i].value,
                [element.key + "_text"]: this.formValues[i].text,
              });
            } else {
              payloadData.push({
                label: this.formValues[i].key,
                value: this.formValues[i].value,
              });
            }
          }
        }
      });

      for (const a of payloadData) {
        obj = Object.assign(obj, { [a.label]: a.value });
      }
      const hasNewKey = payloadData.some((a) =>
        Object.keys(a).some((key) => key !== "label" && key !== "value")
      );
      if (hasNewKey) {
        payloadData.forEach((a) => {
          Object.keys(a).forEach((key) => {
            if (key !== "label" && key !== "value") {
              obj[key] = a[key];
            }
          });
        });
      }

      return JSON.stringify(obj);
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

    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
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
  },
};
</script>
<style scss>
.v-dialog {
  border-radius: 30px !important;
  border-left: 8px solid #b0bec5;
  border-top: 8px solid #b0bec5;
}
.scrollable-content {
  max-height: 400px; /* Set a suitable height */
  overflow-y: auto;
}
</style>
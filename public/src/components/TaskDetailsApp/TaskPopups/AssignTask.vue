<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assignPopup"
      @update:model-value="$emit('update:assignPopup', $event)"
      persistent
      max-width="900"
      transition="dialog-top-transition"
    >
      <v-card class="modern-dialog">
        <!-- Modern Dense Toolbar/Header -->
        <v-card-title class="modern-title-row dense-toolbar">
          <div class="modern-title-wrap">
            <span class="modern-title">Assign Task</span>
          </div>
          <v-spacer />
          <v-btn
            icon
            variant="text"
            size="small"
            @click="close_dialog()"
            class="close-btn dense-close-btn"
            :title="'Close'"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="modern-card-text">
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="7">
                <div class="section-header mb-2">Task Details</div>
                <v-textarea
                  density="compact"
                  v-model="taskDescription"
                  label="Task Details"
                  :rules="[(v) => !!v || 'required']"
                  variant="outlined"
                  maxlength="200"
                  counter="200"
                  rows="1"
                  class="modern-input mb-4"
                ></v-textarea>
                <v-divider class="my-3" />
                <div class="section-header mb-2">Assign To</div>
                <v-radio-group
                  :rules="[(v) => !!v || 'required']"
                  v-model="taskSelection"
                  inline
                  class="d-flex flex-row align-center mb-2"
                >
                  <v-radio label="All Members" value="ALL_MEMBERS" inline />
                  <v-radio label="Selected Users" value="USERS" inline />
                </v-radio-group>
                <v-autocomplete
                  v-if="taskSelection == 'USERS'"
                  density="compact"
                  v-model="taskAssign"
                  label="Select Users"
                  :rules="[(v) => !!v || 'required']"
                  :menu-props="{ maxHeight: '200' }"
                  variant="outlined"
                  multiple
                  chips
                  :items="userList"
                  item-title="label"
                  item-key="value"
                  :search-input.sync="search"
                  @input="search = ''"
                  class="modern-input mb-4"
                />
                <v-divider class="my-3" />
                <div class="section-header mb-2">Task Frequency</div>
                <v-radio-group
                  :rules="[(v) => !!v || 'required']"
                  @change="clearFields"
                  v-model="taskFrequency"
                  inline
                  class="d-flex flex-row align-center mb-2"
                >
                  <v-radio label="One time" value="onetime" />
                  <v-radio label="Recurring" value="recurring" />
                </v-radio-group>
                <v-col cols="12" sm="6" class="mt-2" v-if="taskFrequency == 'onetime'">
                  <v-text-field
                    label="Task Completion Date"
                    v-model="computedDateDisplay"
                    variant="outlined"
                    density="compact"
                    @click="datePicker = true"
                    readonly
                    append-inner-icon="mdi-calendar"
                    persistent-hint
                    class="modern-input"
                    :rules="[(v) => !!v || 'Required']"
                  >
                    <v-dialog v-model="datePicker" persistent max-width="325">
                      <v-card>
                        <v-date-picker
                          v-model="tempDate"
                          :min="new Date().toISOString().substr(0, 10)"
                          color="#DB4C77"
                        ></v-date-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn variant="text" color="primary" @click="datePicker = false">
                            Cancel
                          </v-btn>
                          <v-btn variant="text" color="primary" @click="saveDate">
                            OK
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-text-field>
                </v-col>
                <v-row v-if="taskFrequency == 'recurring'" no-gutters>
                  <v-col cols="12">
                    <v-select
                      v-model="selectTriggerAction"
                      density="compact"
                      variant="outlined"
                      label="Select Frequency"
                      outlined
                      :rules="[
                        (v) =>
                          taskFrequency !== 'recurring' || !!v || 'Required',
                      ]"
                      :items="[
                        { text: 'Daily', value: 'DAILY' },
                        { text: 'Weekly', value: 'WEEKLY' },
                        { text: 'Monthly', value: 'MONTHLY' },
                        { text: 'Fortnightly', value: 'FORTNIGHTLY' },
                        { text: 'Bi-Monthly', value: 'BI_MONTHLY' },
                        { text: 'Quaterly', value: 'QUATERLY' },
                        { text: 'Half Yearly', value: 'HALFYEARLY' },
                        { text: 'Yearly', value: 'YEARLY' },
                      ]"
                      item-title="text"
                      item-key="value"
                      class="modern-input mb-2"
                    />
                  </v-col>
                  <v-col v-if="selectTriggerAction != null" cols="12">
                    <div class="mt-n3 mb-2" style="font-size: 12px">
                      <p class="font-weight-bold">{{ triggerMessage }}</p>
                    </div>
                  </v-col>
                  <v-col
                    v-if="
                      selectTriggerAction == 'QUATERLY' ||
                      selectTriggerAction == 'HALFYEARLY' ||
                      selectTriggerAction == 'YEARLY'
                    "
                    cols="6"
                  >
                    <v-select
                      variant="outlined"
                      density="compact"
                      label="Select Month"
                      v-model="selectMonth"
                      item-title="text"
                      item-key="value"
                      :items="[
                        { text: 'January', value: '1' },
                        { text: 'February', value: '2' },
                        { text: 'March', value: '3' },
                        { text: 'April', value: '4' },
                        { text: 'May', value: '5' },
                        { text: 'June', value: '6' },
                        { text: 'July', value: '7' },
                        { text: 'August', value: '8' },
                        { text: 'September', value: '9' },
                        { text: 'October', value: '10' },
                        { text: 'November', value: '11' },
                        { text: 'December', value: '12' },
                      ]"
                      :rules="[
                        (v) =>
                          (['QUATERLY', 'HALFYEARLY', 'YEARLY'].includes(
                            selectTriggerAction
                          )
                            ? !!v
                            : true) || 'Required',
                      ]"
                      class="modern-input mb-2"
                    />
                  </v-col>
                  <v-col
                    v-if="
                      selectTriggerAction == 'MONTHLY' ||
                      selectTriggerAction == 'FORTNIGHTLY' ||
                      selectTriggerAction == 'BI_MONTHLY' ||
                      selectTriggerAction == 'QUATERLY' ||
                      selectTriggerAction == 'HALFYEARLY' ||
                      selectTriggerAction == 'YEARLY'
                    "
                    cols="6"
                  >
                    <v-select
                      variant="outlined"
                      density="compact"
                      :class="
                        selectTriggerAction == 'QUATERLY' ||
                        selectTriggerAction == 'HALFYEARLY' ||
                        selectTriggerAction == 'YEARLY'
                          ? 'ml-2'
                          : 'ml-0'
                      "
                      :rules="[
                        (v) =>
                          (['MONTHLY', 'FORTNIGHTLY', 'BI_MONTHLY', 'QUATERLY', 'HALFYEARLY', 'YEARLY'].includes(
                            selectTriggerAction
                          )
                            ? !!v
                            : true) || 'Required',
                      ]"
                      label="Select Date"
                      v-model="selectDate"
                      :items="selecctedDates"
                      class="modern-input mb-2"
                    />
                  </v-col>
                  <v-col v-if="selectTriggerAction == 'WEEKLY'" cols="6">
                    <v-select
                      variant="outlined"
                      density="compact"
                      label="Select Day"
                      :rules="[
                        (v) =>
                          selectTriggerAction === 'WEEKLY'
                            ? !!v || 'Required'
                            : true,
                      ]"
                      v-model="selectDay"
                      :items="[
                        { text: 'Monday', value: 'MONDAY' },
                        { text: 'Tuesday', value: 'TUESDAY' },
                        { text: 'Wednesday', value: 'WEDNESDAY' },
                        { text: 'Thursday', value: 'THURSDAY' },
                        { text: 'Friday', value: 'FRIDAY' },
                        { text: 'Saturday', value: 'SATURDAY' },
                        { text: 'Sunday', value: 'SUNDAY' },
                      ]"
                      item-title="text"
                      item-key="value"
                      class="modern-input mb-2"
                    />
                  </v-col>
                  <v-col
                    v-if="
                      selectTriggerAction == 'WEEKLY' ||
                      selectTriggerAction == 'MONTHLY' ||
                      selectTriggerAction == 'FORTNIGHTLY' ||
                      selectTriggerAction == 'BI_MONTHLY' ||
                      selectTriggerAction == 'QUATERLY' ||
                      selectTriggerAction == 'HALFYEARLY' ||
                      selectTriggerAction == 'YEARLY'
                    "
                    cols="6"
                  >
                    <v-select
                      variant="outlined"
                      density="compact"
                      :class="
                        selectTriggerAction == 'MONTHLY' ||
                        selectTriggerAction == 'FORTNIGHTLY' ||
                        selectTriggerAction == 'BI_MONTHLY' ||
                        selectTriggerAction == 'WEEKLY'
                          ? 'ml-2'
                          : 'ml-0'
                      "
                      v-model="completionBefore"
                      :rules="[
                        (v) =>
                          [
                            'WEEKLY',
                            'MONTHLY',
                            'FORTNIGHTLY',
                            'BI_MONTHLY',
                            'QUATERLY',
                            'HALFYEARLY',
                            'YEARLY',
                          ].includes(selectTriggerAction)
                            ? !!v || 'Required'
                            : true,
                      ]"
                      outlined
                      label="Target Completion Date"
                      :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                      class="modern-input mb-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="5" class="mt-4">
                <div class="section-header mb-2">Attachments</div>
                <v-card flat class="modern-attachments-card mb-2">
                  <v-toolbar dense flat class="modern-attachments-toolbar">
                    <span class="font-weight-bold">Add Attachments</span>
                    <v-spacer />
                    <input
                      type="file"
                      ref="fileInput"
                      @change="handleFileChange"
                      style="display: none"
                      accept="image/*,application/pdf"
                    />
                    <v-btn
                      v-show="signimagesarrayurls.length < 5"
                      color="primary"
                      variant="flat"
                      class="modern-btn compact-btn"
                      @click="$refs.fileInput.click()"
                      size="small"
                      :loading="uploadload"
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-row>
                    <v-col cols="12">
                      <div class="mt-2" v-if="signimagesarrayurls.length > 0">
                        Max 5 Attachments
                      </div>
                      <v-row>
                        <v-col
                          cols="12"
                          v-for="(
                            signimagesarrayurls, index
                          ) in signimagesarrayurls"
                          :key="index"
                        >
                          <v-card class="modern-attachment-preview mb-2">
                            <v-row class="pa-3">
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
                                />
                              </v-col>
                              <v-col cols="2">
                                <v-btn
                                  icon
                                  @click="
                                    delete_item(signimagesarrayurls, index)
                                  "
                                  :loading="delLoading"
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
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end modern-footer-actions">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="modern-btn compact-btn"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { list_assigned_tasks } from "@/graphql/queries.js";
import { create_task_and_assign } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { all_users_of_organization } from "@/graphql/queries.js";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";

import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export default {
  // mixins: [get_all_org_users],
  props: {
    assignPopup: Boolean,
  },
  data() {
    return {
      taskAssign: [],
      taskDescription: "",
      taskName: "",
      userList: [],
      loading: false,
      comments: "",
      completionDate: "",
      fromMenu: false,
      taskSelection: null,
      search: null,
      contentdocumentFiles: [],
      uploadload: false,
      regularS3URLsnew: [],
      arrayurls: [],
      signimagesarrayurls: [],
      autorecurring: false,
      selectTriggerAction: null,
      completionBefore: "",
      selectDay: "",
      selectDate: "",
      selecctedDates: [],
      selectMonth: "",
      taskFrequency: "",
      uploadload: false,
      actualURLs: [],
      delLoading: false,
      documentFiles: null,
      datePicker: false,
      tempDate: null,
    };
  },
  watch: {
    assignPopup: {
      async handler() {
        if (this.assignPopup == true) {
          (this.delLoading = false), this.$store.commit("Setnamesearch", "");
          this.signimagesarrayurls = [];
          this.fetch_dates();
          await this.get_all_org_users();

          this.fetch_details();
        }
      },
      immediate: true,
    },
    // search() {
    //   if (this.search != "" || this.search != null) {
    //     if (this.search.length >= 3) {
    //       this.get_all_org_users();
    //     }
    //   } else {
    //     this.get_all_org_users();
    //   }
    // },
  },
  computed: {
    triggerMessage() {
      if (!this.selectTriggerAction) return "";

      const baseMessage = "The task will be triggered at 12:30 AM";
      const monthNames = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec",
      };

      switch (this.selectTriggerAction) {
        case "DAILY":
          return `${baseMessage} daily based on the organization's time zone.`;

        case "WEEKLY":
          return this.selectDay
            ? `${baseMessage} every ${this.selectDay} based on the organization's time zone.`
            : "Please select a day for the weekly schedule.";

        case "MONTHLY":
          return this.selectDate
            ? `${baseMessage} on the ${this.selectDate} of each month.`
            : "Please select a date for the monthly schedule.";

        case "FORTNIGHTLY":
          return this.selectDate
            ? `${baseMessage} on the ${this.selectDate} every fortnight (every 2 weeks).`
            : "Please select a date for the fortnightly schedule.";

        case "BI_MONTHLY":
          return this.selectDate
            ? `${baseMessage} on the ${this.selectDate} every two months.`
            : "Please select a date for the bi-monthly schedule.";

        case "QUATERLY":
        case "HALFYEARLY":
        case "YEARLY":
          return this.selectMonth && this.selectDate
            ? `${baseMessage} on ${monthNames[this.selectMonth]}-${
                this.selectDate
              } based on the organization's time zone.`
            : "Please select both a month and date for this schedule.";

        default:
          return "";
      }
    },
    computedDateDisplay() {
      return this.displayFormatDate(this.completionDate);
    },
  },
  methods: {
    clearFields() {
      this.completionDate = "";
      this.selectTriggerAction = "";
      this.selectMonth = "";
      this.selectDate = "";
      this.completionBefore = "";
      this.selectDay = "";
    },
    fetch_dates() {
      this.selecctedDates = [];
      for (var i = 1; i <= 31; i++) {
        this.selecctedDates.push(i);
      }
    },
    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();

      // Process the selected files
      // await this.upload_new_func();
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
    //       "task" +
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

    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async upload_new_func() {
      if (!this.documentFiles) return;
      this.uploadload = true;
      const orgDetails = this.$store.getters.GetOrgDetails;

      // const userId = this.$store.getters.GetUserObj.user.user_id;
      const Key = [
        "task" +
          "/" +
          orgDetails.organization.organization_id +
          "/" +
          this.$store.getters.GetUserObj.user.user_id +
          "/" +
          Date.now() +
          "/" +
          this.replaceSpecialCharacters(this.documentFiles.name),
      ];
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
    s3get(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "task/" + this.urls.split("task/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.unshift(url);
      //   return url;
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

    async deleteall_item(keysToDelete) {
      var self = this;
      var details = self.$store.getters.GetOrgDetails;
      this.delLoading = true;
      var s3Bucket = new AWS.S3({
        region: details.s3_details.region,
        accessKeyId: details.s3_details.access_key,
        secretAccessKey: details.s3_details.secret_key,
      });
      var bucketName = details.s3_details.bucket_name;

      for (let key of keysToDelete) {
        var params = {
          Bucket: bucketName,
          Key: key,
        };

        await s3Bucket.deleteObject(params, function (err, data) {
          if (err) {
            console.log(err);
          } else {
            self.signimagesarrayurls.forEach((element, index) => {
              if (element == key) {
                self.signimagesarrayurls.splice(index, 1);
              }
            });
          }
        });
      }
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
          this.delLoading = false;
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
    //       console.log(err);
    //     } else if (data) {
    //       self.signimagesarrayurls.forEach((element) => {
    //         if (element == val) {
    //           self.signimagesarrayurls.splice(index, 1);
    //         }
    //       });
    //     }
    //   });
    // },

    async get_all_org_users() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(all_users_of_organization, {
            input: {
              organization_id: data.organization.organization_id,
              name_search: this.search,
            },
          })
        );
        this.orgUsers = [];

        var response = JSON.parse(result.data.all_users_of_organization);

        this.orgUsers = response.data == undefined ? [] : response.data;

        this.userList = [];

        this.orgUsers.forEach((element) => {
          if (
            element.user_status == "ACTIVE" &&
            element.user_type != "CHATBOT"
          ) {
            this.userList.push({
              label: element.full_user_name,
              value: element.user_email_id,
            });
          }
        });
      } catch (error) {
        // console.log(error);
      }
    },

    async close_dialog() {
      if (this.signimagesarrayurls.length != 0) {
        await this.deleteall_item(this.signimagesarrayurls);
      }
      this.signimagesarrayurls = [];
      this.regularS3URLsnew = [];
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.taskAssign = [];
      this.autorecurring = false;
      this.$emit("clicked", 0);
      this.clearFields();
    },

    clearSearchValue(value) {
      if (value === "") {
        this.search = "";
      }
    },

    fetch_details() {
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            label: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      this.userList.sort((a, b) => a.label.localeCompare(b.label));
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
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.signimagesarrayurls.length != 0) {
          this.regularS3URLsnew = this.convertArrayToRegularS3URLs(
            this.signimagesarrayurls
          );
        }
        this.assign_task_to();
      }
    },

    async assign_task_to() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_task_and_assign, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              task_assign_to:
                this.taskSelection == "ALL_MEMBERS" ? [] : this.taskAssign,
              task_description: this.taskDescription,
              task_name: this.taskDescription,
              comments: this.comments == null ? "" : this.comments,
              task_completion_date:
                this.taskFrequency == "onetime"
                  ? this.completionDate
                  : undefined,
              action_type: this.fetch_action_type(this.taskSelection),
              // this.taskSelection == "ALL_MEMBERS" ? "ALL_MEMBERS" : "USERS",
              attachments_keys: this.regularS3URLsnew,
              enabled_recursion: this.taskFrequency == "onetime" ? false : true,
              task_recursion_frequency:
                this.taskFrequency == "onetime" ? undefined : this.fetch_data(),
            },
          })
        );
        var response = JSON.parse(result.data.create_task_and_assign);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          if (this.taskFrequency == "recurring") {
            localStorage.setItem("recurssionEnabled", true);
            // this.$store.dispatch("set_task_id", response.TaskID);
          }
          this.$emit("successMsg", response.Message);

          if (this.signimagesarrayurls.length != 0) {
            await this.deleteall_item(this.signimagesarrayurls);
          }
          this.$refs.form.reset();
          this.taskAssign = [];
          this.autorecurring = false;
          this.clearFields();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    fetch_action_type(value) {
      if (value == "ALL_MEMBERS") {
        return "ALL_MEMBERS";
      } else if (value == "USERS" && this.taskAssign.length == 1) {
        return "USERS";
      } else if (value == "USERS" && this.taskAssign.length > 1) {
        return "SOME_MEMBERS";
      }
    },

    fetch_data() {
      var data = {};
      data = {
        recursion_frequency: this.selectTriggerAction,
        recursion_date:
          this.selectTriggerAction == "MONTHLY" ||
          this.selectTriggerAction == "FORTNIGHTLY" ||
          this.selectTriggerAction == "BI_MONTHLY" ||
          this.selectTriggerAction == "QUATERLY" ||
          this.selectTriggerAction == "HALFYEARLY" ||
          this.selectTriggerAction == "YEARLY"
            ? this.selectDate
            : undefined,
        recursion_day:
          this.selectTriggerAction == "WEEKLY" ? this.selectDay : undefined,
        completion_days:
          this.selectTriggerAction != "DAILY"
            ? this.completionBefore
            : undefined,
        recursion_month:
          this.selectTriggerAction == "QUATERLY" ||
          this.selectTriggerAction == "HALFYEARLY" ||
          this.selectTriggerAction == "YEARLY"
            ? this.selectMonth
            : undefined,
      };
      return JSON.stringify(data);
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    saveDate() {
      this.completionDate = this.formatDate(this.tempDate);
      this.datePicker = false;
    },
    displayFormatDate(date) {
      if (!date || typeof date !== 'string' || !date.includes('-')) return '';
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
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
  font-size: 1.15rem;
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
.section-header {
  font-size: 1.08rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.modern-input {
  border-radius: 999px !important;
  font-size: 0.98rem;
}
.modern-btn {
  border-radius: 999px;
  min-width: 80px;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 0.98rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 0 18px !important;
  height: 36px !important;
}
.compact-btn {
  min-width: 70px;
  font-size: 0.95rem;
  padding: 0 12px !important;
  height: 32px !important;
}
.modern-card-text {
  padding: 24px 24px 12px 24px;
}
.modern-attachments-card {
  background: #f7f8fa;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 8px 8px 8px 8px;
}
.modern-attachments-toolbar {
  background: none;
  box-shadow: none;
  min-height: 36px;
  padding: 0 8px;
}
.modern-attachment-preview {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 8px;
  padding: 0;
}
.modern-footer-actions {
  background: #f8fafd;
  border-top: 1px solid #eee;
  border-radius: 0 0 14px 14px;
  padding: 12px 24px;
}
</style>
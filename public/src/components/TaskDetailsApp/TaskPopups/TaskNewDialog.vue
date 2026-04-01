<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assignPopup"
      @update:model-value="$emit('update:assignPopup', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Assign Task</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-row no-gutters class="mt-4">
                  <!-- <v-col cols="12">
                    <v-text-field
                      dense
                      v-model="taskName"
                      label="Task Name"
                      :rules="[(v) => !!v || 'required ']"
                      maxlength="50"
                      counter="50"
                      outlined
                    ></v-text-field>
                  </v-col> -->
                  <v-col cols="12">
                    <v-textarea
                      dense
                      v-model="taskDescription"
                      label="Task Details"
                      :rules="[(v) => !!v || 'required ']"
                      outlined
                      maxlength="200"
                      counter="200"
                      rows="1"
                    ></v-textarea>
                  </v-col>
                  <div class="mt-n3"><b>Assign Task To</b></div>
                  <v-col class="mt-n2" cols="12">
                    <v-radio-group
                      :rules="[(v) => !!v || 'required ']"
                      v-model="taskSelection"
                      row
                    >
                      <v-radio
                        label="All Members"
                        value="ALL_MEMBERS"
                      ></v-radio>
                      <v-radio label="Selected Users" value="USERS"></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col v-if="taskSelection == 'USERS'" cols="12">
                    <v-autocomplete
                      dense
                      v-model="taskAssign"
                      label="Select Users"
                      :rules="[(v) => !!v || 'required ']"
                      :menu-props="{ maxHeight: '200' }"
                      outlined
                      multiple
                      :items="userList"
                      item-text="label"
                      item-value="value"
                      :search-input.sync="search"
                      @input="search = ''"
                    >
                    </v-autocomplete>
                  </v-col>
                  <v-col cols="12">
                    <v-menu
                      ref="fromMenu"
                      v-model="fromMenu"
                      :close-on-content-click="false"
                      :return-value.sync="completionDate"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="completionDate"
                          outlined
                          :rules="[(v) => !!v || 'Required ']"
                          label="Task Completion Date"
                          readonly
                          dense
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :min="new Date().toISOString().substr(0, 10)"
                        v-model="completionDate"
                        no-title
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="fromMenu = false">
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.fromMenu.save(completionDate)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      dense
                      v-model="comments"
                      label="Comments"
                      outlined
                      rows="1"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox
                      class="mt-n3"
                      v-model="autorecurring"
                      label="Enable task auto recurring"
                      hide-details
                    ></v-checkbox>
                    <div v-show="autorecurring == true">
                      The event will be triggered at 5pm based on the option
                      selected
                    </div>
                  </v-col>
                  <v-row v-show="autorecurring == true" no-gutters>
                    <v-col cols="12">
                      <v-select
                        v-model="selectTriggerAction"
                        dense
                        label=""
                        class="mt-2"
                        outlined
                        :items="[
                          { text: 'Daily', value: 'DAILY' },
                          { text: 'Weekly', value: 'WEEKLY' },
                          { text: 'Monthly', value: 'MONTHLY' },
                          { text: 'Quaterly', value: 'QUATERLY' },
                          { text: 'Half Yearly', value: 'HALFYEARLY' },
                          { text: 'Yearly', value: 'YEARLY' },
                        ]"
                        >/</v-select
                      >
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
                        outlined
                        dense
                        label="Select Month"
                        v-model="selectMonth"
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
                      />
                    </v-col>
                    <v-col
                      v-if="
                        selectTriggerAction == 'MONTHLY' ||
                        selectTriggerAction == 'QUATERLY' ||
                        selectTriggerAction == 'HALFYEARLY' ||
                        selectTriggerAction == 'YEARLY'
                      "
                      cols="6"
                    >
                      <v-select
                        outlined
                        dense
                        class="ml-2"
                        label="Select Date"
                        v-model="selectDate"
                        :items="selecctedDates"
                      />
                    </v-col>
                    <v-col v-if="selectTriggerAction == 'WEEKLY'" cols="6">
                      <v-select
                        outlined
                        dense
                        label="Select Day"
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
                      />
                    </v-col>
                    <v-col
                      v-if="
                        selectTriggerAction == 'WEEKLY' ||
                        selectTriggerAction == 'MONTHLY' ||
                        selectTriggerAction == 'QUATERLY' ||
                        selectTriggerAction == 'HALFYEARLY' ||
                        selectTriggerAction == 'YEARLY'
                      "
                      cols="6"
                    >
                      <v-select
                        dense
                        class="ml-2"
                        v-model="completionBefore"
                        outlined
                        label="Completion Date"
                        :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-row>
              </v-col>
              <v-col cols="6" class="mt-4">
                <v-toolbar dense class="rounded elevation-1 FontSize"
                  ><b> Add Attachments</b> <v-spacer />
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
                    class="text-capitalize cardCss"
                    @click="$refs.fileInput.click()"
                    small
                    :loading="uploadload"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>

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
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Add</v-btn
          >
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
      uploadload: false,
      actualURLs: [],
      delLoading: false,
      documentFiles: null,
    };
  },
  watch: {
    assignPopup: {
      async handler() {
        if (this.assignPopup == true) {
          this.$store.commit("Setnamesearch", "");
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

  methods: {
    fetch_dates() {
      for (var i = 1; i <= 31; i++) {
        this.selecctedDates.push(i);
      }
    },
    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();
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
        this.delLoading = false;

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
        }
      } catch (err) {
        this.delLoading = false;
        console.error("Delete error:", err);
      }
    },

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
              task_completion_date: this.completionDate,
              action_type: this.fetch_action_type(this.taskSelection),
              // this.taskSelection == "ALL_MEMBERS" ? "ALL_MEMBERS" : "USERS",
              attachments_keys: this.regularS3URLsnew,
              enabled_recursion: this.autorecurring,
              recursion_frequency:
                this.autorecurring == false ? undefined : this.fetch_data(),
            },
          })
        );
        var response = JSON.parse(result.data.create_task_and_assign);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          if (this.signimagesarrayurls.length != 0) {
            await this.deleteall_item(this.signimagesarrayurls);
          }
          this.$refs.form.reset();
          this.taskAssign = [];
          this.autorecurring = false;
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
        return "SOME_USERS";
      }
    },

    fetch_data() {
      var data = {};
      data = {
        recursion_frequency: this.selectTriggerAction,
        recursion_date:
          this.selectTriggerAction == "MONTHLY" ||
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
      };
      return JSON.stringify(data);
    },
  },
};
</script>
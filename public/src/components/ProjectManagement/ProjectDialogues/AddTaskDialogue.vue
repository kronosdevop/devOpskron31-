<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      
      :model-value="addUserTaskDialogue"
      @update:model-value="$emit('update:addUserTaskDialogue', $event)"
      persistent
      max-width="900"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar flat density="compact" class="navBar">
          <v-toolbar-title class="text-black ml-2">
            <div class="custom-title">
              Add Activities {{ phaseItem.project_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="7">
                <v-row no-gutters class="mt-4">
                  <!-- <v-col cols="12">
                <v-text-field
                  dense
                  v-model="taskName"
                  label="Task Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  outlined
                ></v-text-field>
              </v-col> -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="taskDescription"
                      label="Task Details"
                      :rules="[(v) => !!v || 'required ']"
                      variant="outlined"
                      maxlength="200"
                      counter="200"
                      rows="2"
                      density="compact"
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12">
                    <v-autocomplete
                      v-model="teamMembers"
                      label="Assign To*"
                      variant="outlined"
                      item-title="name"
                      item-value="email"
                      :items="userArray"
                      :rules="[(v) => !!v || 'required ']"
                      v-model:search="searchF"
                      @update:model-value="searchF = ''"
                      multiple
                      hide-no-data
                      placeholder="Min 3 Character"
                      density="compact"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="displayDueDate"
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required ']"
                      label="Due Date"
                      readonly
                      density="compact"
                      @click="dueDateDialog = true"
                    >
                      <template #append-inner>
                        <v-icon @click="dueDateDialog = true">mdi-calendar</v-icon>
                      </template>
                    </v-text-field>
                    <v-dialog v-model="dueDateDialog" persistent max-width="325">
                      <v-card>
                        <v-date-picker
                          v-model="tempDueDate"
                          :min="minDueDate"
                          color="primary"
                        ></v-date-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn variant="text" color="primary" @click="dueDateDialog = false">Cancel</v-btn>
                          <v-btn variant="text" color="primary" @click="saveDueDate">OK</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="taskStatus"
                      label="Status"
                      :rules="[(v) => !!v || 'required ']"
                      :items="[
                        { title: 'High', value: 'HIGH' },
                        { title: 'Low', value: 'LOW' },
                        { title: 'Medium', value: 'MEDIUM' },
                      ]"
                      variant="outlined"
                      density="compact"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="5" class="mt-4">
                <v-toolbar density="compact" class="rounded elevation-1 FontSize bg-white">
                  <b> Add Attachments</b>
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
                    variant="flat"
                    class="text-capitalize cardCss"
                    @click="$refs.fileInput.click()"
                    size="small"
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
                                cover
                                :src="signimagesarrayurls"
                                v-if="signimagesarrayurls.length > 1"
                              />
                            </v-col>
                            <v-col cols="2">
                              <v-btn
                                icon
                                @click="delete_item(signimagesarrayurls, index)"
                                :loading="delLoading"
                                variant="text"
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
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            color="primary"
            variant="flat"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";

import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_list_edit_phase_tasks } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { list_all_user_projects } from "@/graphql/queries.js";
export default {
  props: {
    addUserTaskDialogue: Boolean,
    phaseItem: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      taskName: "",
      taskDescription: "",
      fromDate: "",
      fromMenu: false,
      taskStatus: "",
      loading: false,
      uploadload: false,
      regularS3URLsnew: [],
      teamMembers: null,
      userArray: [],
      signimagesarrayurls: [],
      searchF: "",
      actualURLs: [],
      delLoading: false,
      documentFiles: null,
      dueDateDialog: false,
      tempDueDate: "",
    };
  },
  computed: {
    displayDueDate() {
      if (!this.fromDate) return '';
      const d = new Date(this.fromDate);
      if (isNaN(d)) return this.fromDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    minDueDate() {
      return new Date().toISOString().substr(0, 10);
    }
  },
  watch: {
    addUserTaskDialogue: {
      async handler() {
        if (this.addUserTaskDialogue == true) {
          this.$store.commit("Setnamesearch", "");
          this.signimagesarrayurls = [];
          this.tempDueDate = this.fromDate;
          await this.fetch_project_list();
          // await this.get_all_org_users();
          // this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
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
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },
    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();

      // Process the selected files
      // await this.upload_new_func();
    },
    async fetch_project_list() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_user_projects, {
            input: {
              project_progress: "ALL",
            },
          })
        );

        this.userArray = [];
        var response = JSON.parse(result.data.list_all_user_projects);

        if (response.Status == "ERROR") {
          this.userArray = [];
        } else {
          var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));

          response.data.forEach((element) => {
            if (element.project_id == Projecctdetails.project_id) {
              this.userArray = element.project_visible_members;
              this.userArray = this.userArray.filter(
                (obj) =>
                  obj.member_type === "INTERNAL" ||
                  obj.member_type === undefined
              );
            }
          });
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
          });
        }
      });
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.signimagesarrayurls.length != 0) {
          this.regularS3URLsnew = this.convertArrayToRegularS3URLs(
            this.signimagesarrayurls
          );
        }
        this.add_mutation();
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

    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phase_tasks, {
            input: {
              phase_id: this.phaseItem.phase_id,
              task_name: this.taskDescription,
              assign_to: this.teamMembers,
              task_description: this.taskDescription,
              task_priority: this.taskStatus,
              action_type: "CREATE",
              task_completion_date: this.formatDateForAPI(this.fromDate),
              attachments_keys: this.regularS3URLsnew,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_phase_tasks);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_user() {
      var data = [];
      data.push(this.teamMembers);
      return data;
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },
    saveDueDate() {
      this.fromDate = this.tempDueDate;
      this.dueDateDialog = false;
    },
    formatDateForAPI(date) {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d)) return date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  },
};
</script>
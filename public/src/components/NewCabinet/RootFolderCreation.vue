<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createFolderDialog"
      @update:model-value="$emit('update:createFolderDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create Folder</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'Required']"
                  v-model="folderName"
                  label="Folder Name"
                  @input="fetch_folder_desc()"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  rows="0"
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'Required']"
                  v-model="folderDescription"
                  label="Folder Description"
                />
              </v-col>
              <v-col cols="12">
                <div class="mt-n1"><b>Visible to -</b></div>
                <v-radio-group
                  @change="clear_value()"
                  v-model="cabinetVisbility"
                  class=""
                  :rules="[(v) => !!v || 'required ']"
                  inline
                  color="blue"
                >
                  <v-radio label="All Members" value="ALL_MEMBERS"></v-radio>
                  <v-radio
                    label="Restricted Users"
                    value="RESTRICTED_MEMBERS"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col v-if="cabinetVisbility == 'RESTRICTED_MEMBERS'" cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="userDetails"
                  label="Select Users"
                  :menu-props="{ maxHeight: '200' }"
                  variant="outlined"
                  multiple
                  color="blue"
                  :items="visibilityUsers"
                  item-title="full_user_name"
                  item-value="user_id"
                  :search-input.sync="search"
                  @input="onuserinput"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { create_cabinet_root_folders } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

import AWS from "aws-sdk";
export default {
  mixins: [get_all_org_users],
  props: {
    createFolderDialog: Boolean,
    orgResponse: Object,
    primaryKey: String,
  },
  watch: {
    createFolderDialog: {
      async handler() {
        if (this.createFolderDialog == true) {
          // Reset userDetails to prevent duplication
          this.userDetails = [];
          this.visibilityUsers = [];
          //   this.$refs.form.reset();
          await this.get_all_org_users();
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      folderName: "",
      loading: false,
      cabinetVisbility: null,
      visibilityUsers: [],
      userDetails: [],
      search: "",
      folderDescription: "",
    };
  },
  methods: {
    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.visibilityUsers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    onuserinput(value) {
      var data = this.$store.getters.GetUserObj;
      // Only add current user if not already present
      if (!value.includes(data.user.user_id)) {
        value.push(data.user.user_id);
      }
      this.userDetails = value;
      this.search = "";
    },

    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.cabinetVisbility == "ALL_MEMBERS") {
        this.userDetails = [];
      } else {
        // Only add current user if not already present
        if (!this.userDetails.includes(data.user.user_id)) {
          this.userDetails.push(data.user.user_id);
        }
      }

      //   else {
      //     this.userList.forEach((element) => {
      //       if (element.user_id != data.user.user_id) {
      //         this.visibilityUsers.push({
      //           full_user_name: element.full_user_name,
      //           user_id: element.user_id,
      //         });
      //       }
      //     });
      //   }
    },
    fetch_folder_desc() {
      this.folderDescription = this.folderName;
    },
    close_dialog() {
      this.$refs.form.reset();
      this.$emit("clicked", 0);
      this.userDetails = [];
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.create_folder();
      }
    },

    async create_folder(value) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      // this.userDetails.push(data.user.user_id);

      try {
        let result = await API.graphql(
          graphqlOperation(create_cabinet_root_folders, {
            input: {
              organization_id: data.organization.organization_id,
              folder_name: this.folderName.trim(),
              folder_visibility: this.get_visibility_data(),
              folder_description: this.folderDescription.trim(),
              folder_created_by_name: data.user.full_user_name,
              folder_created_by_email: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.create_cabinet_root_folders);

        this.loading = false;
        this.withdrawAction = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.userDetails = [];
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    get_visibility_data() {
      var data = {};

      data = {
        visible_type: this.cabinetVisbility,
        visible_members:
          this.cabinetVisbility == "RESTRICTED_MEMBERS" ? this.userDetails : [],
      };
      return data;
    },

    // create_folder() {
    //   var self = this;
    //   const s3 = new AWS.S3({
    //     region: this.orgResponse.s3_details.region,
    //     accessKeyId: this.orgResponse.s3_details.access_key,
    //     secretAccessKey: this.orgResponse.s3_details.secret_key,
    //   }); // Replace with your S3 region
    //   const params = {
    //     Bucket: this.orgResponse.s3_details.bucket_name,
    //     Key:
    //       this.primaryKey != ""
    //         ? this.primaryKey + this.folderName + "/"
    //         : "Cabinet" +
    //           "/" +
    //           this.orgResponse.organization.organization_id +
    //           "/",
    //     Body: "",
    //   };

    //   s3.upload(params, (err, data) => {
    //     if (err) {
    //       self.loading = false;
    //     } else {
    //       self.$emit("folderSuccess", "Created Successfully");
    //       self.folderName = "";
    //       self.loading = false;
    //     }
    //   });
    // },
  },
};
</script>
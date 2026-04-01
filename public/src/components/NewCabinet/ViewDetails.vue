<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="viewDetailsDialog"
      @update:model-value="$emit('update:viewDetailsDialog', $event)"
      persistent
      max-width="850"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{ rowInfo.Key + " " + "Details" }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-row no-gutters class="">
            <v-col cols="6">
              <v-col cols="12">
                <b>Cabinet Details</b>
              </v-col>
              <v-divider />
              <v-col cols="12">
                <div>
                  <b> Name</b> :
                  {{ rowInfo.Key }}
                </div>
              </v-col>
              <v-col cols="12">
                <div>
                  <b> Description</b> :
                  {{ rowInfo.folderDescritpion }}
                </div>
              </v-col>
              <v-col cols="12">
                <div>
                  <b> Created By</b> :
                  {{ rowInfo.folder_created_by_name }}
                </div>
              </v-col>
              <v-col cols="12">
                <div>
                  <b>Visibility</b> :
                  {{ folderVisibility }}
                </div>
              </v-col>
            </v-col>
            <v-divider
              v-show="
                rowInfo.folder_created_by_email ==
                $store.getters.GetUserObj.user.user_email_id
              "
              vertical
            >
            </v-divider>
            <v-col
              v-show="
                rowInfo.folder_created_by_email ==
                $store.getters.GetUserObj.user.user_email_id
              "
              cols="6"
            >
              <v-col cols="12">
                <b>Edit </b>
              </v-col>
              <v-divider class="ml-1" />
              <v-col cols="12">
                <v-textarea
                  density="compact"
                  label="Description"
                  v-model="folderDescription"
                  variant="outlined"
                  rows="0"
                />
              </v-col>
              <!-- <v-col cols="12">
                <div class="mt-n1"><b> Visibility -</b></div>
                <v-radio-group
                  @change="clear_value()"
                  v-model="cabinetVisbility"
                  class=""
                  row
                >
                  <v-radio label="All Members" value="ALL_MEMBERS"></v-radio>
                  <v-radio
                    label="Restricted Users"
                    value="RESTRICTED_MEMBERS"
                  ></v-radio>
                </v-radio-group>
              </v-col> -->
              <!-- <v-col v-if="cabinetVisbility == 'RESTRICTED_MEMBERS'" cols="12">
                <v-autocomplete
                  dense
                  v-model="userDetails"
                  label="Select Users"
                  :menu-props="{ maxHeight: '200' }"
                  outlined
                  multiple
                  :items="visibilityUsers"
                  item-text="full_user_name"
                  item-value="user_id"
                  :search-input.sync="search"
                  @input="onuserinput"
                >
                </v-autocomplete>
               
              </v-col> -->
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            v-show="
              rowInfo.folder_created_by_email ==
              $store.getters.GetUserObj.user.user_email_id
            "
            size="small"
            :loading="loading2"
            @click="update_details()"
            dark
            class="cardCss mr-2"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { edit_folder_visibility } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    rowInfo: Object,
    viewDetailsDialog: Boolean,
  },
  data() {
    return {
      folderVisibility: "",
      cabinetVisbility: "",
      userDetails: [],
      visibilityUsers: [],
      search: "",
      loading2: false,
      folderDescription: "",
    };
  },
  mixins: [get_all_org_users],
  watch: {
    viewDetailsDialog: {
      async handler() {
        if (this.viewDetailsDialog == true) {
          this.visibilityUsers = [];
          this.userDetails = [];
          this.$store.commit("Setnamesearch", "");
          this.folderDescription = this.rowInfo.folderDescritpion;
          await this.get_all_org_users();
          this.fetch_details();
          this.cabinetVisbility = this.rowInfo.folder_visibility.visible_type;
          this.userDetails =
            this.rowInfo.folder_visibility.visible_type == "RESTRICTED_MEMBERS"
              ? this.rowInfo.folder_visibility.visible_members
              : [];
          this.folderVisibility =
            this.rowInfo.folder_visibility.visible_type == "RESTRICTED_MEMBERS"
              ? "Restricted Users" +
                " " +
                "(" +
                this.fetch_names(
                  this.rowInfo.folder_visibility.visible_members
                ) +
                ")"
              : "All Members";
        }
      },
      immediate: true,
    },
  },
  methods: {
    onuserinput(value) {
      if (!value.includes(this.$store.getters.GetUserObj.user.user_id)) {
        value.push(this.$store.getters.GetUserObj.user.user_id);
      }
      this.userDetails = value;
      this.search = "";
    },
    async update_details() {
      this.loading2 = true;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_folder_visibility, {
            input: {
              folder_id: this.rowInfo.folder_id,
              folder_visibility: this.get_visibility_data(),
              folder_description: this.folderDescription,
            },
          })
        );
        var response = JSON.parse(result.data.edit_folder_visibility);

        this.loading2 = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    // isDisabled(item) {
    //   var data = this.$store.getters.GetUserObj;
    //   return item === data.user.user_id;
    // },
    get_visibility_data() {
      var data = {};
      data = {
        visible_type: this.cabinetVisbility,
        visible_members:
          this.cabinetVisbility == "RESTRICTED_MEMBERS" ? this.userDetails : [],
      };
      return data;
    },

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

    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.cabinetVisbility == "ALL_MEMBERS") {
        this.userDetails = [];
      } else {
        var arrayNew = [
          {
            full_user_name: data.user.full_user_name,
            user_id: data.user.user_id,
          },
        ];

        this.userDetails =
          this.rowInfo.folder_visibility.visible_type == "RESTRICTED_MEMBERS"
            ? this.rowInfo.folder_visibility.visible_members
            : arrayNew;

        // console.log(this.userDetails);
      }
    },

    fetch_names(ids) {
      var names = [];
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        for (var j = 0; j < this.orgUsers.length; j++) {
          if (this.orgUsers[j].user_id === id) {
            names.push(this.orgUsers[j].full_user_name);
            break; // Break the inner loop once match is found
          }
        }
      }

      return names;
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>
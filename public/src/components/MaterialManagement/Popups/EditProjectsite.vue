<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="projectsiteedition" @update:model-value="$emit('update:projectsiteedition', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Edit Project site Head for {{ projectsiteName }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <!-- <v-col cols="12">
                  <v-text-field
                    dense
                    v-model="projectsiteName"
                    label=" Name*"
                    :rules="[(v) => !!v || 'required ']"
                    class=""
                    outlined
                  ></v-text-field>
                </v-col> -->

              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="projectsiteManager"
                  label="Territory Head"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  return-object
                  placeholder="Min 3 Character"
                  @input="change_manager()"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
            class="text-capitalize cardCss button-corner"
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
import { create_list_edit_delete_project_site } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  props: {
    projectsiteedition: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      loading: false,
      projectsiteName: "",
      territoryCity: "",

      projectsiteManager: "",
      changedManager: false,
      userArray: [],
      searchF: "",
    };
  },
  watch: {
    projectsiteedition: {
      async handler() {
        if (this.projectsiteedition == true) {
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          (this.changedManager = false),
            (this.projectsiteName = this.rowInfo.project_site_name);

          this.projectsiteManager = this.rowInfo.project_site_head;
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    close_dialog() {
      this.$emit("clicked", 0);
      //   this.$refs.form.resetValidation();
      //   this.$refs.form.reset();
    },
    change_manager() {
      this.changedManager = true;
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_mutation();
      }
    },

    async edit_mutation() {
      var data = this.$store.getters.GetUserObj;

      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_project_site, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "UPDATE_PROJECT_SITE",
              project_site_id: this.rowInfo.project_site_id,
              project_site_name: this.projectsiteName,
              project_site_head:
                this.changedManager == true
                  ? this.projectsiteManager.user_id
                  : this.rowInfo.project_site_head,
              project_site_head_name:
                this.changedManager == true
                  ? this.projectsiteManager.full_user_name
                  : this.rowInfo.project_site_head_name,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(
          result.data.create_list_edit_delete_project_site
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
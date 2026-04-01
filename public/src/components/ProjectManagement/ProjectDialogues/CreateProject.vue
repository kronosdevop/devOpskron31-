<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog 
      :model-value="projectCreationDialog" 
      @update:model-value="$emit('update:projectCreationDialog', $event)"
      persistent 
      max-width="600" 
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Project</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="projectName"
                  label="Project Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  dense
                  v-model="projectDescription"
                  label="Project Description*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  rows="0"
                  auto-grow
                  outlined
                ></v-textarea>
              </v-col>

              <!-- <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="teamMembers"
                  label="Team Members"
                  outlined
                  :rules="[
                    (v) =>
                      teamMembers.length > 0 ||
                      'At least one user must be selected',
                  ]"
                  item-text="full_user_name"
                  item-value="user_email_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  multiple
                  placeholder="Min 3 Character"
                  @input="searchF = ''"
                >
                </v-autocomplete>
              </v-col> -->
              <v-col cols="6">
                <v-menu
                  ref="fromMenu"
                  v-model="fromMenu"
                  :close-on-content-click="false"
                  :return-value.sync="fromDate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="fromDate"
                      outlined
                      :rules="[(v) => !!v || 'Required ']"
                      label="Start Date"
                      readonly
                      dense
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="fromDate" no-title scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="fromMenu = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.fromMenu.save(fromDate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  ref="toMenu"
                  v-model="toMenu"
                  :close-on-content-click="false"
                  :return-value.sync="toDate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="toDate"
                      outlined
                      dense
                      class="ml-2"
                      label="End Date"
                      :rules="[(v) => !!v || 'Required ']"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="toDate" no-title scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="toMenu = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.toMenu.save(toDate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-radio-group label="Project Type" v-model="projectType" row>
                  <v-radio label="Internal" value="INTERNAL_PROJECT"></v-radio>
                  <v-radio label="External" value="EXTERNAL_PROJECT"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
        
<script>
/*eslint-disable*/
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_all_projects } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    projectCreationDialog: Boolean,
  },

  mixins: [get_all_org_users],
  data() {
    return {
      fromDate: "",
      toDate: "",
      toMenu: false,
      fromMenu: false,
      projectName: "",
      projectDescription: "",
      teamMembers: [],
      userArray: [],
      searchF: "",
      projectType: "",
      loading: false,
    };
  },
  watch: {
    projectCreationDialog: {
      async handler() {
        if (this.projectCreationDialog == true) {
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          this.fetch_details();
          var currentUser = {
            full_user_name: this.$store.getters.GetUserObj.user.full_user_name,
            user_email_id: this.$store.getters.GetUserObj.user.user_email_id,
          };
          this.teamMembers = [currentUser];
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
            user_email_id: element.user_email_id,
          });
        }
      });
    },

    formatDate(date) {
      if (!date) return "";
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    parseDate(formattedDate) {
      const [day, month, year] = formattedDate.split("/");
      return new Date(`${month}/${day}/${year}`);
    },

    close_dialog() {
      this.$emit("clicked", 0);

      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_all_projects, {
            input: {
              project_name: this.projectName,
              project_visibility: "RESTRICTED_MEMBERS",
              // project_visible_members: this.teamMembers,
              project_type: this.projectType,
              project_start_date: this.fromDate,
              project_end_date: this.toDate,
              project_description: this.projectDescription,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_all_projects);
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
  },
};
</script>
        
        <style>
</style>
<template>
  <div>
    <!--eslint-disable  -->
    <v-dialog :model-value="repcreation" @update:model-value="$emit('update:repcreation', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add User</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => v.length > 0 || 'required ']"
                  outlined
                  item-text="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  @input="searchF = ''"
                  class="mt-2"
                  :search-input.sync="searchF"
                  hide-no-data
                  placeholder="Min 3 Character"
                >
                </v-autocomplete>
                <v-autocomplete
                  dense
                  v-model="selectprojectsite"
                  label="Select Project Site"
                  :rules="[(v) => v.length > 0 || 'required ']"
                  outlined
                  item-text="text"
                  item-value="value"
                  class="mt-2"
                  :items="projectitems"
                  :search-input.sync="searchV"
                  multiple
                  hide-no-data
                  placeholder="Min 3 Character"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
          <!-- <v-stepper v-model="stepperflow" vertical>
            <v-stepper-step :complete="stepperflow > 1" step="1">
              Map an Project Site
            </v-stepper-step>
            <v-stepper-content step="1">
              <v-card flat>
                <v-form ref="form">
                 
                </v-form>
              </v-card>
              <v-btn class="text-capitalize cardCss" dark @click="nextstep()">
                Continue
              </v-btn>
            </v-stepper-content>

            <v-stepper-step step="2"> Select a User</v-stepper-step>
            <v-stepper-content step="2">
              <v-card flat>
                <v-form ref="form3">
                 
                </v-form>
              </v-card>
              <v-btn
                class="text-capitalize cardCss"
                dark
                @click="stepperflow = 1"
              >
                Previous
              </v-btn>
              <v-btn
                class="text-capitalize cardCss ml-2"
                dark
                @click="save_action"
                :loading="loading"
              >
                Add
              </v-btn>
            </v-stepper-content>
          </v-stepper> -->
          <v-card-actions class="justify-end">
            <v-btn
              :loading="loading"
              @click="save_action()"
              dark
              class="text-capitalize cardCss button-corner"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/*eslint-disable*/

import { get_location_details } from "@/mixins/GetLocations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_project_site_user } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    repcreation: Boolean,
  },
  mixins: [get_all_org_users, get_location_details],
  watch: {
    repcreation: {
      async handler() {
        if (this.repcreation == true) {
          this.stepperflow = 1;
          this.selectprojectsite = [];
          this.selectTeam = [];
          this.$store.commit("Setnamesearch", "");
          await Promise.all([
            this.get_all_org_users(),
            this.get_location_details(),
          ]);
          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      stepperflow: 1,
      userArray: [],
      selectTeam: [],
      searchF: "",
      loading: false,
      selectprojectsite: [],
      projectitems: [],
      searchV: "",
    };
  },
  methods: {
    nextstep() {
      if (this.$refs.form.validate()) {
        this.stepperflow = 2;
      }
    },

    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.selectTeam = [];
      this.selectprojectsite = [];
      this.$emit("clicked", 0);
    },
    save_action() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },
    fetch_details() {
      this.projectitems = [];
      var loaction = this.locationList;
      loaction = loaction.filter((obj) => obj.location_type == "PROJECT SITE");
      loaction.forEach((element) => {
        this.projectitems.push({
          text: element.location_name,
          value: element.location_id,
        });
      });

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },
    async add_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_project_site_user, {
            input: {
              user_email_id: [this.selectTeam],
              project_site_id: this.selectprojectsite,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_project_site_user);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "dataValue");
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
          this.selectprojectsite = [];
          this.selectTeam = [];
          this.stepperflow = 1;
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
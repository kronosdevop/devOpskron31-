<template>
  <div>
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--white">
          <div class="custom-title">Edit Project</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-stepper class="mt-2" v-model="projectEdit">
          <v-stepper-header>
            <v-stepper-step
              style="font-size: 12px"
              :complete="projectEdit > 1"
              step="1"
            >
              Basic Information
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step
              style="font-size: 12px"
              :complete="projectEdit > 2"
              step="2"
            >
              Goals and Objectives
            </v-stepper-step>
            <v-divider></v-divider>

            <v-stepper-step
              style="font-size: 12px"
              :complete="projectEdit > 3"
              step="3"
            >
              Resources and Budget
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step style="font-size: 12px" step="4">
              Advance Settings
            </v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-form ref="form">
                <v-row no-gutters class="mt-4">
                  <v-col cols="6">
                    <v-textarea
                      dense
                      v-model="projectName"
                      label="Project Name"
                      :rules="[(v) => !!v || 'required ']"
                      class=""
                      rows="0"
                      auto-grow
                      outlined
                    ></v-textarea>
                  </v-col>
                  <v-col cols="6">
                    <v-textarea
                      dense
                      v-model="projectDescription"
                      label="Project Description"
                      :rules="[(v) => !!v || 'required ']"
                      class="ml-2"
                      rows="0"
                      auto-grow
                      outlined
                    ></v-textarea>
                  </v-col>

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
                  <v-col cols="6">
                    <v-select
                      outlined
                      dense
                      v-model="categoryType"
                      label="Category"
                      :items="[
                        'Software and IT',
                        'Construction and Engineering',
                        'Marketing and Advertising',
                        'Business and Operations',
                        'Research and Development',
                        'Education and Training',
                        'Events and Entertainment',
                        'Environmental and Sustainability',
                        'Healthcare',
                        'Manufacturing',
                        'Creative and Design',
                      ]"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      dense
                      outlined
                      :items="locationItems"
                      class="ml-2"
                      v-model="projectLocation"
                      item-text="location_name"
                      item-value="location_id"
                      multiple
                      label="Select Location"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      dense
                      outlined
                      :rules="[(v) => !!v || 'required ']"
                      :items="['INTERNAL', 'EXTERNAL']"
                      label="Project Sponsor"
                      v-model="projectSponser"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-textarea
                      dense
                      label="Skills Required"
                      class="ml-2"
                      rows="0"
                      auto-grow
                      outlined
                    ></v-textarea>
                  </v-col>
                  <v-col v-show="projectSponser == 'INTERNAL'" cols="6">
                    <v-autocomplete
                      dense
                      v-model="clientSponser"
                      label="Select User"
                      outlined
                      :rules="[(v) => !!v || 'required ']"
                      item-text="full_user_name"
                      item-value="user_email_id"
                      :items="userArray"
                      :search-input.sync="searchp"
                      hide-no-data
                      placeholder="Min 3 Character"
                      @input="searchp = ''"
                    >
                    </v-autocomplete>
                  </v-col>
                  <v-col
                    class="mt-n2"
                    v-show="projectSponser == 'EXTERNAL'"
                    cols="12"
                  >
                    Client Details
                  </v-col>
                  <v-col v-show="projectSponser == 'EXTERNAL'" cols="6">
                    <v-text-field
                      dense
                      outlined
                      v-model="clientName"
                      :rules="
                        projectSponser === 'EXTERNAL'
                          ? [(v) => !!v || 'Client Name is required']
                          : []
                      "
                      label="Client Name"
                    ></v-text-field>
                  </v-col>
                  <v-col v-show="projectSponser == 'EXTERNAL'" cols="6">
                    <v-text-field
                      dense
                      outlined
                      class="ml-2"
                      :rules="
                        projectSponser === 'EXTERNAL'
                          ? [(v) => !!v || 'Client Name is required']
                          : []
                      "
                      v-model="clientEmail"
                      label="Client Email"
                    ></v-text-field>
                  </v-col>

                  <v-col v-show="projectSponser == 'EXTERNAL'" cols="6">
                    <v-select
                      dense
                      v-model="clientccode"
                      label="Country Code"
                      :items="countryitems"
                      :rules="
                        projectSponser === 'EXTERNAL'
                          ? [(v) => !!v || 'Client Name is required']
                          : []
                      "
                      class=""
                      item-text="name"
                      item-value="code"
                      outlined
                    ></v-select>
                  </v-col>
                  <v-col v-show="projectSponser == 'EXTERNAL'" cols="6">
                    <v-text-field
                      dense
                      outlined
                      class="ml-2"
                      :rules="
                        projectSponser === 'EXTERNAL'
                          ? [(v) => !!v || 'Client Name is required']
                          : []
                      "
                      v-model="clientContactNumber"
                      label="Client Contact Number"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
              <v-card-actions class="justify-end">
                <v-btn
                  depressed
                  @click="validate_request()"
                  dark
                  class="cardCss text-capitalize button-corner ml-2"
                >
                  Next
                </v-btn>
              </v-card-actions>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import CountryList from "@/JsonFiles/CountryList.json";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  mixins: [get_location_details],
  data() {
    return {
      projectEdit: "",
      projectDescription: "",
      projectName: "",
      fromDate: "",
      toDate: "",
      toMenu: false,
      fromMenu: false,
      categoryType: "",
      userArray: [],
      searchF: "",
      locationItems: [],
      projectLocation: "",
      projectSponser: "",
      clientSponser: "",
      searchp: "",
      clientName: "",
      clientEmail: "",
      clientccode: "",
      countryitems: [],
      clientContactNumber: "",
    };
  },
  async created() {
    var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));

    await this.get_location_details();
    this.fetch_details();
  },
  methods: {
    fetch_details() {
      var userList = JSON.parse(localStorage.getItem("allOrgUsers"));

      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
      var locationupdate = this.locationList.filter(
        (obj) =>
          obj.location_type == "OFFICE" || obj.location_type == "PROJECT SITE"
      );

      locationupdate.forEach((element) => {
        this.locationItems.push({
          location_name: element.location_name,
          location_id: element.location_id,
        });
      });
    },
    validate_request() {},
  },
};
</script>
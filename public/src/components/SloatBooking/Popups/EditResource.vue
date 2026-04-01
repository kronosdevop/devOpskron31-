<template>
  <div>
    <v-card flat variant="outlined" class="ma-2 bg-white">
      <OverlayComp :overlay="overlay" />
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar density="compact" flat >
        <v-toolbar-title>Edit {{ rowData.resource_name }} </v-toolbar-title>
        <v-spacer />
        <!-- <v-btn
          dark
          @click="resource_Creation()"
          class="text-capitalize cardCss mr-2"
          >Edit r</v-btn
        > -->

        <v-btn
          @click="back_call()"
          dark
          fab
          elevation="0"
          size="small"
          color="primary"
        >
          <v-icon dark> mdi-step-backward-2 </v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row no-gutters>
            <v-col cols="6">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    density="compact"
                    v-model="resourceName"
                    label="Resource Name"
                    :rules="[(v) => !!v || 'required ']"
                    class="mt-n2"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    density="compact"
                    v-model="resourceDescription"
                    label="Resource Description"
                    :rules="[(v) => !!v || 'required ']"
                    class="mt-n1"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row class="mt-1" no-gutters>
                <v-col cols="12">
                  <v-select
                    density="compact"
                    v-model="slots"
                    label="Slot Duration"
                    readonly
                    :items="slotsitems"
                    class=""
                    :rules="[(v) => !!v || 'required ']"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>
              <div v-if="slots != '24_Hour'" class="text-left mt-n3">
                <b>Slot Availability</b>
              </div>
              <v-row v-if="slots != '24_Hour'" no-gutters>
                <v-col class="mt-1" cols="6">
                  <v-menu
                    ref="menu1"
                    v-model="fromMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="formTime"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template #activator="{ on, attrs }">
                      <v-text-field
                        v-model="formTime"
                        label="From"
                        variant="outlined"
                        :rules="[(v) => !!v || 'Required ']"
                        density="compact"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="fromMenu"
                      format="24hr"
                      v-model="formTime"
                      disabled
                      full-width
                      @click:minute="$refs.menu1.save(formTime)"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
                <v-col class="mt-1" cols="6">
                  <v-menu
                    ref="menu3"
                    v-model="toTimeMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="toTime"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template #activator="{ on, attrs }">
                      <v-text-field
                        v-model="toTime"
                        label="To"
                        variant="outlined"
                        :rules="[(v) => !!v || 'Required ']"
                        density="compact"
                        class="ml-2"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="toTimeMenu"
                      v-model="toTime"
                      disabled
                      format="24hr"
                      full-width
                      @click:minute="$refs.menu3.save(toTime)"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <div class="text-left mt-n3"><b>Booking Time Ahead</b></div>
              <v-row no-gutters>
                <v-col cols="12">
                  <!-- <v-row no-gutters>
                      <v-col cols="10"> -->
                  <v-radio-group
                    v-model="priorBooking"
                    inline
                    class="mt-4"
                    color="blue"
                  >
                    <v-radio
                      label="Immediate"
                      class="mt-n2"
                      value="immediate"
                    ></v-radio>
                    <v-radio
                      @click="get_hourly(24)"
                      class="mt-n2"
                      label="Hourly"
                      value="hours"
                    ></v-radio>
                    <v-radio
                      @click="get_hourly(5)"
                      class="mt-n2"
                      label="Days"
                      value="days"
                    ></v-radio>
                  </v-radio-group>
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-if="priorBooking == 'hours'"
                    v-model="hourlyBasics"
                    :items="globalItems"
                    :rules="
                      priorBooking == 'hours' ? [(v) => !!v || 'required '] : []
                    "
                    item-text="title"
                    item-value="value"
                    label="Select Hours"
                    class="ml-n2"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>
                <v-col v-if="priorBooking == 'days'" cols="12">
                  <v-select
                    v-model="dayBasics"
                    :rules="
                      priorBooking == 'days' ? [(v) => !!v || 'required '] : []
                    "
                    item-title="full_user_name"
                    item-value="user_id"
                    :items="globalItems"
                    label="Select Days"
                    class="ml-n2"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4">
                  <v-checkbox
                    class="mt-n4"
                    v-model="slotPayed"
                    label="Is It Paid ?"
                    color="blue"
                  ></v-checkbox>
                </v-col>
                <v-col v-if="slotPayed == true" cols="4">
                  <v-select
                    density="compact"
                    variant="outlined"
                    :rules="
                      slotPayed == true ? [(v) => !!v || 'required '] : []
                    "
                    v-model="currency"
                    class="mt-n2 ml-n3"
                    :items="['INR', 'USD']"
                    label="Currency"
                  />
                </v-col>
                <v-col v-if="slotPayed == true" cols="4">
                  <v-text-field
                    class="ml-2 mt-n2"
                    v-model="paymentCost"
                    :rules="
                      slotPayed == true ? [(v) => !!v || 'required '] : []
                    "
                    variant="outlined"
                    label="Price/Slot"
                    density="compact"
                    @keypress="onlyNumbers"
                  />
                </v-col>
              </v-row>
              <div class="text-left mt-n3"><b>Co-ordinator</b></div>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-select
                    density="compact"
                    v-model="cordinatoarMembers"
                    :items="userArray"
                    class="mt-2"
                    item-text="title"
                    item-value="value"
                    return-object
                    variant="outlined"
                    @input="get_selected_data()"
                  ></v-select>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="6"> </v-col>
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
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { edit_and_get_delete_resource } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  props: {
    rowData: Object,
  },
  components: {
    OverlayComp,
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      resourceName: "",
      resourceDescription: "",
      fromMenu: false,
      formTime: "",
      toTimeMenu: false,
      toTime: "",
      slotsitems: [],
      slots: "",
      priorBooking: null,
      hourlyBasics: "",
      globalItems: [],
      dayBasics: "",
      paymentCost: "",
      slotPayed: false,
      userArray: [],
      cordinatoarMembers: "",
      loading: false,
      currency: "",
      overlay: false,
      SnackBarComponent: {},
      valueChange: false,
      globalresponse: {},
    };
  },
  async mounted() {
    this.overlay = true;
    this.generate_interval_options();
    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users();
    this.fetch_details();
    await this.get_resource_details();
  },
  methods: {
    onlyNumbers(event) {
      if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    },
    back_call() {
      this.$emit("backAction", 0);
    },

    async get_resource_details() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_and_get_delete_resource, {
            input: {
              action_type: "GET",
              organization_id: data.organization.organization_id,
              resource_id: this.rowData.resource_id,
            },
          })
        );

        var response = JSON.parse(result.data.edit_and_get_delete_resource);
        this.overlay = false;
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.globalresponse = response;
          this.resourceName = response.data.resource_name;
          this.resourceDescription = response.data.resource_description;
          this.formTime = response.data.resource_slot_availabity.start_time;
          this.toTime = response.data.resource_slot_availabity.end_time;
          this.slots = response.data.resource_slot_duration;
          this.priorBooking = this.fetch_prioir_data(
            response.data.resource_booking_time_ahead
          );
          this.slotPayed = response.data.is_resource_slot_paid;
          this.paymentCost =
            response.data.is_resource_slot_paid == true
              ? response.data.resource_slot_price
              : "";
          this.currency =
            response.data.is_resource_slot_paid == true
              ? response.data.resource_amount_type
              : "";
          this.cordinatoarMembers =
            response.data.resource_slot_cordinators.length != 0
              ? response.data.resource_slot_cordinators[0].full_user_name
              : "";

          //   this.tableData = response.data;
        } else {
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    fetch_prioir_data(value) {
      var data = "";
      if (value == "IMMEDIATE") {
        data = "immediate";
      } else if (value.endsWith("hours") == true) {
        data = "hours";
        this.get_hourly(24);
        this.hourlyBasics = value;
        // this.hourlyBasics = value.replace("_hours", " ");
      } else if (value.endsWith("days") == true) {
        data = "days";
        this.get_hourly(5);
        // this.dayBasics = value.replace("_days", " ");
        this.dayBasics = value;
      }
      return data;
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
            user_email_id: element.user_email_id,
          });
        }
      });
    },

    generate_interval_options() {
      this.slotsitems = [];
      const durations = [
        15, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780,
        840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1440,
      ];
      for (const duration of durations) {
        let value;
        if (duration < 60) {
          value = `${duration}_Minutes`;
        } else {
          value = `${Math.floor(duration / 60)}_Hour`;
        }

        const label = value.replace("_", " ");
        this.slotsitems.push({ title: label, value });
      }
    },

    get_hourly(val) {
      this.globalItems = [];
      for (var i = 1; i <= val; i++) {
        this.globalItems.push({
          title: i,
          value: val == 24 ? i + "_hours" : i + "_days",
        });
      }
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // console.log( this.dayBasics);
        // this.fetch_cordinators();
        this.update_respource_type();
      }
    },

    async update_respource_type() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_and_get_delete_resource, {
            input: {
              organization_id: data.organization.organization_id,
              resource_name: this.resourceName,
              action_type: "UPDATE",
              resource_id: this.rowData.resource_id,
              resource_slot_availabity: this.fetch_slot2_avliablity(),
              resource_images: JSON.stringify(this.rowData.resource_images),
              resource_booking_time_ahead: this.fetch_prior_booking(),
              resource_slot_duration: this.slots,
              is_resource_slot_paid: this.slotPayed,
              resource_slot_cordinators: this.fetch_cordinators(),
              resource_slot_price:
                this.slotPayed == true ? this.paymentCost : undefined,
              resource_description: this.resourceDescription,
              resource_amount_type:
                this.slotPayed == true ? this.currency : undefined,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.edit_and_get_delete_resource);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    fetch_cordinators() {
      var data = [];
      if (this.valueChange == true) {
        data.push(this.cordinatoarMembers);
      } else {
        data = this.globalresponse.data.resource_slot_cordinators;
      }

      return JSON.stringify(data);
    },

    get_selected_data() {
      this.valueChange = true;
    },

    fetch_slot2_avliablity() {
      var data = {
        start_time: this.formTime,
        end_time: this.toTime,
      };
      return JSON.stringify(data);
    },

    fetch_prior_booking() {
      var data = "";
      if (this.priorBooking == "immediate") {
        data = "IMMEDIATE";
      } else if (this.priorBooking == "hours") {
        // data = this.hourlyBasics + "_" + "hours";
        data = this.hourlyBasics;
      } else if (this.priorBooking == "days") {
        // data = this.dayBasics + "_" + "days";
        data = this.dayBasics;
      }

      return data;
    },
  },
};
</script>
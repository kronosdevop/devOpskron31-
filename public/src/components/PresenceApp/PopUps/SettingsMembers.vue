<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="membersUpdate"
      @update:model-value="membersUpdate = $event"
      persistent
      max-width="550"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title>
            <div class="custom-title">Members Setting</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-2"
                  >mdi-map-marker-radius</v-icon
                >
                <span class="text-subtitle-1 font-weight-medium">
                  Location Settings
                </span>
              </div>
            <v-radio-group
              v-model="locationupdate"
              @change="locationCheck()"
              color="primary"
            >
              <v-radio
                label="Scan Anywhere (outside the organization's geofenced locations)"
                value="scananywhere"
              ></v-radio>
              <v-radio
                label="Scan within organization locations (any geo-fenced locations)"
                value="geoloc"
              ></v-radio>
              <v-radio
                label="Assign only one location to user (choose the location)"
                value="assignloc"
              ></v-radio>
            </v-radio-group>
            <v-autocomplete
              v-model="loaction"
              v-show="locationupdate == 'assignloc'"
              label="Location"
              :items="loactionitems"
              :search-input.sync="searchloc"
              :rules="
                locationupdate == 'assignloc' ? [(v) => !!v || 'required '] : []
              "
              hide-no-data
              hide-selected
              style="max-width: 250px"
              class=""
              item-text="title"
              item-value="location_id"
              density="compact"
              variant="outlined"
            />
            <v-divider class="mb-4" />

              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="mr-2"
                  >mdi-clock-time-four</v-icon
                >
                <span class="text-subtitle-1 font-weight-medium">
                  Work Shift
                </span>
              </div>

              <v-select
                v-model="selectedWorkShift"
                :items="workshifts"
                item-title="work_shift_timings_name"
                item-value="work_shift_timings_id"
                label="Select work shift"
                density="comfortable"
                variant="outlined"
                return-object
                prepend-inner-icon="mdi-calendar-clock"
              />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_inputs()"
            dark
            class="text-capitalize cardCss button-corner text-white"
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
import { update_user_presence_settings } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_work_shifts } from "@/mixins/GetWorkShifts.js";

export default {
  props: {
    membersUpdate: Boolean,
    membersItem: Object,
  },
  mixins: [get_location_details, get_work_shifts ],
  data() {
    return {
      loading: false,
      locationupdate: null,
      loaction: "",
      searchloc: "",
      loactionitems: [],
      selectedWorkShift: "",
      workshifts: [],
    };
  },
  watch: {
    membersUpdate: {
      async handler() {
        if (this.membersUpdate == true) {
          await this.get_location_details();
                  this.workshifts = await this.get_work_shifts();
            this.selectedWorkShift = this.membersItem.presence_settings.work_shift_timings_name;
          await this.fetch_details();
          this.locationupdate = "scananywhere";

          try {
            if (
              this.membersItem?.presence_settings &&
              typeof this.membersItem.presence_settings === "string"
            ) {
              const scandetails = JSON.parse(
                this.membersItem.presence_settings
              );

              if (
                scandetails.location_id === "" &&
                scandetails.is_scan_anywhere === true
              ) {
                this.locationupdate = "scananywhere";
                this.loaction = "";
              } else if (
                scandetails.location_id === "ANY_LOCATION" &&
                scandetails.is_scan_anywhere === false
              ) {
                this.locationupdate = "geoloc";
                this.loaction = "";
              } else {
                this.locationupdate = "assignloc";
                this.loaction = scandetails.location_id;
              }
            } else if (this.membersItem?.presence_settings) {
              // If presence_settings is already an object
              const scandetails = this.membersItem.presence_settings;
              if (
                scandetails.location_id === "" &&
                scandetails.is_scan_anywhere === true
              ) {
                this.locationupdate = "scananywhere";
                this.loaction = "";
              } else if (
                scandetails.location_id === "ANY_LOCATION" &&
                scandetails.is_scan_anywhere === false
              ) {
                this.locationupdate = "geoloc";
                this.loaction = "";
              } else {
                this.locationupdate = "assignloc";
                this.loaction = scandetails.location_id;
              }
            } else {
              // Default values if no settings exist
              this.locationupdate = "scananywhere";
              this.loaction = "";
            }
          } catch (error) {
            console.error("Error parsing presence settings:", error);
            // Set default values in case of error
            this.locationupdate = "scananywhere";
            this.loaction = "";
            this.$emit(
              "errorMsg",
              "Error loading presence settings. Using default values."
            );
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async validate_inputs() {
      const { valid } = await this.$refs.form?.validate?.();
      if (valid) {
        this.update_mutation();
      }
    },
    locationCheck() {
      this.loaction = "";
    },
    fetch_details() {
      this.loactionitems = [];
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          title: element.location_name,
          location_id: element.location_id,
        });
      });
    },
    async update_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_user_presence_settings, {
            input: {
              user_id: this.membersItem.user_id,
              presence_settings: JSON.stringify({
                 work_shift_timings_id:
            this.selectedWorkShift?.work_shift_timings_id || null,
          work_shift_timings_name:
            this.selectedWorkShift?.work_shift_timings_name || null,
                is_scan_anywhere:
                  this.locationupdate == "scananywhere" ? true : false,
                location_id:
                  this.locationupdate == "scananywhere"
                    ? ""
                    : this.locationupdate == "geoloc"
                    ? "ANY_LOCATION"
                    : this.loaction,
              }),
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.update_user_presence_settings);
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
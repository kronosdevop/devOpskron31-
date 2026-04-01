<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addDialog"
      @update:model-value="$emit('update:addDialog', $event)"
      persistent
      :max-width="actionType == 'ADD' ? 500 : 400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{ actionType == "ADD" ? "Add Holiday" : "Delete Holiday" }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
          <div v-if="actionType == 'Delete'" class="text-left">
            <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
            Are you sure you want to delete
            <b> {{ rowInfo.holiday_name }}</b> ?
          </div>
          <v-form v-if="actionType == 'ADD'" ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="loaction"
                  v-if="checkholiday == false"
                  label="Select Location"
                  :items="loactionitems"
                  :search-input.sync="searchloc"
                  hide-no-data
                  hide-selected
                  class=""
                  item-text="location_name"
                  item-value="location_id"
                  variant="outlined"
                  return-object
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  v-model="holidayName"
                  label="Holiday Name"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="showDatePicker"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  location="bottom"
                  offset="10"
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-model="displayDate"
                      label="Date"
                      readonly
                      density="compact"
                      class="ml-2"
                      :rules="[(v) => !!v || 'Required']"
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar"
                      v-bind="props"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    :min="new Date().toISOString().substr(0, 10)"
                    v-model="date"
                    @update:model-value="showDatePicker = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            v-if="actionType == 'ADD'"
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Add</v-btn
          >
          <v-btn
            v-if="actionType == 'Delete'"
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import { add_or_delete_hloiday } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  mixins: [get_location_details],
  props: {
    addDialog: Boolean,
    actionType: String,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      holidayName: "",
      date: "",
      checkholiday: null,
      showDatePicker: false,
      loaction: "",
      searchloc: "",
      loactionitems: [],
    };
  },
  computed: {
    displayDate() {
      if (!this.date) return "";

      const date = new Date(this.date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    },
  },
  watch: {
    addDialog: {
      async handler() {
        if (this.addDialog == true) {
          this.checkholiday =
            this.$store.getters.GetOrgDetails.organization
              .default_holiday_list == undefined
              ? true
              : this.$store.getters.GetOrgDetails.organization
                  .default_holiday_list;
         
          if (this.actionType == "ADD") {
            await this.get_location_details();
            await this.fetch_details();
          }
        }
      },
      immediate: true,
    },
  },

  methods: {
    formatDateToYYYYMMDD(dateString) {
      if (!dateString) return "";
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      
      return `${year}-${month}-${day}`;
    },
    
    close_dialog() {
      this.$emit("clicked", 0);
      this.showDatePicker = false;
      this.date = "";
      this.holidayName = "";
      this.loaction = "";
      this.searchloc = "";
      this.loactionitems = [];
    },
    fetch_details() {
      if (this.locationList && Array.isArray(this.locationList)) {
        this.locationList.forEach((element) => {
          this.loactionitems.push({
            location_name: element.location_name,
            location_id: element.location_id,
          });
        });
      }
    },
    async validate_data() {
      if (this.actionType == "ADD") {
        const { valid } = await this.$refs.form?.validate?.();
        if (valid) {
          this.add_holiday_list();
        }
      } else if (this.actionType == "Delete") {
        this.add_holiday_list();
      }
    },

    async add_holiday_list() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var inputParams = {};
      if (this.actionType == "ADD") {
        this.loaction = this.loaction == null ? "" : this.loaction;
        inputParams = {
          action_type: "ADD",
          holiday_date: this.formatDateToYYYYMMDD(this.date),
          holiday_name: this.holidayName,
          holiday_location:
            this.loaction.location_id == undefined
              ? ""
              : this.loaction.location_id,
          holiday_location_name:
            this.loaction.location_name == undefined
              ? ""
              : this.loaction.location_name,
          organization_id: data.organization.organization_id,
        };
      } else {
        inputParams = {
          action_type: "DELETE",
          organization_id: data.organization.organization_id,
          holiday_id: this.rowInfo.holiday_id,
        };
      }
      try {
        let result = await API.graphql(
          graphqlOperation(add_or_delete_hloiday, {
            input: inputParams,
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.add_or_delete_hloiday);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          if (this.actionType == "ADD") {
            this.$refs.form?.reset();
          }
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
     
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
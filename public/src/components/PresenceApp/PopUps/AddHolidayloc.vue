<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="holidayadd"
      @update:model-value="holidayadd = $event"
      persistent
      :max-width="800"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            Add Holiday
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form2">
            <v-autocomplete
              v-model="loaction"
              label="Select Location"
              :items="loactionitems"
              :search-input.sync="searchloc"
              hide-no-data
              hide-selected
              style="max-width: 250px"
              class="mt-4"
              :rules="[(v) => !!v || 'Required']"
              item-text="title"
              item-value="location_id"
              density="compact"
              variant="outlined"
              return-object
            />
          </v-form>

          <v-toolbar flat class="bg-white">
            <v-text-field
              density="compact"
              variant="outlined"
              style="max-width: 200px"
              v-model="holidayName"
              label="Holiday Name"
              class="mt-4"
              :rules="[(v) => !!v || 'Required']"
            />
            <v-text-field
              v-model="date"
              label="Date"
              readonly
              style="max-width: 200px"
              class="ml-2 mt-4"
              :rules="[(v) => !!v || 'Required']"
              density="compact"
              variant="outlined"
              @click="datePicker = true"
            >
              <v-dialog v-model="datePicker" persistent max-width="325">
                <v-card>
                  <v-date-picker
                    v-model="tempDate"
                   
                    color="#DB4C77"
                    class="primaryColor"
                  ></v-date-picker>
                  <v-card-actions>                        
                    <v-spacer />
                    <v-btn text color="primaryColor" @click="datePicker = false">Cancel</v-btn>
                    <v-btn text color="primaryColor" @click="saveDate">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-text-field>
            <v-btn
              @click="add_action()"
              size="x-small"
              class="ml-2 mt-n2 elevation-0 cardCss text-white"
              fab
              dark
            >
              <v-icon dark> mdi-plus </v-icon>
            </v-btn></v-toolbar
          >
          <v-data-table
            :fixed-header="fixed"
            :headers="holidayHeaders"
            :items="tableData"
            :loading="tableLoading"
            :sort-by="['holiday_date']"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="10"
            density="compact"
            class="mt-2 elevation-1 dtwidth"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon color="red" small @click="deleteItem(item)"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>

          <v-card-actions class="justify-end">
            <v-btn
              dark
              @click="validate_default_data()"
              :loading="loadingcustom"
              class="text-capitalize cardCss button-corner text-white mt-10"
              >Add</v-btn
            ></v-card-actions
          >
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
import { API, graphqlOperation } from "aws-amplify";
import { Get_holiday_list_portal_v1 } from "@/graphql/queries.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { create_custom_holidays } from "@/graphql/mutations.js";
export default {
  mixins: [get_location_details],
  data() {
    return {
      loaction: "",
      searchloc: "",
      loactionitems: [],
      loadingcustom: false,
      holidayName: "",
      menu: false,
      date: "",
      fixed: true,
      holidayHeaders: [
        { title: "Name", key: "holiday_name", sortable: false },
        { title: "Date", key: "holiday_date", sortable: false },
        { title: "Action", key: "actions", sortable: false },
      ],
      tableLoading: false,
      holidaylist: [],
      tableData: [],
      checkholiday: false,
      datePicker: false,
      tempDate: null,
      date1: null,
    };
  },
  props: {
    holidayadd: Boolean,
    rowInfo: Object,
  },
  watch: {
    holidayadd: {
      async handler() {
        this.checkholiday =
          this.$store.getters.GetOrgDetails.organization.default_holiday_list ==
          undefined
            ? true
            : this.$store.getters.GetOrgDetails.organization
                .default_holiday_list;
        await this.get_location_details();
        await this.fetch_details();
        await this.get_holiday_list();
      },
      immediate: true,
    },
    loaction: {
      handler(newVal) {
        if (newVal && newVal.location_id) {
          this.filtertable();
        } else {
          // Reset table data when location is cleared
          this.tableData = [];
          if (this.holidaylist && Array.isArray(this.holidaylist)) {
            this.tableData = [...this.holidaylist];
          }
        }
      },
      immediate: false,
    },
  },
  methods: {
    saveDate() {
      this.date1 = this.tempDate;
      this.date = this.tempDate ? this.formatDate(this.tempDate) : "";
      this.datePicker = false;
    },

  formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    filtertable() {
      this.tableData = [];
      
      if (this.holidaylist && Array.isArray(this.holidaylist)) {
        this.tableData = [...this.holidaylist];
        
        // Only filter if loaction is selected
        if (this.loaction && this.loaction.location_id) {
          this.tableData = this.tableData.filter(
            (holiday) => holiday.holiday_location === this.loaction.location_id
          );
        }
      }
    },
    close_dialog() {
      // Reset form validation and form
      if (this.$refs.form2) {
        this.$refs.form2.resetValidation();
        this.$refs.form2.reset();
      }
      
      // Reset all data values
      this.loaction = null;
      this.searchloc = "";
      this.holidayName = "";
      this.date = "";
      this.tableData = [];
      this.tempDate = null;
      this.date1 = null;
      
      this.$emit("clicked", 0);
    },
    add_action() {
      if (
        this.holidayName != "" &&
        this.holidayName != null &&
        this.date != "" &&
        this.date != null
      ) {
        const exists = this.tableData.some(
          (item) => item.holiday_date === this.date
        );
        if (!exists) {
          this.tableData.push({
            holiday_name: this.holidayName,
            holiday_date: this.date,
          });
          this.date = "";
          this.holidayName = "";
        } else {
          this.$emit("errorMsg", "Holiday date already exists");
        }
      } else {
        this.$emit("errorMsg", "Enter Holiday Name and Date");
      }
    },

    fetch_details() {
      if (this.locationList && Array.isArray(this.locationList)) {
        this.locationList.forEach((element) => {
          this.loactionitems.push({
            title: element.location_name,
            location_id: element.location_id,
          });
        });
      }
    },

  async validate_default_data() {
      const { valid } = await this.$refs.form2.validate();
      if (valid) {
        this.add_holiday_list();
      }
    },
    async add_holiday_list() {
      this.loadingcustom = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_custom_holidays, {
            input: {
              holiday_details: JSON.stringify(this.tableData),
              holiday_location: this.loaction?.location_id || "",
              holiday_location_name: this.loaction?.location_name || "",
            },
          })
        );
        this.loadingcustom = false;

        var response = JSON.parse(result.data.create_custom_holidays);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form2.resetValidation();
          this.$refs.form2.reset();
          this.loadingcustom = false;
        } else {
          this.loadingcustom = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loadingcustom = false;
      }
    },
    deleteItem(item) {
      const index = this.tableData.indexOf(item);
      if (index > -1) {
        this.tableData.splice(index, 1); // Remove item from the array
      }
    },
    async get_holiday_list() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(Get_holiday_list_portal_v1, {
            input: {
              organization_id: data.organization.organization_id,
              holiday_year: new Date().getFullYear(),
            },
          })
        );
        this.tableLoading = false;

        this.tableData = [];
        var response = JSON.parse(result.data.Get_holiday_list_portal_v1);
        if (response.Status == "SUCCESS") {
          var holiaydata = response.Data.filter(
            (holiday) =>
              holiday.holiday_location === "" ||
              holiday.holiday_location === undefined
          );
          this.holidaylist = response.Data;
          holiaydata.forEach((element) => {
            this.tableData.push({
              holiday_date: element.holiday_date,
              holiday_name: element.holiday_name,
            });
          });
        } else {
          this.tableData = [];
        }
      } catch (error) {
        // console.log(error);
        this.tableLoading = false;

        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>

<style>
</style>
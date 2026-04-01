<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="leaveRequestDialog"
      @update:model-value="leaveRequestDialog = $event"
      persistent
      max-width="800"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Leave Request</div>
          </v-toolbar-title>
          <v-spacer />
          <!-- <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon> -->
        </v-toolbar>
        <v-card-text>
          <v-form ref="form1">
            <v-row no-gutters>
              <v-col cols="6">
                <v-card class="mt-8">
                  <v-data-table
                    :headers="headers"
                    :items="tableData"
                    hide-default-footer
                    density="compact"
                    class="elevation-1 dtwidth"
                  />
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-col cols="12">
                  <v-select
                    v-model="selectLeaveType"
                    class="mt-4"
                    :items="leaveTypesGlobal"
                    :rules="[(v) => !!v || 'Required ']"
                    item-text="label"
                    item-value="value"
                    label="Leave Type*"
                    :menu-props="{ contentClass: 'select-items' }"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="From Date*"
                    variant="outlined"
                    density="compact"
                    v-model="fromDate"
                    @click="datePicker = true"
                    :rules="[(v) => !!v || 'Required ']"
                    class="mt-n6"
                    readonly
                  >
                    <v-dialog v-model="datePicker" persistent max-width="325">
                      <v-card>
                        <v-date-picker
                          v-model="tempDate"
                          :min="minmonth"
                          :allowed-years="allowedYears"
                          color="#DB4C77"
                          class="primaryColor"
                        ></v-date-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            text
                            color="primaryColor"
                            @click="datePicker = false"
                            >Cancel</v-btn
                          >
                          <v-btn text color="primaryColor" @click="saveDate"
                            >OK</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="To Date*"
                    variant="outlined"
                    density="compact"
                    v-model="toDateLeaves"
                    @click="datePickerTo = true"
                    :rules="[(v) => !!v || 'Required ']"
                    class="mt-n6"
                    readonly
                    :disabled="!fromDate"
                  >
                    <v-dialog v-model="datePickerTo" persistent max-width="325">
                      <v-card>
                        <v-date-picker
                          v-model="tempDateTo"
                          :min="fromDate"
                          :max="maxDate"
                          color="#DB4C77"
                          class="primaryColor"
                        ></v-date-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            text
                            color="primaryColor"
                            @click="datePickerTo = false"
                            >Cancel</v-btn
                          >
                          <v-btn text color="primaryColor" @click="saveDateTo"
                            >OK</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="fromDateDetails"
                    :items="leaveItems"
                    item-text="text"
                    item-value="value"
                    label="From Date Details*"
                    :rules="[(v) => !!v || 'Required ']"
                    class="mt-n6"
                    :menu-props="{ contentClass: 'select-items' }"
                    density="compact"
                    variant="outlined"
                    @input="get_selected_leve(fromDateDetails)"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="toDateDetails"
                    :items="leaveItems"
                    :readonly="checkLeaveType"
                    item-text="text"
                    item-value="value"
                    label="To Date Details*"
                    :rules="[(v) => !!v || 'Required ']"
                    class="mt-n6"
                    :menu-props="{ contentClass: 'select-items' }"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="reasonForLeave"
                    label="Reason For Leave*"
                    class="mt-n6"
                    density="compact"
                    variant="outlined"
                    rows="0"
                    maxlength="100"
                    :rules="[(v) => !!v || 'Required ']"
                  />
                </v-col>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end" style="border-top: 2px solid #eee">
          <v-btn text @click="close_dialog()">Back</v-btn>
          <v-btn color="primary" @click="validate_actions()" :loading="loading"
            >submit</v-btn
          >
        </v-card-actions>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            @click="validate_actions()"
            :loading="loading"
            class="text-white cardCss button-corner"
            >submit</v-btn
          >
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { get_leftout_leaves } from "@/mixins/GetLeavesCount.js";
import { request_apply_leave } from "@/graphql/mutations.js";
import moment from "moment";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    leaveRequestDialog: Boolean,
  },
  mixins: [get_leftout_leaves],
  data() {
    return {
      selectLeaveType: "",
      fromDate: "",
      minmonth: "",
      fromMenu: false,
      toDate: false,
      toDateLeaves: "",
      reasonForLeave: "",
      SnackBarComponent: {},
      maxDate: "",
      minDate: "",
      toDateDetails: "",
      fromDateDetails: "",
      leaveTypesGlobal: [],
      headers: [
        { title: "Leave  Type", value: "leave_type", sortable: false },

        {
          title: "Total",
          value: "total_leaves",
          sortable: false,
        },
        { title: "Pending", value: "remaining_leaves", sortable: false },
      ],
      tableData: [],
      allowedYears: [],
      selecetedFromDate: "",
      selectedToDate: "",
      leaveItems: [{ title: "Full", value: "Full" }],
      loading: false,
      checkLeaveType: false,
      datePicker: false,
      date: "",
      datePickerTo: false,
      tempDate: null,
      tempDateTo: null,
    };
  },
  watch: {
    leaveRequestDialog: {
      async handler() {
        if (this.leaveRequestDialog == true) {
          this.selectedDate = this.get_orgdate(
            this.$store.getters.GetUserObj.organization.organization_created_on
          );
          this.minmonth = moment(this.selectedDate, [
            "MM/DD/YYYY",
            "YYYY-MM-DD",
          ]).format("YYYY-MM-DD");
          this.tableData = [];
          await this.get_leftout_leaves();
          this.fetch_table_leave();
          // this.tableData = this.masterLeaves;
          this.fetch_master_leaves();
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const maximumDate = new Date(currentDate);
          //  new Date(currentYear, 10, 1);
          maximumDate.setDate(currentDate.getDate() + 90);
          const minimiumDate = new Date(currentDate);
          const lastDayOfYear = new Date(currentYear, 11, 31);
          const maxDateFinal =
            maximumDate < lastDayOfYear ? maximumDate : lastDayOfYear;
          // Use local date formatting to avoid timezone conversion issues with toISOString()
          this.minDate = this.formatDateLocal(minimiumDate); // Start from current date
          this.maxDate = this.formatDateLocal(maxDateFinal); // Max date (90 days or Dec 31, whichever is earlier)
          this.allowedYears = [currentYear];
        }
      },
      immediate: true,
    },
  },
  methods: {
    saveDate() {
      if (this.tempDate) {
        this.fromDate = this.formatDate(this.tempDate); // Format and assign tempDate to billdate

        // Reset "To Date" if it's now before the new "From Date"
        if (this.toDateLeaves && this.toDateLeaves < this.fromDate) {
          this.toDateLeaves = this.fromDate;
          this.tempDateTo = this.fromDate;
        }
      }
      this.datePicker = false; // Close the date picker
    },

    saveDateTo() {
      // Validate that "To Date" is not before "From Date"
      if (this.tempDateTo && this.fromDate && this.tempDateTo < this.fromDate) {
        this.$emit("errorMsg", "To Date cannot be before From Date");
        return;
      }

      if (this.tempDateTo) {
        this.toDateLeaves = this.formatDate(this.tempDateTo);
      }
      if (this.fromDate == this.toDateLeaves) {
        this.leaveItems = [
          { title: "Full", key: "Full" },
          { title: "First Half", key: "First Half" },
          { title: "Second Half", key: "Second Half" },
        ];
      } else {
        this.leaveItems = [{ title: "Full", key: "Full" }];
      }

      this.datePickerTo = false;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    
    formatDateLocal(date) {
      // Format date in local timezone to avoid UTC conversion issues with toISOString()
      // This ensures December 31 stays as December 31 regardless of timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    get_orgdate(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    fetch_table_leave() {
      this.tableData = [];
      this.masterLeaves.forEach((element) => {
        if (
          element.leave_type != "Week Off" &&
          element.leave_type != "Comp Off"
        ) {
          this.tableData.push(element);
        }
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      if (this.$refs.form1) {
        this.$refs.form1.reset();
      }
      // Reset all form fields
      this.selectLeaveType = "";
      this.fromDate = "";
      this.toDateLeaves = "";
      this.reasonForLeave = "";
      this.fromDateDetails = "";
      this.toDateDetails = "";
      this.checkLeaveType = false;
      this.tempDate = null;
      this.tempDateTo = null;
      this.datePicker = false;
      this.datePickerTo = false;
    },

    save_from_date(fromDate) {
      this.selecetedFromDate = fromDate;
      this.$refs.fromMenu.save(fromDate);
      this.toDate = "";
      this.toDateLeaves = "";
    },

    save_to_date(toDateLeaves) {
      this.selectedToDate = toDateLeaves;
      this.$refs.toDate.save(toDateLeaves);
      this.leaveItems = [];
      this.checkLeaveType = false;
      this.toDateDetails = "";
      this.fromDateDetails = "";

      if (this.selecetedFromDate == toDateLeaves) {
        this.leaveItems = [
          { title: "Full", key: "Full" },
          { title: "First Half", key: "First Half" },
          { title: "Second Half", key: "Second Half" },
        ];
      } else {
        this.leaveItems = [{ title: "Full", key: "Full" }];
      }
    },

    get_selected_leve(value) {
      this.checkLeaveType = false;
      this.toDateDetails = "";
      if (value == "First Half" || value == "Second Half") {
        this.checkLeaveType = true;
        this.toDateDetails = value;
      }
    },

    fetch_master_leaves() {
      this.leaveTypesGlobal = [];
      // console.log(this.masterLeaves);
      this.masterLeaves.forEach((element) => {
        if (
          element.leave_type != "Week Off" &&
          element.leave_type != "Comp Off"
        ) {
          this.leaveTypesGlobal.push({
            title: element.leave_type,
            value: element.leave_type,
          });
        }
      });

      // console.log(this.leaveTypesGlobal);
    },

    async validate_actions() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        this.submit_leave_application();
      }
    },

    async submit_leave_application() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(request_apply_leave, {
            input: {
              user_id: data.user.user_id,
              from_date: this.fromDate,
              to_date: this.toDateLeaves,
              from_date_details: this.fromDateDetails,
              to_date_details: this.toDateDetails,
              reason_for_leave: this.reasonForLeave,
              leave_type: this.selectLeaveType,
            },
          })
        );

        var response = JSON.parse(result.data.request_apply_leave);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.loading = false;
          // Reset form and close dialog after successful submission
          this.close_dialog();
        } else {
          this.$emit("errorMsg", response.Message);
          this.$refs.form1.reset();
          this.loading = false;
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].Message);
        this.$refs.form1.reset();
        this.loading = false;
      }
    },
  },
};
</script>
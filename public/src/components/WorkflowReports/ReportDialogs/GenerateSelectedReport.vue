<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="genrateSelectedReport"
      @update:model-value="genrateSelectedReport = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              {{ rowInfo.workflow_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  v-model="versionsNumber"
                  label="Current Version"
                  :items="allVerionsList"
                  item-title="workflow_version"
                  item-value="workflow_id"
                  @update:model-value="fetch_id(versionsNumber)"
                  return-object
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="displayFromDate"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required ']"
                  label="From Date"
                  readonly
                  density="compact"
                  @click="fromDateDialog = true"
                  append-inner-icon="mdi-calendar"
                >
                  <v-dialog v-model="fromDateDialog" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempFromDate"
                        :min="minallowedDate"
                        :max="maxAllowedDate"
                        color="#DB4C77"
                      />
                      <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="fromDateDialog = false"
                          >Cancel</v-btn
                        >
                        <v-btn text @click="saveFromDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="displayToDate"
                  variant="outlined"
                  density="compact"
                  label="To Date"
                  :rules="[(v) => !!v || 'Required ']"
                  readonly
                  @click="toDateDialog = true"
                  append-inner-icon="mdi-calendar"
                  :disabled="!fromDate"
                >
                  <v-dialog v-model="toDateDialog" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempToDate"
                        :min="fromDate"
                        :max="maxAllowedDate"
                        color="#DB4C77"
                      />
                      <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="toDateDialog = false">Cancel</v-btn>
                        <v-btn text @click="saveToDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  density="compact"
                  :items="[
                    { title: 'All', value: 'ALL' },
                    { title: 'In Progress', value: 'INPROGRESS' },
                    { title: 'Completed', value: 'COMPLETED' },
                    {
                      title: 'Rejected',
                      value: 'REJECTED',
                    },
                  ]"
                  v-model="selectStatus"
                  :rules="[(v) => !!v || 'Required ']"
                  variant="outlined"
                  label="Workflow Status"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss text-white"
            >Generate</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { generate_reports_for_particularWorkflows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    genrateSelectedReport: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      fromDate: "",
      toDate: "",
      selectStatus: "COMPLETED",
      toMenu: false,
      fromMenu: false,
      loading: false,
      maxAllowedDate: null,
      versionsNumber: "",
      minallowedDate: null,
      changecheck: false,
      allVerionsList: [],
      fromDateDialog: false,
      tempFromDate: "",
      toDateDialog: false,
      tempToDate: "",
    };
  },
  computed: {
    displayFromDate() {
      if (!this.fromDate) return "";
      const d = new Date(this.fromDate);
      if (isNaN(d)) return this.fromDate;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayToDate() {
      if (!this.toDate) return "";
      const d = new Date(this.toDate);
      if (isNaN(d)) return this.toDate;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
  watch: {
    genrateSelectedReport: {
      async handler() {
        if (this.genrateSelectedReport == true) {
          this.maxAllowedDate = null;
          this.minallowedDate = null;
          this.changecheck = false;
          await this.fetch_versions_list();
          // Find the object in allVerionsList that matches the workflow_id
          const matchingVersion = this.allVerionsList.find(
            (version) => version.workflow_id === this.rowInfo.workflow_id
          );
          this.versionsNumber = matchingVersion || null;
          this.maxAllowedDate = new Date().toISOString().split("T")[0];

          this.minallowedDate = this.fetch_value(
            this.rowInfo.workflow_created_on
          );

          this.selectStatus = "COMPLETED";

          // Default selected dates (user can change later)
          this.fromDate = this.getOneMonthAgoISO();
          this.toDate = this.getTodayISO();

          this.tempFromDate = this.fromDate;
          this.tempToDate = this.toDate;
        }
      },
      immediate: true,
    },
  },
  methods: {
    getTodayISO() {
      const d = new Date();
      return d.toISOString().split("T")[0];
    },

    getOneMonthAgoISO() {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split("T")[0];
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
      this.maxAllowedDate = null;
      this.minallowedDate = null;
      this.changecheck = false;
      this.fromDateDialog = false;
      this.toDateDialog = false;
      this.tempFromDate = "";
      this.tempToDate = "";
      this.fromDate = "";
      this.toDate = "";
      this.selectStatus = "COMPLETED";
      this.versionsNumber = "";
    },

    fetch_versions_list() {
      this.allVerionsList = [];
      const array1 = this.rowInfo.all_versions;
      array1.forEach((element) => {
        this.allVerionsList.push({
          workflow_version:
            element.workflow_version +
            " " +
            "( Created On" +
            " :" +
            this.fetch_date(element.workflow_created_on) +
            ")",
          workflow_id: element.workflow_id,
          workflow_created_on: element.workflow_created_on,
        });
      });
    },
    fetch_date(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      return (
        (date <= 9 ? "0" + date : date) +
        "-" +
        (month <= 9 ? "0" + month : month) +
        "-" +
        year
      );
    },
    fetch_id(val) {
      if (!val) return;
      this.changecheck = true;
      this.minallowedDate = this.fetch_value(val.workflow_created_on);
    },

    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      return (
        year +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        (+date <= 9 ? "0" + date : date)
      );
      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.generate_report();
      }
    },
    async generate_report() {
      this.loading = true;
      const data = this.$store.getters.GetUserObj;

      if (!this.versionsNumber) {
        this.loading = false;
        this.$emit("errorMsg", "Please select a valid version");
        return;
      }

      try {
        // FROM date (keep as selected date – midnight)
        const fromDateObj = new Date(this.fromDate);

        // TO date (selected date + current time)
        const toDateObj = new Date(this.toDate);
        const now = new Date();

        toDateObj.setHours(
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds()
        );

        let result = await API.graphql(
          graphqlOperation(generate_reports_for_particularWorkflows, {
            input: {
              workflow_id:
                this.changecheck === true
                  ? this.versionsNumber.workflow_id
                  : this.versionsNumber,

              report_from_date: Math.floor(fromDateObj.getTime() / 1000),
              report_to_date: Math.floor(toDateObj.getTime() / 1000),

              user_email_id: data.user.user_email_id,
              workflow_status: this.selectStatus,
            },
          })
        );

        this.loading = false;

        const response = JSON.parse(
          result.data.generate_reports_for_particularWorkflows
        );

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.changecheck = false;
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.error(error);
        this.loading = false;
        this.$emit(
          "errorMsg",
          error?.errorType?.errorMessage || "Something went wrong"
        );
      }
    },
    saveFromDate() {
      this.fromDate = this.tempFromDate;
      this.fromDateDialog = false;

      // Reset To Date if From Date is after current To Date
      if (this.fromDate && this.toDate) {
        if (this.fromDate > this.toDate) {
          this.toDate = this.fromDate;
          this.tempToDate = this.fromDate;
        }
      }
    },
    saveToDate() {
      this.toDate = this.tempToDate;
      this.toDateDialog = false;
    },
  },
};
</script>
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
              <v-col cols="12">
                <v-radio-group
                  v-model="selectGenerate"
                  label="Generate By"
                  color="primary"
                  inline
                >
                  <v-radio label="XLXS" value="xlxs"></v-radio>
                  <v-radio label="PDF" value="SINGLE"></v-radio>
                  <v-radio label="Individual PDF" value="MULTIPLE"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            :loading="loading"
            class="text-capitalize cardCss text-white"
            @click="handleGenerate"
          >
            Generate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { generate_reports_for_particularWorkflows } from "@/graphql/mutations.js";
import { generate_pdf_reports_for_particular_workflows } from "@/graphql/mutations.js";
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
      changecheck: false,
      allVerionsList: [],
      fromDateDialog: false,
      tempFromDate: "",
      toDateDialog: false,
      tempToDate: "",
      selectGenerate: "xlxs",
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
          await this.fetch_versions_list();
          // Find the object in allVerionsList that matches the workflow_id
          const matchingVersion = this.allVerionsList.find(
            (version) => version.workflow_id === this.rowInfo.workflow_id
          );
          this.versionsNumber = matchingVersion || null;
          this.maxAllowedDate = new Date().toISOString().split("T")[0];



          this.selectStatus = "COMPLETED";

          // Default selected dates (user can change later)
          this.fromDate = this.getOneMonthAgoISO();
          this.toDate = this.getTodayISO();

          this.tempFromDate = this.fromDate;
          this.tempToDate = this.toDate;
          this.selectGenerate = "xlxs";
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

    // async handleGenerate() {
    //   // Validate form first
    //   const { valid } = await this.$refs.form.validate();

    //   if (!valid) return;

    //   // After validation decide which API to call
    //   if (this.selectGenerate === "xlxs") {
    //     await this.generate_report();      // XLSX
    //   } else {
    //     await this.generate_pdf();         // SINGLE or MULTIPLE PDF
    //   }
    // },
    //   async generate_report() {
    //     this.loading = true;
    //     const data = this.$store.getters.GetUserObj;

    //     if (!this.versionsNumber) {
    //       this.loading = false;
    //       this.$emit("errorMsg", "Please select a valid version");
    //       return;
    //     }

    //     try {
    //       // FROM date (keep as selected date – midnight)
    //       const fromDateObj = new Date(this.fromDate);

    //       // TO date (selected date + current time)
    //       const toDateObj = new Date(this.toDate);
    //       const now = new Date();

    //       toDateObj.setHours(
    //         now.getHours(),
    //         now.getMinutes(),
    //         now.getSeconds(),
    //         now.getMilliseconds()
    //       );

    //       let result = await API.graphql(
    //         graphqlOperation(generate_reports_for_particularWorkflows, {
    //           input: {
    //             workflow_id:
    //               this.changecheck === true
    //                 ? this.versionsNumber.workflow_id
    //                 : this.versionsNumber,

    //             report_from_date: Math.floor(fromDateObj.getTime() / 1000),
    //             report_to_date: Math.floor(toDateObj.getTime() / 1000),

    //             user_email_id: data.user.user_email_id,
    //             workflow_status: this.selectStatus,
    //           },
    //         })
    //       );

    //       this.loading = false;

    //       const response = JSON.parse(
    //         result.data.generate_reports_for_particularWorkflows
    //       );

    //       if (response.Status === "SUCCESS") {
    //         this.$emit("successMsg", response.Message);
    //         this.$refs.form.reset();
    //         this.changecheck = false;
    //       } else {
    //         this.$emit("errorMsg", response.Message);
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       this.loading = false;
    //       this.$emit(
    //         "errorMsg",
    //         error?.errorType?.errorMessage || "Something went wrong"
    //       );
    //     }
    //   },
    //   async generate_pdf() {
    //     this.loading = true;
    //     const data = this.$store.getters.GetUserObj;

    //     if (!this.versionsNumber) {
    //       this.loading = false;
    //       this.$emit("errorMsg", "Please select a valid version");
    //       return;
    //     }

    //     try {
    //       // FROM date (keep as selected date – midnight)
    //       const fromDateObj = new Date(this.fromDate);

    //       // TO date (selected date + current time)
    //       const toDateObj = new Date(this.toDate);
    //       const now = new Date();

    //       toDateObj.setHours(
    //         now.getHours(),
    //         now.getMinutes(),
    //         now.getSeconds(),
    //         now.getMilliseconds()
    //       );

    //       let result = await API.graphql(
    //         graphqlOperation(generate_pdf_reports_for_particular_workflows, {
    //           input: {
    //             workflow_id:
    //               this.changecheck === true
    //                 ? this.versionsNumber.workflow_id
    //                 : this.versionsNumber,

    //             report_from_date: Math.floor(fromDateObj.getTime() / 1000),
    //             report_to_date: Math.floor(toDateObj.getTime() / 1000),

    //             user_email_id: data.user.user_email_id,
    //             workflow_status: this.selectStatus,
    //             pdf_mode: this.selectGenerate,
    //             organization_id: this.$store.getters.GetUserObj.organization.organization_id
    //           },
    //         })
    //       );

    //       this.loading = false;

    //       const response = JSON.parse(
    //         result.data.generate_pdf_reports_for_particular_workflows
    //       );

    //       if (response.Status === "SUCCESS") {
    //         // this.$emit("successMsg", response.Message);
    //         console.log("response", response)
    //         this.$refs.form.reset();
    //         this.changecheck = false;
    //       } else {
    //         this.$emit("errorMsg", response.Message);
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       this.loading = false;
    //       this.$emit(
    //         "errorMsg",
    //         error?.errorType?.errorMessage || "Something went wrong"
    //       );
    //     }
    //   },
    async handleGenerate() {
      console.log("Selected Generate Type:", this.selectGenerate);

      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      if (this.selectGenerate === "xlxs") {
        console.log("Calling XLSX API");
        await this.generate_report();
      } else {
        console.log("Calling PDF API");
        await this.generate_pdf();
      }
    },

    async generate_report() {
      this.loading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        const fromDateObj = new Date(this.fromDate);
        const toDateObj = new Date(this.toDate);
        const now = new Date();

        toDateObj.setHours(
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds()
        );

        const result = await API.graphql(
          graphqlOperation(generate_reports_for_particularWorkflows, {
            input: {
              workflow_id: this.changecheck
                ? this.versionsNumber.workflow_id
                : this.versionsNumber,

              report_from_date: Math.floor(fromDateObj.getTime() / 1000),
              report_to_date: Math.floor(toDateObj.getTime() / 1000),
              user_email_id: data.user.user_email_id,
              workflow_status: this.selectStatus,
            },
          })
        );

        const response = JSON.parse(
          result.data.generate_reports_for_particularWorkflows
        );

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", "Something went wrong");
      } finally {
        this.loading = false;
      }
    },

    async generate_pdf() {
      this.loading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        const fromDateObj = new Date(this.fromDate);
        const toDateObj = new Date(this.toDate);
        const now = new Date();

        toDateObj.setHours(
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds()
        );

        const result = await API.graphql(
          graphqlOperation(generate_pdf_reports_for_particular_workflows, {
            input: {
              workflow_id: this.changecheck
                ? this.versionsNumber.workflow_id
                : this.versionsNumber,

              report_from_date: Math.floor(fromDateObj.getTime() / 1000),
              report_to_date: Math.floor(toDateObj.getTime() / 1000),
              user_email_id: data.user.user_email_id,
              workflow_status: this.selectStatus,
              pdf_mode: this.selectGenerate,
              organization_id: data.organization.organization_id,
            },
          })
        );

        const response = JSON.parse(
          result.data.generate_pdf_reports_for_particular_workflows
        );

        if (response.Status === "SUCCESS") {
          // If single PDF
          if (this.selectGenerate === "SINGLE") {
            this.downloadFile(response.report_url);
          }

          // If multiple PDFs
          if (
            this.selectGenerate === "MULTIPLE" &&
            response.report_urls?.length
          ) {
            response.report_urls.forEach((url, index) => {
              this.downloadFile(url, `Report_${index + 1}.pdf`);
            });
          }

          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", "Something went wrong");
      } finally {
        this.loading = false;
      }
    },
    async downloadFile(url, fileName = "Report.pdf") {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;   // forces download
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
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
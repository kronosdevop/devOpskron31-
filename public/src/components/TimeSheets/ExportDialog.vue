<template>
  <v-dialog :model-value="ExportDialog" max-width="420" persistent>
    <v-card class="pa-5 timesheet-card" elevation="3">
      <!-- Header -->
      <div class="d-flex align-center mb-4">
        <v-icon color="#DB4C77" size="26" class="mr-3">mdi-cog</v-icon>
        <div>
          <h3 class="text-h6 font-weight-semibold mb-1">
            Timesheet Configuration
          </h3>
          <div class="text-caption text-grey">
            Configure filters and generate report
          </div>
        </div>
      </div>

      <v-divider class="mb-4" />

      <!-- Filters -->
      <v-row dense>
        <!-- Duration -->
        <v-col cols="12">
          <v-select
            v-model="duration"
            :items="item"
            item-title="title"
            item-value="value"
            label="Duration"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <!-- Scope -->
        <v-col cols="12">
          <v-select
            v-model="scope"
            :items="scopeOptions"
            item-title="title"
            item-value="value"
            label="Report Scope"
            variant="outlined"
            density="comfortable"
            hide-no-data
            :disabled="scopeOptions.length === 1"
          />
        </v-col>
        <v-col cols="12" v-if="scope === 'OWN'">
          <v-select
            density="compact"
            v-model="Projects"
            label="Select Project"
            :items="ProjectsItems"
            item-title="title"
            item-value="value"
            variant="outlined"
          ></v-select>
        </v-col>
        <v-col cols="12" v-if="scope === 'ALL'">
          <v-select
            density="compact"
            v-model="OrganizationProjects"
            label="Select Project"
            :items="ProjectsItemsOrg"
            item-title="title"
            item-value="value"
            variant="outlined"
          ></v-select>
        </v-col>

        <v-col cols="12" v-if="scope === 'SELECTED'">
          <v-autocomplete
            density="compact"
            v-model="selectedUsers"
            label="Select Users"
            variant="outlined"
            multiple
            chips
            closable-chips
            item-title="full_user_name"
            item-value="user_id"
            :items="userList"
            v-model:search-input="searchp"
            hide-no-data
            placeholder="Search users"
          />
        </v-col>

        <!-- Daily Date -->
        <v-col cols="12" v-if="duration === 'DAILY'">
          <v-text-field
            label="Select Date"
            variant="outlined"
            density="comfortable"
            v-model="dateDisplay"
            readonly
            append-inner-icon="mdi-calendar"
            @click="datePicker = true"
          />
        </v-col>

        <!-- Year -->
        <v-col cols="12" v-if="duration !== 'DAILY'">
          <v-select
            v-model="year"
            :items="years"
            label="Select Year"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <!-- Month -->
        <v-col cols="12" v-if="duration === 'MONTHLY'">
          <v-select
            v-model="month"
            :items="filteredMonths"
            item-title="title"
            item-value="value"
            label="Month"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-end gap-3">
        <v-btn variant="text" @click="closeDialog"> Cancel </v-btn>

        <v-btn
          color="green"
          class="generate-btn"
          elevation="1"
          :loading="loading"
          :disabled="loading"
          @click="export_timesheet"
        >
          <v-icon start v-if="!loading">mdi-file-document</v-icon>
          Generate Report
        </v-btn>
      </div>
    </v-card>

    <v-dialog v-model="datePicker" max-width="320" persistent>
      <v-card>
        <v-date-picker v-model="tempDate" :max="today" color="#DB4C77" />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="#DB4C77" @click="datePicker = false">
            Cancel
          </v-btn>
          <v-btn variant="text" color="#DB4C77" @click="saveDate"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>



<script>
import { custom_timesheet_reports } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
const FileSaver = require("file-saver");
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_project_list } from "@/mixins/GetProjectList.js";
import { get_Org_project_list } from "@/mixins/GetAllProjectsList.js";

import * as XLSX from "xlsx";
import axios from "axios";
export default {
  props: {
    ExportDialog: Boolean,
  },
  mixins: [get_all_org_users, get_project_list, get_Org_project_list],

  data() {
    return {
      scope: "OWN",
      loading: false,
      duration: "DAILY",
      datePicker: false,
      tempDate: null,
      selectedDate: null,
      today: new Date(),
      year: new Date().getFullYear(),
      month: "",
      organizationCreatedYear: null,
      item: [
        { title: "Daily", value: "DAILY" },
        { title: "Monthly", value: "MONTHLY" },
        { title: "Yearly", value: "YEARLY" },
      ],
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      selectedUsers: [],
      userList: [],
      searchp: "",
      ProjectsItems: [],
      Projects: "ALL",
      OrganizationProjects: "ALL",
      ProjectsItemsOrg: [],
    };
  },
  watch: {
    ExportDialog: {
      immediate: true,
      async handler(val) {
        if (val) {
          await this.get_project_list();
          if (this.ProjectList && this.ProjectList.length > 0) {
            this.ProjectsItems = [
              { title: "All", value: "ALL" }, // ✅ Always first
              ...this.ProjectList.map((element) => ({
                title: element.project_name,
                value: element.project_id,
              })),
            ];
          } else {
            this.ProjectsItems = [
              {
                title: "All",
                value: "ALL",
              },
            ];
          }

          this.Projects = "ALL"; // ✅ default selected
          await this.get_Org_project_list();
          if (this.OrgProjectList && this.OrgProjectList.length > 0) {
            this.ProjectsItemsOrg = [
              { title: "All", value: "ALL" }, // ✅ Always first
              ...this.OrgProjectList.map((element) => ({
                title: element.project_name,
                value: element.project_id,
              })),
            ];
          } else {
            this.ProjectsItemsOrg = [
              {
                title: "All",
                value: "ALL",
              },
            ];
          }
          this.OrganizationProjects = "ALL";
          this.resetForm();
        } else {
          this.resetForm();
        }
      },
    },
    userType: {
      immediate: true,
      handler(type) {
        if (type === "USER") {
          this.scope = "OWN";
        }
      },
    },
    scope(newVal) {
      if (newVal !== "SELECTED") {
        this.selectedUsers = [];
      }
    },
    scopeOptions: {
      immediate: true,
      handler(options) {
        if (options.length === 1) {
          this.scope = options[0].value;
        }
      },
    },
  },

  computed: {
    userType() {
      return this.$store.getters.GetUserObj.user?.user_type;
    },
    years() {
      if (!this.organizationCreatedYear) return [];

      const currentYear = new Date().getFullYear();
      const years = [];

      for (let y = this.organizationCreatedYear; y <= currentYear; y++) {
        years.push(y);
      }

      return years;
    },
    scopeOptions() {
      const user = this.$store.getters.GetUserObj?.user;

      const options = [];

      options.push({ title: "My Timesheet", value: "OWN" });

      if (user?.is_reporting_manager === true) {
        options.push({ title: "My Team", value: "TEAM" });
      }

      // ✅ Show for ADMIN or OWNER
      if (user?.user_type === "ADMIN" || user?.user_type === "OWNER") {
        options.push({ title: "All Users", value: "ALL" });
        options.push({ title: "Selected Users", value: "SELECTED" });
      }

      return options;
    },
    dateDisplay() {
      if (!this.selectedDate) return "";

      const [year, month, day] = this.selectedDate.split("-");
      return `${day}/${month}/${year}`;
    },
    formattedDate() {
      return this.selectedDate || null;
    },
    filteredMonths() {
      if (!this.year) return [];

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth();

      if (this.year < currentYear) {
        return this.months.map((m, i) => ({
          title: m,
          value: i + 1,
        }));
      }
      if (this.year === currentYear) {
        return this.months.slice(0, currentMonthIndex).map((m, i) => ({
          title: m,
          value: i + 1,
        }));
      }
      return [];
    },
    selectedProjectId() {
      if (this.scope === "OWN") {
        if (!this.Projects || this.Projects === "ALL") return undefined;
        return this.Projects;
      }

      if (this.scope === "ALL") {
        if (
          !this.OrganizationProjects ||
          this.OrganizationProjects === "ALL"
        )
          return undefined;
        return this.OrganizationProjects;
      }

      return undefined;
    },
  },
  async mounted() {
    const orgCreatedOn =
      this.$store.getters.GetUserObj.organization.organization_created_on;

    this.organizationCreatedYear = new Date(orgCreatedOn * 1000).getFullYear();
    this.year = new Date().getFullYear();

    await this.get_all_org_users();

    // keep only ACTIVE users (same logic as before)
    this.userList = this.orgUsers.filter((u) => u.user_status === "ACTIVE");
  },

  methods: {
    resetForm() {
      this.scope = "OWN";
      this.duration = "DAILY";

      this.selectedUsers = [];
      this.searchp = "";

      this.selectedDate = null;
      this.tempDate = null;
      this.datePicker = false;

      this.year = new Date().getFullYear();
      this.month = "";

      this.loading = false;
    },
    async export_timesheet() {
      if (this.loading) return;

      this.loading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        const result = await API.graphql(
          graphqlOperation(custom_timesheet_reports, {
            input: {
              action_value: "PROJECTS",
              organization_id: data.organization.organization_id,
              action_type: this.duration,
              user_id: data.user.user_id,
              year: this.duration !== "DAILY" ? String(this.year) : undefined,
              month:
                this.duration === "MONTHLY" ? String(this.month) : undefined,
              date: this.duration === "DAILY" ? this.formattedDate : undefined,
              report_scope: this.scope,
              selected_user_ids:
                this.scope === "SELECTED" ? this.selectedUsers : undefined,
              project_id: this.selectedProjectId,
            },
          })
        );

        const response = JSON.parse(result.data.custom_timesheet_reports);

        if (response.Status === "SUCCESS") {
          await this.download_items(response.download_url);

          this.$emit("successMsg", "Exported successfully");

          this.closeDialog();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.error(error);
        this.$emit("errorMsg", "Failed to export timesheet");
      } finally {
        this.loading = false;
      }
    },
    async download_items(url) {
      if (!url) {
        this.$emit("errorMsg", "Download URL missing");
        return;
      }

      const userEmail =
        this.$store.getters.GetUserObj.user?.user_email_id || "user";
      const safeEmail = userEmail.replace(/[@.]/g, "_");

      const fileName = `${safeEmail}_Timesheet.xlsx`;

      try {
        const response = await axios.get(url, {
          responseType: "blob",
        });

        FileSaver.saveAs(response.data, fileName);
      } catch (err) {
        console.error("Download failed:", err);
        this.$emit("errorMsg", "Download failed");
      }
    },

    saveDate() {
      if (!this.tempDate) return;

      const d = new Date(this.tempDate);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      this.selectedDate = `${year}-${month}-${day}`;

      this.datePicker = false;
    },
    closeDialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>
<style scoped>
.timesheet-card {
  border-radius: 16px;
  background: #ffffff;
}

.generate-btn {
  text-transform: none;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 10px;
}

.v-field {
  border-radius: 10px;
}

:deep(.v-radio-group .v-label) {
  font-weight: 500;
}

:deep(.v-radio) {
  margin-right: 16px;
}
</style>

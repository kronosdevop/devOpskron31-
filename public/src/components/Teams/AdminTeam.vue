<template>
  <div class="main-container" style="background-color: white">
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!--Page Info & Textfields-->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">My Team</span>
          <span class="header-subtitle">Manage your team members</span>
        </div>
      </div>
      <v-spacer />

      <!--Screenshot Button-->
      <v-tooltip text="Take a screenshot and raise a ticket">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon @click="TakeScreenshot">
            <v-icon size="30" color="primary">mdi-help-box</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <div class="header-actions">
        <!-- Search Field -->
        <div
          v-if="toggle_exclusive == 'teams' || toggle_exclusive == 'myteams'"
          class="search-container"
        >
          <v-text-field
            v-model="searchValue"
            placeholder="Search members..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
            @update:model-value="handleSearchChange"
          />
        </div>

        <!--Filter Members Button-->
        <v-btn
          v-if="toggle_exclusive == 'teams'"
          :class="
            activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="handleFilterClick"
        >
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge
            v-if="activeFiltersCount > 0"
            :content="activeFiltersCount"
            color="white"
            class="ml-2"
          />
        </v-btn>

        <!--Actions Button-->
        <v-menu
          v-model="actionsMenuOpen"
          :close-on-content-click="false"
          offset-y
          class="actions-menu"
        >
          <template #activator="{ props }">
            <v-btn
              v-if="toggle_exclusive === 'teams'"
              v-bind="props"
              class="action-btn mr-6"
              size="small"
            >
              <v-icon>mdi-dots-vertical</v-icon>
              <span>Actions</span>
            </v-btn>
          </template>

          <v-list density="compact" class="actions-list">
            <v-list-item @click="add_members()">
              <template #prepend>
                <v-icon color="primary">mdi-plus</v-icon>
              </template>
              <v-list-item-title>Add Members</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleDownloadTemplate">
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Download Template</v-list-item-title>
            </v-list-item>

            <v-divider class="my-1" />

            <v-list-item class="mb-1">
              <template #prepend>
                <v-icon color="primary">mdi-import</v-icon>
              </template>
              <BulkTeamImport
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
              />
            </v-list-item>
            <v-list-item
              :disabled="exportload"
              @click="!exportload && export_members()"
            >
              <template #prepend>
                <!-- Loader replaces icon -->
                <v-progress-circular
                  v-if="exportload"
                  indeterminate
                  size="18"
                  width="2"
                  color="primary"
                  class="export-loader"
                />
                <v-icon v-else color="primary"> mdi-download </v-icon>
              </template>

              <v-list-item-title>
                {{ exportload ? "Exporting…" : "Export Members" }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!--Toggle Button Toolbar-->
    <v-toolbar
      flat
      class="mt-n10"
      style="background-color: white"
      v-if="adminAppExists"
    >
      <template v-slot:extension>
        <v-tabs v-model="toggle_exclusive" mandatory class="modern-tab-toggle">
          <v-tab value="myteams" class="tab-btn"> My Team </v-tab>
          <v-tab value="teams" class="tab-btn"> Teams </v-tab>
          <v-tab value="profile_config" class="tab-btn">
            Profile Configuration
          </v-tab>
          <v-tab value="team_visibility" class="tab-btn">
            Team Visibility
          </v-tab>
          <v-tab
            value="reporties_list"
            class="tab-btn"
            v-if="$store.getters.GetUserObj?.user?.is_reporting_manager"
            v-model="toggle_exclusive"
          >
            Reportees
          </v-tab>
        </v-tabs>
      </template></v-toolbar
    >

    <!--Imports-->
    <div class="text-left" v-if="toggle_exclusive == 'approvals'">
      <ApprovalsList />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'reporties_list'">
      <ReportiesList />
    </div>
    <div
      class="text-left"
      v-if="toggle_exclusive == 'myteams'"
      :class="adminAppExists ? '' : 'mt-10'"
    >
      <UserTeams :searchValue="searchValue" />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'profile_config'">
      <v-card
        flat
        :height="cardHeight"
        class="overflow-auto"
        :style="{ backgroundColor: 'white' }"
      >
        <ProfileConfig />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'member_config'">
      <MemberConfig />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'team_visibility'">
      <v-card
        flat
        :height="cardHeight"
        class="overflow-auto"
        :style="{ backgroundColor: 'white' }"
      >
        <TeamVisibility />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'teams'">
      <v-card flat class="overflow-auto" :style="{ backgroundColor: 'white' }">
        <AllTeams
          ref="allTeamsRef"
          :searchValue="searchValue"
          v-on:selectedData="selected_data"
          v-on:groupName="group_name"
          v-on:locaName="location_name"
          v-on:active-filters-count="handleActiveFiltersCount"
          v-on:filter-button-click="openFilterDrawer"
          v-on:search-changed="handleSearchChange"
        />
      </v-card>
    </div>
    <div v-if="componentCheck == 1">
      <!-- <AddUser
        :addDialog="addDialog"
        v-on:errorMsg="error_info"
        v-on:succesMsg="success_info"
        @clicked="close_dialog"
      /> -->
    </div>
    <AddMember
      :addmember="addmember"
      @clicked="addmember = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
    <div v-if="componentCheck == 2">
      <TeamBulkupload
        :dropExceldailog="dropExceldailog"
        @clicked="dropExceldailog = false"
        :excelHeaders="excelHeaders"
        :excelTableData="excelTableData"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <!--Snackbar-->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/* eslint-disable */
// Imports
import UserTeams from "@/components/Teams/UserTeams.vue";
import TeamBulkupload from "@/components/DialogsList/TeamBulkupload.vue";
import AddMember from "@/components/StaticForms/AddMember.vue";
import ApprovalsList from "@/components/SettingsDialogs/ApprovalsList.vue";
import ProfileConfig from "@/components/SettingsDialogs/ProfileConfig.vue";
import MemberConfig from "@/components/SettingsDialogs/MemberConfig.vue";
import TeamVisibility from "@/components/SettingsDialogs/TeamVisibility.vue";
import AllTeams from "@/components/Teams/AllTeams.vue";
import BulkTeamImport from "@/components/Teams/BulkTeamImport.vue";
import { my_team_user_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import AddUser from "@/components/UserDialogs/AddUser.vue";
import SnackBar from "@/components/SnackBar.vue";
import { export_users } from "@/graphql/mutations.js";
const FileSaver = require("file-saver");
import * as XLSX from "xlsx";
import axios from "axios";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";
// import { get_current_details } from "@/mixins/GetCuurentUser.js";
import ReportiesList from "./ReportiesList.vue";
export default {
  // Components
  components: {
    AddUser,
    SnackBar,
    AddMember,
    AllTeams,
    TeamBulkupload,
    TeamVisibility,
    MemberConfig,
    ProfileConfig,
    ApprovalsList,
    BulkTeamImport,
    UserTeams,
    CreateExternalTicketDialog,
    ReportiesList,
  },
  // mixins: [get_current_details],
  // Data
  data() {
    return {
      fullTableData: [],
      // Array properties
      headers: [
        { text: "Profile", value: "user_profile_pic_url", sortable: false },
        { text: "Name", value: "full_user_name", sortable: false },
        {
          text: "Member ID",
          value: "member_id",
          sortable: false,
        },
        {
          text: "Mobile Number",
          value: "user_contact_number",
          sortable: false,
        },
        {
          text: "Group",
          value: "department",
          sortable: false,
        },
        {
          text: "Location",
          value: "location",
          sortable: false,
        },
        {
          text: "Reporting Manager",
          value: "reporting_manager",
          sortable: false,
        },
        { text: "Status", value: "user_status", sortable: false },
      ],
      tableData: [],
      excelHeaders: [],
      excelTableData: [],

      // Object properties
      SnackBarComponent: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      actionsMenuOpen: false,

      // String properties
      search: "",
      searchValue: "",
      toggle_exclusive: "myteams",
      defaultStatus: "ACTIVE",
      groupName: "",
      locationName: "",

      // Boolean properties
      addmember: false,
      dropExceldailog: false,
      exportload: false,
      tableLoading: false,
      fixed: true,
      adminAppExists: false,
      showFilterDrawer: false,

      // Number properties
      componentCheck: 0,
      cardHeight: 0,
      height: 0,
      activeFiltersCount: 0,

      // Null properties
      next_token: null,

      //Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  // Lifecycle hooks
  created() {
    // this.get_current_details();
    this.fetch_admin_apps();
    this.get_my_team();
    this.height = window.innerHeight - 290;
    if (this.$route.query.tab) {
      this.toggle_exclusive = this.$route.query.tab;
    }
  },

  mounted() {
    this.cardHeight = window.innerHeight - 140;
  },

  // Watchers
  watch: {
    "$store.state.attendenceBack"(val) {
      if (val) {
        this.toggle_exclusive = "reporties";
      }
    },
    toggle_exclusive() {
      this.addmember = false;
    },

  },

  // Computed properties
  computed: {
    totalMembers() {
      return this.tableData.length || 0;
    },
  },

  // Methods
  methods: {
    // Filter methods
    openFilterDrawer() {
      // console.log('openFilterDrawer called');
      this.showFilterDrawer = true;
    },

    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    handleActiveFiltersCount(count) {
      this.activeFiltersCount = count;
    },
handleSearchChange(value) {
  this.searchValue = value;

  if (!value) {
    this.tableData = this.fullTableData;
    return;
  }

  const search = value.toLowerCase();

  this.tableData = this.fullTableData.filter((item) => {
    return (
      item.full_user_name?.toLowerCase().includes(search) ||
      item.member_id?.toLowerCase().includes(search) ||
      item.user_contact_number?.toLowerCase().includes(search) ||
      item.department?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search)
    );
  });
},

    handleFilterClick() {
      // console.log('handleFilterClick called');
      if (this.$refs.allTeamsRef) {
        this.$refs.allTeamsRef.openFilterDrawer();
      }
    },

    // Admin methods
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;
      if (
        userObj.user.user_type == "ADMIN" ||
        userObj.user.user_type == "OWNER"
      ) {
        this.adminAppExists = true;
      }
    },

    // Data fetching methods
    async get_my_team() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(my_team_user_list, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              limit: this.search != "" ? 1000 : 100,
              name_search: "",
              nextToken: this.search != "" ? null : this.next_token,
            },
          }),
        );
        this.tableLoading = false;
        var dataArray = [];
        var response = JSON.parse(result.data.my_team_user_list);

        this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          dataArray = response.user || [];

          // Ensure dataArray is an array and filter out any invalid items
          if (Array.isArray(dataArray)) {
            dataArray = dataArray.filter((item) => item && item.user_id);
          } else {
            dataArray = [];
          }

          let array = this.tableData.concat(dataArray);
          this.fullTableData = array;

          this.tableData = array;
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) => {
              // Check if obj exists and has user_id property
              if (!obj || !obj.user_id) return false;
              return (
                index ===
                self.findIndex(
                  (o) => o && o.user_id && o.user_id === obj.user_id,
                )
              );
            },
          );
          this.tableData = uniqueArrayOfObjects;
        }
      } catch (error) {
        console.log(error);
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

    get_myteam_Pagination() {
      if (this.next_token) {
        this.get_my_team();
      }
    },

    // Export and download methods
    async export_members() {
      if (this.exportload) return;

      this.exportload = true;

      try {
        const data = this.$store.getters.GetUserObj;

        const result = await API.graphql(
          graphqlOperation(export_users, {
            input: {
              organization_id: data.organization.organization_id,
              user_status: this.defaultStatus,
              department_name: this.groupName || undefined,
              location_name: this.locationName || undefined,
            },
          }),
        );

        const response = JSON.parse(result.data.export_users);

        if (response.Status === "SUCCESS") {
          await this.download_invoice(response.url);

          // ✅ Close menu only after export completes
          this.actionsMenuOpen = false;
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Export failed",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.exportload = false;
      }
    },
    async download_invoice(url) {
      this.exportload = false;
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileName = firstName
        ? firstName + "_" + "Members" + ".xlsx"
        : "_" + "Members" + ".xlsx";
      axios({
        url: url,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },

    download_item() {
      try {
        // console.log('Download template clicked');
        const headers = [
          "First Name*",
          "Last Name",
          "Email ID*",
          "Member ID",
          "Country Code",
          "Contact Number",
        ];

        let firstName =
          this.$store.getters.GetUserObj?.organization?.organization_team_id ||
          "";
        let fileName = firstName
          ? `${firstName}_Members Template.xlsx`
          : `Members Template.xlsx`;

        // console.log('Creating Excel file:', fileName);
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, fileName);

        // console.log('Excel file created successfully');
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "Template downloaded successfully!",
          timeout: 3000,
          Top: true,
        };
      } catch (error) {
        console.error("Error downloading template:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error downloading template: " + error.message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    // UI interaction methods
    add_members() {
      this.addmember = false;
      this.addmember = true;
    },

    back_call() {
      this.$router.push("/home/UserTeams");
    },

    add_data() {
      this.componentCheck = 1;
      this.addDialog = true;
    },

    close_dialog(val) {
      if (val == 0) {
        this.addDialog = false;
      } else if (val == 1) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please Provide Details",
          timeout: 5000,
          Top: true,
        };
      } else if (val == 2) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Invalid Email",
          timeout: 5000,
          Top: true,
        };
      } else if (val == 3) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "User Created Successfully",
          timeout: 5000,
          Top: true,
        };

        this.addDialog = false;
      }
    },

    // Event handler methods
    handleDownloadTemplate() {
      // console.log('Download template handler called');
      this.download_item();
    },

    handleSuccess({ results, header }) {
      this.excelTableData = results;
      this.componentCheck = 2;
      this.excelHeaders = header;
      this.dropExceldailog = true;
    },

    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "warning",
        SnackbarText: "Please do not upload files larger than 1MB in size.",
        timeout: 5000,
        Top: true,
      };
      return false;
    },

    selected_data(val) {
      this.defaultStatus = val;
    },

    group_name(val) {
      this.groupName = "";
      this.groupName = val;
    },

    location_name(val) {
      this.locationName = "";
      this.locationName = val;
    },

    // Utility methods
    get_user_id(val) {
      for (var i = 0; i < this.tableData.length; i++) {
        if (val == this.tableData[i].user_id) {
          return this.tableData[i].full_user_name;
        }
      }
    },

    update_user() {
      // Placeholder for user update functionality
    },

    // Notification methods
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addDialog = false;
      this.addmember = false;
      this.dropExceldailog = false;
      this.tableData = [];
      this.get_my_team();
    },

    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
  },
};
</script>

<!-- Styles are now handled globally in Styling.css -->
<style scoped>
/* Main Container Styles */
.main-container {
  background-color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
}

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 200px;
}

.search-field {
  width: 100%;
}

/* Filter Button Styles */
.filter-btn {
  background: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.filter-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
}

.filter-btn.active {
  background: #c2185b !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-container {
    min-width: 200px;
    margin-right: 8px;
  }
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Responsive Design for Action Buttons */
@media (max-width: 768px) {
  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}

/* Menu and List Styling */
.actions-list {
  background-color: white !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e0e0e0 !important;
}

.actions-list :deep(.v-list-item) {
  background-color: white !important;
  transition: background-color 0.2s ease !important;
}

.actions-list :deep(.v-list-item:hover) {
  background-color: #f5f5f5 !important;
}

.actions-list :deep(.v-list-item-title) {
  color: #333 !important;
  font-weight: 500 !important;
}

.actions-list :deep(.v-divider) {
  border-color: #e0e0e0 !important;
}
.spin-icon {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.export-loader,
.export-icon {
  margin-right: 50px;
}
</style>

<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-folder-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Cabinet</span>
          <span class="header-subtitle">Manage your documents and folders</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Action Buttons -->

        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30">mdi-help-box</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-btn
          v-show="subFolderCheck == true && cabinetToggle == 'subscribed'"
          @click="upload_file('fileUpload')"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-cloud-upload</v-icon>
          <span>Upload File</span>
        </v-btn>

        <v-btn
          v-show="subFolderCheck == false && cabinetToggle == 'subscribed'"
          @click="create_folder()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-folder</v-icon>
          <span>Create Folder</span>
        </v-btn>

        <v-btn
          v-show="subFolderCheck == true && cabinetToggle == 'subscribed'"
          @click="upload_file('folderCreation')"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-folder</v-icon>
          <span>Create Folder</span>
        </v-btn>

        <!-- Folder Source Filter -->
        <v-select
          v-show="cabinetToggle == 'subscribed' && subFolderCheck == false"
          v-model="selectedFolderSource"
          :items="folderSourceOptions"
          label="Filter by Source"
          density="compact"
          variant="outlined"
          style="max-width: 200px; margin-right: 16px"
          @update:modelValue="filterByFolderSource"
          class="mt-6"
        />
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="cabinetToggle" mandatory class="modern-tab-toggle">
          <v-tab value="subscribed" class="tab-btn">
            Subscribed Cabinets
          </v-tab>
          <v-tab value="all" class="tab-btn"> Other Cabinets </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card class="mt-2" flat>
      <v-breadcrumbs
        v-show="cabinetToggle == 'subscribed' && show_root_folder_data == true"
        class="mt-n4 ml-4"
        :items="breadcrumbsItems"
      >
        <template v-slot:divider>
          <v-icon color="primary">mdi-chevron-right</v-icon>
        </template>
        <template v-slot:item="{ item }">
          <span
            @click="previous_data(item)"
            style="cursor: pointer; color: #1976d2; text-decoration: underline"
          >
            {{ item.text }}
          </span>
        </template>
      </v-breadcrumbs>
      <v-card-text class="mt-n4" v-show="cabinetToggle == 'subscribed'">
        <v-data-table
          :headers="subFolderCheck == false ? Rootheaders : subHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :fixed-header="true"
          :height="windowHeight"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          @click:row="handleRowClick"
        >
          <template v-slot:[`item.FileName`]="{ item }">
            <span v-show="item.folderType != 'Root'">
              <v-icon
                v-show="item.folderType != 'Root'"
                dense
                color="black"
                size="small"
                >{{ item.fileIcon }}</v-icon
              >
              {{ item.FileName }}</span
            >
            <span v-if="item.folder_visibility != undefined">
              <v-tooltip
                v-if="
                  item.folderType == 'Root' &&
                  item.folder_visibility.visible_type === 'ALL_MEMBERS'
                "
                bottom
              >
                <template v-slot:activator="{ on }">
                  <v-icon
                    size="small"
                    :color="getIconColor(item.folder_visibility.visible_type)"
                    v-on="on"
                  >
                    {{
                      item.folder_visibility.visible_type === "ALL_MEMBERS"
                        ? "mdi-lock-open"
                        : "mdi-lock-off"
                    }}
                  </v-icon>
                </template>
                <span>Open</span>
              </v-tooltip>
              <v-tooltip v-else bottom>
                <template v-slot:activator="{ on }">
                  <v-icon
                    dense
                    size="small"
                    :color="getIconColor(item.folder_visibility.visible_type)"
                    v-on="on"
                  >
                    {{
                      item.folder_visibility.visible_type === "ALL_MEMBERS"
                        ? "mdi-lock-open"
                        : "mdi-lock-off"
                    }}
                  </v-icon>
                </template>
                <span>Restricted</span>
              </v-tooltip>
              {{ item.Key }}
              <v-icon
                dense
                color="primaryColor"
                size="small"
                v-if="
                  item.folderType == 'Root' &&
                  $store.getters.GetUserObj?.user?.user_email_id &&
                  item.folder_created_by_email ==
                    $store.getters.GetUserObj.user?.user_email_id
                "
                >mdi-account</v-icon
              >
            </span>
          </template>
          <template v-slot:[`item.folderDescritpion`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on" class="caption">
                  {{
                    item.folderDescritpion && item.folderDescritpion.length > 35
                      ? item.folderDescritpion.substring(0, 35) + "..."
                      : item.folderDescritpion || "No description"
                  }}
                </span>
              </template>
              <div
                style="
                  max-width: 400px;
                  white-space: normal;
                  word-wrap: break-word;
                  padding: 8px;
                  text-align: left;
                "
              >
                {{ item.folderDescritpion || "No description available" }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.folder_source`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                size="16"
                :color="getTypeIconColor(item.folder_source)"
                class="mr-2"
              >
                {{ getTypeIcon(item.folder_source) }}
              </v-icon>
              <span class="caption font-weight-medium">
                {{ getTypeDisplayName(item.folder_source) }}
              </span>
            </div>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-start justify-start">
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    v-bind="props"
                    class="cursor-pointer"
                  >
                    <v-icon size="18">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list density="compact">
                  <!-- Leave Folder (for Root folders not created by current user) -->
                  <v-list-item
                    v-if="
                      item.folderType == 'Root' &&
                      item.folder_created_by_email !=
                        $store.getters.GetUserObj.user?.user_email_id
                    "
                    @click.stop="leave_folder(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="primary"
                        >mdi-arrow-right-bold-circle-outline</v-icon
                      >
                    </template>
                    <v-list-item-title>Leave Folder</v-list-item-title>
                  </v-list-item>

                  <!-- View Details (for Root folders) -->
                  <v-list-item
                    v-if="item.folderType == 'Root'"
                    @click.stop="view_details(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="primary">mdi-eye</v-icon>
                    </template>
                    <v-list-item-title>View Details</v-list-item-title>
                  </v-list-item>

                  <!-- Transfer Ownership (for Root folders created by current user) -->
                  <v-list-item
                    v-if="
                      item.folderType == 'Root' &&
                      $store.getters.GetUserObj?.user?.user_email_id &&
                      item.folder_created_by_email ==
                        $store.getters.GetUserObj.user?.user_email_id
                    "
                    @click.stop="cabinet_transfer_ownership(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="primaryColor"
                        >mdi-swap-horizontal-bold</v-icon
                      >
                    </template>
                    <v-list-item-title>Transfer Ownership</v-list-item-title>
                  </v-list-item>

                  <!-- Add Member (for Root folders created by current user and not ALL_MEMBERS) -->
                  <v-list-item
                    v-if="
                      item.folderType == 'Root' &&
                      $store.getters.GetUserObj?.user?.user_email_id &&
                      item.folder_created_by_email ==
                        $store.getters.GetUserObj.user?.user_email_id &&
                      item.folder_visibility.visible_type !== 'ALL_MEMBERS'
                    "
                    @click.stop="add_member(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="primary"
                        >mdi-account-plus</v-icon
                      >
                    </template>
                    <v-list-item-title>Add Member</v-list-item-title>
                  </v-list-item>

                  <!-- Delete Folder (for Root folders created by current user) -->
                  <v-list-item
                    v-if="
                      item.folderType == 'Root' &&
                      $store.getters.GetUserObj?.user?.user_email_id &&
                      item.folder_created_by_email ==
                        $store.getters.GetUserObj.user?.user_email_id
                    "
                    @click.stop="delete_folder(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="red">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete Folder</v-list-item-title>
                  </v-list-item>

                  <!-- Delete SubFolder -->
                  <v-list-item
                    v-if="item.folderType == 'SubFolders'"
                    @click.stop="delete_folder(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="red">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>

                  <!-- Download File -->
                  <v-list-item
                    v-if="item.fileIcon == 'mdi-file'"
                    @click.stop="download_file(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="primaryColor"
                        >mdi-download</v-icon
                      >
                    </template>
                    <v-list-item-title>Download File</v-list-item-title>
                  </v-list-item>

                  <!-- View File (for images and PDFs) -->
                  <v-list-item
                    v-if="item.fileIcon == 'mdi-file' && isImageOrPdf(item)"
                    @click.stop="view_file(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="primary">mdi-eye</v-icon>
                    </template>
                    <v-list-item-title>View File</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} items`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage - 1"
              style="color: #666 !important"
            >
              Previous
            </v-btn>
            <div class="page-numbers">
              <v-btn
                v-for="page in visiblePages"
                :key="page"
                :variant="page === currentPage ? 'elevated' : 'text'"
                size="small"
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
                @click="currentPage = page"
                :style="
                  page === currentPage
                    ? 'background: #DB4C77 !important; color: white !important;'
                    : 'color: #666 !important;'
                "
              >
                {{ page }}
              </v-btn>
            </div>
            <v-btn
              :disabled="currentPage === pageCount"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage + 1"
              style="color: #666 !important"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-if="cabinetToggle == 'all'">
      <OtherCabinets />
    </div>
    <div v-if="componentCheck == 1">
      <RootFolderCreation
        :createFolderDialog="createFolderDialog"
        @clicked="createFolderDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 2">
      <FileUpload
        :uploadFileDialog="uploadFileDialog"
        :subFileType="subFileType"
        :selectedPath="selectedPath"
        @clicked="uploadFileDialog = false"
        :rowInfo="rowInfo"
        v-on:sucessmsg="child_folders"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteFolderFile
        :deleteFolderDialog="deleteFolderDialog"
        @clicked="deleteFolderDialog = false"
        :selectedPath="selectedPath"
        :rowInfo="rowInfo"
        v-on:sucessmsg="deleted_data"
      />
    </div>
    <div v-if="componentCheck == 4">
      <TransferOwnership
        :rowInfo="rowInfo"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        :tranferOwnerDialog="tranferOwnerDialog"
        @clicked="tranferOwnerDialog = false"
      />
    </div>
    <div v-if="componentCheck == 5">
      <ViewDetails
        :rowInfo="rowInfo"
        :viewDetailsDialog="viewDetailsDialog"
        @clicked="viewDetailsDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 6">
      <ViewRootfolderDetails
        :viewFootfolderDetails="viewFootfolderDetails"
        @clicked="viewFootfolderDetails = false"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentCheck == 7">
      <AddMember
        :addMemberDialog="addMemberDialog"
        :rowInfo="rowInfo"
        @clicked="addMemberDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 8">
      <LeaveCabinet
        :leaveCabinetDialog="leaveCabinetDialog"
        :rowInfo="rowInfo"
        @clicked="leaveCabinetDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import { list_cabinet_root_folders } from "@/graphql/queries.js";
import {
  get_s3_existing_files,
  get_s3_files_download,
  get_presigned_url_to_upload_files,
} from "@/graphql/queries.js";
import ViewRootfolderDetails from "@/components/NewCabinet/ViewRootfolderDetails.vue";
import { API, graphqlOperation } from "aws-amplify";
import RootFolderCreation from "@/components/NewCabinet/RootFolderCreation.vue";
import FileUpload from "@/components/NewCabinet/FileUpload.vue";
import DeleteFolderFile from "@/components/NewCabinet/DeleteFolderFile.vue";
import OtherCabinets from "@/components/NewCabinet/OtherCabinets.vue";
import TransferOwnership from "@/components/NewCabinet/TransferOwnership.vue";
import ViewDetails from "@/components/NewCabinet/ViewDetails.vue";
import AddMember from "@/components/NewCabinet/AddMember.vue";
import LeaveCabinet from "@/components/NewCabinet/LeaveCabinet.vue";
import SnackBar from "@/components/SnackBar.vue";
const FileSaver = require("file-saver");
import axios from "axios";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    RootFolderCreation,
    FileUpload,
    DeleteFolderFile,
    OtherCabinets,
    SnackBar,
    TransferOwnership,
    ViewDetails,
    ViewRootfolderDetails,
    AddMember,
    LeaveCabinet,
    CreateExternalTicketDialog,
  },
  data() {
    return {
      tableLoading: false,
      show_root_folder_data: false,
      fixed: true,
      tableData: [],
      loadingNew: false,
      Rootheaders: [
        { title: "Folder", value: "FileName", sortable: false },
        {
          title: "Folder Description",
          value: "folderDescritpion",
          sortable: false,
        },
        {
          title: "Type",
          value: "folder_source",
          sortable: false,
        },
        {
          title: "Created By",
          value: "folder_created_by_name",
          sortable: false,
        },
        { title: "Actions", value: "actions", sortable: false },
      ],
      subHeaders: [
        { title: "Folder/Files", value: "FileName", sortable: false },
        // { title: "File Size", value: "Size", sortable: false },
        { title: "Last Modified", value: "LastModified", sortable: false },
        { title: "Actions", value: "actions", sortable: false },
      ],
      createFolderDialog: false,
      componentCheck: 0,
      breadcrumbsItems: [],
      uploadFileDialog: false,
      rowInfo: {},
      subFolderCheck: false,
      subFileType: "",
      selectedPath: "",
      deleteFolderDialog: false,
      cabinetToggle: "subscribed",
      tranferOwnerDialog: false,
      viewDetailsDialog: false,
      viewFootfolderDetails: false,
      addMemberDialog: false,
      leaveCabinetDialog: false,
      SnackBarComponent: {},
      rowDataInfo: {},
      currentPage: 1,
      itemsPerPage: 10,
      totalCount: 0,
      pageCount: 0,
      paginatedItems: [],
      selectedFolderSource: "All",
      folderSourceOptions: [
        { title: "All", value: "All" },
        { title: "Project Management", value: "PROJECT_MANAGEMENT" },
        { title: "Cabinet", value: "CABINET" },
      ],
      originalTableData: [], // Store original data for filtering
      windowHeight: 0, // New data property for table height
      visiblePages: [], // New data property for visible pagination buttons

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  created() {
    this.breadcrumbsItems = [];
    this.fetch_list_of_documents();
    this.breadcrumbsItems.push({
      title: "My Docs",
      text: "My Docs",
      disabled: false,
      currentPath: "MyDocs",
    });
    this.windowHeight = window.innerHeight - 300;
  },
  computed: {
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.pageCount, this.currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  mounted() {
    window.addEventListener("resize", this.updateWindowHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateWindowHeight);
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    formatLastModifiedDate(dateString) {
      if (!dateString || dateString === "-") return "-";

      try {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) return "-";

        // Format: DD/MM/YYYY HH:MM AM/PM
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
      }
    },
    leave_folder(item) {
      this.componentCheck = 8;
      this.rowInfo = item;
      this.leaveCabinetDialog = true;
    },
    add_member(item) {
      this.componentCheck = 7;
      this.rowInfo = item;
      this.addMemberDialog = true;
    },
    isImageOrPdf(item) {
      const imageExtensions = ["jpg", "jpeg", "png", "gif"];
      const pdfExtension = "pdf";
      const fileExtension = item.Key.split(".").pop().toLowerCase();
      return (
        imageExtensions.includes(fileExtension) ||
        fileExtension === pdfExtension
      );
    },
    getIconColor(visibilityType) {
      return visibilityType === "ALL_MEMBERS" ? "green" : "red";
    },
    getTypeIcon(folderSource) {
      switch (folderSource) {
        case "PROJECT_MANAGEMENT":
          return "mdi-briefcase";
        case "CABINET":
        default:
          return "mdi-folder";
      }
    },
    getTypeIconColor(folderSource) {
      switch (folderSource) {
        case "PROJECT_MANAGEMENT":
          return "blue";
        case "CABINET":
        default:
          return "orange";
      }
    },
    getTypeDisplayName(folderSource) {
      switch (folderSource) {
        case "PROJECT_MANAGEMENT":
          return "Project";
        case "CABINET":
        default:
          return "Cabinet";
      }
    },
    view_file(item) {
      this.viewFootfolderDetails = true;
      this.rowInfo = item;
      this.componentCheck = 6;
    },
    view_details(item) {
      this.componentCheck = 5;
      this.viewDetailsDialog = true;
      this.rowInfo = item;
    },
    cabinet_transfer_ownership(item) {
      this.tranferOwnerDialog = true;
      this.componentCheck = 4;
      this.rowInfo = item;
    },
    async fetch_list_of_documents() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_cabinet_root_folders, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_cabinet_root_folders);
        let myCabinets = [];
        let arraynew = [];
        if (response.Status == "SUCCESS") {
          myCabinets = response.data;
          myCabinets.forEach((element) => {
            arraynew.push({
              Key: element.Key,
              folder_id: element.folder_id,
              folder_visibility: element.folder_visibility,
              folder_source: element.folder_source || "CABINET", // Default to CABINET if undefined
              fileIcon: "mdi-folder",
              Size: "-",
              LastModified: "-",
              currentPath: element.Key,
              FileName: element.Key,
              folderType: "Root",
              folder_created_by_name: element.folder_created_by_name,
              folderDescritpion: element.folder_description || "No description",
              folder_created_by_email: element.folder_created_by_email,
            });

            this.originalTableData = arraynew.filter((item) => {
              if (item.folder_visibility) {
                if (item.folder_visibility.visible_type === "ALL_MEMBERS") {
                  return true;
                }
                if (
                  item.folder_visibility.visible_members.includes(
                    this.$store.getters.GetUserObj.user?.user_id
                  )
                ) {
                  return true;
                }
              }
              return false;
            });

            // Apply folder source filter
            this.applyFolderSourceFilter();
          });
        }
      } catch (error) {
        console.log(error, "error");
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
    async download_file(item) {
      this.loadingNew = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(get_s3_files_download, {
            input: {
              organization_id: data.organization.organization_id,
              key: item.Key,
            },
          })
        );

        var response = JSON.parse(result.data.get_s3_files_download);
        this.dwonload_pdf(response.data);
        this.loadingNew = false;
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async dwonload_pdf(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id ||
        "";
      let originalFileName = url.split("/").pop().split("?")[0];

      let fileName = firstName
        ? `${firstName}_${originalFileName}`
        : `_${originalFileName}`;

      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          // Create a blob from the response
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
    delete_folder(item) {
      this.deleteFolderDialog = true;
      this.rowInfo = item;
      this.componentCheck = 3;
    },
    previous_data(item) {
      // console.log(item,"item");
      if (item.text == "My Docs") {
        this.show_root_folder_data = false;
        this.breadcrumbsItems = [];
        this.breadcrumbsItems.push({
          title: "My Docs",
          text: "My Docs",
          disabled: false,
          currentPath: "MyDocs",
        });
        this.subFolderCheck = false;
        this.selectedFolderSource = "All"; // Reset filter when going back to root
        this.fetch_list_of_documents();
      } else {
        // Find the index of the clicked breadcrumb item
        let indexToRemove = this.breadcrumbsItems.findIndex(
          (obj) => obj.currentPath === item.currentPath
        );

        // Remove all breadcrumbs after the clicked item
        this.breadcrumbsItems.splice(indexToRemove + 1);

        // Navigate to the clicked folder
        if (item.currentPath === "MyDocs") {
          this.subFolderCheck = false;
          this.selectedFolderSource = "All"; // Reset filter when going back to root
          this.fetch_list_of_documents();
        } else {
          this.subFolderCheck = true;
          this.tableData = [];
          this.selectedPath = item.currentPath;
          this.get_sub_folders_data(item.currentPath);
        }
      }
    },
    fetch_file_names(value) {
      const fileName = value.split("/");

      const lastName = fileName[fileName.length - 1];

      return lastName;
    },
    fetch_folder_name(value) {
      const folderName = value.Key.split("/");

      const clearEmptySpaces = folderName.filter((item) => item !== "");

      const lastItem = clearEmptySpaces[clearEmptySpaces.length - 1];

      return lastItem;
    },
    handleRowClick(click, value) {
      let item = value.item;
      // console.log(item,"item");
      if (item.folderType == "Root") {
        this.show_root_folder_data = true;
      }
      if (item.fileIcon == "mdi-folder") {
        this.tableData = [];
        this.breadcrumbsItems.push({
          title: item.FileName,
          text: item.FileName,
          disabled: false,
          currentPath: item.Key,
        });

        this.rowInfo = item;
        this.subFolderCheck = true;
        var data = item.Key.split("/");

        if (data.length == 1) {
          this.tableData = [];
          this.selectedPath = item.Key;
          this.get_sub_folders_data(item.Key);
        } else if (data.length > 1) {
          this.tableData = [];
          var urlParts = data;
          urlParts = urlParts.slice(2);
          urlParts = urlParts.filter((part) => part !== "");
          let path = urlParts.join("/");
          this.selectedPath = path;
          this.get_sub_folders_data(path);
        }
      } else {
        if (item.fileIcon == "mdi-file" && this.isImageOrPdf(item)) {
          this.view_file(item);
        } else {
          this.rowInfo = item;
        }
      }
    },
    async get_sub_folders_data(item) {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(get_s3_existing_files, {
            input: {
              folder_name: item,
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.get_s3_existing_files);

        if (response.Status == "SUCCESS") {
          let filesFolders = response.data;

          if (
            filesFolders.files.length !== 0 ||
            filesFolders.folders.length !== 0
          ) {
            filesFolders.files
              .concat(filesFolders.folders)
              .forEach((element) => {
                this.tableData.push({
                  Key: element.Key,
                  fileIcon: element.hasOwnProperty("Size")
                    ? "mdi-file"
                    : "mdi-folder",
                  Size: element.hasOwnProperty("Size") ? element.Size : "-",
                  LastModified: element.hasOwnProperty("LastModified")
                    ? this.formatLastModifiedDate(element.LastModified)
                    : "-",
                  currentPath: element.Key,
                  FileName: element.hasOwnProperty("Size")
                    ? this.fetch_file_names(element.Key)
                    : this.fetch_folder_name(element),
                  folderType: "SubFolders",
                  folder_created_by_email: "",
                });
              });
          }

          this.tableLoading = false;
          this.totalCount = this.tableData.length;
          this.pageCount = Math.ceil(this.totalCount / this.itemsPerPage);
          this.currentPage = 1;
          this.updatePageItems();
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
    async upload_file(value) {
      this.componentCheck = 2;
      this.subFileType = value;
      this.uploadFileDialog = true;

      //
      //
      //
    },
    create_folder() {
      this.createFolderDialog = true;
      this.componentCheck = 1;
    },
    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.fetch_list_of_documents();
      this.createFolderDialog = false;
      this.tranferOwnerDialog = false;
      this.viewDetailsDialog = false;
    },
    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
    child_folders(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.uploadFileDialog = false;
      this.deleteFolderDialog = false;
      this.get_sub_folders_data(this.selectedPath);
    },
    deleted_data(val, val2, val3) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deleteFolderDialog = false;
      if (this.rowInfo.folderType == "Root") {
        this.fetch_list_of_documents();
      } else {
        if (val3 == "folder") {
          var filepath = this.extractPathSegment(val2);
          this.get_sub_folders_data(filepath);
        } else {
          this.get_sub_folders_data(val2);
        }
      }
    },
    extractPathSegment(path) {
      const parts = path.split("/");
      return parts.length > 1 ? parts.slice(0, -1).join("/") : path;
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
      this.updatePageItems();
    },
    updatePageItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedItems = this.tableData.slice(startIndex, endIndex);
      // console.log(this.paginatedItems,"paginatedItems");
    },
    filterByFolderSource() {
      this.currentPage = 1; // Reset to first page when filtering
      this.applyFolderSourceFilter();
    },
    applyFolderSourceFilter() {
      if (this.selectedFolderSource === "All") {
        this.tableData = [...this.originalTableData];
      } else {
        this.tableData = this.originalTableData.filter(
          (item) => item.folder_source === this.selectedFolderSource
        );
      }

      this.totalCount = this.tableData.length;
      this.pageCount = Math.ceil(this.totalCount / this.itemsPerPage);
      this.updatePageItems();
    },
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 200; // Adjust height based on header and tab bar
      this.visiblePages = this.getVisiblePages(
        this.currentPage,
        this.pageCount
      );
    },
    getVisiblePages(currentPage, pageCount) {
      const pages = [];
      if (pageCount <= 5) {
        for (let i = 1; i <= pageCount; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, pageCount);
        } else if (currentPage >= pageCount - 2) {
          pages.push(1, pageCount - 3, pageCount - 2, pageCount - 1, pageCount);
        } else {
          pages.push(
            1,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            pageCount
          );
        }
      }
      return pages.filter((page) => page >= 1 && page <= pageCount);
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

<style scoped>
/* Modern Header Section */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Theme Toggle (Legacy - keeping for reference) */
.theme-toggle {
  background-color: transparent;
  border-radius: 10px;
  padding: 4px;
  display: inline-flex;
}

.theme-btn {
  border-radius: px !important;
}

.theme-btn.v-btn--active {
  background-color: #1e3e5c !important;
  color: #1a202c !important;
}

.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}

.font-size-btn {
  font-size: 12px;
  font-weight: 500;
}

/* Footer Styles */
.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}

.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}

.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}

.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-theme-primary);
  color: white;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

.modern-data-table :deep(.v-data-table__thead th) {
  background-color: #f8f9fa !important;
  color: #333 !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

/* Card Container */
.card-container {
  position: relative;
}

/* Modern Data Table */
.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(219, 76, 119, 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }

  .table-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>

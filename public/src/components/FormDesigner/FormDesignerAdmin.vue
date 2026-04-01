<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-form-select</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Forms </span>
          <span class="header-subtitle">Create and manage form workflows</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">

        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-btn @click="create_form()" class="action-btn mr-3" size="small">
          <v-icon>mdi-plus</v-icon>
          <span>Create Form</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-card flat class="overflow-y-auto mt-10">
      <div>
        <OverlayComp :overlay="overlay" />
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="modernHeaders"
                :height="windowHeight"
                :items="paginatedItems"
                :loading="tableLoading"
                :items-per-page="itemsPerPage"
                hide-default-footer
                class="modern-data-table"
                density="comfortable"
                hover
                @click:row="edit_flow_data"
              >
                <template #no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4"
                      >mdi-form-select-outline</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">No Forms Found</div>
                    <div class="text-body-2 text-grey">
                      Create your first form to get started.
                    </div>
                  </div>
                </template>

                <template #loading>
                  <div class="text-center py-8">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="32"
                      class="mb-4"
                    ></v-progress-circular>
                    <div class="text-body-2 text-grey">Loading forms...</div>
                  </div>
                </template>

                <!-- Updated On -->
                <template v-slot:[`item.workflow_created_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2">mdi-clock-outline</v-icon> -->
                    <span class="caption">{{
                      fetch_value(item.workflow_created_on)
                    }}</span>
                  </div>
                </template>

                <!-- Created By -->
                <template v-slot:[`item.workflow_created_by`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon> -->
                    <span class="caption font-weight-medium">{{
                      fetch_user_name(item.workflow_created_by)
                    }}</span>
                  </div>
                </template>

                <!-- Deploy Status -->
                <template v-slot:[`item.workflow_deploy_status`]="{ item }">
                  <v-chip
                    v-if="item.workflow_deploy_status == 'DEPLOY'"
                    color="success"
                    size="small"
                    variant="flat"
                    class="text-white"
                  >
                    Deployed
                  </v-chip>
                  <v-chip
                    v-else
                    color="error"
                    size="small"
                    variant="flat"
                    class="text-white cursor-pointer"
                    @click.stop="get_deployed_form('undeployed', item)"
                  >
                    Undeployed
                  </v-chip>
                </template>

                <!-- Workflow Name -->
                <template v-slot:[`item.workflow_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="primary" class="mr-2">mdi-form-textbox</v-icon> -->
                    <span class="caption font-weight-medium">{{
                      item.workflow_name
                    }}</span>
                  </div>
                </template>

                <!-- Workflow Description -->
                <template v-slot:[`item.workflow_description`]="{ item }">
                  <v-tooltip
                    location="top"
                    :disabled="
                      !item.workflow_description ||
                      item.workflow_description.length <= 50
                    "
                  >
                    <template v-slot:activator="{ props }">
                      <div v-bind="props" class="d-flex align-center">
                        <!-- <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon> -->
                        <span
                          class="caption text-truncate"
                          style="max-width: 300px"
                        >
                          {{
                            item.workflow_description
                              ? item.workflow_description.length > 20
                                ? item.workflow_description.substring(0, 20) +
                                  "..."
                                : item.workflow_description
                              : "N/A"
                          }}
                        </span>
                      </div>
                    </template>
                    <span style="white-space: pre-line">{{
                      item.workflow_description || "No description available"
                    }}</span>
                  </v-tooltip>
                </template>

                <!-- Workflow Speed -->
                <template v-slot:[`item.workflow_speed`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="orange" class="mr-2">mdi-speedometer</v-icon> -->
                    <span class="caption font-weight-medium">{{
                      convertSpeed(item.workflow_speed)
                    }}</span>
                  </div>
                </template>

                <!-- Actions -->
                <template v-slot:[`item.actions`]="{ item }">
                  <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="#FFFFFF00"
                        icon="mdi-dots-vertical"
                        flat
                        v-bind="props"
                        size="small"
                      >
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        style="font-size: 12px"
                        @click.stop="edit_flow_data_item(item)"
                      >
                        Edit Flow
                      </v-list-item>
                      <v-divider />
                      <v-list-item
                        style="font-size: 12px"
                        @click.stop="edit_visibility(item)"
                      >
                        Edit Visibility
                      </v-list-item>
                      <v-divider />
                      <v-list-item
                        style="font-size: 12px"
                        @click.stop="edit_form(item)"
                      >
                        Edit Form
                      </v-list-item>
                      <v-divider />
                      <v-list-item
                        style="font-size: 12px"
                        @click.stop="activate_deactivate(item)"
                      >
                        Delete Form
                      </v-list-item>
                      <v-divider />
                      <v-list-item
                        style="font-size: 12px"
                        @click.stop="View_form(item)"
                      >
                        View Form
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalCount} forms`
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
                      :class="
                        page === currentPage ? 'active-page' : 'inactive-page'
                      "
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
        </div>
      </div>
    </v-card>

    <!-- Dialogs -->
    <div v-if="componentCheck == 1">
      <DeployForms
        :formDeployed="formDeployed"
        :actionItem="actionItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="formDeployed = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditVisbility
        :editVisibilityDialog="editVisibilityDialog"
        :rowInfo="rowInfo"
        @clicked="editVisibilityDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <FormCreation
        :formCreationDialog="formCreationDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:navigateto="navigate_flow"
        @clicked="formCreationDialog = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <FormDeletion
        :deleteForm="deleteForm"
        :formInfo="formInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_delete"
        @clicked="deleteForm = false"
      />
    </div>
    <div v-if="componentCheck == 5">
      <ViewFlows
        :viewForm="viewForm"
        :ViewInfo="ViewInfo"
        @clicked="viewForm = false"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>


<script>
/*eslint-disable*/
import { format_Date } from "@/JsonFiles/DateFormate.js";
import AdminFlowDesigner from "@/components/FormDesigner/AdminFlowDesigner.vue";
import AllFlows from "@/components/FormDesigner/AllFlows.vue";
import UserForms from "@/components/UserLevelForms/UserForms.vue";
import AllForms from "@/components/FormDesigner/AllForms.vue";
import FormCreation from "@/components/FormDesigner/FormDialogs/FormCreation.vue";
import FormPreview from "@/components/FormDesigner/FormDialogs/FormPreview.vue";
import DeployForms from "@/components/FormDesigner/FormDialogs/DeployForms.vue";
import EditVisbility from "@/components/FormDesigner/EditFlowsDialogs/EditVisbility.vue";
import { list_admin_workflows } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_custom_forms } from "@/mixins/GetCustomForms.js";
import OverlayComp from "@/components/OverlayComp.vue";
import FormDeletion from "@/components/FormDesigner/FormDialogs/FormDeletion.vue";
import SnackBar from "@/components/SnackBar.vue";
import ViewFlows from "@/components/FormDesigner/ViewFlows.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    AdminFlowDesigner,
    AllFlows,
    UserForms,
    AllForms,
    FormCreation,
    FormPreview,
    SnackBar,
    DeployForms,
    EditVisbility,
    OverlayComp,
    FormDeletion,
    ViewFlows,
    CreateExternalTicketDialog,
  },
  mixins: [get_custom_forms, get_all_org_users],

  async created() {
    this.height = window.innerHeight - 230;
    this.$store.commit("SetExternalForm", false);
    this.$store.commit("SetdragCheck", true);

    await this.get_formlist();
    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
  },
  mounted() {
    this.windowHeight = window.innerHeight - 220;
  },
  data() {
    return {
      overlay: false,
      toggle_exclusive: "formCreation",
      componentCheck: 0,
      formCreationDialog: false,
      allFormsKey: 0,
      SnackBarComponent: {},

      headers: [
        { title: "Name", key: "workflow_name", sortable: false },

        {
          title: "Description",
          key: "workflow_description",
          sortable: false,
        },
        {
          title: "Updated On",
          key: "workflow_created_on",
          sortable: false,
        },
        {
          title: "Speed",
          key: "workflow_speed",
          sortable: false,
        },
        {
          title: "Created By",
          key: "workflow_created_by",
          sortable: false,
        },
        {
          title: "Status",
          key: "workflow_deploy_status",
          sortable: false,
        },

        {
          title: "Action",
          key: "actions",
          sortable: false,
        },
      ],
      tableData: [],
      tableLoading: false,
      formDeployed: false,
      componentCheck: 0,
      actionItem: {},
      SnackBarComponent: {},
      editActionData: false,
      height: 0,
      editFlowStepper: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      nextToken: null,
      editVisibilityDialog: false,
      rowInfo: {},
      deleteForm: false,
      formInfo: {},
      viewForm: false,
      ViewInfo: {},
      allUSersNames: [],
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  computed: {
    modernHeaders() {
      return [
        { title: "Name", key: "workflow_name", sortable: false },
        {
          title: "Description",
          key: "workflow_description",
          sortable: false,
        },
        {
          title: "Updated On",
          key: "workflow_created_on",
          sortable: false,
        },
        {
          title: "Speed",
          key: "workflow_speed",
          sortable: false,
        },
        {
          title: "Created By",
          key: "workflow_created_by",
          sortable: false,
        },
        {
          title: "Status",
          key: "workflow_deploy_status",
          sortable: false,
        },
        {
          title: "Action",
          key: "actions",
          sortable: false,
        },
      ];
    },
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
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

  watch: {
    currentPage() {
      this.updatePageItems();
      // When the page changes, scroll to top of table
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  methods: {
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
    convertSpeed(input) {
      const regex = /(\d+)([dhm])/g;
      let result = "";
      let foundNonZero = false;

      let match;
      while ((match = regex.exec(input)) !== null) {
        const value = match[1]; // The numeric value
        const unit = match[2]; // The unit ('d', 'h', or 'm')

        // Build the result based on the highest non-zero value
        if (unit === "d" && value > 0) {
          return `${value}d`;
        } else if (unit === "h" && value > 0) {
          result = `${value}h`;
          foundNonZero = true;
        } else if (unit === "m" && value > 0) {
          result = `${value}m`;
          foundNonZero = true;
        }
      }

      // If no non-zero value found, return "0h"
      return foundNonZero ? result : "0h";
    },
    async get_formlist() {
      // this.$store.commit("SetCustomFormDesign", false);
      localStorage.setItem("zeroStep", []);
      this.$store.commit("SetFlowItem", {});
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormObj", {});
      this.$store.commit("Setpathinfo", "Admin");
      this.$store.commit("SetEditFormDetails", {});
      this.$store.commit("SetFormType", "CUSTOM");
      this.$store.commit("SetDirectoryForm", false);
      await this.get_all_flows();
    },

    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    get_method(value) {
      this.toggle_exclusive = "allFlows";
    },

    View_form(item) {
      this.viewForm = true;
      this.componentCheck = 5;
      this.ViewInfo = item;
    },
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
      this.formCreationDialog = false;
      this.editFormDialog = false;
      this.formDeployed = false;
      this.editVisibilityDialog = false;
      this.deleteForm = false;
      this.get_formlist();
      // this.get_all_flows();
    },

    create_form() {
      this.componentCheck = 3;
      this.formCreationDialog = true;
    },

    handle_pagination() {
      if (this.nextToken) {
        this.get_all_flows();
      }
    },

    async get_all_flows() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_admin_workflows, {
            // organization_id: data.organization.organization_id,
            limit: 50,
            nextToken: null,
          })
        );

        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_admin_workflows);
        // console.log(response);
        this.nextToken = response.nextToken;
        let array = this.tableData.concat(response.details);

        this.tableData = array;

        const uniqueArrayOfObjects = this.tableData.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.workflow_id === obj.workflow_id)
        );
        // this.tableData = uniqueArrayOfObjects;
        this.tableData = uniqueArrayOfObjects.filter(
          (obj) => !obj.hasOwnProperty("workflow_action_identifier_key")
        );
        this.updatePageItems();
        // this.tableData = response.details;
      } catch (error) {
        this.tableData = [];
        this.tableLoading = false;
      }
    },

    edit_visibility(value) {
      // console.log(value);
      this.$store.commit("SetCustomFormDesign", false);

      this.componentCheck = 2;
      this.rowInfo = value;
      this.editVisibilityDialog = true;
    },
    edit_flow_data_item(data) {
      this.$store.commit("SetFlowItem", data);
      localStorage.setItem("zeroStep", JSON.stringify(data.workflow_starts));
      this.$store.commit("SetCustomFormDesign", false);
      this.$router.push({ name: "EditFlows" });
    },
    edit_flow_data(click, data) {
      // console.log(data)
      this.$store.commit("SetCustomFormDesign", false);

      this.$store.commit("SetFlowItem", data.item);
      // localStorage.setItem("zeroStep", JSON.stringify(data.workflow_template));
      localStorage.setItem(
        "zeroStep",
        JSON.stringify(data.item.workflow_starts)
      );
      this.$router.push({ name: "EditFlows" });
    },

    fetch_value(val) {
      return format_Date(val);
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    get_deployed_form(value, info) {
      this.actionItem = {};
      this.formDeployed = true;
      this.componentCheck = 1;
      this.actionItem = {
        label: value,
        Info: info,
      };
    },

    navigate_flow(value) {
      // console.log(value);
      var data = {
        FormEdit: false,
        FlowValue: value,
      };
      setTimeout(() => {
        this.$store.commit("SetformLibrary", false);
        this.$store.commit("SetFormObj", value);
        this.$store.commit("Setpathinfo", "Admin");
        this.$store.commit("SetEditFormDetails", data);
        this.$store.commit("SetFormType", "CUSTOM");
        this.$store.commit("SetDirectoryForm", false);
        // this.$store.commit("SetCustomFormDesign", false);

        this.$router.push("/home/Forms");
        // this.$refs.form.reset();
      }, 500);
    },

    async edit_form(value) {
      this.overlay = true;
      this.$store.commit("SetCustomFormDesign", false);
      await this.get_custom_forms();
      var data = {
        FormEdit: true,
        FlowValue: value,
      };
      this.customFormArrray.forEach((element) => {
        if (element.form_id == value.form_id) {
          this.$store.commit("SetFormName", value.workflow_name);
          this.$store.commit("SetformLibrary", false);
          this.$store.commit("SetFormObj", element);
          this.$store.commit("Setpathinfo", "Admin");
          this.$store.commit("SetEditFormDetails", data);
          this.$store.commit("SetFormType", "CUSTOM");
          this.$store.commit("SetDirectoryForm", false);
          this.$store.commit("SetCustomFormDesign", false);
          this.$store.commit("SetVisitorFormEnabled", false);
          this.$store.commit("SetVisitorFormEdit", false);

          this.$router.push("/home/Forms");
        }
      });
      this.overlay = false;
    },

    async activate_deactivate(value) {
      this.overlay = true;
      this.$store.commit("SetCustomFormDesign", false);
      await this.get_custom_forms();
      this.customFormArrray.forEach((element) => {
        if (element.form_id == value.form_id) {
          this.deleteForm = true;
          this.formInfo = element;
          this.componentCheck = 4;
          this.overlay = false;
        }
      });
      // this.deleteForm = true;
      // this.formInfo = value;
      // this.componentCheck = 3;
    },

    success_delete() {
      this.deleteForm = false;
      this.get_all_flows();
    },

    updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedItems = this.tableData.slice(start, end);
    },

    onDescriptionClick() {
      // Implementation of the onDescriptionClick method
    },
  },
};
</script>

<style scoped>
/* Card Container */
.card-container {
  position: relative;
}

/* Modern Header Styles */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Modern Data Table Styles */
.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__thead) {
  background: #f8f9fa;
}

.modern-data-table :deep(.v-data-table__thead th) {
  background: #f8f9fa !important;
  color: #495057 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(219, 76, 119, 0.04) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 16px 12px !important;
  font-size: 14px;
  color: #495057;
}

/* Table Footer Styles */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(219, 76, 119, 0.1) !important;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.inactive-page:hover {
  background: rgba(219, 76, 119, 0.1) !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>

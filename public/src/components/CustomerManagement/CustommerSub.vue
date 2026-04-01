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
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Customer Management</span>
          <span class="header-subtitle"
            >Manage your customers and subscriptions</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip
          text="Click to take a screenshot Manage your dashboards and analyticsand raise a ticket!"
        >
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30">mdi-help-box</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-text-field
          v-model="searchlist"
          v-if="
            toggle_exclusive == 'customers' || toggle_exclusive == 'pipeline'
          "
          placeholder="Search customers..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="search-field"
          clearable
          style="min-width: 280px; max-width: 320px"
        />
        <v-menu v-if="toggle_exclusive == 'pipeline'" offset-y max-width="350">
          <template #activator="{ props }">
            <v-btn icon v-bind="props" class="mr-5">
              <v-badge
                :content="leadList.length"
                :value="leadList.length"
                color="secondary"
                overlap
              >
                <v-icon color="primary" size="28">mdi-bell-outline</v-icon>
              </v-badge>
            </v-btn>
          </template>

          <v-card>
            <v-list density="compact">
              <v-list-item v-for="(lead, index) in leadList" :key="index">
                <template #prepend>
                  <v-icon color="primary" size="18">mdi-briefcase</v-icon>
                </template>

                <v-list-item-title class="text-wrap">
                  {{ lead.lead_name }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  {{ formatDate(lead.lead_dead_line) }} • {{ lead.stage_name }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="!leadList.length">
                <v-list-item-title class="text-center text-grey">
                  No upcoming deadlines
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-btn
          @click="Add_customer()"
          v-if="toggle_exclusive == 'customers'"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Customer</span>
        </v-btn>
        <v-menu offset-y v-if="toggle_exclusive == 'customers'">
          <template #activator="{ props }">
            <v-btn v-bind="props" class="action-btn" size="small">
              <v-icon>mdi-dots-vertical</v-icon>
              <span>Actions</span>
            </v-btn>
          </template>

          <v-list density="compact">
            <v-list-item
              v-if="toggle_exclusive == 'customers'"
              @click="
                downloadFile(b2btemplateurl, 'Customer_Business_Template.xlsx')
              "
            >
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Download Business Template</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="toggle_exclusive == 'customers'"
              @click="
                downloadFile(
                  individualtemplateurl,
                  'Customer_Individual_Template.xlsx'
                )
              "
            >
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title
                >Download Individual Template</v-list-item-title
              >
            </v-list-item>

            <v-divider class="my-1" />

            <v-list-item v-if="toggle_exclusive == 'customers'">
              <template #prepend>
                <v-icon color="primary">mdi-import</v-icon>
              </template>

              <BulkBusiness
                :on-success="handleSuccessbusiness"
                :before-upload="beforeUpload"
              />
            </v-list-item>

            <v-list-item v-if="toggle_exclusive == 'customers'">
              <template #prepend>
                <v-icon color="primary">mdi-import</v-icon>
              </template>

              <BulkIndividual
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
              />
            </v-list-item>

            <v-list-item
              @click="export_item"
              v-if="toggle_exclusive == 'customers'"
            >
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Export</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="toggle_exclusive"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
        >
          <v-tab value="customers" class="tab-btn">Customers</v-tab>

          <v-tab value="pipeline" class="tab-btn">Pipeline</v-tab>

          <v-tab
            value="members"
            class="tab-btn"
            v-if="
              $store.getters.GetUserObj.user.user_type == 'ADMIN' ||
              this.$store.getters.GetUserObj.user.user_type == 'OWNER'
            "
            >Members</v-tab
          >
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card flat class="overflow-y-auto">
      <div class="text-left" v-if="toggle_exclusive == 'customers'">
        <!-- Customer List Component -->
        <DefaultCustomerList
          :searchValue="searchlist"
          @search-change="handleSearchChange"
        />
      </div>

      <div class="text-left" v-if="toggle_exclusive == 'pipeline'">
        <!-- Pipeline Component -->
        <PipeLine
          :searchValue="searchlist"
          @search-change="handleSearchChange"
         />
      </div>

      <div class="text-left" v-if="toggle_exclusive == 'members'">
        <!-- Members Component -->
        <Settings
          @member-viewed="handleMemberViewed"
          @member-edited="handleMemberEdited"
          @member-deleted="handleMemberDeleted"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
import DefaultCustomerList from "./DefaultCustomerList.vue";
import PipeLine from "./PipeLine.vue";
import Settings from "./Settings.vue";
import BulkBusiness from "@/components/CustomerManagement/Bulkupload/BulkBusiness.vue";
import BulkIndividual from "@/components/CustomerManagement/Bulkupload/BulkIndividual.vue";

import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { customer_function } from "@/graphql/mutations.js";
import {
  export_customer_data,
  list_lead_deadlines,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

const FileSaver = require("file-saver");
import axios from "axios";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    DefaultCustomerList,
    PipeLine,
    Settings,
    BulkBusiness,
    BulkIndividual,
    CreateExternalTicketDialog,
  },
  data: () => ({
    toggle_exclusive: "customers",
    searchlist: "",
    b2btemplateurl: "",
    individualtemplateurl: "",

    // Screenshot Values
    DialogCreateExternalTicket: false,
    ScreenshotFile: null,
    orgDetails: {
      bucket_name: "stichh-medias",
      region: "us-east-1",
    },
    leadList: [],
  }),

  async created() {
    await this.get_lead_list();
    console.log("User Object:", this.$store.getters.GetUserObj.user.user_type);
    // Fetch template URLs
    try {
      let result = await API.graphql(
        graphqlOperation(customer_function, {
          input: {
            action_type: "LIST_CUSTOMER",
          },
        })
      );
      var response = JSON.parse(result.data.customer_function);

      if (response.Status == "SUCCESS") {
        this.b2btemplateurl = response.b2b_template_url;
        this.individualtemplateurl = response.indivisual_template_url;
      } else {
        this.b2btemplateurl = response.b2b_template_url;
        this.individualtemplateurl = response.indivisual_template_url;
      }
    } catch (error) {
      console.error("Error fetching template URLs:", error);
    }
  },

  methods: {
    async get_lead_list() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_lead_deadlines, {})
        );
        var response = JSON.parse(result.data.list_lead_deadlines);

        if (response.Status == "SUCCESS") {
          this.leadList = response.data;
          console.log("leadList", this.leadList);
        } else {
          this.leadList = [];
        }
      } catch (error) {
        console.error("Error fetching template URLs:", error);
      }
    },
    formatDate(ts) {
      return new Date(ts * 1000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },

    handleSearchChange(value) {
      this.searchlist = value;
      // Handle search functionality here
      // console.log('Search changed:', value);
    },
    Add_customer() {
      this.$router.push("/home/CreateCustomer");
    },
    async downloadFile(url, fileName) {
      const fileUrl = url;

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    },
    async download_items(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName + "_" + "Customers" + ".xlsx"
        : "_" + "Customers" + ".xlsx";
      try {
        const response = await axios({
          url: url,
          method: "GET",
          responseType: "blob",
        });
        if (!response.data) {
          throw new Error("No data received from the server.");
        }
        const fileName = fileNames;
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        FileSaver.saveAs(blob, fileName);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    },
    async export_item() {
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(export_customer_data, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        let response = JSON.parse(result.data.export_customer_data);

        if (response.Status == "SUCCESS") {
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            this.download_items(signedUrl);
          }
        }
      } catch (error) {
        console.error("Error exporting data:", error);
      }
    },
    handleSuccess({ results, header }) {
      this.$router.push("/home/UploadCustomer");
      let customerData = {
        excelHeaders: header,
        excelTableData: results,
        customerType: "INDIVISUAL",
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },
    handleSuccessbusiness({ results, header }) {
      this.$router.push("/home/UploadCustomer");
      let customerData = {
        excelHeaders: header,
        excelTableData: results,
        customerType: "BUSINESS",
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 5;
      return isLt1M;
    },
    handleMemberViewed(member) {
      console.log("Member viewed:", member);
      // Handle member view event
      // You can navigate to member details or show modal here
    },
    handleMemberEdited(member) {
      console.log("Member edited:", member);
      // Handle member edit event
      // You can navigate to edit form or show edit modal here
    },
    handleMemberDeleted(member) {
      console.log("Member deleted:", member);
      // Handle member delete event
      // You can show confirmation dialog and delete member here
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
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-field {
  max-width: 320px;
}

.header-actions :deep(.v-field) {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.header-actions :deep(.v-field__input) {
  color: #333 !important;
  font-size: 14px !important;
}

.header-actions :deep(.v-field__label) {
  color: #666 !important;
  font-size: 12px !important;
}

.header-actions :deep(.v-field__prepend-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__append-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__outline) {
  color: #e0e0e0 !important;
}

.header-actions :deep(.v-field--focused .v-field__outline) {
  color: #db4c77 !important;
}

.header-actions :deep(.v-text-field input::placeholder) {
  color: #999 !important;
}

.header-actions :deep(.v-select__selection) {
  color: #333 !important;
  font-size: 14px !important;
}

/* Ensure fields are visible */
.header-actions .v-text-field,
.header-actions .v-select {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
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
</style>

<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <CreateTicketDialog
      :DialogCreateTicket="DialogCreateTicket"
      :org-details="orgDetails"
      @clicked="DialogCreateTicketEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-ticket</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Tickets</span>
          <span class="header-subtitle"
            >Manage your support tickets and issues</span
          >
        </div>
      </div>
      <v-spacer />

      <!--Screenshot Button-->
      <v-tooltip text="Take a screenshot and raise a ticket">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon @click="TakeScreenshot">
            <v-icon color="primary" size="30"> mdi-help-box </v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!--From Date-->
      <v-menu v-model="fromMenu" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-text-field
            v-if="
              toggle_exclusive === 'mytickets' ||
              toggle_exclusive === 'alltickets'
            "
            :model-value="formattedFromDate"
            v-bind="props"
            label="From Date"
            variant="outlined"
            rounded="lg"
            density="compact"
            class="mt-6 mr-3"
            width="80"
            clearable
            @click:clear="clearFromDate"
          />
        </template>
        <v-date-picker
          v-model="fromDate"
          header-color="primary"
          :max="new Date()"
        >
          <template #actions>
            <v-btn color="primary" @click="fromMenu = false">Close</v-btn>
          </template>
        </v-date-picker>
      </v-menu>

      <!--To Date-->
      <v-menu v-model="toMenu" :close-on-content-click="false">
        <template #activator="{ props }">
          <v-text-field
            v-if="
              toggle_exclusive === 'mytickets' ||
              toggle_exclusive === 'alltickets'
            "
            :model-value="formattedToDate"
            v-bind="props"
            label="To Date"
            variant="outlined"
            rounded="lg"
            density="compact"
            class="mt-6 mr-3"
            width="80"
            clearable
            @click:clear="clearToDate"
          />
        </template>
        <v-date-picker
          v-model="toDate"
          header-color="primary"
          :max="new Date()"
        >
          <template #actions>
            <v-btn color="primary" @click="toMenu = false">Close</v-btn>
          </template>
        </v-date-picker>
      </v-menu>

      <!--Search-->
      <v-text-field
        v-if="
          toggle_exclusive === 'mytickets' ||
          toggle_exclusive === 'alltickets' ||
          (toggle_exclusive === 'configuration' &&
            currentOpenedComponent === 'TicketTagsCard')
        "
        v-model="search"
        label="Search"
        rounded="lg"
        density="compact"
        max-width="200"
        variant="outlined"
        class="mt-6 mr-3"
        prepend-inner-icon="mdi-magnify"
      />

      <!--Create Button-->
      <v-tooltip text="Create Internal Ticket">
        <template #activator="{ props }">
          <v-btn
            v-if="toggle_exclusive === 'mytickets'"
            v-bind="props"
            rounded="lg"
            variant="flat"
            color="primary"
            class="mr-2"
            @click="DialogCreateTicket = true"
          >
            <v-icon color="white">mdi-plus</v-icon>
            Create
          </v-btn>
        </template>
      </v-tooltip>

      <!--Export Button (My Tickets)-->
      <v-btn
        v-if="toggle_exclusive === 'mytickets'"
        variant="flat"
        rounded="lg"
        color="primary"
        class="mr-4"
        :loading="loading"
        @click="ExportData"
      >
        <v-icon color="white">mdi-download</v-icon>
        Export
      </v-btn>

      <!--Export Button (All Tickets)-->
      <v-btn
        v-if="toggle_exclusive === 'alltickets'"
        variant="flat"
        rounded="lg"
        color="primary"
        class="mr-4"
        :loading="loading"
        @click="ExportAllTicketsData"
      >
        <v-icon color="white">mdi-download</v-icon>
        Export
      </v-btn>
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
          <v-tab value="mytickets" class="tab-btn">My Tickets</v-tab>
          <v-tab value="alltickets" class="tab-btn" v-if="adminAppExists"
            >All Tickets</v-tab
          >
          <v-tab value="reports" class="tab-btn" v-if="adminAppExists"
            >Reports</v-tab
          >
          <v-tab value="configuration" class="tab-btn" v-if="adminAppExists"
            >Configuration</v-tab
          >
        </v-tabs>
        <v-spacer></v-spacer>
        <v-tooltip text="Refresh">
          <template #activator="{ props }">
            <v-btn
              v-if="
                toggle_exclusive === 'alltickets' ||
                toggle_exclusive === 'mytickets'
              "
              v-bind="props"
              icon
              flat
              color="transparent"
              @click="refreshPage"
            >
              <v-icon color="primary">mdi-refresh</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </v-toolbar>

    <!--Card Imports-->
    <v-card flat class="overflow-y-auto">
      <MyTickets
        v-show="toggle_exclusive === 'mytickets'"
        ref="myTickets"
        v-model:filterStatus="filterStatus"
        :search="search"
        :fromDate="fromDate"
        :toDate="toDate"
        @refresh-data="reloadAllTicketTables"
      />
      <AllTickets
        v-show="toggle_exclusive === 'alltickets'"
        ref="allTickets"
        v-model:filterStatus="filterStatus"
        :search="search"
        :fromDate="fromDate"
        :toDate="toDate"
        @refresh-data="reloadAllTicketTables"
      />
      <Reports v-if="toggle_exclusive === 'reports'" />
      <div class="text-left" v-if="toggle_exclusive === 'configuration'">
        <TicketConfiguration
          ref="ticketConfigRef"
          class="pa-4"
          :search="search"
          @view-change="currentConfigView = $event"
          @component-opened="currentOpenedComponent = $event"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
import MyTickets from "./MyTickets.vue";
import AllTickets from "./AllTickets.vue";
import Reports from "./Reports.vue";
import TicketConfiguration from "./TicketConfiguration.vue";
import CreateExternalTicketDialog from "./CreateExternalTicketDialog.vue";
import CreateTicketDialog from "./CreateTicketDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import html2canvas from "html2canvas";

import { GetAllListTickets } from "@/mixins/GetAllListTickets";
import { generate_my_tickets_excel_report } from "@/graphql/mutations";
import { generate_all_tickets_excel_report } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    MyTickets,
    AllTickets,
    Reports,
    TicketConfiguration,
    CreateExternalTicketDialog,
    CreateTicketDialog,
    SnackBar,
  },

  mixins: [GetAllListTickets],

  data: () => {
    return {
      search: "",
      filterStatus: "",
      toggle_exclusive: "mytickets",
      currentConfigView: "categories",

      fromDate: null,
      toDate: null,
      ScreenshotFile: null,
      currentOpenedComponent: null,

      loading: false,
      toMenu: false,
      fromMenu: false,
      adminAppExists: false,
      DialogCreateTicket: false,
      DialogCreateExternalTicket: false,

      SnackBarComponent: {},
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  async created() {
    this.fetch_admin_apps();
  },

  computed: {
    formattedFromDate() {
      if (!this.fromDate) return "";
      return this.ConvertFromDate(this.fromDate);
    },
    formattedToDate() {
      if (!this.toDate) return "";
      return this.ConvertFromDate(this.toDate);
    },
  },

  watch: {
    toDate() {
      if (this.$refs.myTickets) {
        this.$refs.myTickets.applyDateFilter();
      }
    },
    fromDate() {
      if (this.$refs.myTickets) {
        this.$refs.myTickets.applyDateFilter();
      }
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
    async ExportData() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(generate_my_tickets_excel_report, {
            input: {
              start_date: this.formattedFromDate || null,
              end_date: this.formattedToDate || null,
            },
          }),
        );
        const resultObj = JSON.parse(
          result.data.generate_my_tickets_excel_report,
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        }
        this.loading = false;
        window.open(resultObj.URL);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to generate excel, please try again",
        };
      }
      this.loading = false;
    },
    async ExportAllTicketsData() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(generate_all_tickets_excel_report, {
            input: {
              start_date: this.formattedFromDate || null,
              end_date: this.formattedToDate || null,
            },
          }),
        );
        let resultObj = JSON.parse(
          result.data.generate_all_tickets_excel_report,
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        }
        this.loading = false;
        window.open(resultObj.URL);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to generate excel, please try again",
        };
      }
      this.loading = false;
    },
    ConvertFromDate(fromDate) {
      const date = new Date(fromDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    ConvertToDate(toDate) {
      const date = new Date(toDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    clearFromDate() {
      this.fromDate = null;
      this.$refs.myTickets?.applyDateFilter();
    },
    clearToDate() {
      this.toDate = null;
      this.$refs.myTickets?.applyDateFilter();
    },
    MyTickets() {
      this.$refs.myTickets.CreateTicket();
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userApp = userObj?.user_apps?.find(
        (a) => a.dashboard_unique_type === "TICKET_MANAGEMENT",
      );

      if (!userApp?.is_visible) {
        this.adminAppExists = false;
        return;
      }

      const adminApp = userObj?.admin_apps?.find(
        (a) => a.dashboard_unique_type === "TICKET_MANAGEMENT_ADMINS",
      );

      this.adminAppExists =
        !!adminApp &&
        adminApp.is_dashboard_admin &&
        ["WEB_ONLY", "WEB_PHONE_ONLY"].includes(adminApp.app_usage_level);
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
    },
    DialogCreateExternalTicketEmit(Toggle) {
      this.DialogCreateExternalTicket = false;
      if (Toggle === 2) {
        this.$refs.myTickets.GetAllListCreatedTicketsMethod();
        this.$refs.allTickets.RefreshAllTickets();
      }
    },
    DialogCreateTicketEmit(Toggle) {
      this.DialogCreateTicket = false;
      if (Toggle === 2) {
        this.$refs.myTickets.CreateTicket();
        this.$refs.allTickets?.RefreshAllTickets();
      }
    },
    DialogExportDataEmit() {
      this.DialogExportData = false;
    },
    reloadAllTicketTables(Toggle) {
      if (Toggle === 2) {
        this.$refs.myTickets?.GetAllListCreatedTicketsMethod();
        this.$refs.allTickets?.RefreshAllTickets();
      }
    },
    refreshPage() {
      if (this.toggle_exclusive === "mytickets") {
        this.$refs.myTickets?.GetAllListCreatedTicketsMethod();
      }
      if (this.toggle_exclusive === "alltickets") {
        this.$refs.allTickets?.RefreshAllTickets();
      }
    },
  },
};
</script>

<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <AppSnackBar :AppSnackBarComponent="AppSnackBarComponent" />
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />

    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg mb-4">
            <v-icon color="white mt" size="24">mdi-view-dashboard</v-icon>
          </div>
        </div>
        <div class="header-text mb-3">
          <span class="header-title">Home</span> 
          <span class="header-subtitle">
            Overview of your workflows and activities
          </span>
        </div>
      </div>

      <v-spacer />

      <v-tooltip text="Take a screenshot and raise a ticket">
        <template #activator="{ props }">
          <v-btn icon flat v-bind="props" @click="TakeScreenshot">
            <v-icon size="30" color="primary">mdi-help-box</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-app-bar>

    <!-- ===== Dashboard Body ===== -->
    <v-card v-if="!overlay" flat class="dashboard-root">
      <v-card-text class="">
        <!-- ===== Welcome Banner ===== -->
        <v-card class="welcome-banner" elevation="0">
          <div class="welcome-inner">
            <!-- Left -->
            <div class="banner-left">
              <v-img :src="StichhLogo" class="banner-logo mt-4 ml-3" contain />
              <div>
                <h2 class="welcome-title mt-6 ml-3"> Stichh</h2>
                <p class="welcome-subtitle mt-1 ml-3">
                  Manage your enterprise workflows with precision and ease.
                </p>
              </div>
            </div>

            <!-- Right -->
            <div class="banner-right"> 
              <v-img
                :src="AppDownload"
                class="banner-logo mt-5"
                width="180"
                contain
              />
            </div>
          </div>
        </v-card>

        <v-row class="workflow" dense>
          <!-- Pending -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="pending_form">
  <div class="card-top">
    <div class="icon-wrap pink">
      <v-icon size="20">mdi-file-clock-outline</v-icon>
    </div>

    <!-- RIGHT SIDE -->
    <div class="count-refresh">
     <v-tooltip location="bottom">
  <template #activator="{ props }">
    <v-icon
      v-bind="props"
      @click.stop="refresh_list"
      size="small"
      color="primary"
      class="mr-1"
    >
      mdi-refresh
    </v-icon>
  </template>

  Refresh pending count
</v-tooltip>

      <div class="count-badge">
        {{ pendingCount || 0 }}
      </div>
    </div>
  </div>

  <div class="card-content">
    <h3>Pending Workflows</h3>
    <p>Workflows awaiting your action</p>
  </div>
</v-card>
          </v-col>

          <!-- Submitted -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="submitted_form">
              <div class="card-top">
                <div class="icon-wrap yellow">
                  <v-icon size="20">mdi-file-check-outline</v-icon>
                </div>
              </div>

              <div class="card-content">
                <h3>Submitted Workflows</h3>
                <p>Your submitted workflow requests</p>
              </div>
            </v-card>
          </v-col>

          <!-- Participated -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="participated_form">
              <div class="card-top">
                <div class="icon-wrap blue">
                  <v-icon size="20">mdi-file-document-multiple-outline</v-icon>
                </div>
              </div>

              <div class="card-content">
                <h3>Participated Workflows</h3>
                <p>Workflows you've participated in</p>
              </div>
            </v-card>
          </v-col>

          <!-- Initiate -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="initiate_form">
              <div class="card-top">
                <div class="icon-wrap green">
                  <v-icon size="20">mdi-plus-box-outline</v-icon>
                </div>
              </div>
              <div class="card-content">
                <h3>Initiate Workflow</h3>
                <p>Start a new workflow process</p>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="apps-unified-card mt-5" elevation="0">
          <h3 class="section-title ml-2 deployed-title">
            <v-icon size="18" color="secondary" class="mr-1">mdi-apps</v-icon>
            Apps
            <v-tooltip location="bottom" content-class="custom-tooltip"
              ><template #activator="{ props }"
                ><span class="app-count" v-bind="props">{{
                  deployedAppsCount
                }}</span></template
              >
              {{ deployedAppsCount }} Apps have been deployed for you
            </v-tooltip>
          </h3>

          <div class="apps-grid">
            <div
              v-for="app in allAppsUnified"
              :key="app.id"
              class="app-card"
              :class="{ disabled: !app.isEnabled }"
            >
              <div class="app-icon-wrap" @click="app_detail_dialog(app)">
                <div
                  :class="[
                    'app-icon-bg',
                    app.color, // 🔥 RESTORES background
                    app.isEnabled ? 'icon-deployed' : 'icon-not-deployed',
                    app.id === deployingAppId ? 'icon-deploying' : '',
                  ]"
                >
                  <v-icon color="white" size="26">{{ app.icon }}</v-icon>
                </div>
                <div v-if="app.isEnabled" class="status-badge enabled">
                  <v-icon icon="mdi-check" size="12" color="white" />
                </div>
                <div v-else class="status-badge disabled">
                  <v-icon icon="mdi-lock" size="12" color="white" />
                </div>
              </div>
              <div class="app-name">{{ app.text }}</div>
            </div>
          </div>
        </v-card>
      </v-card-text>
    </v-card>
    <div>
      <DashboardDialog
        :dashboard_dialog="dashboard_dialog"
        :dashboard_data="dashboard_data"
        :owneremail="owneremail"
        :ownerName="ownerName"
        @close="dashboard_dialog = false"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
// Imports
import { get_org_dashboard_data } from "@/graphql/queries";
import { list_pending_workflows_v1 } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
import { mapGetters } from "vuex";
import SnackBar from "@/components/SnackBar.vue";
//import { format } from "date-fns";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import UpgradeDialog from "@/components/AdminApps/UpgradeDialog.vue";
import CreateExternalTicketDialog from "@/components/Tickets/CreateExternalTicketDialog.vue";
import html2canvas from "html2canvas";
import StichhLogo from "@/assets/stichh white logo.png";
import AppDownload from "@/assets/AppDownload.png";
import { get_apps_enabled_status } from "@/graphql/queries";
import DashboardDialog from "./DashboardDialog.vue";
import AppSnackBar from "./AppSnackBar.vue";

// Mixins
import { get_all_users } from "@/mixins/GetAllUsers.js";

export default {
  // Components
  components: {
    OverlayComp,
    UpgradeDialog,
    CreateExternalTicketDialog,
    DashboardDialog,
    SnackBar,
    AppSnackBar,
  },

  // Mixins
  mixins: [get_all_users],

  // Props
  props: {
    chatList: {
      type: Array,
      default: () => [], // set a default value here if needed
    },
    channelDataProp: {
      type: Array,
      default: () => [],
    },
    messageDataProp: {
      type: Array,
      default: () => [],
    },
  },

  // Data
  data() {
    return {
      AppSnackBarComponent: {
        AppSnackBarVmodel: false,
        AppSnackbarText: "",
        AppSnackbarColor: "green",
        timeout: 4000,
        icon: "",
        title: "",
      },
      allApp: [],
      owneremail: "",
      ownerName: "",
      // String properties
      pendingCount: "",
      myteamCount: "",
      billingType: "",
      pendingCount: "",

      // Object properties
      lastNotification: null,
      selectedChannel: null,
      tasksTab: null,
      dashboard_dialog: false,
      dashboard_data: {},

      // Array properties
      listItems: [],
      storednotifications: [],
      tableData: [],
      headers: [
        {
          text: "Initiated By",
          value: "body.data.msg_sent_by",
          sortable: false,
        },
        // { text: "User", value: "form_unique_type", sortable: false },
        {
          text: "Initiated On",
          value: "body.data.msg_created_on",
          sortable: false,
        },
        {
          text: "Message",
          value: "messageTitle",
          sortable: false,
        },
      ],

      // Boolean properties
      loading: false,
      overlay: false,
      tableLoading: false,
      notificationTab: false,
      showLoaders: true,
      dataReady: false,
      showUpgradeDialog: false,
      DialogCreateTicket: false,

      // Null values
      ScreenshotFile: null,
      nextToken: null,

      // Number properties
      submittedWorkflowsCount: 0,
      participatedWorkflowsCount: 0,
      componentCheck: 0,
      windowHeight: 0,
      cardContentHeight: 0,

      SnackBarComponent: {},
      StichhLogo,
      AppDownload,
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  // Lifecycle hooks
  async created() {
    this.windowHeight = window.innerHeight - 80;
    await this.get_pending_workflows();

    await this.get_all_users();

    // var data = JSON.parse(localStorage.getItem("notoficationItems"));
    // this.listItems = data;

    await this.get_App_Details();
    this.app_details();
  },

  mounted() {
    this.$store.commit("SetappName", "Home");
    this.$store.commit("Setappicon", "mdi-home");

    // Start fast loading check
    this.checkDataReady();

    // Set billing type with proper null checks
    this.setBillingType();
  },

  // Watchers
  watch: {
    "$store.getters.GetUserObj": {
      immediate: false,
      deep: true,
      async handler() {
        // User permissions changed → refresh apps
        await this.get_App_Details();
      },
    },

    // Watch for channel data changes to set default selected channel
    recentChannels: {
      handler(newChannels) {
        if (newChannels.length > 0 && !this.selectedChannel) {
          this.selectChannel(newChannels[0]);
        }
      },
      immediate: true,
    },
    // Watch for organization details to set billing type
    "$store.getters.GetOrgDetails": {
      handler(newOrgDetails) {
        if (newOrgDetails && newOrgDetails.organization) {
          this.setBillingType();
        }
      },
      deep: true,
      immediate: true,
    },
  },

  // Computed properties
  computed: {
    deployedAppsCount() {
      const grouped = new Set();

      this.allApp.forEach((app) => {
        if (
          app.is_enabled === true &&
          this.userAccessibleTypes.has(app.dashboard_unique_type)
        ) {
          const baseType = this.normalizeAppType(app.dashboard_unique_type);
          grouped.add(baseType);
        }
      });

      return grouped.size;
    },
    userAccessibleTypes() {
      const userObj = this.$store.getters.GetUserObj;
      if (!userObj) return new Set();

      const types = [];

      if (Array.isArray(userObj.user_apps)) {
        userObj.user_apps.forEach((app) => {
          if (app.is_visible) {
            types.push(app.dashboard_unique_type);
          }
        });
      }

      if (Array.isArray(userObj.admin_apps)) {
        userObj.admin_apps.forEach((app) => {
          if (app.is_visible) {
            types.push(app.dashboard_unique_type);
          }
        });
      }

      return new Set(types);
    },
    deployedAppsCount() {
      const grouped = new Set();

      this.allApp.forEach((app) => {
        if (app.is_enabled === true) {
          const baseType = this.normalizeAppType(app.dashboard_unique_type);
          grouped.add(baseType);
        }
      });

      return grouped.size;
    },
    otherApps() {
      return this.allApp
        .filter(
          (app) =>
            !(
              app.is_enabled === true &&
              this.userAccessibleTypes.has(app.dashboard_unique_type)
            )
        )
        .map((app) => {
          const ui = this.getAppUIConfig(app.dashboard_unique_type);
          return {
            id: app.dashboard_id,
            text: app.dashboard_name,
            description: ui.desc,
            icon: ui.icon,
            color: ui.color,
          };
        });
    },
    allAppsUnified() {
      const grouped = {};

      this.allApp.forEach((app) => {
        const baseType = this.normalizeAppType(app.dashboard_unique_type);
        const ui = this.getAppUIConfig(app.dashboard_unique_type);

        const isAccessible = app.is_enabled === true;

        if (!grouped[baseType]) {
          grouped[baseType] = {
            id: app.dashboard_id,
            text: app.dashboard_name,
            description: app.dashboard_description,
            icon: ui.icon,
            color: ui.color,
            access: app.app_access,
            isEnabled: isAccessible,
            priority: app.dashboard_unique_type.includes("_USERS") ? 2 : 1,
          };
        } else if (isAccessible && grouped[baseType].priority < 2) {
          grouped[baseType].isEnabled = true;
        }
      });

      return Object.values(grouped).sort((a, b) => {
        if (a.isEnabled !== b.isEnabled) {
          return a.isEnabled ? -1 : 1;
        }
        return a.text.localeCompare(b.text, undefined, {
          sensitivity: "base",
        });
      });
    },
    doubledActions() {
      return [...this.quickActionsList, ...this.quickActionsList];
    },
    currentDate() {
      return format(new Date(), "dd-MM-yyyy");
    },
    ...mapGetters([
      "getNotifications",
      "getTaskData",
      "getPendingInfo",
      "getOpenRestChanel",
      "getChatMsg",
    ]),
    notifications() {
      return {
        noticount:
          this.getNotifications.length != 0 ? this.getNotifications.length : 0,
        notificationmsg:
          this.getNotifications.length != 0
            ? this.getNotifications[this.getNotifications.length - 1]
            : {},
      };
    },

    pedningData() {
      return this.getPendingInfo.length != 0 ? this.getPendingInfo[0] : {};
    },

    totalNewMessages() {
      return this.chatList.reduce(
        (total, user) => total + (user.newMessageCount || 0),
        0
      );
    },
    totalChannelMessages() {
      return this.channelDataProp.reduce(
        (total, user) => total + (user.newMessageCount || 0),
        0
      );
    },

    chatListWithNames() {
      return this.chatList.map((chat) => {
        let displayName = this.getUserName(chat);
        return { ...chat, displayName };
      });
    },
    // Channel related computed properties
    recentChannels() {
      // Use the channelData prop and process it like in ChannelsMqqt
      if (!this.channelDataProp || this.channelDataProp.length === 0) {
        return [];
      }

      // Create a processed copy of channels with message data
      const processedChannels = this.channelDataProp.map((channel) => {
        const channelCopy = { ...channel };
        const messageData = this.messageDataProp.find(
          (item) => item.topic === channel.team_topic_id
        );

        // Initialize default values
        if (channelCopy.newMessageCount === undefined) {
          channelCopy.newMessageCount = 0;
        }

        if (messageData && messageData.data && messageData.data.length > 0) {
          const lastMessage = messageData.data[messageData.data.length - 1];
          channelCopy.last_message_on = lastMessage.msg_created_on;
          channelCopy.previous_message =
            lastMessage.msg_title || lastMessage.msg_payload || "";
          channelCopy.msg_type = lastMessage.msg_type || "TEXT";
        } else {
          // Set default values if no messages
          if (!channelCopy.last_message_on) {
            channelCopy.last_message_on = channelCopy.team_created_on;
          }
          if (!channelCopy.previous_message) {
            channelCopy.previous_message = "No messages yet";
          }
          if (!channelCopy.msg_type) {
            channelCopy.msg_type = "TEXT";
          }
        }

        return channelCopy;
      });

      // Sort by last message date or creation date (most recent first)
      processedChannels.sort((a, b) => {
        const aDate = a.last_message_on
          ? new Date(a.last_message_on)
          : new Date(a.team_created_on);
        const bDate = b.last_message_on
          ? new Date(b.last_message_on)
          : new Date(b.team_created_on);
        return bDate - aDate;
      });

      // Return the most recent 4 channels
      return processedChannels.slice(0, 4);
    },
    selectedChannelMessages() {
      if (!this.selectedChannel) return [];

      // Find messages for the selected channel from messageDataProp
      const channelMessages = this.messageDataProp.find(
        (item) => item.topic === this.selectedChannel.team_topic_id
      );

      if (channelMessages && channelMessages.data) {
        // Sort by creation date (newest first) and return unique messages
        const uniqueMessages = Array.from(
          new Map(
            channelMessages.data.map((item) => [item.msg_id, item])
          ).values()
        );
        return uniqueMessages.sort(
          (a, b) => new Date(b.msg_created_on) - new Date(a.msg_created_on)
        );
      }

      return [];
    },
    // Dynamic Quick Actions based on available apps
  },
  // Methods
  methods: {
    refresh_list() {
      this.next_token = null;
      this.get_pending_workflows();
      this.get_App_Details();
    },
    async get_pending_workflows() {
      const userObj = this.$store.getters.GetUserObj;

      if (!userObj || !userObj.organization || !userObj.user) {
        console.log("User not ready yet");
        return;
      }

      this.overlay = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_pending_workflows_v1, {
            input: {
              organization_id: userObj.organization.organization_id,
              user_email_id: userObj.user.user_email_id,
              limit: 21,
              nextToken: null,
            },
          })
        );

        const response = JSON.parse(result.data.list_pending_workflows_v1);

        if (response.Status === "SUCCESS") {
          this.pendingCount = response.count;
          console.log("Pending workflows fetched:", response);
        }
      } catch (error) {
        console.error("Pending API Error:", error);
      }

      this.overlay = false;
    },
    normalizeAppType(type) {
      if (type.startsWith("REWARDS")) {
        return "REWARDS";
      }

      return type.replace(/_ADMINS?$/, "").replace(/_USERS?$/, "");
    },

    app_detail_dialog(apps) {
      console.log("apps:", apps);

      if (!apps.isEnabled) {
        this.dashboard_data = apps;
        this.dashboard_dialog = true;
      } else {
        this.AppSnackBarComponent = {
          AppSnackBarVmodel: true,
          AppSnackbarColor: "green",
          AppSnackbarText: `${apps.text} module is already deployed`,
          timeout: 5000,
          icon: "mdi-information-outline",
        };
      }
    },

    async get_App_Details() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_apps_enabled_status, {
            inputs: {
              // organization_id :this.$store.getters.GetUserObj.organization.organization_id
            },
          })
        );

        var response = JSON.parse(result.data.get_apps_enabled_status);

        if (response.Status == "SUCCESS") {
          this.owneremail = response.data.owner_email_id;
          this.ownerName = response.data.owner_name;
          this.overlay = false;
          this.allApp = response.data.apps;
          console.log(response.data);
          console.log();
        }
      } catch (error) {
        this.overlay = false;
        console.error("Error fetching App details:", error);
      } finally {
        this.overlay = false;
      }
    },
    async success_info(val) {
      this.dashboard_dialog = false;
      this.overlay = true;

      const appName =
        typeof val === "string" ? val : val?.appName || val?.message || "App";

      this.AppSnackBarComponent = {
        AppSnackBarVmodel: true,
        AppSnackbarColor: "green",
        AppSnackbarText:
          val?.message || `${appName} has been deployed successfully`,
        timeout: 4000,
        icon: "mdi-check-circle-outline",
        title: "Deployment Successful",
      };

      try {
        await this.get_all_users();
        await this.get_App_Details();
      } finally {
        this.overlay = false;
      }
    },
    async success_info(val) {
      this.dashboard_dialog = false;
      this.overlay = true;

      const appName =
        typeof val === "string" ? val : val?.appName || val?.message || "App";

      this.AppSnackBarComponent = {
        AppSnackBarVmodel: true,
        AppSnackbarColor: "green",
        AppSnackbarText:
          val?.message || `${appName} has been deployed successfully`,
        timeout: 4000,
        icon: "mdi-check-circle-outline",
        title: "Deployment Successful",
      };

      try {
        await this.get_all_users();
        await this.get_App_Details();
      } finally {
        this.overlay = false;
      }
    },
    error_info(val) {
      this.AppSnackBarComponent = {
        AppSnackBarVmodel: true,
        AppSnackbarColor: "red",
        AppSnackbarText:
          typeof val === "string" ? val : val?.message || "An error occurred",
        timeout: 5000,
        icon: "mdi-alert-circle-outline",
        title: "Error",
      };
    },
    async refreshUserAndApps() {
      await this.get_all_users();

      await this.get_App_Details();
    },

    app_details() {
      var dashboardType = this.allApp.map((item) => item.dashboard_unique_type);
    },
    getColorFromType(type) {
      const DEFAULT_ICON_POOL = [
        "mdi-apps",
        "mdi-view-grid",
        "mdi-grid-large",
        "mdi-layers-outline",
        "mdi-puzzle-outline",
        "mdi-cube-outline",
        "mdi-shape-outline",
        "mdi-view-dashboard-outline",
        "mdi-dots-grid",
        "mdi-widgets-outline",
      ];

      const colors = [
        "bg-blue",
        "bg-green",
        "bg-orange",
        "bg-purple",
        "bg-indigo",
        "bg-teal",
        "bg-pink",
        "bg-brown",
        "bg-yellow",
      ];

      let hash = 0;
      for (let i = 0; i < type.length; i++) {
        hash = type.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    },

    getAppUIConfig(type) {
      const APP_UI_MAP = {
        // TASKS
        TASKS: {
          icon: "mdi-clipboard-check-outline",
          color: "bg-indigo",
          desc: "Task management",
        },

        // MATERIAL
        MATERIAL_USER: {
          icon: "mdi-package-variant",
          color: "bg-blue",
          desc: "Material tracking",
        },
        MATERIAL_ADMIN: {
          icon: "mdi-package-variant-closed",
          color: "bg-deep-blue",
          desc: "Material administration",
        },

        //  CRM
        CUSTOMERS_ADMINS: {
          icon: "mdi-account-multiple",
          color: "bg-teal",
          desc: "Customer management",
        },

        //FORMS
        FORMS: {
          icon: "mdi-form-select",
          color: "bg-purple",
          desc: "Submit forms",
        },
        FORMS_ADMINS: {
          icon: "mdi-form-textbox",
          color: "bg-deep-purple",
          desc: "Form designer & workflows",
        },

        //  VISITS
        VISIT_USERS: {
          icon: "mdi-map-marker-outline",
          color: "bg-green",
          desc: "Track visits",
        },
        VISIT_ADMIN: {
          icon: "mdi-map-marker-account-outline",
          color: "bg-teal",
          desc: "Manage visits",
        },

        //  ATTENDANCE
        PREZENCE: {
          icon: "mdi-face-recognition",
          color: "bg-light-green",
          desc: "Attendance tracking",
        },
        PREZENCE_ADMINS: {
          icon: "mdi-face-recognition",
          color: "bg-green",
          desc: "Attendance administration",
        },

        //PURCHASE
        PURCHASE_ADMIN: {
          icon: "mdi-cart-outline",
          color: "bg-orange",
          desc: "Purchase management",
        },

        //  LOAD OPT
        LOADOPT_USER: {
          icon: "mdi-truck-fast-outline",
          color: "bg-amber",
          desc: "Vehicle load optimization",
        },
        LOADOPT_ADMIN: {
          icon: "mdi-truck-cargo-container",
          color: "bg-deep-orange",
          desc: "Load optimization admin",
        },

        // DASHBOARD
        DASHBOARD_MANAGEMENT: {
          icon: "mdi-view-dashboard-outline",
          color: "bg-indigo",
          desc: "Dashboard access",
        },
        DASHBOARD_MANAGEMENT_ADMINS: {
          icon: "mdi-view-dashboard-edit",
          color: "bg-yellow",
          desc: "Dashboard configuration",
        },

        // SPLAY
        SPLAY_USERS: {
          icon: "mdi-gamepad-variant-outline",
          color: "bg-pink",
          desc: "Play games",
        },
        SPLAY_ADMINS: {
          icon: "mdi-gamepad-variant",
          color: "bg-pink",
          desc: "Game administration",
        },

        //EVENTS
        EVENTS: {
          icon: "mdi-calendar-outline",
          color: "bg-green",
          desc: "Events & schedules",
        },
        EVENTS_ADMINS: {
          icon: "mdi-calendar-outline",
          color: "bg-teal",
          desc: "Event administration",
        },

        // GUEST HOUSE
        GUESTHOUSE_USER: {
          icon: "mdi-home-city",
          color: "bg-brown",
          desc: "Guest house booking",
        },
        GUESTHOUSE_ADMIN: {
          icon: "mdi-home-city-outline",
          color: "bg-deep-brown",
          desc: "Guest house administration",
        },

        // SLOT BOOKING
        BOOKING_SLOT: {
          icon: "mdi-clock-outline",
          color: "bg-blue",
          desc: "Slot booking",
        },
        BOOKING_SLOT_ADMINS: {
          icon: "mdi-timeline-clock",
          color: "bg-blue",
          desc: "Slot management",
        },

        //  BILLING
        BILLING_ADMIN: {
          icon: "mdi-receipt-text-outline",
          color: "bg-indigo",
          desc: "Billing & invoices",
        },

        // CHECKLIST
        CHECKLIST_ADMIN: {
          icon: "mdi-format-list-checks",
          color: "bg-cyan",
          desc: "Checklist management",
        },

        //  REWARDS
        REWARDS_RECOGNITION_USERS: {
          icon: "mdi-trophy-outline",
          color: "bg-amber",
          desc: "Rewards & recognition",
        },
        REWARDS_MANAGEMENT_ADMINS: {
          icon: "mdi-trophy-award",
          color: "bg-deep-orange",
          desc: "Rewards administration",
        },

        //  PAYROLL
        PAYROLL: {
          icon: "mdi-cash-outline",
          color: "bg-green",
          desc: "Payslips",
        },
        PAYROLL_ADMINS: {
          icon: "mdi-cash-multiple",
          color: "bg-deep-green",
          desc: "Payroll administration",
        },

        //FINANCE
        EXPENSE: {
          icon: "mdi-cash-minus",
          color: "bg-orange",
          desc: "Expense tracking",
        },
        EXPENSE_ADMINS: {
          icon: "mdi-cash-check",
          color: "bg-deep-orange",
          desc: "Expense approval",
        },
        AP_AR_USER: {
          icon: "mdi-bank-outline",
          color: "bg-indigo",
          desc: "Accounts payable & receivable",
        },

        //  SALES / INVENTORY
        QABM_USERS: {
          icon: "mdi-chart-line",
          color: "bg-purple",
          desc: "Sales Record",
        },
        SAIM_USERS: {
          icon: "mdi-warehouse",
          color: "bg-blue-grey",
          desc: "Inventory",
        },
        VNDR_USERS: {
          icon: "mdi-account-group-outline",
          color: "bg-brown",
          desc: "Vendor management",
        },
        ORDMG_USERS: {
          icon: "mdi-cart-arrow-right",
          color: "bg-orange",
          desc: "Order management",
        },

        //  DOCS
        COLLATERALS: {
          icon: "mdi-folder-multiple-outline",
          color: "bg-blue",
          desc: "Manage your documents and folders",
        },
        DIRECTORY_USER: {
          icon: "mdi-account-box-multiple-outline",
          color: "bg-grey",
          desc: "Manage your directories and forms",
        },

        // ASSETS
        ASSETS_USER: {
          icon: "mdi-devices",
          color: "bg-cyan",
          desc: "User assets",
        },
        ASSETS_ADMIN: {
          icon: "mdi-devices",
          color: "bg-blue-grey",
          desc: "Asset administration",
        },

        //  PROJECT
        PROJECT_USER: {
          icon: "mdi-briefcase-outline",
          color: "bg-purple",
          desc: "Projects",
        },

        // TICKETS
        TICKET_MANAGEMENT: {
          icon: "mdi-ticket-outline",
          color: "bg-orange",
          desc: "Support tickets",
        },
        TICKET_MANAGEMENT_ADMINS: {
          icon: "mdi-ticket-account",
          color: "bg-deep-orange",
          desc: "Ticket administration",
        },
        TICKET_TECHNICIAN_MANAGEMENT_ADMINS: {
          icon: "mdi-headset",
          color: "bg-red",
          desc: "Assigned tickets",
        },

        // ================= FARM =================
        // FARM: {
        //   icon: "mdi-tractor",
        //   color: "bg-green",
        //   desc: "Farm management",
        // },
        // FARM_ADMINS: {
        //   icon: "mdi-tractor-variant",
        //   color: "bg-deep-green",
        //   desc: "Farm administration",
        // },

        // ================= SURVEILLANCE =================
        // SURVEILLANCE: {
        //   icon: "mdi-cctv",
        //   color: "bg-grey",
        //   desc: "Surveillance monitoring",
        // },
        // SURVEILLANCE_ADMINS: {
        //   icon: "mdi-cctv-off",
        //   color: "bg-deep-grey",
        //   desc: "Surveillance control",
        // },

        // ORG / PLATFORM
        TEAM: {
          icon: "mdi-office-building",
          color: "bg-indigo",
          desc: "Organization information",
        },
        WEBBUILDER_ADMIN: {
          icon: "mdi-web",
          color: "bg-blue",
          desc: "Website builder",
        },
        CALLCENTRAL_ADMIN: {
          icon: "mdi-phone-classic",
          color: "bg-green",
          desc: "Call center",
        },
        CHECKLIST_ADMIN: {
          icon: "mdi-format-list-checks",
          color: "bg-cyan",
          desc: "Checklist management",
        },
        PURCHASE_ADMIN: {
          icon: "mdi-cart-outline",
          color: "bg-orange",
          desc: "Purchase management",
        },
        WEBBUILDER_ADMIN: {
          icon: "mdi-web",
          color: "bg-blue",
          desc: "Website builder",
        },
      };

      return (
        APP_UI_MAP[type] || {
          icon: "mdi-apps",
          color: this.getColorFromType(type),
          desc: type.replace(/_/g, " ").toLowerCase(),
        }
      );
    },

    getTaskStatusColor(status) {
      if (status === "COMPLETED") return "green";
      if (status === "IN PROGRESS") return "orange";
      return "grey";
    },
    getBadgeSizeClass(count) {
      return count && count.toString().length === 1
        ? "fixed-badge small-badge"
        : "fixed-badge auto-badge";
    },
    fetch_channel(value) {
      // console.log(value);
      return value.replace(/<[^>]*>?/gm, "");
    },
    initiate_form() {
      this.$store.commit("SetappName", "Initiate");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/UserForms");
    },

    pending_form() {
      this.$store.commit("SetappName", "Pending");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/PendingList");
    },

    submitted_form() {
      this.$store.commit("SetappName", "Submitted");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/SubmitedList");
    },

    participated_form() {
      this.$store.commit("SetappName", "Participated");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/ParticipatedList");
    },

    myteam_form() {
      this.$router.push("/home/UserTeams");
    },

    async fetch_dashboard_details() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_org_dashboard_data, {})
        );
        var response = JSON.parse(result.data.get_org_dashboard_data);
        this.overlay = false;
        if (response.Status == "SUCCESS") {
          this.pendingCount = response.data.pending_workflows;
          this.submittedWorkflowsCount = response.data.submitted_workflows || 0;
          this.participatedWorkflowsCount =
            response.data.participated_workflows || 0;
          this.myteamCount =
            response.data.user_details[0].total_number_of_users;
        } else {
          this.overlay = false;
        }
      } catch (error) {
        console.error("Error fetching dashboard details:", error);
        this.overlay = false;
      }
    },
    getUserName(chat) {
      if (chat.team_type === "GROUP_CHAT") {
        return chat.team_name;
      }
      if (chat.team_type === "ONE_ON_ONE_MESSAGE") {
        if (!chat.team_topic_id || !this.listUsers || !this.listUsers.length) {
          return chat.team_id || "Unknown User";
        }
        const participants = chat.team_topic_id
          .split("~")
          .map((e) => e.trim().toLowerCase());
        const userObj = this.$store.getters.GetUserObj;
        const myEmail =
          userObj && userObj.user ? userObj.user.user_email_id : null;
        const otherEmail = participants.find((email) => email !== myEmail);

        if (otherEmail) {
          const user = this.listUsers.find(
            (u) =>
              u.user_email_id &&
              u.user_email_id.trim().toLowerCase() === otherEmail
          );
          if (user && user.full_user_name) {
            return user.full_user_name;
          }
        }
        return participants[0];
      }
      return chat.team_name;
    },
    getUserProfilePic(chat) {
      if (
        chat.team_type === "ONE_ON_ONE_MESSAGE" &&
        chat.team_topic_id &&
        this.listUsers &&
        this.listUsers.length
      ) {
        const participants = chat.team_topic_id
          .split("~")
          .map((e) => e.trim().toLowerCase());
        const userObj = this.$store.getters.GetUserObj;
        const myEmail =
          userObj && userObj.user ? userObj.user.user_email_id : null;
        const otherEmail = participants.find((email) => email !== myEmail);

        if (otherEmail) {
          const user = this.listUsers.find(
            (u) =>
              u.user_email_id &&
              u.user_email_id.trim().toLowerCase() === otherEmail
          );
          if (user && user.user_profile_pic_url) {
            return user.user_profile_pic_url;
          }
        }
      }
      return null;
    },
    showAllNotifications() {
      this.componentCheck = 1;
      this.notificationTab = true;
    },
    // Channel related methods
    selectChannel(channel) {
      this.selectedChannel = channel;
    },
    get_date(date) {
      return formatedatetime(date / 1000);
    },

    // Set billing type with proper null checks
    setBillingType() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (
        orgDetails &&
        orgDetails.organization &&
        orgDetails.organization.organization_billing_type
      ) {
        this.billingType = orgDetails.organization.organization_billing_type;
      } else {
        this.billingType = "MICRO"; // Default fallback
      }
    },

    // Fast loading method
    checkDataReady() {
      // Check if we have any data loaded
      const hasData =
        this.chatList.length > 0 ||
        this.channelDataProp.length > 0 ||
        this.pendingCount !== "";

      if (hasData) {
        this.showLoaders = false;
        this.dataReady = true;
      } else {
        // Wait a bit more for data to load
        setTimeout(() => {
          this.showLoaders = false;
          this.dataReady = true;
        }, 1500); // Show loaders for max 1.5 seconds
      }
    },

    // Upgrade Dialog Methods
    openUpgradeDialog() {
      this.showUpgradeDialog = true;
    },

    showSnackbar(config) {
      this.$SnackBar = {
        SnackbarVmodel: true,
        SnackbarColor: config.color || "success",
        SnackbarText: config.text,
        timeout: 5000,
        Top: true,
      };
    },

    // View All Notifications Method
    viewAllNotifications() {
      this.$store.commit("SetappName", "Notifications");
      this.$store.commit("Setappicon", "mdi-bell-outline");
      this.$router.push("/home/Notifications");
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
.dashboard-root {
  background: #f6f8fc;
  width: 100%;
  height: calc(100vh - 72px);
  padding: 14px;
  overflow-y: auto;
}

/* App bar fixed height */
.modern-header-section {
  height: 72px;
}

.welcome-banner {
  border-radius: 20px;
  padding: 6px 14px;
  min-height: 120px;
  max-height: 160px;

  background: linear-gradient(135deg, #0f569a, #da4c77);
  color: white;

  display: flex;
  align-items: center;
}

.welcome-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.welcome-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 2px;
  line-height: 1.3;
}

.banner-logo {
  width: 130px;
  height: auto;
  animation: logoReveal 1s ease forwards;
}

@keyframes logoReveal {
  from {
    transform: translateY(24px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-right {
  display: flex;
  align-items: center;
}

.modern-card {
  border-radius: 18px;
  padding: 12px;
  background: #ffffff;
  cursor: pointer;
  position: relative;

  min-height: 130px;

  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  opacity: 0;
  transform: translateY(14px);
  animation: cardReveal 0.45s ease forwards;
}

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.08);
}

.workflow {
  margin-top: 30px;
}

.card-top {
  display: flex;
  align-items: center;
}

.icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.pink {
  background: linear-gradient(135deg, #ff6a7a, #ffc371);
}

.yellow {
  background: linear-gradient(135deg, #ffb347, #ffcc33);
}

.blue {
  background: linear-gradient(135deg, #36d1c4, #5b86e5);
}

.green {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.count-badge {
  background: #eef4ff;
  color: #1a4ed8;
  font-size: 16px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 8px;
  min-width: 26px;
  text-align: center;
}

.card-content h3 {
  margin-top: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.card-content p {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.35;
}

.deployed-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-count-badge {
  background: #eef4ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  min-width: 22px;
  text-align: center;
  line-height: 1.4;
}

.apps-unified-card {
  border-radius: 24px;
  padding: 16px;
  background: #ffffff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 40vh;
  max-height: 40vh;
}

.apps-grid {
  display: grid;

  /* 10 columns, % based */
  grid-template-columns: repeat(8, calc((110% - 9 * 2%) / 10));

  gap: 50px;

  width: 100%;
  padding: 20px 16px;

  justify-items: center;

  overflow-x: auto;
}

.apps-grid::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.apps-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
}

.apps-grid::-webkit-scrollbar-track {
  background: transparent;
}

.app-card {
  width: 110px;
  min-width: 110px;
  max-width: 110px;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  cursor: pointer;
  transition: transform 0.25s ease;
}

.app-card:not(.disabled):hover {
  transform: translateY(-6px);
}

.app-card-inner {
  transition: transform 0.2s ease;
}

.app-card:hover .app-card-inner {
  transform: translateY(-3px);
}

.app-card.disabled {
  opacity: 0.45;
}

.app-card.disabled:hover {
  transform: none;
}
.app-icon-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 8px;
}

.app-icon-bg {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  z-index: 3;
  pointer-events: none;
  opacity: 1;
  visibility: visible;
  transform: none;
}

.status-badge.enabled {
  background: #22c55e;
}

.status-badge.disabled {
  background: #f5b301;
}

.app-name {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;

  max-width: 100%;
  word-wrap: break-word;
}

.deployed-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 24px; /* 👈 stable */
  height: 24px;

  padding: 0 8px;
  margin-left: 6px;

  background: #eef4ff;
  color: #2563eb;

  font-size: 12px;
  font-weight: 600;

  border-radius: 999px;

  white-space: nowrap;
}

::v-deep(.custom-tooltip) {
  background: linear-gradient(135deg, #0f569a, #da4c77) !important;
  color: white !important;
  border-radius: 10px !important;
  font-weight: 500;
}
.icon-not-deployed {
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.45),
    0 6px 14px rgba(245, 158, 11, 0.35);
  transition: all 0.25s ease;
}

.icon-deploying {
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.7),
    0 10px 22px rgba(99, 102, 241, 0.45);
  transform: scale(1.05);
}

.icon-deployed {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.45),
    0 12px 26px rgba(34, 197, 94, 0.4);
}

/* Hover polish (only for deployed) */
.app-card:hover .icon-deployed {
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.6),
    0 18px 38px rgba(34, 197, 94, 0.55);
}
:deep(.tall-snackbar .v-snackbar__content) {
  min-height: 110px;
  padding: 20px 26px;
}

.deploy-snackbar-body {
  display: flex;
  align-items: flex-start;
}

.deploy-title {
  font-size: 16px;
  font-weight: 600;
}

.deploy-text {
  font-size: 14px;
  opacity: 0.95;
  margin-top: 4px;
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.count-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>

<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <v-app style="background-color: #f2f2f2">
      <!-- :class="{ 'animated-card1': isVisible }" -->
      <v-card style="background-color: #f2f2f2" flat class="ma-2">
        <!-- <v-toolbar dense flat style="background-color: #f2f2f2">
          <v-toolbar-title>Admin Apps</v-toolbar-title>
        </v-toolbar> -->
        <v-card-text class="mt-n2">
          <!-- <v-row class="" no-gutters>
            <v-spacer />
            <v-btn
              class="mx-2 mt-n5"
              @click="screen_refresh()"
              fab
              dark
              x-small
              color="primary"
            >
              <v-icon dark> mdi-refresh </v-icon>
            </v-btn>
          </v-row> -->
          <v-row no-gutters class="">
            <v-col
              cols="12"
              sm="6"
              md="3"
              lg="3"
              v-for="item in items"
              :key="item.dashboard_name"
            >
              <div
                v-if="
                  item.is_visible == true &&
                  (item.app_visible_level == 'WEB_PHONE_ONLY' ||
                    item.app_visible_level == 'WEB_ONLY')
                "
              >
                <v-card
                  flat
                  class="ma-2 responsive-card card-content"
                  @click="handleItemClick(item)"
                >
                  <!-- responsive-card -->
                  <!-- <v-badge
                  :color="item.counts == 0 ? 'white' : 'green'"
                  :content="item.counts"
                  class="mt-n8 mr-5"
                  style="font-size: -10px"
                > -->
                  <v-list-item class="mt-1">
                    <v-list-item-content class="mt-n2">
                      <!-- {{ item.dashboard_name }} -->
                      <v-list-item-title
                        class="d-flex align-center justify-space-between"
                      >
                        <v-spacer />
                        <v-badge
                          :color="item.counts == 0 ? 'white' : 'green'"
                          :content="item.counts"
                          class="mr-8"
                          style="font-size: -10px"
                        >
                        </v-badge>
                        <v-menu offset-y>
                          <template #activator="{ on, attrs }">
                            <v-icon small v-bind="attrs" v-on="on" class="mt-2"
                              >mdi-information-outline</v-icon
                            >
                          </template>
                          <v-card width="500px">
                            <div class="pa-2">
                              {{ item.dashboard_description }}
                            </div>
                          </v-card>
                          <!-- <v-list-item-title></v-list-item-title>
                        </v-list> -->
                        </v-menu>
                      </v-list-item-title>
                      <v-list-item-icon
                        class="d-flex align-center justify-center"
                      >
                        <v-icon
                          class="ma-3 mt-n6"
                          style="font-size: 45px"
                          color="#e26a8e"
                          >{{ item.icon }}</v-icon
                        >
                      </v-list-item-icon>
                      <v-list-item-title
                        class="d-flex align-center justify-center mt-2 ml-2 font-weight-bold"
                        style="font-size: 13.5px"
                      >
                        {{ item.dashboard_name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <!-- </v-badge> -->
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <!-- </v-responsive> -->
    </v-app>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import {
  list_dashboard_channels,
  user_level_dashboaord_counts,
} from "@/graphql/queries.js";
import { dashboard_view_edit } from "@/graphql/mutations.js";
// import { EventBus } from "@/main";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
export default {
  components: {
    SnackBar,
    OverlayComp,
  },
  mixins: [get_current_details],
  data() {
    return {
      items: [],
      SnackBarComponent: {},
      heights: 0,
      headers: [
        { text: "App Name", value: "dashboard_name", sortable: false },

        {
          text: "App Description",
          value: "dashboard_description",
          sortable: false,
        },
      ],
      height: 0,
      tableData: [],
      overlay: false,
      fixed: true,
      tableLoading: false,
      view_apps: false,
      countarray: [],
      withAdmin: [],
      withoutAdmin: [],
      userAdminLevel: false,
      toogleCheck: false,
      isVisible: false,
    };
  },
  async created() {
    this.$store.commit("Setappitems", {});
    this.$store.commit("SetappName", "");
    this.$store.commit("Setappicon", "");
    // if (this.$store.getters.GetadminAppsCheck == true) {
    //   var data = JSON.parse(localStorage.getItem("adminApps"));
    //   this.items = data;
    // } else {
    //   await this.fetch_dashboard_details();
    // }
    this.userAdminLevel =
      this.$store.getters.Getappadmins == true ? true : false;

    this.height = window.innerHeight - 225;
    await this.fetch_dashboard_details();
    // await this.fetch_admin_user_apps(this.userAdminLevel);
    this.heights = window.innerHeight - 80;
  },
  mounted() {
    this.isVisible = true;

    //
    // EventBus.$on("admins", (eventData) => {
    //   if (eventData == "adminApps") {
    //     this.fetch_dashboard_details();
    //   }
    // });
  },
  methods: {
    async change_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(dashboard_view_edit, {
            user_id: this.$store.getters.GetUserObj.user.user_id,
            dashboard_view: this.view_apps == true ? "CARD_VIEW" : "LIST_VIEW",
          })
        );
        this.loading = false;
        this.view_apps =
          JSON.parse(result.data.dashboard_view_edit).dashboard_view ==
          "CARD_VIEW"
            ? true
            : false;

        // await this.get_current_details();
        // this.$store.commit("SetUserObj", this.currentObject);
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    screen_refresh() {
      this.items = [];
      this.fetch_dashboard_details();
    },

    fetch_admin_user_apps(val) {
      if (val == true) {
        this.items = this.withAdmin
          .filter(Boolean)
          .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name));
        this.items = this.items.filter(
          (obj) => obj.app_visible_level !== "PHONE_ONLY"
        );
        this.tableData = this.items;
      } else {
        this.$store.commit("Setappadmins", false);
        this.items = this.withoutAdmin
          .filter(Boolean)
          .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name));
        this.items = this.items.filter(
          (obj) => obj.app_visible_level !== "PHONE_ONLY"
        );
        this.tableData = this.items;
      }
    },

    handleItemClick(item) {
      // console.log(item);
      this.$store.commit("Setappitems", item);
      if (item.dashboard_unique_type == "TASKS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-calendar-check");
        this.$router.push("/TaskUserlevel");
      } else if (item.dashboard_unique_type == "administration") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappadmins", true);
        this.$router.push({
          name: "AdministrationPannel",
          params: {
            name: "Apps",
          },
        });
      } else if (item.dashboard_unique_type == "PREZENCE_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-chart-box");
        this.$store.commit("Setappadmins", true);
        this.$router.push("/AppAdminprezence");
      } else if (item.dashboard_unique_type == "DASHBOARD_MANAGEMENT_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-view-dashboard");
        this.$store.commit("Setappadmins", true);
        this.$router.push("/DashboardList");
      } else if (item.dashboard_unique_type == "EVENTS_ADMINS") {
        this.$store.commit("Setappadmins", true);
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-calendar-text-outline");
        this.$router.push("/EventPlanner");
      } else if (item.dashboard_unique_type == "EXPENSE_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Setappicon", "mdi-cash-multiple");
        this.$router.push("/AppadminExpenses");
      } else if (item.dashboard_unique_type == "FORMS_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Setappicon", "mdi-file-document");
        this.$router.push("/FormDesignerAdmin");
      } else if (item.dashboard_unique_type == "TICKET_MANAGEMENT_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Setappicon", "mdi-ticket");
        this.$router.push("/TicketManagement");
      } else if (item.dashboard_unique_type == "user_team_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Setappicon", "mdi-account-multiple-outline");
        this.$router.push("/AdminTeam");
      } else if (item.dashboard_unique_type == "user_approvals_ADMINS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Setappicon", "mdi-timelapse");
        this.$router.push("/AllTransactions");
      } else if (
        item.dashboard_unique_type == "TICKET_TECHNICIAN_MANAGEMENT_ADMINS"
      ) {
        this.$store.commit("Setappadmins", true);
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-human-male-board");
        this.$router.push("/TicketTypes");
      } else if (item.dashboard_unique_type == "PAYROLL_ADMINS") {
        {
          this.$store.commit("SetappName", item.dashboard_name);
          this.$store.commit("Setappadmins", true);
          this.$store.commit("Setappicon", "mdi-cash");
          this.$router.push("/PayslipAdmintypes");
        }
      } else if (item.dashboard_unique_type == "BOOKING_SLOT_ADMINS") {
        {
          this.$store.commit("SetappName", item.dashboard_name);
          this.$store.commit("Setappadmins", true);
          this.$store.commit("Setappicon", "mdi-book-outline");
          this.$router.push("/SlotSubitems");
        }
      } else if (item.dashboard_unique_type == "TIMESHEET_ADMINS") {
        {
          this.$store.commit("Setappadmins", true);
          this.$store.commit("SetappName", item.dashboard_name);
          this.$store.commit("Setappicon", "mdi-clipboard-text-clock-outline");
          this.$router.push("/AdminTimesheet");
        }
      } else if (item.dashboard_unique_type == "FARM_ADMINS") {
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Setappicon", "mdi-land-fields");
        this.$router.push("/AdminFarmtypes");
        this.$store.commit("SetappName", item.dashboard_name);
      } else if (item.dashboard_unique_type == "ASSETS_ADMIN") {
        this.$store.commit("Setappicon", "mdi-dip-switch");
        this.$store.commit("Setappadmins", true);
        this.$router.push("/AssetTypes");
        this.$store.commit("SetappName", item.dashboard_name);
      } else if (item.dashboard_unique_type == "TVBOARD_ADMIN") {
        this.$store.commit("Setappicon", "mdi-television");
        this.$store.commit("Setappadmins", true);
        this.$store.commit("Settvboardback", false);
        this.$store.commit("SetappName", item.dashboard_name);
        this.$router.push("/TvboardType");
      } else if (item.dashboard_unique_type == "VISIT_ADMIN") {
        this.$store.commit("Setappicon", "mdi-account-group");
        this.$store.commit("Setappadmins", true);
        this.$router.push("/AdminTabs");
        this.$store.commit("SetappName", item.dashboard_name);
      } else if (item.dashboard_unique_type == "MATERIAL_ADMIN") {
        this.$store.commit("Setappicon", "mdi-file-table-box-multiple-outline");
        this.$store.commit("Setappadmins", true);
        this.$router.push("/MaterialManagement");
        this.$store.commit("SetappName", item.dashboard_name);
      } else if (item.dashboard_unique_type == "PURCHASE_ADMIN") {
        this.$store.commit("Setappicon", "mdi-cash-fast");
        this.$store.commit("Setappadmins", true);
        this.$router.push("/Purchase");
        this.$store.commit("SetappName", item.dashboard_name);
      }

      //

      //  else if (item.dashboard_unique_type == "lookit_admins") {
      //   this.$store.commit("Setappadmins", true);
      //   this.$router.push("/DirectoryList");
      // }
    },

    getIconForDashboard(item) {
      if (item.dashboard_unique_type === "TASKS") {
        return "mdi-calendar-check";
      } else if (item.dashboard_unique_type == "DASHBOARD_MANAGEMENT_ADMINS") {
        return "mdi-view-dashboard";
      } else if (item.dashboard_unique_type == "EVENTS_ADMINS") {
        return "mdi-calendar-text-outline";
      } else if (item.dashboard_unique_type == "EXPENSE_ADMINS") {
        return "mdi-cash-multiple";
      } else if (item.dashboard_unique_type == "FORMS_ADMINS") {
        return "mdi-file-document";
      } else if (item.dashboard_unique_type == "TICKET_MANAGEMENT_ADMINS") {
        return "mdi-ticket";
      } else if (item.dashboard_unique_type === "user_team_ADMINS") {
        return "mdi-account-multiple-outline";
      } else if (item.dashboard_unique_type === "user_approvals_ADMINS") {
        return "mdi-timelapse";
      } else if (item.dashboard_unique_type === "PAYROLL_ADMINS") {
        return "mdi-cash";
      } else if (item.dashboard_unique_type === "SURVEILLANCE_ADMINS") {
        return "mdi-camera";
      } else if (
        item.dashboard_unique_type === "TICKET_TECHNICIAN_MANAGEMENT_ADMINS"
      ) {
        return "mdi-human-male-board";
      } else if (item.dashboard_unique_type === "BOOKING_SLOT_ADMINS") {
        return "mdi-book-outline";
      } else if (item.dashboard_unique_type === "PREZENCE_ADMINS") {
        return "mdi-chart-box";
      } else if (item.dashboard_unique_type === "FARM_ADMINS") {
        return "mdi-land-fields";
      } else if (item.dashboard_unique_type === "lookit_admins") {
        return "mdi-file-key";
      } else if (item.dashboard_unique_type === "TIMESHEET_ADMINS") {
        return "mdi-clipboard-text-clock-outline";
      } else if (item.dashboard_unique_type === "ASSETS_ADMIN") {
        return "mdi-dip-switch";
      } else if (item.dashboard_unique_type === "TVBOARD_ADMIN") {
        return "mdi-television";
      } else if (item.dashboard_unique_type === "VISIT_ADMIN") {
        return "mdi-account-group";
      } else if (item.dashboard_unique_type == "MATERIAL_ADMIN") {
        return "mdi-file-table-box-multiple-outline";
      } else if (item.dashboard_unique_type == "PURCHASE_ADMIN") {
        return "mdi-cash-fast";
      } else if (item.dashboard_unique_type == "BILLING_ADMIN") {
        return "mdi-cash-fast";
      } else if (item.dashboard_unique_type == "GUESTHOUSE_ADMIN") {
        return "mdi-home-city";
      } else {
        return "mdi-account-badge";
      }
    },

    async fetch_dashboard_details() {
      this.overlay = true;
      this.teamLoading = true;
      var data = this.$store.getters.GetUserObj;
      this.teamData = [];
      this.countarray = [];
      try {
        let result = await API.graphql(
          graphqlOperation(list_dashboard_channels, {
            limit: 500,
            nextToken: null,
            organization_id: data.organization.organization_id,
            dashboard_status: "ACTIVE",
            topic_type: "APP",
            user_email_id: data.user.user_email_id,
            app_access: "ADMINS",
          })
        );
        this.tableData = [];
        this.withAdmin = [];
        this.withoutAdmin = [];
        this.teamLoading = false;
        this.overlay = false;

        let approvalObjadmins = {
          dashboard_name: "Workflow Administration",
          dashboard_description:
            "Simplify approvals. Manage requests, track progress, and make timely decisions effortlessly.",
          is_visible: true,
          dashboard_unique_type: "user_approvals_ADMINS",
          app_visible_level: "WEB_ONLY",
          app_access: "ADMINS",
          is_dashboard_admin: true,
        };

        let teamObjadmins = {
          dashboard_name: "Team",
          dashboard_description:
            "Effortlessly manage user lists. Organize, track, and customize information for efficient user management",
          is_visible: true,
          dashboard_unique_type: "user_team_ADMINS",
          app_visible_level: "WEB_ONLY",
          app_access: "ADMINS",
          is_dashboard_admin: true,
        };
        // let lookitup = {
        //   dashboard_name: "Directory",
        //   dashboard_description: "Directory of directories",
        //   is_visible: true,
        //   dashboard_unique_type: "lookit_admins",
        //   app_visible_level: "WEB_ONLY",
        //   app_access: "ADMINS",
        //   is_dashboard_admin: true,
        // };
        // let assetWrk = {
        //   dashboard_name: "Asset",
        //   dashboard_description: "Asset ",
        //   is_visible: true,
        //   dashboard_unique_type: "ASSETS_ADMIN",
        //   app_visible_level: "WEB_ONLY",
        //   app_access: "ADMINS",
        //   is_dashboard_admin: true,
        // };

        var data = this.$store.getters.GetUserObj;
        var allArray = [];
        var response = result.data.list_dashboard_channels;
        this.countarray = response.data;
        var data = this.$store.getters.GetUserObj;
        if (data.user.user_type == "ADMIN" || data.user.user_type == "OWNER") {
          response.items.push(teamObjadmins, approvalObjadmins);
        }

        for (let i = 0; i < response.items.length; i++) {
          response.items[i].counts = this.countarray[
            response.items[i].dashboard_name
          ]
            ? this.countarray[response.items[i].dashboard_name]
            : 0;
          if (response.items[i].is_visible) {
            response.items[i].icon = this.getIconForDashboard(
              response.items[i]
            );
          } else {
            delete response.items[i];
          }
        }

        response.items.forEach((item) => {
          if (item.is_dashboard_admin == true) {
            allArray.push(item);
          }
        });

        this.items = allArray
          .filter(Boolean)
          .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name));
        this.$store.commit("SetadminAppsCheck", true);
        localStorage.setItem("adminApps", JSON.stringify(this.items));
        this.items = this.items.filter(
          (obj) => obj.app_visible_level !== "PHONE_ONLY"
        );
        this.tableData = this.items;
      } catch (error) {
        this.teamLoading = false;
        this.overlay = false;
        // console.log(error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
.wrap-textarea {
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}
.responsive-card {
  min-height: 125px; /* Set a minimum height for the card */
  max-height: 350px;
  height: 100px;
  overflow: auto; /* Set the desired height */
}
.card-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure the container takes up full height */
}
.card-content {
  overflow: auto; /* Add overflow property to handle content overflow */
}
</style>
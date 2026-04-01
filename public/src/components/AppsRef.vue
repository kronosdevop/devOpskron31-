<template>
  <div>
    <v-card flat>
      <!-- <v-toolbar flat>
          <v-toolbar-title>Apps </v-toolbar-title>
          <v-spacer />
        </v-toolbar> -->
      <!-- <v-card-title class="d-flex align-center justify-center font-weight-bold"
          >A collection of configurable, easy to use purpose-built apps
        </v-card-title> -->
      <v-card-text>
        <v-row no-gutters class="ma-8 mt-n2">
          <v-col cols="3" v-for="item in items" :key="item.dashboard_name">
            <div @click="handleItemClick(item)">
              <v-card class="ma-2 responsive-card card-content">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-icon class="d-flex align-start justify-start">
                      <v-icon
                        class="ma-1"
                        style="font-size: 80px"
                        :style="getIconStyles(item)"
                        >{{ item.icon }}</v-icon
                      >
                    </v-list-item-icon>
                    <v-list-item-title
                      class="d-flex align-start justify-start mt-2 ml-2 font-weight-bold"
                      style="font-size: small"
                      >{{ item.dashboard_name }}
                    </v-list-item-title>
                    <!-- <v-list-item-subtitle
                        :style="{ color: item.is_visible ? 'green' : 'red' }"
                        class="d-flex align-end justify-end mt-2 font-weight-bold"
                        >{{
                          item.is_visible ? "ENABLED" : "DISABLED"
                        }}</v-list-item-subtitle
                      > -->
                    <v-list-item-subtitle
                      class="d-flex align-start justify-start mt-2 ml-2 wrap-textarea font-weight-bold"
                      >{{ item.dashboard_description }}</v-list-item-subtitle
                    >
                    <v-list-item-title
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="ma-1">
                        <v-btn
                          small
                          color="green"
                          class="white--text"
                          v-if="item.is_visible == true"
                          @click.stop="handleItemClick2(item)"
                        >
                          ENABLED</v-btn
                        >
                        <v-btn
                          v-else
                          small
                          class="white--text"
                          color="red"
                          @click.stop="handleItemClick2(item)"
                        >
                          DISABLED
                        </v-btn>
                      </div>
                      <!-- <v-tooltip bottom>
                        <template #activator="{ on }">
                          <v-icon v-on="on" depressed style="color: blue" medium>
                            mdi-information-slab-circle-outline
                          </v-icon>
                        </template>
                        <span class="white--text">{{
                          item.dashboard_description
                        }}</span>
                      </v-tooltip> -->
                      <!-- <v-spacer />
                        <v-icon
                          color="primaryColor"
                          @click.stop="handleItemClick2(item)"
                          >mdi-pencil</v-icon
                        > -->
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <!-- <v-list-item-icon> <v-icon @click="handleItemClick2(item)">mdi-pencil</v-icon> </v-list-item-icon> -->
    </v-card>
    <div v-if="componentCheck == 3">
      <DashboardSortvisibility
        :SortVisibility="SortVisibility"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="SortVisibility = false"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    
    <script>
/*eslint-disable*/
import DashboardSortvisibility from "@/components/AdminDashboard/DashboardDialogs/DashboardSortvisibility.vue";
import SnackBar from "@/components/SnackBar.vue";

import { list_dashboard_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    DashboardSortvisibility,
  },
  data() {
    return {
      SnackBarComponent: {},

      items: [],

      delete_customdashboard: false,

      custom_details: {},
      componentCheck: 0,
      rowInfo: {},
      order_sort: false,
      displayDialog: false,
      fixed: true,
      SortVisibility: false,
    };
  },
  created() {
    this.fetch_dashboard_details();
  },
  methods: {
    handleItemClick(item) {
      if (item.dashboard_unique_type == "TASKS") {
        this.$router.push("/MyTask");
      } else if (item.dashboard_unique_type == "EVENTS") {
        this.$router.push("/EventPlanner");
      } else if (item.dashboard_unique_type == "COLLATERALS") {
        this.$router.push("/Cabinet");
      } else if (item.dashboard_unique_type == "CHATGPT") {
        this.$router.push("/AdminChatgpt");
      } else if (item.dashboard_unique_type == "PREZENCE") {
        this.$router.push("/prezenceadmin");
      } else if (item.dashboard_unique_type == "VEDIO_CONFERENCE") {
        this.$router.push("/AdminZoom");
      } else if (item.dashboard_unique_type == "EXPENSE") {
        this.$router.push("/AdminExpensetype");
      } else if (item.dashboard_unique_type == "FORMS") {
        this.$router.push("/AdminFormTemplate");
      }
    },

    handleItemClick2(item) {
      this.componentCheck = 3;
      this.rowInfo = item;
      this.SortVisibility = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.SortVisibility = false;

      this.fetch_dashboard_details();
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

    async fetch_dashboard_details() {
      var data = this.$store.getters.GetUserObj;

      this.teamInfo = {};
      try {
        let result = await API.graphql(
          graphqlOperation(list_dashboard_channels, {
            limit: 500,
            nextToken: null,
            organization_id: data.organization.organization_id,
            dashboard_status: "ACTIVE",
            topic_type: "APP",
          })
        );

        var response = JSON.parse(result.data.list_dashboard_channels);

        this.teamInfo = response;

        this.items = response.items;
        this.items = response.items.map((item) => ({
          ...item,
          icon: this.getIconForDashboard(item),
        }));

        this.items.sort((a, b) =>
          a.dashboard_name.localeCompare(b.dashboard_name)
        );
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

    getIconForDashboard(item) {
      if (item.dashboard_unique_type === "TASKS") {
        return "mdi-calendar-check";
      } else if (item.dashboard_unique_type === "PREZENCE") {
        return "mdi-calendar-multiple";
      } else if (item.dashboard_unique_type === "COLLATERALS") {
        return "mdi-file-document";
      } else if (item.dashboard_unique_type === "EXPENSE") {
        return "mdi-cash-multiple";
      } else if (item.dashboard_unique_type === "CHATGPT") {
        return "mdi-robot";
      } else if (item.dashboard_unique_type === "EVENTS") {
        return "mdi-calendar-text-outline";
      } else if (item.dashboard_unique_type === "VEDIO_CONFERENCE") {
        return "mdi-camera-metering-center";
      } else if (item.dashboard_unique_type === "DISCUSSION_ROOM_ACCESS") {
        return "mdi-account-multiple";
      } else if (item.dashboard_unique_type === "FORMS") {
        return "mdi-file";
      }

      {
        return "mdi-account-badge";
      }
    },
    getIconStyles(item) {
      const colorMap = {
        "mdi-calendar-check": "#DB4C77",
        "mdi-calendar-multiple": "orange",
        "mdi-file-document": "red",
        "mdi-account-badge": "orange",
        "mdi-cash-multiple": "green",
        "mdi-robot": "black",
        "mdi-calendar-text-outline": "brown",
        "mdi-camera-metering-center": "#10559A",
        "mdi-account-multiple": "blue",
        "mdi-file": "red",
      };
      const iconColor = colorMap[item.icon] || "black";

      return {
        color: iconColor,
      };
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
  height: 255px; /* Set the desired height */
}
.card-content {
  overflow: auto; /* Add overflow property to handle content overflow */
}
</style>
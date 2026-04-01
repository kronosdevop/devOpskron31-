<template>
  <div>
    <div v-if="dispalyadashboard == false">
      <v-card flat>
        <v-toolbar flat>
          <!-- <v-toolbar-title>Dashboard </v-toolbar-title> -->
          <v-spacer />
          <v-btn
            depressed
            @click="add_mutation()"
            dark
            class="text-capitalize cardCss"
          >
            Add
          </v-btn>
          <v-btn
            dark
            class="text-capitalize cardCss ml-2"
            @click="back_call()"
            v-show="$store.getters.Getappitems.is_dashboard_admin == false"
          >
            <v-icon class="mr-2">mdi-step-backward</v-icon>
            Back
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-data-table
            :headers="teamHeaders"
            :height="height"
            :fixed-header="fixed"
            :items="teamData"
            :loading="teamLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="20"
            :sort-by="['dashboard_name']"
            dense
            class="elevation-1 dtwidth"
            :options.sync="pagination"
            @update:options="handle_pagination()"
            @click:row="handleClick"
          >
            <template v-slot:[`item.dashboard_type`]="{ item }">
              <div v-if="item.dashboard_type == 'STANDARD'">SYSTEM</div>
              <div v-else>CUSTOM</div>
            </template>
            <template v-slot:[`item.dashboard_name`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon
                    small
                    color="green"
                    v-on="on"
                    class="mt-3"
                    v-if="item.dashboard_security == 'OPEN'"
                    >mdi-lock-open-variant-outline
                  </v-icon>
                  <v-icon class="mt-3" small color="red" v-on="on" v-else
                    >mdi-lock-outline
                  </v-icon>
                  <div class="ml-7 mt-n4" v-on="on">
                    {{
                      item.dashboard_name.length >= 40
                        ? item.dashboard_name.substr(0, 40) + "..."
                        : item.dashboard_name
                    }}
                  </div>
                </template>
                <div class="text-left" v-if="item.dashboard_security == 'OPEN'">
                  Open Channel
                </div>
                <div class="text-left" v-else>Restricted Channel</div>
                <div class="textWrap text-left" style="max-width: 250px">
                  {{ item.dashboard_name }}
                </div>
              </v-tooltip>
            </template>

            <template v-slot:[`item.dashboard_created_on`]="{ item }">
              <span v-text="get_date(item.dashboard_created_on)"></span>
            </template>
            <template v-slot:[`item.sort_range`]="{ item }">
              <span class="caption ml-2">{{ item.sort_range }}</span>
              <v-icon
                small
                @click.stop="edit_sorting(item)"
                class="ml-5"
                color="primaryColor"
              >
                mdi-pencil
              </v-icon>
            </template>
            <template v-slot:[`item.dashboard_status`]="{ item }">
              <span v-if="item.is_visible == true" class="green--text"
                >Enabled</span
              >
              <span v-if="item.is_visible == false" class="red--text"
                >Disabled
              </span>
            </template>
            <template v-slot:[`item.is_visible`]="{ item }">
              <v-btn
                v-if="item.is_visible == true && item.is_editable == true"
                x-small
                color="red"
                class="white--text"
                @click.stop="visbility_action(item, 'Visible')"
                >Disable</v-btn
              >
              <v-btn
                v-if="item.is_visible == true && item.is_editable == false"
                x-small
                disabled
                color="red"
                class="white--text"
                @click.stop="visbility_action(item, 'Visible')"
                >Disable</v-btn
              >
              <v-btn
                v-if="item.is_visible == false"
                x-small
                color="green"
                class="white--text"
                @click.stop="visbility_action(item, 'Invisible')"
                >Enable</v-btn
              >
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon small color="red" @click.stop="delete_item(item)"
                >mdi-delete</v-icon
              >
              <!-- <v-menu bottom center>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      color="primaryColor"
                      icon
                      v-bind="attrs"
                      v-on="on"
                      :disabled="item.dashboard_type != 'CUSTOM'"
                    >
                      <v-icon>mdi-format-list-bulleted-square</v-icon>
                    </v-btn>
                  </template>
                  <template v-slot:[`item.status`]="{ item }">
                    <span v-if="item.is_visible == true" class="green--text"
                      >Enabled</span
                    >
                    <span v-if="item.is_visible == false" class="red--text"
                      >Disabled
                    </span>
                  </template>
                  <v-list style="max-width: 200px" dense>
                    <v-list-item
                      v-if="item.dashboard_type == 'CUSTOM'"
                      @click="edit_view(item)"
                    >
                      <v-list-item-title style="font-size: medium">
                        Edit Details
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="item.dashboard_type == 'CUSTOM'"
                      @click="delete_item(item)"
                    >
                      <v-list-item-title style="font-size: medium">
                        Delete
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="item.dashboard_type == 'CUSTOM'"
                      @click="view_qr(item)"
                    >
                      <v-list-item-title style="font-size: medium">
                        View Qr
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="item.dashboard_type == 'CUSTOM'"
                      @click="view_api(item)"
                    >
                      <v-list-item-title style="font-size: medium">
                        View API
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu> -->
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
    <div v-if="dispalyadashboard == true">
      <v-card flat>
        <v-toolbar flat>
          <!-- <v-toolbar-title class="mr-8">Dashboard</v-toolbar-title> -->
          <v-btn-toggle
            class="ml-3"
            v-model="toggle_exclusive"
            color="grey"
            mandatory
          >
            <v-btn small class="black--text" text value="dashboard_view">
              Dashboard
            </v-btn>
            <v-btn small class="black--text" text value="dashboard_edit">
              About
            </v-btn>

            <v-btn
              small
              class="black--text"
              text
              value="dashbard_api"
              v-show="rowInfo.dashboard_publish_type == 'DASHBOARD'"
            >
              Api
            </v-btn>
          </v-btn-toggle>
          <v-spacer />
          <v-btn depressed @click="back_mutation()" dark class="cardCss"
            ><v-icon class="mr-2">mdi-step-backward</v-icon>
            Back
          </v-btn>
        </v-toolbar>
        <div class="text-left" v-if="toggle_exclusive == 'dashboard_edit'">
          <EditDashboard :custom_details="custom_details" />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'dashboard_view'">
          <DashboardView :rowInfo="rowInfo" />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'dashbard_api'">
          <DashboardApi :rowInfo="rowInfo" @clicked="success_prop" />
        </div>
      </v-card>
    </div>
    <CustomDelete
      :delete_customdashboard="delete_customdashboard"
      :custom_details="custom_details"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      v-on:deleteMSg="delete_msg"
      @clicked="delete_customdashboard = false"
    />
    <CreateDashboard
      :Create_dash_board="Create_dash_board"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      @clicked="Create_dash_board = false"
    />
    <!-- <ViewQr
        :qr_view="qr_view"
        :custom_details="custom_details"
        @clicked="qr_view = false"
      /> -->
    <div v-if="componentCheck == 1">
      <DashboardVisibility
        :rowInfo="rowInfo"
        :teamInfo="teamInfo"
        :displayDialog="displayDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clciked="displayDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DashboardSort
        :order_sort="order_sort"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="order_sort = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
/*eslint-disable*/

import SnackBar from "@/components/SnackBar.vue";
// import ViewQr from "@/components/AdminDashboard/DashboardDialogs/ViewQr.vue";
import CustomDelete from "@/components/AdminDashboard/DashboardDialogs/CustomDelete.vue";
import DashboardVisibility from "@/components/AdminDashboard/DashboardDialogs/DashboardVisibility.vue";
import EditDashboard from "@/components/AdminDashboard/DashboardDialogs/EditDashboard.vue";
import CreateDashboard from "@/components/AdminDashboard/DashboardDialogs/CreateDashboard.vue";
import { list_dashboard_channels_v2 } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import DashboardSort from "@/components/AdminDashboard/DashboardDialogs/DashboardSort.vue";
import DashboardApi from "@/components/AdminDashboard/DashboardDialogs/DashboardApi.vue";
import DashboardView from "@/components/AdminDashboard/DashboardDialogs/DashboardView.vue";
export default {
  components: {
    CustomDelete,
    SnackBar,
    DashboardApi,
    EditDashboard,
    CreateDashboard,
    DashboardView,
    // ViewQr,
    DashboardSort,
    DashboardVisibility,
  },
  // props:{
  //   succesCheck:Boolean
  // },
  data() {
    return {
      SnackBarComponent: {},
      toggle_exclusive: "dashboard_view",
      teamHeaders: [
        { text: "Name", value: "dashboard_name", sortable: false },
        {
          text: "Created By",
          value: "dashboard_created_by",
          sortable: false,
        },
        // {
        //   text: "Created on",
        //   value: "dashboard_created_on",
        //   sortable: false,
        // },
        {
          text: "Subscribe Count",
          value: "subscribe_counts",
          sortable: false,
        },
        {
          text: "Dashboard type",
          value: "dashboard_type",
          sortable: false,
        },
        // {
        //   text: "Sort Weightage",
        //   value: "sort_range",
        //   sortable: false,
        // },
        { text: "Visibility", value: "dashboard_status", sortable: false },
        { text: "Status", value: "is_visible", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      teamData: [
        // {
        //   dashboard_name: "Frozen Yogurt",
        //   dashboard_description: 159,
        //   dashboard_type: 6.0,
        //   type: 24,
        // },
      ],
      items: [
        { title: "View Details" },
        { title: "Delete" },
        { title: "View Qr" },
      ],
      teamLoading: false,
      delete_customdashboard: false,
      // edit_properties: false,
      Create_dash_board: false,
      dispalyadashboard: false,
      // qr_view: false,
      custom_details: {},
      componentCheck: 0,
      rowInfo: {},
      order_sort: false,
      displayDialog: false,
      fixed: true,
      nextToken: null,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
    };
  },
  mounted() {
    if (this.$store.getters.Getappitems.is_dashboard_admin == false) {
      this.height = window.innerHeight - 220;
    } else {
      this.height = window.innerHeight - 300;
    }
  },
  created() {
    this.fetch_dashboard_details();
    // this.height = window.innerHeight - 220;
    this.$store.commit("Setdashboarditems", {});
  },
  methods: {
    handle_pagination() {
      if (this.nextToken) {
        this.fetch_dashboard_details();
      }
    },
    handleClick(item) {
      if (item.dashboard_type == "CUSTOM") {
        this.rowInfo = item;
        this.custom_details = item;
        this.$store.commit("Setdashboarditems", this.custom_details);

        // console.log(item);
        this.$router.push("DashBoardTypelist");
        // this.dispalyadashboard = true;
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "System Dashboard Can't be Edited",
          timeout: 2000,
          Top: true,
        };
      }
    },

    delete_msg() {},
    success_prop(val) {
      if (val == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "Copied",
          timeout: 2000,
          Top: true,
        };
      }
    },
    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },
    back_mutation() {
      this.dispalyadashboard = false;
    },
    edit_sorting(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.order_sort = true;
    },
    // edit_view(item) {
    //   this.custom_details = item;
    //   this.edit_properties = true;
    // },
    delete_item(item) {
      this.custom_details = item;
      this.delete_customdashboard = true;
    },
    // view_qr(item) {
    //   this.custom_details = item;
    //   this.qr_view = true;
    // },
    visbility_action(info, displaytype) {
      this.rowInfo = {};

      this.componentCheck = 1;
      this.displayDialog = true;
      this.rowInfo = {
        info: info,
        displaytype: displaytype,
      };
    },

    view_api(item) {
      this.rowInfo = item;
      this.dispalyadashboard = true;
      this.toggle_exclusive = "dashboard_view";
    },
    add_mutation() {
      this.Create_dash_board = true;
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.Create_dash_board = false;
      // this.edit_properties = false;
      this.delete_customdashboard = false;
      this.order_sort = false;
      this.displayDialog = false;
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
      this.teamLoading = true;
      var data = this.$store.getters.GetUserObj;
      this.teamData = [];
      this.teamInfo = {};
      try {
        let result = await API.graphql(
          graphqlOperation(list_dashboard_channels_v2, {
            input: {
              limit: 50,
              nextToken: this.nextToken,
              organization_id: data.organization.organization_id,

              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.teamLoading = false;
        var response = JSON.parse(result.data.list_dashboard_channels_v2);
        if (response.Status == "SUCCESS") {
          this.teamInfo = response;
          this.nextToken = response.nextToken;
          let array = this.teamData.concat(response.items);

          this.teamData = array;
          const uniqueArrayOfObjects = this.teamData.filter(
            (obj, index, self) =>
              index ===
              self.findIndex((o) => o.dashboard_id === obj.dashboard_id)
          );

          this.teamData = uniqueArrayOfObjects;

          this.teamData.sort((a, b) => b.sort_range - a.sort_range);
        } else {
          this.teamLoading = false;
        }

        // console.log(this.teamData);
      } catch (error) {
        this.teamLoading = false;
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
  
  <style>
</style>
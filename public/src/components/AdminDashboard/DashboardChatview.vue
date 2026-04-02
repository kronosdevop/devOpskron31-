<template>
  <div>
    <v-toolbar class="mt-4" dense flat>
      <!-- <v-toolbar-title class="ml-3">Dashboard </v-toolbar-title> -->
      <v-spacer />
      <v-btn
        depressed
        @click="add_mutation()"
        dark
        class="text-capitalize cardCss"
      >
        Create
      </v-btn>
      <v-btn dark class="text-capitalize cardCss ml-2" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <v-card class="" flat :height="heightchat">
      <v-card-text>
        <v-row>
          <v-divider vertical></v-divider>
          <v-col cols="3">
            <v-card flat :height="heightchat">
              <v-card-text>
                <!-- <v-card-title class="mt-n9 ml-n4"> My Dashboard </v-card-title> -->
                <v-text-field
                  class="mt-n3"
                  label="Search"
                  dense
                  v-model="searchlist"
                  append-icon="mdi-magnify"
                ></v-text-field>
                <v-responsive
                  class="overflow-y-auto mt-2"
                  :height="titleheight"
                >
                  <v-list v-if="filteredTeamData.length > 0">
                    <template v-for="(item, index) in filteredTeamData" :key="index">
        <v-divider :inset="item.inset"></v-divider>

                      <v-list-item
                        v-if="filteredTeamData.length > 0"
                        :key="item.dashboard_name"
                        @click="forms_data(item)"
                        class="text-left"
                      >
                        <v-list-item-content
                          class="d-flex align-end justify-end"
                        >
                          <v-list-item-title
                            class="title-wrapper full-width-title ma-1"
                          >
                            {{ item.dashboard_name }}</v-list-item-title
                          >
                          <v-list-item-subtitle class="title-wrapper ma-1">
                            {{
                              item.dashboard_created_by
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle class="title-wrapper ma-1">
                            {{
                              item.last_published_on == undefined
                                ? "-"
                                : fetch_value(item.last_published_on)
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle
                            class="title-wrapper ma-1"
                          ></v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-list>
                  <div v-else class="ml-5">No Dashboard</div>
                </v-responsive>
              </v-card-text>
            </v-card>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col :cols="check_value == false ? '9' : '6'">
            <v-card
              v-if="decription != ''"
              flat
              :height="heightchat"
              class="text-left"
            >
              <v-toolbar @click="edit_detailes">
                <div>
                  {{ dashboarditems.dashboard_name }}
                  <br />
                  <div class="">Tap here for Group Info</div>
                </div>

                <v-spacer /><v-icon
                  color="primaryColor"
                  v-if="
                    dashboarditems.dashboard_created_by ==
                      $store.getters.GetUserObj.user?.user_email_id &&
                    dashboarditems.dashboard_publish_type == 'DASHBOARD' &&
                    dashboarditems.dashboard_level != 'STANDARD'
                  "
                  @click.stop="publish_detailes()"
                  >mdi-send-variant-outline</v-icon
                >
              </v-toolbar>
              <v-divider />
              <v-card-text class="custom-background">
                <v-card class="ma-4">
                  <v-responsive
                    class="overflow-y-auto mt-2 pt-2"
                    :height="heightres"
                  >
                    <v-card-title>{{ dashboardtitle }}</v-card-title>
                    <v-img
                      v-if="imageurl != ''"
                      contain
                      max-height="150"
                      max-width="250"
                      content-class="mt-1"
                      :src="imageurl"
                      aspect-ratio="2"
                    ></v-img>
                    <!-- <div class="ml-3 mt-1 mr-4">{{ dashboardtitle }}</div> -->
                    <div class="ml-3 mt-1 mr-4" v-html="decription"></div>
                    <v-card-subtitle>{{ dashboardSummary }}</v-card-subtitle>

                    <a :href="dashboardinforurl" target="_blank" class="ml-4">{{
                      dashboardinforurl
                    }}</a>
                  </v-responsive>
                </v-card>
              </v-card-text>
            </v-card>

            <v-card v-else flat>
              <div v-if="Count == 1">
                <v-toolbar @click="edit_detailes">
                  <div>
                    {{ dashboarditems.dashboard_name }}
                    <br />
                    <div class="">Taphere for Group Info</div>
                  </div>
                  <v-spacer />
                  <v-icon
                    color="primaryColor"
                    v-if="
                      dashboarditems.dashboard_created_by ==
                        $store.getters.GetUserObj.user?.user_email_id &&
                      dashboarditems.dashboard_publish_type == 'DASHBOARD' &&
                      dashboarditems.dashboard_level != 'STANDARD'
                    "
                    @click.stop="publish_detailes()"
                    >mdi-send-variant-outline</v-icon
                  >
                </v-toolbar>
              </div>
              <div class="center-content">No Information</div>
            </v-card>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="3" v-if="check_value == true">
            <v-card flat>
              <v-toolbar flat>
                <v-toolbar-title>Group Info </v-toolbar-title>
                <v-spacer />
                <v-icon color="red" @click.stop="delete_item()" class="mr-3"
                  >mdi-delete</v-icon
                ><v-icon @click="close_edit">mdi-close</v-icon></v-toolbar
              >
              <v-card-text>
                <v-card-actions class="justify-center">
                  <div
                    style="border: 1px solid black; max-width: fit-content"
                    class="pa-3 mb-1 mt-n2"
                  >
                    <VueQRCodeComponent
                      :text="member_qr"
                      error-level="H"
                      :size="100"
                    ></VueQRCodeComponent>
                  </div>
                </v-card-actions>
                <v-form ref="form">
                  <v-row class="ml-1">
                    <v-col
                      cols="12"
                      v-if="
                        dashboarditems.dashboard_created_by ==
                        $store.getters.GetUserObj.user?.user_email_id
                      "
                    >
                      <v-text-field
                        outlined
                        :readonly="isUserReadOnly"
                        dense
                        style="max-width: 600px"
                        label="Name"
                        :rules="[(v) => !!v || 'Required']"
                        :counter="50"
                        v-model="dashboard_name"
                        maxlength="50"
                      />
                      <v-textarea
                        outlined
                        dense
                        :readonly="isUserReadOnly"
                        :rules="[(v) => !!v || 'Required']"
                        style="max-width: 600px"
                        label="Description"
                        class="mt-n2"
                        v-model="broadcastdescription"
                        :counter="100"
                        maxlength="100"
                      />

                      <v-col cols="12">
                        <v-row>
                          <v-col cols="10">
                            <v-select
                              outlined
                              :items="types_item"
                              :readonly="isUserReadOnly"
                              dense
                              style="max-width: 550px"
                              class="ml-n2 mt-n4"
                              label="Type"
                              v-model="dashboard_type"
                            />
                          </v-col>
                          <v-col cols="2">
                            <v-tooltip bottom>
                              <template #activator="{ on, attrs }">
                                <v-icon class="mt-n1" v-bind="attrs" v-on="on"
                                  >mdi-help-circle</v-icon
                                >
                              </template>
                              <span
                                >Open<br />
                                Restricted</span
                              >
                            </v-tooltip>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-if="dashboard_type == 'RESTRICTED'"
                              outlined
                              :readonly="isUserReadOnly"
                              dense
                              :rules="[(v) => !!v || 'Required']"
                              style="max-width: 600px"
                              label="Password"
                              class="ml-n2 mt-n4"
                              v-model="Password"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-col>
                    <v-col cols="12" v-else>
                      <v-row class="text-left">
                        <v-col cols="12">
                          <label class="font-weight-bold">Name : </label>
                          <br />
                          <span>{{ dashboard_name }}</span>
                        </v-col>
                        <v-col cols="12">
                          <label class="font-weight-bold">Description : </label>
                          <br />
                          <span>{{ description }}</span>
                        </v-col>
                        <v-col cols="12">
                          <label class="font-weight-bold">Type : </label>
                          <br />
                          <span>{{ dashboard_type }}</span>
                        </v-col>
                        <v-col cols="12">
                          <label class="font-weight-bold">Password : </label>
                          <br />
                          <span>{{ Password }}</span>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" class="mt-n8">
                      <v-btn
                        depressed
                        :loading="loading"
                        @click="validate_data()"
                        dark
                        block
                        v-show="
                          dashboarditems.dashboard_created_by ==
                          $store.getters.GetUserObj.user?.user_email_id
                        "
                        class="cardCss text-capitalize mt-5"
                      >
                        Save
                      </v-btn>
                      <v-btn
                        dark
                        block
                        class="cardCss text-capitalize mt-5"
                        v-if="
                          dashboarditems.dashboard_publish_type == 'DASHBOARD'
                        "
                        @click.stop="broadcast_api()"
                        >API Configuration
                      </v-btn>
                      <v-btn
                        depressed
                        :loading="loadingadd"
                        @click="validate_add()"
                        block
                        class="text-capitalize mt-5"
                      >
                        <v-icon color="primaryColor" class="mr-2"
                          >mdi-account-multiple-plus-outline</v-icon
                        >
                        Add Memebers
                      </v-btn>
                      <div class="font-weight-bold mt-4">
                        No of Subcribers :{{ dashboarditems.subscribe_counts }}
                      </div>
                      <v-data-table
                        :headers="headers"
                        :items="tableData"
                        :fixed-header="fixed"
                        :loading="tableLoading"
                        hide-default-footer
                        :items-per-page="100"
                        dense
                        class="elevation-1 dtwidth mt-5"
                      >
                        <template v-slot:[`item.client_id`]="{ item }">
                          <span class="caption">{{ item.client_id }}</span>
                          <v-icon
                            small
                            class="ml-2"
                            color="pink"
                            v-if="item.is_admin == true"
                            >mdi-account</v-icon
                          >
                        </template>
                        <template v-slot:[`item.Action`]="{ item }">
                          <v-icon
                            small
                            class=""
                            color="red"
                            v-if="
                              item.client_id !=
                                $store.getters.GetUserObj.user?.user_email_id &&
                              item.client_id !=
                                dashboarditems.dashboard_created_by
                            "
                            @click="validate_delete(item)"
                            >mdi-delete</v-icon
                          >
                          <span class="caption" v-else> -</span>
                        </template>
                      </v-data-table>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <ApiDashboard
        :apiDocs="apiDocs"
        :dashboarditems="dashboarditems"
        @clicked="apipopups"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DashboardPublish
        :publishMessage="publishMessage"
        @clicked="publishMessage = false"
        :dashboarditems="dashboarditems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <CreateDashboard
        :Create_dash_board="Create_dash_board"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="Create_dash_board = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <DeleteDashboard
        :delete_customdashboard="delete_customdashboard"
        :dashboarditems="dashboarditems"
        v-on:errorMsg="error_info"
        v-on:successMsgdelete="success_info_delete"
        v-on:deleteMSg="delete_info"
        @clicked="delete_customdashboard = false"
      />
    </div>
    <div v-if="componentCheck == 5">
      <AddMembers
        :memberadd="memberadd"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :dashboarditems="dashboarditems"
        @clicked="memberadd = false"
        :tableData="tableData"
      />
    </div>
    <div v-if="componentCheck == 6">
      <DeleteMember
        :memberdelete="memberdelete"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :dashboarditems="dashboarditems"
        :subscriberitem="subscriberitem"
        @clicked="memberdelete = false"
      />
    </div>
    <div v-if="componentCheck == 7">
      <PublishMessage
        :publishContent="publishContent"
        @clicked="publishContent = false"
        :dashboarditems="dashboarditems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import PublishMessage from "@/components/AdminDashboard/DashboardDialogs/PublishMessage.vue";
import DeleteDashboard from "@/components/AdminDashboard/DashboardDialogs/DeleteDashboard.vue";
import CreateDashboard from "@/components/AdminDashboard/DashboardDialogs/CreateDashboard.vue";
import DashboardPublish from "@/components/AdminDashboard/DashboardDialogs/DashboardPublish.vue";
import VueQRCodeComponent from "vue-qrcode-component";
import { Buffer } from "buffer";
import { list_dashboard_channels_v2 } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_dashboard_details } from "@/graphql/queries.js";
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
import ApiDashboard from "@/components/AdminDashboard/DashboardDialogs/ApiDashboard.vue";
import AddMembers from "@/components/AdminDashboard/DashboardDialogs/AddMembers.vue";
import DeleteMember from "@/components/AdminDashboard/DashboardDialogs/DeleteMember.vue";
import { list_dashboard_users } from "@/graphql/queries.js";
export default {
  components: {
    SnackBar,
    VueQRCodeComponent,
    ApiDashboard,
    DashboardPublish,
    CreateDashboard,
    DeleteDashboard,
    AddMembers,
    DeleteMember,
    PublishMessage,
  },
  data() {
    return {
      tableLoading: false,
      memberdelete: false,
      publishContent: false,
      headers: [
        { text: "User Name", value: "client_id", sortable: false },
        {
          text: "Action",
          value: "Action",
          sortable: false,
        },
      ],
      tableData: [],
      memberadd: false,
      fixed: true,
      SnackBarComponent: {},
      types_item: ["OPEN", "RESTRICTED"],
      dashboard_type: "",
      publishMessage: false,
      loadingadd: false,
      apiDocs: false,
      teamData: [],
      heightchat: 0,
      loading: false,
      delete_customdashboard: false,
      searchlist: "",
      imageurl: "",
      dashboarditems: {},
      decription: "",
      Count: 0,
      heightres: 0,
      dashboard_name: "",
      broadcastdescription: "",
      description: "",
      member_qr: "",
      titleheight: 0,
      componentCheck: 0,
      dashboardSummary: "",
      dashboardinforurl: "",
      check_value: false,
      dashboardtitle: "",
      isUserReadOnly: false,
      Create_dash_board: false,
      subscriberitem: {},
    };
  },
  created() {
    this.fetch_dashboard_details();
    this.heightchat = window.innerHeight - 210;
    this.heightres = window.innerHeight - 280;
    this.titleheight = window.innerHeight - 290;
  },
  computed: {
    filteredTeamData() {
      return this.teamData.filter((item) => {
        return item.dashboard_name
          .toLowerCase()
          .includes(this.searchlist.toLowerCase());
      });
    },
  },
  methods: {
    validate_delete(item) {
      this.subscriberitem = item;
      this.componentCheck = 6;
      this.memberdelete = true;
    },
    add_mutation() {
      this.componentCheck = 3;
      this.Create_dash_board = true;
    },
    fetch_value(val) {
      return formatedatetime(val/1000);
      // const d = new Date(parseInt(val));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();
      // var dateValue =
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year;

      // var timeValue = d.toLocaleString([], {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   hour12: true,
      // });
      // const concatDateTime = dateValue + " " + timeValue;
      // return concatDateTime;
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
    apipopups(val) {
      if (val == 0) {
        this.apiDocs = false;
      } else if (val == 1) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "Copied to Clipboard ",
          timeout: 5000,
          Top: true,
        };
      }
    },
    validate_add() {
      this.componentCheck = 5;
      this.memberadd = true;
    },
    success_info_delete(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.delete_customdashboard = false;
      this.fetch_dashboard_details();
    },
    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.memberadd = false;
      this.delete_customdashboard = false;
      this.publishMessage = false;
      this.Create_dash_board = false;
      this.memberdelete = false;
      this.publishContent = false;
      await this.fetch_dashboard_details();

      // Find the object with the desired dashboard_id
      let matchedObject = this.findObjectByDashboardId(
        this.teamData,
        this.dashboarditems.dashboard_id
      );
      await this.forms_data(matchedObject);
      this.check_value = true;
    },
    findObjectByDashboardId(arr, dashboardId) {
      for (let obj of arr) {
        if (obj.dashboard_id === dashboardId) {
          return obj; // Return the matching object
        }
      }
      return null; // Return null if no match found
    },
    delete_info() {
      this.Count = 0;
      this.check_value = false;
    },
    async get_dashboardSubcount() {
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_dashboard_users, {
            input: {
              dashboard_id: this.dashboarditems.dashboard_id,
            },
          })
        );

        var response = JSON.parse(result.data.list_dashboard_users);

        if (response.Status == "Success") {
          this.tableData = [];
          this.tableData = response.Data;
        }
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
    validate_data() {
      if (this.$refs.form.validate()) {
        this.Edit_edash_board();
      }
    },
    publish_detailes() {
      this.componentCheck = 7;
      this.publishContent = true;
      // this.componentCheck = 2;
      // this.publishMessage = true;
    },
    close_edit() {
      this.check_value = false;
    },
    broadcast_api() {
      this.componentCheck = 1;
      this.apiDocs = true;
    },
    delete_item() {
      this.componentCheck = 4;
      this.delete_customdashboard = true;
    },
    async edit_detailes() {
      await this.get_dashboardSubcount();
      this.isUserReadOnly = false;
      if (
        this.dashboarditems.dashboard_created_by !=
        this.$store.getters.GetUserObj.user?.user_email_id
      ) {
        this.isUserReadOnly = true;
      }

      // await this.get_dashboardSubcount();
      this.check_value = true;
      this.dashboard_name = this.dashboarditems.dashboard_name;
      this.broadcastdescription = this.dashboarditems.dashboard_description;
      this.dashboard_type = this.dashboarditems.dashboard_security;
      this.Password = this.dashboarditems.dashboard_password;

      this.member_qr = this.dashboarditems.dashboard_link;
    },
    async Edit_edash_board() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_or_delete_dashboard_topic, {
            input: {
              action_type: "EDIT",
              dashboard_id: this.dashboarditems.dashboard_id,
              organization_id: data.organization.organization_id,
              dashboard_name: this.dashboard_name,
              dashboard_security: this.dashboard_type,
              dashboard_description: this.broadcastdescription,
              dashboard_password:
                this.dashboard_type == "RESTRICTED" ? this.Password : "NONE",
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          await this.fetch_dashboard_details();
          await this.get_dashboardSubcount();
          // this.$emit("successMsg", response.Message);
          // this.$refs.form.reset();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          // this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        // this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    async fetch_dashboard_details() {
      var data = this.$store.getters.GetUserObj;
      this.teamData = [];

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

    async forms_data(item) {
      this.dashboarditems = item;
      this.next_Token = null;
      this.check_value = false;
      await this.get_dashboard();
      await this.get_dashboardSubcount();
    },
    async get_dashboard() {
      this.Count = 1;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_dashboard_details, {
            dashboard_id: this.dashboarditems.dashboard_id,
          })
        );
        var response = JSON.parse(result.data.get_dashboard_details);

        if (response.Status == "SUCCESS") {
          if (response.data[0].message_payload != undefined) {
            let xapikey = response.data[0].message_payload.data;
            if (xapikey == undefined) {
              this.decription = "";
            } else {
              const bufferData = Buffer.from(xapikey);

              const strData = bufferData.toString();

              const api = JSON.parse(strData);

              this.decription = api.description.replace(/^<p>|<\/p>$/g, "");
              this.decription = this.decription
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");

              this.imageurl = api.image_url;
              this.dashboardtitle = api.title;
              this.dashboardSummary = api.summary;
              this.dashboardinforurl = api.information_url;
            }
          } else {
            this.decription = "";
            this.imageurl = "";
            this.dashboardtitle = "";
            this.dashboardSummary = "";
            this.dashboardinforurl = "";
          }
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.data.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.decription = "";
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
.center-content {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center vertically */
  align-items: center; /* Center horizontally */
  text-align: center; /* Center text */
  margin-top: 20px; /* Adjust the top margin as needed */
  margin-bottom: 20px; /* Adjust the bottom margin as needed */
  height: 100%; /* Optional, to make sure the card takes the full height */
}
</style>
<template>
  <div>
    <!-- <div class="loading-container" v-if="responseCheck == null">
      <LoadingNew
        :animation-duration="1200"
        :circles-num="3"
        :circle-size="69"
        color="#DB4C77"
      />
    </div> -->
    <OverlayComp :overlay="overlay" />
    <v-card flat>
      <v-toolbar dense flat>
        <!-- <v-toolbar-title> Broadcast</v-toolbar-title> -->
        <v-spacer />
        <v-btn
          dark
          @click="create_annoucement()"
          class="text-capitalize cardCss mt-7"
          >Create</v-btn
        >
        <!-- <v-btn
          class="mx-2"
          @click="refresh_page()"
          fab
          dark
          x-small
          color="primary"
        >
          <v-icon dark> mdi-refresh </v-icon>
        </v-btn> -->
      </v-toolbar>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card-text>
        <v-row>
          <v-col cols="3">
            <v-card flat>
              <v-card-text>
                <v-card-title class="mt-n9 ml-n3"> My Channels </v-card-title>
                <v-text-field
                  class="mt-n1 ml-2"
                  label="Search"
                  dense
                  v-model="searchlist"
                  append-icon="mdi-magnify"
                ></v-text-field>
                <v-responsive class="overflow-y-auto mt-2">
                  <v-list v-if="teamData.length > 0">
                    <template
                      v-for="(item, index) in filteredTeamData"
                      :key="item.team_name"
                    >
                      <v-divider :inset="item.inset"></v-divider>
                      <v-list-item @click="forms_data(item)">
                        <v-list-item-content
                          class="d-flex align-end justify-end"
                        >
                          <v-list-item-title
                            class="title-wrapper full-width-title ma-1"
                          >
                            <v-icon
                              color="primaryColor"
                              class=""
                              v-if="item.team_action_type == 'BROAD_CAST'"
                              >mdi-bullhorn-outline</v-icon
                            >
                            <v-icon color="primaryColor" class="" v-else
                              >mdi-bell</v-icon
                            >
                            {{ item.team_name }}</v-list-item-title
                          >
                          <v-tooltip bottom>
                            <template #activator="{ on }">
                              <v-list-item-subtitle
                                class="title-wrapper ma-1 ml-8"
                                v-on="on"
                              >
                                {{
                                  item.team_description.length >= 50
                                    ? item.team_description.substr(0, 50) +
                                      "..."
                                    : item.team_description
                                }}</v-list-item-subtitle
                              ></template
                            >
                            <div class="textWrap" style="max-width: 250px">
                              {{ item.team_description }}
                            </div>
                          </v-tooltip>
                          <v-list-item-subtitle class="title-wrapper ma-1 ml-8">
                            {{ item.team_created_by }}
                          </v-list-item-subtitle>
                          <!-- <v-list-item-subtitle class="title-wrapper ma-1"
                            >Message Type:
                            {{
                              item.team_action_type == "GROUP_CAST"
                                ? "Groupcast"
                                : "Broadcast"
                            }}</v-list-item-subtitle
                          > -->
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-list>
                  <div v-else class="ml-5">No Broadcast / Groupcast</div>
                </v-responsive>
              </v-card-text>
            </v-card>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col :cols="check_value == false ? '9' : '6'">
            <v-card v-if="listmessages.length >= 1" flat>
              <v-toolbar class="" @click="edit_detailes">
                <div>
                  <v-icon
                    color="primaryColor"
                    class="mr-2"
                    v-show="dashboarditems.team_action_type == 'BROAD_CAST'"
                    >mdi-bullhorn-outline</v-icon
                  >
                  <v-icon
                    color="primaryColor"
                    class="mr-2"
                    v-show="dashboarditems.team_action_type == 'GROUP_CAST'"
                    >mdi-bell</v-icon
                  >
                  {{ dashboarditems.team_name }}
                  <br />
                  <div class="ml-9">Tap here for Group Info</div>
                </div>
                <v-spacer /><v-icon
                  color="primaryColor"
                  v-if="dashboarditems.team_action_type != 'GROUP_CAST'"
                  @click.stop="publish_detailes()"
                  >mdi-send-variant-outline</v-icon
                ></v-toolbar
              >
              <v-card-text class="custom-background">
                <v-responsive
                  class="overflow-y-auto mt-2"
                  ref="messageContainer"
                >
                  <!-- @scroll.native="handleScroll" -->
                  <v-card
                    class="message-box rounded-xl"
                    v-for="(item, index) in listmessages"
                    :key="index"
                  >
                    <div class="mt-n2 font-weight-bold">
                      <v-icon color="#DB4C77" class="mt-n1 mr-2"
                        >mdi-account</v-icon
                      >{{
                        item.published_by == undefined
                          ? "System"
                          : item.published_by
                      }}
                    </div>
                    <div class="font-weight-medium text-left mt-2 ml-8">
                      {{ item.title }}
                    </div>
                    <div class="text-left mt-2 ml-8">
                      {{ item.broadcast_message }}
                    </div>
                    <!-- <v-card-title class="text-h6 mt-n5">    {{ item.title }}</v-card-title> -->
                    <!-- <v-card-text class="mt-n4">{{
                      item.broadcast_message
                    }}</v-card-text> -->
                    <v-card-actions>
                      <v-spacer />
                      <div class="mt-n2">
                        {{ get_date(item.message_published_on) }}
                      </div>
                    </v-card-actions>
                  </v-card>
                </v-responsive>
              </v-card-text>
            </v-card>

            <v-card v-else flat>
              <div v-if="Count == 1">
                <v-toolbar class="" @click="edit_detailes">
                  <div>
                    <v-icon
                      color="primaryColor"
                      class="mr-2"
                      v-show="dashboarditems.team_action_type == 'BROAD_CAST'"
                      >mdi-bullhorn-outline</v-icon
                    >
                    <v-icon
                      color="primaryColor"
                      class="mr-2"
                      v-show="dashboarditems.team_action_type == 'GROUP_CAST'"
                      >mdi-bell</v-icon
                    >
                    {{ dashboarditems.team_name }}
                    <br />
                    <div class="ml-9">Tap here for Group Info</div>
                  </div>
                  <v-spacer /><v-icon
                    color="primaryColor"
                    v-if="dashboarditems.team_action_type != 'GROUP_CAST'"
                    @click.stop="publish_detailes()"
                    >mdi-send-variant-outline</v-icon
                  ></v-toolbar
                >
              </div>
              <div class="center-content">No Message</div>
            </v-card>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="3" v-if="check_value == true">
            <v-card flat>
              <v-toolbar flat>
                <v-toolbar-title>Group Info </v-toolbar-title>
                <v-spacer />
                <v-icon
                  color="red"
                  @click.stop="broadcast_delete()"
                  class="mr-3"
                  v-show="
                    dashboarditems.team_created_by ==
                    $store.getters.GetUserObj.user?.user_email_id
                  "
                  >mdi-delete</v-icon
                ><v-icon @click="close_edit">mdi-close</v-icon></v-toolbar
              >
              <v-card-text>
                <!-- <v-card-actions class="justify-center">
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
                </v-card-actions> -->
                <v-form ref="form">
                  <v-row class="ml-1">
                    <v-col cols="12">
                      <v-text-field
                        outlined
                        dense
                        style="max-width: 550px"
                        label="Title"
                        :rules="[(v) => !!v || 'Required']"
                        :counter="25"
                        v-model="broadcastName"
                        maxlength="25"
                        class="mt-2"
                      />
                      <v-textarea
                        outlined
                        dense
                        :rules="[(v) => !!v || 'Required']"
                        style="max-width: 550px"
                        :counter="500"
                        label="Description"
                        v-model="broadcastdescription"
                        maxlength="500"
                      />
                      <div>
                        <v-btn
                          depressed
                          :loading="loading"
                          @click="validate_data()"
                          dark
                          block
                          class="cardCss text-capitalize mt-5"
                        >
                          Save
                        </v-btn>
                        <v-btn
                          dark
                          block
                          class="cardCss text-capitalize mt-5"
                          v-if="dashboarditems.team_action_type == 'GROUP_CAST'"
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
                      </div>

                      <div class="font-weight-bold mt-2">
                        No of Subcribers :{{
                          dashboarditems.no_of_employees_in_team
                        }}
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
                        <template v-slot:[`item.full_user_name`]="{ item }">
                          <span class="caption">{{ item.full_user_name }}</span>
                          <v-icon
                            small
                            class="ml-2"
                            color="pink"
                            v-if="item.is_admin == true"
                            >mdi-account</v-icon
                          >
                        </template>
                        <template v-slot:[`item.Action`]="{ item }">
                          <span class="caption" v-if="item.is_admin == true">
                            -</span
                          >
                          <v-icon
                            small
                            class=""
                            color="red"
                            v-else
                            @click="validate_delete(item)"
                            >mdi-delete</v-icon
                          >
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

    <div v-if="componentCheck == 1">
      <MessagePublish
        :publishMessage="publishMessage"
        @clicked="publishMessage = false"
        :dashboarditems="dashboarditems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <BroadcastDelete
        :delete_broadcast="delete_broadcast"
        :dashboarditems="dashboarditems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="delete_broadcast = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <MessageApi
        :apiDocs="apiDocs"
        :dashboarditems="dashboarditems"
        @clicked="apipopups"
      />
    </div>
    <div v-if="componentCheck == 4">
      <CreateBroadcast
        :annoucementDialog="annoucementDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="annoucementDialog = false"
      />
    </div>
    <div v-if="componentCheck == 5">
      <AddMembers
        :memberadd="memberadd"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :dashboarditems="dashboarditems"
        @clicked="memberadd = false"
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
  </div>
</template>
  
  <script>
/* eslint-disable */

import MessagePublish from "@/components/Broadcast/BroadcastPopups/MessagePublish.vue";
import BroadcastDelete from "@/components/Broadcast/BroadcastPopups/BroadcastDelete.vue";
import VueQRCodeComponent from "vue-qrcode-component";
import { list_broadcast_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { list_messages } from "@/graphql/queries.js";
import { get_particular_broadcast_details } from "@/graphql/queries.js";
import SnackBar from "@/components/SnackBar.vue";
import { edit_broadcast_channel } from "@/graphql/mutations.js";
import MessageApi from "./BroadcastPopups/MessageApi.vue";
import CreateBroadcast from "@/components/Broadcast/BroadcastPopups/CreateBroadcast.vue";
import { EventBus } from "@/main";
import LoadingNew from "@/components/LoadingNew.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import AddMembers from "@/components/Broadcast/BroadcastPopups/AddMembers.vue";
import DeleteMember from "@/components/Broadcast/BroadcastPopups/DeleteMember.vue";
export default {
  components: {
    SnackBar,
    VueQRCodeComponent,
    BroadcastDelete,
    MessagePublish,
    MessageApi,
    CreateBroadcast,
    LoadingNew,
    OverlayComp,
    AddMembers,
    DeleteMember,
  },
  data() {
    return {
      tableLoading: false,
      headers: [
        { text: "User Name", value: "full_user_name", sortable: false },
        {
          text: "Action",
          value: "Action",
          sortable: false,
        },
      ],
      tableData: [],
      fixed: true,
      SnackBarComponent: {},
      delete_broadcast: false,
      teamData: [],
      heightchat: 0,
      searchlist: "",
      editcheck: 0,
      imageurl: "",
      dashboarditems: {},
      loadingadd: false,
      broadcastName: "",
      decription: "",
      apiDocs: false,
      componentCheck: 0,
      broadcastdescription: "",
      Count: 0,
      heightres: 0,
      member_qr: "",
      titleheight: 0,
      listmessages: [],
      next_Token: null,
      check_value: false,
      publishMessage: false,
      annoucementDialog: false,
      responseCheck: null,
      overlay: false,
      memberadd: false,
      memberdelete: false,
      subscriberitem: {},
    };
  },
  // mounted() {
  //   // Wait for the next tick to ensure that the DOM is ready
  //   this.$nextTick(() => {
  //     this.handleScroll();
  //   });
  // },
  mounted() {
    this.heightchat = window.innerHeight - 210;
    this.heightres = window.innerHeight - 280;
    this.titleheight = window.innerHeight - 290;
    this.fetch_broadcast();
  },
  computed: {
    filteredTeamData() {
      const filtered = this.teamData.filter((item) =>
        item.team_name.toLowerCase().includes(this.searchlist.toLowerCase())
      );
      // localStorage.setItem("teamList", JSON.stringify(filtered));
      return filtered;
    },
  },
  methods: {
    validate_delete(item) {
      this.subscriberitem = item;
      this.componentCheck = 6;
      this.memberdelete = true;
    },
    validate_add() {
      this.componentCheck = 5;
      this.memberadd = true;
    },
    refresh_page() {
      this.listmessages = [];
      this.teamData = [];
      this.check_value = false;

      this.fetch_broadcast();
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
    create_annoucement() {
      this.componentCheck = 4;
      this.annoucementDialog = true;
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
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.editcheck = 0;
      this.check_value = false;
      this.publishMessage = false;
      this.delete_broadcast = false;
      this.annoucementDialog = false;
      this.memberadd = false;
      this.memberdelete = false;
      this.fetch_broadcast();
    },
    broadcast_api() {
      this.componentCheck = 3;
      this.apiDocs = true;
    },
    publish_detailes() {
      this.componentCheck = 1;
      this.publishMessage = true;
    },
    broadcast_delete() {
      this.componentCheck = 2;

      this.delete_broadcast = true;
    },
    async edit_detailes() {
      await this.get_broadcastlist();
      this.check_value = true;
      this.broadcastName = this.dashboarditems.team_name;
      this.broadcastdescription = this.dashboarditems.team_description;
    },
    close_edit() {
      this.check_value = false;
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_broadcast_message();
      }
    },
    async edit_broadcast_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_broadcast_channel, {
            input: {
              team_id: this.dashboarditems.team_id,
              user_email_id: data.user.user_email_id,
              team_name: this.broadcastName,
              team_description: this.broadcastdescription,
              // team_owner_id:data.user.user_id
            },
          })
        );
        var response = JSON.parse(result.data.edit_broadcast_channel);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.editcheck = 1;
          this.fetch_broadcast();
          this.get_broadcastlist();
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
    handleScroll() {
      const container = this.$refs.messageContainer;

      if (container && container.clientHeight && container.scrollHeight) {
        // Check if the user has scrolled to the bottom
        if (
          container.scrollHeight - container.scrollTop ===
          container.clientHeight
        ) {
          // User has reached the bottom
          const lastItemIndex = this.listmessages.length - 1;
          if (lastItemIndex >= 0) {
            const lastItem = this.listmessages[lastItemIndex];
          }
        }
      }
    },
    get_date(date) {
      let a = new Date(date).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    async get_broadcastlist() {
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
              team_id: this.dashboarditems.team_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_broadcast_details);

        if (response.Status == "SUCCESS") {
          this.tableData = response.data[0].team_users_list;
          this.dashboarditems = response.data[0];
          // console.log(this.dashboarditems, " this.dashboarditems");

          this.member_qr = response.data[0].qr_link;
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
    async fetch_broadcast() {
      //   var data = this.$store.getters.GetUserObj;
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_broadcast_channels, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
            },
          })
        );

        this.tableLoading = false;
        this.teamData = [];

        var response = result.data.list_broadcast_channels;
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.responseCheck = true;
          this.teamData = response.data;

          this.overlay = false;
          // console.log(this.teamData);

          if (this.editcheck == 0) {
            this.dashboarditems = this.teamData[0];

            this.list_all_messages();
          }
        } else {
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "red",
          //   SnackbarText: response.Message,
          //   timeout: 5000,
          //   Top: true,
          // };
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

    async forms_data(item) {
      this.dashboarditems = item;

      this.next_Token = null;
      this.check_value = false;
      await this.list_all_messages();
      await this.get_broadcastlist();
    },

    async list_all_messages() {
      this.Count = 1;

      try {
        let result = await API.graphql(
          graphqlOperation(list_messages, {
            input: {
              message_topic_id: this.dashboarditems.team_topic_id,
              limit: 100,
              nextToken: this.next_Token,
            },
          })
        );
        this.tableLoading = false;
        this.listmessages = [];
        var array = [];

        var response = JSON.parse(result.data.list_messages);
        this.next_Token = response.nextToken;

        response.items.forEach((element) => {
          array.push({
            published_by: element.published_by,
            title: element.broadcast_message.title,
            broadcast_message: element.broadcast_message.description,
            message_published_on: element.message_published_on,
            message_id: element.message_id,
          });
        });
        let newarray = this.listmessages.concat(array);

        this.listmessages = newarray;
        const uniqueArrayOfObjects = this.listmessages.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.message_id === obj.message_id)
        );
        this.listmessages = uniqueArrayOfObjects;

        // this.listmessages = array;
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
.message-box {
  background-color: #f0f0f0; /* Set your desired background color */
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 2%;
  margin: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}
</style>
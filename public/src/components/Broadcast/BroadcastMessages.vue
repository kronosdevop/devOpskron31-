<template>
  <div>
    <div v-if="broadcast_view == false">
      <v-toolbar flat>
        <!-- <v-toolbar-title>Messages</v-toolbar-title> -->
        <v-spacer />
        <v-btn
          dark
          @click="create_annoucement()"
          class="text-capitalize cardCss"
          >Create</v-btn
        >
        <!-- <v-btn dark class="text-capitalize cardCss ml-2" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn> -->
      </v-toolbar>
      <v-card class="" flat>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <v-card-text>
          <v-data-table
            :headers="headers"
            :height="height"
            :fixed-header="fixed"
            :items="tableData"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="20"
            dense
            class="elevation-1 dtwidth"
            @click:row="handleClick"
          >
            <template v-slot:[`item.team_name`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <div
                    v-show="item.team_action_type == 'GROUP_CAST'"
                    class="font-weight-bold"
                  >
                    <v-icon color="primaryColor" class="mt-2">mdi-bell</v-icon>
                    {{ "  " + item.team_name }}
                    <div class="ml-7 mt-n2 caption" v-on="on">
                      {{
                        item.team_description.length >= 40
                          ? item.team_description.substr(0, 40) + "..."
                          : item.team_description
                      }}
                    </div>
                  </div>
                  <div
                    v-show="item.team_action_type == 'BROAD_CAST'"
                    class="font-weight-bold"
                  >
                    <v-icon color="primaryColor" class="mt-2"
                      >mdi-bullhorn-outline</v-icon
                    >
                    {{ "  " + item.team_name }}
                    <div class="ml-7 mt-n2 caption" v-on="on">
                      {{
                        item.team_description.length >= 40
                          ? item.team_description.substr(0, 40) + "..."
                          : item.team_description
                      }}
                    </div>
                  </div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.team_description }}
                </div>
              </v-tooltip>
            </template>

            <template v-slot:[`item.team_action_type`]="{ item }">
              <div color="primaryColor" style="color: #10559a">
                {{
                  item.team_action_type == "GROUP_CAST"
                    ? "Groupcast"
                    : "Broadcast"
                }}
              </div>
            </template>

            <template v-slot:[`item.team_created_on`]="{ item }">
              <span class="caption">{{
                fetch_value(item.team_created_on)
              }}</span>
            </template>
            <template v-slot:[`item.action`]="{ item }">
              <v-icon
                small
                color="red"
                class="ml-1"
                @click.stop="broadcastdelete(item)"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
    <div v-else>
      <v-toolbar flat>
        <!-- <v-toolbar-title>Select AI</v-toolbar-title> -->

        <v-row class="ml-4">
          <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
            <v-btn
              small
              class="black--text"
              text
              value="broadcast_publishmessage"
            >
              Broadcasts
            </v-btn>
            <v-btn small class="black--text" text value="edit_broadcast">
              Edit Details
            </v-btn>
            <v-btn
              small
              class="black--text"
              text
              value="publish_broadcast"
              v-if="broadcast_info.team_action_type == 'BROAD_CAST'"
            >
              Publish
            </v-btn>
            <v-btn
              small
              class="black--text"
              text
              value="api_broadcast"
              v-if="broadcast_info.team_action_type == 'GROUP_CAST'"
            >
              API
            </v-btn>
            <v-btn small class="black--text" text value="subscriber_list">
              Subscribers
            </v-btn>
          </v-btn-toggle>
        </v-row>
        <v-spacer />
        <v-btn depressed @click="back_mutation()" dark class="cardCss"
          ><v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'api_broadcast'">
        <BroadcastApi :broadcast_info="broadcast_info" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'edit_broadcast'">
        <EditBroadcast :broadcast_info="broadcast_info" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'publish_broadcast'">
        <BroadcastPublish :broadcast_info="broadcast_info" />
        <!-- v-on:errorMsg="error_info" -->
        <!-- v-on:successMsg="success_info" -->
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'subscriber_list'">
        <SubcribersList :broadcast_info="broadcast_info" />
      </div>
      <div
        class="text-left"
        v-if="toggle_exclusive == 'broadcast_publishmessage'"
      >
        <PublishedMessages :broadcast_info="broadcast_info" />
      </div>
    </div>
    <div v-if="componentCheck == 1">
      <CreateBroadcast
        :annoucementDialog="annoucementDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="annoucementDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <BroadcastDelete
        :delete_broadcast="delete_broadcast"
        :broadcast_info="broadcast_info"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="delete_broadcast = false"
      />
    </div>

    <!-- <div v-if="componentCheck == 5">
      <QRView
        :brodcastListview="brodcastListview"
        :broadcast_info="broadcast_info"
        @clicked="brodcastListview = false"
      />
    </div> -->
  </div>
</template>
<script>
/*eslint-disable*/
import PublishedMessages from "./PublishedMessages.vue";
import BroadcastApi from "@/components/Broadcast/BroadcastApi.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreateBroadcast from "@/components/Broadcast/BroadcastPopups/CreateBroadcast.vue";
import { list_broadcast_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import BroadcastDelete from "@/components/Broadcast/BroadcastPopups/BroadcastDelete.vue";
import EditBroadcast from "@/components/Broadcast/BroadcastPopups/EditBroadcast.vue";
import QRView from "@/components/Broadcast/BroadcastPopups/QRView.vue";
import BroadcastPublish from "./BroadcastPublish.vue";
import SubcribersList from "./SubcribersList.vue";
// import { delete_broadcast_channel } from "@/graphql/mutations";
export default {
  components: {
    SnackBar,
    BroadcastApi,
    BroadcastPublish,
    CreateBroadcast,
    BroadcastDelete,
    PublishedMessages,
    EditBroadcast,
    QRView,
    SubcribersList,
  },
  data() {
    return {
      SnackBarComponent: {},
      toggle_exclusive: "broadcast_publishmessage",
      broadcast_view: false,
      broadcast_info: {},
      publishDialog: false,
      // brodcastListview: false,
      delete_broadcast: false,
      edit_broadcast: false,
      headers: [
        { text: "Name", value: "team_name", sortable: false },
        {
          text: "Message Type",
          value: "team_action_type",
          sortable: false,
        },
        { text: "Created  By", value: "team_created_by", sortable: false },

        { text: "Created On", value: "team_created_on", sortable: false },
        { text: "Actions", value: "action", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      annoucementDialog: false,
      componentCheck: 0,
      fixed: true,
    };
  },
  created() {
    this.$store.commit("SetMessageitems", {});
    this.fetch_broadcast();
    this.height = window.innerHeight - 310;
  },
  methods: {
    view_list(item) {
      this.broadcast_info = item;
      this.broadcast_view = true;
    },
    back_mutation() {
      this.toggle_exclusive = "broadcast_publishmessage";
      this.broadcast_view = false;
    },
    async fetch_broadcast() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_broadcast_channels, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
            },
          })
        );

        this.tableLoading = false;
        this.tableData = [];
        var dataArray = [];
        var response = result.data.list_broadcast_channels;
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
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
    // view_subcribers_list(label, item) {
    //   this.componentCheck = 5;
    //   this.broadcast_info = { label, item };
    //   this.brodcastListview = true;
    // },
    // view_qr(label, item) {
    //   this.componentCheck = 5;
    //   this.broadcast_info = { label, item };
    //   this.brodcastListview = true;
    // },
    publish_broadcast(item) {
      this.componentCheck = 4;
      this.broadcast_info = item;
      this.publishDialog = true;
    },
    broadcast_edit(item) {
      this.componentCheck = 3;
      this.broadcast_info = item;
      this.edit_broadcast = true;
    },
    broadcastdelete(item) {
      this.componentCheck = 2;
      this.broadcast_info = item;
      this.delete_broadcast = true;
    },
    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
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
      this.annoucementDialog = false;
      this.delete_broadcast = false;
      this.edit_broadcast = false;
      this.publishDialog = false;
      this.fetch_broadcast();
    },

    create_annoucement() {
      this.componentCheck = 1;
      this.annoucementDialog = true;
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    handleClick(item) {
      this.broadcast_info = item;
      this.$store.commit("SetMessageitems", this.broadcast_info);
      this.$router.push("BroadcastTypes");
      // BroadcastTypes
      // this.broadcast_view = true;
    },
  },
};
</script>

<style scoped>
</style>
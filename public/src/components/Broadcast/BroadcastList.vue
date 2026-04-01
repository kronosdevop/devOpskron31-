<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="ma-2" flat>
      <v-toolbar class="mb-1" dense flat
        ><v-spacer />
        <v-btn
          dark
          class="text-capitalize cardCss mr-2"
          @click="publish_Channel()"
          v-show="bordcasttableData.length != 0"
        >
          Publish
        </v-btn>
        <v-btn dark class="text-capitalize cardCss" @click="newChannel()">
          Create
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :search="search"
          :headers="bordcastheaders"
          :fixed-header="fixed"
          :items="bordcasttableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          class="elevation-1 dtwidth"
          dense
        >
          <template v-slot:[`item.team_name`]="{ item }">
            <v-icon
              color="primaryColor"
              class=""
              v-if="item.team_action_type == 'BROAD_CAST'"
              >mdi-bullhorn-outline</v-icon
            >
            <v-icon color="primaryColor" class="" v-else>mdi-bell</v-icon>
            {{ item.team_name }}
          </template>
          <template v-slot:[`item.team_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-on="on">
                  {{
                    item.team_description >= 10
                      ? item.team_description.substr(0, 10) + "..."
                      : item.team_description
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.team_description }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-menu offset-y>
              <template #activator="{ on }">
                <v-btn icon v-on="on" v-show="item.is_default != 'TRUE'">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  style="font-size: 12px"
                  @click.stop="open_edit(item)"
                >
                  Edit Channel</v-list-item
                >
                <v-divider />
                <v-list-item
                  style="font-size: 12px"
                  @click.stop="open_delete(item)"
                  v-show="item.is_default != 'TRUE'"
                  v-if="
                    item.team_created_by ==
                    $store.getters.GetUserObj.user.user_email_id
                  "
                >
                  Delete Channel</v-list-item
                >
                <v-divider />
                <v-list-item
                  style="font-size: 12px"
                  @click.stop="dailog_addmebers(item)"
                >
                  Add/Edit Members</v-list-item
                >
              </v-list>
            </v-menu>
            <v-btn v-show="item.is_default == 'TRUE'" small text color="green"
              >Default Channel
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateBroadcast
        :annoucementDialog="annoucementDialog"
        @clicked="annoucementDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditBroadcast
        :editionbroadcast="editionbroadcast"
        @clicked="editionbroadcast = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :broadcast_info="broadcast_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeletionBroadcast
        :deleteBroadcast="deleteBroadcast"
        @clicked="deleteBroadcast = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :broadcast_info="broadcast_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <SubcribersList
        :addBroadcastmember="addBroadcastmember"
        @clicked="addBroadcastmember = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :broadcast_info="broadcast_info"
      />
    </div>
    <div v-if="componentCheck == 5">
      <PublishChannel
        :publishDailog="publishDailog"
        @clicked="publishpopup"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
import SubcribersList from "@/components/Broadcast/SubcribersList.vue";
import PublishChannel from "@/components/Broadcast/BroadcastPopups/PublishChannel.vue";
import DeletionBroadcast from "@/components/Broadcast/BroadcastPopups/DeletionBroadcast.vue";
import EditBroadcast from "@/components/Broadcast/BroadcastPopups/EditBroadcast.vue";
import CreateBroadcast from "@/components/Broadcast/BroadcastPopups/CreateBroadcast.vue";
import { list_broadcast_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    CreateBroadcast,
    EditBroadcast,
    DeletionBroadcast,
    SubcribersList,
    PublishChannel,
  },
  data() {
    return {
      componentCheck: 0,
      annoucementDialog: false,
      editionbroadcast: false,
      deleteBroadcast: false,
      addBroadcastmember: false,
      search: "",
      fixed: true,
      publishDailog: false,
      broadcast_info: {},
      bordcasttableData: [],
      tableLoading: false,
      bordcastheaders: [
        { text: "Name", value: "team_name", sortable: false },
        { text: "Description", value: "team_description", sortable: false },
        {
          text: "No of Members",
          value: "no_of_employees_in_team",
          sortable: false,
        },
        { text: "Actions", value: "actions", sortable: false },
      ],
      SnackBarComponent: {},
    };
  },
  async mounted() {
    await this.fetch_broadcast();
  },
  methods: {
    publishpopup(val) {
      if (val == 0) {
        this.publishDailog = false;
      } else if (val == 1) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "copied to Clipboard",
          timeout: 5000,
          Top: true,
        };
      }
    },
    newChannel() {
      this.componentCheck = 1;
      this.annoucementDialog = true;
    },
    open_edit(item) {
      this.componentCheck = 2;
      this.broadcast_info = item;
      this.editionbroadcast = true;
    },
    // open_delete(item) {
    //   this.componentCheck = 3;
    //   this.broadcast_info = item;
    //   this.deleteBroadcast = true;
    // },
    open_delete(item) {
      this.componentCheck = 3;
      this.broadcast_info = item;
      this.deleteBroadcast = true;
    },
    dailog_addmebers(item) {
      this.componentCheck = 4;
      this.broadcast_info = item;
      this.addBroadcastmember = true;
    },
    publish_Channel() {
      this.componentCheck = 5;
      this.publishDailog = true;
    },
    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.annoucementDialog = false;
      this.editionbroadcast = false;
      this.deleteBroadcast = false;
      this.addBroadcastmember = false;
      this.publishDailog = false;
      await this.fetch_broadcast();
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
    async fetch_broadcast() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_broadcast_channels, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user.user_email_id,
            },
          })
        );

        this.tableLoading = false;
        this.bordcasttableData = [];

        var response = result.data.list_broadcast_channels;

        if (response.Status == "SUCCESS") {
          this.bordcasttableData = response.data;
          this.bordcasttableData.sort((a, b) => {
            if (a.is_default === "TRUE") return -1; // 'a' comes first if it's default
            if (b.is_default === "TRUE") return 1; // 'b' comes first if it's default
            return 0; // Maintain order if both are not default
          });
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
  },
};
</script>

<style>
</style>
<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- :class="{ 'animated-card': isVisible }" -->
    <v-card  flat>
      <v-toolbar flat >
        <v-text-field
          class=""
          label="Search"
          dense
          outlined
          style="max-width: 200px"
          v-model="searchlist"
          append-icon="mdi-magnify"
        ></v-text-field>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="bordcastheaders"
          :items="bordcasttableData"
          :search="searchlist"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          class="elevation-1 dtwidth"
          dense
          @click:row="handle_row_click"
        >
          <!-- <template v-slot:[`item.team_name`]="{ item }">
          <v-icon
            color="primaryColor"
            class=""
            v-if="item.team_action_type == 'BROAD_CAST'"
            >mdi-bullhorn-outline</v-icon
          >
          <v-icon color="primaryColor" class="" v-else>mdi-bell</v-icon>
          {{ item.team_name }}
        </template> -->
          <template v-slot:[`item.team_description`]="{ item }">
            <span>{{ item.team_description }}</span>
          </template>
          <template v-slot:[`item.team_name`]="{ item }">
            <span v-show="item.is_default == 'FALSE'">
              <v-tooltip
                v-if="
                  item.team_visibility != null &&
                  item.team_visibility === 'OPEN'
                "
                bottom
              >
                <template #activator="{ on }">
                  <v-icon
                    small
                    :color="getIconColor(item.team_visibility)"
                    v-on="on"
                  >
                    {{
                      item.team_visibility === "OPEN"
                        ? "mdi-lock-open"
                        : "mdi-lock-off"
                    }}
                  </v-icon>
                </template>
                <span>Open</span>
              </v-tooltip>
              <v-tooltip v-else bottom>
                <template #activator="{ on }">
                  <v-icon
                    dense
                    small
                    :color="getIconColor(item.team_visibility)"
                    v-on="on"
                  >
                    {{
                      item.team_visibility === "OPEN"
                        ? "mdi-lock-open"
                        : "mdi-lock-off"
                    }}
                  </v-icon>
                </template>
                <span>Restricted</span>
              </v-tooltip>
              {{ item.team_name }}
              <!-- <v-icon
              dense
              color="primaryColor"
              small
              v-if="
                item.directory_created_by ==
                $store.getters.GetUserObj.user.user_email_id
              "
              >mdi-account</v-icon
            > -->
            </span>
            <span v-show="item.is_default == 'TRUE'">
              {{ item.team_name }}
            </span>
          </template>
          <template v-slot:[`item.team_created_on`]="{ item }">
            <span>{{ get_date(item.team_created_on) }}</span>
          </template>
          <template v-slot:[`item.team_created_by`]="{ item }">
            <span v-text="fethc_names(item.team_created_by)"></span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              small
              class=""
              v-if="
                item.is_default != 'TRUE' &&
                item.team_created_by ==
                  $store.getters.GetUserObj.user.user_email_id
              "
              @click.stop="channel_delete(item)"
              color="red"
              >mdi-delete</v-icon
            >
            <div
              v-if="
                item.is_default != 'TRUE' &&
                item.team_created_by !=
                  $store.getters.GetUserObj.user.user_email_id
              "
            >
              -
            </div>
            <v-icon
              small
              class="ml-1"
              v-if="
                item.is_default != 'TRUE' &&
                item.team_created_by ==
                  $store.getters.GetUserObj.user.user_email_id
              "
              @click.stop="transfer_ownership(item)"
              color="primaryColor"
              >mdi-swap-horizontal-bold</v-icon
            >
            <v-btn
              class="ml-n3"
              v-show="item.is_default == 'TRUE'"
              small
              text
              color="green"
              >Default Channel
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteChannel
        :rowInfo="rowInfo"
        :deleteChannelDialog="deleteChannelDialog"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
        @clicked="deleteChannelDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <TransferOwnership
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
        :allusers="allusers"
        :tranferOwnerDialog="tranferOwnerDialog"
        @clicked="tranferOwnerDialog = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import { list_broadcast_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import DeleteChannel from "@/components/Channels/AllDialogs/DeleteChannel.vue";
import TransferOwnership from "@/components/Channels/AllDialogs/TransferOwnership.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";

import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    DeleteChannel,
    TransferOwnership,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      componentCheck: 0,
      search: "",
      fixed: true,
      searchlist: "",
      tableLoading: false,
      bordcastheaders: [
        { text: "Name", value: "team_name", sortable: false },
        { text: "Description", value: "team_description", sortable: false },
        {
          text: "No of Members",
          value: "no_of_employees_in_team",
          sortable: false,
        },
        {
          text: "Created By",
          value: "team_created_by",
          sortable: false,
        },
        {
          text: "Created On",
          value: "team_created_on",
          sortable: false,
        },

        { text: "Actions", value: "actions", sortable: false },
      ],
      SnackBarComponent: {},
      bordcasttableData: [],
      deleteChannelDialog: false,
      tranferOwnerDialog: false,
      rowInfo: {},
      allusers: [],
      isVisible: false,
    };
  },
  async mounted() {
    this.isVisible = true;
    await this.fetch_broadcast();
    await this.get_all_org_users();
    this.allusers = this.orgUsers;
  },
  methods: {
    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deleteChannelDialog = false;
      this.tranferOwnerDialog = false;
      await this.fetch_broadcast();
    },

    getIconColor(visibilityType) {
      return visibilityType === "OPEN" ? "green" : "red";
    },

    get_date(val) {
      return format_Date(val);
    },

    fethc_names(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },

    transfer_ownership(item) {
      this.tranferOwnerDialog = true;
      this.componentCheck = 2;
      this.rowInfo = item;
    },

    channel_delete(item) {
      this.componentCheck = 1;
      this.deleteChannelDialog = true;
      this.rowInfo = item;
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
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.bordcasttableData = response.data;
          // console.log(this.bordcasttableData);
          this.bordcasttableData.sort((a, b) => {
            if (a.is_default === "TRUE") return -1;
            if (b.is_default === "TRUE") return 1;
            return 0;
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

    handle_row_click(value) {
      this.$router.push("/ChannelsDetailsPage");
      localStorage.setItem("channelInfo", JSON.stringify(value));
    },
  },
};
</script>

<style>
</style>
<template>
  <div>
    <v-card flat>
      <!-- <v-toolbar dense flat>
        <v-spacer />
        <v-btn dark @click="add_tvchannel()" class="text-capitalize cardCss">
          Create
        </v-btn>
        <v-btn dark class="text-capitalize ml-2 cardCss" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar> -->
      <v-card-text>
        <v-data-table
          :headers="tvHeaders"
          :fixed-header="fixed"
          :items="tvData"
          :loading="channelLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          :options.sync="pagination"
          @update:options="handle_pagination()"
          @click:row="handle_row_click"
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.transition_frequency`]="{ item }">
            <span>{{ fetch_sec(item.transition_frequency) }}</span>
          </template>
          <template v-slot:[`item.Actions`]="{ item }">
            <div
              v-if="
                (item.tv_board_type == 'custom_tv_board' ||
                  item.tv_board_type == undefined) &&
                item.tv_board_created_by ==
                  $store.getters.GetUserObj.user.user_email_id
              "
            >
              <v-icon small color="primaryColor" @click.stop="editboard(item)"
                >mdi-pencil</v-icon
              >
              <v-icon small color="red" @click.stop="deleteboard(item)"
                >mdi-delete</v-icon
              >
            </div>
            <div v-else>-</div>
          </template>
          <template v-slot:[`item.tv_board_publish_type`]="{ item }">
            <span>{{
              item.tv_board_publish_type == "FEED"
                ? "Feed"
                : item.tv_board_publish_type == "TV_SIGNAGE"
                ? "Tv Signage"
                : "Presentation"
            }}</span>
          </template>

          <template v-slot:[`item.tv_board_created_on`]="{ item }">
            <span v-text="get_date(item.tv_board_created_on)"></span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreatetvBoard
        :tvboardCreation="tvboardCreation"
        @clicked="tvboardCreation = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EdittvBoard
        :tvboardedition="tvboardedition"
        @clicked="tvboardedition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :detailstvboard="detailstvboard"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeletetvBoard
        :tvboardDeletion="tvboardDeletion"
        @clicked="tvboardDeletion = false"
        :detailstvboard="detailstvboard"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import DeletetvBoard from "@/components/TvApp/Popups/DeletetvBoard.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { list_all_tv_boards } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EdittvBoard from "@/components/TvApp/Popups/EdittvBoard.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreatetvBoard from "@/components/TvApp/Popups/CreatetvBoard.vue";
export default {
  components: {
    CreatetvBoard,
    SnackBar,
    EdittvBoard,
    DeletetvBoard,
  },
  data() {
    return {
      tvHeaders: [
        { text: "Name", value: "tv_board_name", sortable: false },
        {
          text: "Description",
          value: "tv_board_description",
          sortable: false,
        },
        {
          text: "Frequency",
          value: "transition_frequency",
          sortable: false,
        },
        {
          text: "Type",
          value: "tv_board_publish_type",
          sortable: false,
        },

        {
          text: "Created By",
          value: "tv_board_created_by",
          sortable: false,
        },
        {
          text: "Created On",
          value: "tv_board_created_on",
          sortable: false,
        },

        { text: "Action", value: "Actions", sortable: false },
      ],
      fixed: true,
      tvData: [],
      channelLoading: false,
      componentCheck: 0,
      tvboardCreation: false,
      tvboardDeletion: false,
      tvboardedition: false,
      SnackBarComponent: {},
      nextToken: null,
      detailstvboard: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
    };
  },
  mounted() {
    localStorage.setItem("dashboardType", "");
    this.$store.commit("Settvboardback", false);
    this.fetch_tvboard_details();
  },
  methods: {
    fetch_sec(val) {
      var data = "";
      switch (val) {
        case 10000:
          data = "10 Seconds";
          break;
        case 15000:
          data = "15 Seconds";
          break;
        case 30000:
          data = "30 Seconds";
          break;
        case 45000:
          data = "45 Seconds";
          break;
        case 60000:
          data = "60 Seconds";
          break;
      }

      return data;
    },
    back_call() {
      this.$router.push("/AdminLevelApps");
    },
    deleteboard(item) {
      this.detailstvboard = item;
      this.componentCheck = 3;
      this.tvboardDeletion = true;
    },

    handle_row_click(val) {
      if (val.tv_board_publish_type == "FEED") {
        localStorage.setItem("dashboardType", "TVBoard");
      }
      this.$store.commit("SetTvdetails", val);
      this.$router.push("TvboardSub");
    },

    handle_pagination() {
      if (this.nextToken) {
        this.fetch_tvboard_details();
      }
    },

    get_date(val) {
      return format_Date(val);
    },

    add_tvchannel() {
      this.componentCheck = 1;
      this.tvboardCreation = true;
    },

    editboard(item) {
      this.detailstvboard = item;
      this.componentCheck = 2;
      this.tvboardedition = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tvData = [];
      this.tvboardCreation = false;
      this.tvboardedition = false;
      this.tvboardDeletion = false;
      this.fetch_tvboard_details();
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

    async fetch_tvboard_details() {
      this.channelLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_tv_boards, {
            input: {
              limit: 100,
              nextToken: this.nextToken,
            },
          })
        );
        this.channelLoading = false;

        var response = JSON.parse(result.data.list_all_tv_boards);
        if (response.Status == "SUCCESS") {
          this.nextToken = response.nextToken;
          let array = this.tvData.concat(response.data);

          this.tvData = array;
          const uniqueArrayOfObjects = this.tvData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.tv_board_id === obj.tv_board_id)
          );

          this.tvData = uniqueArrayOfObjects;
          this.tvData = this.tvData.filter(
            (item) => item.tv_board_type === "custom_tv_board"
          );
        } else {
          this.channelLoading = false;
        }
      } catch (error) {
        this.tvData = [];
        this.channelLoading = false;

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
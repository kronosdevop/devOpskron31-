<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="historyDialog"
      @update:model-value="$emit('update:historyDialog', $event)"
      persistent
      max-width="850"
      transition="dialog-top-transition"
    >
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">My Bookings History</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="tableData"
            :loading="tableLoading"
            :height="height"
            :fixed-header="fixed"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="10"
            density="compact"
            class="elevation-1 mt-2 dtwidth"
          >
            <template v-slot:[`item.booking_category_name`]="{ item }">
              <span>{{
                item.booking_category_name == undefined
                  ? "-"
                  : item.booking_category_name
              }}</span>
            </template>

            <template v-slot:[`item.booked_slot`]="{ item }">
              <span v-if="item.type_duration == 'DAILY'"> Full Day</span>
              <span v-else>{{
                convert_time(item.booked_slot.start_epoch) +
                "-" +
                convert_time(item.booked_slot.end_epoch)
              }}</span>
            </template>
            <template v-slot:[`item.booked_date_on`]="{ item }">
              <span>{{ get_date(item.booked_date_on) }}</span>
            </template>
            <template v-slot:[`item.booking_comments`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <div v-if="item.booking_comments" class="caption" v-on="on">
                    {{
                      item.booking_comments.length >= 15
                        ? item.booking_comments.substr(0, 15) + "..."
                        : item.booking_comments
                    }}
                  </div>
                  <div v-else>-</div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.booking_comments }}
                </div>
              </v-tooltip>
            </template>
            <template v-slot:[`item.booking_category_name`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <div
                    v-if="item.booking_category_name"
                    class="caption"
                    v-on="on"
                  >
                    {{
                      item.booking_category_name.length >= 15
                        ? item.booking_category_name.substr(0, 15) + "..."
                        : item.booking_category_name
                    }}
                  </div>
                  <div v-else>-</div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.booking_category_name }}
                </div>
              </v-tooltip>
            </template>
            <!-- <template v-slot:[`item.booked_on`]="{ item }">
              <span>{{ get_date(item.booked_on) }}</span>
            </template> -->
            <template v-slot:[`item.booking_status`]="{ item }">
              <span v-if="item.booking_status == 'BOOKED'">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon
                      @click="cancel_booking(item)"
                      color="green"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    >
                      mdi-checkbox-marked-circle
                    </v-icon>
                  </template>
                  <span>Cancel Booking</span>
                </v-tooltip>
              </span>
              <span v-if="item.booking_status == 'CANCELLED'">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon color="red" dark v-bind="attrs" v-on="on">
                      mdi-close-circle
                    </v-icon>
                  </template>
                  <span>Cancelled</span>
                </v-tooltip>
              </span>
            </template>
            <!-- <template v-slot:[`item.actions`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-icon
                    @click="cancel_booking(item)"
                    color="red"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-close-circle
                  </v-icon>
                </template>
                <span>Cancel Booking</span>
              </v-tooltip>
            </template> -->
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <CancelBooking
        :cancelDialog="cancelDialog"
        :rowInfo="rowInfo"
        v-on:SuccessMsg="success_msg"
        v-on:errorMsg="error_msg"
        @clicked="cancelDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { my_slot_booking } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CancelBooking from "@/components/SloatBooking/Popups/CancelBooking.vue";
import SnackBar from "@/components/SnackBar.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

export default {
  props: {
    historyDialog: Boolean,
  },
  components: {
    CancelBooking,
    SnackBar,
  },
  data() {
    return {
      tableData: [],
      tableLoading: false,
      headers: [
        { title: "Name", value: "resource_name", sortable: false },
        { title: "Booked Slot", value: "booked_slot", sortable: false },
        { title: "Booked On", value: "booked_date_on", sortable: false },
        { title: "Comments", value: "booking_comments", sortable: false },
        {
          title: "Category",
          value: "booking_category_name",
          sortable: false,
        },

        { title: "Status", value: "booking_status", sortable: false },

        // { text: "Actions", value: "actions", sortable: false },
      ],
      fixed: true,
      height: 0,
      cancelDialog: false,
      componentCheck: 0,
      rowInfo: {},
      SnackBarComponent: {},
    };
  },

  watch: {
    historyDialog: {
      async handler() {
        if (this.historyDialog == true) {
          this.height = window.innerHeight - 250;
          this.tableLoading = false;
          await this.fetch_booking_history();
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.cancelDialog = false;
      this.fetch_booking_history();
    },

    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    cancel_booking(item) {
      this.cancelDialog = true;
      this.componentCheck = 1;
      this.rowInfo = item;
    },

    async fetch_booking_history() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(my_slot_booking, {
            input: {
              user_id: data.user.user_id,
              limit: 100,
              nextToken: null,
            },
          })
        );

        var response = JSON.parse(result.data.my_slot_booking);

        this.tableData = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
          // console.log(this.tableData);
          // this.tableData = response.data;
        } else {
        }
      } catch (error) {
        this.tableData = [];
      }
    },

    get_date(val) {
      var data = formatdisplayDate(val);
      return data;
    },

    convert_time(value) {
      const epochTime = value; // Replace this number with your epoch time
      const date = new Date(epochTime * 1000); // Convert seconds to milliseconds

      const options = {
        hour12: true, // Set to true for 12-hour format
        hour: "numeric",
        minute: "numeric",
      };

      const formattedTime = date.toLocaleString("en-US", options);
      return formattedTime;
    },
  },
};
</script>
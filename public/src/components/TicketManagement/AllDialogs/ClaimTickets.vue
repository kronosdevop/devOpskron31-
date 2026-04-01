<template>
  <div>
    <!-- eslint-disable -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="claimDialog" @update:model-value="$emit('update:claimDialog', $event)" persistent fullscreen transition="dialog-top-transition">
      <v-card class="overflow-hidden">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Assign Tickets</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text>
          <v-row no-gutters>
            <v-col cols="4">
              <!-- <v-card :height="height2" flat> -->
              <v-card-text>
                <v-toolbar flat dense>
                  <v-toolbar-title>{{
                    "Ticket-Id" + " :" + rowInfo.ticket_no_id
                  }}</v-toolbar-title>
                </v-toolbar>
                <!-- <v-row justify="start"> -->
                <v-expansion-panels v-model="panel" multiple>
                  <v-expansion-panel @click="panel = []">
                    <v-expansion-panel-header
                      >Ticket Details</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                      <!-- <v-card> -->

                      <v-row no-gutters class="justify-start">
                        <v-col cols="12">
                          <v-row class="justify-start">
                            <v-col cols="6">
                              <div class="text-left font-weight-bold">
                                User Name
                              </div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-left ml-n6">
                                {{ ":" + " " + rowInfo.user_name }}
                              </div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-left mt-n4 font-weight-bold">
                                Ticket Id
                              </div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-left ml-n6 mt-n4">
                                {{ ":" + " " + rowInfo.ticket_no_id }}
                              </div>
                            </v-col>
                            <v-col
                              v-if="rowInfo.preferred_timings != undefined"
                              cols="6"
                            >
                              <div class="text-left mt-n4 font-weight-bold">
                                Preferred Time Slot
                              </div>
                            </v-col>
                            <v-col
                              v-if="rowInfo.preferred_timings != undefined"
                              cols="6"
                            >
                              <div class="text-left ml-n6 mt-n4">
                                {{
                                  ":" +
                                  " " +
                                  fetch_value(
                                    rowInfo.preferred_timings,
                                    "dateTime"
                                  )
                                }}
                              </div>
                            </v-col>
                            <v-col class="mt-n4" cols="6">
                              <div class="text-left font-weight-bold">
                                Product/Service
                              </div>
                            </v-col>
                            <v-col cols="6" class="mt-n4">
                              <div class="text-left ml-n6">
                                {{ ":" + " " + rowInfo.product_name }}
                              </div>
                            </v-col>
                            <v-col class="mt-n4" cols="6">
                              <div class="text-left font-weight-bold">
                                Category
                              </div>
                            </v-col>
                            <v-col cols="6" class="mt-n4">
                              <div class="text-left ml-n6">
                                {{ ":" + " " + rowInfo.categorie_name }}
                              </div>
                            </v-col>
                            <v-col class="mt-n4" cols="6">
                              <div class="text-left font-weight-bold">
                                Ticket Description
                              </div>
                            </v-col>

                            <v-col cols="6" class="mt-n4">
                              <div class="text-left ml-n6">
                                {{ ":" + " " + rowInfo.ticket_description }}
                              </div>
                            </v-col>
                            <v-col
                              v-if="rowInfo.is_otp_receive_alternative == true"
                              class="mt-n4"
                              cols="6"
                            >
                              <div class="text-left font-weight-bold">
                                Alternate Contact Number
                              </div>
                            </v-col>

                            <v-col
                              v-if="rowInfo.is_otp_receive_alternative == true"
                              cols="6"
                              class="mt-n4"
                            >
                              <div class="text-left ml-n6">
                                {{
                                  ":" +
                                  " " +
                                  rowInfo.alternative_country_code +
                                  " " +
                                  rowInfo.alternative_contact_number
                                }}
                              </div>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>

                      <!-- </v-card> -->
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel
                    v-if="
                      rowInfo.media_keys != undefined &&
                      rowInfo.media_keys.length != 0
                    "
                    @click="panel = []"
                  >
                    <v-expansion-panel-header
                      >Attachments</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                      <v-row>
                        <v-col
                          v-for="(item, i) in privatePublicSongs"
                          :key="i"
                          cols="6"
                        >
                          <v-img :src="item" aspect-ratio="1.2" contain>
                          </v-img>
                        </v-col>
                      </v-row>
                      <!-- <v-card> -->
                      <!-- <v-carousel
                        v-if="privatePublicSongs.length != 0"
                        class="mt-2"
                        height="250px"
                        hide-delimiters
                      >
                        <v-carousel-item
                          v-for="(item, i) in privatePublicSongs"
                          :key="i"
                          :src="item"
                        >
                        </v-carousel-item>
                      </v-carousel> -->

                      <!-- </v-card> -->
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel @click="panel = []">
                    <v-expansion-panel-header
                      >Technicians Details</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                      <!-- <v-card> -->

                      <v-data-table
                        :headers="adminHeaders"
                        :fixed-header="fixed"
                        :items="teamData"
                        :height="height"
                        :loading="tableLoading"
                        :footer-props="{
                          itemsPerPageOptions: [10, 20, 30, 40, 50],
                        }"
                        :items-per-page="50"
                        dense
                        hide-default-footer
                        @click:row="handle_row_click"
                        class="elevation-1 dtwidth mt-2"
                      >
                        <template v-slot:[`item.full_user_name`]="{ item }">
                          <div
                            v-if="
                              item.user_profile_pic_url != undefined &&
                              item.user_profile_pic_url != 'N/A' &&
                              item.user_profile_pic_url != ''
                            "
                            class="caption"
                          >
                            <v-avatar size="32" class="mt-1 mb-1">
                              <v-img :src="item.user_profile_pic_url" />
                            </v-avatar>
                            <span class="ml-1">{{ item.full_user_name }}</span>
                          </div>
                          <div v-else>
                            <v-avatar
                              size="34"
                              class="mt-1 mb-1"
                              color="primaryColor"
                            >
                              <span class="white--text">
                                {{ item.full_user_name.substring(0, 1) }}</span
                              >
                            </v-avatar>
                            <span class="ml-1">{{ item.full_user_name }}</span>
                          </div>
                        </template>
                      </v-data-table>
                      <!-- </v-card> -->
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <!-- </v-row> -->

                <!-- <v-toolbar flat>
                  <v-toolbar-title
                    >{{rowInfo.product_name + ":" +  rowInfo.categorie_name }}</v-toolbar-title>
                  </v-toolbar-title>
                </v-toolbar> -->
              </v-card-text>
              <!-- </v-card> -->
            </v-col>
            <v-col cols="8">
              <v-row class="fill-height">
                <v-col>
                  <v-sheet height="64">
                    <v-toolbar flat>
                      <div v-if="valueSelected == true">
                        <b> {{ rowData.full_user_name }}</b>
                      </div>
                      <!-- <v-btn
                        outlined
                        class="mr-4"
                        color="grey darken-2"
                        @click="setToday"
                      >
                        Today
                      </v-btn> -->
                      <v-btn fab text small color="grey darken-2" @click="prev">
                        <v-icon small> mdi-chevron-left </v-icon>
                      </v-btn>
                      <v-btn fab text small color="grey darken-2" @click="next">
                        <v-icon small> mdi-chevron-right </v-icon>
                      </v-btn>
                      <v-toolbar-title v-if="$refs.calendar">
                        {{ $refs.calendar.title }}
                      </v-toolbar-title>
                      <v-spacer></v-spacer>
                      <div
                        v-if="
                          valueSelected == true &&
                          type == 'day' &&
                          previouscheck == false
                        "
                      >
                        <v-btn
                          depressed
                          @click="validate_assign_check()"
                          dark
                          class="cardCss text-capitalize"
                        >
                          Assign
                        </v-btn>
                        <!-- <b> {{ rowData.full_user_name }}</b> -->
                      </div>

                      <v-menu bottom right>
                        <template #activator="{ on, attrs }">
                          <v-btn
                            outlined
                            color="grey darken-2"
                            v-bind="attrs"
                            class="ml-2"
                            v-on="on"
                          >
                            <span>{{ typeToLabel[type] }}</span>
                            <v-icon right> mdi-menu-down </v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="type = 'day'">
                            <v-list-item-title>Day</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="type = 'week'">
                            <v-list-item-title>Week</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="type = 'month'">
                            <v-list-item-title>Month</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-toolbar>
                  </v-sheet>
                  <v-card :height="height2">
                    <v-calendar
                      ref="calendar"
                      v-model="focus"
                      color="primary"
                      :events="events"
                      :event-color="getEventColor"
                      :first-interval="8"
                      :interval-minutes="60"
                      :interval-count="16"
                      :type="type"
                      @click:event="showEvent"
                      @click:date="viewDay"
                    >
                      <template #day-header="{ present }">
                        <template v-if="present">
                          <div
                            v-if="valueSelected == true"
                            class="text-left ml-2 pt-n2"
                          >
                            <b
                              >Preferred Time Slot :
                              {{
                                rowInfo.preferred_timings != undefined
                                  ? fetch_value(
                                      rowInfo.preferred_timings,
                                      "time"
                                    )
                                  : "-"
                              }}
                            </b>
                          </div>

                          <!-- <div
                            v-if="valueSelected == true"
                            class="text-left ml-2"
                          >
                            <b
                              >Slot Available :
                              <span
                                :class="{
                                  'green-text': slotAvailabilityCheck,
                                  'red-text': !slotAvailabilityCheck,
                                }"
                              >
                                {{ slotAvailabilityCheck ? "YES" : "NO" }}
                              </span>
                            </b>
                          </div> -->
                          <div
                            v-if="valueSelected == true"
                            class="text-left ml-2"
                          >
                            <b
                              >Total Tickets :
                              <span>
                                {{ rowData.total_tickets }}
                              </span>
                            </b>
                          </div>
                          <div
                            v-if="valueSelected == true"
                            class="text-left ml-2"
                          >
                            <b
                              >Pending Tickets :
                              <span>
                                {{ rowData.pending_tickets }}
                              </span>
                            </b>
                          </div>
                          <div
                            v-if="valueSelected == true"
                            class="text-left ml-2"
                          >
                            <b
                              >Completed Tickets :
                              <span>
                                {{ rowData.compeleted_tickets }}
                              </span>
                            </b>
                          </div>
                        </template>
                      </template>
                    </v-calendar>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <TicketAssign
        :rowInfo="rowInfo"
        :assignDialog="assignDialog"
        :rowData="rowData"
        :timeslotsData="timeslotsData"
        v-on:successMsg="sucess_info"
        v-on:errorMsg="error_info"
        @clicked="assignDialog = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import {
  list_users_for_tickets,
  get_user_ticket_details,
} from "@/graphql/queries.js";
import { assign_tickets } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import TicketAssign from "@/components/TicketManagement/AllDialogs/TicketAssign.vue";
import SnackBar from "@/components/SnackBar.vue";
var axios = require("axios");

export default {
  props: {
    claimDialog: Boolean,
    rowInfo: Object,
  },
  components: {
    SnackBar,
    TicketAssign,
  },
  data() {
    return {
      panel: [0],
      focus: "",
      type: "day",
      typeToLabel: {
        day: "Day",
        month: "Month",
        week: "Week",
      },
      dailyConfig: {
        minTime: "10:00:00", // 10:00 AM
        maxTime: "23:00:00",
      },
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      colors: ["teal", "orange", "red lighten-1"],
      // names: [],
      height: 0,
      height2: 0,
      adminHeaders: [
        // {
        //   text: "Profile",
        //   value: "user_profile_pic_url",
        //   sortable: false,
        // },
        {
          text: "Name",
          value: "full_user_name",
          sortable: false,
        },
        {
          text: "Contact Number",
          value: "user_full_contact_number",
          sortable: false,
        },
      ],

      loading: false,
      assignDialog: false,
      timeSlotInfo: {},
      dragEvent: null,
      dragStart: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null,
      fixed: false,
      teamData: [],
      tableLoading: false,
      valueSelected: false,
      rowData: {},
      loading1: false,
      SnackBarComponent: {},
      userTicketDetials: [],
      names: [],
      slotAvailabilityCheck: 0,
      checkbox: false,
      privatePublicSongs: [],
      componentCheck: 0,
      timeslotsData: {},
      dateChangeCheck: false,
      getDateValaue: "",
      previouscheck: false,
    };
  },
  watch: {
    claimDialog: {
      async handler() {
        if (this.claimDialog == true) {
          this.height = window.innerHeight - 220;
          this.height2 = window.innerHeight - 50;
          this.teamData = [];
          this.slotAvailabilityCheck = false;
          this.valueSelected = false;
          this.checkbox = false;
          this.panel = [0];
          if (
            this.rowInfo.media_keys != undefined &&
            this.rowInfo.media_keys.length != 0
          ) {
            await this.check_private_public_urls();
          }

          await this.fetch_user_list();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.$refs.calendar.checkChange();
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.valueSelected = false;
      this.teamData = [];
    },

    sucess_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.assignDialog = false;
      this.$emit("onsuccess", "completed");
      this.$emit("clicked", 0);
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

    validate_assign_check() {
      this.componentCheck = 1;
      this.assignDialog = true;
    },

    async check_private_public_urls() {
      this.privatePublicSongs = [];
      for (const url of this.rowInfo.media_keys) {
        try {
          const response = await axios.head(url);

          if (response.status === 200) {
            this.privatePublicSongs.push(url);
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            this.fetch_presigned(url);
          } else {
          }
        }
      }
    },

    fetch_presigned(url) {
      var self = this;
      var response = self.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });

      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "tickets/" + url.split("tickets/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      this.privatePublicSongs.push(url);
    },

    handle_row_click(value) {
      this.slotAvailabilityCheck = false;
      this.valueSelected = false;
      this.rowData = value;
      this.dateChangeCheck = false;
      this.previouscheck = false;
      this.fetch_user_ticket_details(value);
    },

    fetch_value(val, valueCheck) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;

      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
      if (valueCheck == "time") {
        return timeValue;
      } else {
        return concatDateTime;
      }
    },

    async fetch_user_ticket_details(value) {
      // var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(get_user_ticket_details, {
            input: {
              user_id: value.user_id,
              action_type: this.get_type(this.type),
              ticket_id: this.rowInfo.ticket_id,
              today_date:
                this.type == "day" ? this.fetch_current_date1() : undefined,
              assigned_month:
                this.type == "month" ? this.get_current_month() : undefined,
              offset: new Date().getTimezoneOffset() * 60,
            },
          })
        );

        this.userTicketDetials = [];
        var response = JSON.parse(result.data.get_user_ticket_details);
        this.timeslotsData = response;
        this.valueSelected = true;
        this.slotAvailabilityCheck = response.slot_available;

        if (response.Status == "SUCCESS") {
          this.update_range(response);
        } else {
          this.events = [];
          this.tableLoading = false;
        }
      } catch (error) {
        // this.tableLoading = false;
      }
    },

    get_current_month() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so we add 1
      const formattedDate = `${year}-${month}`;
      return formattedDate;
    },

    get_type(val) {
      var data = "";
      if (val == "day") {
        data = "TODAY";
      } else if (val == "week") {
        data = "WEEKLY";
      } else if (val == "month") {
        data = "MONTHLY";
      }
      return data;
    },

    async fetch_user_list() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_users_for_tickets, {
            input: {
              organization_id: data.organization.organization_id,
              today_date: await this.fetch_current_date(),
            },
          })
        );

        this.teamData = [];
        var response = JSON.parse(result.data.list_users_for_tickets);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.teamData = response.data;

          // console.log(this.teamData);
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    fetch_current_date() {
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().padStart(4, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
      const day = currentDate.getDate().toString().padStart(2, "0");

      const formattedDate = `${year}${month}${day}`;

      return formattedDate;
    },

    fetch_current_date1() {
      if (this.dateChangeCheck == true) {
        return this.getDateValaue;
      } else {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().padStart(4, "0");
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
        const day = currentDate.getDate().toString().padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
      }
    },

    viewDay({ date }) {
      // console.log(date);
      this.focus = date;
      this.type = "day";
    },

    setToday() {
      this.focus = "";
    },

    prev() {
      this.$refs.calendar.prev();
      this.$nextTick(() => {
        this.dateChangeCheck = true;
        this.getDateValaue = this.$refs.calendar.lastEnd.date;

        if (new Date().toISOString().split("T")[0] >= this.getDateValaue) {
          this.fetch_user_ticket_details(this.rowData);
        }
      });
    },

    next() {
      this.$refs.calendar.next();
      this.$nextTick(() => {
        this.dateChangeCheck = true;
        this.getDateValaue = this.$refs.calendar.lastEnd.date;
        this.fetch_user_ticket_details(this.rowData);
      });
    },

    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },

    getEventColor(event) {
      return event.color;
    },

    update_range(value) {
      // console.log(value);
      const events = [];
      for (let i = 0; i < value.data.length; i++) {
        events.push({
          name: value.data[i].ticket_no_id,
          start: new Date(value.data[i].start_time * 1000),
          end: new Date(value.data[i].end_time * 1000),

          color: this.colors[this.rnd(0, this.colors.length - 1)],
          timed: true,
        });
      }

      this.events = events;
    },

    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
  },
};
</script>
<style>
.green-text {
  color: green;
}

.red-text {
  color: red;
}
</style>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="reportDailog"
      @update:model-value="reportDailog = $event"
      persistent
      max-width="1000"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              View Details of {{ rowInfo.full_user_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-row class="ml-1 mt-2">
            <v-chip x-small color="green" class="mt-4"> </v-chip>
            <div class="mt-3 ml-1"><b>Present (P)</b></div>
            <v-chip x-small color="red" class="mt-4 ml-5"> </v-chip>
            <div class="mt-3 ml-1"><b>Absent (A)</b></div>
            <v-chip x-small color="blue" class="mt-4 ml-5"> </v-chip>
            <div class="mt-3 ml-1"><b>Leave (L)</b></div>
            <v-chip x-small color="grey" class="mt-4 ml-5"> </v-chip>
            <div class="mt-3 ml-1"><b>Week Off (W/O)</b></div>
            <v-chip x-small color="orange" class="mt-4 ml-5"> </v-chip>
            <div class="mt-3 ml-1"><b>Holiday (H)</b></div>
          </v-row>

          <v-data-table
            :headers="headers"
            :fixed-header="fixed"
            :items="tableData"
            :height="heighttable"
            :loading="tableLoading"
            hide-default-footer
            :items-per-page="100"
            density="compact"
            class="elevation-1 dtwidth mt-5"
          >
            <template v-slot:[`item.date`]="{ item }">
              <span>{{ get_updatedate(item.date) }}</span>
            </template>
            <template v-slot:[`item.user_name`]="{ item }">
              <span>{{ item.user_name }}</span>
              <br />
              <span>{{ item.member_id }}</span>
            </template>
            <template v-slot:[`item.first_swipe`]="{ item }">
              <div v-if="item.attendence_type == 'P'">
                <span>{{ get_date(item.first_swipe) }}</span>
              </div>
              <span v-else>-</span>
            </template>
            <template v-slot:[`item.last_swipe`]="{ item }">
              <div v-if="item.attendence_type == 'P'">
                <span>{{ get_date(item.last_swipe) }}</span>
              </div>
              <span v-else>-</span>
            </template>
            <!-- <template v-slot:[`item.last_swipe`]="{ item }">
            <span v-text="get_date(item.last_swipe)"></span>
          </template> -->
            <template v-slot:[`item.total_duration`]="{ item }">
              <div v-if="item.attendence_type == 'P'">
                <v-progress-linear
                  color="green"
                  :input="true"
                  height="22"
                  style="width: 340px"
                  :value="
                    (Math.floor(item.total_duration_epoach / 3600000) / 24) *
                    100
                  "
                >
                  {{
                    hours_minutes_seconds(
                      Math.floor(item.total_duration_epoach / 1000)
                    ) == "NaNs"
                      ? "0s"
                      : hours_minutes_seconds(
                          Math.floor(item.total_duration_epoach / 1000)
                        )
                  }}

                  <!-- {{  (item.total_duration/3600000).toFixed(1)+" H" }} -->

                  <!-- <template v-slot:default="{ value }">
              </template> -->
                </v-progress-linear>
              </div>
              <div v-if="item.attendence_type == 'A'">
                <v-progress-linear
                  color="red"
                  :input="true"
                  height="22"
                  style="width: 340px"
                  :value="100"
                >
                </v-progress-linear>
              </div>
              <div v-if="item.attendence_type == 'L'">
                <v-progress-linear
                  color="blue"
                  :input="true"
                  height="22"
                  style="width: 340px"
                  :value="100"
                >
                </v-progress-linear>
              </div>

              <div v-if="item.attendence_type == 'W/O'">
                <v-progress-linear
                  color="grey"
                  :input="true"
                  height="22"
                  style="width: 340px"
                  :value="100"
                >
                </v-progress-linear>
              </div>
              <div v-if="item.attendence_type == 'H'">
                <v-progress-linear
                  color="orange"
                  :input="true"
                  height="22"
                  style="width: 340px"
                  :value="100"
                >
                </v-progress-linear>
              </div>
            </template>
            <template v-slot:[`item.total_swipes`]="{ item }">
              <u
                ><span @click="get_location(item)">{{
                  item.total_swipes
                }}</span></u
              >
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { formatdisplayDate, formatTime } from "@/JsonFiles/DateFormate.js";
export default {
  props: {
    reportDailog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      headers: [
        { title: "Date", key: "date", sortable: false },
        // {
        //   title: "Member ID",
        //   key: "member_id",
        //   sortable: false,
        // },
        {
          title: "First Swipe",
          key: "first_swipe",
          sortable: false,
        },
        {
          title: "Duration(0-24hrs)",
          key: "total_duration",
          sortable: false,
        },
        {
          title: "Last Swipe",
          key: "last_swipe",
          sortable: false,
        },

        {
          title: "Attendence Type",
          key: "attendence_type",
          sortable: false,
        },
        // { title: "Last Swipe", key: "last_swipe", sortable: false },
        // { title: "Location", key: "last_swiped_location", sortable: false },
        // { title: "#Swipes", key: "total_swipes", sortable: false },
      ],
      height: 0,
      fixed: true,
      tableData: [],
      tableLoading: false,
      timestamp: null,
      heighttable: 0,
    };
  },
  watch: {
    reportDailog: {
      async handler() {
        this.heighttable = window.innerHeight - 280;
        this.tableData = [];
        // this.tableData = this.rowInfo.monthReports;
        this.rowInfo.monthReports.forEach((element) => {
          if (element.attendence_type !== "N/A") {
            this.tableData.push({
              date: element.date,
              first_swipe: element.first_swipe,
              total_duration: element.total_duration,
              last_swipe: element.last_swipe,
              attendence_type: element.attendence_type,
              total_duration_epoach: element.total_duration_epoach,
            });
          }
        });
      },
      immediate: true,
    },
  },
  methods: {
    get_updatedate(date) {
      return formatdisplayDate(date);
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    get_date(date) {
      return formatTime(date / 1000);
      // let a = new Date(date).toLocaleTimeString("en-In", {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   second: "2-digit",
      // });
      // return a.toUpperCase();
    },
    hours_minutes_seconds(seconds) {
      var h = Math.floor(seconds / (60 * 60));
      var divisor_for_minutes = seconds % (60 * 60);
      var m = Math.floor(divisor_for_minutes / 60);
      var divisor_for_seconds = divisor_for_minutes % 60;
      var s = Math.ceil(divisor_for_seconds);
      return `${h ? `${h}h ` : ""}${m ? `${m}m ${s}s` : `${s}s`}`;
    },
  },
};
</script>

<style>
</style>
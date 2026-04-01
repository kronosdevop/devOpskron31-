<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="approveReporting"
      @update:model-value="approveReporting = $event"
      persistent
      transition="dialog-bottom-transition"
      max-width="800"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Timesheet of {{ timesheetitems.timesheet_created_by_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-row class="ml-2">
            <div class="text-left mt-2">
              Total Duration :
              <b>{{ timesheetitems.organization_working_duration }}</b>
            </div>
            <div class="text-left mt-2 ml-5">
              Total Work Duration :
              <b>{{ timesheetitems.total_work_duration }}</b>
            </div>
          </v-row>
          <v-data-table
            :headers="timeSheetHeaders"
            :fixed-header="fixed"
            :items="timeRecords"
            hide-default-footer
            :items-per-page="100"
            density="compact"
            class="elevation-1 mt-5 dtwidth"
          >
            <template v-slot:[`item.comments`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div v-if="item.comments" v-on="on">
                    {{
                      item.comments.length >= 10
                        ? item.comments.substr(0, 10) + "..."
                        : item.comments
                    }}
                  </div>
                  <div v-else>-</div>
                </template>
                <div class="caption" style="max-width: 250px">
                  {{ item.comments }}
                </div>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            @click="approve_mutation()"
            :loading="approveloading"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Approve
          </v-btn>
          <v-btn
            @click="reject_mutation()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
      <script>
/* eslint-disable */
import { update_timesheet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    approveReporting: Boolean,
    timesheetitems: Object,
  },
  data() {
    return {
      loading: false,
      approveloading: false,
      fixed: true,
      timeRecords: [],
      timeSheetHeaders: [
        {
          title : "Date",
          key: "timesheet_from_date",
          sortable: false,
        },
        {
          title : "Project Name",
          key: "project_name",
          sortable: false,
        },
        { title : "Activity", key: "activity_name", sortable: false },
        { title : "Time Spent", key: "work_duartion", sortable: false },
        { title : "Comments", key: "comments", sortable: false },
      ],
    };
  },
  watch: {
    approveReporting: {
      async handler() {
        this.timeRecords = this.timesheetitems.timesheet_details;
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async reject_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(update_timesheet, {
            input: {
              action_type: "UPDATE_STATUS",
              timesheet_id: this.timesheetitems.timesheet_id,
              timesheet_status: "REJECTED",
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.update_timesheet);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async approve_mutation() {
      this.approveloading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(update_timesheet, {
            input: {
              action_type: "UPDATE_STATUS",
              timesheet_id: this.timesheetitems.timesheet_id,
              timesheet_status: "APPROVED",
            },
          })
        );

        this.approveloading = false;

        var response = JSON.parse(result.data.update_timesheet);
        this.approveloading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.approveloading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
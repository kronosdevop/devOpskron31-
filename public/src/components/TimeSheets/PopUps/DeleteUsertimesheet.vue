<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="timesheetdeletion"
      @update:model-value="timesheetdeletion = $event"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="">
            <div class="custom-title">Delete Timesheet</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <div
            class="text-left"
            v-if="
              timesheetitems.timesheet_from_date !=
              timesheetitems.timesheet_to_date
            "
          >
            Would you like to delete the timesheet from
            <b> {{ timesheetitems.timesheet_from_date }} </b> to
            <b> {{ timesheetitems.timesheet_to_date }} </b> ?
          </div>
          <div v-else>
            Would you like to delete the timesheet for
            <b> {{ timesheetitems.timesheet_to_date }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="delete_mutation()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { delete_timesheet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    timesheetdeletion: Boolean,
    timesheetitems: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    timesheetdeletion: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(delete_timesheet, {
            input: {
              timesheet_id: this.timesheetitems.timesheet_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.delete_timesheet);
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
  },
};
</script>
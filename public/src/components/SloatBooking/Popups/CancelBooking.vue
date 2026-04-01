<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="cancelDialog"
      @update:model-value="$emit('update:cancelDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="">Cancel Booking</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text>
          <v-form ref="form">
            <div class="text-left">
              <!-- Are you sure you want to cancel
              {{ rowInfo.resource_name }} booking ? -->
            </div>
            <v-row no-gutters>
              <v-col cols="12">
                <v-textarea
                  density="compact"
                  :rules="[(v) => !!v || 'Required ']"
                  variant="outlined"
                  class="mt-4"
                  label="Reason for cancellation"
                  v-model="commentsData"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            size="small"
            depressed
            :loading="loading"
            @click="validate_date()"
            dark
            class="cardCss"
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

import { cancel_slot_booking } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    cancelDialog: Boolean,
    rowInfo: Object,
  },
  components: {},
  data() {
    return {
      loading: false,
      fromMenu: false,
      fromDate: "",
      toDate: "",
      toMenu: false,
      minDate: new Date().toISOString().split("T")[0],
      commentsData: "",
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.fromDate = "";
      this.toDate = "";
    },

    async validate_date() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.booking_slot();
      }
    },

    async booking_slot() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(cancel_slot_booking, {
            input: {
              resource_id: this.rowInfo.resource_id,
              booking_id: this.rowInfo.booking_id,
              cancelled_comments: this.commentsData,
            },
          })
        );

        var response = JSON.parse(result.data.cancel_slot_booking);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("SuccessMsg", response.Message);
          this.$refs.form.reset();
          this.$refs.form.resetValidation();
        } else {
          this.$emit("errorMsg", response.Message);
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_current_date() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const day = String(currentDate.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      return formattedDate;
    },

    fetch_data() {
      var data = {};
      data = {
        start_epoch: this.slotInfo.start_epoch,
        end_epoch: this.slotInfo.end_epoch,
      };

      return JSON.stringify(data);
    },
  },
};
</script>
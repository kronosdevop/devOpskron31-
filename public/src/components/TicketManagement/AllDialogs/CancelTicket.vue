<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="cancelTicketDialog" @update:model-value="$emit('update:cancelTicketDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar flat elevation="0" dark dense class="navBar">
          <v-toolbar-title> <div class="custom-title">
            Cancel Ticket
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-4">
              <v-textarea
                label="Enter Reason For Cancellation"
                outlined
                v-model="canelData"
                dense
              />
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_api()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import { claim_start_ticket } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    cancelTicketDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      canelData: "",
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.canelData = "";
    },

    validate_api() {
      if (this.$refs.form.validate()) {
        this.reject_ticket_api();
      }
    },

    async reject_ticket_api() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(claim_start_ticket, {
            input: {
              user_id: this.$store.getters.GetUserObj.user.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_id: this.rowInfo.assigned_id,
              action_type: "REJECT_TICKET",
              comments: this.canelData,
            },
          })
        );

        var response = JSON.parse(result.data.claim_start_ticket);
        this.loading = false;
        this.canelData = "";
        if (response.Status == "SUCCESS") {
          this.$emit("startWork", response.Message);
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
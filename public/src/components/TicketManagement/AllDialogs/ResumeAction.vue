<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="resumeTicketDialog" @update:model-value="$emit('update:resumeTicketDialog', $event)" persistent max-width="900" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >
            <div class="custom-title">Resume Action
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4 text-left">
          <v-row>
            <v-col class="text-left" cols="6">
              <div class="mt-n2"><h4>Ticket Details</h4></div>
              <v-divider class="mb-1 mt-1" />

              <div class="mt- 2 text-left">
                <b>Ticket ID : </b>{{ rowInfo.ticket_no_id }}
              </div>
              <div class="mt-1">
                <b>Product : </b>{{ rowInfo.product_name }}
              </div>
              <div class="mt-1">
                <b>Category : </b>{{ rowInfo.categorie_name }}
              </div>
              <div class="mt-1">
                <b>Preferred Timings : </b
                >{{ fetch_value(rowInfo.preferred_timings) }}
              </div>

              <div class="mt-1">
                <b>Is Priority : </b
                >{{ rowInfo.is_urgent == true ? "Yes" : "No" }}
              </div>
              <div class="mt-1">
                <b>Ticket Status : </b>
                <span style="color: #006064">
                  <b> {{ rowInfo.ticket_status }}</b>
                </span>
              </div>

              <div class="mt-1">
                <b>Ticket Description : </b>{{ rowInfo.ticket_description }}
              </div>
              <div class="mt-1">
                <b>Admin Comments : </b
                >{{
                  rowInfo.ticket_admin_comments == "-"
                    ? "N/A"
                    : rowInfo.ticket_admin_comments
                }}
              </div>

              <div class="mt-5"><h4>Customer Details</h4></div>
              <v-divider class="mb-1 mt-1" />
              <div class="mt-1"><b>Name : </b>{{ rowInfo.user_name }}</div>
              <div class="mt-1">
                <b>Contact Number : </b>{{ rowInfo.customer_contact_number }}
              </div>
              <div class="mt-1">
                <b>Email Id : </b>{{ rowInfo.customer_email_id }}
              </div>
              <div class="mt-1">
                <b>Ticket Raised On : </b
                >{{ fetch_value(rowInfo.ticket_raised_on) }}
              </div>
              <div class="mt-1">
                <b>Ticket Assigned On : </b
                >{{ fetch_value(rowInfo.ticket_assigned_on) }}
              </div>
              <div class="mt-1">
                <b>Ticket Assigned Slot : </b
                >{{
                  fetch_time(rowInfo.slot_start_time) +
                  "-" +
                  fetch_time(rowInfo.slot_end_time) +
                  ", " +
                  fetch_date(rowInfo.slot_start_time)
                }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading2"
            @click="resume_action()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            RESUME WORK
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
    resumeTicketDialog: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading2: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_value(val) {
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
      return concatDateTime;
    },
    fetch_time(val) {
      const d = new Date(parseInt(val * 1000));
      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return timeValue;
    },
    fetch_date(val) {
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
      return dateValue;
    },

    async resume_action() {
      this.loading2 = true;
      try {
        let result = await API.graphql(
          graphqlOperation(claim_start_ticket, {
            input: {
              user_id: this.$store.getters.GetUserObj.user.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_id: this.rowInfo.assigned_id,
              action_type: "RESUME",
            },
          })
        );

        var response = JSON.parse(result.data.claim_start_ticket);
        if (response.Status == "SUCCESS") {
          this.loading2 = false;
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading2 = false;
      }
    },
  },
};
</script>
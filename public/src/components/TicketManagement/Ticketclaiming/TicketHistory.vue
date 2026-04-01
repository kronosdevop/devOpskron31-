<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <v-card-text>
        <v-data-table
          :headers="headers"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          dense
          class="elevation-1 dtwidth"
          @click:row="handle_Item_Click"
        >
          <!--   :height="height" -->
          <template v-slot:[`item.ticket_status`]="{ item }">
            <span v-if="item.ticket_status == 'LIVE'">
              <v-btn small text class="white--text ml-n3" color="green"
                >LIVE</v-btn
              >
            </span>
            <span v-if="item.ticket_status == 'INPROGRESS'">
              <v-btn small text class="white--text ml-n3" color="orange"
                >INPROGRESS</v-btn
              >
            </span>

            <span v-if="item.ticket_status == 'COMPLETED'">
              <v-btn small text class="ml-n3" color="#009688">COMPLETED</v-btn>
            </span>
            <span v-if="item.ticket_status == 'PAUSED'">
              <v-btn small text class="ml-n3" color="#006064">PAUSED</v-btn>
            </span>
          </template>
          <template v-slot:[`item.ticket_assigned_on`]="{ item }">
            <span class="caption">{{
              fetch_value(item.ticket_assigned_on)
            }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentcheck == 1">
      <CompletedHistory
        :ticketAccept="ticketAccept"
        :rowInfo="rowInfo"
        :ticketType="ticketType"
        @clicked="ticketAccept = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import CompletedHistory from "@/components/TicketManagement/AllDialogs/CompletedHistory.vue";
import { list_assigned_tickets_technicians } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    // AcceptTicket,
    CompletedHistory,
  },
  data() {
    return {
      SnackBarComponent: {},

      rowinfo: {},
      headers: [
        {
          text: "Ticket Id",
          value: "ticket_no_id",
          sortable: false,
        },
        {
          text: "Product Name",
          value: "product_name",
          sortable: false,
        },
        {
          text: "Category ",
          value: "categorie_name",
          sortable: false,
        },
        {
          text: "Customer Name",
          value: "user_name",
          sortable: false,
        },
        {
          text: "Ticket Status",
          value: "ticket_status",
          sortable: false,
        },
        {
          text: "Ticket Assigned By",
          value: "ticket_assign_by",
          sortable: false,
        },
        {
          text: "Ticket Assigned On",
          value: "ticket_assigned_on",
          sortable: false,
        },
      ],
      height: 0,
      fixed: true,
      tableData: [],
      tableLoading: false,
      ticketAccept: false,
      ticketType: "history",
      componentcheck: 0,
    };
  },
  created() {
    this.height = window.innerHeight - 270;
    this.fetch_pending_tickets();
  },
  methods: {
    async fetch_pending_tickets() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_assigned_tickets_technicians, {
            input: {
              user_id: data.user.user_id,
              action_type: "HISTORY",
              limit: 100,
              NextToken: null,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(
          result.data.list_assigned_tickets_technicians
        );

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
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
    fetch_value(val) {
      return formatedatetime(val);
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();
      // var dateValue =
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year;
      // var time = new Date(val);
      // var timeValue = d.toLocaleString([], {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   hour12: true,
      // });
      // const concatDateTime = dateValue + " " + timeValue;
      // return concatDateTime;
    },
    handle_Item_Click(item) {
      this.rowInfo = item;

      this.componentcheck = 1;
      this.ticketAccept = true;
    },
  },
};
</script>

<style>
</style>
<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <v-toolbar dense class="" flat >
        <!-- <v-toolbar-title>My Tickets</v-toolbar-title> -->
        <v-spacer />
        <v-btn @click="ticket_rise()" dark class="cardCss text-capitalize mr-2 mt-2">
          Initiate
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :fixed-header="fixed"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
          @click:row="handleClick"
        >
          <!-- :height="height" -->
          <template
            v-slot:[`item.ticket_assigned_user.full_user_name`]="{ item }"
          >
            <span v-if="item.ticket_status != 'NOT_ASSIGNED'">{{
              item.ticket_assigned_user.full_user_name
            }}</span>
            <span v-else>-</span>
          </template>
          <template v-slot:[`item.ticket_raised_on`]="{ item }">
            <span v-text="get_date(item.ticket_raised_on)"></span>
          </template>
          <template v-slot:[`item.ticket_status`]="{ item }">
            <span v-if="item.ticket_status == 'NOT_ASSIGNED'" class="red--text"
              >Not Assigned</span
            >
            <span
              v-else-if="item.ticket_status == 'ASSIGNED'"
              class="green--text"
              >Assigned
            </span>
            <span
              v-else-if="item.ticket_status == 'PROGRESS'"
              class="orange--text"
              >Progress
            </span>
            <span v-else-if="item.ticket_status == 'HOLD'" class="red--text"
              >Hold
            </span>
            <span
              v-else-if="item.ticket_status == 'COMEPLETED'"
              class="green--text"
              >Completed
            </span>
            <span v-else>
              {{ item.ticket_status }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentcheck == 1">
      <InitiateTicket
        :riseTicket="riseTicket"
        @clicked="riseTicket = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentcheck == 2">
      <ViewTickets
        :ticketView="ticketView"
        :ticketDetails="ticketDetails"
        @clicked="ticketView = false"
      />
    </div>
  </div>
</template>

<script>
import { format_Date } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import InitiateTicket from "@/components/TicketManagement/AllDialogs/InitiateTicket.vue";
import { list_tickets_for_internal_users } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewTickets from "@/components/TicketManagement/AllDialogs/ViewTickets.vue";
export default {
  components: {
    SnackBar,
    InitiateTicket,
    ViewTickets,
  },
  data() {
    return {
      tableLoading: false,
      riseTicket: false,
      headers: [
        { text: "Ticket ID", value: "ticket_no_id", sortable: false },
        {
          text: "Ticket Raised On ",
          value: "ticket_raised_on",
          sortable: false,
        },
        {
          text: "Product/Service",
          value: "product_name",
          sortable: false,
        },
        { text: "Category Type", value: "categorie_name", sortable: false },
        {
          text: "Assigned To",
          value: "ticket_assigned_user.full_user_name",
          sortable: false,
        },
        { text: "Ticket Status", value: "ticket_status", sortable: false },
      ],
      tableData: [],
      height: 0,
      fixed: true,
      ticketDetails: {},
      ticketView: false,
      componentcheck: 0,
      SnackBarComponent: {},
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    this.get_categories();
  },
  methods: {
    get_date(val) {
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
      return format_Date(val);
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.riseTicket = false;
      this.get_categories();
    },
    handleClick(item) {
      this.componentcheck = 2;
      this.ticketDetails = item;
      this.ticketView = true;
    },

    ticket_rise() {
      this.componentcheck = 1;
      this.riseTicket = true;
    },
    async get_categories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_tickets_for_internal_users, {
            input: {
              user_id: data.user.user_id,
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;

        this.tableData = [];

        var response = JSON.parse(result.data.list_tickets_for_internal_users);
        this.tableData = response.data;
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
  },
};
</script>

<style>
</style>
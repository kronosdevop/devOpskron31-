<template>
  <div>
    <v-card-text>
      <v-data-table
        :headers="adminHeaders"
        :fixed-header="fixed"
        :items="tableData"
        :loading="tableLoading"
        :footer-props="{
          itemsPerPageOptions: [10, 20, 30, 40, 50],
        }"
        :items-per-page="20"
        dense
        class="elevation-1 dtwidth"
        @click:row="handleClick"
      >
        <!--  :height="height" -->
        <template v-slot:[`item.ticket_raised_on`]="{ item }">
          <span v-text="get_date(item.ticket_raised_on)"></span>
        </template>
        <template v-slot:[`item.ticket_status`]="{ item }">
          <span v-if="item.ticket_status == 'NOT_ASSIGNED'" class="red--text"
            >NOT ASSIGNED</span
          >
          <span
            v-else-if="item.ticket_status == 'ASSIGNED '"
            class="orange--text"
            >ASSIGNED</span
          >
          <span
            v-else-if="item.ticket_status == 'PROGRESS '"
            class="primary--text"
            >PROGRESS
          </span>
          <span v-else class="green--text">{{ item.ticket_status }}</span>
        </template>
      </v-data-table>
    </v-card-text>
    <div v-if="componentCheck == 1">
      <ClaimTickets
        :rowInfo="rowInfo"
        :claimDialog="claimDialog"
        @clicked="claimDialog = false"
        v-on:onsuccess="on_success"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import ClaimTickets from "@/components/TicketManagement/AllDialogs/ClaimTickets.vue";
import { list_assigns_tickets } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    ClaimTickets,
  },
  data() {
    return {
      teamLoading: false,
      height: 0,
      fixed: false,
      componentCheck: 0,
      adminHeaders: [
        {
          text: "Ticket ID",
          value: "ticket_no_id",
          sortable: false,
        },
        {
          text: "User",
          value: "user_name",
          sortable: false,
        },

        {
          text: "Ticket Raised On",
          value: "ticket_raised_on",
          sortable: false,
        },
        {
          text: "Product/Services",
          value: "product_name",
          sortable: false,
        },
        {
          text: "Category Type",
          value: "categorie_name",
          sortable: false,
        },
        {
          text: "Assigned To",
          value: "ticket_assign_to",
          sortable: false,
        },
        {
          text: "Ticket Status",
          value: "ticket_status",
          sortable: false,
        },
      ],
      tableData: [],
      rowInfo: {},
      claimDialog: false,
      tableLoading: false,
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    this.fetch_raised_tickets();
  },
  methods: {
    handleClick(value) {
      // console.log(value);
      this.componentCheck = 1;
      this.rowInfo = value;
      this.claimDialog = true;
    },
    on_success() {
      this.fetch_raised_tickets();
    },
    async fetch_raised_tickets() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_assigns_tickets, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableData = [];
        var response = JSON.parse(result.data.list_assigns_tickets);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
        }

        // this.tableData = response;
      } catch (error) {
        this.tableLoading = false;
        // this.SnackBarComponent = {
        //   SnackbarVmodel: true,
        //   SnackbarColor: "red",
        //   SnackbarText: error.errors[0].message,
        //   timeout: 5000,
        //   Top: true,
        // };
      }
    },

    get_date(val) {
      return formatedatetime(val);
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
    },
  },
};
</script>
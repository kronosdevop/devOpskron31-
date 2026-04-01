<template>
  <div>
    <v-card flat >
      <v-toolbar flat >
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="date1"
              label="Select a Month"
              readonly
              dense
              v-bind="attrs"
              style="max-width: 200px"
              class="mr-3"
              outlined
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            :max="new Date().toISOString().substr(0, 10)"
            v-model="date"
            type="month"
            no-title
            color="primary white--text"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn
              text
              color="primary"
              @click="$refs.menu.save(date)"
              v-on:click="fetch_adminpaylist()"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
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
          class="elevation-1 dtwidth mt-n6"
          @click:row="handle_row_click"
        >
          <template v-slot:[`item.payslip_created_on`]="{ item }">
            <span>{{ fetch_value(item.payslip_created_on) }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              @click.stop="edit_data(item)"
              small
              color="primary"
              class="mr-2"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" small @click.stop="open_delete(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <EditPayslip
        :payslipedition="payslipedition"
        :rowInfo="rowInfo"
        @clicked="payslipedition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeletePayslip
        :payslipDeletion="payslipDeletion"
        :rowInfo="rowInfo"
        @clicked="payslipDeletion = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AdminPayslipview
        :payslipadmin="payslipadmin"
        @clicked="payslipadmin = false"
        :rowInfo="rowInfo"
      />
    </div>
  </div>
</template>

<script>
import { format_Date } from "@/JsonFiles/DateFormate.js";
import AdminPayslipview from "@/components/Payroll/PayrollPopus/AdminPayslipview.vue";
import DeletePayslip from "@/components/Payroll/PayrollPopus/DeletePayslip.vue";
import EditPayslip from "@/components/Payroll/PayrollPopus/EditPayslip.vue";
import { get_payslips } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    EditPayslip,
    DeletePayslip,
    AdminPayslipview,
  },
  data: () => ({
    fixed: true,
    payslipadmin: false,
    payslipedition: false,
    payslipDeletion: false,
    componentCheck: 0,
    tableLoading: false,
    SnackBarComponent: {},
    rowInfo: {},
    tableData: [],
    date1:
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
      " " +
      new Date().toISOString().split("T")[0].split("-")[0],
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    headers: [
      {
        text: "Name",
        value: "employee_name",
        sortable: false,
      },
      {
        text: "Generated On",
        value: "payslip_created_on",
        sortable: false,
      },

      { text: "Actions", value: "actions", sortable: false },
    ],
  }),
  async created() {
    await this.fetch_adminpaylist();
  },
  watch: {
    date(val) {
      this.date1 =
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(val.split("-")[1]) - 1] +
        " " +
        val.split("-")[0];
    },
  },
  methods: {
    handle_row_click(val) {
      this.componentCheck = 3;
      this.payslipadmin = true;

      this.rowInfo = val;
    },
    fetch_value(val) {
      if (val == undefined) {
        return "N/A";
      } else {
        return format_Date(val);
        // const d = new Date(parseInt(val) * 1000);
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
      }
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
      this.payslipedition = false;
      this.payslipDeletion = false;
      this.fetch_adminpaylist();
    },
    async fetch_adminpaylist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_payslips, {
            input: {
              organization_id: data.organization.organization_id,
              year: this.date.slice(0, 4),
              month: this.date.substring(5),
            },
          })
        );
        var response = JSON.parse(result.data.get_payslips);
        this.tableData = [];
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;

          this.tableLoading = false;
        } else {
          this.tableData = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableData = [];
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
    edit_data(item) {
      this.rowInfo = item;
      this.componentCheck = 1;
      this.payslipedition = true;
    },
    open_delete(item) {
      this.rowInfo = item;
      this.componentCheck = 2;
      this.payslipDeletion = true;
    },
  },
};
</script>

<style>
</style>
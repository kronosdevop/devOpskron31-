<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-data-table
          :headers="timeSheetHeaders"
          :fixed-header="fixed"
          :items="timeRecords"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="10"
          density="compact"
          v-model:options="pagination"
          @update:options="handle_pagination()"
          class="elevation-1 mt-2 dtwidth"
        >
          <template v-slot:[`item.timesheet_from_date`]="{ item }">
            <span v-text="fetch_value(item.timesheet_from_date)"></span>
          </template>
          <template v-slot:[`item.timesheet_to_date`]="{ item }">
            <span v-text="fetch_value(item.timesheet_to_date)"></span>
          </template>
          <template v-slot:[`item.timesheet_created_on`]="{ item }">
            <span v-text="get_date(item.timesheet_created_on)"></span>
          </template>
          <template v-slot:[`item.timesheet_status`]="{ item }">
            <span v-if="item.timesheet_status == 'APPROVED'">
              <span text class="text-green ml-n3"
                >APPROVED</span
              >
            </span>
            <span v-if="item.timesheet_status == 'INPROGRESS'">
              <span text class="text-orange ml-n3"
                >INPROGRESS</span
              >
            </span>
            <span v-if="item.timesheet_status == 'REJECTED'">
              <span text class="text-red ml-n3"
                >REJECTED</span
              >
            </span>
            <span v-if="item.timesheet_status == 'WITHDRAWN'">
              <span text class="text-primary ml-n3"
                >WITHDRAWN</span
              >
            </span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="red"
              small
              @click="open_approve(item)"
              v-if="item.timesheet_status == 'INPROGRESS'"
              >mdi-account-edit-outline</v-icon
            >
            <div v-else>-</div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <ReportsApprove
        :approveReporting="approveReporting"
        @clicked="approveReporting = false"
        :timesheetitems="timesheetitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ViewTimesheet
        :displaytimesheet="displaytimesheet"
        @clicked="displaytimesheet = false"
        :timesheetitems="timesheetitems"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

  <script>
import { formatdisplayDate, format_Date } from "@/JsonFiles/DateFormate.js";
import ViewTimesheet from "@/components/TimeSheets/PopUps/ViewTimesheet.vue";
import SnackBar from "@/components/SnackBar.vue";
import ReportsApprove from "@/components/TimeSheets/PopUps/ReportsApprove.vue";
import { list_timesheet } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    ReportsApprove,
    ViewTimesheet,
  },
  data() {
    return {
      dates: [],
      SnackBarComponent: {},
      displaytimesheet: false,
      menu: false,
      tableLoading: false,
      componentCheck: 0,
      timesheetitems: {},
      pagination: {
        itemsPerPage: 10,
        page: 1,
      },
      date: "",
      minDate: new Date().toISOString().split("T")[0],
      selectProject: "",
      selectActivity: "",
      workDuration: "",
      timeSheetHeaders: [
        {
          title : "From Date",
          key: "timesheet_from_date",
          sortable: false,
        },

        { title : "TO Date", key: "timesheet_to_date", sortable: false },
        {
          title : "Initiated By",
          key: "timesheet_created_by_name",
          sortable: false,
        },
        {
          title : "Initiated On",
          key: "timesheet_created_on",
          sortable: false,
        },
        { title : "Status", key: "timesheet_status", sortable: false },
        { title : "Actions", key: "actions", sortable: false },
      ],
      timeRecords: [],
      fixed: false,
      approveReporting: false,
      interval: {},
      value: 50,
      nextToken: null,
    };
  },
  computed: {
    dateRangeText() {
      return this.dates.join(" ~ ");
    },
  },
  async created() {
    await this.fetch_usertimelist();
  },
  methods: {
    handle_pagination() {
      if (this.nextToken) {
        this.fetch_usertimelist();
      }
    },
    handle_row_click(click ,val) {
      this.timesheetitems = val.item;
      if (val.timesheet_status != "INPROGRESS") {
        this.componentCheck = 2;
        this.displaytimesheet = true;
      }
    },
    fetch_value(val) {
      return formatdisplayDate(val);
    },
    get_date(val) {
      return format_Date(val);
      // const d = new Date(parseInt(val));
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
    open_approve(item) {
      // console.log(item)
      this.componentCheck = 1;
      this.approveReporting = true;
      this.timesheetitems = item;
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
      this.timeRecords = [];
      this.approveReporting = false;
      this.fetch_usertimelist();
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    edit_data() {},
    async fetch_usertimelist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_timesheet, {
            input: {
              user_id: data.user.user_id,
              action_type: "REPORTIES_TIMESHEET",
              limit: 11,
              nextToken: this.nextToken,
            },
          })
        );
        var response = JSON.parse(result.data.list_timesheet);

        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.nextToken = response.nextToken;
          // this.timeRecords = response.data;
          this.tableLoading = false;

          let array = this.timeRecords.concat(response.data);
          this.timeRecords = array;
          const uniqueArrayOfObjects = this.timeRecords.filter(
            (obj, index, self) =>
              index ===
              self.findIndex((o) => o.timesheet_id === obj.timesheet_id)
          );

          this.timeRecords = uniqueArrayOfObjects;
        } else {
          this.timeRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.timeRecords = [];

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
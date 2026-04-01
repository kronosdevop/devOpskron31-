<template>
  <div>
    <!-- eslint-disable -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-dialog
      :model-value="leaveCancelation"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-4">
            <div class="custom-title">Cancel Leave</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
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
            :items-per-page="200"
            hide-default-footer
            density="compact"
            class="elevation-1 mt-4 dtwidth"
          >
            <template v-slot:[`item.from_date`]="{ item }">
              <span v-text="get_date1(item.from_date)"></span>
            </template>
            <template v-slot:[`item.action`]="{ item }">
              <v-btn
                dark
                size="x-small"
                @click="cancel_data(item)"
                color="#ef3f6e"
                class="text-capitalize"
                >Cancel</v-btn
              >
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="cancelDialogue"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-card-title style="font-size: 15px" class="custom-title">
          Are you sure you want to cancel leave for
          {{ get_date1(rowInfo.from_date) }} ?
        </v-card-title>
        <v-card-text class="">
          <v-form ref="form">
            <v-textarea
              density="compact"
              class=""
              rows="1"
              auto-grow
              :rules="[(v) => !!v || 'required ']"
              variant="outlined"
              label="Reason for cancellation"
              v-model="requestCancellation"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="mt-n10">
          <v-spacer></v-spacer>
          <v-btn color="red" size="small" text @click="cancelDialogue = false">
            Close
          </v-btn>
          <v-btn
            color="green darken-1"
            :loading="loading2"
            text
            size="small"
            @click="validate_data()"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_presence_dashboard } from "@/graphql/queries.js";
import { request_cancel_leave } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { getData } from "@/mixins/AllQueries.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

import SnackBar from "@/components/SnackBar.vue";

export default {
  props: {
    leaveCancelation: Boolean,
    leavesArray: Array,
  },
  components: {
    SnackBar,
  },
  mixins: [getData],

  data() {
    return {
      tableLoading: false,
      tableData: [],
      loading2: false,
      fixed: true,
      rowInfo: {},
      requestCancellation: "",
      headers: [
        {
          title: "Applied  On",
          value: "from_date",
          sortable: true,
        },
        {
          title: "Action",
          value: "action",
          sortable: true,
        },
      ],
      confirmDialog: false,
      cancelDialogue: false,
      SnackBarComponent: {},
    };
  },

  watch: {
    leaveCancelation: {
      async handler() {
        if (this.leaveCancelation == true) {
          this.cancelDialogue = false;
          await this.fetch_leaves_report();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.cancel_leave_application();
      }
    },

    get_date1(val) {
      if (val != undefined) {
        var data = formatdisplayDate(val);
        return data;
      }
    },

    async fetch_leaves_report() {
      this.tableLoading = true;
      const variables = {
        input: {
          swipe_date: this.get_current_date(),
          swipe_month: this.get_month(),
        },
      };
      await this.fetchData(get_presence_dashboard, variables)
        .then(() => {
          var response = JSON.parse(
            this.queryResponse.data.get_presence_dashboard
          );

          if (response.Status == "SUCCESS") {
            this.tableLoading = false;
            this.tableData = [];
            var data = response.leave_dates;

            data.forEach((element) => {
              this.tableData.push({
                from_date: element,
              });
            });
          } else {
            this.tableData = [];
          }
        })

        .catch((error) => {});
    },

    cancel_data(data) {
      this.rowInfo = data;
      this.cancelDialogue = true;
    },

    async cancel_leave_application() {
      this.loading2 = true;

      try {
        let result = await API.graphql(
          graphqlOperation(request_cancel_leave, {
            input: {
              cancel_leave_date: this.rowInfo.from_date,
              cancel_leave_reason: this.requestCancellation,
            },
          })
        );

        var response = JSON.parse(result.data.request_cancel_leave);
        if (response.Status == "SUCCESS") {
          this.loading2 = false;
          this.cancelDialogue = false;
          this.requestCancellation = "";
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.fetch_leaves_report();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.loading2 = false;
        }
      } catch (error) {
        this.loading2 = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        this.loading2 = false;
      }
    },

    get_current_date() {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = String(currentDate.getFullYear());
      const formattedDate = `${day}-${month}-${year}`;
      return formattedDate;
    },

    get_month() {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = String(currentDate.getFullYear());
      const currentMonth = `${year}-${month}`;
      this.currentMonthCheck = currentMonth;
      return currentMonth;
    },
  },
};
</script>
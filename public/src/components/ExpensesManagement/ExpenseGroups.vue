<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat>
      <v-card-text class="ml-3">
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.expense_group_created_on`]="{ item }">
            <span class="caption">{{
              fetch_value(item.expense_group_created_on)
            }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small color="red" @click.stop="delete_item(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteExpenseGroup
        :rowInfo="rowInfo"
        :deleteGroup="deleteGroup"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        @clicked="deleteGroup = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/

import SnackBar from "@/components/SnackBar.vue";
import DeleteExpenseGroup from "@/components/ExpensesManagement/ExpensePopups/DeleteExpenseGroup.vue";
import { list_all_expense_group } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    DeleteExpenseGroup,
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      fixed: true,
      height: 0,
      headers: [
        { text: "Group Name", value: "expense_group_name", sortable: false },
        { text: "Group Head", value: "expense_group_head", sortable: false },
        {
          text: "Created By",
          value: "expense_group_created_by",
          sortable: false,
        },
        {
          text: "Created On",
          value: "expense_group_created_on",
          sortable: false,
        },

        { text: "Actions", value: "actions", sortable: false },
      ],
      SnackBarComponent: {},
      componentCheck: 0,
      rowInfo: {},
      deleteGroup: false,
    };
  },
  mounted() {
    this.height = window.innerHeight - 220;
    this.fetch_all_groups();
  },
  methods: {
    async fetch_all_groups() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_expense_group, {
            organization_id: data.organization.organization_id,
            nextToken: null,
            limit: 100,
            expense_group_status: "ACTIVE",
          })
        );

        this.tableLoading = false;
        var response = result.data.list_all_expense_group;
        this.tableData = response.details;
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

    delete_item(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.deleteGroup = true;
    },

    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deleteGroup = false;
      this.fetch_all_groups();
    },

    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>
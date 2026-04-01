<template>
  <div>
    <v-card flat >
      <!-- <v-toolbar flat dense>
        <v-spacer />
        <v-btn dark @click="add_admins()" class="text-capitalize cardCss"
          >Add</v-btn
        >
      </v-toolbar> -->
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :search="search"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="elevation-1 dtwidth mt-n2"
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-icon
              small
              color="red"
              class="ml-1"
              @click.stop="delete_admins(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AddAdminDialog
        :addDialog="addDialog"
        @clicked="addDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteAdmin
        :deleteDialog="deleteDialog"
        :rowInfo="rowInfo"
        @clicked="deleteDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */

import AddAdminDialog from "@/components/TicketManagement/AllDialogs/AddAdminDialog.vue";
import DeleteAdmin from "@/components/TicketManagement/AllDialogs/DeleteAdmin.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_products_admins } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    AddAdminDialog,
    DeleteAdmin,
    SnackBar,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      tableData: [],
      adminsinfo: {},
      tableLoading: false,
      addDialog: false,
      search: "",
      headers: [
        {
          text: "Admins",
          value: "user_email_id",
          sortable: false,
        },
        {
          text: "Action",
          value: "action",
          sortable: false,
        },
      ],
      componentCheck: 0,
      deleteDialog: false,
      rowInfo: {},
      SnackBarComponent: {},
    };
  },
  created() {
    this.height = window.innerHeight - 230;
    this.get_all_admins();
  },
  methods: {
    delete_admins(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.deleteDialog = true;
    },

    add_admins() {
      this.addDialog = true;
      this.componentCheck = 1;
    },

    async get_all_admins() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_products_admins, {
            product_id: this.$store.getters.Getproductitems.product_id,
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_products_admins);

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
      this.addDialog = false;
      this.deleteDialog = false;
      this.get_all_admins();
    },
    // get_all_admins(){
    //  list_products_admins
    // },
  },
};
</script>

<style>
</style>
<template>
  <div>
    <v-card flat>
      <v-toolbar class="mt-n1" flat dense>
        <v-spacer />
        <v-btn dark @click="add_territory()" class="text-capitalize cardCss">
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="territoryHeaders"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n2 dtwidth"
        >
          <!-- <template v-slot:[`item.asset_distributor_code`]="{ item }">
            <span>{{
              item.asset_distributor_code == null
                ? "-"
                : item.asset_distributor_code
            }}</span>
          </template> -->

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click="edit_territory(item)"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" small @click="open_deletedailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div v-if="componentCheck == 1">
      <AddingTerritory
        :createTerritoryDialog="createTerritoryDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="createTerritoryDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditTerritory
        :editTerritoryDialogue="editTerritoryDialogue"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editTerritoryDialogue = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteTerritory
        :deleteTerritoryDialogue="deleteTerritoryDialogue"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="deleteTerritoryDialogue = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import AddingTerritory from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/AddingTerritory.vue";
import EditTerritory from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/EditTerritory.vue";
import DeleteTerritory from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/DeleteTerritory.vue";
import { list_territories } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    AddingTerritory,
    SnackBar,
    EditTerritory,
    DeleteTerritory,
  },
  data() {
    return {
      territoryHeaders: [
        { text: "Name", value: "territory_name", sortable: false },
        { text: "Info", value: "territory_description", sortable: false },
        { text: "Manager", value: "territory_manager_name", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      createTerritoryDialog: false,
      SnackBarComponent: {},
      editTerritoryDialogue: false,
      rowInfo: {},
      deleteTerritoryDialogue: false,
    };
  },
  created() {
    this.fetch_territories();
  },
  methods: {
    add_territory() {
      this.componentCheck = 1;
      this.createTerritoryDialog = true;
    },
    edit_territory(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.editTerritoryDialogue = true;
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
      this.deleteTerritoryDialogue = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createTerritoryDialog = false;
      this.editTerritoryDialogue = false;
      this.deleteTerritoryDialogue = false;
      this.fetch_territories();
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

    async fetch_territories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_territories, {
            // product_name: "",
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_territories);
        this.tableLoading = false;
        this.tableData = response.Data;
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
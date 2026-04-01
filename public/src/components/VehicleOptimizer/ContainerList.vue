<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- :class="{ 'animated-card': isVisible }" -->
    <v-card  flat>
      <v-toolbar flat >
        <v-text-field
          class="mt-2"
          label="Search"
          dense
          outlined
          style="max-width: 200px"
          v-model="searchlist"
          append-icon="mdi-magnify"
        ></v-text-field>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="conatainerHeaders"
          :items="tableData"
          :search="searchlist"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          class="elevation-1 dtwidth mt-n4"
          dense
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              small
              color="primaryColor"
              @click.stop="edit_item(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              color="red"
              @click.stop="delete_item(item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 1">
      <EditContainerDialog
        :editContainerDialog = "editContainerDialog"
        :rowInfo="rowInfo"
        @clicked = "editContainerDialog = false"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteContainerDialog
        :deleteContainerDialog = "deleteContainerDialog"
        :rowInfo="rowInfo"
        @clicked = "deleteContainerDialog = false"
        v-on:success-Msg="success_info"
        v-on:error-Msg="error_info"
      />
    </div>
  </div>
</template>
  
  <script>
/* eslint-disable */
import { list_all_cargo_spaces } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EditContainerDialog from "./PopUpsDialogues/EditContainerDialog.vue";
import DeleteContainerDialog from "./PopUpsDialogues/DeleteContainerDialog.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    EditContainerDialog,
    DeleteContainerDialog,
  },

  data() {
    return {
      componentCheck: 0,
      search: "",
      fixed: true,
      searchlist: "",
      tableLoading: false,
      conatainerHeaders: [
        { text: "Name", value: "cargo_space_name", sortable: false },
        { text: "Type", value: "cargo_space_type", sortable: false },
        // { text: "Capacity", value: "no_of_employees_in_team", sortable: false },
        { text: "Length(mts)", value: "inner_length_in_mts", sortable: false },
        { text: "Width(mts)", value: "inner_width_in_mts", sortable: false },
        { text: "Height(mts)", value: "inner_height_in_mts", sortable: false }, 
        { text: "Weight(lb)", value: "max_load_in_lb", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      SnackBarComponent: {},
      tableData: [],
      editContainerDialog: false,
      rowInfo: {},
      deleteContainerDialog: false,
    };
  },
  async mounted() {
    await this.fetch_cargo_conatiners();
  },
  methods: {
    edit_item(item) {
      this.componentCheck = 1;
      this.editContainerDialog = true;
      this.rowInfo = item;
    },

    delete_item(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.deleteContainerDialog = true;
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deleteContainerDialog = false;
      this.editContainerDialog = false;
      await this.fetch_cargo_conatiners();
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

    async fetch_cargo_conatiners() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_cargo_spaces, {
            input: {},
          })
        );

        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_all_cargo_spaces);
        if (response.Status == "SUCCESS") {
            this.tableData = response.data;
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
  },
};
</script>
  
  <style>
</style>
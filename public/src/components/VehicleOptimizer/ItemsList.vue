<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
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
          :headers="ListHeaders"
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
            <v-icon small color="primaryColor" @click.stop="edit_item(item)">
              mdi-pencil
            </v-icon>
            <v-icon small color="red" @click.stop="delete_item(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <EditItemDialog
        :editItemDialog="editItemDialog"
        :rowInfo="rowInfo"
        @clicked="editItemDialog = false"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteItemDialog
        :deleteItemDialog="deleteItemDialog"
        :rowInfo="rowInfo"
        @clicked="deleteItemDialog = false"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
      />
    </div>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_all_cargo_items } from "@/graphql/queries.js";
import EditItemDialog from "./PopUpsDialogues/EditItemDialog.vue";
import DeleteItemDialog from "./PopUpsDialogues/DeleteItemDialog.vue";
export default {
  components: {
    SnackBar,
    EditItemDialog,
    DeleteItemDialog,
  },

  data() {
    return {
      componentCheck: 0,
      search: "",
      searchlist: "",
      tableLoading: false,
      SnackBarComponent: {},
      tableData: [],
      ListHeaders: [
        { text: "Name", value: "cargo_item_name", sortable: false },
        { text: "Length(mts)", value: "length_in_mts", sortable: false },
        { text: "Width(mts)", value: "width_in_mts", sortable: false },
        { text: "Height(mts)", value: "height_in_mts", sortable: false },
        { text: "Load(lb)", value: "max_load_in_lb", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      editItemDialog: false,
      rowInfo: {},
      deleteItemDialog: false,
    };
  },

  async mounted() {
    await this.fetch_cargo_list();
  },

  methods: {
    edit_item(item) {
      this.componentCheck = 1;
      this.editItemDialog = true;

      this.rowInfo = item;
    },

    delete_item(item) {
      this.componentCheck = 2;
      this.deleteItemDialog = true;

      this.rowInfo = item;
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deleteItemDialog = false;
      this.editItemDialog = false;
      await this.fetch_cargo_list();
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
    async fetch_cargo_list() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_cargo_items, {
            input: {},
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_all_cargo_items);

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
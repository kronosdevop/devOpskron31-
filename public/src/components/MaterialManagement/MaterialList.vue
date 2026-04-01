<template>
  <div>
    <v-card flat>
      <v-toolbar class="" flat dense>
        <v-spacer />
        <v-btn dark @click="create_material()" class="text-capitalize cardCss">
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="materialHeaders"
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
          <template v-slot:[`item.supplier_name`]="{ item }">
            <div>
              {{ item.supplier_name == undefined ? "-" : item.supplier_name }}
            </div>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click="edit_material(item)"
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
      <CreateMaterial
        :materialcreation="materialcreation"
        @clicked="materialcreation = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditMaterial
        :materialedition="materialedition"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="materialedition = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteMaterial
        :materialdeletion="materialdeletion"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="materialdeletion = false"
      />
    </div>
  </div>
</template>
        <script>
/*eslint-disable*/

import EditMaterial from "@/components/MaterialManagement/Popups/EditMaterial.vue";
import DeleteMaterial from "@/components/MaterialManagement/Popups/DeleteMaterial.vue";
import { create_list_edit_delete_material } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import CreateMaterial from "@/components/MaterialManagement/Popups/CreateMaterial.vue";
export default {
  components: {
    SnackBar,
    EditMaterial,
    DeleteMaterial,
    CreateMaterial,
  },
  data() {
    return {
      materialHeaders: [
        { text: "Materials", value: "material_name", sortable: false },
        { text: "Units", value: "materialUnitNames", sortable: false },
        { text: "Supplier", value: "suppliers", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      SnackBarComponent: {},
      materialcreation: false,
      materialedition: false,
      rowInfo: {},
      materialdeletion: false,
    };
  },
  created() {
    this.fetch_materials();
  },
  methods: {
    create_material() {
      this.componentCheck = 1;
      this.materialcreation = true;
    },
    edit_material(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.materialedition = true;
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
      this.materialdeletion = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tableData = [];
      this.materialedition = false;
      this.materialdeletion = false;
      this.materialcreation = false;
      this.fetch_materials();
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

    async fetch_materials() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_material, {
            input: {
              action_type: "LIST_MATERIAL",
              organization_id: data.organization.organization_id,
            },
            // product_name: "",
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.create_list_edit_delete_material);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
          this.tableData = [];
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
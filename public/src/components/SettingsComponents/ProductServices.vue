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
          :height="height"
          :headers="productHeaders"
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
          <template v-slot:[`item.product_logo_url`]="{ item }">
            <div
              v-if="
                item.product_logo_url != 'N/A' && item.product_logo_url != ''
              "
              class="caption"
            >
              <v-avatar tile class="mt-1 mb-1">
                <v-img :src="item.product_logo_url" />
              </v-avatar>
            </div>
            <div v-else>
              <v-avatar size="34" class="mt-1 mb-1" color="primaryColor">
                <span class="white--text">
                  {{ item.product_name.substring(0, 1) }}</span
                >
              </v-avatar>
            </div>
          </template>
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
      <AddProduct
        :createProductDialog="createProductDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="createProductDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditProduct
        :editProductDialogue="editProductDialogue"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editProductDialogue = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteProduct
        :deleteProductDialogue="deleteProductDialogue"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="deleteProductDialogue = false"
      />
    </div>
  </div>
</template>
      <script>
/*eslint-disable*/
import AddProduct from "@/components/SettingsDialogs/AddProduct.vue";
import EditProduct from "@/components/SettingsDialogs/EditProduct.vue";
import DeleteProduct from "@/components/SettingsDialogs/DeleteProduct.vue";
import { create_list_edit_delete_products } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    AddProduct,
    SnackBar,
    EditProduct,
    DeleteProduct,
  },
  data() {
    return {
      productHeaders: [
        { text: "Logo", value: "product_logo_url", sortable: false },
        { text: "Name", value: "product_name", sortable: false },
        { text: "Description", value: "product_description", sortable: false },
        { text: "URL", value: "product_link", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      createProductDialog: false,
      SnackBarComponent: {},
      editProductDialogue: false,
      rowInfo: {},
      deleteProductDialogue: false,
      height: 0,
    };
  },
  created() {
    this.fetch_territories();
    this.height = window.innerHeight - 310;
  },
  methods: {
    add_territory() {
      this.componentCheck = 1;
      this.createProductDialog = true;
    },
    edit_territory(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.editProductDialogue = true;
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
      this.deleteProductDialogue = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createProductDialog = false;
      this.editProductDialogue = false;
      this.deleteProductDialogue = false;
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
          graphqlOperation(create_list_edit_delete_products, {
            input: {
              action_type: "LIST_PRODUCT",
              // organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
            // product_name: "",
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.create_list_edit_delete_products);
        this.tableLoading = false;
        this.tableData = response.data;
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
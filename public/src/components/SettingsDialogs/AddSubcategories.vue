<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="categoriessubAddition" @update:model-value="$emit('update:categoriessubAddition', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Add Items for {{ rowInfo.category_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters>
              <v-text-field
                dense
                v-model="categoriesName"
                label="Name*"
                :rules="[(v) => !!v || 'required ']"
                class="mr-2"
                style="max-width: 200px"
                outlined
              ></v-text-field>
              <v-text-field
                dense
                v-model="categoriestax"
                label="Tax Percentage*"
                type="number"
                :rules="[(v) => !!v || 'required ']"
                class="mr-2"
                style="max-width: 150px"
                outlined
                @keypress="is_number($event)"
                v-on:paste="process($event)"
              ></v-text-field>
              <v-text-field
                dense
                v-model="categoriesPrice"
                label="Price*"
                :rules="[(v) => !!v || 'required ']"
                class="mr-2"
                style="max-width: 180px"
                outlined
                @keypress="is_number($event)"
                v-on:paste="process($event)"
              ></v-text-field>
              <v-btn
                @click="validate_data()"
                class="mx-2"
                :loading="loading"
                dark
                small
                color="primaryColor"
              >
                Add
              </v-btn>
            </v-row>
          </v-form>

          <v-data-table
            :headers="headers"
            :fixed-header="fixed"
            :items="selectedSubCategory"
            :loading="tableLoading"
            :items-per-page="500"
            hide-default-footer
            dense
            class="my-custom-table elevation-1 dtwidth"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon color="colorPrimary" small @click="open_edit_dailog(item)"
                >mdi-pencil</v-icon
              >
              <v-icon color="red" class="ml-2" small @click="delete_data(item)"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <EditSubcategories
        :categoriessubEddition="categoriessubEddition"
        @clicked="categoriessubEddition = false"
        :categoriesItem="categoriesItem"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
    
    <script>
/*eslint-disable*/
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import EditSubcategories from "@/components/SettingsDialogs/EditSubcategories.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  props: {
    categoriessubAddition: Boolean,
    rowInfo: Object,
  },
  components: {
    EditSubcategories,
    SnackBar,
  },
  mixins: [get_sub_categories],

  data() {
    return {
      categoriesName: "",
      categoriestax: "",
      categoriesPrice: "",
      loading: false,

      selectedSubCategory: [],
      selectsub: "",
      loading2: false,
      headers: [
        { text: "Name", value: "text", sortable: false },
        { text: "Tax (%)", value: "sub_category_tax", sortable: false },
        { text: "Price (INR)", value: "sub_category_price", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      tableLoading: false,
      fixed: true,
      componentCheck: 0,
      categoriessubEddition: false,
      categoriesItem: {},
      SnackBarComponent: {},
    };
  },

  watch: {
    categoriessubAddition: {
      async handler() {
        if (this.categoriessubAddition == true) {
          this.selectedSubCategory = [];
          this.tableLoading = true;
          this.categoriestax = this.rowInfo.category_tax;

          await this.get_sub_categories();
          this.tableLoading = false;
          this.fetch_sub_data();
        }
      },
      immediate: true,
    },
  },

  methods: {
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    fetch_sub_data() {
      var filteredArray = this.MasterSubCategories.filter(
        (obj) => obj.category_id === this.rowInfo.category_id
      );
      filteredArray.forEach((element) => {
        this.selectedSubCategory.push({
          text: element.sub_category_name,
          value: element.sub_category_id,
          sub_category_price: element.sub_category_price,
          sub_category_tax: element.sub_category_tax,
        });
      });
    },

    open_edit_dailog(item) {
      this.componentCheck = 1;
      this.categoriessubEddition = true;
      this.categoriesItem = item;
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.selectedSubCategory = [];
      this.categoriessubEddition = false;
      await this.get_sub_categories();
      this.tableLoading = false;
      this.fetch_sub_data();
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

    delete_data(item) {
      this.selectsub = item.value;
      this.loading2 = true;
      this.add_mutation("DELETE");
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.categoriesName = "";
      // this.$refs.form.reset();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.add_mutation("CREATE");
      }
    },

    async add_mutation(value) {
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              category_id:
                value == "CREATE" ? this.rowInfo.category_id : undefined,
              sub_category_name:
                value == "CREATE" ? this.categoriesName : undefined,
              sub_category_id: value == "DELETE" ? this.selectsub : undefined,
              sub_category_tax:
                value == "CREATE" ? this.categoriestax : undefined,
              sub_category_price:
                value == "CREATE" ? this.categoriesPrice : undefined,
              action_type: value,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.quotation_sub_categories);
        this.loading2 = false;
        if (response.Status == "SUCCESS") {
          this.selectedSubCategory = [];
          this.tableLoading = true;
          await this.get_sub_categories();
          this.tableLoading = false;
          this.fetch_sub_data();
          this.$emit("successMsg", response.Message);

          // this.$refs.form.reset();

          this.categoriesName = "";
          this.$refs.form.resetValidation();

          // this.$emit("updaterefesh", "update");
        } else {
          this.loading = false;
          this.loading2 = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.loading2 = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
    
    
  <style scoped>
.my-custom-table .v-data-table__wrapper > table > thead > tr > th {
  font-size: 12px !important; /* Custom font size */
  color: rgb(0, 0, 0) !important; /* Custom color */
  background-color: #ffff !important; /* Optional: Make background transparent */
}

.my-custom-table .v-data-table__wrapper > table > tbody > tr {
  border: 1px solid #e0e0e0; /* Example row border */
}
</style>
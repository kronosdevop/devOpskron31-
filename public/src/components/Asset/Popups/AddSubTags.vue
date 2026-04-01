<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="addSubTagDialog"
      @update:model-value="addSubTagDialog = $event"
      persistent
      max-width="700"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text-white ml-2">
            <div class="custom-title text-white">
              Add Sub tags for {{ rowInfo.tag_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon color="white" class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters>
              <v-text-field
                v-model="subtagName"
                label="Sub Type*"
                :rules="[(v) => !!v || 'required ']"
                class="mr-2"
                style="max-width: 250px"
                density="compact"
                variant="outlined"
              ></v-text-field>

              <v-btn
                @click="validate_data()"
                class="mx-2 text-white"
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
            :items="subTagData"
            :loading="tableLoading"
            :items-per-page="500"
            hide-default-footer
            density="compact"
            class="my-custom-table elevation-1 dtwidth"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <!-- <v-icon color="colorPrimary" small @click="open_edit_dailog(item)"
                >mdi-pencil</v-icon
              > -->
              <v-icon color="red" class="ml-2" small @click="delete_data(item)"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- <div v-if="componentCheck == 1">
      <EditSubcategories
        :categoriessubEddition="categoriessubEddition"
        @clicked="categoriessubEddition = false"
        :categoriesItem="categoriesItem"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div> -->
  </div>
</template>
  
  <script>
/*eslint-disable*/
import { create_list_delete_sub_tags } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import EditSubcategories from "@/components/Asset/Popups/EditSubcategories.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  props: {
    addSubTagDialog: Boolean,
    rowInfo: Object,
  },
  components: {
    EditSubcategories,
    SnackBar,
  },

  data() {
    return {
      subtagName: "",
      fixed: false,
      SnackBarComponent: {},
      headers: [
        {
          title: "Types",
          key: "sub_tag_name",
          sortable: false,
        },
        {
          title: "Actions",
          key: "actions",
          sortable: false,
        },
      ],
      subTagData: [],
      tableLoading: false,
      deleteItem: {},
    };
  },

  watch: {
    addSubTagDialog: {
      async handler() {
        if (this.addSubTagDialog == true) {
          // console.log(this.rowInfo, "rowInfo");

          await this.fetch_ssub_tags("LIST");
          this.tableLoading = false;
          //   this.fetch_sub_data();
        }
      },
      immediate: true,
    },
  },

  methods: {
    async fetch_ssub_tags(value) {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_delete_sub_tags, {
            input: {
              user_email_id: data.user.user_email_id,
              sub_tag_name: value == "CREATE" ? this.subtagName : undefined,
              action_type: value,
              tag_id: this.rowInfo.tag_id,
              sub_tag_id:
                value == "DELETE" ? this.deleteItem.sub_tag_id : undefined,
              sub_tag_status: value == "DELETE" ? "DEACTIVE" : undefined,
            },
          })
        );

        var response = JSON.parse(result.data.create_list_delete_sub_tags);
        this.tableLoading = false;
        this.loading = false;
        this.subTagData = [];
        if (response.Status == "SUCCESS") {
          if (value == "CREATE" || value == "DELETE") {
            this.tableLoading = false;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.loading = false;
            this.$refs.form.reset();
            this.subtagName = "";
            this.fetch_ssub_tags("LIST");
          } else if (value == "LIST") {
            this.tableLoading = false;
            this.subTagData = response.data;
          }
          // this.$emit("updaterefesh", "update");
        } else {
          this.tableLoading = false;
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.tableLoading = false;
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
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
      await this.get_asset_sub_categories();
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

    async delete_data(item) {
      this.deleteItem = item;
      await this.fetch_ssub_tags("DELETE");
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.categoryPrefix = "";
      this.categoriesName = "";
      // this.$refs.form.reset();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.fetch_ssub_tags("CREATE");
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
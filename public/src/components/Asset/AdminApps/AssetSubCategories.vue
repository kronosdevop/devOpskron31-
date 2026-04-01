<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-data-table
          :headers="categoriesHeaders"
          :fixed-header="fixed"
          :items="categoriesRecords"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          density="compact"
          class="elevation-1 mt-2 dtwidth"
        >
          <template v-slot:[`item.sub_category_description`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  {{
                    item.sub_category_description.length >= 10
                      ? item.sub_category_description.substr(0, 10) + "..."
                      : item.sub_category_description
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.sub_category_description }}
              </div>
            </v-tooltip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click="open_editDailog(item)"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" small @click="open_deleteDailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteSubcategories
        :categoriessubdeletion="categoriessubdeletion"
        @clicked="categoriessubdeletion = false"
        :categoriesItem="categoriesItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditSubcategories
        :categoriessubEddition="categoriessubEddition"
        @clicked="categoriessubEddition = false"
        :categoriesItem="categoriesItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    <script>
import EditSubcategories from "@/components/Asset/Popups/EditSubcategories.vue";
import SnackBar from "@/components/SnackBar.vue";
import DeleteSubcategories from "@/components/Asset/Popups/DeleteSubcategories.vue";
import { asset_sub_category } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    DeleteSubcategories,
    EditSubcategories,
  },
  data() {
    return {
      SnackBarComponent: {},
      categoriessubEddition: false,
      categoriessubdeletion: false,
      tableLoading: false,
      componentCheck: 0,
      categoriesItem: {},
      categoriesHeaders: [
        {
          title: "Prefix",
          key: "sub_category_prefix",
          sortable: false,
        },
        {
          title: "Sub Category Name",
          key: "sub_category_name",
          sortable: false,
        },
        { title: "Category Name", key: "category_name", sortable: false },

        // {
        //   title: "Description",
        //   key: "sub_category_description",
        //   sortable: false,
        // },
        {
          title: "Depreciation(%)",
          key: "sub_category_depriciation",
          sortable: false,
        },
        {
          title: "Created By",
          key: "sub_category_created_by_name",
          sortable: false,
        },

        { title: "Actions", key: "actions", sortable: false },
      ],
      categoriesRecords: [],
      fixed: false,
    };
  },
  computed: {},
  async created() {
    await this.fetch_subcategories();
  },
  methods: {
    open_editDailog(item) {
      this.categoriesItem = item;
      this.componentCheck = 2;
      this.categoriessubEddition = true;
    },
    open_deleteDailog(item) {
      this.categoriesItem = item;
      this.componentCheck = 1;
      this.categoriessubdeletion = true;
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
      this.categoriessubdeletion = false;
      this.categoriessubEddition = false;

      this.fetch_subcategories();
    },

    async fetch_subcategories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_sub_category, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_SUBCATEGORY",
            },
          })
        );
        var response = JSON.parse(result.data.asset_sub_category);
        this.categoriesRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.categoriesRecords = response.data;
          this.tableLoading = false;
        } else {
          this.categoriesRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.categoriesRecords = [];

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
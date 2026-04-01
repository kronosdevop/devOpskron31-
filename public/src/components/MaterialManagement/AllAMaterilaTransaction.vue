<template>
  <div>
    <v-card class="mt-2" flat >
      <v-toolbar flat >
        <v-select
          dense
          :items="materialitems"
          v-model="materialName"
          item-text="text"
          item-value="value"
          label="Filter by Materials "
          style="max-width: 200px"
          class="mr-2"
          outlined
        />
        <v-select
          outlined
          dense
          v-model="locations"
          style="max-width: 200px"
          class="mr-2"
          label="Filter by Project Site"
          :items="locationitems"
          item-text="text"
          item-value="vlaue"
        />
        <v-select
          outlined
          dense
          v-model="materialStatus"
          class="mr-2"
          style="max-width: 200px"
          label="Filter by Status "
          :items="Statusitems"
          item-text="text"
          item-value="value"
        />
        <v-select
          outlined
          dense
          v-model="unitName"
          style="max-width: 200px"
          label="Filter by Unit "
          :items="unititems"
          item-text="text"
          item-value="value"
        />
        <v-autocomplete
          dense
          v-model="userFilter"
          style="max-width: 200px"
          label="Select User"
          :rules="[(v) => !!v || 'required ']"
          outlined
          class="ml-2"
          item-text="full_user_name"
          item-value="user_email_id"
          :items="userItems"
          :search-input.sync="searchF"
          hide-no-data
          placeholder="Min 3 Character"
        >
        </v-autocomplete>
        <v-btn
          dark
          class="text-capitalize cardCss ml-2 mt-n6"
          :loading="goLoading"
          @click="get_data()"
          >Go</v-btn
        >
        <v-btn
          dark
          class="text-capitalize cardCss ml-2 mt-n6"
          :loading="clearData"
          @click="clear_data()"
          >Clear</v-btn
        >
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
          @update:options="get_logs_Pagination()"
          class="elevation-1 mt-n4 dtwidth"
        >
          <template v-slot:[`item.material_consumption_timestamp`]="{ item }">
            <span>{{ fetch_value(item.material_consumption_timestamp) }}</span>
          </template>
          <template v-slot:[`item.stock_credit`]="{ item }">
            <span class="green--text" v-if="item.stock_credit">
              {{ item.stock_credit }}</span
            >
            <span class="red--text" v-else>{{ item.stock_debit }}</span>
          </template>
          <!-- <template v-slot:[`item.material_name`]="{ item }">
            <span>{{
              item.material_name + " " + "(" + item.material_unit + ")" + " "
            }}</span>
          </template> -->
          <template v-slot:[`item.stock_debit`]="{ item }">
            <span>{{ item.stock_debit == "" ? "-" : item.stock_debit }}</span>
          </template>

          <template v-slot:[`item.user_email_id`]="{ item }">
            <span>{{ fetch_user_name(item.user_email_id) }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { Material_Dispatch_Consumption_Logs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_material_list } from "@/mixins/GetMaterial";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";

export default {
  mixins: [
    get_material_list,
    get_location_details,
    get_all_org_users,
    get_material_unit,
  ],
  components: {
    SnackBar,
  },
  data() {
    return {
      fixed: true,
      materialName: "ALL",
      goLoading: false,
      clearData: false,
      locationitems: [],
      locations: "ALL",
      materialitems: [],
      materialStatus: "ALL",
      next_token: null,

      Statusitems: [
        { text: "ALL", value: "ALL" },
        { text: "Added", value: "ADDED" },
        { text: "Reverted", value: "REVERTED" },
        { text: "Consumed", value: "CONSUMED" },
      ],
      tableData: [],
      unititems: [],
      unitName: "ALL",
      SnackBarComponent: {},
      tableLoading: false,
      userItems: [],
      materialHeaders: [
        {
          text: "Action Taken On",
          value: "material_consumption_timestamp",
          sortable: true,
        },
        { text: "Project Site", value: "location_name", sortable: false },

        { text: "Materials", value: "material_name", sortable: false },
        { text: "Unit", value: "material_unit", sortable: false },

        {
          text: "Added/Consumed",
          value: "stock_credit",
          sortable: false,
        },
        // { text: "Stock Consumed", value: "stock_debit", sortable: false },
        {
          text: "Current Stock",
          value: "remaining_stock",
          sortable: false,
        },
        {
          text: "Acted By",
          value: "user_email_id",
          sortable: false,
        },
        // {
        //   text: " Consumption Comments",
        //   value: "material_consumption_comments",
        //   sortable: false,
        // },
      ],
      userFilter: "ALL",
      searchF: "",
    };
  },
  async mounted() {
    this.$store.commit("Setnamesearch", "");

    await Promise.all([
      this.get_all_org_users(),
      this.fetch_materials(),
      this.get_location_details(),
      this.get_material_unit(),
      this.get_material_list(),
    ]);
    this.fetch_details();
  },
  methods: {
    fetch_value(val) {
      return formatedatetime(val);
    },
    async get_data() {
      this.goLoading = true;
      this.tableData = [];

      this.fetch_materials();
    },

    get_logs_Pagination() {
      if (this.next_token) {
        // this.tableData = [];
        this.fetch_materials();
      }
    },
    fetch_user_name(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });

      return name;
    },

    async clear_data() {
      this.materialName = "ALL";
      this.locations = "ALL";
      this.unitName = "ALL";
      this.materialStatus = "ALL";
      this.userFilter = "ALL";
      this.clearData = true;
      this.tableData = [];
      this.next_token = null;
      this.fetch_materials();
    },

    fetch_details() {
      this.userItems = [];
      this.unititems.push({
        text: "All",
        value: "ALL",
      });
      this.unitmaterials.forEach((element) => {
        this.unititems.push({
          text: element.material_unit_name,
          value: element.material_unit_id,
        });
      });
      this.materialitems.push({
        text: "All",
        value: "ALL",
      });
      this.materialList.forEach((element) => {
        this.materialitems.push({
          text: element.material_name,
          value: element.material_id,
        });
      });

      var loaction = this.locationList;
      loaction = loaction.filter(
        (obj) =>
          obj.location_type === "PROJECT SITE" ||
          obj.location_type === "WAREHOUSE"
      );
      this.locationitems.push({
        text: "All",
        vlaue: "ALL",
      });
      loaction.forEach((element) => {
        this.locationitems.push({
          text: element.location_name,
          vlaue: element.location_id,
        });
      });

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userItems.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
          });
        }
      });
      this.userItems.unshift({
        full_user_name: "ALL",
        user_email_id: "ALL",
      });
    },
    async fetch_materials() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(Material_Dispatch_Consumption_Logs, {
            input: {
              location_id: this.locations,
              material_id: this.materialName,
              material_unit_id: this.unitName,
              material_consumption_type: this.materialStatus,
              user_email_id:
                this.userFilter == "ALL" ? undefined : this.userFilter,
              Limit: 101,
              nextToken: this.next_token,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(
          result.data.Material_Dispatch_Consumption_Logs
        );
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.goLoading = false;
          this.clearData = false;
          // this.tableData = response.data;
          this.next_token = response.nextToken;
          let array = this.tableData.concat(response.data);
          this.tableData = array;

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.log_id === obj.log_id)
          );
          this.tableData = uniqueArrayOfObjects;
        } else {
          this.tableLoading = false;
          this.goLoading = false;
          this.clearData = false;
          this.tableData = [];
        }
      } catch (error) {
        this.tableLoading = false;
        this.goLoading = false;
        this.clearData = false;
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
<template>
  <div>
    <v-card flat>
      <v-toolbar flat>
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
          label="Filter by Locations"
          :items="locationitems"
          item-text="text"
          item-value="vlaue"
        />
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
          :headers="stockHeaders"
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
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_material_list } from "@/mixins/GetMaterial";
// import { List_Dispatched_Stock } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_material_list, get_location_details],
  data() {
    return {
      fixed: true,
      SnackBarComponent: {},

      goLoading: false,
      clearData: false,

      materialName: "ALL",

      locationitems: [],
      locations: "ALL",
      materialitems: [],
      tableLoading: false,
      tableData: [],
      stockHeaders: [
        { text: "Material", value: "material_name", sortable: false },
        { text: "Units", value: "material_unit", sortable: false },
        { text: "Quantity", value: "material_quantity", sortable: false },
        { text: "Location", value: "location_name", sortable: false },
      ],
    };
  },
  async mounted() {
    await Promise.all([
      this.get_location_details(),
      this.get_material_list(),
      this.fetch_stock(),
    ]);

    this.fetch_details();
  },
  methods: {
    async get_data() {
      this.goLoading = true;
      this.tableData = [];

      this.fetch_stock();
    },
    async clear_data() {
      this.materialName = "ALL";
      this.locations = "ALL";
      this.clearData = true;
      this.tableData = [];

      this.fetch_stock();
    },
    fetch_details() {
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

      loaction.forEach((element) => {
        this.locationitems.push({
          text: element.location_name,
          vlaue: element.location_id,
        });
      });
      this.locationitems.push({
        text: "All",
        vlaue: "ALL",
      });
    },
    async fetch_stock() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(List_Dispatched_Stock, {
            input: {
              material_id: this.materialName,
              location_id: this.locations,
            },
          })
        );
        this.goLoading = false;
        this.clearData = false;
        this.tableLoading = false;
        var response = JSON.parse(result.data.List_Dispatched_Stock);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.goLoading = false;
          this.clearData = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
          this.goLoading = false;
          this.clearData = false;
          this.tableData = [];
        }
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
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
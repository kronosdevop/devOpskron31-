<template>
  <div>
    <v-card flat>
      <v-toolbar class="" dense flat>
        <v-spacer />
        <v-btn
          @click="create_location"
          :loading="loading"
          dark
          class="text-capitalize cardCss button-corner mt-9 ml-4"
        >
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-n3">
        <!-- <v-row no-gutters>
          <v-radio-group
            class=""
            v-model="locationSettting"
            row
            @change="on_location_setting_change"
          >
            <v-radio
              label="Use Default Locations"
              value="defaultLocation"
            ></v-radio>
            <v-radio
              label="Create Custom Locations"
              value="customLocation"
            ></v-radio>
          </v-radio-group>
          <v-spacer />
          <v-btn
            @click="create_location"
            v-show="locationSettting == 'customLocation'"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner mt-9 ml-4"
          >
            Create Location
          </v-btn>
        </v-row> -->
        <v-data-table
          :headers="assetHeaders"
          :fixed-header="fixed"
          :items="assetLocation"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          density="compact"
          item-key="location_id"
          class="elevation-1 dtwidth"
        >
          <!-- @click:row="handle_row_click" -->
          <!-- <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click.stop="delete_asset(item)"
              >mdi-delete</v-icon
            >
          </template> -->
          <template v-slot:[`item.geo_location`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click.stop="view_maps(item)"
              >mdi-google-maps</v-icon
            >
          </template>
          <template v-slot:[`item.asset_location_type`]="{ item }">
            <span>{{
              item.asset_location_type == "MAIN_LOCATION"
                ? "Internal Location"
                : item.asset_location_type
            }}</span>
          </template>
          <template v-slot:[`item.asset_location_address`]="{ item }">
            <span>{{
              item.asset_location_address != undefined
                ? item.asset_location_address
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.asset_location_pincode`]="{ item }">
            <span>{{
              item.asset_location_pincode != undefined ||
              item.asset_location_pincode != null
                ? item.asset_location_pincode == 0
                  ? "-"
                  : item.asset_location_pincode
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.asset_location_country`]="{ item }">
            <span>{{
              item.asset_location_country != undefined
                ? item.asset_location_country
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.asset_location_state`]="{ item }">
            <span>{{
              item.asset_location_state != undefined
                ? item.asset_location_state
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.territory_name`]="{ item }">
            <span>{{
              item.territory_name != undefined ? item.territory_name : "-"
            }}</span>
          </template>

          <template v-slot:[`item.asset_location_district`]="{ item }">
            <span>{{
              item.asset_location_district != undefined
                ? item.asset_location_district
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              v-show="item.asset_location_type != 'MAIN_LOCATION'"
              small
              class="ml-1"
              color="gray"
              @click="edit_location(item)"
              >mdi-pencil</v-icon
            >
            <v-icon
              v-show="item.asset_location_type != 'MAIN_LOCATION'"
              small
              class="ml-1"
              color="red"
              @click="delete_user_items(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <!-- <AssetLocationCreation
        :addAssetLocationDialog="addAssetLocationDialog"
        @clicked="addAssetLocationDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:recallcomponent="location_refresh"
      /> -->
      <AssetLocationCreation
        :addAssetLocationDialog="addAssetLocationDialog"
        @clicked="addAssetLocationDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <LocationsMapView
        :locationMapDialog="locationMapDialog"
        :rowInfo="rowInfo"
        @clicked="locationMapDialog = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteAssetLoc
        :deleteDialog="deleteDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deleteDialog = false"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentCheck == 4">
      <EditAssetloc
        :locationViewDialog="locationViewDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="locationViewDialog = false"
        :rowInfo="rowInfo"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/

import SnackBar from "@/components/SnackBar.vue";
import AssetLocationCreation from "@/components/Asset/Popups/AssetLocationCreation.vue";
import DeleteAssetLoc from "@/components/Asset/Popups/DeleteAssetLoc.vue";
import LocationsMapView from "@/components/Asset/Popups/LocationsMapView.vue";
import { asset_config_create_list_update_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import { get_location_details } from "@/mixins/GetLocations.js";
import EditAssetloc from "@/components/Asset/Popups/EditAssetloc.vue";
export default {
  components: {
    SnackBar,
    AssetLocationCreation,
    DeleteAssetLoc,
    LocationsMapView,
    EditAssetloc,
  },
  mixins: [get_location_details],
  data() {
    return {
      locationSettting: null,
      loading: false,
      componentCheck: 0,
      addAssetLocationDialog: false,
      SnackBarComponent: {},
      tableLoading: false,
      locationViewDialog: false,
      assetLocation: [],

      fixed: true,
      tableLoading: false,
      deleteLocDialog: false,
      rowInfo: {},
      locationMapDialog: false,
      showActions: false,
      deleteDialog: false,
      assetHeaders: [
        {
          title: "Location Name",
          key: "asset_location_name",
          sortable: false,
        },
        {
          title: "Location Type",
          key: "asset_location_type",
          sortable: false,
        },
        {
          title: "Territory",
          key: "territory_name",
          sortable: false,
        },

        {
          title: "Geo Location",
          key: "geo_location",
          sortable: false,
        },
        {
          title: "Address",
          key: "asset_location_address",
          sortable: false,
        },
        {
          title: "Pincode",
          key: "asset_location_pincode",
          sortable: false,
        },
        {
          title: "Country",
          key: "asset_location_country",
          sortable: false,
        },
        {
          title: "State",
          key: "asset_location_state",
          sortable: false,
        },
        {
          title: "District",
          key: "asset_location_district",
          sortable: false,
        },
        {
          title: "Actions",
          key: "actions",
          sortable: false,
        },
      ],
    };
  },
  // computed: {
  //   filteredAssetHeaders() {

  //     if (this.showActions) {
  //       headers.push({
  //         text: "Actions",
  //         value: "actions",
  //         sortable: false,
  //       });
  //     }

  //     return headers;
  //   },
  // },
  async created() {
    var data = this.$store.getters.GetOrgDetails;
    this.assetLocation = [];
    this.locationSettting =
      data.organization.is_asset_location_configured == false
        ? "defaultLocation"
        : "customLocation";
    this.showActions = data.organization.is_asset_location_configured;
    if (this.locationSettting == "customLocation") {
      this.tableLoading = true;
      await this.fetch_asset_locations("LIST");
    } else {
      this.tableLoading = true;
      await this.get_location_details();
      this.fetch_default_org_locs();
      //   this.
    }
  },
  methods: {
    edit_location(item) {
      this.componentCheck = 4;
      this.rowInfo = item;
      // console.log(this.rowInfo, "  this.rowInfo");
      this.locationViewDialog = true;
    },
    delete_user_items(item) {
      this.rowInfo = item;
      this.componentCheck = 3;
      this.deleteDialog = true;
    },
    view_maps(item) {
      // console.log(item);
      this.componentCheck = 2;
      this.locationMapDialog = true;
      this.rowInfo = item;
      // alert( this.componentCheck);
      // this.componentCheck = 2;
      // this.rowInfo = item;
      // this.locationMapDialog = true;
      // alert(this.locationMapDialog);
    },

    fetch_default_org_locs() {
      this.locationList.forEach((element) => {
        this.assetLocation.push({
          asset_location_name: element.location_name,
          asset_location_type: "-",
          geo_location: "",
          asset_location_address: element.location_address,
          asset_location_pincode: element.location_pincode,
          asset_location_country: element.location_country,
          asset_location_state: element.location_state,
          asset_location_district: element.location_district,
          geo_lat: element.geo_lat,
          geo_long: element.geo_long,
        });
      });
      this.tableLoading = false;
    },

    // delete_asset(item) {
    //   this.componentCheck = 2;
    //   this.deleteLocDialog = true;
    //   this.rowInfo = item;
    // },

    create_location() {
      this.componentCheck = 1;
      this.addAssetLocationDialog = true;
    },

    on_location_setting_change(value) {
      if (value === "customLocation") {
        this.tableLoading = true;
        this.assetLocation = [];
        this.fetch_asset_locations("LIST"); // Call your query here
      }
    },

    async fetch_asset_locations(value) {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_config_create_list_update_locations, {
            input: {
              action_type: value,
              is_asset_location_configured:
                value == "CONFIGURE" ? false : undefined,
              organization_id: data.organization.organization_id,

              //   asset_location_name: this.locationName,
              //   asset_location_lat:
              //     this.geoLattitude == "" ? undefined : this.geoLattitude,
              //   asset_location_long:
              //     this.geoLongitude == "" ? undefined : this.geoLongitude,
            },
          })
        );
        var response = JSON.parse(
          result.data.asset_config_create_list_update_locations
        );
        this.tableLoading = false;
        this.loading = false;
        if (response.Status == "SUCCESS") {
          if (value == "CONFIGURE") {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
          }
          if (value == "LIST") {
            this.loading = false;
            this.assetLocation = response.data;
          }
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    save_action(value) {
      this.loading = true;
      this.fetch_asset_locations(value);
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addAssetLocationDialog = false;
      this.deleteDialog = false;
      this.locationViewDialog = false;
      this.assetLocation = [];
      this.tableLoading = true;
      this.fetch_asset_locations("LIST");
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
  },
};
</script>
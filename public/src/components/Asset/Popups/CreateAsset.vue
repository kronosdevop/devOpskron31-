<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assetCreation"
      @update:model-value="assetCreation = $event"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
      style="z-index: 1000"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add Asset</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="categoriesName"
                  :items="categoriesitems"
                  label="Category Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                  @update:model-value="fetch_subcategories"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="categoriessubName"
                  :items="categoriessubitems"
                  label="Sub Category Name"
                  class="ml-2"
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  v-model="assetvalue"
                  :label="`${' Asset Value (' + organization_currency + ')*'}`"
                  :rules="[(v) => !!v || 'required ']"
                  class="ml-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="4">
                <v-menu
                  v-model="purchaseDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="computedDateFormatted"
                      density="compact"
                      variant="outlined"
                      persistent-hint
                      class=""
                      label="Date Of Procurement*"
                      color="primaryColor"
                      :rules="[(v) => !!v || 'required ']"
                      append-inner-icon="mdi-calendar"
                      v-bind="props"
                      readonly
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :max="new Date().toISOString().substr(0, 10)"
                    v-model="purchasedate"
                    color="primaryColor"
                    @update:model-value="purchaseDateMenu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  v-model="installationDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="computedInstallationDateFormatted"
                      density="compact"
                      variant="outlined"
                      persistent-hint
                      class="ml-2"
                      label="Date of Installation"
                      color="primaryColor"
                      append-inner-icon="mdi-calendar"
                      v-bind="props"
                      readonly
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :max="new Date().toISOString().substr(0, 10)"
                    v-model="installationdate"
                    color="primaryColor"
                    @update:model-value="installationDateMenu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  v-model="supplyDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="computedSupplyDateFormatted"
                      density="compact"
                      variant="outlined"
                      persistent-hint
                      class="ml-2"
                      label="Date of Supply"
                      color="primaryColor"
                      append-inner-icon="mdi-calendar"
                      v-bind="props"
                      readonly
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :max="new Date().toISOString().substr(0, 10)"
                    v-model="supplydate"
                    color="primaryColor"
                    @update:model-value="supplyDateMenu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="assetsupplier"
                  :items="assetitemssupplier"
                  label="Asset Supplier"
                  class=""
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="assertdescriprtion"
                  variant="outlined"
                  class="ml-2"
                  label="Asset Description / Size"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="productnumber"
                  label="Product Serial Number"
                  class="ml-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="assetBrandName"
                  label="Asset Brand Name"
                  class=""
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="assetCondition"
                  :items="assetConditionOptions"
                  label="Asset Condition"
                  class="ml-2"
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="productNo"
                  label="Product No"
                  class="ml-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="assetShipmentStatus"
                  :items="assetShipmentStatusOptions"
                  label="Asset Contract Status"
                  class=""
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="assetCoolerStatus"
                  :items="assetCoolerStatusOptions"
                  label="Asset Cooler Status"
                  class="ml-2"
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                ></v-select>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="assetLocationType"
                  :items="locationTypeOptions"
                  label="Asset Location Type*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                  @update:model-value="update_location_type"
                ></v-select>
              </v-col>
              <v-col cols="4" v-if="assetLocationType === 'INTERNAL'">
                <v-autocomplete
                  density="compact"
                  v-model="assetLocation"
                  :items="assetitemsLocation"
                  :search-input.sync="searchloc"
                  :rules="
                    assetLocationType === 'INTERNAL'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  label="Asset Location*"
                  class="ml-2"
                  hide-selected
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  return-object
                ></v-autocomplete>
              </v-col>
              <v-col cols="8" v-if="assetLocationType === 'EXTERNAL'">
                <div class="d-flex align-center">
                  <GoogleAddressAutocomplete
                    v-model="searchLocation"
                    :api-key="googleApiKey"
                    class="location-search-input ml-4"
                    @callback="setPlace"
                    placeholder="Search Location"
                    style="flex: 1; min-width: 0"
                    :input-style="{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.38)',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }"
                  />
                  <v-btn
                    dark
                    small
                    class="pa-0 ml-2 white--text cardCss search-btn"
                    @click="applyLocation()"
                    :disabled="!currentPlace"
                  >
                    Go
                  </v-btn>
                </div>
              </v-col>

              <v-col cols="12" v-if="assetLocationType === 'EXTERNAL'">
                <v-text-field
                  density="compact"
                  v-model="externalLocationAddress"
                  label="Location Address*"
                  :rules="
                    assetLocationType === 'EXTERNAL'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  class="mt-2"
                  variant="outlined"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="" v-if="assetLocationType === 'EXTERNAL'">
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="externalLocationLat"
                  label="Latitude"
                  class=""
                  variant="outlined"
                  @keypress="is_number($event)"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="externalLocationLong"
                  label="Longitude"
                  class="ml-2"
                  variant="outlined"
                  @keypress="is_number($event)"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="4">
                <v-text-field
                  density="compact"
                  v-model="invoiceNo"
                  label="Invoice No"
                  class=""
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-autocomplete
                  density="compact"
                  :search-input.sync="searchF"
                  hide-no-data
                  v-model="assetManagedType"
                  hide-selected
                  :items="managedType"
                  :rules="[(v) => !!v || 'required ']"
                  item-text="title"
                  item-value="value"
                  label="Managed Type*"
                  class="ml-2"
                  variant="outlined"
                  @update:model-value="update_managed_type"
                ></v-autocomplete>
              </v-col>
              <v-col cols="4" v-if="assetManagedType == 'EXTERNAL'">
                <v-select
                  density="compact"
                  v-model="externalType"
                  :items="externalTypeOptions"
                  label="External Type*"
                  :rules="
                    assetManagedType == 'EXTERNAL'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  item-text="title"
                  item-value="value"
                  class="ml-2"
                  variant="outlined"
                  @update:model-value="update_external_type"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-autocomplete
                  :key="`managed-by-${assetManagedType}-${externalType}`"
                  density="compact"
                  :search-input.sync="searchF"
                  hide-no-data
                  v-model="assetassigned"
                  placeholder="Min 3 Character"
                  hide-selected
                  :items="getManagedByItems"
                  :rules="[(v) => !!v || 'required ']"
                  item-text="title"
                  item-value="value"
                  label="Managed By*"
                  :class="assetManagedType == 'INTERNAL' ? 'ml-2' : ''"
                  variant="outlined"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col
                v-if="
                  assetmasterCustom == 'Office' ||
                  assetmasterCustom == 'Warehouse'
                "
                cols="4"
              >
                <v-autocomplete
                  density="compact"
                  v-model="assetLocation"
                  :items="assetitemsLocation"
                  :search-input.sync="searchloc"
                  :rules="[(v) => !!v || 'required ']"
                  label="Asset Location*"
                  class=""
                  hide-selected
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  return-object
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row
              v-if="$store.getters.GetOrgDetails.organization.enable_asset_tags"
              no-gutters
            >
              <v-col
                v-for="(tag, index) in assetTagItems"
                :key="tag.tag_id"
                cols="4"
              >
                <v-select
                  v-model="selectedTags[index]"
                  :items="parseSubTags(tag.sub_tag)"
                  :label="getLabel(tag)"
                  class="ml-2"
                  density="compact"
                  variant="outlined"
                >
                </v-select>
              </v-col>
            </v-row>

            <v-row no-gutters class="mt-n4">
              <v-col cols="3">
                <v-checkbox
                  label="is Under Warranty ?"
                  v-model="warrantycheck"
                  class="ml-2"
                  color="blue"
                />
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  label="Has Insurance Coverage?"
                  v-model="insurancecheck"
                  class="ml-2"
                  color="blue"
                />
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  label="Is Mortgaged ?"
                  v-model="mortgagedcheck"
                  class="ml-2"
                  color="blue"
                />
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  label=" Deposit"
                  v-model="costDepositedcheck"
                  class="ml-2"
                  color="blue"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-n4">
              <v-col cols="4">
                <v-menu
                  v-model="warrantyDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="computedwarrentyDateFormatted"
                      density="compact"
                      variant="outlined"
                      persistent-hint
                      v-show="warrantycheck == true"
                      class="mr-2"
                      label="Warrenty Expiry Date"
                      color="primaryColor"
                      :rules="warrentyerule"
                      append-inner-icon="mdi-calendar"
                      v-bind="props"
                      readonly
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :min="new Date().toISOString().substr(0, 10)"
                    v-model="warrentydate"
                    color="primaryColor"
                    @update:model-value="warrantyDateMenu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-menu
                  v-model="insuranceDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="computedinsuranceDateFormatted"
                      density="compact"
                      v-show="insurancecheck == true"
                      variant="outlined"
                      persistent-hint
                      class="mr-2"
                      label="Insurance Expiry Date"
                      color="primaryColor"
                      :rules="insuranceerule"
                      append-inner-icon="mdi-calendar"
                      v-bind="props"
                      readonly
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :min="new Date().toISOString().substr(0, 10)"
                    v-model="insurancedate"
                    color="primaryColor"
                    @update:model-value="insuranceDateMenu = false"
                  >
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  label="Mortgaged Amount"
                  v-model="mortageAmount"
                  :rules="Mortgagedrule"
                  v-show="mortgagedcheck == true"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            size="small"
            class="text-capitalize cardCss button-corner"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
/*eslint-disable*/
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import {
  assets,
  aseet_suppliers,
  asset_categories,
  asset_sub_category,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import { get_asset_tags } from "@/mixins/GetAssetTags.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete.vue";

export default {
  components: {
    GoogleAddressAutocomplete,
  },
  props: {
    assetCreation: Boolean,
  },
  mixins: [
    get_location_details,
    get_all_org_users,
    get_asset_distributors,
    get_asset_reatilers,
    get_asset_tags,
    get_global_customers,
  ],
  data() {
    return {
      categoriesName: "",
      assetassigned: "",
      organization_currency: "",
      productnumber: "",
      productNo: "",
      invoiceNo: "",
      assetName: "",
      loading: false,
      searchF: "",
      searchloc: "",
      purchaseDateMenu: false,
      warrantyDateMenu: false,
      insuranceDateMenu: false,
      installationDateMenu: false,
      supplyDateMenu: false,
      insurancecheck: false,
      mortgagedcheck: false,
      costDepositedcheck: false,
      mortageAmount: "",
      categoriesitems: [],
      customeritems: [],
      assetitemstype: [
        { title: "Owned", value: "OWNED" },
        { title: "Leased", value: "LEASED" },
        { title: "Others", value: "OTHERS" },
      ],
      assetTypes: "",
      assetvalue: "",
      categoriessubName: "",
      insurancedate: "",
      assertdescriprtion: "",
      assetLocation: "",
      assetLocationType: "INTERNAL",
      locationTypeOptions: [
        { title: "Internal", value: "INTERNAL" },
        { title: "External", value: "EXTERNAL" },
      ],
      externalLocationAddress: "",
      externalLocationLat: "",
      externalLocationLong: "",
      searchLocation: "",
      currentPlace: null,
      googleApiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI",
      categoriessubitems: [],
      assetitemsLocation: [],
      assetitemsasigned: [],
      assetsupplier: "",
      warrentydate: "",
      assetitemssupplier: [],
      purchasedate: new Date().toISOString().substr(0, 10),
      installationdate: "",
      supplydate: "",
      warrantycheck: false,
      isVisibile: false,
      customLocData: ["Office", "Warehouse"],
      assetmasterCustom: "",
      internalLocations: [],
      distributorsList: [],
      distributorsLocations: [],
      retailersList: [],
      retailersLocations: [],
      selectedDistributor: "",
      searchdis: "",
      showdistLoc: false,
      selectRetailer: "",
      searchret: "",
      retailerItems: [],
      assetTagItems: [],
      selectedTags: [],
      activeSelectedElements: [],
      assetManagedType: "INTERNAL",
      managedType: [
        { title: "Internal", value: "INTERNAL" },
        { title: "External", value: "EXTERNAL" },
      ],
      externalType: "",
      externalTypeOptions: [
        { title: "Customer", value: "CUSTOMER" },
        { title: "Distributor", value: "DISTRIBUTOR" },
        { title: "Retailer", value: "RETAILER" },
      ],
      distributorItems: [],
      assetBrandName: "",
      assetCondition: "",
      assetConditionOptions: [
        { title: "Good", value: "GOOD" },
        { title: "Bad", value: "BAD" },
      ],
      assetShipmentStatus: "",
      assetShipmentStatusOptions: [
        { title: "Warehouse", value: "INSTOCK" },
        { title: "Delivered", value: "DELIVERED" },
        { title: "Pending", value: "PENDING" },
        { title: "Received", value: "RECEIVED" },
      ],
      assetCoolerStatus: "",
      assetCoolerStatusOptions: [
        { title: "New", value: "NEW" },
        { title: "Old", value: "OLD" },
        { title: "New Warehouse", value: "NEW_WAREHOUSE" },
        { title: "Old Warehouse", value: "OLD_WAREHOUSE" },
      ],
    };
  },
  watch: {
    assetCreation: {
      async handler() {
        if (this.assetCreation == true) {
          this.assetmasterCustom = "";
          this.activeSelectedElements = [];
          this.organization_currency =
            this.$store.getters.GetUserObj.organization.organization_currency ==
            undefined
              ? ""
              : this.$store.getters.GetUserObj.organization
                  .organization_currency;

          this.purchasedate = this.getToday();
          this.$store.commit("Setnamesearch", "");
          this.assetitemsLocation = [];
          this.categoriesitems = [];
          this.assetitemsasigned = [];
          this.categoriessubitems = [];
          this.customeritems = [];
          var data = this.$store.getters.GetOrgDetails;
          await Promise.all([
            this.fetch_categories(),
            this.get_all_org_users(),
            this.fetch_suppliers(),
            this.get_location_details(),
            this.get_global_customers(),
            this.get_asset_distributors(),
            this.get_asset_reatilers(),
          ]);
          await this.fetch_details();
          // Populate customer items after get_global_customers has completed
          if (this.masterCustomers && this.masterCustomers.length > 0) {
            this.populate_customer_items();
          }
          // Populate distributor and retailer items
          this.populate_distributor_items();
          this.populate_retailer_items();
          if (
            this.$store.getters.GetOrgDetails.organization.enable_asset_tags ==
            true
          ) {
            await this.get_asset_tags();
            this.activeSelectedElements = this.masterAsseTags;
            this.assetTagItems = this.masterAsseTags;
          }
        }
      },
      immediate: true,
    },
  },

  computed: {
    computedDateFormatted: {
      get() {
        return this.formatDate(this.purchasedate);
      },
      set(value) {
        this.purchasedate = value;
      },
    },

    computedwarrentyDateFormatted: {
      get() {
        return this.formatDate(this.warrentydate);
      },
      set(value) {
        this.warrentydate = value;
      },
    },

    computedinsuranceDateFormatted: {
      get() {
        return this.formatDate(this.insurancedate);
      },
      set(value) {
        this.insurancedate = value;
      },
    },

    computedInstallationDateFormatted: {
      get() {
        return this.formatDate(this.installationdate);
      },
      set(value) {
        this.installationdate = value;
      },
    },

    computedSupplyDateFormatted: {
      get() {
        return this.formatDate(this.supplydate);
      },
      set(value) {
        this.supplydate = value;
      },
    },

    warrentyerule() {
      if (this.warrantycheck === true) {
        return [(v) => !!v || "Required"];
      } else {
        return [];
      }
    },

    insuranceerule() {
      if (this.insurancecheck === true) {
        return [(v) => !!v || "Required"];
      } else {
        return [];
      }
    },

    Mortgagedrule() {
      if (this.mortgagedcheck === true) {
        return [(v) => !!v || "Required"];
      } else {
        return [];
      }
    },

    getManagedByItems() {
      if (this.assetManagedType === "INTERNAL") {
        return this.assetitemsasigned || [];
      } else if (this.assetManagedType === "EXTERNAL") {
        if (this.externalType === "CUSTOMER") {
          return this.customeritems || [];
        } else if (this.externalType === "DISTRIBUTOR") {
          return this.distributorItems || [];
        } else if (this.externalType === "RETAILER") {
          return this.retailerItems || [];
        }
        return [];
      }
      return [];
    },
  },
  methods: {
    parseSubTags(subTagArray) {
      // Parse the JSON string and return the resulting array
      return JSON.parse(subTagArray[0]);
    },
    getLabel(tag) {
      return `Select Tag for ${tag.tag_name}`; // Format label using template literals
    },

    getToday() {
      const today = new Date();
      return (
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0")
      );
    },

    async fetch_distributors_retails(value) {
      this.assetitemsLocation = [];
      this.showdistLoc = false;
      if (value == "Office") {
        var loaction = this.locationList;
        this.assetitemsLocation = loaction.filter(
          (element) => element.location_type === "OFFICE"
        );
      } else if (value == "Warehouse") {
        var loaction = this.locationList;
        this.assetitemsLocation = loaction.filter(
          (element) => element.location_type === "WAREHOUSE"
        );
      }
    },

    fethc_distributor_id(value) {
      var data = this.assetMasterLocations.filter(
        (element) =>
          element.asset_location_type === "DISTRIBUTOR" &&
          element.asset_distributor_id.includes(value)
      );
      this.showdistLoc = true;
      this.assetitemsLocation = data;
    },

    fethc_retailer_id(value) {
      var data = this.assetMasterLocations.filter(
        (element) =>
          element.asset_location_type === "CUSTOMERS" &&
          element.asset_retailer_id.includes(value)
      );
      this.showdistLoc = true;
      this.assetitemsLocation = data;
    },

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
    async fetch_subcategories() {
      this.categoriessubitems = [];

      // Clear subcategory selection when category changes
      this.categoriessubName = "";

      // Check if category is selected
      if (!this.categoriesName) {
        // console.log("No category selected");
        return;
      }

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

        if (response.Status == "SUCCESS") {
          var categoriesRecords = response.data;

          var filteredArray = categoriesRecords.filter((obj) => {
            // Convert both to strings for comparison to handle type mismatches
            const objCategoryId = String(obj.category_id);
            const selectedCategoryId = String(this.categoriesName);
            return objCategoryId === selectedCategoryId;
          });

          this.categoriessubitems = [];
          filteredArray.forEach((element) => {
            this.categoriessubitems.push({
              title: element.sub_category_name,
              value: element.sub_category_id,
            });
          });
        } else {
          this.categoriessubitems = [];
        }
      } catch (error) {
        console.error("Error in fetch_subcategories:", error);
        this.categoriessubitems = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    fetch_details() {
      this.assetassigned = this.$store.getters.GetUserObj.user?.user_email_id;

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.assetitemsasigned.push({
            title: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      var loaction = this.locationList;

      const filteredLocations = loaction.filter(
        (element) =>
          element.location_type === "OFFICE" ||
          element.location_type === "MAIN_LOCATION" ||
          element.location_type === "WAREHOUSE" ||
          element.location_type === "CUSTOMER"
      );

      // Transform location data to use title and value properties
      this.assetitemsLocation = filteredLocations.map((element) => ({
        title: element.location_name,
        value: element.location_id,
        location_id: element.location_id,
        location_name: element.location_name,
        geo_long: element.geo_long,
        geo_lat: element.geo_lat,
        location_type: element.location_type,
      }));
    },
    async fetch_S3_file(value) {
      let responseData = null;
      let data = null;

      try {
        const response = await fetch(value);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch the file: ${response.statusText} (Status Code: ${response.status})`
          );
        }

        if (
          !response.headers.get("Content-Type").includes("application/json")
        ) {
          throw new Error("The file is not in JSON format");
        }

        responseData = await response.text();

        try {
          data = JSON.parse(responseData);
        } catch (jsonError) {
          throw new Error("Error parsing JSON response: " + jsonError.message);
        }

        return data;
      } catch (error) {
        console.error("Error fetching file:", error);

        this.errorMessage = "Error fetching file: " + error.message;
      } finally {
      }
    },
    async fetch_suppliers() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(aseet_suppliers, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_SUPPLIER",
            },
          })
        );
        var response = JSON.parse(result.data.aseet_suppliers);

        if (response.Status == "SUCCESS") {
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            let suppliereRecords = await this.fetch_S3_file(signedUrl);
            this.assetitemssupplier = [];
            // console.log(suppliereRecords);
            suppliereRecords.forEach((element) => {
              this.assetitemssupplier.push({
                title: element.supplier_name,
                value: element.suppliers_id,
              });
            });
          }
        } else {
          this.assetitemssupplier = [];
        }
      } catch (error) {
        this.assetitemssupplier = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async fetch_categories() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_categories, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_CATEGORY",
            },
          })
        );
        var response = JSON.parse(result.data.asset_categories);

        if (response.Status == "SUCCESS") {
          var categoriesRecords = response.data;

          categoriesRecords.forEach((element) => {
            this.categoriesitems.push({
              title: element.category_name,
              value: element.category_id,
            });
          });
        } else {
          this.categoriesitems = [];
        }
      } catch (error) {
        this.categoriesitems = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    formatDate(purchasedate) {
      if (!purchasedate) return "";

      // Convert to string if it's not already
      const dateString = String(purchasedate);

      // Check if it's in yyyy-mm-dd format
      if (dateString.includes("-")) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      }

      // If it's already in dd/mm/yyyy format, return as is
      if (dateString.includes("/")) {
        return dateString;
      }

      // Fallback: try to parse as Date object
      try {
        const date = new Date(purchasedate);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        }
      } catch (error) {
        console.error("Error formatting date:", error);
      }

      return "";
    },

    formatDateToYYYYMMDD(date) {
      if (!date) return "";

      // Convert to string if it's not already
      const dateString = String(date);

      // If it's already in yyyy-mm-dd format, return as is
      if (dateString.includes("-") && dateString.split("-").length === 3) {
        return dateString;
      }

      // If it's in dd/mm/yyyy format, convert to yyyy-mm-dd
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Fallback: try to parse as Date object
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
      } catch (error) {
        console.error("Error formatting date to YYYY-MM-DD:", error);
      }

      return "";
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.purchasedate = new Date().toISOString().substr(0, 10);
      this.computedwarrentyDateFormatted = "";
      this.computedInstallationDateFormatted = "";
      this.computedSupplyDateFormatted = "";
      this.clear_fields();
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    clear_fields() {
      this.mortgagedcheck = false;
      this.warrantycheck = false;
      this.costDepositedcheck = false;
      this.purchasedate = new Date().toISOString().substr(0, 10);
      this.asset_mortgaged_amount = 0;
      this.insurancedate = "";
      this.installationdate = "";
      this.supplydate = "";
      this.assertdescriprtion = "";
      this.insurancecheck = false;
      this.productnumber = "";
      this.productNo = "";
      this.invoiceNo = "";
      this.assetsupplier = "";
      this.categoriessubName = "";
      this.externalType = "";
      this.assetManagedType = "INTERNAL";
      this.assetLocationType = "INTERNAL";
      this.assetLocation = "";
      this.externalLocationAddress = "";
      this.externalLocationLat = "";
      this.externalLocationLong = "";
      this.assetBrandName = "";
      this.assetCondition = "";
      this.assetShipmentStatus = "";
      this.assetCoolerStatus = "";
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },

    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(assets, {
            input: {
              category_id: this.categoriesName,
              sub_category_id: this.categoriessubName,
              suppliers_id: this.assetsupplier,
              asset_assined_to:
                this.assetassigned == "" ? undefined : this.assetassigned,
              action_type: "CREATE_ASSET",
              asset_value: this.assetvalue,
              asset_location_type: this.assetLocationType,
              asset_location_id:
                this.assetLocationType === "INTERNAL"
                  ? this.assetLocation
                    ? this.assetLocation.value
                    : undefined
                  : undefined,
              asset_location:
                this.assetLocationType === "EXTERNAL"
                  ? this.externalLocationAddress
                    ? this.externalLocationAddress
                    : undefined
                  : undefined,
              asset_location_lat:
                this.assetLocationType === "EXTERNAL"
                  ? this.externalLocationLat
                    ? parseFloat(this.externalLocationLat)
                    : undefined
                  : this.assetLocationType === "INTERNAL" && this.assetLocation
                  ? this.assetLocation.geo_lat
                  : undefined,
              asset_location_long:
                this.assetLocationType === "EXTERNAL"
                  ? this.externalLocationLong
                    ? parseFloat(this.externalLocationLong)
                    : undefined
                  : this.assetLocationType === "INTERNAL" && this.assetLocation
                  ? this.assetLocation.geo_long
                  : undefined,
              asset_purchased_date: this.purchasedate,
              asset_installation_date: this.installationdate
                ? this.formatDateToYYYYMMDD(this.installationdate)
                : undefined,
              asset_date_of_supply: this.supplydate
                ? this.formatDateToYYYYMMDD(this.supplydate)
                : undefined,
              asset_product_serial_no: this.productnumber,
              asset_product_no: this.productNo || undefined,
              asset_invoice_no: this.invoiceNo || undefined,
              asset_brand_name: this.assetBrandName || undefined,
              asset_condition: this.assetCondition || undefined,
              asset_shipment_status: this.assetShipmentStatus || undefined,
              asset_cooler_status: this.assetCoolerStatus || undefined,
              is_under_warranty: this.warrantycheck,
              asset_warrenty_expiry_data:
                this.warrantycheck == false
                  ? "N/A"
                  : this.formatDateToYYYYMMDD(this.warrentydate),
              is_under_insurance: this.insurancecheck,
              asset_insurance_expiry_date:
                this.insurancecheck == false
                  ? "N/A"
                  : this.formatDateToYYYYMMDD(this.insurancedate),
              is_mortgaged: this.mortgagedcheck,
              asset_mortgaged_amount:
                this.mortgagedcheck == false ? 0 : Number(this.mortageAmount),
              is_cost_deposited: this.costDepositedcheck,
              asset_type: "OWNED",
              asset_description: this.assertdescriprtion,
              asset_created_by: data.user.user_email_id,
              asset_tag_1: this.fetch_tag_selected("Tag1"),
              asset_tag_2: this.fetch_tag_selected("Tag2"),
              asset_tag_3: this.fetch_tag_selected("Tag3"),
              asset_tag_4: this.fetch_tag_selected("Tag4"),
              asset_tag_5: this.fetch_tag_selected("Tag5"),
              asset_handler_type: this.assetManagedType,
              asset_external_handler_type: this.externalType
                ? this.externalType
                : undefined,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.assets);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.$refs.form.reset();
          this.clear_fields();
          this.purchasedate = new Date().toISOString().substr(0, 10);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_tag_selected(value) {
      let selectedValues = "";

      const tagData = this.activeSelectedElements.find(
        (item) => item.tag_prefix === value
      );

      if (tagData) {
        const subTags = JSON.parse(tagData.sub_tag[0]);

        const matches = this.selectedTags.filter((key) =>
          subTags.includes(key)
        );

        if (matches.length > 0) {
          selectedValues = matches.join(", ");
        }
      }

      return selectedValues;
    },

    async fetch_audit_message() {
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "ASSET_ACTION",
        AuditAction: "ASSET_TRANSFER",
        AuditMessage: `${datas.user.full_user_name} created an Asset `,
      };

      this.$store.commit("SetAuditActions", data);
    },
    update_managed_type() {
      this.assetassigned = "";
      this.externalType = "";
    },

    update_external_type() {
      this.assetassigned = "";
      // Force Vue to update the computed property
      this.$nextTick(() => {
        // Ensure items are populated
        if (
          this.externalType === "DISTRIBUTOR" &&
          this.distributorItems.length === 0
        ) {
          this.populate_distributor_items();
        } else if (
          this.externalType === "RETAILER" &&
          this.retailerItems.length === 0
        ) {
          this.populate_retailer_items();
        } else if (
          this.externalType === "CUSTOMER" &&
          this.customeritems.length === 0
        ) {
          this.populate_customer_items();
        }
      });
    },

    update_location_type() {
      // Reset location fields when type changes
      if (this.assetLocationType === "INTERNAL") {
        this.externalLocationAddress = "";
        this.externalLocationLat = "";
        this.externalLocationLong = "";
        this.searchLocation = "";
        this.currentPlace = null;
      } else {
        this.assetLocation = "";
      }
    },
    setPlace(placeData) {
      if (placeData && placeData.location) {
        this.currentPlace = placeData.place;
        this.searchLocation = placeData.formatted_address;
      } else {
        this.$emit(
          "errorMsg",
          "Please select a valid location from the search results"
        );
      }
    },
    applyLocation() {
      if (this.currentPlace && this.currentPlace.geometry) {
        const location = this.currentPlace.geometry.location;
        this.externalLocationAddress = this.searchLocation;
        this.externalLocationLat = location.lat();
        this.externalLocationLong = location.lng();
      } else {
        this.$emit(
          "errorMsg",
          "Please select a location from the search results first"
        );
      }
    },
    async populate_customer_items() {
      try {
        if (this.masterCustomers && Array.isArray(this.masterCustomers)) {
          this.customeritems = this.masterCustomers
            .map((customer) => ({
              title:
                customer.legal_name +
                  " ( " +
                  customer.customer_display_id +
                  " ) " ||
                customer.name ||
                "Unknown Customer",
              value:
                customer.customer_email_id || customer.customer_email_id || "",
            }))
            .filter(
              (customer) =>
                customer.title !== "Unknown Customer" && customer.value !== ""
            );
        } else {
          this.customeritems = [];
        }
      } catch (error) {
        console.error("Error populating customer items:", error);
        this.customeritems = [];
      }
    },

    populate_distributor_items() {
      try {
        if (
          this.masterAssetDistributors &&
          Array.isArray(this.masterAssetDistributors)
        ) {
          this.distributorItems = this.masterAssetDistributors
            .map((distributor) => ({
              title:
                distributor.asset_distributor_name ||
                distributor.name ||
                "Unknown Distributor",
              value:
                distributor.asset_distributor_id ||
                distributor.asset_distributor_email_id ||
                "",
            }))
            .filter(
              (distributor) =>
                distributor.title !== "Unknown Distributor" &&
                distributor.value !== ""
            );
        } else {
          this.distributorItems = [];
        }
      } catch (error) {
        console.error("Error populating distributor items:", error);
        this.distributorItems = [];
      }
    },

    populate_retailer_items() {
      try {
        if (
          this.masterAssetRetailers &&
          Array.isArray(this.masterAssetRetailers)
        ) {
          this.retailerItems = this.masterAssetRetailers
            .map((retailer) => ({
              title:
                retailer.asset_retailer_name ||
                retailer.name ||
                "Unknown Retailer",
              value:
                retailer.asset_retailer_id ||
                retailer.asset_retailer_email_id ||
                "",
            }))
            .filter(
              (retailer) =>
                retailer.title !== "Unknown Retailer" && retailer.value !== ""
            );
        } else {
          this.retailerItems = [];
        }
      } catch (error) {
        console.error("Error populating retailer items:", error);
        this.retailerItems = [];
      }
    },
  },
};
</script>
  
  <style>
</style>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assetCreation"
      @update:model-value="assetCreation = $event"
      persistent
      max-width="1000"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Edit Asset</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-2" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="4">
                <v-select
                  density="compact"
                  variant="outlined"
                  v-model="categoriesName"
                  :items="categoriesitems"
                  label="Category Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  item-text="title"
                  item-value="value"
                  @update:model-value="fetch_subcategories"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="categoriessubName"
                  :items="categoriessubitems"
                  label="Sub Category Name"
                  class="ml-2"
                  density="compact"
                  variant="outlined"
                  item-text="title"
                  item-value="value"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  v-model="assetvalue"
                  :label="`${' Asset Value (' + organization_currency + ')*'}`"
                  :rules="[(v) => !!v || 'required ']"
                  class="ml-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
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
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable */
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

export default {
  props: {
    assetCreation: Boolean,
  },
  mixins: [
    get_location_details,
    get_all_org_users,
    get_asset_distributors,
    get_asset_reatilers,
    get_asset_tags,
  ],
  data() {
    return {
      categoriesName: "",
      categoriesitems: [],
      categoriessubName: "",
      categoriessubitems: [],
      assetvalue: "",
      organization_currency: "",
      loading: false,
      searchF: "",
      searchloc: "",
      purchaseDateMenu: false,
      warrantyDateMenu: false,
      insuranceDateMenu: false,
      insurancecheck: false,
      mortgagedcheck: false,
      mortageAmount: "",
      assetitemstype: [
        { title: "Owned", value: "OWNED" },
        { title: "Leased", value: "LEASED" },
        { title: "Others", value: "OTHERS" },
      ],
      assetTypes: "",
      categoriessubName: "",
      insurancedate: "",
      assertdescriprtion: "",
      assetLocation: "",
      assetitemsLocation: [],
      assetitemsasigned: [],
      assetsupplier: "",
      warrentydate: "",
      assetitemssupplier: [],
      purchasedate: new Date().toISOString().substr(0, 10),
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
          var data = this.$store.getters.GetOrgDetails;
          await Promise.all([
            this.fetch_categories(),
            this.get_all_org_users(),
            this.fetch_suppliers(),
            this.get_location_details(),
          ]);
          await this.fetch_details();
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

  methods: {
    parseSubTags(subTagArray) {
      return JSON.parse(subTagArray[0]);
    },
    getLabel(tag) {
      return `Select Tag for ${tag.tag_name}`;
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
      this.assetassigned = this.$store.getters.GetUserObj.user.user_email_id;

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
          element.location_type === "WAREHOUSE"
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
    close_dialog() {
      this.$emit("clicked", 0);
      this.purchasedate = new Date().toISOString().substr(0, 10);
      this.computedwarrentyDateFormatted = "";
      this.clear_fields();
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    clear_fields() {
      this.mortgagedcheck = false;
      this.warrantycheck = false;
      this.purchasedate = new Date().toISOString().substr(0, 10);
      this.asset_mortgaged_amount = 0;
      this.insurancedate = "";
      this.assertdescriprtion = "";
      this.insurancecheck = false;
      this.productnumber = "";
      this.assetsupplier = "";
      this.categoriessubName = "";
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.update_mutation();
      }
    },

    async update_mutation() {
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
              action_type: "UPDATE_ASSET",
              asset_value: this.assetvalue,
              asset_location_id: this.assetLocation.location_id,
              asset_purchased_date: this.purchasedate,
              asset_product_serial_no: this.productnumber,
              is_under_warranty: this.warrantycheck,
              asset_warrenty_expiry_data:
                this.warrantycheck == false ? "N/A" : this.warrentydate,
              is_under_insurance: this.insurancecheck,
              asset_insurance_expiry_date:
                this.insurancecheck == false ? "N/A" : this.insurancedate,
              is_mortgaged: this.mortgagedcheck,
              asset_mortgaged_amount:
                this.mortgagedcheck == false ? 0 : Number(this.mortageAmount),
              asset_type: "OWNED",
              asset_description: this.assertdescriprtion,
              asset_created_by: data.user.user_email_id,
              asset_location_long: this.assetLocation.geo_long,
              asset_location_lat: this.assetLocation.geo_lat,
              asset_tag_1: this.fetch_tag_selected("Tag1"),
              asset_tag_2: this.fetch_tag_selected("Tag2"),
              asset_tag_3: this.fetch_tag_selected("Tag3"),
              asset_tag_4: this.fetch_tag_selected("Tag4"),
              asset_tag_5: this.fetch_tag_selected("Tag5"),
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
  },
};
</script>
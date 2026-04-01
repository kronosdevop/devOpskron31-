<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assetdisplay"
      @update:model-value="assetdisplay = $event"
      persistent
      max-width="1000"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Asset Details</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="pa-6">
          <v-row>
            <!-- Basic Information Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title
                  class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4"
                >
                  Basic Information
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">{{
                      adminassetItems.category_id_text || "-"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Sub-Category</span>
                    <span class="detail-value">{{
                      adminassetItems.sub_category_id_text || "-"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Value</span>
                    <span class="detail-value"
                      >{{ organization_currency }}
                      {{ adminassetItems.asset_value || "-" }}</span
                    >
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date Of Procurement</span>
                    <span class="detail-value">{{
                      formatDate(adminassetItems.asset_purchased_date)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date of Installation</span>
                    <span class="detail-value">{{
                      formate_date(adminassetItems.asset_installation_date)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date of Supply</span>
                    <span class="detail-value">{{
                      formate_date(adminassetItems.asset_date_of_supply)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Supplier</span>
                    <span class="detail-value">{{
                      adminassetItems.suppliers_id_text || "-"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Description</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_description || "N/A"
                    }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Product Details Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title
                  class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4"
                >
                  Product Details
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Asset Brand Name</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_brand_name || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Condition</span>
                    <span class="detail-value">{{
                      formatAssetCondition(adminassetItems.asset_condition)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Product Code</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_product_no || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Product Serial Number</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_product_serial_no || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Contract Status</span>
                    <span class="detail-value">{{
                      formatShipmentStatus(
                        adminassetItems.asset_shipment_status
                      )
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Invoice No</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_invoice_no || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">QR Status</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_tagged_status || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Cooler Status</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_cooler_status || "N/A"
                    }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Location Information Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title
                  class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4"
                >
                  Location Information
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Asset Location Type</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_location_type || "INTERNAL"
                    }}</span>
                  </div>
                  <div
                    class="detail-row"
                    v-if="adminassetItems.asset_location_type === 'INTERNAL'"
                  >
                    <span class="detail-label">Asset Location</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_location || "N/A"
                    }}</span>
                  </div>
                  <template
                    v-if="adminassetItems.asset_location_type === 'EXTERNAL'"
                  >
                    <div class="detail-row">
                      <span class="detail-label">Location Address</span>
                      <span class="detail-value">{{
                        adminassetItems.asset_location_id || "N/A"
                      }}</span>
                    </div>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Management & Assignment Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title
                  class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4"
                >
                  Management & Assignment
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Managed Type</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_handler_type || "INTERNAL"
                    }}</span>
                  </div>
                  <div
                    class="detail-row"
                    v-if="adminassetItems.asset_handler_type === 'EXTERNAL'"
                  >
                    <span class="detail-label">External Type</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_external_handler_type || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Managed By</span>
                    <span class="detail-value">{{
                      getManagedByName() || "-"
                    }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Warranty & Insurance Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title
                  class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4"
                >
                  Warranty & Insurance
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Is Under Warranty</span>
                    <span class="detail-value">{{
                      adminassetItems.is_under_warranty == true ? "Yes" : "No"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Warranty Expiry Date</span>
                    <span class="detail-value">{{
                      formate_date(adminassetItems.asset_warrenty_expiry_date)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Has Insurance Coverage</span>
                    <span class="detail-value">{{
                      adminassetItems.is_under_insurance == true ? "Yes" : "No"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Insurance Expiry Date</span>
                    <span class="detail-value">{{
                      formate_date(adminassetItems.asset_insurance_expiry_date)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Is Mortgaged</span>
                    <span class="detail-value">{{
                      adminassetItems.is_mortgaged == true ? "Yes" : "No"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Mortgaged Amount</span>
                    <span class="detail-value">{{
                      adminassetItems.asset_mortgaged_amount || "N/A"
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Deposit</span>
                    <span class="detail-value">{{
                      adminassetItems.is_cost_deposited == true
                        ? "Deposited"
                        : "FOC"
                    }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
export default {
  mixins: [get_asset_distributors, get_asset_reatilers],
  props: {
    assetdisplay: Boolean,
    adminassetItems: Object,
  },
  data() {
    return {
      organization_currency: "",
    };
  },
  watch: {
    assetdisplay: {
      async handler() {
        if (this.assetdisplay == true) {
          this.organization_currency =
            this.$store.getters.GetUserObj.organization.organization_currency ==
            undefined
              ? ""
              : this.$store.getters.GetUserObj.organization
                  .organization_currency;

          // Fetch distributor and retailer lists if external type is DISTRIBUTOR or RETAILER
          if (
            this.adminassetItems.asset_handler_type === "EXTERNAL" &&
            (this.adminassetItems.asset_external_handler_type ===
              "DISTRIBUTOR" ||
              this.adminassetItems.asset_external_handler_type === "RETAILER")
          ) {
            await Promise.all([
              this.get_asset_distributors(),
              this.get_asset_reatilers(),
            ]);
          }

          // console.log(this.adminassetItems);
        }
      },
      immediate: true,
    },
  },
  methods: {
    formatDate(asset_purchased_date) {
      const date = new Date(asset_purchased_date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate() + 1).padStart(2, "0")}`
    },
    formate_date(value) {
      if (value == "N/A" || !value || value == null || value == undefined) {
        return value == "N/A" ? value : "-";
      }
      var data = formatdisplayDate(value);
      return data;
    },
    formatAssetCondition(value) {
      if (!value || value == null || value == undefined) {
        return "-";
      }
      const conditionMap = {
        NEW: "New",
        OLD: "Old",
        NEW_WAREHOUSE: "New Warehouse",
        OLD_WAREHOUSE: "Old Warehouse",
      };
      return conditionMap[value] || value;
    },
    formatShipmentStatus(value) {
      if (!value || value == null || value == undefined) {
        return "-";
      }
      const statusMap = {
        WAREHOUSE: "Warehouse",
        INSTOCK: "Warehouse",
        DELIVERED: "Delivered",
        PENDING: "Pending",
        RECEIVED: "Received",
      };
      return statusMap[value] || value;
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    getManagedByName() {
      const managedById =
        this.adminassetItems.asset_assined_to ||
        this.adminassetItems.last_assigned_to;

      if (!managedById) {
        return "-";
      }

      // If internal, return as is (it's already a name/email)
      if (this.adminassetItems.asset_handler_type !== "EXTERNAL") {
        return managedById;
      }

      // If external type is DISTRIBUTOR, find name from distributor list
      if (this.adminassetItems.asset_external_handler_type === "DISTRIBUTOR") {
        if (
          this.masterAssetDistributors &&
          Array.isArray(this.masterAssetDistributors)
        ) {
          const distributor = this.masterAssetDistributors.find(
            (dist) =>
              dist.asset_distributor_id === managedById ||
              dist.asset_distributor_email_id === managedById ||
              dist.distributor_email_id === managedById ||
              dist.email_id === managedById
          );
          if (distributor) {
            return (
              distributor.asset_distributor_name ||
              distributor.distributor_name ||
              distributor.name ||
              managedById
            );
          }
        }
        return managedById;
      }

      // If external type is RETAILER, find name from retailer list
      if (this.adminassetItems.asset_external_handler_type === "RETAILER") {
        if (
          this.masterAssetRetailers &&
          Array.isArray(this.masterAssetRetailers)
        ) {
          const retailer = this.masterAssetRetailers.find(
            (ret) =>
              ret.asset_retailer_id === managedById ||
              ret.asset_retailer_email_id === managedById ||
              ret.retailer_email_id === managedById ||
              ret.email_id === managedById
          );
          if (retailer) {
            return (
              retailer.asset_retailer_name ||
              retailer.retailer_name ||
              retailer.name ||
              managedById
            );
          }
        }
        return managedById;
      }

      // For CUSTOMER or other types, return as is
      return managedById;
    },
  },
};
</script>

<style scoped>
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
  min-width: 160px;
  flex-shrink: 0;
}

.detail-value {
  color: #333;
  font-size: 14px;
  text-align: right;
  flex: 1;
  word-break: break-word;
  padding-left: 16px;
}

.v-card {
  border-radius: 8px;
}

.v-card-title {
  font-size: 15px;
  letter-spacing: 0.5px;
}

.v-card-text {
  padding: 16px !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .detail-row {
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    min-width: auto;
  }

  .detail-value {
    text-align: left;
    padding-left: 0;
  }
}
</style>

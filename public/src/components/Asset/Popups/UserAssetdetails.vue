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
                <v-card-title class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4">
                  Basic Information
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Category</span>
                    <span class="detail-value">{{ assetitems.item.category_id_text || "-" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Sub-Category</span>
                    <span class="detail-value">{{ assetitems.item.sub_category_id_text || "-" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Type</span>
                    <span class="detail-value">{{ assetitems.item.asset_type || "-" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Value</span>
                    <span class="detail-value">{{ organization_currency }} {{ assetitems.item.asset_value || "-" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date Of Purchase</span>
                    <span class="detail-value">{{ formate_date(assetitems.item.asset_purchased_date) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Supplier</span>
                    <span class="detail-value">{{ assetitems.item.suppliers_id_text || "-" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Asset Description</span>
                    <span class="detail-value">{{ assetitems.item.asset_description || "N/A" }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Product Details Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4">
                  Product Details
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Product Serial Number</span>
                    <span class="detail-value">{{ assetitems.item.asset_product_serial_no || "N/A" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">QR Status</span>
                    <span class="detail-value">{{ assetitems.item.asset_tagged_status || "N/A" }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Location Information Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4">
                  Location Information
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Asset Location</span>
                    <span class="detail-value">{{ assetitems.item.asset_location || "N/A" }}</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Warranty & Insurance Section -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 font-weight-bold pa-3 bg-grey-lighten-4">
                  Warranty & Insurance
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="detail-row">
                    <span class="detail-label">Is Under Warranty</span>
                    <span class="detail-value">{{ assetitems.item.is_under_warranty == true ? "Yes" : "No" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Warranty Expiry Date</span>
                    <span class="detail-value">{{ formate_date(assetitems.item.asset_warrenty_expiry_data) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Has Insurance Coverage</span>
                    <span class="detail-value">{{ assetitems.item.is_under_insurance == true ? "Yes" : "No" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Insurance Expiry Date</span>
                    <span class="detail-value">{{ formate_date(assetitems.item.asset_insurance_expiry_date) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Is Mortgaged</span>
                    <span class="detail-value">{{ assetitems.item.is_mortgaged == true ? "Yes" : "No" }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Mortgaged Amount</span>
                    <span class="detail-value">{{ assetitems.item.asset_mortgaged_amount || "N/A" }}</span>
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
export default {
  props: {
    assetdisplay: Boolean,
    assetitems: Object,
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
          // console.log(this.assetitems);
        }
      },
      immediate: true,
    },
  },
  methods: {
    formate_date(value) {
      if (value == "N/A" || !value || value == null || value == undefined) {
        return value == "N/A" ? value : "-";
      }
      var data = formatdisplayDate(value);
      return data;
    },
    close_dialog() {
      this.$emit("clicked", 0);
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
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="exportDialog"
      @update:model-value="exportDialog = $event"
      persistent
      max-width="420"
    >
      <v-card class="pa-0 rounded-xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Export Asset Reports</span>
          <v-btn icon variant="text" @click="close_dialog()" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="px-6 py-5">
          <v-form ref="form" v-model="isFormValid">
            <!-- Territory Selection -->
            <v-autocomplete
              v-model="selectedTerritory"
              label="Territory"
              :items="territoryItems"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :rules="[v => !!v || 'Territory is required']"
              clearable
              hide-no-data
            >
              <template v-slot:prepend-inner>
                <v-icon color="primary">mdi-map-marker</v-icon>
              </template>
            </v-autocomplete>

            <!-- Distributors Selection -->
            <v-autocomplete
              v-model="selectedDistributor"
              label="Distributors"
              :items="distributorItems"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :rules="[v => !!v || 'Distributors is required']"
              clearable
              hide-no-data
            >
              <template v-slot:prepend-inner>
                <v-icon color="primary">mdi-account-group</v-icon>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 justify-end">
          <v-btn text @click="close_dialog()">Cancel</v-btn>
          <v-btn
            color="primary"
            class="ml-2"
            :loading="loading"
            @click="export_reports()"
            >Export</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { list_all_assets } from "@/graphql/queries.js";
import { get_master_terittory } from "@/mixins/GetMasterTerritory.js";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import axios from "axios";

export default {
  props: {
    exportDialog: Boolean,
  },
  mixins: [get_master_terittory, get_asset_distributors],
  data() {
    return {
      loading: false,
      selectedTerritory: "ALL",
      selectedDistributor: "ALL",
      territoryItems: [],
      distributorItems: [],
      isFormValid: false,
    };
  },
  watch: {
    exportDialog: {
      async handler() {
        if (this.exportDialog) {
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async fetch_details() {
      await Promise.all([
        this.get_master_terittory(),
        this.get_asset_distributors(),
      ]);
      this.populate_territory_items();
      this.populate_distributor_items();
    },
    populate_territory_items() {
      this.territoryItems = [];
      // Add "ALL" option first
      this.territoryItems.push({
        title: "ALL",
        value: "ALL",
      });
      if (this.orgTerittory && Array.isArray(this.orgTerittory)) {
        this.orgTerittory.forEach((element) => {
          this.territoryItems.push({
            title: element.territory_name,
            value: element.territory_id,
          });
        });
      }
    },
    populate_distributor_items() {
      this.distributorItems = [];
      // Add "ALL" option first
      this.distributorItems.push({
        title: "ALL",
        value: "ALL",
      });
      if (
        this.masterAssetDistributors &&
        Array.isArray(this.masterAssetDistributors)
      ) {
        this.masterAssetDistributors.forEach((element) => {
          this.distributorItems.push({
            title: element.asset_distributor_name,
            value: element.asset_distributor_id,
          });
        });
      }
    },
    close_dialog() {
      this.$emit("clicked", false);
      this.selectedTerritory = null;
      this.selectedDistributor = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
        this.$refs.form.reset();
      }
    },
    async export_reports() {

      var data = this.$store.getters.GetUserObj;
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        this.$emit("errorMsg", "Please fill all the required fields");
        return;
      }
      this.loading = true;
      try {
        // Prepare input - exclude "ALL" values
        const input = {
          organization_id: data.organization.organization_id,
          query_type: "EXPORT",
        };

        if (this.selectedTerritory && this.selectedTerritory !== "ALL") {
          input.territory_id = this.selectedTerritory;
        }

        if (this.selectedDistributor && this.selectedDistributor !== "ALL") {
          input.asset_assined_to = this.selectedDistributor;
        }
        if (this.selectedTerritory != "ALL" && this.selectedDistributor != "ALL") {
          input.territory_id = undefined;
        }
        if (
          this.selectedDistributor == "ALL" &&
          this.selectedTerritory == "ALL"
        ) {
          input.filter = false;
        } else {
          input.filter = true;
        }

        let result = await API.graphql(
          graphqlOperation(list_all_assets, { input })
        );
        var response = JSON.parse(result.data.list_all_assets);

        if (response.Status == "SUCCESS") {
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.s3_key,
            details.s3_details
          );
          if (signedUrl) {
            this.download_export_file(signedUrl);
            this.$emit("successMsg", "Asset reports exported successfully");
            this.close_dialog();
          } else {
            this.$emit(
              "errorMsg",
              "Failed to generate signed URL for export file"
            );
          }
        } else {
          this.$emit(
            "errorMsg",
            response.Message || "Failed to export asset reports"
          );
        }
      } catch (error) {
        this.$emit(
          "errorMsg",
          error.errors?.[0]?.message || "Failed to export asset reports"
        );
      } finally {
        this.loading = false;
      }
    },
    async download_export_file(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileName = firstName
        ? firstName + "_Asset_Reports.xlsx"
        : "Asset_Reports.xlsx";
      try {
        const response = await axios({
          url: url,
          method: "GET",
          responseType: "blob",
        });
        if (!response.data) {
          throw new Error("No data received from the server.");
        }
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);

        this.$emit("successMsg", "Asset reports exported successfully");
      } catch (error) {
        console.error("Error downloading the file:", error);
        this.$emit(
          "errorMsg",
          "Error downloading export file: " + error.message
        );
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-btn[variant="text"] {
  color: #888;
}
</style>


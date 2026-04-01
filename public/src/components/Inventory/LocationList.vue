<template>
  <div style="padding-bottom: 70px">
    <!--  eslint-disable 
 -->
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <v-card-text class="pb-0">
          <v-row class="align-center mb-2" no-gutters>
            <v-col cols="auto">
              <v-text-field
                v-model="search"
                placeholder="Search locations..."
                prepend-inner-icon="mdi-magnify"
                variant="solo"
                hide-details
                density="compact"
                class="search-pill mr-4"
                style="min-width: 280px; max-width: 280px; height: 32px; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-size: 14px;"
                clearable
                @click:clear="search = ''"
              ></v-text-field>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <v-btn
                @click="bulk_forward()"
                dark
                v-show="selectedItemsForward.length != 0"
                class="text-capitalize cardCss"
                variant="flat"
                size="small"
              >
                Update
              </v-btn>
            </v-col>
          </v-row>
          <v-data-table
            v-model="selectedItemsForward"
            :fixed-header="fixed"
            :search="search"
            :headers="headers"
            :items="tableData"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            item-key="location_id"
            item-value="location_id"
            :items-per-page="20"
            density="compact"
            class="elevation-2 dtwidth rounded-lg mt-0"
            :multi-select="true"
            show-select
            hover
            hide-default-footer
            @update:modelValue="onSelectionChange"
          >
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-map-marker-outline</v-icon>
                <div class="text-h6 grey--text mb-2">No Location Data Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your search criteria or check back later.
                </div>
              </div>
            </template>
            <template #loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 grey--text">Loading location data...</div>
              </div>
            </template>
            <template v-slot:[`item.location_address`]="{ item }">
              <span>{{
                item.location_address != undefined ? item.location_address : "-"
              }}</span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <!-- Footer bar always rendered -->
      <div
        class="footer-bar d-flex align-center justify-space-between px-6 py-2"
        style="min-height: 56px; background: #f7f8fa"
      >
        <div class="text-caption ml-4" style="color: black; font-size: 14px">
          {{
            tableData.length === 0
              ? "No Results"
              : (pagination.page - 1) * itemsPerPage + 1 +
                " to " +
                Math.min(pagination.page * itemsPerPage, tableData.length) +
                " of " +
                tableData.length +
                " Results"
          }}
        </div>
        <div class="pagination-container d-flex align-center mr-4">
          <v-pagination
            v-model="pagination.page"
            :length="Math.ceil(tableData.length / itemsPerPage)"
            active-color="primary"
            density="comfortable"
            class="pagination-footer"
            :total-visible="5"
            next-icon="mdi-chevron-right"
            prev-icon="mdi-chevron-left"
          />
        </div>
      </div>
    </div>

    <div v-if="componentCheck == 2">
      <LocationUpdate
        :allselecctedRecords="allselecctedRecords"
        :locationDailog="locationDailog"
        @clicked="locationDailog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  <script>
/*eslint-disable*/
import LocationUpdate from "@/components/Inventory/Popups/LocationUpdate.vue";
import { list_all_locations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_workflow_payload } from "@/mixins/GetWorkflowDetails.js";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    LocationUpdate,
  },
  mixins: [get_workflow_payload],
  data() {
    return {
      tableLoading: false,
      selectedItemsForward: [],
      SnackBarComponent: {},

      allselecctedRecords: [],

      locationDailog: false,

      height: 0,
      fixed: true,

      tableData: [],
      search: "",
      componentCheck: 0,

      rowInfo: {},
      overlay: false,
      pagination: {
        page: 1
      },
      itemsPerPage: 20,
      headers: [
        {
          title: "Location",
          key: "location_name",
          sortable: false,
        },

        {
          title: "Location Head",
          key: "location_head",
          sortable: false,
        },

        {
          title: "Location Type",
          key: "location_type",
          sortable: false,
        },

        {
          title: "Address",
          key: "location_address",
          sortable: false,
        },
      ],

      allUSersNames: [],
    };
  },
  created() {
    this.height = window.innerHeight - 280;
    this.tableData = [];
    this.fetch_loaction_records();
  },
  methods: {
    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tableData = [];

      this.locationDailog = false;
      this.selectedItemsForward = [];
      await this.fetch_loaction_records();
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
    bulk_forward() {
      var valid = true;
      this.allselecctedRecords = [];
      if (this.selectedItemsForward.length > 20) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "The maximum number of records that can be forwarded at one time is 20",
          timeout: 5000,
          Top: true,
        };
      }
      if (valid) {
        this.componentCheck = 2;
        this.locationDailog = true;
        this.allselecctedRecords = [];
        
        // Add selected locations with is_product_inventory_space = true
        this.selectedItemsForward.forEach((locationId) => {
          this.allselecctedRecords.push({
            is_product_inventory_space: true,
            location_id: locationId,
          });
        });
        
        // Add unselected locations with is_product_inventory_space = false
        let unselectedLocations = this.tableData.filter(
          (obj) => !this.selectedItemsForward.includes(obj.location_id)
        );
        unselectedLocations.forEach((element) => {
          this.allselecctedRecords.push({
            is_product_inventory_space: false,
            location_id: element.location_id,
          });
        });
      }
    },

    async fetch_loaction_records() {
      this.tableLoading = true;
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_locations, {
            organization_id: data.organization.organization_id,
            location_status: "ACTIVE",
            limit: 500,
            next_token: null,
          })
        );
        this.tableLoading = false;
        this.tableData = result.data.list_all_locations.details;
        this.tableData = this.tableData.filter(
          (obj) => obj.location_type != "SCAN_ANYWHERE"
        );

        let updatedobj = this.tableData.filter(
          (obj) =>
            obj.is_product_inventory_space == null ||
            obj.is_product_inventory_space == true
        );
        this.selectedItemsForward = updatedobj.map(item => item.location_id);
        // console.log("Selected items:", this.selectedItemsForward);
      } catch (error) {
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
    onSelectionChange(selected) {
      this.selectedItemsForward = selected;
     
    },
  },
};
</script>

<style scoped>
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}
.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}
.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}
.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}
.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}
.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}
.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
}
.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}
.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}
.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>
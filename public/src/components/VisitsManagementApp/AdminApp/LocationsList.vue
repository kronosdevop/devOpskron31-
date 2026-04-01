<template>
  <v-card-text>
    <v-data-table
      :headers="headers"
      :fixed-header="fixed"
      :height="CommonVuetifyObj.height - 230"
      :items="tableData"
      :loading="tableLoading"
      :footer-props="{
        itemsPerPageOptions: [10, 20],
      }"
      :items-per-page="itemsPerPage"
      no-data-text="No unverified locations at the moment"
      class="modern-data-table dtwidth"
      hide-default-footer
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-menu>
          <template v-slot:activator="props">
            <v-btn v-bind="props" icon color="transparent" elevation="0">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              ><v-btn
                icon
                elevation="0"
                color="transparent"
                @click="edit_location(item)"
              >
                <v-icon color="green">mdi-pencil</v-icon>
              </v-btn></v-list-item
            >
            <v-list-item
              ><v-btn
                icon
                elevation="0"
                color="transparent"
                @click="delete_location(item)"
              >
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn></v-list-item
            >
            <v-list-item
              ><v-btn
                icon
                elevation="0"
                color="transparent"
                @click="aprove_location(item)"
              >
                <v-icon color="primary">mdi-account-convert-outline</v-icon>
              </v-btn></v-list-item
            >
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${tableData.length} of ${totalItems} unverified locations`
        }}
      </div>
      <div class="pagination-controls">
        <v-btn
          class="pagination-btn"
          :disabled="currentPage === 1"
          variant="text"
          @click="currentPage = currentPage - 1"
          >Previous</v-btn
        >
        <div class="page-numbers">
          <v-btn
            v-for="page in visiblePages"
            :key="page"
            :class="page === currentPage ? 'active-page' : 'inactive-page'"
            :variant="page === currentPage ? 'elevated' : ''"
            @click="currentPage = page"
            >{{ page }}</v-btn
          >
        </div>
        <v-btn
          class="pagination-btn"
          :disabled="
            currentPage === pageCount || (currentPage === pageCount) == 0
          "
          variant="text"
          @click="currentPage = currentPage + 1"
          >Next</v-btn
        >
      </div>
    </div>
  </v-card-text>
  <div v-if="componentCheck == 1">
    <EditVisitorsLoc
      :editvisitorLoaction="editvisitorLoaction"
      @clicked="editvisitorLoaction = false"
      v-on:errorMsg="error_info"
      :rowInfo="rowInfo"
      v-on:successMsg="success_info"
    />
  </div>
  <div v-if="componentCheck == 2">
    <DeleteVisitorloc
      :locationdeletion="locationdeletion"
      @clicked="locationdeletion = false"
      v-on:errorMsg="error_info"
      :rowInfo="rowInfo"
      v-on:successMsg="success_info"
    />
  </div>
  <div v-if="componentCheck == 3">
    <LocationApprove
      :approvalLocation="approvalLocation"
      @clicked="approvalLocation = false"
      v-on:errorMsg="error_info"
      :rowInfo="rowInfo"
      v-on:successMsg="success_info"
    />
  </div>
  <SnackBar :SnackBarComponent="SnackBarComponent" />
</template>
<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import LocationApprove from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/LocationApprove.vue";
import DeleteVisitorloc from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/DeleteVisitorloc.vue";
import EditVisitorsLoc from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/EditVisitorsLoc.vue";
import { list_all_visit_locations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    EditVisitorsLoc,
    DeleteVisitorloc,
    LocationApprove,
  },
  data() {
    return {
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      componentCheck: 0,
      height: 0,
      verifiyTab: 1,
      page: 1,
      currentPage: 1,
      totalItems: 0,
      itemsPerPage: 20,
      locationdeletion: false,
      approvalLocation: false,
      headers: [
        { title: "Name", value: "location_name", sortable: false },
        { title: "Address", value: "address_details", sortable: false },
        { title: "City", value: "city", sortable: false },
        { title: "Contact No ", value: "mobile_number", sortable: false },
        { title: "Ref Id ", value: "location_ref_id", sortable: false },
        { title: "Territories", value: "territory_name", sortable: false },
        { title: "Actions", value: "actions", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      fixed: true,
      editvisitorLoaction: false,
      rowInfo: {},
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  mounted() {
    this.CommonVuetifyObj = useDisplay();
    this.fetch_locationtype();
  },
  methods: {
    aprove_location(item) {
      this.componentCheck = 3;
      this.approvalLocation = true;
      this.rowInfo = item;
    },
    edit_location(item) {
      this.componentCheck = 1;
      this.editvisitorLoaction = true;
      this.rowInfo = item;
    },
    delete_location(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.locationdeletion = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.locationdeletion = false;
      this.editvisitorLoaction = false;
      this.approvalLocation = false;
      this.tableData = [];
      this.fetch_locationtype();
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
    async fetch_locationtype() {
      this.tableLoading = true;
      this.tableData = [];
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_visit_locations, {
            input: {
              nextToken: null,
              limit: 100,
              location_verification_status: "UNVERIFIED",
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_all_visit_locations);

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
          this.totalItems = this.tableData.length;
        }
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
        this.totalItems = 0;

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
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}
</style>

<template>
  <v-card-text>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-data-table
      hide-default-footer
      :headers="TableHeaders"
      :height="CommonVuetifyObj.height - 230"
      :items="tableData"
      :loading="tableLoading"
      :items-per-page="itemsPerPage"
      class="modern-data-table"
      no-data-text="No verified locations at the moment!"
    >
      <template v-slot:[`item.location_name`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="primary" size="small">mdi-id-card</v-icon>
          <div class="ml-2">{{ item.location_name }}</div>
        </div>
      </template>

      <template v-slot:[`item.location_address`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="green" size="small">mdi-map-marker</v-icon>
          <div class="ml-2">{{ item.location_address || "-" }}</div>
        </div>
      </template>

      <template v-slot:[`item.location_type`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="grey" size="small">mdi-axis-arrow</v-icon>
          <div class="ml-2">{{ item.location_type }}</div>
        </div>
      </template>

      <template v-slot:[`item.location_created_on`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="orange" size="small">mdi-clock-outline</v-icon>
          <div class="ml-2">
            {{ getConvertedDate(item.location_created_on) }}
          </div>
        </div>
      </template>

      <template v-slot:[`item.location_created_by`]="{ item }">
        <div class="d-flex align-center">
          <v-icon color="purple" size="small">mdi-id-card</v-icon>
          <div class="ml-2">{{ item.location_name }}</div>
        </div>
      </template>
      <template v-slot:[`item.actions`]>
        <v-btn icon color="transparent" elevation="0">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${tableData.length} of ${totalItems} verified locations`
        }}
      </div>
      <div class="pagination-controls">
        <v-btn
          class="pagination-btn"
          :disabled="currentPage === 1"
          variant="text"
          @click="currentPage === currentPage - 1"
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
          :disabled="currentPage === pageCount"
          variant="text"
          @click="currentPage === currentPage + 1"
          >Next</v-btn
        >
      </div>
    </div>
  </v-card-text>
</template>

<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import { list_all_visit_locations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: { SnackBar },
  data: () => ({
    height: 0,
    page: 1,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    SnackBarComponent: {},
    CommonVuetifyObj: {},
    tableData: [],
    TableHeaders: [
      { title: "Name", value: "location_name", sortable: false },
      { title: "Address", value: "location_address", sortable: false },
      { title: "Location Type ", value: "location_type", sortable: false },
      { title: "Created On ", value: "location_created_on", sortable: false },
      { title: "Created By", value: "location_created_by", sortable: false },
      { title: "Actions", value: "actions", sortable: false },
    ],
  }),
  computed: {
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
  async mounted() {
    this.CommonVuetifyObj = useDisplay();
    this.fetch_locationtype();
  },
  methods: {
    async fetch_locationtype() {
      this.tableLoading = true;
      this.tableData = [];
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_visit_locations, {
            input: {
              nextToken: null,
              limit: 100,
              location_verification_status: "VERIFIED",
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_all_visit_locations);
        if (response.Status === "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data || [];
          this.totalItems = this.tableData.length;
        } else {
          this.tableLoading = false;
          this.tableData = [];
          this.totalItems = 0;
        }
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    getConvertedDate(location_created_on) {
      if (!location_created_on) return "-";
      const date = new Date(location_created_on * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const [yyyy, mm, dd] = date.toISOString().substring(0, 10).split("-");
      return `${dd}-${mm}-${yyyy}`;
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

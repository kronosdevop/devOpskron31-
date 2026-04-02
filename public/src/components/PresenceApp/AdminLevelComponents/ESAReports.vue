<template>
  <div>
    <!--eslint-disable-->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat class="pa-4">
      <v-data-table
        :headers="headers"
        :items="sortedAndPaginatedItems"
        :loading="tableLoading"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        :server-items-length="totalCount"
        hide-default-footer
        class="elevation-2 dtwidth text-caption rounded-lg modern-data-table"
        density="compact"
        hover
        multi-sort
        :height="tableHeight"
        @update:sort-by="handleSortChange"
      >
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey lighten-1" class="mb-4"
              >mdi-chart-timeline-variant</v-icon
            >
            <div class="text-h6 grey--text mb-2">No ESA Reports Found</div>
            <div class="text-body-2 grey--text">
              Try adjusting your search criteria or month selection.
            </div>
          </div>
        </template>

        <template v-slot:loading>
          <div class="text-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="32"
              class="mb-4"
            ></v-progress-circular>
            <div class="text-body-2 text-grey">
              Loading ESA reports...
            </div>
          </div>
        </template>

        <!-- Name -->
        <template v-slot:[`item.user_name`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="20" color="primary" class="mr-3">mdi-account</v-icon> -->
            <div>
              <div class="font-weight-medium text-body-2">
                {{ item.user_name }}
              </div>
            </div>
          </div>
        </template>

        <!-- Request Amount -->
        <template v-slot:[`item.amount_requested`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="orange" class="mr-2">mdi-currency-usd</v-icon> -->
            <span class="caption font-weight-medium orange--text">{{ item.amount_requested || '-' }}</span>
          </div>
        </template>

        <!-- Approved Amount -->
        <template v-slot:[`item.approved_amount`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="green" class="mr-2">mdi-check-circle</v-icon> -->
            <span class="caption font-weight-medium green--text">{{ item.approved_amount || '-' }}</span>
          </div>
        </template>

        <!-- Requested On -->
        <template v-slot:[`item.transaction_created_on`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="blue" class="mr-2">mdi-calendar-plus</v-icon> -->
            <span class="caption font-weight-medium">{{ get_date(item.transaction_created_on) }}</span>
          </div>
        </template>

        <!-- Acted On -->
        <template v-slot:[`item.transaction_approved_on`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="purple" class="mr-2">mdi-calendar-check</v-icon> -->
            <span class="caption font-weight-medium">{{ item.transaction_approved_on != undefined ? get_date(item.transaction_approved_on) : "-" }}</span>
          </div>
        </template>

        <!-- Approved Status -->
        <template v-slot:[`item.approve_status`]="{ item }">
          <v-chip
            v-if="item.approve_status == 'APPROVED'"
            color="success"
            size="small"
            variant="flat"
            class="font-weight-medium"
          >
            <v-icon size="14" class="mr-1">mdi-check</v-icon>
            {{ item.approve_status }}
          </v-chip>
          <v-chip
            v-else-if="item.approve_status == 'PENDING'"
            color="warning"
            size="small"
            variant="flat"
            class="font-weight-medium"
          >
            <v-icon size="14" class="mr-1">mdi-clock</v-icon>
            {{ item.approve_status }}
          </v-chip>
          <v-chip
            v-else
            color="error"
            size="small"
            variant="flat"
            class="font-weight-medium"
          >
            <v-icon size="14" class="mr-1">mdi-close</v-icon>
            {{ item.approve_status }}
          </v-chip>
        </template>
      </v-data-table>

      <!-- Modern Table Footer -->
      <div class="table-footer">
        <div class="footer-info">
          {{
            totalCount === 0
              ? "No Results"
              : `Showing ${sortedAndPaginatedItems.length} of ${totalCount} ESA reports`
          }}
        </div>
        <div class="pagination-controls">
          <v-btn
            :disabled="currentPage === 1"
            variant="text"
            size="small"
            class="pagination-btn"
            @click="currentPage = currentPage - 1"
            style="color: #666 !important;"
          >
            Previous
          </v-btn>
          <div class="page-numbers">
            <v-btn
              v-for="page in visiblePages"
              :key="page"
              :variant="page === currentPage ? 'elevated' : 'text'"
              size="small"
              :class="page === currentPage ? 'active-page' : 'inactive-page'"
              @click="currentPage = page"
              :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'"
            >
              {{ page }}
            </v-btn>
          </div>
          <v-btn
            :disabled="currentPage === pageCount"
            variant="text"
            size="small"
            class="pagination-btn"
            @click="currentPage = currentPage + 1"
            style="color: #666 !important;"
          >
            Next
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import moment from "moment";
import SnackBar from "@/components/SnackBar.vue";
import { list_organization_earlysalary_trans } from "@/graphql/queries.js";
import { earlysalary_reports_generartion } from "@/graphql/mutations.js";
import axios from "axios";
const FileSaver = require("file-saver");
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  props: {
    selectedYear: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    selectedMonth: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selectedDate: "",
      tableHeight: 0,
      headers: [
        {
          title: "Name",
          value: "user_name",
          sortable: true,
          align: "start",
        },
        { 
          title: "Request Amount", 
          value: "amount_requested", 
          sortable: true,
          align: "start",
        },
        { 
          title: "Approved Amount", 
          value: "approved_amount",
          sortable: true,
          align: "start",
        },
        { 
          title: "Requested On", 
          value: "transaction_created_on",
          sortable: true,
          align: "start",
        },
        { 
          title: "Acted On", 
          value: "transaction_approved_on",
          sortable: true,
          align: "start",
        },
        { 
          title: "Approved Status", 
          value: "approve_status",
          sortable: true,
          align: "start",
        },
      ],
      tableData: [],
      tableLoading: false,
      SnackBarComponent: {},
      loading: false,
      formattedDate: "",
      sortBy: [{ key: "user_name", order: "asc" }],
      itemsPerPage: 20,
      currentPage: 1,
    };
  },
  computed: {
    totalCount() {
      return this.tableData.length;
    },
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
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
    sortedAndPaginatedItems() {
      // First sort the paginated items
      const sortedItems = this.paginatedItems.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });
      return sortedItems;
    },
  },
  async mounted() {
    this.tableHeight = window.innerHeight - 250;
    await this.get_data();
  },
  watch: {
    selectedYear() {
      this.get_data();
    },
    selectedMonth() {
      this.get_data();
    },
    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.next_token) {
        // User is going to next page and we have more data to load
        this.get_all_transaction();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  },
  methods: {
    async get_data() {
      this.next_token = null;
      this.tableData = [];
      this.currentPage = 1;
      await this.fecth_date();
      await this.get_all_transaction();
      
      // Emit filter applied event
      this.$emit('filter-applied', {
        selectedYear: this.selectedYear,
        selectedMonth: this.selectedMonth,
        totalCount: this.tableData.length
      });
    },
    fecth_date() {
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };

      // Use props for year and month
      const selectedMonth = this.selectedMonth || "Jan";
      const selectedYear = this.selectedYear || new Date().getFullYear();

      const month = parseInt(monthMap[selectedMonth], 10);
      const year = parseInt(selectedYear, 10);
      this.formattedDate = `${month.toString().padStart(2, '0')}-${year}`;
    },
    async get_all_transaction() {
      await this.fecth_date();
      // console.log(this.date1);
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_organization_earlysalary_trans, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_month: this.formattedDate,
              limit: 50,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(
          result.data.list_organization_earlysalary_trans
        );

        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
        } else {
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },
    get_month() {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = String(currentDate.getFullYear());
      const currentMonth = `${month}-${year}`;
      return currentMonth;
    },
    get_date(date) {
      return formatedatetime(date);
      // let a = new Date(date * 1000).toLocaleTimeString("en-In", {
      //   year: "numeric",
      //   month: "2-digit",
      //   day: "2-digit",
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   second: "2-digit",
      // });
      // return a.toUpperCase();
    },
    // get_date(val) {
    //   const d = new Date(parseInt(val) * 1000);
    //   var date = d.getDate().toLocaleString();
    //   var month = (d.getMonth() + 1).toLocaleString();
    //   var year = d.getFullYear();

    //   return (
    //     (+date <= 9 ? "0" + date : date) +
    //     "/" +
    //     (+month <= 9 ? "0" + month : month) +
    //     "/" +
    //     year
    //   );
    // },
    generate_report() {
      if (this.tableData.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "No Records To Generate",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.all_generate_report();
      }
    },
    async all_generate_report() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(earlysalary_reports_generartion, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_month: this.formattedDate,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.earlysalary_reports_generartion);

        if (response.Status == "SUCCESS") {
          await this.download_invoice(response.data);
          this.loading = false;

          // window.open(response.data, "_blank");
          // this.loading = response.data;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
      }
    },
    async download_invoice(url) {
      var fileName = "ESA Report" + ".xlsx";
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
    handleSortChange(value) {
      this.sortBy = value;
    },
    getSortValue(value, key) {
      if (value === undefined || value === null) return "";
      // For string fields
      if (key === "user_name" || key === "approve_status") {
        return value.toString().toLowerCase();
      }
      // For numeric fields
      if (key === "amount_requested" || key === "approved_amount") {
        return parseFloat(value) || 0;
      }
      // For date fields
      if (key === "transaction_created_on" || key === "transaction_approved_on") {
        return value ? new Date(value * 1000).getTime() : 0;
      }
      return value;
    },

    generate_report() {
      if (this.tableData.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "No Records To Generate",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.all_generate_report();
      }
    },

    async all_generate_report() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(earlysalary_reports_generartion, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_month: this.formattedDate,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.earlysalary_reports_generartion);

        if (response.Status == "SUCCESS") {
          await this.download_invoice(response.data);
          this.loading = false;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
      }
    },

    async download_invoice(url) {
      var fileName = "ESA Report" + ".xlsx";
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
  },
};
</script>

<style scoped>
/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-info {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-weight: 500;
  text-transform: none;
  min-width: 80px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 6px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 6px;
  min-width: 32px;
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

.textWrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
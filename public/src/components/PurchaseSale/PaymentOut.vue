<template>
  <div class="pa-4">
    <v-card class="" flat>
      <v-card-text>
        <PaymentOutDialog
          :DialogPaymentOut="DialogPaymentOut"
          @clicked="DialogPaymentOutEmit(1)"
          @successMsg="handleSuccess"
          @errorMsg="handleError"
        />
        
        <v-data-table
          :headers="TableHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="CommonVuetifyObj.height - 270"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-center">
              <v-btn
                icon
                variant="text"
                size="small"
                color="primary"
                @click="previewPayment(item)"
                title="Preview Payment Receipt"
                class="mr-1"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-cash-minus</v-icon
              >
              <div class="text-h6 text-grey mb-2">
                No Payment-Out Records Found
              </div>
              <div class="text-body-2 text-grey">
                Create your first payment-out record to get started.
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
                Loading payment-out records...
              </div>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalItems} payment-out records`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage - 1"
              style="color: #666 !important"
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
                :style="
                  page === currentPage
                    ? 'background: #DB4C77 !important; color: white !important;'
                    : 'color: #666 !important;'
                "
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
              style="color: #666 !important"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <PaymentOutPreviewDialog
      v-model="DialogPaymentPreview"
      :payment-data="selectedPaymentForPreview"
      :entity-data="entityData"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { list_all_payment_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
import PaymentOutDialog from "./PaymentOutDialog.vue";
import PaymentOutPreviewDialog from "./PaymentOutPreviewDialog.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: { PaymentOutDialog, PaymentOutPreviewDialog, SnackBar },
  mixins: [get_organization_entity],
  data: () => ({
    DialogPaymentOut: false,
    DialogPaymentPreview: false,
    selectedPaymentForPreview: null,

    CommonVuetifyObj: {},

    SnackBarComponent: {},

    entityData: {},
    selectedEntity: null,

    tableLoading: false,
    tableData: [],
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,

    TableHeaders: [
      { title: "Date", value: "transaction_date", sortable: false, width: "120px" },
      { title: "Ref No", value: "invoice_no", sortable: false, width: "150px" },
      {
        title: "Party Name",
        value: "transaction_details",
        sortable: false,
        width: "200px",
      },
      { title: "Total", value: "total_cost", sortable: false, width: "120px" },
      { title: "Paid", value: "received_cost", sortable: false, width: "120px" },
      { title: "Balance", value: "balance_cost", sortable: false, width: "120px" },
      { title: "Actions", value: "actions", sortable: false, width: "120px" },
    ],
  }),
  computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
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
  async mounted() {
    this.CommonVuetifyObj = useDisplay();
    await this.loadEntityData();
    this.loadPaymentOutRecords();
  },
  methods: {
    // Method to expose dialog functionality to parent component
    openPaymentOutDialog() {
      this.DialogPaymentOut = true;
    },

    DialogPaymentOutEmit() {
      this.DialogPaymentOut = false;
      this.loadPaymentOutRecords(); // Reload data after adding new record
    },

    handleSuccess(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadPaymentOutRecords(); // Reload payment-out records after successful creation
    },

    handleError(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
    },

    previewPayment(paymentItem) {
      this.selectedPaymentForPreview = paymentItem;
      this.DialogPaymentPreview = true;
    },

    async loadEntityData() {
      await this.get_organization_entity();
      // console.log("Raw entitylist:", this.entitylist);
      let entity = this.entitylist.find((entity) => entity.is_default === true);
      // console.log("Entity:", entity);
      this.entityData = entity;
      

    },

    async loadPaymentOutRecords() {
      // TODO: Implement actual API call to load payment-out records
      try {
        this.tableLoading = true;
        const response = await API.graphql(
          graphqlOperation(list_all_payment_transactions, {
            input: {
              limit: 100,
              nextToken: null,
              transaction_type: "PAYMENT_OUT",
            },
          })
        );
        const responseData = JSON.parse(
          response.data.list_all_payment_transactions
        );
        // console.log(responseData);
        if (responseData.Status === "SUCCESS") {
          this.tableData = responseData.data;
          this.totalItems = responseData.data.length;
        }
        else{
          this.tableData = [];
          this.totalItems = 0;
        }
        
        this.tableLoading = false;
      } catch (error) {
        console.error("Error loading payment-out records:", error);
        this.tableData = [];
        this.totalItems = 0;
        this.tableLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}
.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}
.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}
</style>

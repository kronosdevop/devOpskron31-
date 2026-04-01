<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-chart-line</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Sales</span>
          <span class="header-subtitle"
            >Manage sales data and configurations</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Create Quotation Button -->
        <v-btn
          v-if="salesToggle === 'quotation'"
          @click="createQuotation()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Quotation</span>
        </v-btn>

        <!-- Create Proforma Button -->
        <v-btn
          v-if="salesToggle === 'proforma'"
          @click="createProforma()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Proforma</span>
        </v-btn>

        <!-- Create Sales Order Button -->
        <v-btn
          v-if="salesToggle === 'sales-order'"
          @click="createSalesOrder()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Order</span>
        </v-btn>

        <!-- Create Invoice Button -->
        <v-btn
          v-if="salesToggle === 'invoice'"
          @click="createInvoice()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Invoice</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="salesToggle"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
          
        >
          <!-- <v-tab value="dashboard" class="tab-btn"> Dashboard </v-tab> -->
          <v-tab value="quotation" class="tab-btn"> Quotation </v-tab>
          <v-tab value="sales-order" class="tab-btn"> Sales Order </v-tab>
          <v-tab value="proforma" class="tab-btn"> Proforma  </v-tab>
         
          <v-tab value="invoice" class="tab-btn"> Invoice </v-tab>
          <v-tab value="settings" class="tab-btn"> Settings </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Dashboard Tab Content -->
    <!-- <div class="text-left" v-if="salesToggle === 'dashboard'">
      <div class="pa-4">
        <h2>Sales Dashboard</h2>
        <p>Dashboard content will go here</p>
      </div>
    </div> -->

    <!-- Quotation Tab Content -->
    <div class="text-left" v-if="salesToggle === 'quotation'">
      <Quotation ref="quotationComponent" />
    </div>
    <div class="text-left" v-if="salesToggle === 'proforma'">
      <Proforma ref="proformaComponent" />
    </div>

    <!-- Sales Order Tab Content -->
    <div class="text-left" v-if="salesToggle === 'sales-order'">
      <SalesOrder ref="salesOrderComponent" />
    </div>

    <!-- Invoice Tab Content -->
    <div class="text-left" v-if="salesToggle === 'invoice'">
      <SalesInvoice ref="salesInvoiceComponent" />
    </div>

    <!-- Settings Tab Content -->
    <div class="text-left" v-if="salesToggle === 'settings'">
      <SalesSettings />
    </div>
  </div>

</template>

<script>
/* eslint-disable */
import SalesSettings from "@/components/Sales/SalesSettings.vue";
import SalesInvoice from "@/components/Sales/SalesInvoice.vue";
import SalesOrder from "@/components/Sales/SalesOrder.vue";
import Quotation from "@/components/Sales/Quotation.vue";
import Proforma from "@/components/Sales/Proforma.vue";

export default {
  components: {
    SalesSettings,
    SalesInvoice,
    SalesOrder,
    Quotation,
    Proforma,
  },

  data() {
    return {
      salesToggle: "quotation",
    };
  },

  methods: {
    createQuotation() {
      // Emit event to child component to show create dialog
      this.$refs.quotationComponent?.openCreateDialog();
    },

    createProforma() {
      // Emit event to child component to show create dialog
      this.$refs.proformaComponent?.openCreateDialog();
    },

    createSalesOrder() {
      // Emit event to child component to show create dialog
      this.$refs.salesOrderComponent?.openCreateDialog();
    },

    createInvoice() {
      // Emit event to child component to show create dialog
      this.$refs.salesInvoiceComponent?.openCreateDialog();
    },
  },
};
</script>

<style scoped>
/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #DB4C77 !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}
</style>

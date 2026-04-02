<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
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
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <!-- Create Quotation Button -->
        <v-btn
          v-if="salesToggle === 'quotation'"
          @click="createQuotation()"
          class="action-btn mr-4"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Quotation</span>
        </v-btn>

        <!-- Create Proforma Button -->
        <v-btn
          v-if="salesToggle === 'proforma'"
          @click="createProforma()"
          class="action-btn mr-4"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Proforma</span>
        </v-btn>

        <!-- Create Sales Order Button -->
        <v-btn
          v-if="salesToggle === 'sales-order'"
          @click="createSalesOrder()"
          class="action-btn mr-4"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Order</span>
        </v-btn>

        <!-- Create Invoice Button -->
        <v-btn
          v-if="salesToggle === 'invoice'"
          @click="createInvoice()"
          class="action-btn mr-4"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Invoice</span>
        </v-btn>

        <!-- Add Payment-In Button -->
        <v-btn
          v-if="salesToggle === 'paymentin'"
          @click="addPaymentIn()"
          class="action-btn mr-4"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Payment Received</span>
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
          <v-tab value="proforma" class="tab-btn"> Proforma </v-tab>
          <v-tab value="invoice" class="tab-btn"> Invoice </v-tab>
          <v-tab value="paymentin" class="tab-btn"> Payment Received </v-tab>
          <v-tab value="emailtemplates" class="tab-btn">
            Email Templates
          </v-tab>
          <v-tab value="settings" class="tab-btn"> Settings </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

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

    <!-- Payment In Content -->
    <div class="text-left" v-if="salesToggle === 'paymentin'">
      <PaymentIn ref="paymentInComponent" />
    </div>

    <!-- Email Templates Content -->
    <div class="text-left" v-if="salesToggle === 'emailtemplates'">
      <EmailTemplates />
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
import PaymentIn from "@/components/Sales/PaymentIn.vue";
import EmailTemplates from "@/components/Sales/EmailTemplates.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    SalesSettings,
    SalesInvoice,
    SalesOrder,
    Quotation,
    Proforma,
    PaymentIn,
    EmailTemplates,
    CreateExternalTicketDialog,
  },

  data() {
    return {
      salesToggle: "quotation",

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  methods: {
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
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

    addPaymentIn() {
      // Emit event to child component to show payment-in dialog
      this.$refs.paymentInComponent?.openPaymentInDialog();
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

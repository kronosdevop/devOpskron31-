<template>
  <div>
    <v-card flat class="mt-2" >
      <v-card-text>
        <v-tabs
          v-model="verifiyTab"
          align="left"
          class="my-tabs mt-n4"
          grow
          color="primary"
        >
          <v-tab value="quotation" class="text-capitalize">
            Quotation Email Template
          </v-tab>
          <v-tab value="billing" class="text-capitalize">
            Billing Email Template
          </v-tab>
          <v-tab value="proforma" class="text-capitalize">
            Proforma Email Template
          </v-tab>
        </v-tabs>

        <v-window v-model="verifiyTab" class="mt-4">
          <v-window-item value="quotation">
            <v-card flat >
              <QuotationEmailTemplate />
            </v-card>
          </v-window-item>

          <v-window-item value="billing">
            <v-card flat >
              <BillingEmailTemplate />
            </v-card>
          </v-window-item>

          <v-window-item value="proforma">
            <v-card flat >
              <ProformaEmailTemplate />
            </v-card>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import ProformaEmailTemplate from "@/components/QuotationBuilder/PopupsDialogues/ProformaEmailTemplate.vue";
import QuotationEmailTemplate from "./PopupsDialogues/QuotationEmailTemplate.vue";
import BillingEmailTemplate from "./PopupsDialogues/BillingEmailTemplate.vue";
export default {
  components: {
    QuotationEmailTemplate,
    BillingEmailTemplate,
    ProformaEmailTemplate,
  },
  data() {
    return {
      verifiyTab: "quotation",
    };
  },
};
</script>

<style scoped>
.my-tabs {
  background-color: transparent;
}

.my-tabs :deep(.v-tab) {
  text-transform: capitalize;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  margin-right: 4px;
}

.my-tabs :deep(.v-tab--selected) {
  background-color: white;
  color: var(--v-primary-base);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.my-tabs :deep(.v-tab:not(.v-tab--selected)) {
  background-color: rgba(255, 255, 255, 0.7);
  color: rgba(0, 0, 0, 0.7);
}

.my-tabs :deep(.v-tab:hover) {
  background-color: rgba(255, 255, 255, 0.9);
}

.v-window {
  background-color: white;
  border-radius: 0 8px 8px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>   
<template>
  <div class="d-flex justify-center">
    <v-card elevation="3" rounded="lg" height="77vh" width="60%" class="card">
      <!--Toolbar-->
      <v-toolbar color="transparent">
        <v-tooltip
          text="🚨 If you want to notify a specific team within an organisation, use the
          suborganisation filter."
          location="top"
        >
          <template #activator="{ props }">
            <v-toolbar-title v-bind="props">API</v-toolbar-title>
          </template>
        </v-tooltip>

        <v-spacer></v-spacer>
        <!--Organisation-->
        <v-select
          v-model="organisation"
          label="Category"
          variant="outlined"
          density="compact"
          rounded="lg"
          max-width="200"
          class="mr-4 mt-7"
          :items="OrganisationItems"
          item-title="title"
          item-value="value"
          clearable
        />
        <!--Suborganisation-->
        <v-select
          v-model="suborganisation"
          label="Subcategory"
          :items="SuborganisationItems"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="compact"
          rounded="lg"
          max-width="200"
          class="mt-7 mr-4"
          :disabled="!organisation"
          clearable
        />
        <!--Back Button-->
        <v-btn rounded="lg" variant="flat" color="primary" class="mt-1 mr-2" @click="$emit('exit-back')">
          <v-icon color="white">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>

      <!--API Details-->
      <v-row class="pa-5" v-if="!isLoading">
        <v-col cols="6" md="6">
          <span>
            <div class="font-weight-bold">Broadcast API Key</div>
            <div style="font-size: 14px" class="mt-2">
              {{ broadcast_api_key }}
            </div>
          </span>
        </v-col>

        <v-col cols="6" md="6">
          <span>
            <div class="font-weight-bold mr-2">API Details</div>
            <div style="font-size: 14px" class="mt-2">{{ api_details }}</div>
          </span>
        </v-col>

        <v-col cols="6" md="6">
          <span>
            <div class="font-weight-bold mr-2">Category ID</div>
            <div style="font-size: 14px" class="mt-2">
              {{ selectedCategoryId }}
            </div>
          </span>
        </v-col>

        <v-col cols="6" md="6">
          <span>
            <div class="font-weight-bold mr-2">Ticket Type ID</div>
            <div style="font-size: 14px" class="mt-2">
              {{ selectedTicketTypeId || "Chose a subcategory to view. " }}
            </div>
          </span>
        </v-col>

        <v-col cols="6" md="6" class="font-weight-bold">
          Payload Examples
        </v-col>
        <v-col cols="12" md="12" class="mt-n4">
          <v-textarea
            v-model="payloads"
            rounded="lg"
            variant="outlined"
            rows="10"
            readonly
          />
        </v-col>
      </v-row>

      <!-- Loader -->
      <v-row
        v-else
        class="fill-height d-flex align-center justify-center text-center"
      >
        <span>
          <v-progress-circular indeterminate size="50" color="primary" />
          <div class="mt-2">Loading API details...</div>
        </span>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import { GetAllApiDetails } from "@/mixins/GetAllApiDetails";

export default {
  props: {},

  mixins: [GetAllApiDetails],

  data: () => ({
    organisation: "",
    suborganisation: "",
    payloads: "",
    broadcast_api_key: "",
    api_details: "",
    ApiInvokeUrl: "",
    selectedCategoryId: "",
    selectedTicketTypeId: "",

    isLoading: true,

    ListAllApiDetails: [],
  }),

  watch: {
    organisation() {
      this.suborganisation = "";
      this.updateDisplayedData();
    },
    suborganisation() {
      this.updateDisplayedData();
    },
  },

  computed: {
    OrganisationItems() {
      return (
        this.ListAllApiDetails.map((c) => ({
          title: c.category_name,
          value: c.category_id,
        })) || []
      );
    },
    SuborganisationItems() {
      const selected = this.ListAllApiDetails.find(
        (c) => c.category_id === this.organisation
      );
      return (
        selected?.ticket_types?.map((t) => ({
          title: t.ticket_type_name,
          value: t.ticket_type_id,
        })) || []
      );
    },
  },

  async mounted() {
    await this.GetAllApiDetailsMethod();

    if (this.ListAllApiDetails.length > 0) {
      this.organisation = this.ListAllApiDetails[0].category_id;
      const firstCategory = this.ListAllApiDetails[0];
      if (firstCategory.ticket_types && firstCategory.ticket_types.length > 0) {
        this.suborganisation = firstCategory.ticket_types[0].ticket_type_id;
      }
    }

    this.updateDisplayedData();

    this.isLoading = false;
  },

  methods: {
    updateDisplayedData() {
      const selectedCategory = this.ListAllApiDetails.find(
        (c) => c.category_id === this.organisation
      );

      if (!selectedCategory) {
        this.broadcast_api_key = "";
        this.payloads = "";
        this.selectedCategoryId = "";
        this.selectedTicketTypeId = "";
        return;
      }

      this.selectedCategoryId = selectedCategory.category_id;
      this.broadcast_api_key = selectedCategory.broadcast_api_key;
      this.api_details = this.ApiInvokeUrl;

      if (!this.suborganisation) {
        this.selectedTicketTypeId = "";
        this.payloads = JSON.stringify(
          selectedCategory.example_payloads?.using_category_id || {},
          null,
          2
        );
        return;
      }

      const selectedTicketType = selectedCategory.ticket_types.find(
        (t) => t.ticket_type_id === this.suborganisation
      );

      this.selectedTicketTypeId = selectedTicketType?.ticket_type_id || "";

      const payloadObj =
        selectedCategory.example_payloads?.using_ticket_type_id?.find(
          (p) => p.ticket_type_id === this.suborganisation
        );

      this.payloads = JSON.stringify(payloadObj || {}, null, 2);
    },
    resetDisplayedData() {
      this.broadcast_api_key = "";
      this.api_details = "";
      this.payloads = "";
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
</style>

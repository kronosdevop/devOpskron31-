<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="$emit('update:dialog', $event)"
    max-width="600px"
    persistent
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center">
          <v-icon left color="primary" class="mr-2">mdi-account-plus</v-icon>
          <span class="font-weight-bold text-h5">Add New Lead</span>
        </div>
        <v-btn icon variant="text" @click="cancel" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-4 py-3">
        <v-row class="ma-0">
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              v-model="leadData.name"
              label="Lead Name"
              placeholder="Enter lead name"
              required
              variant="outlined"
              density="compact"
              :rules="[(v) => !!v || 'Lead name is required']"
              counter="50"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              v-model="leadData.email"
              label="Email"
              placeholder="Enter email address"
              variant="outlined"
              density="compact"
              type="email"
              :rules="[
                (v) => !v || /.+@.+\..+/.test(v) || 'Email must be valid',
              ]"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              v-model="leadData.phone"
              label="Phone"
              placeholder="Enter phone number"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" class="pa-2">
            <v-select
              v-model="leadData.stageIndex"
              :items="stageOptions"
              label="Select Stage"
              item-title="stage_name"
              item-value="stage_id"
              variant="outlined"
              density="compact"
              :loading="dropDownLoading"
              required
              :rules="[(v) => v !== null || 'Please select a stage']"
            ></v-select>
          </v-col>
          <v-col cols="12" class="pa-2">
            <v-textarea
              v-model="leadData.details"
              label="Details"
              placeholder="Enter lead details or notes"
              variant="outlined"
              density="compact"
              rows="3"
              counter="200"
            ></v-textarea>
          </v-col>
          <v-col cols="12" class="pa-2">
            <v-radio-group
              v-model="leadData.type"
              label="Type"
              inline
              density="compact"
            >
              <v-radio
                label="Product"
                value="PRODUCT"
                color="primary"
              ></v-radio>
              <v-radio
                label="Service"
                value="SERVICE"
                color="primary"
              ></v-radio>
            </v-radio-group>
          </v-col>
          <v-col
            cols="12"
            md="6"
            v-if="leadData.type === 'PRODUCT'"
            class="pa-2"
          >
            <v-select
              v-model="leadData.product"
              :items="productOptions"
              label="Select Product"
              multiple
              item-title="text"
              item-value="value"
              :loading="dropDownLoading"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-package-variant"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              v-model="leadData.deadline"
              label="Deadline"
              type="date"
              variant="outlined"
              density="compact"
              :min="today"
              prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="px-4 py-3 justify-end">
        <v-btn text @click="cancel">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          @click="confirm"
          :disabled="!isValidLead"
        >
          <v-icon left>mdi-check</v-icon>
          Add Lead
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { create_crm_leads } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_inventory_items } from "@/mixins/GetInventoryItems.js";
import { list_pipeline_stages } from "@/graphql/queries.js";
import { list_user_app_subscribers } from "@/graphql/queries.js";
export default {
  name: "AddLeadDialog",
  mixins: [get_inventory_items],
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      stageOptions: [],
      loading: false,
      dropDownLoading: false,
      dashboardId: "",
      userAppSubscribers: [],
      leadData: {
        name: "",
        email: "",
        phone: "",
        details: "",
        stageIndex: null,
        type: "PRODUCT",
        product: [],
        deadline: "",
      },
    };
  },
  computed: {
    isValidLead() {
      return (
        this.leadData.name.trim() !== "" && this.leadData.stageIndex !== null
      );
    },
    today() {
      return new Date().toISOString().split("T")[0];
    },
    productOptions() {
      // Get current user's subscribed products
      const currentUser = this.userAppSubscribers.find(
        (element) =>
          element.client_id ==
          this.$store.getters.GetUserObj.user?.user_email_id
      );
      
      // If no current user found, return empty array
      if (!currentUser || !currentUser.products) {
        return [];
      }
      
      // Filter masterItems to only include products that currentUser has subscribed to
      return this.masterItems
        .filter((item) => currentUser.products.includes(item.item_id))
        .map((item) => ({
          text: item.item_name,
          value: item.item_id,
        }));
    },
  },
  methods: {
    async fetch_user_app_subscribers() {
      let result = await API.graphql(
        graphqlOperation(list_user_app_subscribers, {
          input: {
            dashboard_id: this.dashboardId,
          },
        })
      );
      let response = JSON.parse(result.data.list_user_app_subscribers);
      if (response.Status == "SUCCESS") {
        this.userAppSubscribers = response.data;
        // console.log(this.$store.getters.GetUserObj.user?.user_email_id);
        let currentUser = this.userAppSubscribers.find(
          (element) =>
            element.client_id ==
            this.$store.getters.GetUserObj.user?.user_email_id
        );
        // console.log(currentUser);
      } else {
        this.$emit("errorMsg", response.Message);
      }
    },
    async fetch_pipeline_stages() {
      let result = await API.graphql(
        graphqlOperation(list_pipeline_stages, {})
      );
      let response = JSON.parse(result.data.list_pipeline_stages);
      if (response.Status == "SUCCESS") {
        this.stageOptions = response.data;
      } else {
        this.$emit("errorMsg", response.Message);
      }
    },
    findProductName(product) {
      return this.productOptions
        .filter((item) => product.includes(item.value))
        .map((item) => item.text);
    },
    async confirm() {
      if (this.isValidLead) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(create_crm_leads, {
              input: {
                stage_id: this.leadData.stageIndex,
                lead_name: this.leadData.name,
                lead_email: this.leadData.email,
                lead_phone_no: this.leadData.phone,
                lead_details: this.leadData.details,
                lead_type: this.leadData.type,
                products: this.leadData.product,
                products_name: this.findProductName(this.leadData.product),
                lead_dead_line: this.leadData.deadline
                  ? new Date(this.leadData.deadline).getTime() / 1000
                  : undefined,
              },
            })
          );
          let response = JSON.parse(result.data.create_crm_leads);
          if (response.Status == "SUCCESS") {
            this.$emit(
              "successMsg",
              `Lead "${this.leadData.name}" added successfully!`
            );

            this.resetForm();
          } else {
            this.$emit("errorMsg", "Failed to add lead. Please try again.");
          }
        } catch (error) {
          this.$emit("errorMsg", "Failed to add lead. Please try again.");
        } finally {
          this.loading = false;
        }
      } else {
        this.$emit("errorMsg", "Please fill in all required fields.");
      }
    },
    cancel() {
      this.$emit("cancel");
      this.resetForm();
    },
    resetForm() {
      this.leadData = {
        name: "",
        email: "",
        phone: "",
        details: "",
        stageIndex: null,
        type: "PRODUCT",
        product: [],
        deadline: "",
      };
    },

  },
  watch: {
    async dialog(newVal) {
      if (newVal) {
        let appObj = this.$store.getters.GetUserObj.user_apps;
        appObj.forEach((element) => {
          if (element.dashboard_unique_type == "CUSTOMERS_ADMINS") {
            this.dashboardId = element.dashboard_id;
          }
        });
        this.dropDownLoading = true;
        this.resetForm();
        await this.fetch_user_app_subscribers();
        await this.get_inventory_items();
    
        await  this.fetch_pipeline_stages();
        this.dropDownLoading = false;
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

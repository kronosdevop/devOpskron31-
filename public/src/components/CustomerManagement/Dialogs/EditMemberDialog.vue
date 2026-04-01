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
          <v-icon left color="primary" class="mr-2">mdi-package-variant</v-icon>
          <span class="font-weight-bold text-h5">Edit Products</span>
        </div>
        <v-btn icon variant="text" @click="cancel" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-4 py-3">
        <v-row class="ma-0">
          <v-col cols="12" class="pa-2">
            <v-text-field
              v-model="memberData.client_id"
              label="Client ID"
              variant="outlined"
              density="compact"
              readonly
              prepend-inner-icon="mdi-account"
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="pa-2">
            <v-select
              v-model="memberData.products"
              :items="productOptions"
              label="Select Products"
              item-title="text"
              item-value="value"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-package-variant"
              multiple
              chips
              closable-chips
              required
              :rules="[
                (v) =>
                  (v && v.length > 0) || 'Please select at least one product',
              ]"
            ></v-select>
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
          :disabled="!isValidMember"
        >
          <v-icon left>mdi-check</v-icon>
          Update Products
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { get_inventory_items } from "@/mixins/GetInventoryItems.js";
import { edit_user_app_access } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  name: "EditMemberDialog",
  mixins: [get_inventory_items],
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    memberData: {
      type: Object,
      default: () => ({}),
    },
    dashboardId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      localMemberData: {
        client_id: "",
        products: [],
        subscriber_id: "",
      },
    };
  },
  computed: {
    isValidMember() {
      return (
        this.localMemberData.products &&
        this.localMemberData.products.length > 0
      );
    },
    productOptions() {
      return this.masterItems.map((item) => ({
        text: item.item_name,
        value: item.item_id,
      }));
    },
  },
  methods: {
    fetch_product_name(products) {
      return this.productOptions.filter((item) => products.includes(item.value)).map((item) => item.text);
    },
    async confirm() {
      if (this.isValidMember) {
        this.loading = true;
        try {
          // Simulate API call delay
          let result = await API.graphql(
            graphqlOperation(edit_user_app_access, {
              input: {
                action_type: "EDIT",
                dashboard_id: this.dashboardId,
                products: this.localMemberData.products,
                products_name:this.fetch_product_name(this.localMemberData.products),
                user_email_id: this.memberData.client_id,
                subscriber_id: this.memberData.subscriber_id,
              },
            })
          );
          var response = JSON.parse(result.data.edit_user_app_access);
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
          // Emit success message
          // this.$emit("successMsg", `Products updated successfully!`);

          this.resetForm();
        } catch (error) {
          this.$emit(
            "errorMsg",
            "Failed to update products. Please try again."
          );
        } finally {
          this.loading = false;
        }
      } else {
        this.$emit("errorMsg", "Please select at least one product.");
      }
    },
    cancel() {
      this.$emit("cancel");
      this.resetForm();
    },
    resetForm() {
      this.localMemberData = {
        client_id: "",
        products: [],
        subscriber_id: "",
      };
    },
    initializeData() {
      if (this.memberData && Object.keys(this.memberData).length > 0) {
        // Handle multiple products - convert single product to array or use existing array
        let products = [];
        if (
          this.memberData.products &&
          Array.isArray(this.memberData.products)
        ) {
          products = this.memberData.products;
        } else if (
          this.memberData.product ||
          this.memberData.app_name ||
          this.memberData.service_name ||
          this.memberData.subscriber_id
        ) {
          products = [
            this.memberData.product ||
              this.memberData.app_name ||
              this.memberData.service_name ||
              this.memberData.subscriber_id,
          ];
        }

        this.localMemberData = {
          client_id:
            this.memberData.client_id ||
            this.memberData.name ||
            this.memberData.user_name ||
            "",
          products: products,
          subscriber_id: this.memberData.subscriber_id || "",
        };
      }
    },
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.initializeData();
      }
    },
    memberData: {
      handler() {
        this.initializeData();
      },
      deep: true,
    },
  },
  created() {
    // Fetch inventory items when component is created
    this.get_inventory_items();
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

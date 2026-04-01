<template>
  <div>
    <v-dialog
      :model-value="dialog"
      @update:model-value="$emit('update:dialog', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card class="pa-0 rounded-xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Stock Adjustment</span>
          <v-btn icon variant="text" @click="close_dialog()" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="px-6 py-5">
          <v-form ref="form">
            <!-- Stock Adjustment Type Toggle -->
            <div class="mb-2">
              <div class="d-flex align-center mb-4">
                <div class="blue-line mr-3"></div>
                <h3 class="text-h6 blue--text">Adjustment Type</h3>
              </div>

              <v-card variant="outlined" class="pa-4">
                <v-radio-group
                  v-model="adjustmentType"
                  inline
                  hide-details
                  class="adjustment-type-radio-group"
                >
                  <v-radio value="ADD_STOCK" color="primary" class="mr-6">
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon size="20" color="primary" class="mr-2"
                          >mdi-plus-circle</v-icon
                        >
                        <span class="text-body-1 font-weight-medium"
                          >Add Stock</span
                        >
                      </div>
                    </template>
                  </v-radio>

                  <v-radio value="REDUCE_STOCK" color="primary" class="mr-6">
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon size="20" color="primary" class="mr-2"
                          >mdi-minus-circle</v-icon
                        >
                        <span class="text-body-1 font-weight-medium"
                          >Reduce Stock</span
                        >
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-card>
            </div>

            <!-- Item Information -->
            <div class="mb-1">
              <div class="d-flex align-center mb-4">
                <div class="blue-line mr-3"></div>
                <h3 class="text-h6 blue--text">Item Information</h3>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="selectedProduct?.item_name || ''"
                    label="Item Name"
                    variant="outlined"
                    density="compact"
                    readonly
                    class="mb-3"
                    prepend-inner-icon="mdi-package-variant"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-menu
                    v-model="showDatePicker"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="displayDate"
                        variant="outlined"
                        label="Adjustment Date"
                        readonly
                        density="compact"
                        prepend-inner-icon="mdi-calendar"
                        v-bind="props"
                        class="mb-3"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="adjustmentDate"
                      :max="new Date().toISOString().substr(0, 10)"
                      @update:model-value="showDatePicker = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </div>

            <!-- Adjustment Details -->
            <div class="mb-3">
              <div class="d-flex align-center mb-4">
                <div class="blue-line mr-3"></div>
                <h3 class="text-h6 blue--text">Adjustment Details</h3>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="adjustmentForm.totalQty"
                    label="Total Qty"
                    variant="outlined"
                    density="compact"
                    type="number"
                    @keypress="is_number($event)"
                    class="mb-1"
                    :rules="[(v) => !!v || 'Total Quantity is required']"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="adjustmentForm.atPrice"
                    label="At Price"
                    variant="outlined"
                    density="compact"
                    type="number"
                    @keypress="is_number($event)"
                    class="mb-1"
                    prepend-inner-icon="mdi-currency-inr"
                  />
                </v-col>
              </v-row>

              <v-col cols="12">
                <v-textarea
                  v-model="adjustmentForm.details"
                  label="Details"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  class="mb-1"
                  placeholder="Enter adjustment details, reason, or notes..."
                />
              </v-col>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 justify-end">
          <v-btn text @click="close_dialog()">Cancel</v-btn>
          <v-btn
            color="primary"
            class="ml-2"
            :loading="loading"
            @click="save_adjustment()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { add_reduce_item_quantity } from "@/graphql/mutations";
export default {
  name: "StockAdjustmentDialog",
  props: {
    dialog: Boolean,
    selectedProduct: Object,
  },
  data() {
    return {
      loading: false,
      showDatePicker: false,
      adjustmentType: "ADD_STOCK", // "add" or "reduce"
      adjustmentDate: new Date().toISOString().substr(0, 10),
      adjustmentForm: {
        totalQty: "",
        rol: "",
        atPrice: "",
        details: "",
      },
      rolOptions: [
        { title: "Low", value: "low" },
        { title: "Medium", value: "medium" },
        { title: "High", value: "high" },
        { title: "Critical", value: "critical" },
      ],
    };
  },
  computed: {
    displayDate() {
      if (!this.adjustmentDate) return "";
      const date = new Date(this.adjustmentDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        // Reset form when dialog opens
        this.resetForm();
      }
    },
  },
  methods: {
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    resetForm() {
      this.adjustmentForm = {
        totalQty: "",
        rol: "",
        atPrice: "",
        details: "",
      };
      this.adjustmentType = "ADD_STOCK";
      this.adjustmentDate = new Date().toISOString().substr(0, 10);
    },

    close_dialog() {
      this.$emit("update:dialog", false);
      this.$refs.form.resetValidation();
      this.resetForm();
    },

    async save_adjustment() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          // Prepare adjustment data
          const adjustmentData = {
            item_id: this.selectedProduct.item_id,
            stock_value: this.adjustmentForm.atPrice,
            action_type: this.adjustmentType,
            transaction_date: this.adjustmentDate,
         
           
            transaction_details: this.adjustmentForm.details,
            stock_quantity: this.adjustmentForm.totalQty|| 0,
          };

          // console.log("Adjustment data:", adjustmentData);

          const result = await API.graphql(
            graphqlOperation(add_reduce_item_quantity, {
              input: adjustmentData,
            })
          );
          const response = JSON.parse(result.data.add_reduce_item_quantity);
          if (response.Status === "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.close_dialog();
          } else {
            this.$emit(
              "errorMsg",
              response.Message || "An error occurred while saving adjustment"
            );
          }
        } catch (error) {
          this.$emit(
            "errorMsg",
            error.message || "An error occurred while saving adjustment"
          );
        } finally {
          this.loading = false;
        }
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

.blue-line {
  width: 4px;
  height: 24px;
  background: #1976d2;
  border-radius: 2px;
}

.flex-1 {
  flex: 1;
}

.w-100 {
  width: 100%;
}

.rounded-lg {
  border-radius: 8px;
}

.adjustment-type-radio-group {
  margin-top: 8px;
}

.adjustment-type-radio-group .v-radio {
  margin-right: 24px;
}

.adjustment-type-radio-group .v-radio:last-child {
  margin-right: 0;
}

.adjustment-type-radio-group .v-selection-control {
  min-height: auto;
}

.adjustment-type-radio-group .v-selection-control__wrapper {
  margin-right: 8px;
}

.adjustment-type-radio-group .v-radio__label {
  margin-left: 8px;
}
</style>

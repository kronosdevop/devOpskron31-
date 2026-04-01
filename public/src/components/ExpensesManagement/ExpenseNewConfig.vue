<template>
  <div style="padding-bottom: 70px">
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat>
      <v-toolbar flat class="bg-white">
        <v-toolbar-title class="text-h6 font-weight-medium">
          <v-icon size="24" color="primary" class="mr-3">mdi-cog</v-icon>
          Petty Cash Request Limits Configuration
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          dark
          @click="saveConfiguration"
          :loading="saving"
          :disabled="!isFormValid"
          class="text-capitalize cardCss mt-n7 mr-2"
        >
          <v-icon left>mdi-content-save</v-icon>
          Save Configuration
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <v-row justify="start">
          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-6" elevation="2">
              <v-card-title class="text-h6 font-weight-medium mb-4">
                <v-icon size="24" color="primary" class="mr-3"
                  >mdi-currency-usd</v-icon
                >
                Request Amount Limits
              </v-card-title>

              <v-form ref="form" v-model="isFormValid">
                <!-- Minimum Request Amount -->
                <v-text-field
                  v-model="minAmount"
                  label="Minimum Request Amount"
                  placeholder="Enter minimum amount (e.g., 10.00)"
                  type="number"
                  :rules="minAmountRules"
                  prefix="₹"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  :error-messages="minAmountError"
                  @input="validateForm"
                  @blur="validateMinAmount"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="primary">mdi-currency-inr</v-icon>
                  </template>
                </v-text-field>

                <!-- Maximum Request Amount -->
                <v-text-field
                  v-model="maxAmount"
                  label="Maximum Request Amount"
                  placeholder="Enter maximum amount (e.g., 1000.00)"
                  type="number"
                  :rules="maxAmountRules"
                  prefix="₹"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  :error-messages="maxAmountError"
                  @input="validateForm"
                  @blur="validateMaxAmount"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="primary">mdi-currency-inr</v-icon>
                  </template>
                </v-text-field>

                <!-- Negative Balance Checkbox -->
                <v-checkbox
                  v-model="allowNegativeBalance"
                  label="Is negative balance allowed"
                  color="primary"
                  hide-details
                  class="mb-4"
                >
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2"
                        >mdi-minus-circle</v-icon
                      >
                      <span class="font-weight-medium"
                        >Is negative balance allowed</span
                      >
                    </div>
                  </template>
                </v-checkbox>
              </v-form>
            </v-card>
          </v-col>

          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-6" elevation="2">
              <v-card-title class="text-h6 font-weight-medium mb-4">
                <v-icon size="24" color="primary" class="mr-3"
                  >mdi-paperclip</v-icon
                >
                Attachment Requirements
              </v-card-title>

              <v-form>
                <!-- Attachment Required Checkbox -->
                <v-checkbox
                  v-model="isExpenseAttachmentRequired"
                  label="Is expense attachment required"
                  color="primary"
                  hide-details
                  class="mb-4"
                >
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <v-icon size="18" color="primary" class="mr-2"
                        >mdi-attachment</v-icon
                      >
                      <span class="font-weight-medium"
                        >Expense Attachment Mandatory</span
                      >
                    </div>
                  </template>
                </v-checkbox>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { edit_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";

export default {
  mixins: [get_Org_details],
  name: "ExpenseNewConfig",
  components: {
    SnackBar,
  },
  data() {
    return {
      minAmount: "",
      maxAmount: "",
      allowNegativeBalance: false,
      isExpenseAttachmentRequired: false,
      isFormValid: false,
      saving: false,
      minAmountError: "",
      maxAmountError: "",
      rangeError: false,
      SnackBarComponent: {},

      // Validation rules
      minAmountRules: [
        (v) => !!v || "Minimum amount is required",
        (v) => !isNaN(v) || "Must be a valid number",
        (v) => parseFloat(v) > 0 || "Must be greater than 0",
        (v) => parseFloat(v) <= 999999 || "Amount too large",
      ],

      maxAmountRules: [
        (v) => !!v || "Maximum amount is required",
        (v) => !isNaN(v) || "Must be a valid number",
        (v) => parseFloat(v) > 0 || "Must be greater than 0",
        (v) => parseFloat(v) <= 999999 || "Amount too large",
      ],
    };
  },

  methods: {
    validateForm() {
      this.$nextTick(() => {
        const formValid = this.$refs.form?.validate() || false;
        const rangeValid = !this.rangeError;
        this.isFormValid = formValid && rangeValid;
      });
    },

    validateMinAmount() {
      const value = parseFloat(this.minAmount);
      if (this.minAmount && (isNaN(value) || value <= 0)) {
        this.minAmountError = "Please enter a valid positive number";
      } else {
        this.minAmountError = "";
      }
      this.validateRange();
    },

    validateMaxAmount() {
      const value = parseFloat(this.maxAmount);
      if (this.maxAmount && (isNaN(value) || value <= 0)) {
        this.maxAmountError = "Please enter a valid positive number";
      } else {
        this.maxAmountError = "";
      }
      this.validateRange();
    },

    validateRange() {
      const min = parseFloat(this.minAmount);
      const max = parseFloat(this.maxAmount);

      if (this.minAmount && this.maxAmount && !isNaN(min) && !isNaN(max)) {
        if (max <= min) {
          this.rangeError = true;
        } else {
          this.rangeError = false;
        }
      } else {
        this.rangeError = false;
      }
      this.validateForm();
    },

    formatCurrency(value) {
      if (!value) return "0.00";
      return parseFloat(value).toFixed(2);
    },

    async saveConfiguration() {
      if (!this.isFormValid) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please fix validation errors before saving",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      this.saving = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              petty_cash_settings: this.fetch_min_max_amount(),
              is_expense_attachment_required: this.isExpenseAttachmentRequired,
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          this.saving = false;
          await this.get_Org_details();
          this.loadConfiguration();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
       
          this.saving = false;
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    fetch_min_max_amount() {
      var data = {
        min_amount: this.minAmount,
        max_amount: this.maxAmount,
        allow_negative_balance: this.allowNegativeBalance,
      };
      return JSON.stringify(data);
    },

 

    async loadConfiguration() {
      try {
        var data = this.$store.getters.GetOrgDetails;
        // console.log(data);  
        this.isExpenseAttachmentRequired =
          data.organization.is_expense_attachment_required || false;

        if (
          data &&
          data.organization &&
          data.organization.petty_cash_settings
        ) {
          // Parse the petty cash settings from the organization data
          const pettyCashSettings = data.organization.petty_cash_settings;

          // Set the form values from the parsed settings
          this.minAmount = pettyCashSettings.min_amount || "";
          this.maxAmount = pettyCashSettings.max_amount || "";
          this.allowNegativeBalance =
            pettyCashSettings.allow_negative_balance || false;

          // this.validateForm();
        } else {
          // If no settings exist, set default values
          this.minAmount = "";
          this.maxAmount = "";
          this.allowNegativeBalance = false;
          this.isExpenseAttachmentRequired = false;
        }
      } catch (error) {
        this.showError("Failed to load existing configuration");

        // Set default values on error
        this.minAmount = "";
        this.maxAmount = "";
        this.allowNegativeBalance = false;
        this.isExpenseAttachmentRequired = false;
      }
    },
  },

  mounted() {
    this.loadConfiguration();
  },

  watch: {
    minAmount() {
      this.validateMinAmount();
    },
    maxAmount() {
      this.validateMaxAmount();
    },
  },
};
</script>

<style scoped>
.v-text-field :deep(.v-field__outline) {
  border-radius: 8px;
}

.v-card {
  border-radius: 12px;
}
</style>
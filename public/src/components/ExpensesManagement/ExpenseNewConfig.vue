<template>
  <div style="padding-bottom: 70px">
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat>
      <!-- Toolbar -->
      <v-toolbar flat class="bg-white mt-2">
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

      <v-card-text class="pa-6 mt-n6">
        <v-row>
          <!-- Petty Cash Limits -->
          <v-col cols="12" md="6">
            <v-card elevation="2" class="pa-6 setting-card">
              <v-card-title class="text-h6 font-weight-bold mb-4">
                <v-icon color="primary" class="mr-2 ml-n5">mdi-cash-multiple</v-icon>
                Petty Cash Limits
              </v-card-title>

              <v-form ref="form" v-model="isFormValid">
                <v-text-field
                  v-model="minAmount"
                  label="Minimum Request Amount"
                  placeholder="Enter minimum amount"
                  type="number"
                  prefix="₹"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  :rules="minAmountRules"
                  :error-messages="minAmountError"
                  @input="validateForm"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="primary">mdi-currency-inr</v-icon>
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="maxAmount"
                  label="Maximum Request Amount"
                  placeholder="Enter maximum amount"
                  type="number"
                  prefix="₹"
                  variant="outlined"
                  density="comfortable"
                  :rules="maxAmountRules"
                  :error-messages="maxAmountError"
                  @input="validateForm"
                >
                  <template v-slot:prepend-inner>
                    <v-icon color="primary">mdi-currency-inr</v-icon>
                  </template>
                </v-text-field>

                <v-switch
                  v-model="allowNegativeBalance"
                  color="primary"
                  class="mt-4"
                  label="Allow Negative Balance"
                />
              </v-form>
            </v-card>
          </v-col>

          <!-- Expense Settings -->
          <v-col cols="12" md="6">
            <v-card elevation="2" class="pa-6 setting-card">
              <v-card-title class="text-h6 font-weight-bold mb-4">
                <v-icon color="primary" class="mr-2 ml-n5">mdi-cog-outline</v-icon>
                Expense Settings
              </v-card-title>

              <!-- Attachment -->
              <div class="setting-row">
                <div class="setting-info">
                  <v-icon color="primary">mdi-paperclip</v-icon>

                  <div>
                    <div class="setting-title">Expense Attachment</div>
                    <div class="setting-subtitle">
                      Require attachment when submitting expense
                    </div>
                  </div>
                </div>

                <v-switch
                  v-model="isExpenseAttachmentRequired"
                  color="primary"
                />
              </div>

              <!-- Vendor -->
              <div class="setting-row">
                <div class="setting-info">
                  <v-icon color="primary">mdi-account-tie</v-icon>

                  <div>
                    <div class="setting-title">Vendor Configuration</div>
                    <div class="setting-subtitle">
                      Enable vendor selection for expense
                    </div>
                  </div>
                </div>

                <v-switch v-model="vendorEnabled" color="primary" />
              </div>

              <!-- Subcategory -->
              <div class="setting-row">
                <div class="setting-info">
                  <v-icon color="primary">mdi-shape-outline</v-icon>

                  <div>
                    <div class="setting-title">Subcategory Configuration</div>
                    <div class="setting-subtitle">
                      Enable subcategory field for expense
                    </div>
                  </div>
                </div>

                <v-switch v-model="subcategoryEnabled" color="primary" />
              </div>
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
      vendorEnabled: false,
      subcategoryEnabled: false,

      isFormValid: false,
      saving: false,

      minAmountError: "",
      maxAmountError: "",
      rangeError: false,

      SnackBarComponent: {},

      minAmountRules: [
        (v) => !!v || "Minimum amount is required",
        (v) => !isNaN(v) || "Must be a valid number",
        (v) => parseFloat(v) > 0 || "Must be greater than 0",
      ],

      maxAmountRules: [
        (v) => !!v || "Maximum amount is required",
        (v) => !isNaN(v) || "Must be a valid number",
        (v) => parseFloat(v) > 0 || "Must be greater than 0",
      ],
    };
  },

  async created() {
    await this.get_Org_details();
        this.loadConfiguration();

  },

  methods: {
    validateForm() {
      this.$nextTick(() => {
        const formValid = this.$refs.form?.validate() || false;
        const rangeValid = !this.rangeError;

        this.isFormValid = formValid && rangeValid;
      });
    },

    validateRange() {
      const min = parseFloat(this.minAmount);
      const max = parseFloat(this.maxAmount);

      if (min && max) {
        if (max <= min) {
          this.rangeError = true;
        } else {
          this.rangeError = false;
        }
      }
    },

    fetch_min_max_amount() {
      return JSON.stringify({
        min_amount: this.minAmount,
        max_amount: this.maxAmount,
        allow_negative_balance: this.allowNegativeBalance,
      });
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

              is_expense_vendor_enabled: this.vendorEnabled,

              is_expense_subcategory_enabled: this.subcategoryEnabled,
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
        }

        this.saving = false;
      } catch (error) {
        this.saving = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async loadConfiguration() {
      try {
        var data = this.$store.getters.GetOrgDetails;

        this.isExpenseAttachmentRequired =
          data.organization.is_expense_attachment_required || false;

        this.vendorEnabled = data.organization.is_expense_vendor_enabled || false;

        this.subcategoryEnabled =
          data.organization.is_expense_subcategory_enabled || false;

        if (data.organization.petty_cash_settings) {
          const petty = data.organization.petty_cash_settings;

          this.minAmount = petty.min_amount || "";
          this.maxAmount = petty.max_amount || "";
          this.allowNegativeBalance = petty.allow_negative_balance || false;
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.setting-card {
  border-radius: 14px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f1f1f1;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.setting-title {
  font-weight: 600;
  font-size: 15px;
}

.setting-subtitle {
  font-size: 13px;
  color: #6b7280;
}
</style>
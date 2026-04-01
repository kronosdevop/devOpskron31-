<template>
  <v-dialog
    :model-value="transactionAdd"
    @update:model-value="closeDialog"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          <v-icon left>mdi-plus</v-icon>
          Add {{ transactionType === "expense" ? "Expense" : "Petty Cash" }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="isFormValid">
          <!-- Transaction Type Selection -->
          <v-select
            :model-value="transactionType"
            :items="transactionTypes"
            label="Transaction Type"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Transaction type is required']"
            readonly
            disabled
          >
            <template v-slot:prepend-inner>
              <v-icon color="primary">mdi-format-list-bulleted</v-icon>
            </template>
          </v-select>

          <!-- Amount -->
          <v-text-field
            v-model="amount"
            label="Amount"
            placeholder="Enter amount"
            type="number"
            prefix="₹"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="amountRules"
            @input="validateAmount"
          >
            <template v-slot:prepend-inner>
              <v-icon color="primary">mdi-currency-inr</v-icon>
            </template>
          </v-text-field>

          <!-- Description -->
          <v-textarea
            v-model="description"
            label="Description"
            placeholder="Enter transaction description"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Description is required']"
            rows="3"
          >
            <template v-slot:prepend-inner>
              <v-icon color="primary">mdi-text</v-icon>
            </template>
          </v-textarea>

          <!-- Category (for expenses) -->
          <v-select
            v-if="transactionType === 'expense'"
            v-model="category"
            :items="expenseCategories"
            label="Expense Category"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Category is required']"
          >
            <template v-slot:prepend-inner>
              <v-icon color="primary">mdi-tag</v-icon>
            </template>
          </v-select>

          <!-- Petty Cash Type (for petty cash) -->
          <v-select
            v-if="transactionType === 'pettycash'"
            v-model="pettyCashType"
            :items="pettyCashTypes"
            label="Transaction Type"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Transaction type is required']"
          >
            <template v-slot:prepend-inner>
              <v-icon color="primary">mdi-wallet</v-icon>
            </template>
          </v-select>

          <!-- File Upload -->
          <v-file-input
            v-model="attachments"
            label="Attachments"
            placeholder="Upload supporting documents"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            prepend-icon="mdi-camera"
            :rules="fileRules"
          >
            <template v-slot:prepend-inner>
              <v-icon color="primary">mdi-attachment</v-icon>
            </template>
          </v-file-input>

          <!-- Validation Messages -->
          <v-alert
            v-if="validationError"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ validationError }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeDialog"
          class="mr-3"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="submitTransaction"
          :loading="submitting"
          :disabled="!isFormValid"
        >
          <v-icon left>mdi-check</v-icon>
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AddTransaction",
  props: {
    transactionAdd: {
      type: Boolean,
      default: false,
    },
    transactionType: {
      type: String,
      default: "expense",
    },
  },
  data() {
    return {
      isFormValid: false,
      submitting: false,
      validationError: "",

      // Form fields
      amount: "",
      description: "",
      category: "",
      pettyCashType: "",
      attachments: [],

      // Options
      transactionTypes: [
        { title: "Expense", value: "expense" },
        { title: "Petty Cash", value: "pettycash" },
      ],
      expenseCategories: [
        "Office Supplies",
        "Travel",
        "Meals",
        "Transportation",
        "Utilities",
        "Other",
      ],
      pettyCashTypes: [
        { title: "Withdrawal", value: "DEBIT" },
        { title: "Deposit", value: "CREDIT" },
      ],

      // Validation rules
      amountRules: [
        (v) => !!v || "Amount is required",
        (v) => !isNaN(v) || "Must be a valid number",
        (v) => parseFloat(v) > 0 || "Amount must be greater than 0",
        (v) => parseFloat(v) <= 999999 || "Amount too large",
      ],
      fileRules: [(v) => !v || v.length <= 5 || "Maximum 5 files allowed"],
    };
  },
  watch: {
    transactionType(newVal) {
      // Reset form when transaction type changes
      this.resetForm();
    },
  },
  methods: {
    validateAmount() {
      const amount = parseFloat(this.amount);
      if (this.amount && (isNaN(amount) || amount <= 0)) {
        this.validationError = "Please enter a valid positive amount";
      } else {
        this.validationError = "";
      }
    },

    resetForm() {
      this.amount = "";
      this.description = "";
      this.category = "";
      this.pettyCashType = "";
      this.attachments = [];
      this.validationError = "";
      this.$refs.form?.resetValidation();
    },

    closeDialog() {
      this.resetForm();
      this.$emit("clicked");
    },

    async submitTransaction() {
      if (!this.isFormValid) {
        this.validationError = "Please fix validation errors before submitting";
        return;
      }

      this.submitting = true;

      try {
        // Prepare transaction data
        const transactionData = {
          type: this.transactionType,
          amount: parseFloat(this.amount),
          description: this.description,
          category: this.transactionType === "expense" ? this.category : null,
          pettyCashType:
            this.transactionType === "pettycash" ? this.pettyCashType : null,
          attachments: this.attachments,
          timestamp: new Date().toISOString(),
        };

        // console.log("Submitting transaction:", transactionData);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Emit success event
        this.$emit(
          "successMsg",
          `${
            this.transactionType === "expense" ? "Expense" : "Petty cash"
          } submitted successfully!`
        );

        // Close dialog
        this.closeDialog();
      } catch (error) {
        console.error("Error submitting transaction:", error);
        this.$emit(
          "errorMsg",
          "Failed to submit transaction. Please try again."
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.v-dialog :deep(.v-card) {
  border-radius: 12px;
}

.v-text-field :deep(.v-field__outline) {
  border-radius: 8px;
}

.v-select :deep(.v-field__outline) {
  border-radius: 8px;
}

.v-textarea :deep(.v-field__outline) {
  border-radius: 8px;
}

.v-file-input :deep(.v-field__outline) {
  border-radius: 8px;
}
</style> 
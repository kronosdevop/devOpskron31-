<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <span>Set Payment Terms</span>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Add Button -->
        <div class="mb-4">
          <v-btn
            color="#DB4C77"
            variant="outlined"
            @click="addPaymentTerm"
            prepend-icon="mdi-plus"
          >
             Add
          </v-btn>
        </div>

        <!-- Payment Terms Table -->
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Term</th>
              <th class="text-left">Days</th>
              <th class="text-left">Default</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(term, index) in localPaymentTerms" :key="index">
              <td>
                <v-text-field
                  v-model="term.term"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="Term name"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="term.days"
                  variant="outlined"
                  density="compact"
                  hide-details
                  type="number"
                  placeholder="0"
                  @keypress="is_number($event)"
                ></v-text-field>
              </td>
              <td>
                <v-checkbox
                  v-model="term.isDefault"
                  color="#DB4C77"
                  hide-details
                  density="compact"
                  @change="handleDefaultChange(index)"
                ></v-checkbox>
              </td>
              <td>
                <div class="d-flex align-center">
                  <v-icon
                    v-if="!term.isDefault"
                    icon="mdi-delete"
                    size="small"
                    color="grey"
                    class="cursor-pointer"
                    @click="deletePaymentTerm(index)"
                  ></v-icon>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="#DB4C77"
          @click="savePaymentTerms"
          :loading="saving"
        >
          DONE
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'PaymentTermsDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    paymentTerms: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:modelValue', 'save', 'show-snackbar'],

  data() {
    return {
      saving: false,
      localPaymentTerms: [
        { term: 'Due on Receipt', days: 0, isDefault: true },
        { term: 'Net 15', days: 15, isDefault: false },
        { term: 'Net 30', days: 30, isDefault: false },
        { term: 'Net 45', days: 45, isDefault: false }
      ]
    }
  },

  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },

  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.loadPaymentTerms();
      }
    },
    paymentTerms: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.localPaymentTerms = JSON.parse(JSON.stringify(newVal));
        } else {
          // Create default payment terms if none provided
          this.localPaymentTerms = [
            { term: 'Due on Receipt', days: 0, isDefault: true },
            { term: 'Net 15', days: 15, isDefault: false },
            { term: 'Net 30', days: 30, isDefault: false },
            { term: 'Net 45', days: 45, isDefault: false }
          ];
        }
      }
    }
  },

  mounted() {
    // Load payment terms on component mount
    this.loadPaymentTerms();
  },

  methods: {
    loadPaymentTerms() {
      // Load existing payment terms or create default ones
      if (this.paymentTerms && this.paymentTerms.length > 0) {
        this.localPaymentTerms = JSON.parse(JSON.stringify(this.paymentTerms));
      } else {
        // Create default payment terms
        this.localPaymentTerms = [
          { term: 'Due on Receipt', days: 0, isDefault: true },
          { term: 'Net 15', days: 15, isDefault: false },
          { term: 'Net 30', days: 30, isDefault: false },
          { term: 'Net 45', days: 45, isDefault: false }
        ];
      }
    },

    addPaymentTerm() {
      this.localPaymentTerms.push({
        term: '',
        days: 0,
        isDefault: false
      });
    },

    editPaymentTerm(index) {
      // For now, just focus on the text field
      // You could implement a more sophisticated edit mode here
    },

    deletePaymentTerm(index) {
      if (this.localPaymentTerms[index].isDefault) {
        this.$emit('show-snackbar', {
          color: 'error',
          text: 'Cannot delete the default payment term'
        });
        return;
      }
      this.localPaymentTerms.splice(index, 1);
    },

    handleDefaultChange(index) {
      // Ensure only one term is default
      this.localPaymentTerms.forEach((term, i) => {
        if (i !== index) {
          term.isDefault = false;
        }
      });
    },

    closeDialog() {
      this.dialog = false;
    },

    async savePaymentTerms() {
      this.saving = true;
      
      // Validate payment terms
      const validTerms = this.localPaymentTerms.filter(term => 
        term.term && term.term.trim() !== '' && 
        (term.days === 0 || term.days > 0)
      );

      if (validTerms.length === 0) {
        this.$emit('show-snackbar', {
          color: 'error',
          text: 'Please add at least one valid payment term'
        });
        this.saving = false;
        return;
      }

      // Ensure at least one term is default
      const hasDefault = validTerms.some(term => term.isDefault);
      if (!hasDefault) {
        validTerms[0].isDefault = true;
      }

      try {
        // Emit the updated payment terms
        this.$emit('save', validTerms);
        this.closeDialog();
      } catch (error) {
        console.error('Error saving payment terms:', error);
        this.$emit('show-snackbar', {
          color: 'error',
          text: 'Error saving payment terms. Please try again.'
        });
      } finally {
        this.saving = false;
      }
    },

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
    }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.v-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #2c3e50;
}

.v-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.v-table tr:last-child td {
  border-bottom: none;
}
</style>

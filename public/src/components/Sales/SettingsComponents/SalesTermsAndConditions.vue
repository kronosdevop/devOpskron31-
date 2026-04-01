<template>
  <div>
    <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#DB4C77" size="24">mdi-file-document-edit</v-icon>
          <span class="text-h5">Terms and Conditions</span>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="#DB4C77"
            @click="saveTermsAndConditions"
            :loading="saving"
            class="mr-2"
          >
            Save
          </v-btn>
          <v-btn text @click="goBack" class="back-link" color="primary">
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-card class="pa-4" elevation="1">
          <v-card-title class="text-h6 mb-4">
            <v-icon class="mr-2" color="#DB4C77">mdi-file-document</v-icon>
            Terms and Conditions
          </v-card-title>

          <v-form ref="form">
            <v-textarea
              v-model="termsAndConditions"
              label="Terms and Conditions"
              variant="outlined"
              rows="15"
              placeholder="Enter terms and conditions here..."
              hide-details
              class="mb-4"
            />
          </v-form>

          <!-- Info Message -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <div class="text-body-2">
              <strong>Note:</strong> These terms and conditions will be used across all quotations, proformas, and sales orders.
            </div>
          </v-alert>
        </v-card>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { quotation_terms_conditions } from "@/graphql/mutations.js";
import { get_termsAndcondition_list } from "@/mixins/GetTermsandConditionList.js";
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: "SalesTermsAndConditions",
  components: {
    SnackBar,
  },
  mixins: [get_termsAndcondition_list],
  data() {
    return {
      windowHeight: 0,
      termsAndConditions: "",
      saving: false,
      SnackBarComponent: {},
    };
  },
  mounted() {
    this.windowHeight = window.innerHeight - 150;
    this.loadTermsAndConditions();
  },
  methods: {
    async loadTermsAndConditions() {
      try {
        await this.get_termsAndcondition_list();
        
        // Get terms from store or response
        const storedTerms = this.$store.getters.GetTermsandConditions;
        
        if (storedTerms && storedTerms.data && storedTerms.data.length > 0) {
          // Use terms_and_conditions if available, otherwise try other fields
          const termsData = storedTerms.data[0];
          this.termsAndConditions = 
            termsData.terms_and_conditions || 
            termsData.quotation_terms_conditions || 
            termsData.billing_terms_conditions || 
            termsData.proforma_terms_conditions || 
            "";
        } else if (storedTerms && storedTerms.terms_and_conditions) {
          this.termsAndConditions = storedTerms.terms_and_conditions;
        }
      } catch (error) {
        console.error("Error loading terms and conditions:", error);
      }
    },

    async saveTermsAndConditions() {
      if (!this.termsAndConditions || this.termsAndConditions.trim() === "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Terms and conditions cannot be empty",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      this.saving = true;
      try {
        const result = await API.graphql(
          graphqlOperation(quotation_terms_conditions, {
            input: {
              terms_and_conditions: this.termsAndConditions,
              action_type: "CREATEUPDATE",
            },
          })
        );

        const response = JSON.parse(result.data.quotation_terms_conditions);

        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message || "Terms and conditions saved successfully",
            timeout: 5000,
            Top: true,
          };
          // Reload the list after saving
          await this.get_termsAndcondition_list();
          // Update the textarea with the saved value
          await this.loadTermsAndConditions();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message || "Failed to save terms and conditions",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error saving terms and conditions:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message || "An error occurred while saving",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.saving = false;
      }
    },

    goBack() {
      this.$emit("backAction");
    },
  },
};
</script>

<style scoped>
.back-link {
  text-transform: none !important;
}
</style>


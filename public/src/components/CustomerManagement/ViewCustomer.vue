<template>
  <div fluid>
    <v-card elevation="2" class="pa-4">
      <v-toolbar density="compact" flat>
        <v-toolbar-title>View Customer Details</v-toolbar-title>
        <v-spacer />
        <v-btn
          size="small"
          dark
          class="text-capitalize cardCss ml-2"
          @click="cancelAction"
        >
          Cancel
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <div v-if="customerType == 'BUSINESS'">
          <v-card variant="outlined" class="">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-office-building</v-icon>
              Basic Company Information
            </v-card-title>
            <v-divider :thickness="2" color="black"></v-divider>
            <v-card-text>
              <v-row dense>
                <v-col md="6" class="">
                  <div>
                    <strong>Legal Name of Business: </strong>
                    {{ customerData.legal_name || "N/A" }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Brand Name: </strong>
                    {{ customerData.brand_name || "N/A" }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Business Type: </strong>
                    {{ customerData.business_type || "N/A" }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Industry / Sector: </strong>
                    {{ customerData.industry_type || "N/A" }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Company Size: </strong>
                    {{ customerData.company_size || "N/A" }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Website: </strong>
                    {{ customerData.website || "N/A" }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Preferred Language: </strong>
                    {{ customerData.preferred_language || "N/A" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-map-marker</v-icon>
              Address Details
            </v-card-title>
            <v-divider :thickness="2" color="black"></v-divider>
            <v-card-text>
              <v-row density="compact">
                <!-- Business Address -->
                <v-col cols="12" sm="5">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Business Address
                  </h4>
                  <div>
                    <strong>Address Line:</strong>
                    {{ customerData.address_line_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>City:</strong> {{ customerData.city_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>State:</strong> {{ customerData.state_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>Zip Code:</strong>
                    {{ customerData.zip_code_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>Country:</strong>
                    {{ customerData.country_1 || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="2">
                  <v-divider vertical></v-divider>
                </v-col>
                <!-- Mailing Address -->
                <v-col cols="12" sm="5">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Mailing Address
                  </h4>
                  <div>
                    <strong>Address Line:</strong>
                    {{ customerData.address_line_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>City:</strong> {{ customerData.city_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>State:</strong> {{ customerData.state_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>Zip Code:</strong>
                    {{ customerData.zip_code_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>Country:</strong>
                    {{ customerData.country_2 || "N/A" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-scale-balance</v-icon>
              Tax & Compliance
            </v-card-title>
            <v-divider :thickness="2" color="black"></v-divider>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>GSTIN:</strong> {{ customerData.gst_no || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>PAN:</strong> {{ customerData.pan_no || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>CIN:</strong> {{ customerData.cin_no || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Tax Exemption Code:</strong>
                    {{ customerData.tax_exemption_code || "N/A" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-account-box</v-icon>
              Contact Information
            </v-card-title>
            <v-divider :thickness="2" color="black"></v-divider>
            <v-card-text>
              <v-row density="compact">
                <!-- Business Address -->
                <v-col cols="12" sm="4">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Primary Contact Details
                  </h4>
                  <div>
                    <strong>Name:</strong>
                    {{ customerData.primary_contact_name || "N/A" }}
                  </div>
                  <div>
                    <strong>Phone Number::</strong>
                    {{ customerData.primary_contact_no || "N/A" }}
                  </div>
                  <div>
                    <strong>Email-ID:</strong>
                    {{ customerData.customer_email_id || "N/A" }}
                  </div>
                  <div>
                    <strong>Designation:</strong>
                    {{ customerData.primary_designation || "N/A" }}
                  </div>
                </v-col>
                <v-divider vertical></v-divider>
                <!-- Mailing Address -->
                <v-col cols="12" sm="4">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Secondary Contact Details
                  </h4>
                  <div>
                    <strong>Name:</strong>
                    {{ customerData.secondary_contact_name || "N/A" }}
                  </div>
                  <div>
                    <strong>Phone Number::</strong>
                    {{ customerData.secondary_contact_no || "N/A" }}
                  </div>
                  <div>
                    <strong>Email-ID:</strong>
                    {{ customerData.secondary_email_id || "N/A" }}
                  </div>
                  <div>
                    <strong>Designation:</strong>
                    {{ customerData.secondary_designation || "N/A" }}
                  </div>
                </v-col>
                <v-divider vertical></v-divider>
                <!-- Mailing Address -->
                <v-col cols="12" sm="4">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Temporary Contact Details
                  </h4>
                  <div>
                    <strong>Name:</strong>
                    {{ customerData.temporary_contact_name || "N/A" }}
                  </div>
                  <div>
                    <strong>Phone Number::</strong>
                    {{ customerData.temporary_contact_no || "N/A" }}
                  </div>
                  <div>
                    <strong>Email-ID:</strong>
                    {{ customerData.temporary_email_id || "N/A" }}
                  </div>
                  <div>
                    <strong>Designation:</strong>
                    {{ customerData.temporary_designation || "N/A" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
        <div v-if="customerType !== 'BUSINESS'">
          <!-- Customer Information -->
          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-account</v-icon>
              Customer Information
            </v-card-title>
            <v-divider :thickness="2" color="black"></v-divider>
            <v-card-text>
              <v-row density="compact">
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Full Name: </strong>
                    {{ customerData.legal_name || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Email ID: </strong
                    >{{ customerData.customer_email_id || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Phone Number: </strong
                    >{{ customerData.primary_contact_no || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Alternate Email ID: </strong
                    >{{ customerData.secondary_email_id || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Alternate Phone Number: </strong
                    >{{ customerData.secondary_contact_no || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Date of Birth: </strong>
                    {{ customerData.customer_dob || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div>
                    <strong>Preferred Language: </strong
                    >{{ customerData.preferred_language || "N/A" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Address Details -->
          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-map-marker</v-icon>
              Address Details
            </v-card-title>
            <v-divider :thickness="2" color="black"></v-divider>
            <v-card-text>
              <v-row density="compact">
                <!-- Business Address -->
                <v-col cols="12" sm="5">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Business Address
                  </h4>
                  <div>
                    <strong>Address Line:</strong>
                    {{ customerData.address_line_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>City:</strong> {{ customerData.city_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>State:</strong> {{ customerData.state_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>Zip Code:</strong>
                    {{ customerData.zip_code_1 || "N/A" }}
                  </div>
                  <div>
                    <strong>Country:</strong>
                    {{ customerData.country_1 || "N/A" }}
                  </div>
                </v-col>
                <v-col cols="12" sm="2">
                  <v-divider vertical></v-divider>
                </v-col>
                <!-- Mailing Address -->
                <v-col cols="12" sm="5">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Mailing Address
                  </h4>
                  <div>
                    <strong>Address Line:</strong>
                    {{ customerData.address_line_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>City:</strong> {{ customerData.city_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>State:</strong> {{ customerData.state_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>Zip Code:</strong>
                    {{ customerData.zip_code_2 || "N/A" }}
                  </div>
                  <div>
                    <strong>Country:</strong>
                    {{ customerData.country_2 || "N/A" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <v-card variant="outlined" class="mt-4">
          <v-card-title class="subtitle-1 font-weight-small">
            <v-icon size="small" left color="secondaryColor">mdi-briefcase</v-icon>
            Commercial & Operational
          </v-card-title>
          <v-divider :thickness="2" color="black"></v-divider>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6">
                <div>
                  <strong>Payment SLA: </strong
                  >{{ customerData.payment_sla || "N/A" }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div>
                  <strong>Currency: </strong
                  >{{ customerData.currency || "N/A" }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div>
                  <strong>Sales Rep / Account Manager: </strong
                  >{{ customerData.account_manager || "N/A" }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" class="mt-4">
          <v-card-title class="subtitle-1 font-weight-small">
            <v-icon left size="small" color="secondaryColor">mdi-package-variant</v-icon>
            Product Information
          </v-card-title>
          <v-divider :thickness="2" color="black"></v-divider>
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <div v-if="productItems && productItems.length > 0">
                  <strong>Selected Products: </strong>
                  <v-chip
                    v-for="product in productItems"
                    :key="product"
                    class="ma-1"
                    color="primary"
                    variant="outlined"
                    size="small"
                  >
                    {{ product }}
                  </v-chip>
                </div>
                <div v-else>
                  <strong>Selected Products: </strong>
                  <span class="text-grey">No products selected</span>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" class="mt-4">
          <v-card-title class="subtitle-1 font-weight-small">
            <v-icon left size="small" color="secondaryColor">mdi-database</v-icon>
            System Metadata
          </v-card-title>
          <v-divider :thickness="2" color="black"></v-divider>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6">
                <div>
                  <strong>Customer Status: </strong>
                  {{ customerData.customer_live_status || "N/A" }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div>
                  <strong>Working With Us Since: </strong
                  >{{ customerData.customer_since || "N/A" }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card variant="outlined" class="mt-4">
          <v-card-title class="subtitle-1 font-weight-small">
            <v-icon left size="small" color="secondaryColor">mdi-paperclip</v-icon>
            Attachments
          </v-card-title>
          <v-divider :thickness="2" color="black"></v-divider>
          <v-card-text>
            <v-row
              density="compact"
              v-if="
                gstPreviewUrl ||
                contractPreviewUrl ||
                (customerType === 'BUSINESS' && chequePreviewUrl)
              "
            >
              <!-- <v-col cols="12" sm="6" md="3">
                <p class="mb-2">Business License Copy</p>
                <v-img
                  :src="licensePreviewUrl"
                  height="100"
                  width="100"
                  class="rounded elevation-2"
                  cover
                />
              </v-col> -->
              <!-- GST Certificate -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                v-if="customerType === 'BUSINESS' && gstPreviewUrl"
              >
                <p class="mb-2">GST Certificate</p>
                <div class="">
                  <template v-if="gstIsPdf">
                    <v-icon size="36" color="red">mdi-file-pdf-box</v-icon>
                    <a :href="gstPreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="gstPreviewUrl"
                      height="100"
                      width="100"
                      class="rounded elevation-2"
                      cover
                    />
                  </template>
                </div>
              </v-col>

              <!-- PAN Copy -->
              <v-col cols="12" sm="6" md="3" v-if="contractPreviewUrl">
                <p class="mb-2">PAN Copy</p>
                <div class="">
                  <template v-if="contractIsPdf">
                    <v-icon size="36" color="red">mdi-file-pdf-box</v-icon>
                    <a :href="contractPreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="contractPreviewUrl"
                      height="100"
                      width="100"
                      class="rounded elevation-2"
                      cover
                    />
                  </template>
                </div>
              </v-col>

              <!-- Canceled Cheque -->
              <v-col
                cols="12"
                sm="6"
                md="3"
                v-if="customerType === 'BUSINESS' && chequePreviewUrl"
              >
                <p class="mb-2">Canceled Cheque</p>
                <div class="">
                  <template v-if="chequeIsPdf">
                    <v-icon size="36" color="red">mdi-file-pdf-box</v-icon>
                    <a :href="chequePreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="chequePreviewUrl"
                      height="100"
                      width="100"
                      class="rounded elevation-2"
                      cover
                    />
                  </template>
                </div>
              </v-col>
            </v-row>
            <div v-else class="text-subtitle-2 text-grey text-start py-4">
              No attachments added
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  computed: {
    customerData() {
      // safely get customer data from store or fallback to empty object
      return this.$store.getters.GetcustomerData || {};
    },
    customerType() {
      return this.customerData.customer_type || "";
    },
    licensePreviewUrl() {
      return this.customerData.business_license_doc || "";
    },
    gstPreviewUrl() {
      return this.customerData.gst_document || "";
    },
    contractPreviewUrl() {
      return this.customerData.contract_doc || "";
    },
    chequePreviewUrl() {
      return this.customerData.cancelled_cheque || "";
    },
    gstIsPdf() {
      return this.gstPreviewUrl.toLowerCase().endsWith(".pdf");
    },
    contractIsPdf() {
      return this.contractPreviewUrl.toLowerCase().endsWith(".pdf");
    },
    chequeIsPdf() {
      return this.chequePreviewUrl.toLowerCase().endsWith(".pdf");
    },
    productItems() {
      // Get product items from customer data
      if (this.customerData.item_details_names) {
        try {
          // If it's already an array, return it
          if (Array.isArray(this.customerData.item_details_names)) {
            return this.customerData.item_details_names;
          }
          // If it's a JSON string, parse it
          if (typeof this.customerData.item_details_names === 'string') {
            return JSON.parse(this.customerData.item_details_names);
          }
        } catch (e) {
          console.warn('Error parsing product items:', e);
        }
      }
      // Fallback to item_details if item_details_names is not available
      if (this.customerData.item_details) {
        try {
          if (Array.isArray(this.customerData.item_details)) {
            return this.customerData.item_details;
          }
          if (typeof this.customerData.item_details === 'string') {
            return JSON.parse(this.customerData.item_details);
          }
        } catch (e) {
          console.warn('Error parsing item details:', e);
        }
      }
      return [];
    },
  },
  methods: {
    cancelAction() {
      this.$router.push("/home/CustommerSub");
    },
  },
};
</script>

<style>
/* Add your styles here if needed */
</style>

<style scoped>
.v-card-title {
  background-color: #f5f5f5;
}
</style>

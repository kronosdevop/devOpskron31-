<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="ViewSupplierDialog"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar dense flat>
          <v-toolbar-title>View Vendor/Supplier Details</v-toolbar-title>
          <v-spacer />
          <v-btn
            size="small"
            dark
            class="text-capitalize cardCss ml-2 mr-4"
            @click="cancelAction"
          >
            Cancel
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor"
                >mdi-office-building</v-icon
              >
              Basic Company Information
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row dense>
                <v-col md="6" class="">
                  <div>
                    <strong>Billing Name: </strong>
                    {{ formatValue(supplierItem.supplier_name) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Working With Us Since: </strong>
                    {{ formatValue(supplierItem.working_since) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Firm Type: </strong>
                    {{ formatValue(supplierItem.firm_type) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- Address Details -->
          <v-card variant="outlined">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor"
                >mdi-map-marker</v-icon
              >
              Address Details
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row dense>
                <!-- Business Address -->
                <v-col cols="12" sm="5">
                  <div>
                    <strong>Business Address:</strong>
                    {{ formatValue(supplierItem.suppliers_address) }}
                  </div>
                </v-col>
                <v-col cols="12" sm="1">
                  <v-divider vertical></v-divider>
                </v-col>
                <!-- Mailing Address -->
                <v-col cols="12" sm="5">
                  <div>
                    <strong>Mailing Address:</strong>
                    {{ formatValue(supplierItem.suppliers_address_2) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor"
                >mdi-account-box</v-icon
              >
              Contact Details
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row dense>
                <!-- Business Address -->
                <v-col cols="12" sm="5">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Primary Contact Details
                  </h4>
                  <div>
                    <strong>Name:</strong>
                    {{ formatValue(supplierItem.suppliers_contact_name) }}
                  </div>
                  <div>
                    <strong>Phone Number::</strong>
                    {{ formatValue(supplierItem.suppliers_full_number) }}
                  </div>
                  <div>
                    <strong>Email-ID:</strong>
                    {{ formatValue(supplierItem.suppliers_email_id) }}
                  </div>
                </v-col>
                <v-col cols="12" sm="1">
                  <v-divider vertical></v-divider>
                </v-col>
                <!-- Mailing Address -->
                <v-col cols="12" sm="6">
                  <h4 class="subtitle-3 black--text font-weight-small mb-2">
                    Secondary Contact Details
                  </h4>
                  <div>
                    <strong>Name:</strong>
                    {{ formatValue(supplierItem.secondary_contact_name) }}
                  </div>
                  <div>
                    <strong>Phone Number::</strong>
                    {{ formatValue(supplierItem.secondary_contact_no) }}
                  </div>
                  <div>
                    <strong>Email-ID:</strong>
                    {{ formatValue(supplierItem.secondary_email_id) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-card variant="outlined" class="mt-4 mb-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor">mdi-bank</v-icon>
              Banking Details
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row dense>
                <v-col md="6" class="">
                  <div>
                    <strong>Beneficiary Account Name: </strong>
                    {{ formatValue(supplierItem.account_holder_name) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Bank & Branch Name: </strong>
                    {{ formatValue(supplierItem.bank_branch_name) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Beneficiary Account Number: </strong>
                    {{ formatValue(supplierItem.bank_account_no) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>Account Type: </strong>
                    {{ formatValue(supplierItem.account_type) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>IFSC Code: </strong>
                    {{ formatValue(supplierItem.ifsc_code) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor"
                >mdi-scale-balance</v-icon
              >
              Tax & Compliance
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row dense>
                <v-col md="6" class="">
                  <div>
                    <strong>GST Number: </strong>
                    {{ formatValue(supplierItem.gst_no) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>GST State Code: </strong>
                    {{ formatValue(supplierItem.gst_state_code) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>PAN Number: </strong>
                    {{ formatValue(supplierItem.pan_no) }}
                  </div>
                </v-col>
                <v-col md="6" class="">
                  <div>
                    <strong>CIN Number: </strong>
                    {{ formatValue(supplierItem.cin_code) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-card variant="outlined" class="mt-4">
            <v-card-title class="subtitle-1 font-weight-small">
              <v-icon size="small" left color="secondaryColor"
                >mdi-paperclip</v-icon
              >
              Attachments
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row dense>
                <!-- GST Certificate -->
                <v-col cols="12" sm="3">
                  <p class="mb-2">GST Certificate</p>
                  <template v-if="supplierItem.gst_certificate_doccument">
                    <div class="preview-container">
                      <template
                        v-if="isPdfFile(supplierItem.gst_certificate_doccument)"
                      >
                        <div class="pdf-preview">
                          <v-icon large color="red">mdi-file-pdf-box</v-icon>
                          <div class="pdf-info">
                            <span class="pdf-name">{{
                              getFileNameFromUrl(
                                supplierItem.gst_certificate_doccument
                              )
                            }}</span>
                            <a
                              :href="supplierItem.gst_certificate_doccument"
                              target="_blank"
                              class="pdf-link"
                              >View PDF</a
                            >
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <v-img
                          :src="supplierItem.gst_certificate_doccument"
                          height="100"
                          width="100"
                          class="rounded elevation-2"
                          cover
                        />
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-caption black--text">Not Uploaded</p>
                  </template>
                </v-col>

                <!-- PAN Document -->
                <v-col cols="12" sm="3">
                  <p class="mb-2">PAN Document</p>
                  <template v-if="supplierItem.pan_doccument">
                    <div class="preview-container">
                      <template v-if="isPdfFile(supplierItem.pan_doccument)">
                        <div class="pdf-preview">
                          <v-icon large color="red">mdi-file-pdf-box</v-icon>
                          <div class="pdf-info">
                            <span class="pdf-name">{{
                              getFileNameFromUrl(supplierItem.pan_doccument)
                            }}</span>
                            <a
                              :href="supplierItem.pan_doccument"
                              target="_blank"
                              class="pdf-link"
                              >View PDF</a
                            >
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <v-img
                          :src="supplierItem.pan_doccument"
                          height="100"
                          width="100"
                          class="rounded elevation-2"
                          cover
                        />
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-caption black--text">Not Uploaded</p>
                  </template>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    ViewSupplierDialog: Boolean,
    supplierItem: Object,
  },

  methods: {
    cancelAction() {
      this.$emit("clicked", 0);
    },
    isPdfFile(url) {
      return url && url.toLowerCase().endsWith(".pdf");
    },
    getFileNameFromUrl(url) {
      return url ? url.split("/").pop() : "";
    },
    formatValue(value) {
      // Handle null, undefined, empty string, but preserve 0 and other valid values
      // console.log("formatValue input:", value, "type:", typeof value);
      
      if (value === null || value === undefined || value === "") {
        // console.log("Returning N/A for null/undefined/empty");
        return "N/A";
      }
      
      // Handle string values that contain "NaN"
      if (typeof value === 'string' && value.includes('NaN')) {
        // console.log("Returning N/A for string containing NaN");
        return "N/A";
      }
      
      // Only check isNaN for numbers, not strings
      if (typeof value === 'number' && isNaN(value)) {
        // console.log("Returning N/A for NaN number");
        return "N/A";
      }
      
      // console.log("Returning original value:", value);
      return value;
    },
  },
};
</script>

<style scoped>
.preview-container {
  position: relative;
  display: inline-block;
  margin-top: 8px;
}

.pdf-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-width: 200px;
}

.pdf-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pdf-name {
  font-size: 12px;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-link {
  color: #1976d2;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
}

.pdf-link:hover {
  text-decoration: underline;
}
</style>
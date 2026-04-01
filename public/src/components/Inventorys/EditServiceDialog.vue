<template>
  <div>
    <v-dialog
      :model-value="dialog"
      @update:model-value="$emit('update:dialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card class="pa-0 rounded-xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Edit Service</span>
          <v-btn icon variant="text" @click="close_dialog()" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="px-6 py-5">
          <v-form ref="form">
            <!-- Basic Details Section -->
            <div class="mb-6">
              <div class="d-flex align-center mb-4">
                <div class="blue-line mr-3"></div>
                <h3 class="text-h6 blue--text">Basic Details</h3>
              </div>

              <v-row>
                <!-- Service Image Display -->
                <v-col cols="12" md="4">
                  <div class="image-display-container">
                    <v-img
                      v-if="serviceForm.image"
                      :src="serviceForm.image"
                      width="120"
                      height="120"
                      class="rounded-lg mb-3"
                      contain
                    />
                    <v-file-input
                      label="Change Image"
                      variant="outlined"
                      density="compact"
                      accept="image/png, image/jpeg"
                      v-model="serviceForm.imageFile"
                      clearable
                      @click:clear="clearFile('image')"
                    ></v-file-input>
                  </div>
                </v-col>

                <!-- Basic Details Fields -->
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="serviceForm.item_name"
                        label="Service Name"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Service Name is required']"
                        required
                        class="mb-3"
                      />
                    </v-col>

                    <!-- <v-col cols="12" md="6">
                      <v-text-field
                        v-model="serviceForm.item_hsn"
                        label="Service HSN"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      />
                    </v-col> -->

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="serviceForm.item_unit"
                        :items="unitItems"
                        label="Unit"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="serviceForm.category"
                        :items="categoryItems"
                        label="Category"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Category is required']"
                        required
                        class="mb-3"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="serviceForm.item_code"
                        label="Service Code"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="serviceForm.description"
                        label="Description"
                        variant="outlined"
                        density="compact"
                        multiline
                        rows="3"
                        class="mb-3"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>

            <!-- Pricing and Stock Tabs -->
            <div class="mb-4">
              <v-divider class="mb-4"></v-divider>
              <v-tabs
                v-model="activeTab"
                color="#DB4C77"
                slider-color="#DB4C77"
                
              >
                <v-tab value="pricing" class="tab-btn"> Pricing </v-tab>
              </v-tabs>
            </div>

            <!-- Pricing Tab Content -->
            <div v-if="activeTab === 'pricing'" class="mb-6">
              <v-row>
                <!-- Sale Price Section -->
                <v-col cols="12" md="6">
                  <div class="price-section">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3">
                      Service Charges
                    </h4>
                    <v-text-field
                      v-model="serviceForm.sale_price"
                      label="Sale Price"
                      variant="outlined"
                      density="compact"
                      type="number"
                      @keypress="is_number($event)"
                      class="mb-3"
                    />
                    <v-select
                      v-model="serviceForm.sale_tax_type"
                      :items="taxTypes"
                      label="Tax Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-text-field
                      v-model="serviceForm.sale_discount"
                      label="Discount on Sale Price"
                      variant="outlined"
                      density="compact"
                      @keypress="is_number($event)"
                      type="number"
                      class="mb-3"
                    />
                    <v-select
                      v-model="serviceForm.sale_discount_type"
                      :items="discountTypes"
                      label="Discount Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                  </div>
                </v-col>

                <!-- Wholesale Price Section -->
                <!-- <v-col cols="12" md="6">
                  <div class="price-section">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h4 class="text-subtitle-1 font-weight-bold">
                        Wholesale Price
                      </h4>
                      <v-btn
                        icon="mdi-minus"
                        variant="text"
                        size="small"
                        @click="removeWholesale"
                        color="error"
                      ></v-btn>
                    </div>
                    <v-text-field
                      v-model="serviceForm.wholesale_price"
                      label="Wholesale Price"
                      variant="outlined"
                      density="compact"
                      @keypress="is_number($event)"
                      type="number"
                      class="mb-3"
                    />
                    <v-select
                      v-model="serviceForm.wholesale_tax_type"
                      :items="taxTypes"
                      label="Tax Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-text-field
                      v-model="serviceForm.min_wholesale_qty"
                      label="Minimum Wholesale Qty"
                      variant="outlined"
                      @keypress="is_number($event)"
                      density="compact"
                      type="number"
                      class="mb-3"
                    />
                  </div>
                </v-col> -->

                <!-- Purchase Price Section -->
                <!-- <v-col cols="12" md="6">
                  <div class="price-section">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3">
                      Purchase Price
                    </h4>
                    <v-text-field
                      v-model="serviceForm.purchase_price"
                      label="Purchase Price"
                      variant="outlined"
                      density="compact"
                      type="number"
                      @keypress="is_number($event)"
                      class="mb-3"
                    />
                    <v-select
                      v-model="serviceForm.purchase_tax_type"
                      :items="taxTypes"
                      label="Tax Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                  </div>
                </v-col> -->

                <!-- Taxes Section -->
                <!-- <v-col cols="12" md="6">
                  <div class="price-section">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3">Taxes</h4>
                    <v-select
                      v-model="serviceForm.tax_rate"
                      :items="taxRates"
                      label="Tax Rate"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                  </div>
                </v-col> -->
              </v-row>
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
            @click="update_service()"
          >
            Update Service
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { edit_items } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  name: "EditServiceDialog",
  mixins: [get_global_categories, get_material_unit],
  props: {
    dialog: Boolean,
    editingService: Object,
  },
  data() {
    return {
      loading: false,
      activeTab: "pricing",
      showDatePicker: false,
      bucketUrls: {
        image: null,
      },
      serviceForm: {
        item_name: "",
        item_hsn: "",
        item_unit: "",
        description: "",
        category: "",
        item_code: "",
        image: null,
        imageFile: null,
        // Pricing fields
        sale_price: "",
        sale_tax_type: "Without Tax",
        sale_discount: "",
        sale_discount_type: "Percentage",
        wholesale_price: "",
        wholesale_tax_type: "Without Tax",
        min_wholesale_qty: "",
        purchase_price: "",
        purchase_tax_type: "Without Tax",
        tax_rate: "None",
      },
      // Dropdown options
      unitItems: [],
      categoryItems: [],
      taxTypes: ["Without Tax", "With Tax"],
      discountTypes: ["Percentage", "Fixed Amount"],
      taxRates: [
        "None",
        "IGST@0%",
        "GST@0%",
        "IGST@0.25%",
        "GST@0.25%",
        "IGST@3%",
        "GST@3%",
        "IGST@5%",
        "GST@5%",
        "IGST@12%",
        "GST@12%",
        "IGST@18%",
        "GST@18%",
        "IGST@28%",
        "GST@28%",
        "Exempt",
      ],
    };
  },
  computed: {
    displayDate() {
      if (!this.serviceForm.as_of_date) return "";
      const date = new Date(this.serviceForm.as_of_date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
  watch: {
    editingService: {
      handler(newVal) {
        if (newVal) {
          // Populate form with existing data
          this.populateFormForEdit(newVal).catch(error => {
            console.error("Error populating form:", error);
          });
        }
      },
      immediate: true,
    },
    "serviceForm.imageFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "image");
        }
      },
      immediate: false,
    },
    // Watch for dialog changes to reload dropdown data and populate form when dialog opens
    dialog: {
      handler(newVal) {
        if (newVal && this.editingService) {
          // Dialog opened - reload dropdown data and repopulate form
          this.loadDropdownData();
          // Small delay to ensure dropdowns are loaded before populating form
          setTimeout(() => {
            this.populateFormForEdit(this.editingService).catch(error => {
              console.error("Error populating form:", error);
            });
          }, 100);
        }
      },
      immediate: false,
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

    async loadDropdownData() {
      try {
        // Load units from mixin
        await this.get_material_unit();
        if (this.unitmaterials && this.unitmaterials.length > 0) {
          this.unitItems = this.unitmaterials.map((unit) => ({
            title: unit.unit_name,
            value: unit.unit_id,
          }));
        }

        // Load categories from mixin
        await this.get_global_categories();
        if (
          this.masterGlobalCategories &&
          this.masterGlobalCategories.length > 0
        ) {
          this.categoryItems = this.masterGlobalCategories.map((category) => ({
            title: category.category_name,
            value: category.category_id,
          }));
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    },

    async populateFormForEdit(service) {
      // Populate form with existing data
      try {
        // console.log("Populating form with service data:", service);

        // Basic fields
        this.serviceForm.item_name = service.item_name || "";
        this.serviceForm.item_hsn = service.item_hsn || "";
        this.serviceForm.item_unit = service.item_unit || "";
        this.serviceForm.description = service.item_description || "";
        this.serviceForm.category = service.category_id || "";
        this.serviceForm.item_code = service.item_code || "";
        // Handle service image - get signed URL if image exists
        if (service.item_image) {
          try {
            const details = this.$store.getters.GetOrgDetails;
            const signedUrl = await getS3SignedUrl(service.item_image, details.s3_details);
            this.serviceForm.image = signedUrl;
          } catch (error) {
            console.error("Error getting signed URL for service image:", error);
            this.serviceForm.image = null;
          }
        } else {
          this.serviceForm.image = null;
        }
        this.serviceForm.imageFile = null; // Don't set file input for edit

        // Sale price - already an object
        if (service.sale_price && typeof service.sale_price === "object") {
          this.serviceForm.sale_price = service.sale_price.sale_price || "";
          this.serviceForm.sale_tax_type =
            service.sale_price.tax_type || "Without Tax";
        }

        // Wholesale price - already an object
        if (
          service.whole_sale_price &&
          typeof service.whole_sale_price === "object"
        ) {
          this.serviceForm.wholesale_price =
            service.whole_sale_price.wholesale_price || "";
          this.serviceForm.wholesale_tax_type =
            service.whole_sale_price.tax_type || "Without Tax";
          this.serviceForm.min_wholesale_qty =
            service.whole_sale_price.min_wholesale_qty || "";
        }

        // Discount price - already an object
        if (
          service.discount_price &&
          typeof service.discount_price === "object"
        ) {
          this.serviceForm.sale_discount =
            service.discount_price.discount_price || "";
          this.serviceForm.sale_discount_type =
            service.discount_price.discount_type || "Percentage";
        }

        // Purchase price - already an object
        if (
          service.purchase_price &&
          typeof service.purchase_price === "object"
        ) {
          this.serviceForm.purchase_price =
            service.purchase_price.purchase_price || "";
          this.serviceForm.purchase_tax_type =
            service.purchase_price.tax_type || "Without Tax";
        }

        // Other fields
        this.serviceForm.tax_rate = service.item_tax || "None";

        // Set active tab to pricing by default
        this.activeTab = "pricing";

        // console.log("Form populated for edit:", this.serviceForm);
      } catch (error) {
        console.error("Error populating form for edit:", error);
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      // Reset form data when closing
      this.resetForm();
    },

    resetForm() {
      this.serviceForm = {
        item_name: "",
        item_hsn: "",
        item_unit: "",
        description: "",
        category: "",
        item_code: "",
        image: null,
        imageFile: null,
        // Pricing fields
        sale_price: "",
        sale_tax_type: "Without Tax",
        sale_discount: "",
        sale_discount_type: "Percentage",
        wholesale_price: "",
        wholesale_tax_type: "Without Tax",
        min_wholesale_qty: "",
        purchase_price: "",
        purchase_tax_type: "Without Tax",
        tax_rate: "None",
      };
      this.activeTab = "pricing";
      this.showDatePicker = false;
    },

    handleFileUpload(file, type) {
      if (
        file &&
        typeof file === "object" &&
        file.type &&
        file.type.startsWith("image/")
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.serviceForm[type] = e.target.result;
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        reader.readAsDataURL(file);
      } else {
        this.serviceForm[type] = null;
      }
    },

    clearFile(type) {
      this.serviceForm[`${type}File`] = null;
      this.serviceForm[type] = null;
      this.bucketUrls[type] = null;
    },

    removeWholesale() {
      this.serviceForm.wholesale_price = "";
      this.serviceForm.wholesale_tax_type = "Without Tax";
      this.serviceForm.min_wholesale_qty = "";
    },

    async uploadImage() {
      if (!this.serviceForm.imageFile) {
        throw new Error("No new image file to upload");
      }

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "products",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.serviceForm.imageFile.name.replace(
            /\s+/g,
            ""
          )}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.serviceForm.imageFile,
          orgDetails.s3_details,
          key
        );

        if (fileUrl) {
          this.bucketUrls.image = fileUrl;
          return fileUrl;
        }
      } catch (error) {
        console.error("Image upload error:", error);
        throw new Error("Failed to upload image");
      }
    },

    async update_service() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          // Handle image - use existing if not changed, otherwise upload new
          let imageUrl;
          if (this.serviceForm.imageFile) {
            // New image selected - upload it
            imageUrl = await this.uploadImage();
          } else {
            // No new image - use existing image URL
            imageUrl = this.editingService.item_image || null;
          }

          let sale_price = {
            sale_price: this.serviceForm.sale_price,
            tax_type: this.serviceForm.sale_tax_type,
            is_included: Number(this.serviceForm.sale_price) > 0 ? true : false,
          };
          let wholesale_price = {
            wholesale_price: this.serviceForm.wholesale_price,
            tax_type: this.serviceForm.wholesale_tax_type,
            is_included:
              Number(this.serviceForm.wholesale_price) > 0 ? true : false,
            min_wholesale_qty: this.serviceForm.min_wholesale_qty,
          };
          let discount_price = {
            discount_price: this.serviceForm.sale_discount,
            discount_type: this.serviceForm.sale_discount_type,
            is_included:
              Number(this.serviceForm.sale_discount) > 0 ? true : false,
          };
          let purchase_price = {
            purchase_price: this.serviceForm.purchase_price,
            tax_type: this.serviceForm.purchase_tax_type,
            is_included:
              Number(this.serviceForm.purchase_price) > 0 ? true : false,
          };

          // Update API call
          const result = await API.graphql(
            graphqlOperation(edit_items, {
              input: {
                item_id: this.editingService.item_id,
                item_name: this.serviceForm.item_name,
                item_hsn: this.serviceForm.item_hsn,
                item_unit: this.serviceForm.item_unit,
                category_id: this.serviceForm.category,
                item_code: this.serviceForm.item_code,
                item_image: imageUrl,
                item_description: this.serviceForm.description,
                sale_price: JSON.stringify(sale_price),
                whole_sale_price: JSON.stringify(wholesale_price),
                discount_price: JSON.stringify(discount_price),
                purchase_price: JSON.stringify(purchase_price),
                item_tax: this.serviceForm.tax_rate,
                stock_value: this.serviceForm.at_price,
                stock_quantity: this.serviceForm.opening_quantity,
                item_date: this.serviceForm.as_of_date
                  ? typeof this.serviceForm.as_of_date === "string"
                    ? this.serviceForm.as_of_date.split("T")[0]
                    : this.serviceForm.as_of_date.toISOString().split("T")[0]
                  : null,
                item_location: this.serviceForm.location,
                minimum_stock: this.serviceForm.min_stock_maintain,
                item_type: "SERVICE",
              },
            })
          );

          // console.log(result);
          const resultData = JSON.parse(result.data.edit_items);
          // console.log(resultData);
          this.loading = false;
          if (resultData.Status == "SUCCESS") {
            this.$emit("successMsg", resultData.Message);
            this.close_dialog();
          } else {
            this.$emit("errorMsg", resultData.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.message || "An error occurred");
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

.image-display-container {
  text-align: center;
}

.price-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tab-btn {
  font-weight: 500;
  text-transform: none;
}

.tab-btn.v-tab--selected {
  color: #db4c77 !important;
  font-weight: 600;
}
</style>

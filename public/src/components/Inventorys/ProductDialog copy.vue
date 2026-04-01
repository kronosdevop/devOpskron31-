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
          <span class="font-weight-bold text-h5">{{
            editingProduct ? "Edit Goods" : "Add Goods"
          }}</span>
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
                <!-- Product Image Upload -->
                <v-col cols="12" md="4">
                  <div class="image-upload-container">
                    <v-file-input
                      label="Product Image"
                      variant="outlined"
                      density="compact"
                      accept="image/png, image/jpeg"
                      v-model="productForm.imageFile"
                      clearable
                      @click:clear="clearFile('image')"
                    ></v-file-input>
                    <v-img
                      v-if="productForm.image"
                      :src="productForm.image"
                      width="120"
                      height="120"
                      class="rounded-lg mt-2"
                      contain
                    />
                  </div>
                </v-col>

                <!-- Basic Details Fields -->
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="productForm.item_name"
                        label="Item Name"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'Item Name is required']"
                        required
                        class="mb-3"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.item_hsn"
                        label="Item HSN"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="productForm.item_unit"
                        :items="unitItems"
                        label="Unit"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                        item-title="title"
                        item-value="value"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="productForm.category"
                        :items="categoryItems"
                        label="Category"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                        :rules="[(v) => !!v || 'Category is required']"
                        required
                        item-title="title"
                        item-value="value"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.item_code"
                        label="Item Code"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="productForm.description"
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
                <v-tab value="stock" class="tab-btn"> Stock </v-tab>
              </v-tabs>
            </div>

            <!-- Pricing Tab Content -->
            <div v-if="activeTab === 'pricing'" class="mb-6">
              <v-row>
                <!-- Sale Price Section -->
                <v-col cols="12" md="6">
                  <div class="price-section">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3">
                      Sale Price
                    </h4>
                    <v-text-field
                      v-model="productForm.sale_price"
                      label="Sale Price"
                      variant="outlined"
                      density="compact"
                      type="number"
                      @keypress="is_number($event)"
                      class="mb-3"
                    />
                    <v-select
                      v-model="productForm.sale_tax_type"
                      :items="taxTypes"
                      label="Tax Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-text-field
                      v-model="productForm.sale_discount"
                      label="Discount on Sale Price"
                      variant="outlined"
                      density="compact"
                      @keypress="is_number($event)"
                      type="number"
                      class="mb-3"
                    />
                    <v-select
                      v-model="productForm.sale_discount_type"
                      :items="discountTypes"
                      label="Discount Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                  </div>
                </v-col>

                <!-- Wholesale Price Section -->
                <v-col cols="12" md="6">
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
                      v-model="productForm.wholesale_price"
                      label="Wholesale Price"
                      variant="outlined"
                      density="compact"
                      @keypress="is_number($event)"
                      type="number"
                      class="mb-3"
                    />
                    <v-select
                      v-model="productForm.wholesale_tax_type"
                      :items="taxTypes"
                      label="Tax Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-text-field
                      v-model="productForm.min_wholesale_qty"
                      label="Minimum Wholesale Qty"
                      variant="outlined"
                      @keypress="is_number($event)"
                      density="compact"
                      type="number"
                      class="mb-3"
                    />
                  </div>
                </v-col>

                <!-- Purchase Price Section -->
                <v-col cols="12" md="6">
                  <div class="price-section">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3">
                      Purchase Price
                    </h4>
                    <v-text-field
                      v-model="productForm.purchase_price"
                      label="Purchase Price"
                      variant="outlined"
                      density="compact"
                      type="number"
                      @keypress="is_number($event)"
                      class="mb-3"
                    />
                    <v-select
                      v-model="productForm.purchase_tax_type"
                      :items="taxTypes"
                      label="Tax Type"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                  </div>
                </v-col>

                <!-- Taxes Section -->
                <v-col cols="12" md="6">
                  <div class="price-section">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3">Taxes</h4>
                    <v-select
                      v-model="productForm.tax_rate"
                      :items="taxRates"
                      label="Tax Rate"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Stock Tab Content -->
            <div v-if="activeTab === 'stock'" class="mb-6">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="productForm.opening_quantity"
                    label="Opening Quantity"
                    variant="outlined"
                    density="compact"
                    type="number"
                    @keypress="is_number($event)"
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="productForm.at_price"
                    label="At Price"
                    variant="outlined"
                    density="compact"
                    type="number"
                    @keypress="is_number($event)"
                    class="mb-3"
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
                        label="As Of Date"
                        readonly
                        density="compact"
                        prepend-inner-icon="mdi-calendar"
                        v-bind="props"
                        class="mb-3"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="productForm.as_of_date"
                      :max="new Date().toISOString().substr(0, 10)"
                      @update:model-value="showDatePicker = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="productForm.min_stock_maintain"
                    label="Min Stock To Maintain"
                    variant="outlined"
                    density="compact"
                    type="number"
                    @keypress="is_number($event)"
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="productForm.location"
                    :items="locationItems"
                    label="Location"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    closable-chips
                    class="mb-3"
                    item-title="title"
                    item-value="value"
                    return-object
                  />
                </v-col>
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
            @click="save_product()"
          >
            {{ editingProduct ? "Update" : "Create" }}
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
import { get_location_details } from "@/mixins/GetLocations.js";
import { create_items } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  name: "ProductDialog",
  mixins: [get_global_categories, get_material_unit, get_location_details],
  props: {
    dialog: Boolean,
    editingProduct: Object,
  },
  data() {
    return {
      loading: false,
      activeTab: "pricing",
      showDatePicker: false,
      bucketUrls: {
        image: null,
      },
      productForm: {
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
        // Stock fields
        opening_quantity: "",
        at_price: "",
        as_of_date: "",
        min_stock_maintain: "",
        location: [],
      },
      // Dropdown options
      unitItems: [],
      categoryItems: [],
      locationItems: [],
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
      if (!this.productForm.as_of_date) return "";
      const date = new Date(this.productForm.as_of_date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
  watch: {
    editingProduct: {
      handler(newVal) {
        if (newVal) {
          // Editing mode - populate form with existing data
          this.productForm = { ...newVal };
        } else {
          // Add mode - reset form
          this.resetForm();
        }
      },
      immediate: true,
    },
    "productForm.imageFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "image");
        } else {
          this.productForm.image = null;
        }
      },
      immediate: false,
    },
    // Watch for dialog changes to reload dropdown data when dialog opens
    dialog: {
      handler(newVal) {
        if (newVal) {
          // Dialog opened - reload dropdown data
          this.loadDropdownData();
          this.loading = false;
        }
      },
      immediate: false,
    },
    // Watch for store changes to reload data when needed
    "$store.getters.GetOrgDetails": {
      handler() {
        // Reload dropdown data when organization changes
        this.loadDropdownData();
      },
      immediate: false,
      deep: true,
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
        // console.log(this.masterGlobalCategories);
        if (
          this.masterGlobalCategories &&
          this.masterGlobalCategories.length > 0
        ) {
          this.categoryItems = this.masterGlobalCategories.map((category) => ({
            title: category.category_name,
            value: category.category_id,
          }));
        }

        // Load locations from mixin
        await this.get_location_details();
        if (this.locationList && this.locationList.length > 0) {
          this.locationItems = this.locationList.map((location) => ({
            title: location.location_name,
            value: location.location_id,
          }));
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    },

    resetForm() {
      this.productForm = {
        item_name: "",
        item_hsn: "",
        item_unit: "",
        description: "",
        category: "",
        item_code: "",
        image: null,
        imageFile: null,
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
        opening_quantity: "",
        at_price: "",
        as_of_date: "",
        min_stock_maintain: "",
        location: [],
      };
      this.bucketUrls = { image: null };
      this.activeTab = "pricing";
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.resetForm();
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
          this.productForm[type] = e.target.result;
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        reader.readAsDataURL(file);
      } else {
        this.productForm[type] = null;
      }
    },

    clearFile(type) {
      this.productForm[`${type}File`] = null;
      this.productForm[type] = null;
      this.bucketUrls[type] = null;
    },

    removeWholesale() {
      this.productForm.wholesale_price = "";
      this.productForm.wholesale_tax_type = "Without Tax";
      this.productForm.min_wholesale_qty = "";
    },

    async uploadImage() {
      if (!this.productForm.imageFile) return null;

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "products",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.productForm.imageFile.name.replace(
            /\s+/g,
            ""
          )}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.productForm.imageFile,
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

    async save_product() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          // Upload image first
          const imageUrl = await this.uploadImage();
          // console.log(imageUrl);
          let sale_price = {
            sale_price: this.productForm.sale_price,
            tax_type: this.productForm.sale_tax_type,
            is_included: Number(this.productForm.sale_price) > 0 ? true : false,
          };
          let wholesale_price = {
            wholesale_price: this.productForm.wholesale_price,
            tax_type: this.productForm.wholesale_tax_type,
            is_included:
              Number(this.productForm.wholesale_price) > 0 ? true : false,
            min_wholesale_qty: this.productForm.min_wholesale_qty,
          };
          let discount_price = {
            discount_price: this.productForm.sale_discount,
            discount_type: this.productForm.sale_discount_type,
            is_included:
              Number(this.productForm.sale_discount) > 0 ? true : false,
          };
          let purchase_price = {
            purchase_price: this.productForm.purchase_price,
            tax_type: this.productForm.purchase_tax_type,
            is_included:
              Number(this.productForm.purchase_price) > 0 ? true : false,
          };
          // Mock API call - replace with actual API
          const result = await API.graphql(
            graphqlOperation(create_items, {
              input: {
                item_name: this.productForm.item_name,
                item_hsn: this.productForm.item_hsn,
                item_unit: this.productForm.item_unit,
                category_id: this.productForm.category,
                item_code: this.productForm.item_code,
                item_image: imageUrl == null ? null : imageUrl,
                item_description: this.productForm.description,
                sale_price: JSON.stringify(sale_price),
                whole_sale_price: JSON.stringify(wholesale_price),
                discount_price: JSON.stringify(discount_price),
                purchase_price: JSON.stringify(purchase_price),
                // item_price: this.productForm.sale_price,

                item_tax: this.productForm.tax_rate,
                stock_value: this.productForm.at_price,
                stock_quantity: this.productForm.opening_quantity,
                item_date: this.productForm.as_of_date
                  ? typeof this.productForm.as_of_date === "string"
                    ? this.productForm.as_of_date.split("T")[0]
                    : this.productForm.as_of_date.toISOString().split("T")[0]
                  : "",
                item_location: Array.isArray(this.productForm.location)
                  ? this.productForm.location.map(item => item.value).join(', ')
                  : this.productForm.location,
                minimum_stock: this.productForm.min_stock_maintain,
                item_type: "PRODUCT",
              },
            })
          );
          this.loading = false;
          // console.log(result);
          const resultData = JSON.parse(result.data.create_items);
          // console.log(resultData);
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

.image-upload-container {
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

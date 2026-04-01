<template>
  <v-dialog :model-value="ItemAdd" persistent max-width="800">
    <v-card class="dialog-card">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-left">
          <v-icon color="primary" size="20">mdi-cube-outline</v-icon>
          <span>Add Product</span>
        </div>

        <v-icon size="20" @click="closeDialog">mdi-close</v-icon>
      </v-card-title>

      <v-divider class="mb-4"></v-divider>

      <v-form ref="form">
        <v-card-text class="dialog-body">
          <v-row dense>
            <!-- Product Name -->
            <v-col cols="12" md="6">
              <div class="field-label">PRODUCT NAME *</div>

              <v-text-field
                v-model="name"
                placeholder="e.g. Wireless Keyboard"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'Product Name required']"
                prepend-inner-icon="mdi-cube"
                hide-details
              />
            </v-col>

            <!-- SKU -->
            <v-col cols="12" md="6">
              <div class="field-label">SKU</div>

              <v-text-field
                v-model="sku"
                placeholder="Scan or enter SKU"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-barcode"
                hide-details
              />
            </v-col>

            <!-- Price -->
            <v-col cols="12" md="6">
              <div class="field-label">PRICE *</div>

              <v-text-field
                v-model="price"
                placeholder="Enter price"
                density="comfortable"
                variant="outlined"
                :rules="[(v) => !!v || 'Product Price required']"
                prepend-inner-icon="mdi-currency-inr"
                hide-details
              />
            </v-col>

            <!-- Units -->
            <v-col cols="12" md="6">
              <div class="field-label">UNITS *</div>

              <v-select
                v-model="unit"
                :items="units"
                density="comfortable"
                variant="outlined"
                item-title="material_unit_name"
                item-value="material_unit_id"
                prepend-inner-icon="mdi-scale-balance"
                hide-details
                :rules="[(v) => !!v || 'Select Unit']"
                return-object
              />
            </v-col>

            <v-row dense>
              <!-- Category -->
              <v-col cols="12" md="6" class="mt-2">
                <div class="field-label">CATEGORY *</div>

                <v-select
                  v-model="category"
                  :items="categories"
                  variant="outlined"
                  density="comfortable"
                  item-title="category_name"
                  item-value="category_id"
                  prepend-inner-icon="mdi-shape"
                  :rules="[(v) => !!v || 'Select Category required']"
                  hide-details
                />
              </v-col>

              <!-- Product Description -->
              <v-col cols="12" md="6" class="mt-2">
                <div class="field-label">PRODUCT DESCRIPTION</div>
                <v-textarea
                  v-model="description"
                  placeholder="Add additional details or specifications..."
                  variant="outlined"
                  density="comfortable"
                  rows="1"
                  auto-grow
                  maxlength="200"
                  counter="200"
                  prepend-inner-icon="mdi-text-box-outline"
                  hide-details
                />
              </v-col>
            </v-row>
            <!-- Image Upload -->
            <v-col cols="12">
              <div class="image-upload" @click="openFilePicker">
                <v-icon size="38" class="field-label">mdi-camera-plus</v-icon>

                <div class="upload-title">
                  {{ image ? "Change product image" : "Upload product image" }}
                </div>

                <v-file-input
                  ref="fileInput"
                  v-model="imageFile"
                  accept="image/*"
                  class="upload-input"
                  hide-details
                  @update:model-value="handleFileUpload"
                />

                <v-img
                  v-if="image"
                  :src="image"
                  width="300"
                  height="200"
                  class="image-preview"
                  cover
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-form>
      <!-- Button -->
      <v-card-actions>
        <v-btn
          block
          color="primary"
          size="large"
          variant="flat"
          class="rounded-lg ml-3"
          prepend-icon=""
          :loading="loading"
:disabled="!name || !price || !unit || !category"
          @click="FormValidate"
        >
          <v-icon>mdi-cube-outline</v-icon>
          Add Item
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { GetAllCategory } from "@/mixins/AllCategoryList.js";
import { inventory_products_CRUD } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { GetUnitList } from "@/mixins/AllUnitsList";

export default {
  mixins: [GetAllCategory, GetUnitList],
  props: {
    ItemAdd: Boolean,
  },

  data() {
    return {
      name: "",
      description: "",
      sku: "",
      price: null,
      quantity: 0,
      unit: "",
      category: "",
      location: null,
      image: null,
      imageFile: null,
      categories: [],
      loading: false,
      pageLoading: false,
      units: [],
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  watch: {
    ItemAdd: {
      async handler(newVal) {
        if (newVal) {
          this.pageLoading = true;
          await this.GetUnitList();
          this.units = this.unitList;
          await this.GetCategoryListing();
          this.categories = this.listCategory;
          this.pageLoading = false;
        }
      },
    },
  },

  methods: {
    openFilePicker() {
      this.$refs.fileInput.$el.querySelector("input").click();
    },
    async FormValidate() {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        this.Add_product();
      }
    },
    async Add_product() {
      this.loading = true;

      try {
        const imageUrl = await this.uploadImage();
        const result = await API.graphql(
          graphqlOperation(inventory_products_CRUD, {
            input: {
              action_type: "CREATE",
              product_name: this.name,
              product_description: this.description,
              category_id: this.category,
              unit_id: this.unit.material_unit_id,
              unit_name: this.unit.material_unit_name,
              sku: this.sku,
              price: this.price,
              image: imageUrl,
            },
          }),
        );
        const response = JSON.parse(result.data.inventory_products_CRUD);
        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.resetForm();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (e) {
        this.$emit("errorMsg", e.Message);
      } finally {
        this.loading = false;
      }
    },
    handleFileUpload(file) {
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        this.image = e.target.result;
      };

      reader.readAsDataURL(file);
    },
    async uploadImage() {
      if (!this.imageFile) return null;

      try {
        const orgDetails = {
          bucket_name: "stichh-medias",
          region: "us-east-1",
        };

        const key = [
          "products",
          `${Date.now()}_${this.imageFile.name.replace(/\s+/g, "")}`,
        ].join("/");

        const fileUrl = await uploadToS3(this.imageFile, orgDetails, key);

        return fileUrl;
      } catch (err) {
        console.error("Upload error", err);
        return null;
      }
    },
    closeDialog() {
      this.$emit("close", 0);
      this.resetForm();
    },

    increaseQty() {
      this.product.quantity++;
    },

    decreaseQty() {
      if (this.product.quantity > 0) {
        this.product.quantity--;
      }
    },
    resetForm() {
      this.name = "";
      this.description = "";
      this.sku = "";
      this.price = null;
      this.unit = "";
      this.category = "";
      this.image = null;
      this.imageFile = null;

      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
  },
};
</script>

<style scoped>
.dialog-card {
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 16px 40px rgba(0, 0, 0, 0.08);
}

/* HEADER */

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 6px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* FIELD LABEL */

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin-bottom: 4px;
}

.field-icon {
  color: #9ca3af;
}

/* INPUTS */

.v-text-field,
.v-textarea,
.v-select {
  border-radius: 10px;
}

/* IMAGE UPLOAD */

.image-upload {
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  padding: 28px;
  text-align: center;
  background: #fafafa;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.image-upload:hover {
  border-color: #cbd5f5;
  background: #f8fafc;
  transform: translateY(-1px);
}

.upload-title {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.upload-input {
  display: none;
}

.image-preview {
  margin-top: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>

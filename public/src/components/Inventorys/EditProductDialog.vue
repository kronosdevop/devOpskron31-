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
          density="compact"
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

              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="primary"
                    >mdi-package-variant</v-icon
                  >
                  Product Details
                </v-card-title>

                <v-card-text>
                  <v-row>
                    <!-- Basic Details Fields -->
                    <v-col cols="12" md="8">
                      <v-row dense>
                        <v-col cols="12">
                          <v-text-field
                            v-model="productForm.item_name"
                            label="Item Name"
                            variant="outlined"
                            density="compact"
                            :rules="[(v) => !!v || 'Item Name is required']"
                            required
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="productForm.item_hsn"
                            label="Item HSN"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-select
                            v-model="productForm.item_unit"
                            :items="unitItems"
                            label="Unit"
                            variant="outlined"
                            density="compact"
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
                          />
                        </v-col>

                        <v-col cols="12">
                          <v-textarea
                            v-model="productForm.description"
                            label="Description"
                            variant="outlined"
                            density="compact"
                            rows="2"
                            auto-grow
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                    <!-- Product Image Upload -->
                    <v-col cols="12" md="4">
                      <v-card
                        variant="tonal"
                        class="pa-4 d-flex flex-column align-center justify-center"
                        style="min-height: 220px"
                      >
                        <v-file-input
                          label="Product Image"
                          variant="outlined"
                          density="compact"
                          accept="image/png, image/jpeg"
                          v-model="productForm.imageFile"
                          clearable
                          @click:clear="clearFile('image')"
                          class="w-100"
                        />

                        <v-img
                          v-if="productForm.image"
                          :src="productForm.image"
                          width="120"
                          height="120"
                          class="rounded-lg"
                          contain
                        />

                        <div v-else class="text-caption text-grey mt-2">
                          Upload product image preview
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>

            <!-- Pricing and Stock Tabs -->
            <div class="mb-4 mt-n4">
              <v-tabs
                v-model="activeTab"
                color="#DB4C77"
                slider-color="#DB4C77"
                density="compact"
              >
                <!-- Always -->
                <v-tab value="pricing" class="tab-btn">Pricing</v-tab>

                <!-- Normal stock for non slab/block orgs -->
                <v-tab value="stock" v-if="!isSlabBlockOrg" class="tab-btn">
                  Stock
                </v-tab>

                <!-- Slab & Block only for specific orgs -->
                <v-tab value="slabstock" v-if="isSlabBlockOrg" class="tab-btn">
                  Slab Stock
                </v-tab>

                <v-tab value="blockstock" v-if="isSlabBlockOrg" class="tab-btn">
                  Block Stock
                </v-tab>
              </v-tabs>
            </div>

            <!-- Pricing Tab Content -->
            <div v-if="activeTab === 'pricing'" class="mb-6">
              <!-- Sale Price -->
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center">
                  <v-icon class="mr-2" size="small" color="primary"
                    >mdi-cash</v-icon
                  >
                  Sale Price
                </v-card-title>

                <v-card-text>
                  <v-row density="compact">
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.sale_price"
                        label="Sale Price"
                        variant="outlined"
                        density="compact"
                        type="number"
                        @keypress="is_number($event)"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="productForm.sale_tax_type"
                        :items="taxTypes"
                        label="Tax Type"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.sale_discount"
                        label="Discount"
                        variant="outlined"
                        density="compact"
                        type="number"
                        @keypress="is_number($event)"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="productForm.sale_discount_type"
                        :items="discountTypes"
                        label="Discount Type"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Wholesale Price -->
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" size="small" color="teal"
                      >mdi-store</v-icon
                    >
                    Wholesale Price
                  </div>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="showWholesale = !showWholesale"
                  >
                    <v-icon>{{
                      showWholesale ? "mdi-chevron-up" : "mdi-chevron-down"
                    }}</v-icon>
                  </v-btn>
                </v-card-title>

                <v-expand-transition>
                  <div v-show="showWholesale">
                    <v-card-text>
                      <v-row density="compact">
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="productForm.wholesale_price"
                            label="Wholesale Price"
                            variant="outlined"
                            density="compact"
                            type="number"
                            @keypress="is_number($event)"
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-select
                            v-model="productForm.wholesale_tax_type"
                            :items="taxTypes"
                            label="Tax Type"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="productForm.min_wholesale_qty"
                            label="Minimum Quantity"
                            variant="outlined"
                            density="compact"
                            type="number"
                            @keypress="is_number($event)"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </div>
                </v-expand-transition>
              </v-card>

              <!-- Purchase Price -->
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2" color="orange"
                      >mdi-cart</v-icon
                    >
                    Purchase Price
                  </div>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="showPurchase = !showPurchase"
                  >
                    <v-icon>{{
                      showPurchase ? "mdi-chevron-up" : "mdi-chevron-down"
                    }}</v-icon>
                  </v-btn>
                </v-card-title>

                <v-expand-transition>
                  <div v-show="showPurchase">
                    <v-card-text>
                      <v-row density="compact">
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="productForm.purchase_price"
                            label="Purchase Price"
                            variant="outlined"
                            density="compact"
                            type="number"
                            @keypress="is_number($event)"
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-select
                            v-model="productForm.purchase_tax_type"
                            :items="taxTypes"
                            label="Tax Type"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </div>
                </v-expand-transition>
              </v-card>

              <!-- Taxes -->
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" size="small" color="red"
                      >mdi-percent</v-icon
                    >
                    Taxes
                  </div>
                  <v-btn
                    icon
                    variant="text"
                    @click="showTax = !showTax"
                    size="small"
                  >
                    <v-icon>{{
                      showTax ? "mdi-chevron-up" : "mdi-chevron-down"
                    }}</v-icon>
                  </v-btn>
                </v-card-title>

                <v-expand-transition>
                  <div v-show="showTax">
                    <v-card-text>
                      <v-row density="compact">
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="productForm.tax_rate"
                            :items="taxRates"
                            label="Tax Rate"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </div>
                </v-expand-transition>
              </v-card>
            </div>

            <!-- Stock Tab Content -->
            <div v-if="activeTab === 'stock'" class="mb-6">
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="indigo"
                    >mdi-warehouse</v-icon
                  >
                  Stock Details
                </v-card-title>

                <v-card-text>
                  <v-row dense>
                    <!-- Opening Quantity -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.opening_quantity"
                        label="Opening Quantity"
                        variant="outlined"
                        density="compact"
                        type="number"
                        @keypress="is_number($event)"
                      />
                    </v-col>

                    <!-- At Price -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.at_price"
                        label="At Price"
                        variant="outlined"
                        density="compact"
                        type="number"
                        @keypress="is_number($event)"
                      />
                    </v-col>

                    <!-- As Of Date -->
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
                          />
                        </template>

                        <v-date-picker
                          v-model="productForm.as_of_date"
                          :max="new Date().toISOString().substr(0, 10)"
                          @update:model-value="showDatePicker = false"
                        />
                      </v-menu>
                    </v-col>

                    <!-- Min Stock -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="productForm.min_stock_maintain"
                        label="Min Stock To Maintain"
                        variant="outlined"
                        density="compact"
                        type="number"
                        @keypress="is_number($event)"
                      />
                    </v-col>

                    <!-- Location -->
                    <v-col cols="6">
                      <v-autocomplete
                        v-model="productForm.location"
                        :items="locationItems"
                        label="Location"
                        variant="outlined"
                        density="compact"
                        multiple
                        chips
                        closable-chips
                        item-title="title"
                        item-value="value"
                        return-object
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
            <div v-if="activeTab === 'slabstock'" class="mb-6">
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="primary"
                    >mdi-grid-large</v-icon
                  >
                  Slab Details
                </v-card-title>

                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-menu
                        v-model="showDatePickerSlab"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template #activator="{ props }">
                          <v-text-field
                            v-model="displaySliceDate"
                            variant="outlined"
                            label="As Of Date"
                            readonly
                            density="compact"
                            prepend-inner-icon="mdi-calendar"
                            v-bind="props"
                          />
                        </template>

                        <v-date-picker
                          v-model="productForm.slicing_date"
                          :max="new Date().toISOString().substr(0, 10)"
                          @update:model-value="showDatePickerSlab = false"
                        />
                      </v-menu>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_block"
                        label="Block"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_part"
                        label="Part"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_main_color"
                        label="Color"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_l_cm"
                        label="L CM"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_h_cm"
                        label="H CM"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_thk"
                        label="THK"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_nos"
                        label="NOS"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_dispatched"
                        label="Dispatched"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_e_cut"
                        label="E-Cut"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_balance_stock"
                        label="Balance Stock"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_m_2"
                        label="M 2"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_finish"
                        label="Finish"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_location"
                        label="Location"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_remark"
                        label="Remark"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_v_color"
                        label="V Color"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.slab_sub_color"
                        label="Sub Color"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
            <div v-if="activeTab === 'blockstock'" class="mb-6">
              <v-card variant="outlined" class="mb-6 pricing-card">
                <v-card-title class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="indigo"
                    >mdi-cube-outline</v-icon
                  >
                  Block Details
                </v-card-title>

                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_color"
                        label="Color"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_block"
                        label="Block"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_part"
                        label="Part"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_rcvddt"
                        label="RCVD DT"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_fnl"
                        label="FNL"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_fnh"
                        label="FNH"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_fnw"
                        label="FNW"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_mnl"
                        label="ML N"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_mnh"
                        label="MN H"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                                          <v-text-field
                                            v-model="productForm.block_mnw"
                                            label="MN W"
                                            variant="outlined"
                                            density="compact"
                                          />
                                        </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_type"
                        label="Type"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_location"
                        label="Location"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_fmcbm"
                        label="FN CBM"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_mncbm"
                        label="MN CBM"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="productForm.block_nos"
                        label="NOS"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
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
            @click="update_product()"
          >
            Update Item
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
import { edit_items } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  name: "EditProductDialog",
  mixins: [get_global_categories, get_material_unit, get_location_details],
  props: {
    dialog: Boolean,
    editingProduct: Object,
  },
  data() {
    return {
      showWholesale: false,
      showPurchase: false,
      showTax: false,
      loading: false,
      activeTab: "pricing",
      showDatePicker: false,
            showDatePickerSlab: false,
      
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
        slicing_date: "",
                slab_block: "",
                slab_part: "",
                slab_main_color: "",
                slab_l_cm: "",
                slab_h_cm: "",
                slab_thk: "",
                slab_nos: "",
                slab_dispatched: "",
                slab_e_cut: "",
                slab_balance_stock: "",
                slab_m_2: "",
                slab_finish: "",
                slab_location: "",
                slab_remark: "",
                slab_v_color: "",
                slab_sub_color: "",
                block_color: "",
                block_block: "",
                block_part: "",
                block_rcvddt: "",
                block_fnl: "",
                block_fnh: "",
                block_fnw: "",
                block_mnl: "",
                block_mnh: "",
                block_mnw: "",
                block_type: "",
                block_location: "",
                block_fmcbm: "",
                block_mncbm: "",
                block_nos: "",
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
 displaySliceDate() {
      if (!this.productForm.slicing_date) return "";
      const date = new Date(this.productForm.slicing_date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    orgId() {
      return this.$store.getters.GetOrgDetails.organization.organization_id;
    },
    isSlabBlockOrg() {
      return [
        "3b315202-cec4-4201-8cb9-7c533af3fc08",
        "6cd1f507-9bd3-47fa-a228-5d1f9bf94aa8",
      ].includes(this.orgId);
    },
  },
  mounted() {
    if (this.isSlabBlockOrg) {
      this.activeTab = "pricing";
    }
  },
    watch: {
      isSlabBlockOrg(val) {
            if (val) {
              this.activeTab = "pricing";
            }
          },
    editingProduct: {
      handler(newVal) {
        if (newVal) {
          // Populate form with existing data
          this.populateFormForEdit(newVal).catch((error) => {
            console.error("Error populating form:", error);
          });
        }
      },
      immediate: true,
    },
    "productForm.imageFile": {
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
        if (newVal && this.editingProduct) {
          // Dialog opened - reload dropdown data and repopulate form
          this.loadDropdownData();
          // Small delay to ensure dropdowns are loaded before populating form
          setTimeout(() => {
            this.populateFormForEdit(this.editingProduct).catch((error) => {
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

    async populateFormForEdit(product) {
  try {
    /* ---------------- Basic fields ---------------- */
    this.productForm.item_name = product.item_name || "";
    this.productForm.item_hsn = product.item_hsn || "";
    this.productForm.item_unit = product.item_unit || "";
    this.productForm.description = product.item_description || "";
    this.productForm.category = product.category_id || "";
    this.productForm.item_code = product.item_code || "";

    /* ---------------- Image ---------------- */
    if (product.item_image) {
      try {
        const details = this.$store.getters.GetOrgDetails;
        const signedUrl = await getS3SignedUrl(
          product.item_image,
          details.s3_details
        );
        this.productForm.image = signedUrl;
      } catch (error) {
        console.error("Error loading image:", error);
        this.productForm.image = null;
      }
    } else {
      this.productForm.image = null;
    }
    this.productForm.imageFile = null;

    /* ---------------- Sale Price ---------------- */
    if (product.sale_price && typeof product.sale_price === "object") {
      this.productForm.sale_price = product.sale_price.sale_price || "";
      this.productForm.sale_tax_type =
        product.sale_price.tax_type || "Without Tax";
    }
          this.productForm.sale_price = product.sale_price || "";


    /* ---------------- Wholesale Price ---------------- */
    if (product.whole_sale_price && typeof product.whole_sale_price === "object") {
      this.productForm.wholesale_price =
        product.whole_sale_price.wholesale_price || "";
      this.productForm.wholesale_tax_type =
        product.whole_sale_price.tax_type || "Without Tax";
      this.productForm.min_wholesale_qty =
        product.whole_sale_price.min_wholesale_qty || "";
    }

    /* ---------------- Discount ---------------- */
    if (product.discount_price && typeof product.discount_price === "object") {
      this.productForm.sale_discount =
        product.discount_price.discount_price || "";
      this.productForm.sale_discount_type =
        product.discount_price.discount_type || "Percentage";
    }

    /* ---------------- Purchase ---------------- */
    if (product.purchase_price && typeof product.purchase_price === "object") {
      this.productForm.purchase_price =
        product.purchase_price.purchase_price || "";
      this.productForm.purchase_tax_type =
        product.purchase_price.tax_type || "Without Tax";
    }

    /* ---------------- Other Fields ---------------- */
    this.productForm.tax_rate = product.item_tax || "None";
    this.productForm.opening_quantity = product.stock_quantity || "";
    this.productForm.at_price = product.stock_value || "";
    this.productForm.as_of_date = product.item_date
      ? product.item_date.split("T")[0]
      : "";
    this.productForm.min_stock_maintain = product.minimum_stock || "";

    /* ---------------- Location ---------------- */
    if (product.item_location) {
      const locationIds = Array.isArray(product.item_location)
        ? product.item_location
        : product.item_location.split(",").map((id) => id.trim());

      this.productForm.location = this.locationItems.filter((location) =>
        locationIds.includes(location.value)
      );
    } else {
      this.productForm.location = [];
    }

    /* ---------------- Slab Stock ---------------- */
    if (product.slab_stock_fields && typeof product.slab_stock_fields === "object") {
      const slab = product.slab_stock_fields;

      this.productForm.slicing_date = slab.slicing_date
        ? slab.slicing_date.split("T")[0]
        : "";

      this.productForm.slab_block = slab.slab_block || "";
      this.productForm.slab_part = slab.slab_part || "";
      this.productForm.slab_main_color = slab.slab_main_color?.trim() || "";
      this.productForm.slab_l_cm = slab.slab_l_cm?.trim() || "";
      this.productForm.slab_h_cm = slab.slab_h_cm?.trim() || "";
      this.productForm.slab_thk = slab.slab_thk || "";
      this.productForm.slab_nos = slab.slab_nos || "";
      this.productForm.slab_dispatched = slab.slab_dispatched || "";
      this.productForm.slab_e_cut = slab.slab_e_cut || "";
      this.productForm.slab_balance_stock = slab.slab_balance_stock?.trim() || "";
      this.productForm.slab_m_2 = slab.slab_m_2?.trim() || "";
      this.productForm.slab_finish = slab.slab_finish || "";
      this.productForm.slab_location = slab.slab_location?.trim() || "";
      this.productForm.slab_remark = slab.slab_remark?.trim() || "";
      this.productForm.slab_v_color = slab.slab_v_color?.trim() || "";
      this.productForm.slab_sub_color = slab.slab_sub_color || "";
    }

    /* ---------------- Block Stock ---------------- */
    if (product.block_stock_fields && typeof product.block_stock_fields === "object") {
      const block = product.block_stock_fields;

      this.productForm.block_color = block.block_color?.trim() || "";
      this.productForm.block_block = block.block_block || "";
      this.productForm.block_part = block.block_part || "";
      this.productForm.block_rcvddt = block.block_rcvddt || "";
      this.productForm.block_fnl = block.block_fnl || "";
      this.productForm.block_fnh = block.block_fnh || "";
      this.productForm.block_fnw = block.block_fnw || "";
      this.productForm.block_mnl = block.block_mnl || "";
      this.productForm.block_mnh = block.block_mnh || "";
            this.productForm.block_mnw = block.block_mnw || "";

      this.productForm.block_type = block.block_type || "";
      this.productForm.block_location = block.block_location || "";
      this.productForm.block_fmcbm = block.block_fmcbm?.trim() || "";
      this.productForm.block_mncbm = block.block_mncbm || "";
      this.productForm.block_nos = block.block_nos || "";
    }

    /* ---------------- Auto Tab Switch ---------------- */
    // if (this.isSlabBlockOrg) {
    //   if (product.slab_stock_fields) {
    //     this.activeTab = "slabstock";
    //   } else if (product.block_stock_fields) {
    //     this.activeTab = "blockstock";
    //   } else {
    //     this.activeTab = "pricing";
    //   }
    // } else {
    //   this.activeTab = "pricing";
    // }

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
      this.productForm = {
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
      if (!this.productForm.imageFile) {
        throw new Error("No new image file to upload");
      }

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "products",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.productForm.imageFile.name.replace(
            /\s+/g,
            "",
          )}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.productForm.imageFile,
          orgDetails.s3_details,
          key,
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

    async update_product() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          // Handle image - use existing if not changed, otherwise upload new
          let imageUrl;
          if (this.productForm.imageFile) {
            // New image selected - upload it
            imageUrl = await this.uploadImage();
          } else {
            // No new image - use existing image URL
            imageUrl = this.editingProduct.item_image || null;
          }

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
          let slab_stock_fields = {
            slicing_date: this.productForm.slicing_date,
            slab_block: this.productForm.slab_block,
            slab_part: this.productForm.slab_part,
            slab_main_color: this.productForm.slab_main_color,
            slab_l_cm: this.productForm.slab_l_cm,
            slab_h_cm: this.productForm.slab_h_cm,
            slab_thk: this.productForm.slab_thk,
            slab_nos: this.productForm.slab_nos,
            slab_dispatched: this.productForm.slab_dispatched,
            slab_e_cut: this.productForm.slab_e_cut,
            slab_balance_stock: this.productForm.slab_balance_stock,
            slab_m_2: this.productForm.slab_m_2,
            slab_finish: this.productForm.slab_finish,
            slab_location: this.productForm.slab_location,
            slab_remark: this.productForm.slab_remark,
            slab_v_color: this.productForm.slab_v_color,
            slab_sub_color: this.productForm.slab_sub_color,
          };

          let block_stock_fields = {
            block_color: this.productForm.block_color,
            block_block: this.productForm.block_block,
            block_part: this.productForm.block_part,
            block_rcvddt: this.productForm.block_rcvddt,
            block_fnl: this.productForm.block_fnl,
            block_fnh: this.productForm.block_fnh,
            block_fnw: this.productForm.block_fnw,
            block_mnl: this.productForm.block_mnl,
            block_mnh: this.productForm.block_mnh,
            block_mnw: this.productForm.block_mnw,
            block_type: this.productForm.block_type,
            block_location: this.productForm.block_location,
            block_fmcbm: this.productForm.block_fmcbm,
            block_mncbm: this.productForm.block_mncbm,
            block_nos: this.productForm.block_nos,
          };

          // Update API call
          const result = await API.graphql(
            graphqlOperation(edit_items, {
              input: {
                item_id: this.editingProduct.item_id,
                item_name: this.productForm.item_name,
                item_hsn: this.productForm.item_hsn,
                item_unit: this.productForm.item_unit,
                category_id: this.productForm.category,
                item_code: this.productForm.item_code,
                item_image: imageUrl,
                item_description: this.productForm.description,
                sale_price: JSON.stringify(sale_price),
                whole_sale_price: JSON.stringify(wholesale_price),
                discount_price: JSON.stringify(discount_price),
                purchase_price: JSON.stringify(purchase_price),
                item_tax: this.productForm.tax_rate,
                stock_value: this.productForm.at_price,
                stock_quantity: this.productForm.opening_quantity,
                item_date: this.productForm.as_of_date
                  ? typeof this.productForm.as_of_date === "string"
                    ? this.productForm.as_of_date.split("T")[0]
                    : this.productForm.as_of_date.toISOString().split("T")[0]
                  : null,
                item_location: Array.isArray(this.productForm.location)
                  ? this.productForm.location
                      .map((item) => item.value)
                      .join(", ")
                  : this.productForm.location,
                minimum_stock: this.productForm.min_stock_maintain,
                item_type: "PRODUCT",
                slab_stock_fields: JSON.stringify(slab_stock_fields),
                                block_stock_fields: JSON.stringify(block_stock_fields),
              },
            }),
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
  .pricing-card {
  border-color: #e0e0e0 !important; /* light grey outline */
}

.pricing-card .v-card-title {
  font-size: 0.85rem !important; /* smaller title text */
  font-weight: 600;
  padding-top: 10px;
  padding-bottom: 10px;
}
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
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.sales-section {
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

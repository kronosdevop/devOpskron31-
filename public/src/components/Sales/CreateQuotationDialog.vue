<template>
  <v-dialog
    v-model="dialogVisible"
    persistent
    max-width="1400"
    transition="dialog-top-transition"
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Create Quotation</span>
        <v-btn icon variant="text" @click="closeDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="px-4 py-3">
        <v-form ref="form">
          <!-- Order & Customer Details Section -->
          <v-row class="mb-4">
            <!-- Left Column - Customer Details -->
            <v-col cols="12" md="3">
              <div class="mb-3">
                <v-autocomplete
                  v-model="orderForm.customer_search"
                  :items="masterCustomersupdated"
                  item-title="full_user_name"
                  item-value="customer_id"
                  label="Customer *"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-search"
                  :rules="[(v) => !!v || 'Customer search is required']"
                  clearable
                  hide-details
                  placeholder="Type to search customers..."
                  :filter="customFilter"
                  @update:model-value="onCustomerSelect"
                />
              </div>
              <div class="mb-3" v-if="transactionConfig?.billing_name_parties">
                <v-text-field
                  v-model="orderForm.billing_name"
                  label="Billing Name"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account"
                  hide-details
                  placeholder="Billing name..."
                />
              </div>
              <div class="mb-3">
                <v-autocomplete
                  v-model="orderForm.project_name"
                  label="Project Name"
                  variant="outlined"
                  density="compact"
                  :items="masterProjectsUpdate"
                  item-title="project_name"
                  item-value="project_id"
                  prepend-inner-icon="mdi-account"
                  hide-details
                  placeholder="Project name..."
                  clearable
                  :filter="customProjectFilter"
                />
              </div>
              <div>
                <v-text-field
                  v-model="orderForm.po_number"
                  label="PO Number"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>
            </v-col>

            <!-- Spacer Column -->
            <v-col cols="12" md="6" class="d-flex align-center justify-center">
              <!-- Empty space for visual separation -->
            </v-col>

            <!-- Right Column - Order Details -->
            <v-col cols="12" md="3">
              <v-row class="mb-3">
                <v-col cols="7">
                  <v-text-field
                    v-model="orderForm.prefix_name"
                    label="Prefix"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-receipt"
                    hide-details
                    readonly
                  />
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="orderForm.order_count"
                    label="Quotation No."
                    variant="outlined"
                    density="compact"
                    hide-details
                    type="number"
                    min="0"
                    @input="updateOrderNumber"
                  />
                </v-col>
              </v-row>
              <div class="mb-3">
                <v-text-field
                  v-model="orderForm.order_date"
                  label="Quotation Date (DD/MM/YYYY)"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar"
                  type="date"
                  hide-details
                />
              </div>
              <div class="mb-3" v-if="taxConfiguration.enable_place_of_supply">
                <v-select
                  v-model="orderForm.state_of_supply"
                  :items="stateOptions"
                  label="State of supply"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-map-marker"
                  placeholder="Select"
                  clearable
                  hide-details
                />
              </div>
            </v-col>
          </v-row>

          <!-- Items Table Section -->
          <div class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <h3 class="text-h6 font-weight-medium">Quotation Items</h3>
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addItemRow"
                class="text-none"
              >
                ADD ROW
              </v-btn>
            </div>

            <v-card variant="flat" class="table-container">
              <v-card-text class="pa-0">
                <v-table density="comfortable" class="modern-table">
                  <thead>
                    <tr class="table-header">
                      <th class="text-left pa-3">#</th>
                      <th
                        class="text-left pa-3"
                        style="max-width: 170px; width: 170px"
                      >
                        ITEM
                      </th>
                      <th
                        class="text-left pa-3"
                        v-if="taxConfiguration.enable_hsn"
                      >
                        HSN CODE
                      </th>
                      <th
                        class="text-left pa-3"
                        style="max-width: 120px; width: 120px"
                      >
                        ITEM CODE
                      </th>
                      <th
                        class="text-left pa-3"
                        v-if="itemConfiguration.item_category"
                      >
                        CATEGORY
                      </th>
                      <th
                        class="text-left pa-3"
                        v-if="itemConfiguration.description"
                        style="max-width: 140px; width: 140px"
                      >
                        DESCRIPTION
                      </th>
                      <th class="text-left pa-3">QTY</th>
                      <th class="text-left pa-3">UNIT</th>
                      <th class="text-left pa-3">PRICE/UNIT</th>
                      <th
                        class="text-center pa-3"
                        colspan="2"
                        v-if="itemConfiguration.items_wise_discount"
                      >
                        <div class="header-group">
                          <div class="main-header">DISCOUNT</div>
                          <div class="sub-headers">
                            <span class="sub-header">%</span>
                            <span class="sub-header">AMOUNT</span>
                          </div>
                        </div>
                      </th>
                      <th class="text-center pa-3" colspan="2">
                        <div class="header-group">
                          <div class="main-header">TAX</div>
                          <div class="sub-headers">
                            <span class="sub-header">%</span>
                            <span class="sub-header">AMOUNT</span>
                          </div>
                        </div>
                      </th>
                      <th class="text-left pa-3">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in orderForm.items"
                      :key="index"
                      class="table-row"
                    >
                      <td class="pa-3 text-center">
                        <div class="d-flex align-center justify-center gap-2">
                          <span>{{ index + 1 }}</span>
                          <v-btn
                            v-if="orderForm.items.length > 1"
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="deleteItemRow(index)"
                            class="delete-row-btn"
                          />
                        </div>
                      </td>
                      <td class="pa-2" style="max-width: 170px; width: 170px">
                        <div
                          class="item-dropdown-container"
                          :ref="`item-container-${index}`"
                        >
                          <textarea
                            :ref="`item-input-${index}`"
                            v-model="item.item_name"
                            @input="handleItemInput(index, $event)"
                            @focus="showItemDropdown(index, $event)"
                            @blur="hideItemDropdown(index)"
                            class="table-input"
                            placeholder="Type or select item..."
                            rows="1"
                            style="
                              resize: vertical;
                              min-height: 59px;
                              max-height: 300px;
                              overflow-y: auto;
                              width: 100%;
                            "
                          ></textarea>
                          <Teleport to="body">
                            <div
                              v-if="item.showDropdown"
                              class="item-dropdown item-dropdown-fixed"
                              :style="getDropdownStyle(index)"
                            >
                              <div
                                v-for="predefined in filterItems(index)"
                                :key="predefined.item_id"
                                @click="selectPredefinedItem(index, predefined)"
                                class="dropdown-item"
                              >
                                <div class="item-name">
                                  {{ predefined.item_name }}
                                </div>
                              </div>
                              <div
                                v-if="filterItems(index).length === 0"
                                class="no-items"
                              >
                                No items found. Type to add custom item.
                              </div>
                            </div>
                          </Teleport>
                        </div>
                      </td>
                      <td class="pa-2" v-if="taxConfiguration.enable_hsn">
                        <v-textarea
                          v-model="item.hsn_code"
                          density="compact"
                          hide-details
                          placeholder="HSN Code"
                          variant="plain"
                          class="item-input"
                          auto-grow
                          rows="1"
                        />
                      </td>
                      <td class="pa-2" style="max-width: 120px; width: 120px">
                        <v-textarea
                          v-model="item.item_code"
                          density="compact"
                          hide-details
                          placeholder="Item Code"
                          variant="plain"
                          auto-grow
                          rows="1"
                          style="width: 100%"
                        />
                      </td>
                      <td class="pa-2" v-if="itemConfiguration.item_category">
                        <v-select
                          v-model="item.category"
                          :items="masterGlobalCategories"
                          item-title="category_name"
                          item-value="category_id"
                          return
                          object
                          density="compact"
                          hide-details
                          placeholder="Select Category"
                          variant="plain"
                          class="item-input"
                        />
                      </td>
                      <td
                        class="pa-2"
                        v-if="itemConfiguration.description"
                        style="max-width: 140px; width: 140px"
                      >
                        <v-textarea
                          v-model="item.description"
                          density="compact"
                          hide-details
                          placeholder="Enter description..."
                          variant="plain"
                          auto-grow
                          rows="1"
                          style="width: 100%"
                        />
                      </td>
                      <td class="pa-2">
                        <v-text-field
                          v-model="item.quantity"
                          density="compact"
                          hide-details
                          type="number"
                          placeholder="1"
                          variant="plain"
                          class="item-input"
                          min="1"
                          @input="validateQuantity(index, $event)"
                        />
                      </td>
                      <td class="pa-2">
                        <v-select
                          v-model="item.unit"
                          :items="unitmaterials"
                          item-title="unit_name"
                          item-value="unit_name"
                          density="compact"
                          hide-details
                          placeholder="Select Unit"
                          variant="plain"
                          style="width: 100%"
                          @update:model-value="onUnitSelect(index, $event)"
                        />
                      </td>
                      <td class="pa-2">
                        <v-text-field
                          v-model="item.price_per_unit"
                          density="compact"
                          hide-details
                          type="number"
                          placeholder="1"
                          variant="plain"
                          class="item-input"
                          min="1"
                          @input="validatePrice(index, $event)"
                        />
                      </td>
                      <td
                        class="pa-2"
                        v-if="itemConfiguration.items_wise_discount"
                      >
                        <v-text-field
                          v-model="item.discount_percent"
                          density="compact"
                          hide-details
                          type="number"
                          placeholder="0"
                          variant="plain"
                          class="item-input"
                          @input="calculateItemAmount(index)"
                        />
                      </td>
                      <td
                        class="pa-2"
                        v-if="itemConfiguration.items_wise_discount"
                      >
                        <v-text-field
                          v-model="item.discount_amount"
                          density="compact"
                          hide-details
                          type="number"
                          placeholder="0"
                          variant="plain"
                          class="item-input"
                          readonly
                        />
                      </td>
                      <td class="pa-2">
                        <v-autocomplete
                          v-model="item.tax_percent"
                          :items="taxOptions"
                          density="compact"
                          hide-details
                          placeholder="Select"
                          variant="plain"
                          class="item-input"
                          @update:model-value="calculateItemAmount(index)"
                        />
                      </td>
                      <td class="pa-2">
                        <v-text-field
                          v-model="item.tax_amount"
                          density="compact"
                          hide-details
                          type="number"
                          placeholder="0"
                          variant="plain"
                          class="item-input"
                          readonly
                        />
                      </td>
                      <td class="pa-2">
                        <v-text-field
                          v-model="item.amount"
                          density="compact"
                          hide-details
                          type="number"
                          placeholder="0"
                          variant="plain"
                          class="item-input"
                          readonly
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-footer-row">
                      <td class="pa-3 font-weight-bold">TOTAL</td>
                      <td class="pa-3"></td>
                      <td class="pa-3" v-if="taxConfiguration.enable_hsn"></td>
                      <td class="pa-3"></td>
                      <td
                        class="pa-3"
                        v-if="itemConfiguration.item_category"
                      ></td>
                      <td
                        class="pa-3"
                        v-if="itemConfiguration.description"
                      ></td>
                      <td class="pa-3 font-weight-bold">{{ totalQuantity }}</td>
                      <td class="pa-3"></td>
                      <td class="pa-3 font-weight-bold">
                        {{ totalPricePerUnit }}
                      </td>
                      <td
                        class="pa-3"
                        v-if="itemConfiguration.items_wise_discount"
                      ></td>
                      <td
                        class="pa-3 font-weight-bold"
                        v-if="itemConfiguration.items_wise_discount"
                      >
                        {{ totalDiscountAmount }}
                      </td>
                      <td class="pa-3"></td>
                      <td class="pa-3 font-weight-bold">
                        {{ totalTaxAmount }}
                      </td>
                      <td class="pa-3 font-weight-bold total-amount">
                        {{ totalAmount }}
                      </td>
                    </tr>
                  </tfoot>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <!-- Payment & Order Summary Section -->
          <v-row>
            <!-- Left Column - Payment Options -->
            <v-col cols="12" md="6">
              <div class="mb-3">
                <!-- <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-file-document-outline"
                  class="text-none mr-2"
                  size="small"
                  @click="toggleDescription"
                >
                  {{ showDescription ? "HIDE DESCRIPTION" : "ADD DESCRIPTION" }}
                </v-btn> -->
                <!-- <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-camera"
                  class="text-none"
                  size="small"
                  @click="toggleImageUpload"
                >
                  {{ showImageUpload ? "HIDE IMAGE" : "ADD IMAGE" }}
                </v-btn> -->

                <!-- Image Upload Section -->
                <div v-if="showImageUpload" class="mt-3">
                  <div class="image-upload-container">
                    <v-file-input
                      label="Item Image"
                      variant="outlined"
                      density="compact"
                      accept="image/png, image/jpeg"
                      v-model="orderForm.imageFile"
                      clearable
                      @click:clear="clearFile('image')"
                      hide-details
                    ></v-file-input>
                    <v-img
                      v-if="orderForm.image"
                      :src="orderForm.image"
                      width="120"
                      height="120"
                      class="rounded-lg mt-2"
                      contain
                    />
                  </div>
                </div>

                <!-- Description Textarea -->
                <div class="mt-3">
                  <v-textarea
                    v-model="orderForm.description"
                    label="Notes"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    placeholder="Enter customer description..."
                    hide-details
                  />
                </div>
              </div>
            </v-col>

            <!-- Right Column - Order Totals -->
            <v-col cols="12" md="6">
              <!-- Discount Section -->
              <div
                class="mb-3"
                v-if="transactionConfig.transaction_wise_discount"
              >
                <div class="d-flex align-center justify-end">
                  <span class="text-body-2 mr-2">Discount</span>
                  <v-text-field
                    v-model="orderForm.discount_percent"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 80px"
                    placeholder="0"
                    class="mr-2"
                    label="(%)"
                    @input="calculateOrderTotals"
                  />
                  <span class="text-body-2 mr-2">-</span>
                  <v-text-field
                    v-model="orderForm.discount_amount"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 100px"
                    placeholder="0.00"
                    class="mr-4"
                    readonly
                  />
                </div>
              </div>

              <!-- Tax Section -->
              <div class="mb-3" v-if="transactionConfig.with_or_without_tax">
                <div class="d-flex align-center justify-end">
                  <span class="text-body-2 mr-2">Tax</span>
                  <v-autocomplete
                    v-model="orderForm.tax_type"
                    :items="taxOptions"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 120px"
                    placeholder="Select"
                    class="mr-2"
                    @update:model-value="calculateOrderTotals"
                  />
                  <span class="text-body-2 mr-4">{{
                    orderForm.tax_amount || "0"
                  }}</span>
                </div>
              </div>

              <!-- Round Off Section -->
              <div class="mb-3">
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="orderForm.round_off"
                    hide-details
                    class="mr-2"
                    v-if="transactionConfig.round_of"
                  />
                  <span
                    class="text-body-2 mr-2"
                    v-if="transactionConfig.round_of"
                    >Round Off</span
                  >
                  <v-text-field
                    v-if="transactionConfig.round_of"
                    v-model="orderForm.round_off_amount"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 80px"
                    :readonly="!orderForm.round_off"
                    class="mr-4"
                    :label="orderForm.round_off ? 'Amount' : 'Disabled'"
                  />
                  <span class="text-h6 font-weight-medium mr-3">Total:</span>
                  <v-text-field
                    v-model="orderForm.grand_total"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                    class="text-h6 font-weight-bold"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Terms and Conditions Section -->
      <v-divider></v-divider>
      <v-card-text class="px-4 py-3">
        <v-textarea
          v-model="orderForm.terms_conditions"
          label="Terms and Conditions"
          variant="outlined"
          density="compact"
          rows="4"
          placeholder="Enter terms and conditions for this quotation..."
          hide-details
          class="mb-2"
        />
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="px-4 py-3 justify-end">
        <v-btn text @click="closeDialog" size="small">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          @click="saveOrder"
          size="small"
        >
          Create Quotation
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { create_sale_order_quotations } from "@/graphql/mutations.js";
import { get_organization_prefix } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { get_inventory_items } from "@/mixins/GetInventoryItems.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_all_projects } from "@/mixins/GetAllProjects.js";
import { get_termsAndcondition_list } from "@/mixins/GetTermsandConditionList.js";

export default {
  name: "CreateQuotationDialog",
  mixins: [
    get_global_customers,
    get_inventory_items,
    get_material_unit,
    get_global_categories,
    get_all_projects,
    get_termsAndcondition_list,
  ],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    salesPurchaseConfig: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "successMsg", "errorMsg"],
  data() {
    return {
      masterCustomersupdated: [],
      masterProjectsUpdate: [],
      loading: false,
      showDescription: false,
      showImageUpload: false,
      taxConfiguration: {},
      itemConfiguration: {},
      transactionConfig: {
        billing_name_parties: false, // Default value
      },
      bucketUrls: {
        image: null,
      },
      dropdownPositions: {},
      orderForm: {
        customer_search: "",
        customer_id: "",
        phone_no: "",
        billing_name: "",
        project_name: "",
        prefix_name: "",
        po_number: "",
        order_count: "",
        order_no: "",
        order_date: this.getCurrentDate(),
        description: "",
        image: null,
        imageFile: null,
        state_of_supply: "",
        payment_type: "",
        discount_percent: "",
        discount_amount: "0.00",
        tax_type: "GST@0%",
        tax_amount: "0.00",
        round_off: false,
        round_off_amount: "0.00",
        grand_total: "0",
        terms_conditions: "",
        items: [
          {
            item_id: "",
            item_name: "",
            hsn_code: "",
            item_code: "",
            category: "",
            description: "",
            quantity: "1",
            unit: "",
            unit_id: "",
            price_per_unit: "1",
            discount_percent: "",
            discount_amount: "0",
            tax_percent: "GST@0%",
            tax_amount: "0",
            amount: "0",
            showDropdown: false,
          },
        ],
      },

      stateOptions: [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
      ],
      taxOptions: [
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
      paymentOptions: [
        "Cash",
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "Cheque",
        "UPI",
        "Digital Wallet",
      ],
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    totalQuantity() {
      return this.orderForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0);
      }, 0);
    },
    totalPricePerUnit() {
      return this.orderForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price_per_unit) || 0);
      }, 0);
    },
    totalDiscountAmount() {
      return this.orderForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.discount_amount) || 0);
      }, 0);
    },
    totalTaxAmount() {
      return this.orderForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.tax_amount) || 0);
      }, 0);
    },
    totalAmount() {
      return this.orderForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
  },
  mounted() {
    this.orderForm.order_date = this.getCurrentDate();
  },
  watch: {
    totalAmount: {
      handler(newTotal) {
        this.calculateOrderTotals();
      },
      immediate: true,
    },
    modelValue: {
      async handler(newVal) {
        if (newVal) {
          // console.log("salesPurchaseConfig", this.salesPurchaseConfig);

          // Safely find transaction config with fallback
          if (this.salesPurchaseConfig && this.salesPurchaseConfig.length > 0) {
            const transactionConfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "TRANSACTION"
            );
            if (transactionConfig) {
              this.transactionConfig = transactionConfig;
              // console.log("transactionConfig", this.transactionConfig);
            } else {
              // Fallback to default config if no transaction config found
              this.transactionConfig = {
                billing_name_parties: false,
                transaction_wise_discount: false,
                round_of: false,
                with_or_without_tax: false,
              };
            }
            const taxconfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "TAXES"
            );
            if (taxconfig) {
              this.taxConfiguration = taxconfig;
              // console.log("taxConfiguration", this.taxConfiguration);
            } else {
              this.taxConfiguration = {
                enable_place_of_supply: false,
                enable_hsn: false,
                enable_gst: false,
              };
            }
            const itemconfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "ITEM"
            );
            if (itemconfig) {
              this.itemConfiguration = itemconfig;
              // console.log("itemConfiguration", this.itemConfiguration);
            } else {
              this.itemConfiguration = {
                item_category: false,
                description: false,
                items_wise_discount: false,
              };
            }
          } else {
            // Fallback to default config if salesPurchaseConfig is empty
            this.transactionConfig = {
              billing_name_parties: false,
              transaction_wise_discount: false,
              round_of: false,
              with_or_without_tax: false,
            };
            this.taxConfiguration = {
              enable_place_of_supply: false,
              enable_hsn: false,
              enable_gst: false,
            };
            this.itemConfiguration = {
              item_category: false,
              description: false,
              items_wise_discount: false,
            };
          }

          // console.log("transactionConfig", this.transactionConfig);
          await Promise.all([
            this.get_organization_prefix(),
            this.get_global_customers(),
            this.get_inventory_items(),
            this.get_material_unit(),
            this.get_global_categories(),
            this.get_all_projects(),
            this.get_termsAndcondition_list(),
          ]);
          this.fetch_details();
          this.loadTermsAndConditions();
        }
      },
      immediate: true,
    },
    "orderForm.imageFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "image");
        } else {
          this.orderForm.image = null;
        }
      },
      immediate: false,
    },
    "orderForm.round_off": {
      handler(newValue) {
        this.calculateRoundOff();
      },
      immediate: false,
    },
    "orderForm.round_off_amount": {
      handler(newValue) {
        if (this.orderForm.round_off && newValue !== "0.00") {
          // Calculate the base total (after discount and tax but before round off)
          const baseTotal = this.calculateOrderTotalsWithoutRoundOff();
          const roundOffAmount = parseFloat(newValue) || 0;
          this.orderForm.grand_total = (baseTotal + roundOffAmount).toFixed(2);
        }
      },
      immediate: false,
    },
  },
  methods: {
    async fetch_details() {
      this.masterCustomersupdated = [];
      // console.log("masterCustomers", this.masterCustomers);
      this.masterCustomers.forEach((customer) => {
        this.masterCustomersupdated.push({
          full_user_name:
            customer.legal_name + " ( " + customer.customer_display_id + " ) ",
          customer_id: customer.customer_id,
        });
      });
    },
    async get_organization_prefix() {
      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        if (
          !orgDetails ||
          !orgDetails.organization ||
          !orgDetails.organization.organization_id
        ) {
          console.warn("Organization details not available");
          this.setDefaultPrefix();
          return;
        }

        const prefix = await API.graphql(
          graphqlOperation(get_organization_prefix, {
            organization_id: orgDetails.organization.organization_id,
            prefix_type: "QUOTATION",
          })
        );

        if (!prefix.data || !prefix.data.get_organization_prefix) {
          console.warn("No prefix data received from API");
          this.setDefaultPrefix();
          return;
        }

        let prefix_no;
        try {
          prefix_no = JSON.parse(prefix.data.get_organization_prefix);
        } catch (parseError) {
          console.error("Error parsing prefix data:", parseError);
          this.setDefaultPrefix();
          return;
        }

        if (Array.isArray(prefix_no) && prefix_no.length > 0 && prefix_no[0]) {
          const firstPrefix = prefix_no[0];

          if (firstPrefix.prefix_name && firstPrefix.count !== undefined) {
            this.orderForm.prefix_name = firstPrefix.prefix_name;
            this.orderForm.order_count = firstPrefix.count.toString();
            this.updateOrderNumber();
          } else {
            console.warn(
              "Prefix data missing required properties:",
              firstPrefix
            );
            this.setDefaultPrefix();
          }
        } else {
          console.warn("Invalid prefix data structure:", prefix_no);
          this.setDefaultPrefix();
        }
      } catch (error) {
        console.error("Error fetching organization prefix:", error);
        this.setDefaultPrefix();
      }
    },

    setDefaultPrefix() {
      this.orderForm.prefix_name = "QT-";
      this.orderForm.order_count = "001";
      this.updateOrderNumber();
    },

    updateOrderNumber() {
      // Prevent negative numbers
      if (
        this.orderForm.order_count !== "" &&
        parseFloat(this.orderForm.order_count) < 0
      ) {
        this.orderForm.order_count = "0";
      }

      if (this.orderForm.prefix_name && this.orderForm.order_count) {
        this.orderForm.order_no =
          this.orderForm.prefix_name + this.orderForm.order_count;
      }
    },

    closeDialog() {
      this.$emit("update:modelValue", false);
      this.$refs.form.resetValidation();
      this.resetForm();
    },

    resetForm() {
      this.orderForm = {
        customer_search: "",
        customer_id: "",
        phone_no: "",
        billing_name: "",
        project_name: "",
        prefix_name: "",
        po_number: "",
        order_count: "",
        order_no: "",
        order_date: this.getCurrentDate(),
        description: "",
        image: null,
        imageFile: null,
        state_of_supply: "",
        payment_type: "",
        discount_percent: "",
        discount_amount: "0.00",
        tax_type: "",
        tax_amount: "0.00",
        round_off: false,
        round_off_amount: "0.00",
        grand_total: "0",
        terms_conditions: "",
        items: [
          {
            item_id: "",
            item_name: "",
            hsn_code: "",
            item_code: "",
            category: "",
            description: "",
            quantity: "1",
            unit: "",
            unit_id: "",
            price_per_unit: "1",
            discount_percent: "",
            discount_amount: "0",
            tax_percent: "GST@0%",
            tax_amount: "0",
            amount: "0",
            showDropdown: false,
          },
        ],
      };
      this.bucketUrls = { image: null };
      this.showDescription = false;
      this.showImageUpload = false;
    },

    getCurrentDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },

    addItemRow() {
      this.orderForm.items.push({
        item_id: "",
        item_name: "",
        hsn_code: "",
        item_code: "",
        category: "",
        description: "",
        quantity: "1",
        unit: "",
        unit_id: "",
        price_per_unit: "1",
        discount_percent: "",
        discount_amount: "0",
        tax_percent: "GST@0%",
        tax_amount: "0",
        amount: "0",
        showDropdown: false,
      });
    },

    deleteItemRow(index) {
      if (this.orderForm.items.length > 1) {
        this.orderForm.items.splice(index, 1);
        this.orderForm.items.forEach((_, idx) => {
          this.calculateItemAmount(idx);
        });
      }
    },

    toggleDescription() {
      if (this.showDescription) {
        this.orderForm.description = "";
      }
      this.showDescription = !this.showDescription;
    },

    toggleImageUpload() {
      if (this.showImageUpload) {
        this.clearFile("image");
      }
      this.showImageUpload = !this.showImageUpload;
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
          this.orderForm[type] = e.target.result;
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        reader.readAsDataURL(file);
      } else {
        this.orderForm[type] = null;
      }
    },

    clearFile(type) {
      this.orderForm[`${type}File`] = null;
      this.orderForm[type] = null;
      this.bucketUrls[type] = null;
    },

    async uploadImage() {
      if (!this.orderForm.imageFile) return null;

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "quotations",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.orderForm.imageFile.name.replace(/\s+/g, "")}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.orderForm.imageFile,
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

    customFilter(item, queryText, itemTitle) {
      const text = itemTitle.toLowerCase();
      const query = queryText.toLowerCase();
      return (
        text.indexOf(query) > -1 ||
        (item.phone_number &&
          item.phone_number.toLowerCase().indexOf(query) > -1) ||
        (item.email && item.email.toLowerCase().indexOf(query) > -1)
      );
    },

    customProjectFilter(item, queryText, itemTitle) {
      const text = itemTitle.toLowerCase();
      const query = queryText.toLowerCase();
      return text.indexOf(query) > -1;
    },

    onCustomerSelect(customerId) {
      if (!customerId) return;

      const selectedCustomer = this.masterCustomers.find(
        (c) => c.customer_id === customerId
      );

      if (selectedCustomer) {
        this.orderForm.customer_id = selectedCustomer.customer_id;
        this.orderForm.phone_no = selectedCustomer.primary_contact_no || "";
        this.orderForm.billing_name =
          selectedCustomer.billing_name || selectedCustomer.customer_name || "";
      }
    },

    // onCustomerSelect(customerId) {
    //   if (customerId) {
    //     const selectedCustomer = this.masterCustomers.find(
    //       (customer) => customer.customer_id === customerId
    //     );
    //     if (selectedCustomer) {
    //       // console.log("selectedCustomer", selectedCustomer);
    //       this.orderForm.customer_search = selectedCustomer.customer_name;
    //       this.orderForm.customer_id = selectedCustomer.customer_id;
    //       this.orderForm.phone_no = selectedCustomer.primary_contact_no || "";
    //       this.orderForm.billing_name =
    //         selectedCustomer.billing_name ||
    //         selectedCustomer.customer_name ||
    //         "";
    //       this.orderForm.project_name = "";
    //       let masterProjectsUpdate = this.masterProjects.filter(
    //         (project) =>
    //           project.internal_project_sponser ===
    //           selectedCustomer.customer_email_id
    //       );
    //       this.masterProjectsUpdate = [];
    //       // console.log("masterProjectsUpdate", masterProjectsUpdate);
    //       masterProjectsUpdate.forEach((project) => {
    //         this.masterProjectsUpdate.push({
    //           project_id: project.project_id,
    //           project_name:
    //             project.project_name +
    //             " ( " +
    //             (project.project_display_id || "-") +
    //             " )",
    //         });
    //       });

    //       // console.log("orderForm", this.masterProjectsUpdate);
    //     }
    //   }
    // },

    handleItemInput(index, event) {
      const item = this.orderForm.items[index];
      const value = event.target.value;

      // Auto-grow textarea
      if (event.target && event.target.tagName === "TEXTAREA") {
        event.target.style.height = "auto";
        event.target.style.height = event.target.scrollHeight + "px";
      }

      if (value && typeof value === "string") {
        item.item_name = value;

        const existingItem = this.masterItems.find(
          (masterItem) => masterItem.item_name === value
        );

        if (existingItem) {
          item.item_id = existingItem.item_id;
          item.hsn_code = existingItem.item_hsn || "";
          item.item_code = existingItem.item_code || "";
          if (this.itemConfiguration.item_category) {
            item.category = existingItem.category_id || "";
          }
          if (this.itemConfiguration.description) {
            item.description = existingItem.item_description || "";
          }
          item.unit = this.getUnitTextById(existingItem.item_unit);
          item.price_per_unit = existingItem.sale_price?.sale_price || "0";
          item.discount_percent =
            existingItem.discount_price?.discount_price || "";
          item.tax_percent = existingItem.item_tax || "GST@0%";
        } else {
          item.item_id = "";
          item.hsn_code = "";
          item.item_code = "";
          if (this.itemConfiguration.item_category) {
            item.category = "";
          }
          if (this.itemConfiguration.description) {
            item.description = "";
          }
          item.unit = "";
          item.price_per_unit = "1";
          item.discount_percent = "";
          item.tax_percent = "";
        }

        this.calculateItemAmount(index);
      }
    },

    showItemDropdown(index, event) {
      const item = this.orderForm.items[index];
      item.showDropdown = true;

      // Calculate dropdown position
      this.$nextTick(() => {
        const textareaRef = this.$refs[`item-input-${index}`];
        const textarea = Array.isArray(textareaRef)
          ? textareaRef[0]
          : textareaRef;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          this.dropdownPositions[index] = {
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
          };
        }
      });
    },

    hideItemDropdown(index) {
      setTimeout(() => {
        const item = this.orderForm.items[index];
        item.showDropdown = false;
        // Clean up position
        delete this.dropdownPositions[index];
      }, 200);
    },

    getDropdownStyle(index) {
      const position = this.dropdownPositions[index];
      if (position) {
        return {
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          zIndex: 9999,
        };
      }
      return {
        position: "fixed",
        zIndex: 9999,
      };
    },

    filterItems(index) {
      const item = this.orderForm.items[index];
      const query = item.item_name.toLowerCase();

      if (!query) {
        return this.masterItems;
      } else {
        return this.masterItems.filter(
          (masterItem) =>
            masterItem.item_name.toLowerCase().includes(query) ||
            masterItem.item_code.toLowerCase().includes(query) ||
            (masterItem.category_name &&
              masterItem.category_name.toLowerCase().includes(query))
        );
      }
    },

    selectPredefinedItem(index, predefinedItem) {
      const item = this.orderForm.items[index];
      item.item_id = predefinedItem.item_id;
      item.item_name = predefinedItem.item_name;
      item.hsn_code = predefinedItem.item_hsn || "";
      item.item_code = predefinedItem.item_code || "";
      if (this.itemConfiguration.item_category) {
        item.category = this.masterGlobalCategories.find(
          (c) => c.category_id === predefinedItem.category_id
        );
      }
      if (this.itemConfiguration.description) {
        item.description = predefinedItem.item_description || "";
      }
      item.unit = this.getUnitTextById(predefinedItem.item_unit);
      item.price_per_unit = predefinedItem.sale_price?.sale_price || "1";
      item.discount_percent =
        predefinedItem.discount_price?.discount_price || "";
item.tax_percent =
  predefinedItem.item_tax ||
  this.taxOptions.find(t => t.includes("GST@0%")) ||
  "GST@0%";
      item.unit_id = "";
      item.showDropdown = false;

      // Auto-grow textarea after selecting item
      this.$nextTick(() => {
        const textareaRef = this.$refs[`item-input-${index}`];
        const textarea = Array.isArray(textareaRef)
          ? textareaRef[0]
          : textareaRef;
        if (textarea && textarea.tagName === "TEXTAREA") {
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        }
      });

      this.calculateItemAmount(index);
    },

    getUnitTextById(unitId) {
      if (!unitId || !this.unitmaterials || !this.unitmaterials.length) {
        return "";
      }

      const unit = this.unitmaterials.find((u) => u.unit_id === unitId);
      return unit ? unit.unit_name || unit.short_name || "" : "";
    },

    onUnitSelect(index, unitName) {
      const item = this.orderForm.items[index];
      if (unitName) {
        const unit = this.unitmaterials.find((u) => u.unit_name === unitName);
        if (unit) {
          item.unit_id = unit.unit_id;
          item.unit = unitName;
        }
      } else {
        item.unit_id = "";
        item.unit = "";
      }
      this.calculateItemAmount(index);
    },

    validateQuantity(index, event) {
      const item = this.orderForm.items[index];
      let value = parseFloat(event.target.value) || 1;

      // Prevent values below 1
      if (value < 1) {
        value = 1;
        item.quantity = "1";
      }

      // Update the item quantity
      item.quantity = value.toString();

      // Calculate amount after validation
      this.calculateItemAmount(index);
    },

    validatePrice(index, event) {
      const item = this.orderForm.items[index];
      let value = parseFloat(event.target.value) || 1;

      // Prevent values below 1
      if (value < 1) {
        value = 1;
        item.price_per_unit = "1";
      }

      // Update the item price
      item.price_per_unit = value.toString();

      // Calculate amount after validation
      this.calculateItemAmount(index);
    },

    calculateItemAmount(index) {
      const item = this.orderForm.items[index];
      const quantity = parseFloat(item.quantity) || 0;
      const pricePerUnit = parseFloat(item.price_per_unit) || 0;

      // Only apply discount if items_wise_discount is enabled
      const discountPercent =
        this.itemConfiguration.items_wise_discount ?? false
          ? parseFloat(item.discount_percent) || 0
          : 0;

      let taxPercent = 0;
      if (item.tax_percent && item.tax_percent !== "Exempt") {
        const taxMatch = item.tax_percent.match(/(\d+(?:\.\d+)?)/);
        taxPercent = taxMatch ? parseFloat(taxMatch[1]) : 0;
      }

      let baseAmount = quantity * pricePerUnit;
      const discountAmount = (baseAmount * discountPercent) / 100;
      item.discount_amount = discountAmount.toFixed(2);

      const amountAfterDiscount = baseAmount - discountAmount;
      const taxAmount = (amountAfterDiscount * taxPercent) / 100;
      item.tax_amount = taxAmount.toFixed(2);

      const finalAmount = amountAfterDiscount + taxAmount;
      item.amount = finalAmount.toFixed(2);
    },

    calculateOrderTotals() {
      // Calculate discount amount
      const subtotal = this.totalAmount;
      const discountPercent = parseFloat(this.orderForm.discount_percent) || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      this.orderForm.discount_amount = discountAmount.toFixed(2);

      // Calculate tax amount
      let taxAmount = 0;
      if (this.orderForm.tax_type && this.orderForm.tax_type !== "Exempt") {
        const taxMatch = this.orderForm.tax_type.match(/(\d+(?:\.\d+)?)/);
        if (taxMatch) {
          const taxPercent = parseFloat(taxMatch[1]);
          const amountAfterDiscount = subtotal - discountAmount;
          taxAmount = (amountAfterDiscount * taxPercent) / 100;
        }
      }
      this.orderForm.tax_amount = taxAmount.toFixed(2);

      // Calculate final total
      const finalTotal = subtotal - discountAmount + taxAmount;
      this.orderForm.grand_total = finalTotal.toFixed(2);

      // Recalculate round off if it's enabled
      if (this.orderForm.round_off) {
        this.calculateRoundOff();
      }
    },

    calculateOrderTotalsWithoutRoundOff() {
      // Calculate discount amount
      const subtotal = this.totalAmount;
      const discountPercent = parseFloat(this.orderForm.discount_percent) || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      this.orderForm.discount_amount = discountAmount.toFixed(2);

      // Calculate tax amount
      let taxAmount = 0;
      if (this.orderForm.tax_type && this.orderForm.tax_type !== "Exempt") {
        const taxMatch = this.orderForm.tax_type.match(/(\d+(?:\.\d+)?)/);
        if (taxMatch) {
          const taxPercent = parseFloat(taxMatch[1]);
          const amountAfterDiscount = subtotal - discountAmount;
          taxAmount = (amountAfterDiscount * taxPercent) / 100;
        }
      }
      this.orderForm.tax_amount = taxAmount.toFixed(2);

      // Calculate final total without round off
      const finalTotal = subtotal - discountAmount + taxAmount;
      return finalTotal;
    },

    calculateRoundOff() {
      if (this.orderForm.round_off) {
        // Calculate the total after discount and tax but before round off
        const currentTotal = this.calculateOrderTotalsWithoutRoundOff();

        // Calculate round off amount to make total a whole number
        const roundedTotal = Math.round(currentTotal);
        const roundOffAmount = roundedTotal - currentTotal;

        // Update round off amount and grand total
        this.orderForm.round_off_amount = roundOffAmount.toFixed(2);
        this.orderForm.grand_total = roundedTotal.toFixed(2);
      } else {
        // Reset round off amount and restore calculated total
        this.orderForm.round_off_amount = "0.00";
        this.calculateOrderTotals();
      }
    },
    findProjectName(projectId) {
      const project = this.masterProjects.find(
        (project) => project.project_id === projectId
      );
      return project ? project.project_name : "";
    },

    loadTermsAndConditions() {
      try {
        // Get terms from store (set by the mixin)
        const storedTerms = this.$store.getters.GetTermsandConditions;

        if (storedTerms && storedTerms.data && storedTerms.data.length > 0) {
          // Use terms_and_conditions if available, otherwise try other fields
          const termsData = storedTerms.data[0];
          this.orderForm.terms_conditions =
            termsData.terms_and_conditions ||
            termsData.quotation_terms_conditions ||
            termsData.billing_terms_conditions ||
            termsData.proforma_terms_conditions ||
            "";
        } else if (storedTerms && storedTerms.terms_and_conditions) {
          this.orderForm.terms_conditions = storedTerms.terms_and_conditions;
        } else if (
          this.termsAndconditionList &&
          this.termsAndconditionList.data &&
          this.termsAndconditionList.data.length > 0
        ) {
          // Fallback to mixin's termsAndconditionList
          const termsData = this.termsAndconditionList.data[0];
          this.orderForm.terms_conditions =
            termsData.terms_and_conditions ||
            termsData.quotation_terms_conditions ||
            termsData.billing_terms_conditions ||
            termsData.proforma_terms_conditions ||
            "";
        }
      } catch (error) {
        console.error("Error loading terms and conditions:", error);
      }
    },
    async saveOrder() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // Validate items array
        // if (this.orderForm.items.length !== 1) {
        //   this.$emit("errorMsg", "Please ensure there is exactly one item in the quotation");
        //   return;
        // }

        // Validate item_name is not empty
        const firstItem = this.orderForm.items[0];
        if (!firstItem.item_name || firstItem.item_name.trim() === "") {
          this.$emit("errorMsg", "Item name is required and cannot be empty");
          return;
        }

        this.loading = true;

        try {
          const imageUrl = await this.uploadImage();
          // console.log("Image URL:", imageUrl);
          const input = {
            po_no: this.orderForm.po_number,
            invoice_no: this.orderForm.order_no,
            transaction_type: "QUOTATION",
            customer_id: this.orderForm.customer_id,
            project_id: this.orderForm.project_name,
            project_name: this.findProjectName(this.orderForm.project_name),
            customer_name: this.orderForm.billing_name,
            // customer_phone_no
            // billing_address
            invoice_date: this.orderForm.order_date,
            // payment_terms
            // due_date
            state: this.orderForm.state_of_supply,
            table_data: JSON.stringify(this.orderForm.items),
            // total: this.orderForm.total_amount,
            // payment_details
            total_cost: this.orderForm.grand_total,
            discount_percent: this.orderForm.discount_percent || "0",
            discount_amount: this.orderForm.discount_amount || "0.00",
            tax_type: this.orderForm.tax_type || "",
            tax_amount: this.orderForm.tax_amount || "0.00",
            // received_cost
            // balance_cost
            description: this.orderForm.description,
            terms_conditions: this.orderForm.terms_conditions,
            image_url: imageUrl || "",
            prefix_name: this.orderForm.prefix_name,
            order_count: this.orderForm.order_count,
            round_off: this.orderForm.round_off,
            round_off_amount: this.orderForm.round_off_amount,

            // document_url
            // payment_status
          };
          const response = await API.graphql(
            graphqlOperation(create_sale_order_quotations, { input })
          );
          // console.log("Response:", response);

          // console.log("Quotation data:", this.orderForm);

          if (!this.orderForm.customer_id) {
            this.$emit("errorMsg", "Please select a valid customer");
            return;
          }
          let result = JSON.parse(response.data.create_sale_order_quotations);
          // console.log("Result:", result);
          if (result.Status === "SUCCESS") {
            this.$emit("successMsg", result.Message, result.data);
            this.closeDialog();
          } else {
            this.$emit("errorMsg", result.Message);
          }
        } catch (error) {
          console.log("Error:", error);
          this.$emit(
            "errorMsg",
            error.errors[0].message ||
              "An error occurred while creating the quotation"
          );
        } finally {
          this.loading = false;
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

.item-input {
  max-width: 100px;
}

.item-input.mr-1 {
  margin-right: 4px;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f5f5f5;
}

.delete-row-btn {
  min-width: auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.delete-row-btn:hover {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
}

.table-container {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modern-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.modern-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.8px;
  border: none;
  padding: 16px 12px;
  position: relative;
}

.modern-table th:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #cbd5e1, transparent);
}

.modern-table .sub-header th {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  font-weight: 600;
  color: #475569;
  text-transform: none;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  padding: 12px 8px;
}

.modern-table td {
  border: none;
  border-bottom: 1px solid #f1f5f9;
  padding: 12px;
  background-color: white;
  transition: all 0.2s ease;
}

/* Removed hover effects for cleaner UI */

.modern-table .table-footer-row td {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: none;
  border-top: 2px solid #3b82f6;
  font-weight: 600;
  color: #1e293b;
}

.modern-table .total-amount {
  color: #059669;
  font-size: 1.1rem;
}

.image-upload-container {
  text-align: center;
}

.item-dropdown-container {
  position: relative;
  width: 100%;
}

.item-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.item-dropdown-fixed {
  position: fixed !important;
  z-index: 9999 !important;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 0;
}

.dropdown-item {
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.item-code {
  background: #e3f2fd;
  padding: 2px 6px;
  border-radius: 3px;
  color: #1976d2;
}

.item-price {
  background: #e8f5e8;
  padding: 2px 6px;
  border-radius: 3px;
  color: #2e7d32;
}

.unit-name {
  font-weight: 500;
  color: #333;
  text-align: center;
}

.no-items {
  padding: 16px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: #f9f9f9;
}

.table-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #fafafa;
  color: #374151;
}

.table-input:focus {
  border-color: #3b82f6;
  background-color: white;
}

.table-input textarea,
textarea.table-input {
  font-family: inherit;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.modern-table .v-text-field .v-field__outline,
.modern-table .v-select .v-field__outline {
  display: none !important;
}

.modern-table .v-text-field .v-field,
.modern-table .v-select .v-field {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.modern-table .v-text-field .v-field__input,
.modern-table .v-select .v-field__input {
  min-height: 36px !important;
  padding: 6px 10px !important;
  font-size: 0.875rem !important;
}

.modern-table input,
.modern-table .v-select {
  border: none !important;
  background: transparent !important;
  outline: none !important;
  color: #374151 !important;
}

.modern-table .v-text-field:focus-within,
.modern-table .v-select:focus-within {
  background-color: #eff6ff !important;
}

.modern-table .v-text-field:focus-within input,
.modern-table .v-select:focus-within .v-field__input {
  color: #1e40af !important;
  font-weight: 500 !important;
}

.header-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.main-header {
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.sub-headers {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.sub-header {
  font-weight: 600;
  color: #475569;
  text-transform: none;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  flex: 1;
  text-align: center;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}
</style>

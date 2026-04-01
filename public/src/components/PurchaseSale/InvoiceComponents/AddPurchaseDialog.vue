<template>
  <v-dialog
    v-model="dialogVisible"
    persistent
    max-width="1400"
    transition="dialog-top-transition"
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">{{ isEditMode ? 'Convert to Purchase Invoice' : 'Create Purchase Invoice' }}</span>
        <v-btn icon variant="text" @click="closeDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="px-4 py-3">
        <v-form ref="form">
          <!-- Invoice & Vendor Details Section -->
          <v-row class="mb-4">
            <!-- Left Column - Vendor Details -->
            <v-col cols="12" md="3">
              <div class="mb-3">
                <v-autocomplete
                  v-model="invoiceForm.vendor_search"
                  :items="vendorItems"
                  item-title="full_user_name"
                  item-value="vendor_id"
                  label="Vendor *"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-search"
                  :rules="[(v) => !!v || 'Vendor search is required']"
                  clearable
                  hide-details
                  placeholder="Type to search vendors..."
                  :filter="customFilter"
                  @update:model-value="onVendorSelect(invoiceForm.vendor_search,'edit')"
                />
              </div>
              <!-- <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.phone_no"
                  label="Phone Number"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-phone"
                  hide-details
                  placeholder="Phone number..."
                />
              </div> -->
              <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.billing_name"
                  label="Billing Address"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-map-marker"
                  hide-details
                  placeholder="Billing address..."
                />
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.po_number"
                  label="PO Number"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-receipt"
                  hide-details
                  placeholder="PO number..."
                />
              </div>
            </v-col>

            <!-- Spacer Column -->
            <v-col cols="12" md="6" class="d-flex align-center justify-center">
              <!-- Empty space for visual separation -->
            </v-col>

            <!-- Right Column - Invoice Details -->
            <v-col cols="12" md="3">
              <div class="mb-3">
                <div class="d-flex align-center">
                  <v-text-field
                    v-model="invoiceForm.prefix_name"
                    label="Prefix"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-receipt"
                    hide-details
                    readonly
                    class="mr-2"
                  />
                  <v-text-field
                    v-model="invoiceForm.invoice_count"
                    label="Invoice No."
                    variant="outlined"
                    density="compact"
                    hide-details
                    type="number"
                    class="mr-2"
                    @input="updateInvoiceNumber"
                  />
                </div>
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.invoice_date"
                  label="Invoice Date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar"
                  type="date"
                  hide-details
                />
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.due_date"
                  label="Due Date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-clock"
                  type="date"
                  hide-details
                />
              </div>
              <div class="mb-3" v-if="transactionConfig.due_dates">
                <v-select
                  v-model="invoiceForm.payment_terms"
                  :items="paymentTermsOptions"
                  item-title="term"
                  item-value="days"
                  label="Payment Terms"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-credit-card"
                  placeholder="Select"
                  clearable
                  hide-details
                />
              </div>
              <div class="mb-3" v-if="taxConfiguration.enable_place_of_supply">
                <v-select
                  v-model="invoiceForm.state_of_supply"
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
              <h3 class="text-h6 font-weight-medium">Invoice Items</h3>
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
                      <th class="text-left pa-3">ITEM</th>
                      <th class="text-left pa-3" v-if="taxConfiguration.enable_hsn">HSN CODE</th>
                      <th class="text-left pa-3">ITEM CODE</th>
                      <th class="text-left pa-3" v-if="itemConfiguration.item_category">CATEGORY</th>
                      <th class="text-left pa-3" v-if="itemConfiguration.description">DESCRIPTION</th>
                      <th class="text-left pa-3">QTY</th>
                      <th class="text-left pa-3">UNIT</th>
                      <th class="text-left pa-3">PRICE/UNIT</th>
                      <th class="text-center pa-3" colspan="2">
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
                      <th class="text-center pa-3">ACTION</th>
                    </tr>

                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in invoiceForm.items"
                      :key="index"
                      class="table-row"
                    >
                      <td class="pa-3 text-center">{{ index + 1 }}</td>
                      <td class="pa-2">
                        <div class="item-dropdown-container">
                          <input
                            type="text"
                            v-model="item.item_name"
                            @input="handleItemInput(index, $event)"
                            @focus="showItemDropdown(index)"
                            @blur="hideItemDropdown(index)"
                            class="table-input item-input"
                            placeholder="Type or select item..."
                          />
                          <div v-if="item.showDropdown" class="item-dropdown">
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
                      <td class="pa-2">
                        <v-textarea
                          v-model="item.item_code"
                          density="compact"
                          hide-details
                          placeholder="Item Code"
                          variant="plain"
                          class="item-input"
                          auto-grow
                          rows="1"
                        />
                      </td>
                      <td class="pa-2" v-if="itemConfiguration.item_category">
                        <v-select
                          v-model="item.category"
                          :items="masterGlobalCategories"
                          item-title="category_name"
                          item-value="category_id"
                          density="compact"
                          hide-details
                          placeholder="Select Category"
                          variant="plain"
                          class="item-input"
                        />
                      </td>
                      <td class="pa-2" v-if="itemConfiguration.description">
                        <v-textarea
                          v-model="item.description"
                          density="compact"
                          hide-details
                          placeholder="Enter description..."
                          variant="plain"
                          class="item-input"
                          auto-grow
                          rows="1"
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
                          class="item-input"
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
                      <td class="pa-2">
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
                      <td class="pa-2">
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
                        <v-select
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
                      <td class="pa-2 text-center">
                        <v-btn
                          v-if="invoiceForm.items.length > 1"
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                          @click="deleteItemRow(index)"
                          class="delete-row-btn"
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
                      <td class="pa-3" v-if="itemConfiguration.item_category"></td>
                      <td class="pa-3" v-if="itemConfiguration.description"></td>
                      <td class="pa-3 font-weight-bold">{{ totalQuantity }}</td>
                      <td class="pa-3"></td>
                      <td class="pa-3 font-weight-bold">
                        {{ totalPricePerUnit }}
                      </td>
                      <td class="pa-3"></td>
                      <td class="pa-3 font-weight-bold">
                        {{ totalDiscountAmount }}
                      </td>
                      <td class="pa-3"></td>
                      <td class="pa-3 font-weight-bold">
                        {{ totalTaxAmount }}
                      </td>
                      <td class="pa-3 font-weight-bold total-amount">
                        {{ totalAmount }}
                      </td>
                      <td class="pa-3"></td>
                    </tr>
                  </tfoot>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <!-- Payment & Invoice Summary Section -->
          <v-row>
            <!-- Left Column - Payment Options -->
            <v-col cols="12" md="6">
              <div class="mb-3">
                <!-- Description Textarea -->
                <div class="mt-3">
                  <v-textarea
                    v-model="invoiceForm.description"
                    label="Vendor Description"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    placeholder="Enter vendor description..."
                    hide-details
                  />
                </div>
              </div>
            </v-col>

            <!-- Right Column - Invoice Totals -->
            <v-col cols="12" md="6">
              <!-- Discount Section -->
              <div
                class="mb-3"
                v-if="transactionConfig.transaction_wise_discount"
              >
                <div class="d-flex align-center justify-end">
                  <span class="text-body-2 mr-2">Discount</span>
                  <v-text-field
                    v-model="invoiceForm.discount_percent"
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
                    v-model="invoiceForm.discount_amount"
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
                  <v-select
                    v-model="invoiceForm.tax_type"
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
                    invoiceForm.tax_amount || "0"
                  }}</span>
                </div>
              </div>

              <!-- Round Off Section -->
              <div class="mb-3">
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="invoiceForm.round_off"
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
                    v-model="invoiceForm.round_off_amount"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 80px"
                    :readonly="!invoiceForm.round_off"
                    class="mr-4"
                    :label="invoiceForm.round_off ? 'Amount' : 'Disabled'"
                  />
                  <span class="text-h6 font-weight-medium mr-3">Total:</span>
                  <v-text-field
                    v-model="invoiceForm.grand_total"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                    class="text-h6 font-weight-bold"
                  />
                </div>
              </div>

              <!-- Paid Amount Section -->
              <div class="mb-3">
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="invoiceForm.paid_amount_enabled"
                    hide-details
                    class="mr-2"
                  />
                  <span class="text-body-2 mr-2">Paid Amount</span>
                  <v-text-field
                    v-model="invoiceForm.paid_amount"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 120px"
                    :readonly="!invoiceForm.paid_amount_enabled"
                    class="mr-4"
                    :label="
                      invoiceForm.paid_amount_enabled
                        ? 'Amount'
                        : 'Disabled'
                    "
                    @input="updateBalanceAmount"
                  />
                </div>
              </div>

              <!-- Balance Display -->
              <div class="mb-3">
                <div class="d-flex align-center">
                  <span class="text-h6 font-weight-medium mr-3">Balance:</span>
                  <v-text-field
                    v-model="invoiceForm.balance_amount"
                    variant="outlined"
                    density="compact"
                    hide-details
                    readonly
                    class="text-h6 font-weight-bold"
                    style="max-width: 120px"
                  />
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Payment Section -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6 font-weight-medium">Payment Details</h3>
                  <v-btn
                    color="primary"
                    size="small"
                    prepend-icon="mdi-plus"
                    @click="addPaymentRow"
                    class="text-none"
                  >
                    Add Payment Type
                  </v-btn>
                </div>

                <v-card variant="flat" class="payment-container">
                  <v-card-text class="pa-3">
                    <div
                      v-for="(payment, index) in invoiceForm.payments"
                      :key="index"
                      class="payment-row mb-3"
                    >
                      <v-row>
                        <v-col cols="6">
                          <v-select
                            v-model="payment.payment_type"
                            :items="paymentOptions"
                            label="Payment Type"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-credit-card"
                            placeholder="Select payment type"
                            hide-details
                            @update:model-value="calculateTotalPayment"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model="payment.amount"
                            label="Amount"
                            variant="outlined"
                            density="compact"
                            type="number"
                            placeholder="0"
                            hide-details
                            @input="calculateTotalPayment"
                          />
                        </v-col>
                      </v-row>

                      <!-- Reference No. field below the payment row for Cheque -->
                      <div
                        v-if="payment.payment_type === 'Cheque'"
                        class="mt-3"
                      >
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                              v-model="payment.reference_no"
                              label="Reference No."
                              variant="outlined"
                              density="compact"
                              prepend-inner-icon="mdi-receipt"
                              placeholder="Enter reference"
                              hide-details
                              class="reference-field"
                            />
                          </v-col>
                          <v-col
                            cols="6"
                            class="d-flex align-center justify-center"
                          >
                            <v-btn
                              v-if="invoiceForm.payments.length > 1"
                              icon="mdi-delete"
                              variant="text"
                              size="small"
                              color="error"
                              @click="deletePaymentRow(index)"
                              class="delete-payment-btn"
                            />
                          </v-col>
                        </v-row>
                      </div>

                      <!-- Delete button for non-Cheque payments -->
                      <div
                        v-if="payment.payment_type !== 'Cheque'"
                        class="mt-3"
                      >
                        <v-row>
                          <v-col cols="6">
                            <!-- Empty space to align with reference field -->
                          </v-col>
                          <v-col
                            cols="6"
                            class="d-flex align-center justify-center"
                          >
                            <v-btn
                              v-if="invoiceForm.payments.length > 1"
                              icon="mdi-delete"
                              variant="text"
                              size="small"
                              color="error"
                              @click="deletePaymentRow(index)"
                              class="delete-payment-btn"
                            />
                          </v-col>
                        </v-row>
                      </div>
                    </div>

                    <!-- Total Payment Display -->
                    <div
                      class="d-flex justify-space-between align-center mt-4 pt-3 border-top"
                    >
                      <div class="text-body-1 font-weight-medium">
                        Total Payment: ₹{{ totalPaymentAmount }}
                      </div>
                      <div class="text-body-2 text-grey">
                        Remaining: ₹{{ remainingAmount }}
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Terms and Conditions Section -->
      <v-divider></v-divider>
      <v-card-text class="px-4 py-3">
        <v-textarea
          v-model="invoiceForm.terms_conditions"
          label="Terms and Conditions"
          variant="outlined"
          density="compact"
          rows="4"
          placeholder="Enter terms and conditions for this purchase invoice..."
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
          @click="saveInvoice"
          size="small"
        >
          {{ isEditMode ? 'Convert to Purchase Invoice' : 'Create Purchase Invoice' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { get_inventory_items } from "@/mixins/GetInventoryItems.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_organization_prefix } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { create_purchase_order } from "@/graphql/mutations.js";

export default {
  name: "AddPurchaseDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    salesPurchaseConfig: {
      type: Array,
      default: () => [],
    },
    quotationData: {
      type: Object,
      default: () => ({}),
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "successMsg", "errorMsg"],
  mixins: [
    get_all_org_suppliers,
    get_inventory_items,
    get_material_unit,
    get_global_categories,
  ],

  data() {
    return {
      vendorItems: [],
      loading: false,
      showDescription: false,
      showImageUpload: false,
      showDocumentUpload: false,
      bucketUrls: {
        image: null,
        document: null,
      },
      taxConfiguration:{},
      itemConfiguration:{},
      invoiceForm: {
        vendor_search: "",
        vendor_id: "",
        phone_no: "",
        billing_name: "",
        po_number: "",
        prefix_name: "PINV-",
        invoice_count: "001",
        invoice_no: "PINV-001",
        invoice_date: this.getCurrentDate(),
        due_date: this.getCurrentDate(),
        payment_terms: "",
        state_of_supply: "",
        description: "",
        image: null,
        imageFile: null,
        document: null,
        documentFile: null,
        round_off: false,
        round_off_amount: "0.00",
        paid_amount_enabled: false,
        paid_amount: "0.00",
        balance_amount: "0.00",
        grand_total: "0",
        terms_conditions: "",
        discount_percent: "",
        discount_amount: "0.00",
        tax_type: "",
        tax_amount: "0.00",
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
            tax_percent: "",
            tax_amount: "0",
            amount: "0",
            showDropdown: false,
          },
        ],
        payments: [
          {
            payment_type: "Cash",
            amount: "0",
            reference_no: "",
          },
        ],
      },
      masterVendors: [],
      masterItems: [],
      unitmaterials: [],
      masterGlobalCategories: [],
      transactionConfig: {},
      paymentTermsOptions: [],
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
      paymentOptions: ["Cash", "Cheque"],
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
      return this.invoiceForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0);
      }, 0);
    },
    totalPricePerUnit() {
      return this.invoiceForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price_per_unit) || 0);
      }, 0);
    },
    totalDiscountAmount() {
      return this.invoiceForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.discount_amount) || 0);
      }, 0);
    },
    totalTaxAmount() {
      return this.invoiceForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.tax_amount) || 0);
      }, 0);
    },
    totalAmount() {
      return this.invoiceForm.items.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
    balanceAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const paidAmount = parseFloat(this.invoiceForm.paid_amount) || 0;

      if (this.invoiceForm.paid_amount_enabled) {
        const balance = grandTotal - paidAmount;
        return balance.toFixed(2);
      } else {
        return grandTotal.toFixed(2);
      }
    },
    totalPaymentAmount() {
      return this.invoiceForm.payments
        .reduce((sum, payment) => {
          return sum + (parseFloat(payment.amount) || 0);
        }, 0)
        .toFixed(2);
    },
    remainingAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const totalPayment = this.invoiceForm.payments.reduce((sum, payment) => {
        return sum + (parseFloat(payment.amount) || 0);
      }, 0);
      return (grandTotal - totalPayment).toFixed(2);
    },
  },

  watch: {
    totalAmount: {
      handler(newTotal) {
        this.calculateOrderTotals();
        this.updateBalanceAmount();
      },
      immediate: true,
    },
    modelValue: {
      async handler(newVal) {
        if (newVal) {
          if (this.salesPurchaseConfig && this.salesPurchaseConfig.length > 0) {
            const transactionConfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "TRANSACTION"
            );
            if (transactionConfig) {
              this.transactionConfig = transactionConfig;
            } else {
              this.transactionConfig = {
                billing_name_parties: false,
                transaction_wise_discount: false,
                round_of: false,
                with_or_without_tax: false,
                due_dates: false,
              };
            }
            const taxconfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "TAXES"
            );
            if (taxconfig) {
              this.taxConfiguration = taxconfig;
            } else {
              this.taxConfiguration = {
                enable_place_of_supply: false,
                enable_hsn: false,
                enable_gst: false,
              };
            }
            const itemConfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "ITEM"
            );
            if (itemConfig) {
              this.itemConfiguration = itemConfig;
            } else {
              this.itemConfiguration = {
                item_category: false,
                description: false,
              };
            }
          } else {
            this.transactionConfig = {
              billing_name_parties: false,
              transaction_wise_discount: false,
              round_of: false,
              with_or_without_tax: false,
              due_dates: false,
            };
            this.taxConfiguration = {
              enable_place_of_supply: false,
              enable_hsn: false,
              enable_gst: false,
            };
            this.itemConfiguration = {
              item_category: false,
              description: false,
            };
          }

          if (this.transactionConfig && this.transactionConfig.due_date_terms) {
            this.paymentTermsOptions = this.transactionConfig.due_date_terms;
          }

          await Promise.all([
            this.get_organization_prefix(),
            this.get_all_org_suppliers(),
            this.get_inventory_items(),
            this.get_material_unit(),
            this.get_global_categories(),
          ]);
          this.fetch_details();

          if (
            this.isEditMode &&
            this.quotationData &&
            Object.keys(this.quotationData).length > 0
          ) {
            this.populateFormFromQuotation(this.quotationData);
          }
        }
      },
      immediate: true,
    },
    quotationData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0 && this.isEditMode) {
          this.populateFormFromQuotation(newVal);
        }
      },
      immediate: false,
    },
    "invoiceForm.round_off": {
      handler(newValue) {
        this.calculateRoundOff();
      },
      immediate: false,
    },
    "invoiceForm.round_off_amount": {
      handler(newValue) {
        if (this.invoiceForm.round_off && newValue !== "0.00") {
          // Calculate the base total (after discount and tax but before round off)
          const baseTotal = this.calculateOrderTotalsWithoutRoundOff();
          const roundOffAmount = parseFloat(newValue) || 0;
          this.invoiceForm.grand_total = (baseTotal + roundOffAmount).toFixed(2);
        }
      },
      immediate: false,
    },
    "invoiceForm.paid_amount_enabled": {
      handler(newValue) {
        if (newValue) {
          this.invoiceForm.paid_amount = this.invoiceForm.grand_total;
        } else {
          this.invoiceForm.paid_amount = "0.00";
        }
        this.updateBalanceAmount();
      },
      immediate: false,
    },
    "invoiceForm.paid_amount": {
      handler(newValue) {
        if (this.invoiceForm.paid_amount_enabled) {
          this.updateBalanceAmount();
        }
      },
      immediate: false,
    },
    "invoiceForm.payment_terms": {
      handler(newValue) {
        this.calculateDueDate();
      },
      immediate: false,
    },
    "invoiceForm.invoice_date": {
      handler(newValue) {
        this.calculateDueDate();
      },
      immediate: false,
    },
  },

  methods: {
    async fetch_details() {
      this.vendorItems = [];
      this.orgSupplier.forEach((vendor) => {
        this.vendorItems.push({
          full_user_name:
            vendor.supplier_name +
            " ( " +
            (vendor.vendor_display_id || "") +
            " ) ",
          vendor_id: vendor.suppliers_id,
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
            prefix_type: "PURCHASE",
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
            this.invoiceForm.prefix_name = firstPrefix.prefix_name;
            this.invoiceForm.invoice_count = firstPrefix.count.toString();
            this.updateInvoiceNumber();
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
      this.invoiceForm.prefix_name = "PINV-";
      this.invoiceForm.invoice_count = "001";
      this.updateInvoiceNumber();
    },

    getCurrentDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },

    calculateDueDate() {
      // If payment_terms is empty or null, keep the existing due_date
      if (!this.invoiceForm.payment_terms || this.invoiceForm.payment_terms === "") {
        return;
      }

      // If invoice_date is not set, use current date
      if (!this.invoiceForm.invoice_date) {
        this.invoiceForm.invoice_date = this.getCurrentDate();
      }

      // Parse the payment_terms value (should be the number of days)
      const daysToAdd = parseInt(this.invoiceForm.payment_terms);
      
      // If it's not a valid number, keep the existing due_date
      if (isNaN(daysToAdd)) {
        return;
      }

      // Calculate the due date by adding days to invoice date
      const invoiceDate = new Date(this.invoiceForm.invoice_date);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + daysToAdd);
      
      // Format the due date as YYYY-MM-DD
      this.invoiceForm.due_date = dueDate.toISOString().split("T")[0];
    },

    closeDialog() {
      this.$emit("update:modelValue", false);
      this.resetForm();
    },

    resetForm() {
      this.invoiceForm = {
        vendor_search: "",
        vendor_id: "",
        phone_no: "",
        billing_name: "",
        po_number: "",
        prefix_name: "PINV-",
        invoice_count: "001",
        invoice_no: "PINV-001",
        invoice_date: this.getCurrentDate(),
        due_date: this.getCurrentDate(),
        payment_terms: "",
        state_of_supply: "",
        description: "",
        image: null,
        imageFile: null,
        document: null,
        documentFile: null,
        round_off: false,
        round_off_amount: "0.00",
        paid_amount_enabled: false,
        paid_amount: "0.00",
        balance_amount: "0.00",
        grand_total: "0",
        terms_conditions: "",
        discount_percent: "",
        discount_amount: "0.00",
        tax_type: "",
        tax_amount: "0.00",
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
            tax_percent: "",
            tax_amount: "0",
            amount: "0",
            showDropdown: false,
          },
        ],
        payments: [
          {
            payment_type: "Cash",
            amount: "0",
            reference_no: "",
          },
        ],
      };
      this.bucketUrls = { image: null, document: null };
      this.showDescription = false;
      this.showImageUpload = false;
      this.showDocumentUpload = false;
    },

    updateInvoiceNumber() {
      if (this.invoiceForm.prefix_name && this.invoiceForm.invoice_count) {
        this.invoiceForm.invoice_no =
          this.invoiceForm.prefix_name + this.invoiceForm.invoice_count;
      }
    },

    addItemRow() {
      this.invoiceForm.items.push({
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
        tax_percent: "",
        tax_amount: "0",
        amount: "0",
        showDropdown: false,
      });
    },

    deleteItemRow(index) {
      if (this.invoiceForm.items.length > 1) {
        this.invoiceForm.items.splice(index, 1);
        this.invoiceForm.items.forEach((_, idx) => {
          this.calculateItemAmount(idx);
        });
      }
    },

    handleItemInput(index, event) {
      const item = this.invoiceForm.items[index];
      const value = event.target.value;

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
          item.price_per_unit = existingItem.sale_price?.sale_price || "1";
          item.discount_percent =
            existingItem.discount_price?.discount_price || "";
          item.tax_percent = existingItem.item_tax || "";
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

    showItemDropdown(index) {
      const item = this.invoiceForm.items[index];
      item.showDropdown = true;
    },

    hideItemDropdown(index) {
      setTimeout(() => {
        const item = this.invoiceForm.items[index];
        item.showDropdown = false;
      }, 200);
    },

    filterItems(index) {
      const item = this.invoiceForm.items[index];
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
      const item = this.invoiceForm.items[index];
      item.item_id = predefinedItem.item_id;
      item.item_name = predefinedItem.item_name;
      item.hsn_code = predefinedItem.item_hsn || "";
      item.item_code = predefinedItem.item_code || "";
      if (this.itemConfiguration.item_category) {
        item.category = predefinedItem.category_id || "";
      }
      if (this.itemConfiguration.description) {
        item.description = predefinedItem.item_description || "";
      }
      item.unit = this.getUnitTextById(predefinedItem.item_unit);
      item.price_per_unit = predefinedItem.sale_price?.sale_price || "0";
      item.discount_percent =
        predefinedItem.discount_price?.discount_price || "";
      item.tax_percent = predefinedItem.item_tax || "";

      item.showDropdown = false;
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
      const item = this.invoiceForm.items[index];
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
      const item = this.invoiceForm.items[index];
      let value = parseFloat(event.target.value) || 1;

      if (value < 1) {
        value = 1;
        item.quantity = "1";
      }

      item.quantity = value.toString();
      this.calculateItemAmount(index);
    },

    validatePrice(index, event) {
      const item = this.invoiceForm.items[index];
      let value = parseFloat(event.target.value) || 1;

      if (value < 1) {
        value = 1;
        item.price_per_unit = "1";
      }

      item.price_per_unit = value.toString();
      this.calculateItemAmount(index);
    },

    calculateItemAmount(index) {
      const item = this.invoiceForm.items[index];
      const quantity = parseFloat(item.quantity) || 0;
      const pricePerUnit = parseFloat(item.price_per_unit) || 0;
      const discountPercent = parseFloat(item.discount_percent) || 0;

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
      const subtotal = this.totalAmount;
      const discountPercent =
        parseFloat(this.invoiceForm.discount_percent) || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      this.invoiceForm.discount_amount = discountAmount.toFixed(2);

      let taxAmount = 0;
      if (this.invoiceForm.tax_type && this.invoiceForm.tax_type !== "Exempt") {
        const taxMatch = this.invoiceForm.tax_type.match(/(\d+(?:\.\d+)?)/);
        if (taxMatch) {
          const taxPercent = parseFloat(taxMatch[1]);
          const amountAfterDiscount = subtotal - discountAmount;
          taxAmount = (amountAfterDiscount * taxPercent) / 100;
        }
      }
      this.invoiceForm.tax_amount = taxAmount.toFixed(2);

      const finalTotal = subtotal - discountAmount + taxAmount;
      this.invoiceForm.grand_total = finalTotal.toFixed(2);

      if (this.invoiceForm.round_off) {
        this.calculateRoundOff();
      }
    },

    calculateOrderTotalsWithoutRoundOff() {
      // Calculate discount amount
      const subtotal = this.totalAmount;
      const discountPercent = parseFloat(this.invoiceForm.discount_percent) || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      this.invoiceForm.discount_amount = discountAmount.toFixed(2);

      // Calculate tax amount
      let taxAmount = 0;
      if (this.invoiceForm.tax_type && this.invoiceForm.tax_type !== "Exempt") {
        const taxMatch = this.invoiceForm.tax_type.match(/(\d+(?:\.\d+)?)/);
        if (taxMatch) {
          const taxPercent = parseFloat(taxMatch[1]);
          const amountAfterDiscount = subtotal - discountAmount;
          taxAmount = (amountAfterDiscount * taxPercent) / 100;
        }
      }
      this.invoiceForm.tax_amount = taxAmount.toFixed(2);

      // Calculate final total without round off
      const finalTotal = subtotal - discountAmount + taxAmount;
      return finalTotal;
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

    onVendorSelect(vendorId, type) {
      if (vendorId) {
        const selectedVendor = this.orgSupplier.find(
          (vendor) => vendor.suppliers_id === vendorId
        );
        if (selectedVendor) {
          this.invoiceForm.vendor_search = selectedVendor.supplier_name;
          this.invoiceForm.vendor_id = selectedVendor.suppliers_id;
          this.invoiceForm.phone_no = selectedVendor.phone_number || "";
          this.invoiceForm.billing_name =
            selectedVendor.suppliers_address ||
            selectedVendor.supplier_name ||
            "";
        }
      }
    },

    async saveInvoice() {
      this.loading = true;
      try {
        const input = {
          refrence_id: this.isEditMode ? this.invoiceForm.refrence_id : undefined,
          po_no: this.invoiceForm.po_number,
          invoice_no: this.invoiceForm.invoice_no,
          transaction_type: "PURCHASE",
          supplier_id: this.invoiceForm.vendor_id,
          supplier_name: this.invoiceForm.vendor_search,
          billing_address: this.invoiceForm.billing_name,
          invoice_date: this.invoiceForm.invoice_date,
          payment_terms: this.invoiceForm.payment_terms,
          due_date: this.invoiceForm.due_date,
          state: this.invoiceForm.state_of_supply,
          table_data: JSON.stringify(this.invoiceForm.items),
          payment_details: JSON.stringify(this.invoiceForm.payments),
          total_cost: this.invoiceForm.grand_total,
          discount_percent: this.invoiceForm.discount_percent || "0",
          discount_amount: this.invoiceForm.discount_amount || "0.00",
          tax_type: this.invoiceForm.tax_type || "",
          tax_amount: this.invoiceForm.tax_amount || "0.00",
          received_cost: this.invoiceForm.paid_amount,
          balance_cost: this.invoiceForm.balance_amount,
          description: this.invoiceForm.description,
          terms_conditions: this.invoiceForm.terms_conditions,
          prefix_name: this.invoiceForm.prefix_name,
          order_count: this.invoiceForm.invoice_count,
          payment_status:
            this.invoiceForm.grand_total == this.invoiceForm.balance_amount
              ? "NOT_PAID"
              : Number(this.invoiceForm.balance_amount) > 0
              ? "PARTIAL_PAID"
              : "FULLY_PAID",
        };
        
        const result = await API.graphql(
          graphqlOperation(create_purchase_order, {
            input: input,
          })
        );

        let response = JSON.parse(result.data.create_purchase_order);
        if (response.Status === "SUCCESS") {
          this.$emit(
            "successMsg",
            this.isEditMode
              ? "Quotation successfully converted to Purchase Invoice"
              : "Purchase Invoice created successfully",
            response.data
          );
          this.closeDialog();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.error("Error saving purchase invoice:", error);
        this.$emit(
          "errorMsg",
          error.message || "An error occurred while creating the purchase invoice"
        );
      } finally {
        this.loading = false;
      }
    },

    calculateRoundOff() {
      if (this.invoiceForm.round_off) {
        // Calculate the total after discount and tax but before round off
        const currentTotal = this.calculateOrderTotalsWithoutRoundOff();

        // Calculate round off amount to make total a whole number
        const roundedTotal = Math.round(currentTotal);
        const roundOffAmount = roundedTotal - currentTotal;

        // Update round off amount and grand total
        this.invoiceForm.round_off_amount = roundOffAmount.toFixed(2);
        this.invoiceForm.grand_total = roundedTotal.toFixed(2);
      } else {
        // Reset round off amount and restore calculated total
        this.invoiceForm.round_off_amount = "0.00";
        this.calculateOrderTotals();
      }

      this.updateBalanceAmount();
    },

    updateBalanceAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const paidAmount = parseFloat(this.invoiceForm.paid_amount) || 0;

      if (this.invoiceForm.paid_amount_enabled) {
        const balance = grandTotal - paidAmount;
        this.invoiceForm.balance_amount = balance.toFixed(2);
      } else {
        this.invoiceForm.balance_amount = grandTotal.toFixed(2);
      }
    },

    populateFormFromQuotation(quotationData) {
      this.invoiceForm.vendor_search = quotationData.supplier_name || "";
      this.invoiceForm.vendor_id = quotationData.supplier_id || "";
      this.invoiceForm.phone_no = quotationData.supplier_phone_no || "";
      this.invoiceForm.billing_name = quotationData.billing_address || "";
      this.invoiceForm.po_number = quotationData.po_no || "";

      this.invoiceForm.invoice_date = quotationData.invoice_date || this.getCurrentDate();
      this.invoiceForm.due_date = quotationData.due_date || this.getCurrentDate();
      this.invoiceForm.payment_terms = quotationData.payment_terms || "";
      this.invoiceForm.state_of_supply = quotationData.state || "";
      this.invoiceForm.description = quotationData.description || "";
      this.invoiceForm.terms_conditions = quotationData.terms_conditions || "";
      this.invoiceForm.round_off = quotationData.round_off == "true" ? true : false;
      this.invoiceForm.round_off_amount = quotationData.round_off_amount || "0.00";
      this.onVendorSelect(this.invoiceForm.vendor_id, 'update');
      
      if (quotationData.transaction_id) {
        this.invoiceForm.refrence_id = quotationData.transaction_id;
      }
      
      if (quotationData.table_data) {
        try {
          const items = quotationData.table_data;
          this.invoiceForm.items = items.map(item => ({
            ...item,
            quantity: item.quantity || "1",
            price_per_unit: item.price_per_unit || "1",
            discount_percent: item.discount_percent || "0",
            tax_percent: item.tax_percent || "Exempt",
            amount: item.amount || "0",
            discount_amount: item.discount_amount || "0",
            tax_amount: item.tax_amount || "0",
          }));
        } catch (e) {
          console.error("Error parsing table_data:", e);
          this.invoiceForm.items = [];
        }
      }

      this.invoiceForm.grand_total = quotationData.total_cost || "0";
      this.invoiceForm.discount_percent = quotationData.discount_percent || "0";
      this.invoiceForm.discount_amount = quotationData.discount_amount || "0.00";
      this.invoiceForm.tax_type = quotationData.tax_type || "";
      this.invoiceForm.tax_amount = quotationData.tax_amount || "0.00";
      this.invoiceForm.round_off = quotationData.round_off || false;
      this.invoiceForm.round_off_amount = quotationData.round_off_amount || "0.00";
      this.invoiceForm.paid_amount = quotationData.received_cost || "0.00";
      this.invoiceForm.paid_amount_enabled = quotationData.paid_amount_enabled || false;
      this.invoiceForm.balance_amount = quotationData.balance_cost || "0.00";

      // Populate payments
      if (quotationData.payment_details) {
        try {
          let payments;
          // Handle both string and object cases
          if (typeof quotationData.payment_details === 'string') {
            payments = JSON.parse(quotationData.payment_details);
          } else {
            payments = quotationData.payment_details;
          }
          
          if (Array.isArray(payments) && payments.length > 0) {
            this.invoiceForm.payments = payments.map((payment) => ({
              ...payment,
              amount: payment.amount ? payment.amount.toString() : "0", // Ensure amount is string
              payment_type: payment.payment_type || "Cash",
              reference_no: payment.reference_no || "",
            }));
          } else {
            // If payments array is empty, use default
            this.invoiceForm.payments = [
              {
                payment_type: "Cash",
                amount: "0",
                reference_no: "",
              },
            ];
          }
        } catch (parseError) {
          console.error("Error parsing payment details:", parseError);
          // Reset to default payment if parsing fails
          this.invoiceForm.payments = [
            {
              payment_type: "Cash",
              amount: "0",
              reference_no: "",
            },
          ];
        }
      } else {
        // If no payment_details exist in quotation, initialize with default
        this.invoiceForm.payments = [
          {
            payment_type: "Cash",
            amount: "0",
            reference_no: "",
          },
        ];
      }

      this.calculateOrderTotals();
      this.updateBalanceAmount();
      this.calculateTotalPayment();
    },

    // Payment methods
    addPaymentRow() {
      this.invoiceForm.payments.push({
        payment_type: "Cash",
        amount: "0",
        reference_no: "",
      });
    },

    deletePaymentRow(index) {
      if (this.invoiceForm.payments.length > 1) {
        this.invoiceForm.payments.splice(index, 1);
        this.calculateTotalPayment();
      }
    },

    calculateTotalPayment() {
      // This method is mainly for triggering reactivity
      // The actual calculations are done in computed properties
      // Force reactivity update by accessing the computed properties
      const totalPayment = this.totalPaymentAmount;
      const remaining = this.remainingAmount;
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

.document-upload-container {
  text-align: center;
}

.document-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
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

/* Payment Section Styles */
.payment-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.payment-row {
  padding: 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  margin-bottom: 12px;
}

.payment-row:last-child {
  margin-bottom: 0;
}

.delete-payment-btn {
  min-width: auto;
  width: 32px;
  height: 32px;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

.reference-field {
  max-width: 300px;
}
</style>

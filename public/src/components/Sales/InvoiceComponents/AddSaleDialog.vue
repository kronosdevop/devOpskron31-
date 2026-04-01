<template>
  <v-dialog
    v-model="dialogVisible"
    persistent
    max-width="1400"
    transition="dialog-top-transition"
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">{{
          isEditMode ? "Convert to Invoice" : "Create Invoice"
        }}</span>
        <v-btn icon variant="text" @click="closeDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="px-4 py-3">
        <v-form ref="form">
          <!-- Invoice & Customer Details Section -->
          <v-row class="mb-4">
            <!-- Left Column - Customer Details -->
            <v-col cols="12" md="3">
              <div class="mb-3">
                <v-autocomplete
                  v-model="invoiceForm.customer_search"
                  :items="masterCustomersupdated"
                  item-title="full_user_name"
                  item-value="customer_id"
                  label="Customer *"
                  clearable
                  density="compact"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-search"
                  :rules="[(v) => !!v || 'Customer search is required']"
                  hide-details
                  placeholder="Type to search customers..."
                  :filter="customFilter"
                  @update:model-value="onCustomerSelect"
                />
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.phone_no"
                  label="Phone Number"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-phone"
                  hide-details
                  placeholder="Phone number..."
                />
              </div>
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
                <v-autocomplete
                  v-model="invoiceForm.project_name"
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
                  @update:model-value="onProjectSelect"
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
              <v-row class="mb-3">
                <v-col cols="7">
                  <v-text-field
                    v-model="invoiceForm.prefix_name"
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
                    v-model="invoiceForm.invoice_count"
                    label="Invoice No."
                    variant="outlined"
                    density="compact"
                    hide-details
                    type="number"
                    min="0"
                    @input="updateInvoiceNumber"
                  />
                </v-col>
              </v-row>
              <div class="mb-3">
                <v-text-field
                  v-model="invoiceForm.invoice_date"
                  label="Invoice Date (DD/MM/YYYY)"
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
                  label="Due Date (DD/MM/YYYY)"
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
                      v-for="(item, index) in invoiceForm.items"
                      :key="index"
                      class="table-row"
                    >
                      <td class="pa-3 text-center">
                        <div class="d-flex align-center justify-center gap-2">
                          <span>{{ index + 1 }}</span>
                          <v-btn
                            v-if="invoiceForm.items.length > 1"
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
                              min-height: 40px;
                              max-height: 150px;
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

          <!-- Payment Details Section -->
          <v-row class="mb-4">
            <!-- Left Column - Payment Details -->
            <v-col cols="12" md="6">
              <v-card
                variant="flat"
                class="pa-4"
                style="background-color: #f8f9fa"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <h3 class="text-h6 font-weight-medium">Payment Details</h3>
                  <v-btn
                    color="primary"
                    size="small"
                    prepend-icon="mdi-plus"
                    @click="addPaymentRow"
                    class="text-none"
                    style="background-color: #db4c77"
                  >
                    Add Payment Type
                  </v-btn>
                </div>

                <!-- Payment Rows -->
                <div
                  v-for="(payment, index) in invoiceForm.payments"
                  :key="index"
                  class="mb-3"
                >
                  <v-row>
                    <v-col cols="4">
                      <v-select
                        v-model="payment.payment_type"
                        :items="['Cash', 'Cheque']"
                        label="Payment Type"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-credit-card"
                        hide-details
                        @update:model-value="calculateTotalPayment"
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-text-field
                        v-model="payment.amount"
                        label="Amount"
                        variant="outlined"
                        density="compact"
                        type="number"
                        hide-details
                        @input="calculateTotalPayment"
                      />
                    </v-col>
                    <v-col cols="4" v-if="payment.payment_type === 'Cheque'">
                      <v-text-field
                        v-model="payment.reference_no"
                        label="Reference No"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="Enter reference number"
                      />
                    </v-col>
                    <v-col cols="1" class="d-flex align-center">
                      <v-btn
                        v-if="invoiceForm.payments.length > 1"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        @click="deletePaymentRow(index)"
                      />
                    </v-col>
                  </v-row>
                </div>

                <!-- Payment Summary -->
                <v-divider class="my-3"></v-divider>
                <div class="d-flex justify-space-between">
                  <span class="text-body-1 font-weight-medium"
                    >Total Payment: ₹{{ totalPayment.toFixed(2) }}</span
                  >
                  <span class="text-body-1 text-grey"
                    >Remaining: ₹{{ remainingPaymentAmount }}</span
                  >
                </div>
              </v-card>
            </v-col>

            <!-- Right Column - Empty for now, maintaining layout -->
            <v-col cols="12" md="6">
              <!-- This space can be used for additional payment-related features -->
            </v-col>
          </v-row>

          <!-- Payment & Invoice Summary Section -->
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
                <!-- <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-file-document"
                  class="text-none ml-2"
                  size="small"
                  @click="toggleDocumentUpload"
                >
                  {{ showDocumentUpload ? "HIDE DOCUMENT" : "ADD DOCUMENT" }}
                </v-btn> -->

                <!-- Image Upload Section -->
                <div v-if="showImageUpload" class="mt-3">
                  <div class="image-upload-container">
                    <v-file-input
                      label="Invoice Image"
                      variant="outlined"
                      density="compact"
                      accept="image/png, image/jpeg"
                      v-model="invoiceForm.imageFile"
                      clearable
                      @click:clear="clearFile('image')"
                      hide-details
                    ></v-file-input>
                    <v-img
                      v-if="invoiceForm.image"
                      :src="invoiceForm.image"
                      width="120"
                      height="120"
                      class="rounded-lg mt-2"
                      contain
                    />
                  </div>
                </div>

                <!-- Document Upload Section -->
                <div v-if="showDocumentUpload" class="mt-3">
                  <div class="document-upload-container">
                    <v-file-input
                      label="Invoice Document"
                      variant="outlined"
                      density="compact"
                      accept=".pdf,.doc,.docx,.txt"
                      v-model="invoiceForm.documentFile"
                      clearable
                      @click:clear="clearFile('document')"
                      hide-details
                    ></v-file-input>
                    <div
                      v-if="invoiceForm.document"
                      class="document-preview mt-2"
                    >
                      <v-chip
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-file-document"
                      >
                        {{ invoiceForm.document.name }}
                      </v-chip>
                      <div class="text-caption text-grey mt-1">
                        {{ (invoiceForm.document.size / 1024).toFixed(1) }} KB
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Description Textarea -->
                <div class="mt-3">
                  <v-textarea
                    v-model="invoiceForm.description"
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
                  <v-autocomplete
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

              <!-- Received Amount Section -->
              <div class="mb-3">
                <div class="d-flex align-center">
                  <v-checkbox
                    v-model="invoiceForm.received_amount_enabled"
                    hide-details
                    class="mr-2"
                  />
                  <span class="text-body-2 mr-2">Received Amount</span>
                  <v-text-field
                    v-model="invoiceForm.received_amount"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 120px"
                    :readonly="!invoiceForm.received_amount_enabled"
                    class="mr-4"
                    :label="
                      invoiceForm.received_amount_enabled
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
          placeholder="Enter terms and conditions for this invoice..."
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
          {{ isEditMode ? "Convert to Invoice" : "Create Invoice" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import { get_inventory_items } from "@/mixins/GetInventoryItems.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_organization_prefix } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { create_sale_order_quotations } from "@/graphql/mutations.js";

import { get_all_projects } from "@/mixins/GetAllProjects.js";
import { get_termsAndcondition_list } from "@/mixins/GetTermsandConditionList.js";

export default {
  name: "AddSaleDialog",
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
    get_global_customers,
    get_inventory_items,
    get_material_unit,
    get_global_categories,
    get_all_projects,
    get_termsAndcondition_list,
  ],

  data() {
    return {
      masterCustomersupdated: [],
      masterProjectsUpdate: [],
      loading: false,
      showDescription: false,
      showImageUpload: false,
      showDocumentUpload: false,
      bucketUrls: {
        image: null,
        document: null,
      },
      taxConfiguration: {},
      itemConfiguration: {},
      dropdownPositions: {},
      invoiceForm: {
        customer_search: "",
        customer_id: "",
        phone_no: "",
        billing_name: "",
        project_name: "",
        po_number: "",
        prefix_name: "INV-",
        invoice_count: "001",
        invoice_no: "INV-001",
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
        received_amount_enabled: false,
        received_amount: "0.00",
        balance_amount: "0.00",
        grand_total: "0",
        terms_conditions: "",
        discount_percent: "",
        discount_amount: "0.00",
        tax_type: "",
        tax_amount: "0.00",
        payments: [
          {
            payment_type: "Cash",
            amount: "0",
            reference_no: "",
          },
        ],
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
      },
      masterCustomers: [],
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
    totalPayment() {
      return this.invoiceForm.payments.reduce((sum, payment) => {
        return sum + (parseFloat(payment.amount) || 0);
      }, 0);
    },
    remainingPaymentAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const totalPayment = this.totalPayment;
      return (grandTotal - totalPayment).toFixed(2);
    },
    balanceAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const receivedAmount = parseFloat(this.invoiceForm.received_amount) || 0;

      if (this.invoiceForm.received_amount_enabled) {
        // Calculate balance: Grand Total - Received Amount
        const balance = grandTotal - receivedAmount;
        return balance.toFixed(2);
      } else {
        // If received amount is disabled, balance equals grand total
        return grandTotal.toFixed(2);
      }
    },
    remainingAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const receivedAmount = parseFloat(this.invoiceForm.received_amount) || 0;
      return (grandTotal - receivedAmount).toFixed(2);
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
          // console.log("salesPurchaseConfig", this.salesPurchaseConfig);

          // Safely find transaction config with fallback
          if (this.salesPurchaseConfig && this.salesPurchaseConfig.length > 0) {
            const transactionConfig = this.salesPurchaseConfig.find(
              (config) => config.config_type === "TRANSACTION"
            );
            if (transactionConfig) {
              this.transactionConfig = transactionConfig;
            } else {
              // Fallback to default config if no transaction config found
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
              // console.log("taxConfiguration", this.taxConfiguration);
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
              items_wise_discount: false,
            };
          }

          // Set payment terms options
          if (this.transactionConfig && this.transactionConfig.due_date_terms) {
            this.paymentTermsOptions = this.transactionConfig.due_date_terms;
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

          // Populate form from quotation data when dialog opens
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
    "invoiceForm.imageFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "image");
        } else {
          this.invoiceForm.image = null;
        }
      },
      immediate: false,
    },
    "invoiceForm.documentFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "document");
        } else {
          this.invoiceForm.document = null;
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
          this.invoiceForm.grand_total = (baseTotal + roundOffAmount).toFixed(
            2
          );
        }
      },
      immediate: false,
    },
    "invoiceForm.received_amount_enabled": {
      handler(newValue) {
        if (newValue) {
          // When received amount is enabled, set it to the grand total
          this.invoiceForm.received_amount = this.invoiceForm.grand_total;
        } else {
          // When disabled, reset to 0
          this.invoiceForm.received_amount = "0.00";
        }
        this.updateBalanceAmount();
      },
      immediate: false,
    },
    "invoiceForm.received_amount": {
      handler(newValue) {
        if (this.invoiceForm.received_amount_enabled) {
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
            prefix_type: "SALE",
          })
        );

        // console.log("API Response:", prefix);

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

        //  console.log("Parsed prefix data:", prefix_no);

        // Check if prefix_no is an array and has at least one element
        if (Array.isArray(prefix_no) && prefix_no.length > 0 && prefix_no[0]) {
          const firstPrefix = prefix_no[0];

          // Check if required properties exist
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
      // Set default values if API fails or data is invalid
      this.invoiceForm.prefix_name = "INV-";
      this.invoiceForm.invoice_count = "001";
      this.updateInvoiceNumber();
    },

    getCurrentDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },

    calculateDueDate() {
      // If payment_terms is empty or null, keep the existing due_date
      if (
        !this.invoiceForm.payment_terms ||
        this.invoiceForm.payment_terms === ""
      ) {
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
        customer_search: "",
        customer_id: "",
        phone_no: "",
        billing_name: "",
        project_name: "",
        po_number: "",
        prefix_name: "INV-",
        invoice_count: "001",
        invoice_no: "INV-001",
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
        received_amount_enabled: false,
        received_amount: "0.00",
        balance_amount: "0.00",
        grand_total: "0",
        terms_conditions: "",
        discount_percent: "",
        discount_amount: "0.00",
        tax_type: "",
        tax_amount: "0.00",
        payments: [
          {
            payment_type: "Cash",
            amount: "0",
            reference_no: "",
          },
        ],
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
      };
      this.bucketUrls = { image: null, document: null };
      this.showDescription = false;
      this.showImageUpload = false;
      this.showDocumentUpload = false;
    },

    updateInvoiceNumber() {
      // Prevent negative numbers
      if (
        this.invoiceForm.invoice_count !== "" &&
        parseFloat(this.invoiceForm.invoice_count) < 0
      ) {
        this.invoiceForm.invoice_count = "0";
      }

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

    toggleDescription() {
      this.showDescription = !this.showDescription;
      if (!this.showDescription) {
        this.invoiceForm.description = "";
      }
    },

    toggleImageUpload() {
      this.showImageUpload = !this.showImageUpload;
      if (!this.showImageUpload) {
        this.clearFile("image");
      }
    },

    toggleDocumentUpload() {
      this.showDocumentUpload = !this.showDocumentUpload;
      if (!this.showDocumentUpload) {
        this.clearFile("document");
      }
    },

    clearFile(type) {
      this.invoiceForm[`${type}File`] = null;
      this.invoiceForm[type] = null;
      this.bucketUrls[type] = null;
    },

    handleFileUpload(file, type) {
      if (file && typeof file === "object" && file.type) {
        if (type === "image" && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.invoiceForm[type] = e.target.result;
          };
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
          };
          reader.readAsDataURL(file);
        } else if (
          type === "document" &&
          (file.type === "application/pdf" || file.type.includes("document"))
        ) {
          // For documents, we'll store the file name and type
          this.invoiceForm[type] = {
            name: file.name,
            type: file.type,
            size: file.size,
          };
        } else {
          this.invoiceForm[type] = null;
        }
      } else {
        this.invoiceForm[type] = null;
      }
    },

    async uploadImage() {
      if (!this.invoiceForm.imageFile) return null;

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "invoices",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.invoiceForm.imageFile.name.replace(
            /\s+/g,
            ""
          )}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.invoiceForm.imageFile,
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

    async uploadDocument() {
      if (!this.invoiceForm.documentFile) return null;

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "invoices",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.invoiceForm.documentFile.name.replace(
            /\s+/g,
            ""
          )}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.invoiceForm.documentFile,
          orgDetails.s3_details,
          key
        );

        if (fileUrl) {
          this.bucketUrls.document = fileUrl;
          return fileUrl;
        }
      } catch (error) {
        console.error("Document upload error:", error);
        throw new Error("Failed to upload document");
      }
    },

    handleItemInput(index, event) {
      // This method handles when user types in the input field
      const item = this.invoiceForm.items[index];
      const value = event.target.value;

      // Auto-grow textarea
      if (event.target && event.target.tagName === "TEXTAREA") {
        event.target.style.height = "auto";
        event.target.style.height = event.target.scrollHeight + "px";
      }

      if (value && typeof value === "string") {
        // Always preserve what the user typed
        item.item_name = value;

        // Check if this matches an existing item
        const existingItem = this.masterItems.find(
          (masterItem) => masterItem.item_name === value
        );

        if (existingItem) {
          // User typed an exact match - populate fields
          item.item_id = existingItem.item_id;
          // Auto-populate HSN code
          item.hsn_code = existingItem.item_hsn || "";
          // Auto-populate item code
          item.item_code = existingItem.item_code || "";
          // Auto-populate category
          if (this.itemConfiguration.item_category) {
            item.category = existingItem.category_id || "";
          }
          // Auto-populate description if available
          if (this.itemConfiguration.description) {
            item.description = existingItem.item_description || "";
          }
          // Convert unit ID to unit text for display
          item.unit = this.getUnitTextById(existingItem.item_unit);
          // Extract sale_price from nested object
          item.price_per_unit = existingItem.sale_price?.sale_price || "1";
          // Extract discount_percent from nested object
          item.discount_percent =
            existingItem.discount_price?.discount_price || "";
          // Extract tax_percent
          item.tax_percent = existingItem.item_tax || "";
        } else {
          // Custom entry - clear auto-populated fields but keep the item_name
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

        // Recalculate amount
        this.calculateItemAmount(index);
      }
    },

    showItemDropdown(index, event) {
      const item = this.invoiceForm.items[index];
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
        const item = this.invoiceForm.items[index];
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
      // Auto-populate HSN code
      item.hsn_code = predefinedItem.item_hsn || "";
      // Auto-populate item code
      item.item_code = predefinedItem.item_code || "";
      // Auto-populate category
      if (this.itemConfiguration.item_category) {
        item.category = predefinedItem.category_id || "";
      }
      // Auto-populate description if available
      if (this.itemConfiguration.description) {
        item.description = predefinedItem.item_description || "";
      }
      // Convert unit ID to unit text for display
      item.unit = this.getUnitTextById(predefinedItem.item_unit);
      // Extract sale_price from nested object
      item.price_per_unit = predefinedItem.sale_price?.sale_price || "0";
      // Extract discount_percent from nested object
      item.discount_percent =
        predefinedItem.discount_price?.discount_price || "";
      // Extract tax_percent
      item.tax_percent = predefinedItem.item_tax || "";

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

    // Helper method to convert unit ID to unit text
    getUnitTextById(unitId) {
      if (!unitId || !this.unitmaterials || !this.unitmaterials.length) {
        return "";
      }

      const unit = this.unitmaterials.find((u) => u.unit_id === unitId);
      return unit ? unit.unit_name || unit.short_name || "" : "";
    },

    // Handle unit selection from dropdown
    onUnitSelect(index, unitName) {
      const item = this.invoiceForm.items[index];
      if (unitName) {
        // Find the unit object to get the unit_id
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
      const item = this.invoiceForm.items[index];
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
      const item = this.invoiceForm.items[index];
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
        this.invoiceForm.customer_id = selectedCustomer.customer_id;
        this.invoiceForm.phone_no = selectedCustomer.primary_contact_no || "";
        this.invoiceForm.billing_name =
          selectedCustomer.billing_name || selectedCustomer.customer_name || "";
      }
    },

    onProjectSelect(projectId) {
      if (projectId) {
        const selectedProject = this.masterProjects.find(
          (project) => project.project_id === projectId
        );
        if (selectedProject) {
          // console.log("Selected project:", selectedProject);
          // You can add additional logic here if needed
        }
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
          this.invoiceForm.terms_conditions =
            termsData.terms_and_conditions ||
            termsData.quotation_terms_conditions ||
            termsData.billing_terms_conditions ||
            termsData.proforma_terms_conditions ||
            "";
        } else if (storedTerms && storedTerms.terms_and_conditions) {
          this.invoiceForm.terms_conditions = storedTerms.terms_and_conditions;
        } else if (
          this.termsAndconditionList &&
          this.termsAndconditionList.data &&
          this.termsAndconditionList.data.length > 0
        ) {
          // Fallback to mixin's termsAndconditionList
          const termsData = this.termsAndconditionList.data[0];
          this.invoiceForm.terms_conditions =
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
    async saveInvoice() {
      // Validate items array
      // if (this.invoiceForm.items.length !== 1) {
      //   this.$emit("errorMsg", "Please ensure there is exactly one item in the invoice");
      //   return;
      // }

      // Validate item_name is not empty
      const firstItem = this.invoiceForm.items[0];
      if (!firstItem.item_name || firstItem.item_name.trim() === "") {
        this.$emit("errorMsg", "Item name is required and cannot be empty");
        return;
      }

      this.loading = true;
      try {
        const imageUrl = await this.uploadImage();
        const documentUrl = await this.uploadDocument();
        // console.log("Image URL:", imageUrl);
        // console.log("Document URL:", documentUrl);
        const input = {
          refrence_id: this.isEditMode
            ? this.invoiceForm.refrence_id
            : undefined,
          po_no: this.invoiceForm.po_number,
          project_name: this.findProjectName(this.invoiceForm.project_name),
          invoice_no: this.invoiceForm.invoice_no,
          transaction_type: "SALE",
          customer_id: this.invoiceForm.customer_id,
          project_id: this.invoiceForm.project_name,
          customer_name: this.invoiceForm.billing_name,
          customer_phone_no: this.invoiceForm.phone_no,
          billing_address: this.invoiceForm.billing_name,
          invoice_date: this.invoiceForm.invoice_date,
          payment_terms: this.invoiceForm.payment_terms,
          due_date: this.invoiceForm.due_date,
          state: this.invoiceForm.state_of_supply,
          table_data: JSON.stringify(this.invoiceForm.items),
          // total: this.orderForm.total_amount,
          payment_details: JSON.stringify(this.invoiceForm.payments),
          total_cost: this.invoiceForm.grand_total,
          discount_percent: this.invoiceForm.discount_percent || "0",
          discount_amount: this.invoiceForm.discount_amount || "0.00",
          tax_type: this.invoiceForm.tax_type || "",
          tax_amount: this.invoiceForm.tax_amount || "0.00",
          received_cost: this.invoiceForm.received_amount,
          balance_cost: this.invoiceForm.balance_amount,
          description: this.invoiceForm.description,
          terms_conditions: this.invoiceForm.terms_conditions,
          image_url: imageUrl,
          prefix_name: this.invoiceForm.prefix_name,
          order_count: this.invoiceForm.invoice_count,
          document_url: documentUrl,
          payment_status:
            this.invoiceForm.grand_total == this.invoiceForm.balance_amount
              ? "NOT_PAID"
              : Number(this.invoiceForm.balance_amount) > 0
              ? "PARTIAL_PAID"
              : "FULLY_PAID",
        };
        const result = await API.graphql(
          graphqlOperation(create_sale_order_quotations, {
            input: input,
          })
        );
        // console.log("Invoice data:", this.invoiceForm);

        // Simulate API call
        let response = JSON.parse(result.data.create_sale_order_quotations);
        // console.log("Result:", result);
        if (response.Status === "SUCCESS") {
          this.$emit(
            "successMsg",
            this.isEditMode
              ? "Quotation successfully converted to Invoice"
              : "Invoice created successfully",
            response.data
          );
          this.closeDialog();
        } else {
          this.$emit("errorMsg", response.Message);
        }

        // You can emit success message here if needed
      } catch (error) {
        console.error("Error saving invoice:", error);
        this.$emit(
          "errorMsg",
          error.errors[0].message ||
            "An error occurred while creating the invoice"
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

      // Recalculate balance after round off changes
      this.updateBalanceAmount();
    },

    updateBalanceAmount() {
      const grandTotal = parseFloat(this.invoiceForm.grand_total) || 0;
      const receivedAmount = parseFloat(this.invoiceForm.received_amount) || 0;

      if (this.invoiceForm.received_amount_enabled) {
        // Calculate balance: Grand Total - Received Amount
        const balance = grandTotal - receivedAmount;
        this.invoiceForm.balance_amount = balance.toFixed(2);
      } else {
        // If received amount is disabled, balance equals grand total
        this.invoiceForm.balance_amount = grandTotal.toFixed(2);
      }
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
      // This method is called when payment amounts change
      // The computed properties will automatically update
    },

    populateFormFromQuotation(quotationData) {
      // Populate customer details
      this.invoiceForm.customer_search = quotationData.customer_name || "";
      this.invoiceForm.customer_id = quotationData.customer_id || "";
      this.invoiceForm.phone_no = quotationData.customer_phone_no || "";
      this.invoiceForm.billing_name = quotationData.billing_address || "";
      this.invoiceForm.project_name = quotationData.project_id || "";
      this.invoiceForm.po_number = quotationData.po_no || "";

      // Populate invoice details
      this.invoiceForm.invoice_date =
        quotationData.invoice_date || this.getCurrentDate();
      this.invoiceForm.due_date =
        quotationData.due_date || this.getCurrentDate();
      this.invoiceForm.payment_terms = quotationData.payment_terms || "";
      this.invoiceForm.state_of_supply = quotationData.state || "";
      this.invoiceForm.description = quotationData.description || "";
      this.invoiceForm.terms_conditions = quotationData.terms_conditions || "";
      this.invoiceForm.round_off =
        quotationData.round_off == "true" ? true : false;
      this.invoiceForm.round_off_amount =
        quotationData.round_off_amount || "0.00";
      this.onCustomerSelect(this.invoiceForm.customer_id, "update");
      if (quotationData.transaction_id) {
        this.invoiceForm.refrence_id = quotationData.transaction_id;
      }
      // Populate items
      if (quotationData.table_data) {
        try {
          const items = quotationData.table_data;
          this.invoiceForm.items = items.map((item) => ({
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
          this.invoiceForm.items = []; // Clear items if parsing fails
        }
      }

      // Populate totals and round off
      this.invoiceForm.grand_total = quotationData.total_cost || "0";
      this.invoiceForm.discount_percent = quotationData.discount_percent || "0";
      this.invoiceForm.discount_amount =
        quotationData.discount_amount || "0.00";
      this.invoiceForm.tax_type = quotationData.tax_type || "";
      this.invoiceForm.tax_amount = quotationData.tax_amount || "0.00";
      this.invoiceForm.round_off = quotationData.round_off || false;
      this.invoiceForm.round_off_amount =
        quotationData.round_off_amount || "0.00";
      this.invoiceForm.received_amount = quotationData.received_cost || "0.00";
      this.invoiceForm.received_amount_enabled =
        quotationData.received_amount_enabled || false;
      this.invoiceForm.balance_amount = quotationData.balance_cost || "0.00";

      // Handle image and document
      this.invoiceForm.image = quotationData.image_url || null;
      this.invoiceForm.imageFile = null; // Clear file input value
      this.bucketUrls.image = quotationData.image_url || null;

      this.invoiceForm.document = quotationData.document_url || null;
      this.invoiceForm.documentFile = null; // Clear file input value
      this.bucketUrls.document = quotationData.document_url || null;

      // Load payment details if available
      if (quotationData.payment_details) {
        try {
          let payments;
          // Handle both string and object cases
          if (typeof quotationData.payment_details === "string") {
            payments = JSON.parse(quotationData.payment_details);
          } else {
            payments = quotationData.payment_details;
          }

          if (Array.isArray(payments) && payments.length > 0) {
            this.invoiceForm.payments = payments.map((payment) => ({
              ...payment,
              amount: payment.amount ? payment.amount.toString() : "0",
              payment_type: payment.payment_type || "Cash",
              reference_no: payment.reference_no || "",
            }));
          }
        } catch (parseError) {
          console.error("Error parsing payment details:", parseError);
          // Keep default payment structure if parsing fails
        }
      }

      // Recalculate totals after populating
      this.calculateOrderTotals();
      this.updateBalanceAmount();
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

.item-dropdown-fixed {
  position: fixed !important;
  z-index: 9999 !important;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 0;
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

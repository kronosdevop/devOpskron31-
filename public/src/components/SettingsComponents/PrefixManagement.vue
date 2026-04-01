<template>
  <div>
    <!-- Header with Back Button -->
    <div class="header-section mb-6">
      <div class="d-flex align-center mb-4">
        <v-btn icon variant="text" @click="$emit('backAction')" class="mr-3">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h2 class="text-h5 font-weight-bold" style="color: #2c3e50">
            Prefix Management
          </h2>
          <p class="text-body-2 text-grey-600 mt-1">
            Configure document and reference prefixes for your organization
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <v-card flat :height="windowHeight" class="overflow-y-auto">
      <v-form ref="form" v-model="isFormValid">
        <v-row class="pa-4">
          <v-col cols="12" md="3">
            <!-- Customer Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-3" size="24"
                    >mdi-account-group</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Customer Prefix</h3>
                </div>
              </div>

              <!-- Prefix Selection Dropdown -->
              <v-select
                v-model="selectedPrefixes.CUSTOMER"
                :items="getPrefixOptions('CUSTOMER')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('CUSTOMER')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <!-- Add New Prefix Section -->
              <v-expand-transition>
                <div v-if="showAddNew.CUSTOMER" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.CUSTOMER"
                    label="New Prefix Value"
                    placeholder="e.g., CUST-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.CUSTOMER = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="primary"
                      size="small"
                      @click="addNewPrefix('CUSTOMER')"
                      :disabled="!newPrefixes.CUSTOMER"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.CUSTOMER = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <!-- Add New Button -->
              <v-btn
                v-if="!showAddNew.CUSTOMER"
                variant="outlined"
                size="small"
                @click="showAddNew.CUSTOMER = true"
                color="primary"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Project Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="success" class="mr-3" size="24"
                    >mdi-briefcase</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Project Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.PROJECT"
                :items="getPrefixOptions('PROJECT')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('PROJECT')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.PROJECT" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.PROJECT"
                    label="New Prefix Value"
                    placeholder="e.g., PROJ-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.PROJECT = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="success"
                      size="small"
                      @click="addNewPrefix('PROJECT')"
                      :disabled="!newPrefixes.PROJECT"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.PROJECT = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.PROJECT"
                variant="outlined"
                size="small"
                @click="showAddNew.PROJECT = true"
                color="success"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Vendor Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="info" class="mr-3" size="24">mdi-truck</v-icon>
                  <h3 class="text-h6 font-weight-medium">Vendor Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.VENDOR"
                :items="getPrefixOptions('VENDOR')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
            
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('VENDOR')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.VENDOR" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.VENDOR"
                    label="New Prefix Value"
                    placeholder="e.g., VEN-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.VENDOR = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="info"
                      size="small"
                      @click="addNewPrefix('VENDOR')"
                      :disabled="!newPrefixes.VENDOR"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.VENDOR = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.VENDOR"
                variant="outlined"
                size="small"
                @click="showAddNew.VENDOR = true"
                color="info"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Quotation Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="warning" class="mr-3" size="24"
                    >mdi-file-quote</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Quotation Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.QUOTATION"
                :items="getPrefixOptions('QUOTATION')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
               
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('QUOTATION')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.QUOTATION" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.QUOTATION"
                    label="New Prefix Value"
                    placeholder="e.g., QT-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.QUOTATION = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="warning"
                      size="small"
                      @click="addNewPrefix('QUOTATION')"
                      :disabled="!newPrefixes.QUOTATION"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.QUOTATION = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.QUOTATION"
                variant="outlined"
                size="small"
                @click="showAddNew.QUOTATION = true"
                color="warning"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Member Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="teal" class="mr-3" size="24"
                    >mdi-account</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Member Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.MEMBER"
                :items="getPrefixOptions('MEMBER')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('MEMBER')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.MEMBER" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.MEMBER"
                    label="New Prefix Value"
                    placeholder="e.g., MEM-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.MEMBER = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="teal"
                      size="small"
                      @click="addNewPrefix('MEMBER')"
                      :disabled="!newPrefixes.MEMBER"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.MEMBER = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.MEMBER"
                variant="outlined"
                size="small"
                @click="showAddNew.MEMBER = true"
                color="teal"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Sales Order Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="deep-purple" class="mr-3" size="24"
                    >mdi-cart-outline</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Sales Order Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.SALES_ORDER"
                :items="getPrefixOptions('SALES_ORDER')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
               
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('SALES_ORDER')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.SALES_ORDER" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.SALES_ORDER"
                    label="New Prefix Value"
                    placeholder="e.g., SO-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.SALES_ORDER =
                        $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="deep-purple"
                      size="small"
                      @click="addNewPrefix('SALES_ORDER')"
                      :disabled="!newPrefixes.SALES_ORDER"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.SALES_ORDER = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.SALES_ORDER"
                variant="outlined"
                size="small"
                @click="showAddNew.SALES_ORDER = true"
                color="deep-purple"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Sale Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="green" class="mr-3" size="24"
                    >mdi-cash-register</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Sale Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.SALE"
                :items="getPrefixOptions('SALE')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('SALE')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.SALE" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.SALE"
                    label="New Prefix Value"
                    placeholder="e.g., SALE-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.SALE = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="green"
                      size="small"
                      @click="addNewPrefix('SALE')"
                      :disabled="!newPrefixes.SALE"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.SALE = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.SALE"
                variant="outlined"
                size="small"
                @click="showAddNew.SALE = true"
                color="green"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Proforma Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="orange" class="mr-3" size="24"
                    >mdi-file-document-outline</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Proforma Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.PROFORMA"
                :items="getPrefixOptions('PROFORMA')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('PROFORMA')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.PROFORMA" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.PROFORMA"
                    label="New Prefix Value"
                    placeholder="e.g., PRO-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.PROFORMA = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="orange"
                      size="small"
                      @click="addNewPrefix('PROFORMA')"
                      :disabled="!newPrefixes.PROFORMA"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.PROFORMA = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.PROFORMA"
                variant="outlined"
                size="small"
                @click="showAddNew.PROFORMA = true"
                color="orange"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Payment In Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="cyan" class="mr-3" size="24"
                    >mdi-arrow-down-bold</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Payment In Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.PAYMENT_IN"
                :items="getPrefixOptions('PAYMENT_IN')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                  @update:model-value="onPrefixSelect('PAYMENT_IN')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.PAYMENT_IN" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.PAYMENT_IN"
                    label="New Prefix Value"
                    placeholder="e.g., PI-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.PAYMENT_IN = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="cyan"
                      size="small"
                      @click="addNewPrefix('PAYMENT_IN')"
                      :disabled="!newPrefixes.PAYMENT_IN"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.PAYMENT_IN = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.PAYMENT_IN"
                variant="outlined"
                size="small"
                @click="showAddNew.PAYMENT_IN = true"
                color="cyan"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Payment Out Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="red" class="mr-3" size="24"
                    >mdi-arrow-up-bold</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Payment Out Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.PAYMENT_OUT"
                :items="getPrefixOptions('PAYMENT_OUT')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('PAYMENT_OUT')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.PAYMENT_OUT" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.PAYMENT_OUT"
                    label="New Prefix Value"
                    placeholder="e.g., PO-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.PAYMENT_OUT =
                        $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="red"
                      size="small"
                      @click="addNewPrefix('PAYMENT_OUT')"
                      :disabled="!newPrefixes.PAYMENT_OUT"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.PAYMENT_OUT = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.PAYMENT_OUT"
                variant="outlined"
                size="small"
                @click="showAddNew.PAYMENT_OUT = true"
                color="red"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="3">
            <!-- Purchase Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="indigo" class="mr-3" size="24"
                    >mdi-shopping</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Purchase Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.PURCHASE"
                :items="getPrefixOptions('PURCHASE')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
                
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('PURCHASE')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.PURCHASE" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.PURCHASE"
                    label="New Prefix Value"
                    placeholder="e.g., PUR-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.PURCHASE = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="indigo"
                      size="small"
                      @click="addNewPrefix('PURCHASE')"
                      :disabled="!newPrefixes.PURCHASE"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.PURCHASE = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.PURCHASE"
                variant="outlined"
                size="small"
                @click="showAddNew.PURCHASE = true"
                color="indigo"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>



          <v-col cols="12" md="3">
            <!-- Purchase Order Prefix -->
            <div class="prefix-section mb-6">
              <div class="section-header mb-4">
                <div class="d-flex align-center">
                  <v-icon color="blue-grey" class="mr-3" size="24"
                    >mdi-file-document-multiple</v-icon
                  >
                  <h3 class="text-h6 font-weight-medium">Purchase Order Prefix</h3>
                </div>
              </div>

              <v-select
                v-model="selectedPrefixes.PURCHASE_ORDER"
                :items="getPrefixOptions('PURCHASE_ORDER')"
                label="Select Prefix"
                variant="outlined"
                item-title="label"
                item-value="value"
               
                density="compact"
                class="mb-4"
                @update:model-value="onPrefixSelect('PURCHASE_ORDER')"
                readonly  
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.is_default ? 'success' : 'grey'"
                        size="20"
                      >
                        {{
                          item.raw.is_default
                            ? "mdi-check-circle"
                            : "mdi-circle-outline"
                        }}
                      </v-icon>
                    </template>
                    <!-- <v-list-item-title>{{ item.raw.label }}</v-list-item-title> -->
                  </v-list-item>
                </template>
              </v-select>

              <v-expand-transition>
                <div v-if="showAddNew.PURCHASE_ORDER" class="add-new-section">
                  <v-text-field
                    v-model="newPrefixes.PURCHASE_ORDER"
                    label="New Prefix Value"
                    placeholder="e.g., PO-2024"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Prefix is required']"
                    maxlength="20"
                    counter
                    clearable
                    class="mb-3"
                    @input="
                      newPrefixes.PURCHASE_ORDER = $event.target.value.toUpperCase()
                    "
                  ></v-text-field>
                  <div class="d-flex gap-2">
                    <v-btn
                      color="blue-grey"
                      size="small"
                      @click="addNewPrefix('PURCHASE_ORDER')"
                      :disabled="!newPrefixes.PURCHASE_ORDER"
                    >
                      <v-icon left size="16">mdi-plus</v-icon>
                      Add
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="small"
                      @click="showAddNew.PURCHASE_ORDER = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!showAddNew.PURCHASE_ORDER"
                variant="outlined"
                size="small"
                @click="showAddNew.PURCHASE_ORDER = true"
                color="blue-grey"
              >
                <v-icon left size="16">mdi-plus</v-icon>
                Add New Prefix
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <!-- Snackbar for notifications -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { create_list_update_org_prefix } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "PrefixManagement",
  components: {
    SnackBar,
  },
  data() {
    return {
      windowHeight: window.innerHeight - 260,
      loading: false,
      isFormValid: false,
      SnackBarComponent: {},
      prefixes: {
        CUSTOMER: [],
        VENDOR: [],
        QUOTATION: [],
        SALES_ORDER: [],
        SALE: [],
        PROFORMA: [],
        PAYMENT_IN: [],
        PAYMENT_OUT: [],
        MEMBER: [],
        PROJECT: [],
        PURCHASE: [],
        PURCHASE_ORDER: [],
      },
      selectedPrefixes: {
        CUSTOMER: null,
        PROJECT: null,
        VENDOR: null,
        QUOTATION: null,
        MEMBER: null,
        SALES_ORDER: null,
        SALE: null,
        PROFORMA: null,
        PAYMENT_IN: null,
        PAYMENT_OUT: null,
        PURCHASE: null,
        PURCHASE_ORDER: null,
      },
      newPrefixes: {
        CUSTOMER: "",
        PROJECT: "",
        VENDOR: "",
        QUOTATION: "",
        MEMBER: "",
        SALES_ORDER: "",
        SALE: "",
        PROFORMA: "",
        PAYMENT_IN: "",
        PAYMENT_OUT: "",
        PURCHASE: "",
        PURCHASE_ORDER: "",
      },
      showAddNew: {
        CUSTOMER: false,
        PROJECT: false,
        VENDOR: false,
        QUOTATION: false,
        MEMBER: false,
        SALES_ORDER: false,
        SALE: false,
        PROFORMA: false,
        PAYMENT_IN: false,
        PAYMENT_OUT: false,
        PURCHASE: false,
        PURCHASE_ORDER: false,
      },
    };
  },
  async created() {
    await this.GetPrefixes();
  },
  methods: {
    async GetPrefixes() {
      try {
        this.loading = true;
        const response = await API.graphql(
          graphqlOperation(create_list_update_org_prefix, {
            input: {
              action_type: "LIST",
            },
          })
        );

        let result = JSON.parse(response.data.create_list_update_org_prefix);
        // console.log("API Response:", result);

        if (result.Status === "SUCCESS" && result.data) {
          // Clear existing data first to prevent duplicates
          this.prefixes = {
            CUSTOMER: [],
            PROJECT: [],
            VENDOR: [],
            QUOTATION: [],
            MEMBER: [],
            SALES_ORDER: [],
            SALE: [],
            PROFORMA: [],
            PAYMENT_IN: [],
            PAYMENT_OUT: [],
            PURCHASE: [],
            PURCHASE_ORDER: [],
          };

          // Transform API data to match our component structure
          this.prefixes = {
            CUSTOMER: result.data.CUSTOMER || [],
            PROJECT: result.data.PROJECT || [],
            VENDOR: result.data.VENDOR || [],
            QUOTATION: result.data.QUOTATION || [],
            MEMBER: result.data.MEMBER || [],
            SALES_ORDER: result.data.SALES_ORDER || [],
            SALE: result.data.SALE || [],
            PROFORMA: result.data.PROFORMA || [],
            PAYMENT_IN: result.data.PAYMENT_IN || [],
            PAYMENT_OUT: result.data.PAYMENT_OUT || [],
            PURCHASE: result.data.PURCHASE || [],
            PURCHASE_ORDER: result.data.PURCHASE_ORDER || [],
          };

          this.updateSelectedPrefixes();
          // this.showSnackBar('Prefixes loaded successfully', 'success');
        }
        //  else {
        // this.showSnackBar("Failed to load prefixes", "error");
        // }
      } catch (error) {
        console.error("Error fetching prefixes:", error);
        this.showSnackBar("Error loading prefixes", "error");
      } finally {
        this.loading = false;
      }
    },

    updateSelectedPrefixes() {
      Object.keys(this.prefixes).forEach((type) => {
        if (this.prefixes[type] && Array.isArray(this.prefixes[type])) {
          const activePrefix = this.prefixes[type].find(
            (prefix) => prefix.is_default === true
          );
          this.selectedPrefixes[type] = activePrefix
            ? activePrefix.prefix_name
            : null;
        } else {
          this.selectedPrefixes[type] = null;
        }
      });
    },

    getCurrentPrefix(type) {
      if (
        this.prefixes[type] &&
        Array.isArray(this.prefixes[type]) &&
        this.prefixes[type].length > 0
      ) {
        const activePrefix = this.prefixes[type].find(
          (prefix) => prefix.is_default === true
        );
        return activePrefix ? activePrefix.prefix_name : null;
      }
      return null;
    },

    getPrefixOptions(type) {
      if (!this.prefixes[type] || !Array.isArray(this.prefixes[type]))
        return [];
      return this.prefixes[type].map((prefix) => ({
        label: `${prefix.prefix_name}${prefix.is_default ? " (Active)" : ""}`,
        value: prefix.prefix_name,
        is_default: prefix.is_default,
        prefix_id: prefix.prefix_id,
        prefix_type: prefix.prefix_type,
        prefix_status: prefix.prefix_status,
        created_on: prefix.created_on,
      }));
    },

    async onPrefixSelect(type) {
      if (!this.selectedPrefixes[type]) return;

      // Ensure prefixes[type] exists and is an array
      if (!this.prefixes[type] || !Array.isArray(this.prefixes[type])) {
        this.prefixes[type] = [];
        return;
      }

      // Set all prefixes to inactive
      try {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        const response = await API.graphql(
          graphqlOperation(create_list_update_org_prefix, {
            input: {
              action_type: "EDIT",
              prefix_type: type,
              // prefix_name: this.selectedPrefixes[type],
              prefix_id: this.prefixes[type].find(
                (prefix) => prefix.prefix_name === this.selectedPrefixes[type]
              ).prefix_id,
              organization_id: data.organization.organization_id,
              is_default: true,
            },
          })
        );

        let result = JSON.parse(response.data.create_list_update_org_prefix);
        // console.log("API Response:", result);

        if (result.Status === "SUCCESS") {
          // Clear the input and hide add section first
          this.newPrefixes[type] = "";
          this.showAddNew[type] = false;

          this.showSnackBar(`${type} prefix activated successfully`, "success");

          // Add a small delay before refreshing to ensure the API has processed the change
          setTimeout(() => {
            this.GetPrefixes();
          }, 500);
        } else {
          this.showSnackBar("Failed to activate prefix", "error");
        }
      } catch (error) {
        console.error("Error activating prefix:", error);
        this.showSnackBar("Error activating prefix", "error");
      } finally {
        this.loading = false;
      }
    },

    async addNewPrefix(type) {
      if (!this.newPrefixes[type] || this.newPrefixes[type].trim() === "") {
        return;
      }

      // Ensure prefixes[type] exists and is an array
      if (!this.prefixes[type] || !Array.isArray(this.prefixes[type])) {
        this.prefixes[type] = [];
      }

      // Check if prefix already exists
      const exists = this.prefixes[type].some(
        (prefix) =>
          prefix.prefix_name.toLowerCase() ===
          this.newPrefixes[type].toLowerCase()
      );

      if (exists) {
        this.showSnackBar(`${type} prefix already exists`, "warning");
        return;
      }
      try {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        const response = await API.graphql(
          graphqlOperation(create_list_update_org_prefix, {
            input: {
              action_type: "CREATE",
              prefix_type: type,
              prefix_name: this.newPrefixes[type],
              organization_id: data.organization.organization_id,
              is_default: true,
            },
          })
        );

        let result = JSON.parse(response.data.create_list_update_org_prefix);
        // console.log("API Response:", result);

        if (result.Status === "SUCCESS") {
          // Clear the input and hide add section first
          this.newPrefixes[type] = "";
          this.showAddNew[type] = false;

          this.showSnackBar(`New ${type} prefix added successfully`, "success");

          // Add a small delay before refreshing to ensure the API has processed the change
          setTimeout(() => {
            this.GetPrefixes();
          }, 500);
        } else {
          this.showSnackBar("Failed to create prefix", "error");
        }
      } catch (error) {
        console.error("Error creating prefix:", error);
        this.showSnackBar("Error creating prefix", "error");
      } finally {
        this.loading = false;
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },

    async savePrefixes() {
      this.loading = true;
      try {
        // Here you would typically call the API to save the prefixes
        // For now, we'll just show a success message
        this.showSnackBar("Prefixes saved successfully!", "success");
      } catch (error) {
        console.error("Error saving prefixes:", error);
        this.showSnackBar("Error saving prefixes", "error");
      } finally {
        this.loading = false;
      }
    },

    resetToDefaults() {
      // Reset to API defaults
      this.GetPrefixes();
      this.newPrefixes = {
        CUSTOMER: "",
        PROJECT: "",
        VENDOR: "",
        QUOTATION: "",
        MEMBER: "",
        SALES_ORDER: "",
        SALE: "",
        PROFORMA: "",
        PAYMENT_IN: "",
        PAYMENT_OUT: "",
        PURCHASE: "",
        PURCHASE_ORDER: "",
      };
      this.showAddNew = {
        CUSTOMER: false,
        PROJECT: false,
        VENDOR: false,
        QUOTATION: false,
        MEMBER: false,
        SALES_ORDER: false,
        SALE: false,
        PROFORMA: false,
        PAYMENT_IN: false,
        PAYMENT_OUT: false,
        PURCHASE: false,
        PURCHASE_ORDER: false,
      };
      this.showSnackBar("Prefixes reset to defaults", "info");
    },

    showSnackBar(message, color = "success") {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: color,
        SnackbarText: message,
        timeout: 3000,
        Top: true,
      };
    },
  },
};
</script>

<style scoped>
.header-section {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.prefix-section {
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.prefix-section:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.section-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
}

.section-header h3 {
  color: #2c3e50;
  margin: 0;
}

.current-prefix-display {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e0e0e0;
}

.active-prefix-chip {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
}

.add-new-section {
  background: white;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

.action-buttons-section {
  margin-top: 32px;
}

.gap-2 {
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .prefix-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .section-header {
    padding-bottom: 8px;
  }
}
</style> 
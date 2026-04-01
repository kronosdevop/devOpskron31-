<template>
  <div>
    <v-card class="pa-0">
      <v-toolbar density="compact" class="bg-white" flat>
        <v-toolbar-title>Edit Customer</v-toolbar-title>
        <v-spacer />
        <v-btn
          size="small"
          dark
          :loading="loading"
          style="background-color: green; color: white"
          class="text-capitalize"
          @click="Validate_Data"
          >Save</v-btn
        >
        <v-btn
          size="small"
          dark
          class="text-capitalize cardCss ml-2 mr-4"
          @click="cancelAction"
          >Cancel</v-btn
        >
      </v-toolbar>

      <v-card-text class="">
        <v-form ref="form">
          <!-- Customer Type Selection -->
          <v-row>
            <v-col cols="6">
              <v-select
                :items="[
                  { title: 'Business (B2B)', value: 'BUSINESS' },
                  { title: 'Individual (B2C)', value: 'INDIVISUAL' },
                  // { title: 'Unregistered', value: 'UNREGISTERED' },
                ]"
                label="Customer Type"
                v-model="customerType"
                variant="outlined"
                density="compact"
                style="width: 250px"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                :items="masterItems"
                label="Product"
                v-model="productItems"
                variant="outlined"
                density="compact"
                multiple
                style="width: 250px"
                item-title="item_name"
                item-value="item_id"
                :loading="itemsLoading"
              />
            </v-col>
          </v-row>

          <!-- B2B Section -->
          <template v-if="customerType === 'BUSINESS'">
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Basic Company Information</h3></v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Legal Name of Business*"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  v-model="companyName"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Brand Name*"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  v-model="brandName"
                />
              </v-col>
              <v-col md="6" class="mt-n6">
                <v-autocomplete
                  :items="businessTypes"
                  label="Business Type"
                  v-model="businessType"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col md="6" class="mt-n6">
                <div class="industry-dropdown-container">
                  <label class="industry-label">Industry / Sector</label>
                  <input
                    type="text"
                    v-model="industry"
                    @input="handleIndustryInput"
                    @focus="onIndustryFocus"
                    @blur="onIndustryBlur"
                    class="industry-input"
                    placeholder="Type or select industry..."
                  />
                  <div v-if="showIndustryDropdown" class="industry-dropdown">
                    <div
                      v-for="industryOption in filterIndustries"
                      :key="industryOption.value"
                      @click="selectIndustry(industryOption)"
                      class="dropdown-item"
                    >
                      <div class="industry-name">
                        {{ industryOption.title }}
                      </div>
                    </div>
                    <div
                      v-if="filterIndustries.length === 0"
                      class="no-items"
                    >
                      Type to add custom industry.
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col md="6" class="">
                <v-text-field
                  label="Company Size"
                  v-model="companySize"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col md="6" class="">
                <v-text-field
                  label="Website"
                  v-model="website"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col md="6" class="mt-n6">
                <v-select
                  :items="languages"
                  label="Preferred Language"
                  v-model="language"
                  variant="outlined"
                  density="compact"
                  item-title="title"
                  item-value="value"
                />
              </v-col>
              <v-col md="6" class="mt-n6">
                <v-select
                  :items="[
                    { title: 'Active', value: 'ACTIVE' },
                    { title: 'Inactive', value: 'DEACTIVE' },
                    { title: 'Prospect', value: 'PROSPECT' },
                  ]"
                  label="Customer Status"
                  v-model="status"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col md="6" class="mt-n6">
                <v-text-field
                  v-model="date"
                  variant="outlined"
                  density="compact"
                  class="ml-2"
                  label="Working With Us Since (DD/MM/YYYY)"
                  color="primaryColor"
                  prepend-inner-icon="mdi-calendar"
                  type="date"
                  :max="maxDate"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>

            <!--Address Details-->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Address Details</h3></v-col>
              <v-col cols="5" class="mt-n4">
                <v-textarea
                  v-model="address1"
                  label="Address1(Business)*"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                ></v-textarea>
              </v-col>
              <v-col cols="1">
                <v-icon
                  color="blue"
                  style="margin-top: 30px"
                  @click="add_geolocation('ADDRESS_1')"
                  >mdi-map-marker-plus-outline</v-icon
                >
              </v-col>
              <v-col cols="6" class="mt-n4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="City*"
                      v-model="city"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Zip Code*"
                      v-model="zip"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedCountry"
                      :items="countries"
                      item-title="name"
                      item-value="isoCode"
                      class=""
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required]"
                      label="Country*"
                      @update:model-value="filterStates"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedState"
                      :items="filteredStates"
                      item-title="name"
                      item-value="isoCode"
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required]"
                      label="State*"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="5" class="mt-n4">
                <v-textarea
                  v-model="address2"
                  label="Address2(Mailing)"
                  variant="outlined"
                  density="compact"
                ></v-textarea>
              </v-col>
              <v-col cols="1">
                <v-icon
                  color="blue"
                  style="margin-top: 30px"
                  @click="add_geolocation('ADDRESS_2')"
                  >mdi-map-marker-plus-outline</v-icon
                >
              </v-col>
              <v-col cols="6" class="mt-n4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="City"
                      v-model="city2"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Zip Code"
                      v-model="zip2"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedCountry2"
                      :items="countries2"
                      item-title="name"
                      item-value="isoCode"
                      class=""
                      variant="outlined"
                      density="compact"
                      label="Country"
                      @update:model-value="filterStates2"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedState2"
                      :items="filteredStates2"
                      item-title="name"
                      item-value="isoCode"
                      variant="outlined"
                      density="compact"
                      label="State"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!--Contact Details-->
            <v-row class="mt-n8" no-gutters>
              <v-col cols="12"><h3>Contact Details</h3></v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="primaryName"
                  label="Name*"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-row>
                  <v-col cols="12" sm="5">
                    <v-autocomplete
                      label="CCode*"
                      v-model="userCCcode"
                      :items="countryCodes"
                      @input="search = ''"
                      item-value="value"
                      item-title="title"
                      variant="outlined"
                      density="compact"
                      class="ml-2"
                      :rules="[rules.required]"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="7">
                    <v-text-field
                      v-model="PrimaryContact"
                      :maxlength="14"
                      @keypress="is_number($event, PrimaryContact)"
                      label="Phone Number*"
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required, rules.phone]"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="primaryEmail"
                  label="Email-ID*"
                  variant="outlined"
                  density="compact"
                  class="ml-2"
                  :rules="[rules.required, rules.email]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="primaryDesignation"
                  label="Designation*"
                  variant="outlined"
                  density="compact"
                  class="ml-2"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="SecondaryName"
                  label="Name"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-row>
                  <v-col cols="12" sm="5">
                    <v-autocomplete
                      label="CCode*"
                      v-model="userCCcode2"
                      :items="SecondcountryCodes"
                      @input="search2 = ''"
                      item-value="value"
                      item-title="title"
                      variant="outlined"
                      density="compact"
                      class="ml-2"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="7">
                    <v-text-field
                      v-model="SecondaryContact"
                      :maxlength="14"
                      @keypress="is_number($event, SecondaryContact)"
                      label="Phone Number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="SecondaryEmail"
                  label="Email-ID"
                  class="ml-2"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="SecondaryDesignation"
                  label="Designation"
                  variant="outlined"
                  class="ml-2"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="OptionalName"
                  label="Name"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-row>
                  <v-col cols="12" sm="5">
                    <v-autocomplete
                      label="CCode*"
                      v-model="userCCcode3"
                      :items="OptionalcountryCodes"
                      @input="search3 = ''"
                      item-value="value"
                      item-title="title"
                      variant="outlined"
                      class="ml-2"
                      density="compact"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="7">
                    <v-text-field
                      v-model="OptionalContact"
                      :maxlength="14"
                      @keypress="is_number($event, OptionalContact)"
                      label="Phone Number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="OptionalEmail"
                  label="Email-ID"
                  variant="outlined"
                  class="ml-2"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="OptionalDesignation"
                  label="Designation"
                  variant="outlined"
                  density="compact"
                  class="ml-2"
                ></v-text-field>
              </v-col>
              <v-row>
                <v-col cols="12">
                  <span>
                    <v-btn
                      size="small"
                      @click="add_address()"
                      dark
                      class="text-capitalize cardCss mb-4"
                      >Add Additional Contact</v-btn
                    >
                  </span>
                </v-col>

                <v-col cols="12" v-if="tableData && tableData.length">
                  <v-data-table
                    :fixed-header="fixed"
                    :items="tableData"
                    :headers="headers"
                    density="compact"
                    class="elevation-1 dtwidth mb-4"
                    :loading="tableLoading"
                    :footer-props="{
                      itemsPerPageOptions: [10, 20],
                    }"
                    :items-per-page="200"
                  >
                    <template v-slot:[`item.actions`]="{ item }">
                      <!-- <v-icon small color="primaryColor" @click.stop="editItem(item)">
                                        mdi-pencil
                                    </v-icon> -->
                      <v-icon color="red" small @click="deleteItem(item)">
                        mdi-delete
                      </v-icon>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-row>

            <!-- Commercial Info -->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Commercial & Operational</h3></v-col>
              <v-col md="6" class="mt-n4">
                <v-autocomplete
                  variant="outlined"
                  density="compact"
                  :items="[
                    { title: 'Immediate', value: 'IMMEDIATE' },
                    { title: '1 day', value: '1' },
                    { title: '2 days', value: '2' },
                    { title: '3 days', value: '3' },
                    { title: '4 days', value: '4' },
                    { title: '5 days', value: '5' },
                    { title: '6 days', value: '6' },
                    { title: '7 days', value: '7' },
                    { title: '8 days', value: '8' },
                    { title: '9 days', value: '9' },
                    { title: '10 days', value: '10' },
                    { title: '11 days', value: '11' },
                    { title: '12 days', value: '12' },
                    { title: '13 days', value: '13' },
                    { title: '14 days', value: '14' },
                    { title: '15 days', value: '15' },
                    { title: '45 days', value: '45' },
                    { title: '60 days', value: '60' },
                    { title: '90 days', value: '90' },
                    { title: '120 days', value: '120' },
                    { title: '180 days', value: '180' },
                    { title: '365 days', value: '365' },
                  ]"
                  label="Payment SLA"
                  v-model="paymentSLA"
                  item-title="title"
                  item-value="value"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-autocomplete
                  v-model="currency"
                  label="Currency"
                  variant="outlined"
                  density="compact"
                  :items="currencyItems"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Sales Rep / Account Manager"
                  v-model="accountManager"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>

            <!--Tax & Compliance-->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Tax & Compliance</h3></v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="GSTIN"
                  v-model="gstin"
                  variant="outlined"
                  density="compact"
                  :rules="[gstinRule]"
                  @input="gstin = gstin.toUpperCase()"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="PAN Number"
                  v-model="pan"
                  variant="outlined"
                  density="compact"
                  :rules="[panRule]"
                  @input="pan = pan.toUpperCase()"
                />
              </v-col>

              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="CIN Number"
                  v-model="taxId"
                  variant="outlined"
                  density="compact"
                  :rules="[cinRule]"
                  @input="taxId = taxId.toUpperCase()"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Tax Exemption Code"
                  v-model="taxExemptionCode"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
          </template>

          <!-- B2C Section -->
          <template v-if="customerType != 'BUSINESS'">
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Customer Information</h3></v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Full Name*"
                  v-model="companyName"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Email ID*"
                  v-model="primaryEmail"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-autocomplete
                      label="CCode*"
                      v-model="userCCcode"
                      :items="countryCodes"
                      @input="search = ''"
                      item-value="value"
                      item-title="title"
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required]"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="8">
                    <v-text-field
                      v-model="PrimaryContact"
                      :maxlength="14"
                      @keypress="is_number($event, PrimaryContact)"
                      label="Phone Number*"
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required, rules.phone]"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="Alternate Email ID"
                  v-model="SecondaryEmail"
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col md="6" class="mt-n4">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-autocomplete
                      label="CCode*"
                      v-model="userCCcode2"
                      :items="SecondcountryCodes"
                      @input="search2 = ''"
                      item-value="value"
                      item-title="title"
                      variant="outlined"
                      density="compact"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="8">
                    <v-text-field
                      v-model="SecondaryContact"
                      :maxlength="14"
                      @keypress="is_number($event, SecondaryContact)"
                      label="Alternate Phone Number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <!-- <v-text-field
                  label="Alternate Phone Number"
                  v-model="SecondaryContact"
                  outlined
                  dense
                /> -->
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-menu
                  v-model="dobMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      label="Date of Birth"
                      v-model="dob"
                      readonly
                      v-bind="props"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-calendar"
                    />
                  </template>
                  <v-date-picker
                    v-model="dob"
                    color="primaryColor"
                    @update:model-value="dobMenu = false"
                  />
                </v-menu>
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-select
                  :items="languages"
                  label="Preferred Language"
                  v-model="language"
                  variant="outlined"
                  density="compact"
                  item-title="title"
                  item-value="value"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="PAN Number"
                  v-model="pan"
                  variant="outlined"
                  density="compact"
                  :rules="[panRule]"
                  @input="pan = pan.toUpperCase()"
                />
              </v-col>
            </v-row>
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Address Details</h3></v-col>
              <v-col cols="5" class="mt-n4">
                <v-textarea
                  v-model="address1"
                  label="Address1(Business)*"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                ></v-textarea>
              </v-col>
              <v-col cols="1">
                <v-icon
                  color="blue"
                  style="margin-top: 30px"
                  @click="add_geolocation('ADDRESS_1')"
                  >mdi-map-marker-plus-outline</v-icon
                >
              </v-col>
              <v-col cols="6" class="mt-n4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="City*"
                      v-model="city"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Zip Code*"
                      v-model="zip"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedCountry"
                      :items="countries"
                      item-title="name"
                      item-value="isoCode"
                      class=""
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required]"
                      label="Country*"
                      @update:model-value="filterStates"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedState"
                      :items="filteredStates"
                      item-title="name"
                      item-value="isoCode"
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required]"
                      label="State*"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="5" class="mt-n4">
                <v-textarea
                  v-model="address2"
                  label="Address2(Mailing)"
                  variant="outlined"
                  density="compact"
                ></v-textarea>
              </v-col>
              <v-col cols="1">
                <v-icon
                  color="blue"
                  style="margin-top: 30px"
                  @click="add_geolocation('ADDRESS_2')"
                  >mdi-map-marker-plus-outline</v-icon
                >
              </v-col>
              <v-col cols="6" class="mt-n4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      label="City"
                      v-model="city2"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Zip Code"
                      v-model="zip2"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedCountry2"
                      :items="countries2"
                      item-title="name"
                      item-value="isoCode"
                      class=""
                      variant="outlined"
                      density="compact"
                      label="Country"
                      @update:model-value="filterStates2"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-autocomplete
                      v-model="selectedState2"
                      :items="filteredStates2"
                      item-title="name"
                      item-value="isoCode"
                      variant="outlined"
                      density="compact"
                      label="State"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>

          <!-- Metadata -->
          <!-- <v-row class="mt-n8">
            <v-col cols="12"><h3>System Metadata</h3></v-col>
            <v-col md="6" class="mt-n4">
              <v-select
                :items="[
                  { title: 'Active', value: 'ACTIVE' },
                  { title: 'Inactive', value: 'DEACTIVE' },
                  { title: 'Prospect', value: 'PROSPECT' },
                ]"
                label="Customer Status"
                v-model="status"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col md="6" class="mt-n4">
              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="formattedDate"
                    variant="outlined"
                    density="compact"
                    class="ml-2"
                    persistent-hint
                    label="Working With Us Since"
                    color="primaryColor"
                    prepend-inner-icon="mdi-calendar"
                    v-bind="props"
                    readonly
                  ></v-text-field>
                </template>
                <v-date-picker
                  :max="minDate"
                  v-model="date"
                  color="primaryColor"
                  scrollable
                  @update:model-value="menu = false"
                />
              </v-menu>
            </v-col>
          </v-row> -->

          <!-- Attachments -->
          <v-row class="mt-n8">
            <v-col cols="12"><h3>Attachments</h3></v-col>

            <!-- Business License Copy -->
            <!-- <v-col cols="12" sm="3" v-if="customerType != 'INDIVISUAL'">
              <v-file-input
                v-if="licensePreviewUrl === ''"
                v-model="license_copy_file"
                label="Business License Copy"
                prepend-icon="mdi-paperclip"
                dense
                outlined
                accept="image/*,.pdf"
                @change="previewFile('license')"
                clearable
              />
              <v-col cols="12" sm="12" v-if="licensePreviewUrl" class="mt-1">
                <span class="mb-6"><b>Business License Copy</b></span>
                <div class="preview-container">
                  <template v-if="licenseIsPdf">
                    <v-icon large color="red">mdi-file-pdf-box</v-icon>
                    <a :href="licensePreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="licensePreviewUrl"
                      height="80"
                      width="80"
                      class="rounded elevation-2"
                    />
                  </template>
                  <v-icon
                    small
                    color="red"
                    class="delete-icon"
                    @click="removeImage('license')"
                    >mdi-delete</v-icon
                  >
                </div>
              </v-col>
            </v-col> -->

            <!-- GST Certificate -->
            <v-col cols="12" sm="3" v-if="customerType == 'BUSINESS'">
              <v-file-input
                v-if="gstPreviewUrl === ''"
                v-model="gst_certificate_file"
                label="GST Certificate"
                prepend-icon="mdi-paperclip"
                variant="outlined"
                density="compact"
                accept="image/*,.pdf"
                @change="previewFile('gst')"
                clearable
              />
              <v-col cols="12" sm="12" v-if="gstPreviewUrl" class="mt-1">
                <span class="mb-6"><b>GST Certificate</b></span>
                <div class="preview-container">
                  <template v-if="gstIsPdf">
                    <v-icon large color="red">mdi-file-pdf-box</v-icon>
                    <a :href="gstPreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="gstPreviewUrl"
                      height="80"
                      width="80"
                      class="rounded elevation-2"
                    />
                  </template>
                  <v-icon
                    small
                    color="red"
                    class="delete-icon"
                    @click="removeImage('gst')"
                    >mdi-delete</v-icon
                  >
                </div>
              </v-col>
            </v-col>

            <!-- NDA / Contract Copy -->
            <v-col cols="12" sm="3">
              <v-file-input
                v-if="contractPreviewUrl === ''"
                v-model="contract_copy_file"
                label="PAN Copy"
                prepend-icon="mdi-paperclip"
                variant="outlined"
                density="compact"
                accept="image/*,.pdf"
                @change="previewFile('contract')"
                clearable
              />
              <v-col cols="12" sm="12" v-if="contractPreviewUrl" class="mt-1">
                <span class="mb-6"><b>PAN Copy</b></span>
                <div class="preview-container">
                  <template v-if="contractIsPdf">
                    <v-icon large color="red">mdi-file-pdf-box</v-icon>
                    <a :href="contractPreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="contractPreviewUrl"
                      height="80"
                      width="80"
                      class="rounded elevation-2"
                    />
                  </template>
                  <v-icon
                    small
                    color="red"
                    class="delete-icon"
                    @click="removeImage('contract')"
                    >mdi-delete</v-icon
                  >
                </div>
              </v-col>
            </v-col>

            <!-- Canceled Cheque -->
            <v-col cols="12" sm="3" v-if="customerType == 'BUSINESS'">
              <v-file-input
                v-if="chequePreviewUrl === ''"
                v-model="canceled_chequed_file"
                label="Canceled Cheque"
                prepend-icon="mdi-paperclip"
                variant="outlined"
                density="compact"
                accept="image/*,.pdf"
                @change="previewFile('cheque')"
                clearable
              />
              <v-col cols="12" sm="12" v-if="chequePreviewUrl" class="mt-1">
                <span class="mb-6"><b>Canceled Cheque</b></span>
                <div class="preview-container">
                  <template v-if="chequeIsPdf">
                    <v-icon large color="red">mdi-file-pdf-box</v-icon>
                    <a :href="chequePreviewUrl" target="_blank">View PDF</a>
                  </template>
                  <template v-else>
                    <v-img
                      :src="chequePreviewUrl"
                      height="80"
                      width="80"
                      class="rounded elevation-2"
                    />
                  </template>
                  <v-icon
                    small
                    color="red"
                    class="delete-icon"
                    @click="removeImage('cheque')"
                    >mdi-delete</v-icon
                  >
                </div>
              </v-col>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AddGeoLocation
        :addGeoLocationDialog="addGeoLocationDialog"
        :location_type="location_type"
        @clicked="addGeoLocationDialog = false"
        v-on:savelocation="handleLocationSave"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddNewAddress
        :addAddressDialog="addAddressDialog"
        @clicked="addAddressDialog = false"
        v-on:ContactDataInfo="Contact_data"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import CurrencyList from "@/JsonFiles/CurrencyList.json";
import AddGeoLocation from "./AddGeoLocation.vue";
import CountryList from "@/JsonFiles/CountryList.json";
import { Country, State } from "country-state-city";
import stateList from "@/mixins/IndiaStates.json";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { customer_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import AddNewAddress from "./AddNewAddress.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_inventory_items } from "@/mixins/GetInventoryItems.js";

export default {
  mixins: [get_inventory_items],
  components: {
    AddGeoLocation,
    CountryList,
    AddNewAddress,
    SnackBar,
  },
  data() {
    return {
      SnackBarComponent: {},
      loading: false,
      dobMenu: false,
      minDate: new Date().toISOString().substr(0, 10),
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      customerSince: "",
      productItems: null,
      customerType: "BUSINESS",
      companyName: "",
      brandName: "",
      businessType: "",
      industry: "",
      showIndustryDropdown: false,
      companySize: "",
      website: "",
      gstin: "",
      pan: "",
      taxId: "",
      email: "",
      phone: "",
      taxExemptionCode: "",
      language: "",
      fullName: "",
      gender: "",
      dob: "",
      secondaryPhone: "",
      city: "",
      zip: "",
      state: "",
      country: "",
      paymentSLA: "",
      accountManager: "",
      status: "",
      businessTypes: [
        { title: "Sole Proprietorship", value: "sole_proprietorship" },
        { title: "Partnership", value: "partnership" },
        {
          title: "Private Limited Company (Pvt Ltd)",
          value: "private_limited",
        },
        { title: "Public Limited Company", value: "public_limited" },
        { title: "Limited Liability Partnership (LLP)", value: "llp" },
        { title: "One Person Company (OPC)", value: "opc" },
        { title: "Nonprofit Organization", value: "nonprofit" },
      ],
      industries: [
        { title: "Manufacturing", value: "manufacturing" },
        { title: "Retail & E-commerce", value: "retail_ecommerce" },
        { title: "Information Technology (IT)", value: "it" },
        { title: "Healthcare & Pharmaceuticals", value: "healthcare_pharma" },
        { title: "Financial Services", value: "financial_services" },
        { title: "Logistics & Transportation", value: "logistics_transport" },
        {
          title: "Construction & Real Estate",
          value: "construction_realestate",
        },
        { title: "Energy & Utilities", value: "energy_utilities" },
        { title: "Education & Training", value: "education_training" },
        { title: "Media & Entertainment", value: "media_entertainment" },
        { title: "Agriculture & Farming", value: "agriculture" },
        { title: "Hospitality & Tourism", value: "hospitality_tourism" },
        {
          title: "Professional & Business Services",
          value: "professional_services",
        },
        { title: "Telecommunications", value: "telecommunications" },
        { title: "Automotive", value: "automotive" },
        { title: "Aerospace & Defense", value: "aerospace_defense" },
        { title: "Legal Services", value: "legal_services" },
        { title: "Nonprofit & NGO", value: "nonprofit" },
        { title: "Chemical Industry", value: "chemicals" },
        { title: "Textile & Apparel", value: "textile_apparel" },
      ],
      languages: [
        { title: "English", value: "ENGLISH" },
        { title: "Hindi", value: "HINDI" },
        { title: "Tamil", value: "TAMIL" },
      ],
      currency: "",
      currencyItems: [],
      addGeoLocationDialog: false,
      componentCheck: 0,
      location_type: "",
      address1: "",
      address2: "",
      city2: "",
      zip2: "",
      states: [],
      states2: [],
      loading: false,
      selectedCountry: "",
      countries: [],
      selectedState: "",
      selectedCountry2: "",
      countries2: [],
      selectedState2: "",
      countryCodes: [],
      search: "",
      userCCcode: "+91",
      PrimaryContact: "",
      tableLoading: false,
      SecondcountryCodes: [],
      userCCcode2: "+91",
      search2: "",
      SecondaryContact: "",
      OptionalcountryCodes: [],
      userCCcode3: "+91",
      OptionalContact: "",
      search3: "",
      primaryName: "",
      primaryEmail: "",
      primaryDesignation: "",
      SecondaryName: "",
      SecondaryEmail: "",
      SecondaryDesignation: "",
      OptionalName: "",
      OptionalEmail: "",
      OptionalDesignation: "",
      license_copy_file: null,
      gst_certificate_file: null,
      contract_copy_file: null,
      canceled_chequed_file: null,
      licensePreviewUrl: "",
      gstPreviewUrl: "",
      contractPreviewUrl: "",
      chequePreviewUrl: "",
      licenseIsPdf: false,
      gstIsPdf: false,
      contractIsPdf: false,
      chequeIsPdf: false,
      rules: {
        required: (value) => !!value || "This field is required",
        phone: (val) =>
          (val ? val.length >= 8 : false) ||
          "Phone number must be at least 8 digits",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
      },
      headers: [
        {
          title: "Contact Name",
          value: "contact_Name",
          sortable: true,
        },
        {
          title: "Phone Number",
          value: "contact_number",
          sortable: true,
        },
        {
          title: "Designation",
          value: "designation",
          sortable: true,
        },
        {
          title: "Email ID",
          value: "email_id",
          sortable: true,
        },
        {
          title: "Actions",
          value: "actions",
          sortable: true,
        },
      ],
      tableData: [],
      addAddressDialog: false,
      fixed: true,
    };
  },
  computed: {
    maxDate() {
      return new Date().toISOString().split("T")[0];
    },
    formattedDate() {
      const date = new Date(this.date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear().toString();
      return `${day}-${month}-${year}`;
    },
    filteredStates() {
      return this.states.filter(
        (state) => state.countryCode === this.selectedCountry
      );
    },
    filteredStates2() {
      return this.states2.filter(
        (state) => state.countryCode === this.selectedCountry2
      );
    },
    filterIndustries() {
      const query = this.industry ? this.industry.toLowerCase() : "";
      if (!query) {
        return this.industries;
      } else {
        return this.industries.filter((industryOption) =>
          industryOption.title.toLowerCase().includes(query)
        );
      }
    },
  },
  created() {
    this.countriesList();
    this.countries = Country.getAllCountries();
    this.states = State.getAllStates();

    // Set default country to India (IN) if not already set
    if (!this.selectedCountry) {
      this.selectedCountry = "IN";
    }

    this.countries2 = Country.getAllCountries();
    this.states2 = State.getAllStates();

    // Set default country to India (IN) if not already set
    if (!this.selectedCountry2) {
      this.selectedCountry2 = "IN";
    }

    this.currencyItems = CurrencyList.map((item) => ({
      title: `${item.currency_code} - ${item.country}`,
      value: item.currency_code,
    }));

    // Fetch inventory items
    this.get_inventory_items();

    let customerData = this.$store.getters.GetcustomerData;
    // console.log(customerData);
    this.customerType = this.sanitizeValue(customerData.customer_type);
    this.companyName = this.sanitizeValue(customerData.legal_name);
    this.businessType = this.sanitizeValue(customerData.business_type);
    this.brandName = this.sanitizeValue(customerData.brand_name);
    this.industry = this.sanitizeValue(customerData.industry_type);
    this.companySize = this.sanitizeValue(customerData.company_size);
    this.website = this.sanitizeValue(customerData.website);
    this.language = this.sanitizeValue(customerData.preferred_language);

    this.address1 = this.sanitizeValue(customerData.address_line_1);
    this.city = this.sanitizeValue(customerData.city_1);
    this.zip = this.sanitizeValue(customerData.zip_code_1);
    this.selectedCountry = this.sanitizeValue(customerData.country_1);
    this.selectedState = this.sanitizeValue(customerData.state_1);

    this.address2 = this.sanitizeValue(customerData.address_line_2);
    this.city2 = this.sanitizeValue(customerData.city_2);
    this.selectedCountry2 = this.sanitizeValue(customerData.country_2);
    this.selectedState2 = this.sanitizeValue(customerData.state_2);
    this.zip2 = this.sanitizeValue(customerData.zip_code_2);

    this.pan = this.sanitizeValue(customerData.pan_no);
    this.taxId = this.sanitizeValue(customerData.cin_no);
    this.gstin = this.sanitizeValue(customerData.gst_no);
    this.taxExemptionCode = this.sanitizeValue(customerData.tax_exemption_code);

    const rawDate = customerData.customer_since;
    this.date =
      rawDate && !isNaN(Date.parse(rawDate))
        ? new Date(rawDate).toISOString().substr(0, 10)
        : new Date().toISOString().substr(0, 10);

    this.primaryEmail = this.sanitizeValue(customerData.customer_email_id);
    this.primaryName = this.sanitizeValue(customerData.primary_contact_name);
    this.primaryDesignation = this.sanitizeValue(
      customerData.primary_designation
    );
    const { code: cc1, number: cn1 } = this.splitContact(
      this.sanitizeValue(customerData.primary_contact_no)
    );
    this.userCCcode = cc1;
    this.PrimaryContact = cn1;

    this.SecondaryEmail = this.sanitizeValue(customerData.secondary_email_id);
    this.SecondaryName = this.sanitizeValue(
      customerData.secondary_contact_name
    );
    this.SecondaryDesignation = this.sanitizeValue(
      customerData.secondary_designation
    );
    const { code: cc2, number: cn2 } = this.splitContact(
      this.sanitizeValue(customerData.secondary_contact_no)
    );
    this.userCCcode2 = cc2;
    this.SecondaryContact = cn2;

    this.OptionalEmail = this.sanitizeValue(customerData.temporary_email_id);
    this.OptionalName = this.sanitizeValue(customerData.temporary_contact_name);
    this.OptionalDesignation = this.sanitizeValue(
      customerData.temporary_designation
    );
    const { code: cc3, number: cn3 } = this.splitContact(
      this.sanitizeValue(customerData.temporary_contact_no)
    );
    this.userCCcode3 = cc3;
    this.OptionalContact = cn3;

    this.status = this.sanitizeValue(customerData.customer_live_status);
    this.paymentSLA = this.sanitizeValue(customerData.payment_sla);
    this.currency = this.sanitizeValue(customerData.currency);
    this.accountManager = this.sanitizeValue(customerData.account_manager);

    this.license_copy_file = this.sanitizeValue(
      customerData.business_license_doc
    );
    this.gst_certificate_file = this.sanitizeValue(customerData.gst_document);
    this.contract_copy_file = this.sanitizeValue(customerData.contract_doc);
    this.canceled_chequed_file = this.sanitizeValue(
      customerData.cancelled_cheque
    );

    this.dob = customerData.customer_dob;
    this.licenseIsPdf = customerData.business_license_doc?.endsWith(".pdf");
    this.gstIsPdf = customerData.gst_document?.endsWith(".pdf");
    this.contractIsPdf = customerData.contract_doc?.endsWith(".pdf");
    this.chequeIsPdf = customerData.cancelled_cheque?.endsWith(".pdf");
    this.tableData = customerData.additional_contact_details;
    this.licensePreviewUrl = this.sanitizeValue(
      customerData.business_license_doc
    );
    this.gstPreviewUrl = this.sanitizeValue(customerData.gst_document);
    this.contractPreviewUrl = this.sanitizeValue(customerData.contract_doc);
    this.chequePreviewUrl = this.sanitizeValue(customerData.cancelled_cheque);

    this.dob = this.sanitizeValue(customerData.customer_dob);

    this.licenseIsPdf =
      customerData.business_license_doc?.endsWith(".pdf") || false;
    this.gstIsPdf = customerData.gst_document?.endsWith(".pdf") || false;
    this.contractIsPdf = customerData.contract_doc?.endsWith(".pdf") || false;
    this.chequeIsPdf = customerData.cancelled_cheque?.endsWith(".pdf") || false;
    //  console.log(customerData.item_details);
    // Handle product items if they exist
    if (customerData.item_details) {
      try {
        this.productItems = customerData.item_details;
      } catch (e) {
        this.productItems = [];
      }
    } else {
      this.productItems = [];
    }

    // Handle contact details array
    this.tableData = Array.isArray(customerData.additional_contact_details)
      ? customerData.additional_contact_details
      : [];
  },
  methods: {
    sanitizeValue(value) {
      return value === "N/A" || value === null || value === undefined
        ? ""
        : value;
    },
    onIndustryFocus() {
      this.showIndustryDropdown = true;
    },
    onIndustryBlur() {
      setTimeout(() => {
        this.showIndustryDropdown = false;
      }, 200);
    },
    handleIndustryInput() {
      // This method is called on input, keeping it for future use if needed
    },
    selectIndustry(industryOption) {
      this.industry = industryOption.title;
      this.showIndustryDropdown = false;
    },
    gstinRule(value) {
      if (!value) return true; // Not mandatory
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      return gstRegex.test(value) || "Enter a valid GSTIN";
    },
    panRule(value) {
      if (!value) return true; // Optional
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      return panRegex.test(value) || "Enter a valid PAN (e.g., ABCDE1234F)";
    },
    cinRule(value) {
      if (!value) return true; // Optional
      const cinRegex = /^[LUF][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
      return cinRegex.test(value) || "Enter a valid CIN (21-character format)";
    },
    splitContact(contact) {
      if (!contact) return { code: "", number: "" };

      if (contact.includes("_") || contact.includes("-")) {
        const separator = contact.includes("_") ? "_" : "-";
        const [code, number] = contact.split(separator);
        return { code, number };
      }

      const match = contact.match(/^(\+\d{1,4})(\d{6,15})$/);
      if (match) {
        return { code: match[1], number: match[2] };
      }

      return { code: "", number: contact };
    },
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
    add_address() {
      this.addAddressDialog = true;
      this.componentCheck = 2;
    },
    Contact_data(value) {
      // console.log(value);
      this.addAddressDialog = false;
      this.tableData.push({
        contact_Name: value.contact_Name,
        contact_number: value.contact_number,
        designation: value.designation,
        email_id: value.email_id,
      });
    },
    deleteItem(item) {
      const index = this.tableData.indexOf(item);
      if (index !== -1) {
        this.tableData.splice(index, 1);
      }
    },
    countriesList() {
      var countryWithCc = [];
      this.countriesData = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          title: element.dial_code,
          value: element.dial_code,
        });
        this.countriesData.push(element.title);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
      this.SecondcountryCodes = countryListt;
      this.OptionalcountryCodes = countryListt;
    },

    cancelAction() {
      this.$router.push("/home/CustommerSub");
    },
    add_geolocation(item) {
      this.location_type = item;
      this.addGeoLocationDialog = true;
      this.componentCheck = 1;
    },
    handleLocationSave(value) {
      // console.log(value);
      if (value.location_type === "ADDRESS_1") {
        this.address1 = value.address_Detail;
        this.addGeoLocationDialog = false;
      } else if (value.location_type === "ADDRESS_2") {
        this.address2 = value.address_Detail;
        this.addGeoLocationDialog = false;
      }
    },
    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          title: element.name,
          code: element.name,
        });
      });
      CountryList.forEach((element) => {
        this.countries2.push({
          title: element.name,
          code: element.name,
        });
      });
    },
    filterStates() {
      this.selectedState = ""; // Reset selected state
    },
    filterStates2() {
      this.selectedState2 = ""; // Reset selected state
    },
    previewFile(type) {
      let file;
      if (type === "license") file = this.license_copy_file;
      else if (type === "gst") file = this.gst_certificate_file;
      else if (type === "contract") file = this.contract_copy_file;
      else if (type === "cheque") file = this.canceled_chequed_file;
      else return;

      if (!file) {
        this.clearPreview(type);
        return;
      }

      // Check if file is PDF or image
      const isPdf = file.type === "application/pdf";

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;

        if (type === "license") {
          this.licensePreviewUrl = url;
          this.licenseIsPdf = isPdf;
        } else if (type === "gst") {
          this.gstPreviewUrl = url;
          this.gstIsPdf = isPdf;
        } else if (type === "contract") {
          this.contractPreviewUrl = url;
          this.contractIsPdf = isPdf;
        } else if (type === "cheque") {
          this.chequePreviewUrl = url;
          this.chequeIsPdf = isPdf;
        }
      };

      reader.readAsDataURL(file);
    },

    removeImage(type) {
      if (type === "license") {
        this.license_copy_file = null;
        this.licensePreviewUrl = "";
        this.licenseIsPdf = false;
      } else if (type === "gst") {
        this.gst_certificate_file = null;
        this.gstPreviewUrl = "";
        this.gstIsPdf = false;
      } else if (type === "contract") {
        this.contract_copy_file = null;
        this.contractPreviewUrl = "";
        this.contractIsPdf = false;
      } else if (type === "cheque") {
        this.canceled_chequed_file = null;
        this.chequePreviewUrl = "";
        this.chequeIsPdf = false;
      }
    },

    // async get_file() {
    //   try {
    //     const files = [];

    //     // If you also use panImageUrl and gstImageUrl base64 strings,
    //     // uncomment below lines to add them to upload queue
    //     // if (this.panImageUrl) files.push({ file: this.panImageUrl, type: "pan" });
    //     // if (this.gstImageUrl) files.push({ file: this.gstImageUrl, type: "gst" });

    //     if (this.license_copy_file)
    //       files.push({ file: this.license_copy_file, type: "license" });
    //     if (this.gst_certificate_file)
    //       files.push({ file: this.gst_certificate_file, type: "gst" });
    //     if (this.contract_copy_file)
    //       files.push({ file: this.contract_copy_file, type: "contract" });
    //     if (this.canceled_chequed_file)
    //       files.push({ file: this.canceled_chequed_file, type: "cheque" });

    //     const uploadPromises = files.map(({ file, type }) =>
    //       this.upload_new_func(file, type)
    //     );

    //     await Promise.all(uploadPromises);

    //     // After uploading all files, you can proceed with your API call
    //     this.create_customer();
    //   } catch (error) {
    //     console.error("Error uploading files:", error);
    //     this.$emit("errorMsg", "One or more file uploads failed.");
    //   }
    // },

    async upload_new_func(fileData, type) {
      try {
        let blob;

        if (typeof fileData === "string" && fileData.startsWith("data:")) {
          // Convert base64 string to Blob
          const res = await fetch(fileData);
          blob = await res.blob();
        } else if (fileData instanceof File) {
          blob = fileData;
        } else {
          throw new Error("Invalid file data type");
        }

        const mimeType = blob.type || "application/octet-stream";
        const extension = mimeType.split("/")[1] || "bin";

        const fileName = `${type}.${extension}`;

        // AWS amplify auth credentials
        await Auth.currentCredentials();

        const orgDetails = this.$store.getters.GetOrgDetails;

        const s3_details = {
          bucket_name: "stichh-medias",
          region: "us-east-1",
        };

        // Generate a unique S3 key
        const key = `customers/${
          orgDetails.organization.organization_id
        }/${Date.now()}-${fileName}`;

        // Upload file to S3 using your helper function
        const uploadedUrl = await uploadToS3(blob, s3_details, key);

        if (!uploadedUrl)
          throw new Error("Upload to S3 failed, no URL returned");

        // Assign the uploaded URL back to the correct data property
        if (type === "license") this.license_copy_file = uploadedUrl;
        else if (type === "gst") this.gst_certificate_file = uploadedUrl;
        else if (type === "contract") this.contract_copy_file = uploadedUrl;
        else if (type === "cheque") this.canceled_chequed_file = uploadedUrl;
      } catch (err) {
        throw new Error(`Upload failed for ${type}: ${err.message}`);
      }
    },
    async Validate_Data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        const isNewFile = (file) =>
          file instanceof File ||
          (typeof file === "string" && file.startsWith("data:"));

        const needsUpload =
          isNewFile(this.license_copy_file) ||
          isNewFile(this.gst_certificate_file) ||
          isNewFile(this.contract_copy_file) ||
          isNewFile(this.canceled_chequed_file);

        if (needsUpload) {
          this.get_file(); // only new files will be uploaded
        } else {
          this.create_customer(); // all files already uploaded
        }
      }
      else{
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Enter all the required fields",
          timeout: 5000,
          Top: true,
        };
      }
    },

    async get_file() {
      try {
        const files = [];

        const isNewFile = (file) =>
          file instanceof File ||
          (typeof file === "string" && file.startsWith("data:"));

        if (isNewFile(this.license_copy_file))
          files.push({ file: this.license_copy_file, type: "license" });
        if (isNewFile(this.gst_certificate_file))
          files.push({ file: this.gst_certificate_file, type: "gst" });
        if (isNewFile(this.contract_copy_file))
          files.push({ file: this.contract_copy_file, type: "contract" });
        if (isNewFile(this.canceled_chequed_file))
          files.push({ file: this.canceled_chequed_file, type: "cheque" });

        const uploadPromises = files.map(({ file, type }) =>
          this.upload_new_func(file, type)
        );

        await Promise.all(uploadPromises);

        this.create_customer();
      } catch (error) {
        console.error("Error uploading files:", error);
        this.$emit("errorMsg", "One or more file uploads failed.");
      }
    },

    async create_customer() {
      // let abc = this.panImageUrl;
      // console.log("aaa",abc)
      this.loading = true;
      const fullNumber = `${this.userCCcode}_${this.PrimaryContact}`;
      const fullNumber2 = `${this.userCCcode2}_${this.SecondaryContact}`;
      const fullNumber3 = `${this.userCCcode3}_${this.OptionalContact}`;

      try {
        let result = await API.graphql(
          graphqlOperation(customer_function, {
            input: {
              customer_id: this.$store.getters.GetcustomerData.customer_id,
              action_type: "UPDATE_CUSTOMER",
              customer_type: this.customerType,
              legal_name: !this.companyName ? "N/A" : this.companyName,
              business_type: !this.businessType ? "N/A" : this.businessType,
              brand_name: !this.brandName ? "N/A" : this.brandName,
              industry_type: !this.industry ? "N/A" : this.industry,
              company_size: !this.companySize ? "N/A" : this.companySize,
              website: !this.website ? "N/A" : this.website,
              preferred_language: !this.language ? "N/A" : this.language,
              address_line_1: !this.address1 ? "N/A" : this.address1,
              // address_line_1_geo_lat:
              // address_line_1_geo_long:
              city_1: !this.city ? "N/A" : this.city,
              zip_code_1: !this.zip ? "N/A" : this.zip,
              country_1: !this.selectedCountry ? "N/A" : this.selectedCountry,
              state_1: !this.selectedState ? "N/A" : this.selectedState,
              address_line_2: !this.address2 ? "N/A" : this.address2,
              // address_line_2_geo_lat:
              // address_line_2_geo_long:
              city_2: !this.city2 ? "N/A" : this.city2,
              country_2: !this.selectedCountry2 ? "N/A" : this.selectedCountry2,
              state_2: !this.selectedState2 ? "N/A" : this.selectedState2,
              zip_code_2: !this.zip2 ? "N/A" : this.zip2,
              pan_no: !this.pan ? "N/A" : this.pan,
              cin_no: !this.taxId ? "N/A" : this.taxId,
              gst_no: !this.gstin ? "N/A" : this.gstin,
              tax_exemption_code: !this.taxExemptionCode
                ? "N/A"
                : this.taxExemptionCode,
              primary_contact_name: !this.primaryName
                ? "N/A"
                : this.primaryName,
              primary_contact_no: fullNumber,
              customer_email_id: !this.primaryEmail ? "N/A" : this.primaryEmail,
              primary_designation: !this.primaryDesignation
                ? "N/A"
                : this.primaryDesignation,
              secondary_contact_name: !this.SecondaryName
                ? "N/A"
                : this.SecondaryName,
              secondary_contact_no: !this.SecondaryContact
                ? "N/A"
                : fullNumber2,
              secondary_email_id: !this.SecondaryEmail
                ? "N/A"
                : this.SecondaryEmail,
              secondary_designation: !this.SecondaryDesignation
                ? "N/A"
                : this.SecondaryDesignation,
              temporary_contact_name: !this.OptionalName
                ? "N/A"
                : this.OptionalName,
              temporary_contact_no: !this.OptionalContact ? "N/A" : fullNumber3,
              temporary_email_id: !this.OptionalEmail
                ? "N/A"
                : this.OptionalEmail,
              temporary_designation: !this.OptionalDesignation
                ? "N/A"
                : this.OptionalDesignation,
              customer_live_status: !this.status ? undefined : this.status,
              payment_sla: !this.paymentSLA ? "N/A" : this.paymentSLA,
              currency: !this.currency ? "N/A" : this.currency,
              account_manager: !this.accountManager
                ? "N/A"
                : this.accountManager,
              business_license_doc: !this.license_copy_file
                ? "N/A"
                : this.license_copy_file,
              gst_document: !this.gst_certificate_file
                ? "N/A"
                : this.gst_certificate_file,
              contract_doc: !this.contract_copy_file
                ? "N/A"
                : this.contract_copy_file,
              cancelled_cheque: !this.canceled_chequed_file
                ? "N/A"
                : this.canceled_chequed_file,
              customer_since: !this.date ? "N/A" : this.formatDate(this.date),
              customer_dob: !this.dob ? "N/A" : this.formatDate(this.dob),

              item_details: this.productItems,
              item_details_names: this.getProductNames(this.productItems),
              additional_contact_details:
                this.tableData.length == 0
                  ? JSON.stringify("N/A")
                  : JSON.stringify(this.tableData),
            },
          })
        );
        var response = JSON.parse(result.data.customer_function);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 1000,
            Top: true,
          };

          setTimeout(() => {
            this.$router.push("/home/CustommerSub");
            this.$refs.form.reset();
          }, 1000);
        } else {
          this.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.loading = false;
        console.error(error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    getProductNames(productIds) {
      if (
        !productIds ||
        !Array.isArray(productIds) ||
        productIds.length === 0
      ) {
        return [];
      }

      // Convert product IDs to names using the masterItems data from mixin
      return productIds.map((id) => {
        const product = this.masterItems.find((item) => item.item_id === id);
        return product ? product.item_name : id;
      });
    },
  },
};
</script>

<style scoped>
h3 {
  font-weight: 600;
  margin-bottom: 8px;
  margin-top: 16px;
}

.industry-dropdown-container {
  position: relative;
  width: 100%;
}

.industry-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.industry-dropdown .dropdown-item {
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.industry-dropdown .dropdown-item:hover {
  background-color: #f8fafc;
}

.industry-dropdown .dropdown-item:last-child {
  border-bottom: none;
}

.industry-name {
  font-weight: 500;
  color: #333;
}

.industry-dropdown .no-items {
  padding: 16px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: #f9f9f9;
}

.industry-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
  line-height: 1.5;
}

.industry-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.87);
  min-height: 40px;
  box-sizing: border-box;
}

.industry-input:focus {
  border-color: #1976d2;
  border-width: 2px;
  padding: 9px 13px;
}

.industry-input::placeholder {
  color: rgba(0, 0, 0, 0.38);
}
</style>

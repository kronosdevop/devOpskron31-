<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog :model-value="addOrderDialog" @update:model-value="$emit('update:addOrderDialog', $event)"
      persistent
      max-width="850"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create Order</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="scrollable-content">
          <v-form ref="form">
            <v-row>
              <v-col cols="12" sm="6">
                <!-- <v-radio-group
                  v-model="isNewCustomer"
                  row
                  class="d-flex align-center"
                >
                  <v-radio
                    label="New Customer"
                    value="NEWCUSTOMER"
                    class="mr-4"
                  />
                  <v-radio label="Existing Customer" value="EXISTINGCUST" />
                </v-radio-group> -->
                <div v-if="isNewCustomer == 'NEWCUSTOMER'" >
                  <v-text-field
                    label="Customer Name*"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                    v-model="manualCustomer"
                  ></v-text-field>
                  <div class="d-flex align-center">
                    <v-autocomplete
                      label="Country Code*"
                      v-model="userCCcode"
                      :items="countryCodes"
                      :search-input.sync="search"
                      @input="search = ''"
                      item-title="label"
                      item-value="value"
                      density="compact"
                      class="mr-4"
                      :rules="[rules.required]"
                      variant="outlined"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                    <v-text-field
                      label="Contact Number*"
                      variant="outlined"
                      density="compact"
                      :rules="[rules.required]"
                      v-model="contactNumber"
                      @keypress="is_number($event, contactNumber)"
                    ></v-text-field>
                  </div>
                  <v-text-field
                    label="Email-ID*"
                    variant="outlined"
                    density="compact"
                    :rules="[rules.required]"
                    v-model="customerEmail"
                  ></v-text-field>
                  <v-textarea
                    label="Address*"
                    variant="outlined"
                    density="compact"
                    rows="1"
                    auto-grow
                    :rules="[rules.required]"
                    v-model="customerAddress"
                  ></v-textarea>
                </div>
                <div v-else class="mt-4">
                  <v-select
                    label="Select Customer*"
                    variant="outlined"
                    density="compact"
                    v-model="customerName"
                    :items="customersArray"
                    item-title="customer_name"
                    item-value="customer_id"
                    return-object
                    :rules="[rules.required]"
                  ></v-select>

                  <v-card
                    v-if="customerName"
                    class="mt-n4 mb-2"
                    outlined
                    elevation="0"
                  >
                    <v-card-text>
                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-phone</v-icon>
                        <span
                          ><strong>Contact:</strong>
                          {{ customerName.customer_full_number }}</span
                        >
                      </div>

                      <div class="d-flex align-center mb-2">
                        <v-icon small class="mr-2">mdi-email</v-icon>
                        <span
                          ><strong>Email:</strong>
                          {{ customerName.customer_email_id }}</span
                        >
                      </div>

                      <div class="d-flex align-center">
                        <v-icon small class="mr-2">mdi-map-marker</v-icon>
                        <span
                          ><strong>Address:</strong>
                          {{ customerName.customer_address }}</span
                        >
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
                <v-text-field
                  v-model="computedDateDisplay"
                  label="Delivery Date*"
                  prepend-inner-icon="mdi-calendar-month-outline"
                  readonly
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  @click="datePicker = true"
                ></v-text-field>
                <v-dialog v-model="datePicker" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempDate"
                      :min="minDate"
                      color="#DB4C77"
                      class="primaryColor"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn variant="text" color="primaryColor" @click="datePicker = false">Cancel</v-btn>
                      <v-btn variant="text" color="primaryColor" @click="saveDate">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-text-field
                  label="Total Amount"
                  variant="outlined"
                  density="compact"
                  v-model="totalAmount"
                  @keypress="is_number($event, totalAmount)"
                ></v-text-field>

                <v-text-field
                  label="Advance Received"
                  variant="outlined"
                  density="compact"
                  :rules="[validateAdvanceAmount]"
                  v-model="advanceReceived"
                  @input="calculateBalance"
                  @keypress="is_number($event, advanceReceived)"
                ></v-text-field>

                <v-text-field
                  label="Balance Amount"
                  variant="outlined"
                  density="compact"
                  readonly
                  v-model="balanceAmount"
                  @keypress="is_number($event, balanceAmount)"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="mt-4">
                <div class="d-flex align-center">
                  <v-select
                    label="Product Name*"
                    variant="outlined"
                    density="compact"
                    class="mr-2"
                    v-model="selectedProduct"
                    :items="masterSub"
                    item-title="sub_category_name"
                    item-value="sub_category_id"
                    return-object
                    style="flex: 1"
                  />
                  <v-btn
                    color="primary"
                    icon
                    class="mt-n5 ml-4"
                    text
                    @click="addProduct"
                  >
                    <v-icon left>mdi-plus</v-icon>
                  </v-btn>
                </div>
                <v-card
                  v-for="(product, index) in selectedProducts"
                  :key="product.sub_category_id"
                  class="mb-2 pa-2"
                  outlined
                >
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-truncate" style="flex: 1">
                      <strong>{{ product.sub_category_name }}</strong>
                    </div>

                    <div class="d-flex align-center">
                      <v-btn size="small" icon @click="decreaseQuantity(index)">
                        <v-icon small>mdi-minus</v-icon>
                      </v-btn>
                      <span class="mx-2">{{ product.quantity }}</span>
                      <v-btn size="small" icon @click="increaseQuantity(index)">
                        <v-icon size="small">mdi-plus</v-icon>
                      </v-btn>
                    </div>

                    <v-btn icon color="red" size="small" @click="removeProduct(index)">
                      <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            class="cardCss text-capitalize"
            dark
            :loading="loading"
            @click="validateAndSave()"
          >
            Create Order
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    
<script>
/* eslint-disable */

import { create_orders } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import SnackBar from "@/components/SnackBar.vue";
import CountryList from "@/JsonFiles/CountryList.json";

export default {
  components: {
    SnackBar,
    CountryList,
  },
  props: {
    addOrderDialog: Boolean,
  },

  mixins: [get_global_customers, get_sub_categories],

  data() {
    return {
      customerName: "",
      customerEmail: "",
      contactNumber: "",
      advanceReceived: "",
      customersArray: [],
      masterSub: [],
      subCategory: "",
      date: new Date().toISOString().substr(0, 10),
      minDate: new Date().toISOString().substr(0, 10),
      datePicker: false,
      tempDate: new Date().toISOString().substr(0, 10),
      loading: false,
      isNewCustomer: "EXISTINGCUST",
      rules: {
        required: (v) => !!v || "Required",
      },
      selectedProduct: null,
      selectedProducts: [],
      SnackBarComponent: {},
      balanceAmount: "",
      countryCodes: [],
      userCCcode: "",
      search: "",
      manualCustomer: "",
      totalAmount: "",
      customerAddress: "",
    };
  },
  async created() {
    this.isNewCustomer = "EXISTINGCUST";
    this.countries();
    this.customersArray = [];
    await this.get_global_customers();
    this.fetch_customers();
    await this.get_sub_categories();
    this.masterSub = this.MasterSubCategories;
  },

  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.date);
    },
  },

  methods: {
    displayFormatDate(date) {
      if (!date) return "";
      if (typeof date === "string" && date.includes("-")) {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      }
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}/${year}`;
      }
      return date;
    },
    saveDate() {
      this.date = this.tempDate;
      this.datePicker = false;
    },
    calculateBalance() {
      const total = parseFloat(this.totalAmount) || 0;
      const advance = parseFloat(this.advanceReceived) || 0;

      if (advance > total) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Advance amount cannot exceed total amount.",
          timeout: 5000,
          Top: true,
        };
        this.advanceReceived = total;
        this.balanceAmount = 0;
      } else {
        this.balanceAmount = total - advance;
      }
    },

    validateAdvanceAmount(value) {
      const total = parseFloat(this.totalAmount) || 0;
      const advance = parseFloat(value) || 0;
      return advance <= total || "Advance cannot be greater than Total Amount";
    },
    countries() {
      var countryWithCc = [];
      this.countriesData = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          label: element.name + "(" + element.dial_code + ")",
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
    },
    addProduct() {
      if (!this.selectedProduct) return;

      const exists = this.selectedProducts.find(
        (p) => p.sub_category_id === this.selectedProduct.sub_category_id
      );

      if (!exists) {
        this.selectedProducts.push({
          ...this.selectedProduct,
          quantity: 1,
        });
        this.selectedProduct = null;
      } else {
        this.$emit("errorMsg", "Product already added.");
      }
    },
    increaseQuantity(index) {
      this.selectedProducts[index].quantity++;
    },
    decreaseQuantity(index) {
      if (this.selectedProducts[index].quantity > 1) {
        this.selectedProducts[index].quantity--;
      }
    },
    removeProduct(index) {
      this.selectedProducts.splice(index, 1);
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectedProducts = [];
      this.$refs.form.reset();
    },

    validateAndSave() {
      const isFormValid = this.$refs.form.validate();

      if (!isFormValid) return;

      if (this.selectedProducts.length === 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please add at least one product.",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      this.place_order();
    },
    is_number(evt, value) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (value.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },
    fetch_customers() {
      this.customersArray = this.masterCustomers;
    },

    productData() {
      const productInfoArray = this.selectedProducts.map((product) => ({
        product_name: product.sub_category_name,
        product_id: product.sub_category_id,
        quantity: product.quantity,
      }));

      return JSON.stringify(productInfoArray);
    },

    async place_order() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_orders, {
            input: {
              customer_name:
                this.isNewCustomer === "NEWCUSTOMER"
                  ? this.manualCustomer
                  : this.customerName.customer_name,
              customer_country_code:
                this.isNewCustomer === "NEWCUSTOMER"
                  ? this.userCCcode
                  : this.customerName.customer_country_code,
              customer_contact_number:
                this.isNewCustomer === "NEWCUSTOMER"
                  ? this.contactNumber
                  : this.customerName.customer_contact_number,
              customer_email_id:
                this.isNewCustomer === "NEWCUSTOMER"
                  ? this.customerEmail
                  : this.customerName.customer_email_id,
              customer_address:
                this.isNewCustomer === "NEWCUSTOMER"
                  ? this.customerAddress
                  : this.customerName.customer_address,
              advance_recevied: this.advanceReceived,
              expected_delevery_date: this.date,
              remaining_amount: this.balanceAmount,
              total_amount: this.totalAmount,
              product: this.productData(),
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.create_orders);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.selectedProducts = [];
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
    
<style scoped>
</style>

<template>
  <div>
    <v-toolbar
      class=""
      density="compact"
      flat
      
    >
      <v-toolbar-title>Generate Proforma</v-toolbar-title>

      <v-spacer />
      <v-btn
        dark
        @click="preview_data()"
        small
        v-if="tableData != 0"
        color="green"
        class="text-capitalize"
        >Preview and Confirm</v-btn
      >
      <v-btn
        color="primary"
        size="small"
        class="text-capitalize"
        @click="back_action()"
        prepend-icon="mdi-step-backward"
      >
        Back
      </v-btn>
    </v-toolbar>
    <v-card class="" flat >
      <v-card-text>
        <v-card  flat variant="outlined">
          <v-row no-gutters class="ma-2">
            <v-col cols="4">
              <v-autocomplete
                v-model="selectquotation"
                density="compact"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                label="Select Quotation"
                max-width="250"
                item-text="title"
                item-value="value"
                :items="quotationArray"
                :search-input.sync="searchquotation"
                hide-no-data
                placeholder="Min 3 Character"
                @input="fetch_quotation(selectquotation)"
                return-object
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-card>
        <v-card
          
          flat
          variant="outlined"
          class="mt-2"
        >
          <v-row no-gutters class="ma-2">
            <v-col cols="4">
              <v-autocomplete
                v-model="selectEntity"
                density="compact"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                label="Select Entity"
                max-width="250"
                item-text="title"
                item-value="value"
                :items="entityArray"
                :search-input.sync="searchF1"
                hide-no-data
                placeholder="Min 3 Character"
                @input="fetch_entity"
                return-object
              ></v-autocomplete>
            </v-col>
            <v-spacer />
            <v-col v-if="selectedEntity != null" cols="4">
              <v-icon small class="mr-2">mdi-account</v-icon
              >{{ selectedEntity.entity_name }} <br />
              <!-- <v-icon small class="mr-2">mdi-mailbox</v-icon> {{  }} <br /> -->
              <template v-if="selectedEntity.primary_contact_no">
                <v-icon small class="mr-2">mdi-phone</v-icon>
                {{ `${selectedEntity.primary_contact_no} ` }}
              </template>
              <v-icon small class="mr-2">mdi-map-marker</v-icon>
              {{ selectedEntity.entity_address }}
              <br />
            </v-col>
          </v-row>
        </v-card>
        <v-card  flat variant="outlined">
          <v-form ref="formCustomer">
            <v-row no-gutters class="ma-2">
              <v-col cols="12">
                <v-radio-group
                  v-model="customerType"
                  inline
                  color="blue"
                  @change="clearCustomer"
                  :rules="[(v) => !!v || 'required ']"
                >
                  <v-radio
                    label="Existing customer"
                    value="EXISTING_CUSTOMER"
                  ></v-radio>
                  <v-radio label="New customer" value="NEW_CUSTOMER"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="4" v-if="customerType == 'EXISTING_CUSTOMER'">
                <v-autocomplete
                  density="compact"
                  v-model="selectCustomer"
                  label="Select Customer"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  max-width="250"
                  item-text="title"
                  item-value="value"
                  :items="customersArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  placeholder="Min 3 Character"
                  @input="fetch_customer_info"
                  return-object
                >
                </v-autocomplete>
                <span
                  v-if="
                    selectedCustomer &&
                    !('customer_email_id' in selectedCustomer)
                  "
                  style="margin-top: -20px"
                >
                  Customer email ID is unavailable, the mail will not be sent.
                </span>
              </v-col>
              <v-spacer v-if="customerType == 'EXISTING_CUSTOMER'" />
              <v-col
                v-if="
                  selectedCustomer != null &&
                  customerType == 'EXISTING_CUSTOMER'
                "
                cols="4"
              >
                <v-icon small class="mr-2">mdi-account</v-icon
                >{{ selectedCustomer.customer_name }} <br />

                <template v-if="selectedCustomer.primary_contact_no">
                  <v-icon small class="mr-2">mdi-phone</v-icon>
                  {{
                    `${selectedCustomer.primary_contact_no.replace("_", " ")}`
                  }}
                  <br />
                </template>
                <v-icon small class="mr-2">mdi-map-marker</v-icon>
                {{ selectedCustomer.address_line_1 }}
                <br />
              </v-col>
              <v-col cols="4" v-if="customerType == 'NEW_CUSTOMER'">
                <v-text-field
                  variant="outlined"
                  label="Customer Name"
                  density="compact"
                  v-model="customerName"
                  :rules="
                    customerType == 'NEW_CUSTOMER'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  class="ma-2"
                />
              </v-col>
              <v-col cols="4" v-if="customerType == 'NEW_CUSTOMER'">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="customerEmailID"
                  :rules="
                    customerType == 'NEW_CUSTOMER'
                      ? [
                          (v) => !!v || 'Email is required',
                          (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
                        ]
                      : []
                  "
                  label="Customer Email ID"
                  class="ma-2"
                />
              </v-col>
              <v-col cols="4" v-if="customerType == 'NEW_CUSTOMER'">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="customerAddress"
                  label="Customer Address"
                  :rules="
                    customerType == 'NEW_CUSTOMER'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  class="ma-2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
        <v-card
          class="mt-2"
          
          flat
          variant="outlined"
        >
          <v-form ref="formSub">
            <v-row class="ma-2">
              <v-col>
                <v-radio-group
                  v-model="quotationType"
                  inline
                  color="blue"
                  @change="clearvalue"
                  :rules="[(v) => !!v || 'required ']"
                >
                  <v-radio
                    label="Master list selection"
                    value="MASTER"
                  ></v-radio>
                  <v-radio
                    label="Manual entry items list"
                    value="MANUAL"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row no-gutters class="ma-2" v-if="quotationType == 'MASTER'">
              <v-col>
                <v-select
                  density="compact"
                  variant="outlined"
                  v-model="selectedCategory"
                  :items="masterCategory"
                  item-text="title"
                  item-value="value"
                  :rules="
                    quotationType == 'MASTER' ? [(v) => !!v || 'required '] : []
                  "
                  label="Category"
                  @input="fetch_selected_category"
                >
                </v-select>
              </v-col>
              <v-col>
                <v-select
                  class="ml-2"
                  density="compact"
                  variant="outlined"
                  v-model="subCategory"
                  :items="masterSub"
                  item-text="title"
                  item-value="value"
                  label="Select Items"
                  return-object
                  :rules="[(v) => !!v || 'required ']"
                >
                </v-select>
              </v-col>

              <v-col>
                <v-btn
                  @click="add_action(subCategory)"
                  size="small"
                  class="cardCss text-capitalize ml-2"
                  dark
                  >Add
                </v-btn>
              </v-col>
            </v-row>
            <v-row no-gutters class="ma-2" v-if="quotationType == 'MANUAL'">
              <v-col>
                <v-text-field
                  density="compact"
                  variant="outlined"
                  label="Category"
                  :rules="
                    quotationType == 'MANUAL' ? [(v) => !!v || 'required '] : []
                  "
                  v-model="selectedCategory"
                />
              </v-col>

              <v-col>
                <v-text-field
                  density="compact"
                  variant="outlined"
                  class="ml-2"
                  label="Items"
                  :rules="
                    quotationType == 'MANUAL' ? [(v) => !!v || 'required '] : []
                  "
                  v-model="subCategory"
                />
              </v-col>

              <v-col>
                <v-btn
                  @click="add_action(subCategory)"
                  size="small"
                  class="cardCss text-capitalize ml-2"
                  dark
                  >Add
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
        <v-card
          class="mt-2"
          variant="outlined"
          flat
          
        >
          <!-- <v-card-text> -->
          <v-data-table
            :fixed-header="fixed"
            :headers="headers"
            :items="tableData"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="20"
            density="compact"
            class="elevation-1 dtwidth"
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon size="small" color="primary" @click.stop="editItem(item)">
                mdi-pencil
              </v-icon>
              <v-icon color="red" size="small" @click="deleteItem(item)">
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
          <!-- </v-card-text> -->
        </v-card>

        <v-card
          class="mt-2"
          
          flat
          variant="outlined"
        >
          <v-row class="ma-2" no-gutters>
            <v-col>
              <label>Total - {{ totalAmount }}</label>
            </v-col>
            <v-col>
              <v-text-field
                class="ml-2"
                variant="outlined"
                density="compact"
                label="Discount(%)"
                @keypress="is_number($event)"
                v-on:paste="process($event)"
                v-model="overalldiscount"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col>
              <label class="ml-2">Grand Total - {{ grandTotal }}</label>
            </v-col>
          </v-row>
          <v-checkbox
            v-model="emailCheck"
            label="Do you want to send email to customer?"
          ></v-checkbox>
        </v-card>
        <v-card
          class="mt-2"
          
          flat
          variant="outlined"
        >
          <v-row class="ma-2">
            <v-col cols="12">
              <v-textarea
                label="Terms and Condtion"
                v-model="termCondtion"
                density="compact"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <ProformaPreview
        :previewconfirmDialogue="previewconfirmDialogue"
        @clicked="previewconfirmDialogue = false"
        :tableData="tableData"
        :UserDetails="UserDetails"
        :grandTotal="grandTotal"
        :formattedTable="formattedTableData"
        :EntityDetails="EntityDetails"
        :emailCheck="emailCheck"
        :termCondtion="termCondtion"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddQuotationSub
        :quotationSubAddDialogue="quotationSubAddDialogue"
        v-on:subInfo="sub_data"
        :selectedSubCategoryValue="selectedSubCategoryValue"
        :selectedData="selectedData"
        @clicked="quotationSubAddDialogue = false"
        :quotationType="quotationType"
      />
    </div>
    <div v-if="componentCheck == 3">
      <EditQuotationSub
        :EditQuotationSubDialog="EditQuotationSubDialog"
        :ViewInfo="ViewInfo"
        @clicked="EditQuotationSubDialog = false"
        @successData="fetch_edited_data"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_quotation_list } from "@/mixins/GetQuotation.js";
import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import ProformaPreview from "@/components/QuotationBuilder/PopupsDialogues/ProformaPreview";
import AddQuotationSub from "@/components/QuotationBuilder/PopupsDialogues/AddQuotationSub";
import EditQuotationSub from "./PopupsDialogues/EditQuotationSub.vue";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
export default {
  mixins: [
    get_sub_categories,
    get_global_categories,
    get_global_customers,
    get_organization_entity,
    get_quotation_list,
  ],
  components: {
    ProformaPreview,
    AddQuotationSub,
    EditQuotationSub,
  },
  data() {
    return {
      selectCustomer: "",
      customerName: "",
      selectedData: "",
      customerAddress: "",
      selectquotation: "",
      selectEntity: "",
      customerEmailID: "",
      searchF: "",
      searchF1: "",
      searchquotation: "",
      termCondtion: "",
      userArray: [],
      lineItems: "",
      selectCategories: "",
      selectSubCategories: "",
      quotationType: "MASTER",
      customerType: "EXISTING_CUSTOMER",
      itemsData: "",
      quantity: "",
      price: "",
      gstTax: "",
      fixed: true,
      headers: [
        { title: "Category", value: "category", sortable: false },
        { title: "Item", value: "item", sortable: false },
        { title: "Price", value: "price", sortable: false },
        { title: "Quantity", value: "quantity", sortable: false },
        { title: "Unit", value: "unit", sortable: false },

        { title: "Total ", value: "total", sortable: false },
        { title: "Actions ", value: "actions", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      termsConditions: "",
      overalldiscount: 0,
      customersArray: [],
      componentCheck: 0,
      previewconfirmDialogue: false,
      selectedCustomer: null,
      selectedEntity: null,
      masterCategory: [],
      masterSub: [],
      subCategory: "",
      subSelection: [],
      selectedCategory: "",
      selectedValue: "",
      subMasterList: [],
      quotationArray: [],
      quotationSubAddDialogue: false,
      selectedSubCategoryValue: {},
      UserDetails: {},
      EntityDetails: {},
      ViewInfo: {},
      EditQuotationSubDialog: {},
      editedValue: "",
      emailCheck: false,
    };
  },

  async created() {
    this.customersArray = [];
    this.masterCategory = [];
    this.entityArray = [];
    await this.get_quotation_list("QUOTATION");
    // console.log(this.quotationList);
    this.quotationArray = this.quotationList.map((item) => ({
      title: item.ref_no,
      value: item.ref_no,
    }));

    await Promise.all([
      this.get_organization_entity(),
      this.get_global_customers(),
      this.get_global_categories(),
    ]);
    await Promise.all([
      this.fetch_entityInfo(),
      this.fetch_customers(),
      this.fethc_all_categories(),
      this.get_sub_categories(),
    ]);

    // await this.get_organization_entity();
    // await this.fetch_entityInfo();
    // await this.get_global_customers();
    // await this.get_global_categories();
    // await this.fetch_customers();

    // await this.fethc_all_categories();
    // await this.get_sub_categories();
    this.subMasterList = this.MasterSubCategories;
    this.termCondtion =
      this.$store.getters.GetTermsandConditions.data[0].proforma_terms_conditions;
  },

  computed: {
    totalAmount() {
      return this.tableData.reduce((sum, item) => sum + (item.total || 0), 0);
    },
    grandTotal() {
      return this.totalAmount === 0 || this.totalAmount === undefined
        ? 0
        : this.totalAmount - this.totalAmount * (this.overalldiscount / 100);
      // return this.totalAmount - (parseFloat(this.overalldiscount) || 0);
    },

    formattedTableData() {
      let formattedData = [
        ["Category", "Item", "Price", "Unit", "Quantity", "Total"],
      ];
      this.tableData.forEach((item) => {
        formattedData.push([
          item.category || "",
          item.item || "",
          item.price,
          item.quantity,
          item.unit || "",
          item.total.toString(),
        ]);
      });
      return JSON.stringify(formattedData);
    },
  },

  methods: {
    fetch_quotation(val) {
      const selected = this.entityArray.find(
        (entity) => entity.entity_id === val.entity_id
      );
      if (selected) {
        this.selectEntity = selected;
        this.fetch_entity(selected); // Call with full object
      }
      if (val.customer_id) {
        const custom = this.customersArray.find(
          (entity) => entity.customer_id === val.customer_id
        );
        if (custom) {
          this.selectCustomer = custom;
          this.customerType = "EXISTING_CUSTOMER";
          this.fetch_customer_info(custom); // Call with full object
        }
      } else {
        this.customerType = "NEW_CUSTOMER";
        this.customerName = val.customer_name;
        this.customerEmailID = val.customer_email_id;
        this.customerAddress = val.customer_address;
      }
      this.tableData = [];
      this.tableData = this.convertTableDataToObjects(val.tableData);
      // console.log(this.tableData);
    },
    convertTableDataToObjects(tableData) {
      if (!Array.isArray(tableData) || tableData.length < 2) return [];

      const [headers, ...rows] = tableData;

      return rows.map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header.toLowerCase()] = row[index];
        });
        return obj;
      });
    },
    clearCustomer() {
      this.selectCustomer = "";
      this.selectedCustomer = "";
      this.customerAddress = "";
      this.customerName = "";
      this.customerEmailID = "";
    },
    clearvalue() {
      this.selectedCategory = "";
      this.subCategory = "";
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
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    back_action() {
      this.$router.push("/home/Quotations");
    },

    fetch_customer_info(value) {
      this.selectedCategory = "";
      this.subCategory = "";
      this.selectedCustomer = value;
      this.emailCheck = false;
    },

    fetch_entity(value) {
      this.selectedEntity = value;
    },

    fetch_entityInfo() {
      this.entityArray = this.entitylist.map((entity) => ({
        title: entity.entity_name,
        value: entity.entity_id,
        ...entity, // Include all original entity properties
      }));
      this.selectEntity = this.entityArray[0];
      this.fetch_entity(this.selectEntity);
    },

    fetch_customers() {
      this.customersArray = this.masterCustomers.map((customer) => ({
        title: customer.customer_name,
        value: customer.customer_id,
        ...customer, // Include all original customer properties
      }));
      this.selectCustomer = "";
    },

    fethc_all_categories() {
      this.masterCategory = this.masterGlobalCategories.map((category) => ({
        title: category.category_name,
        value: category.category_id,
        ...category, // Include all original category properties
      }));
    },

    sub_data(value) {
      this.quotationSubAddDialogue = false;
      this.tableData.push({
        category:
          this.quotationType == "MASTER"
            ? value.selectedValue.category_name
            : this.selectedCategory,
        categoryId:
          this.quotationType == "MASTER"
            ? value.selectedValue.category_id
            : undefined,
        item:
          this.quotationType == "MASTER"
            ? value.selectedValue.sub_category_name
            : this.subCategory,
        subCategoryId:
          this.quotationType == "MASTER"
            ? value.selectedValue.sub_category_id
            : undefined,
        price: value.price,
        quantity: value.quantity,
        unit: value.unit,
        total: value.price * value.quantity || 0,
      });
      this.$refs.formSub.resetValidation();
      this.$refs.formSub.reset();
    },
    // fetch_sub_categories() {
    //   this.masterSub = this.MasterSubCategories;
    // },

    fetch_selected_category() {
      this.subCategory = "";
      this.masterSub = [];

      // Get the category_id from the selected category object
      const categoryId = this.selectedCategory?.value || this.selectedCategory;

      this.subMasterList.forEach((element) => {
        if (categoryId == element.category_id) {
          // Transform the subcategory to include title/value structure
          const transformedSub = {
            title: element.sub_category_name,
            value: element.sub_category_id,
            ...element, // Include all original properties
          };
          this.masterSub.push(transformedSub);
        }
      });
    },

    async preview_data() {
      const { valid } = await this.$refs.formCustomer.validate();
      if (valid) {
        this.componentCheck = 1;
        if (this.customerType == "EXISTING_CUSTOMER") {
          this.UserDetails = this.selectedCustomer;
        } else {
          this.UserDetails = {
            customer_name: this.customerName,
            address_line_1: this.customerAddress,
            customer_email_id: this.customerEmailID,
          };
        }

        this.EntityDetails = this.selectEntity;
        this.previewconfirmDialogue = true;
      }
    },

    close_dialogue() {
      this.previewconfirmDialogue = false;
    },

    async add_action(value) {
      const { valid } = await this.$refs.formSub.validate();
      if (!valid) {
        return;
      }

      if (this.quotationType != "MANUAL") {
        this.selectedSubCategoryValue = value;
      } else {
        this.selectedData = value;
      }

      this.quotationSubAddDialogue = true;
      this.componentCheck = 2;
    },

    deleteItem(item) {
      const index = this.tableData.indexOf(item);
      if (index !== -1) {
        this.tableData.splice(index, 1);
      }
    },

    editItem(item) {
      // console.log(item);
      this.EditQuotationSubDialog = true;
      this.ViewInfo = item;
      this.componentCheck = 3;
    },

    fetch_edited_data(value) {
      // console.log("Edited Data:", value);

      const index = this.tableData.findIndex(
        (item) => item.subCategoryId === value.editedValue.subCategoryId
      );

      if (index !== -1) {
        this.$set(this.tableData, index, {
          ...this.tableData[index],
          price: value.price,
          quantity: value.quantity,
          total: value.price * value.quantity,
          unit: value.unit,
        });

        // console.log("Updated tableData:", this.tableData); // Debugging log
      } else {
        console.warn(
          "Item not found in tableData:",
          value.editedValue.subCategoryId
        );
      }

      this.EditQuotationSubDialog = false;
    },
  },

  watch: {
    selectEntity(newValue) {
      if (newValue) {
        this.fetch_entity(newValue);
      }
    },
    selectCustomer(newValue) {
      if (newValue) {
        this.fetch_customer_info(newValue);
      }
    },
    selectedCategory(newValue) {
      if (newValue) {
        this.fetch_selected_category();
      }
    },
    subCategory(newValue) {
      if (newValue) {
       
      }
    },
  },
};
</script>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="bulkuploadDialog" @update:model-value="$emit('update:bulkuploadDialog', $event)" persistent fullscreen transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Upload Details</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-row class="mx-3">
          <v-col cols="12" md="3">
            <v-row class="mt-2">
              <v-select
                shaped
                outlined
                label="Name"
                class=""
                v-model="agentName"
                :items="headerList"
                dense
              >
              </v-select>
            </v-row>
            <v-row>
              <v-select
                shaped
                outlined
                label="Country Code"
                v-model="countryCode"
                :items="headerList"
                dense
              >
              </v-select>
            </v-row>
            <v-row>
              <v-select
                shaped
                outlined
                label="Contact Number"
                v-model="agentNumber"
                :items="headerList"
                dense
              >
              </v-select>
            </v-row>
            <v-row>
              <v-select
                shaped
                outlined
                label="Email"
                v-model="agentEmail"
                :items="headerList"
                dense
              >
              </v-select>
            </v-row>
            <v-row>
              <v-select
                shaped
                outlined
                label="Address"
                v-model="agentAddress"
                :items="headerList"
                dense
              >
              </v-select>
            </v-row>
            <v-row justify="center">
              <v-spacer />
              <v-btn
                v-if="agentName != '' && countryCode != '' && agentNumber != ''"
                @click="construct_valid_invalid()"
                class="gradient-bg white--text"
                shaped
                dark
                tile
                >Preview</v-btn
              >
            </v-row>
          </v-col>

          <v-col cols="12" md="9">
            <v-card
              v-if="headerList.length != 0 && validInputData.length != 0"
              flat
            >
              <v-tabs
                v-model="validInvalidTabs"
                centered
                slider-color="primaryColor"
              >
                <v-tab>Valid</v-tab>
                <v-tab> Invalid </v-tab>
              </v-tabs>
              <v-tabs-items v-model="validInvalidTabs">
                <v-tab-item>
                  <v-card flat v-if="validInvalidTabs == 0">
                    <v-data-table
                      :headers="validHeaders"
                      :items="UploadList.valid"
                      dense
                    >
                      <template v-slot:[`no-data`]>
                        <v-alert class="">No details are Valid</v-alert>
                      </template>
                    </v-data-table>
                    <v-card-actions></v-card-actions>
                    <v-card-actions>
                      <v-row justify="center">
                        <v-col cols="6">
                          <v-select
                            v-if="UploadList.valid.length != 0"
                            v-model="selectedModel"
                            :items="productserviceList"
                            dense
                            class="ml-2"
                            item-text="label"
                            :rules="[(v) => !!v || 'required ']"
                            item-value="value"
                            label="Select the Product you want to assign "
                            @input="product_selected(selectedModel)"
                            outlined
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-btn
                            class="text-capitalize cardCss"
                            dark
                            @click="upload_excel_data()"
                            v-if="
                              UploadList.valid.length != 0 &&
                              productCheck == true
                            "
                            :loading="isLoadingUpload"
                            ><v-icon class="mr-2">mdi-plus</v-icon> Upload
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-actions>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
              <v-tab-item>
                <v-card flat v-if="validInvalidTabs == 1">
                  <v-data-table
                    :headers="invalidHeaders"
                    :items="UploadList.invalid"
                    dense
                  >
                    <template v-slot:[`no-data`]>
                      <v-alert class=""
                        >No details are Invalid. Click on valid to
                        proceed!</v-alert
                      >
                    </template>
                  </v-data-table>
                </v-card>
              </v-tab-item>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { customer_bulk_upload } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_product_service_list } from "@/mixins/GetProductServiceList.js";
export default {
  props: {
    bulkuploadDialog: Boolean,
    excelHeaders: Array,
    excelTableData: Array,
  },
  mixins: [get_product_service_list],
  data() {
    return {
      agentAddress: "",
      agentEmail: "",
      agentNumber: "",
      agentName: "",
      headerList: [],
      countryCode: "",
      validInputData: [],
      validHeaders: [],
      invalidHeaders: [],
      dataTable: [],
      validInvalidTabs: 0,
      UploadList: [],
      isLoadingUpload: false,
      productserviceList: [],
      productCheck: false,
      selectedModel: "",
    };
  },
  watch: {
    bulkuploadDialog: {
      async handler() {
        if (this.bulkuploadDialog == true) {
          this.headerList = [];
          this.dataTable = [];
          this.headerList = this.excelHeaders;
          this.dataTable = this.excelTableData;
          this.clear_data();
          await this.get_product_service_list();
          this.productListArray.forEach((element) => {
            this.productserviceList.push({
              label: element.product_name,
              value: element.product_id,
            });
          });
          //  console.log(this.custom_details.dashboard_created_by)   ;
          //  console.log( this.$store.getters.GetUserObj.user.user_email_id);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    construct_valid_invalid() {
      this.validHeaders = [
        { text: "Name", value: this.agentName },
        { text: "Country Code", value: this.countryCode },
        { text: "Contact Number", value: this.agentNumber },
        { text: "Email", value: this.agentEmail },
        { text: "Address", value: this.agentAddress },
      ];
      this.invalidHeaders = [
        { text: "Name", value: this.agentName },
        { text: "Country Code", value: this.countryCode },
        { text: "Contact Number", value: this.agentNumber },
        { text: "Email", value: this.agentEmail },
        { text: "Address", value: this.agentAddress },
      ];
      this.validInputData = this.dataTable;
      this.validate_mandatory_data();
    },

    clear_data() {
      this.productCheck = false;
      this.agentName = "";
      this.agentNumber = "";
      this.agentEmail = "";
      this.agentAddress = "";
      this.countryCode = "";
      this.validation;
      this.productserviceList = [];
      this.UploadList.valid = [];
      this.UploadList.invalid = [];
      this.validInputData = [];
    },

    validate_mandatory_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };
      self.validInputData.forEach(function (cc) {
        for (let key in cc) {
          if (key == self.countryCode) {
            if (cc[key].toString().includes("+") == false) {
              cc[key] = "+" + cc[key];
            }
          }
        }
      });

      this.validInputData.forEach((element) => {
        var valid = true;
        const contactNumber = element[this.agentNumber];
        if (
          element[this.agentName] == undefined ||
          element[this.countryCode] == undefined ||
          element[this.agentNumber] == undefined
        ) {
          valid = false;
          this.UploadList.invalid.push(element);
        } else if (contactNumber.length > 10) {
          valid = false;
          this.UploadList.invalid.push(element);
        }
        if (valid) {
          this.UploadList.valid.push(element);
        }
      });
    },

    get_valid_invalid_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };

      self.validInputData.forEach(function (cc) {
        for (let key in cc) {
          if (key == self.countryCode) {
            if (cc[key].toString().includes("+") == false) {
              cc[key] = "+" + cc[key];
            }
          }
        }
      });

      let memsplRegex = new RegExp(/^[a-z\sA-Z ]+$/);
      let numsplRegex = new RegExp(/^[+0-9]+$/);
      var valid = true;
      for (const item of this.validInputData) {
        let invalidReasons = [];

        // if (
        //   item[this.agentName] == undefined ||
        //   item[this.agentName] == null ||
        //   item[this.agentName] == ""
        // ) {
        //   valid = false;

        // }
        // if (
        //   item[this.agentName] == undefined ||
        //   item[this.agentName] == null ||
        //   item[this.agentName] == "" ||
        //   item[this.agentName].length > 30
        // ) {
        //   valid = false;
        // } else if (!memsplRegex.test(item[this.agentName])) {
        //   valid = false;
        // }
        // if (
        //   item[this.countryCode] == undefined ||
        //   item[this.countryCode] == null ||
        //   item[this.countryCode] == ""
        // ) {
        //   valid = false;
        // }
        if (!item[this.agentName] || item[this.agentName] === "") {
          valid = false;
          // invalidReasons.push("Agent name is required.");
        } else if (
          item[this.agentName].length > 30 ||
          !memsplRegex.test(item[this.agentName])
        ) {
          valid = false;
          // invalidReasons.push("Invalid agent name.");
        }

        if (!item[this.countryCode] || item[this.countryCode] === "") {
          valid = false;
        } else if (
          item[this.countryCode].length > 7 ||
          !numsplRegex.test(item[this.countryCode])
        ) {
          valid = false;
        }

        if (!item[this.agentNumber] || item[this.agentNumber] === "") {
          valid = false;
          invalidReasons.push("Agent number is required.");
        } else if (
          item[this.agentNumber].length > 10 ||
          !numsplRegex.test(item[this.agentNumber])
        ) {
          valid = false;
        }

        if (this.agentEmail !== "") {
          if (
            !item[this.agentEmail] ||
            item[this.agentEmail] === "" ||
            !/.+@.+\..+/.test(item[this.agentEmail])
          ) {
            valid = false;
          }
        }

        if (valid) {
          this.UploadList.valid.push(item);
        } else {
          this.UploadList.invalid.push(item);
        }
      }
    },

    async upload_excel_data() {
      this.isLoadingUpload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(customer_bulk_upload, {
            input: {
              crm_users: await this.fetch_records(),
              organization_id: data.organization.organization_id,
              product_id: this.selectedModel,
              // customer_created_by: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.customer_bulk_upload);
        this.isLoadingUpload = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("createDBRefresh", "Refresh");
          this.clear_data();
          //   this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.isLoadingUpload = false;
      }
    },

    fetch_records() {
      var self = this;
      let StoreValidUser = this.UploadList.valid;

      const StoreValidUserArray = StoreValidUser.map((user) => {
        return {
          customer_name: user[self.agentName],
          full_contact_number: user[self.countryCode] + user[self.agentNumber],
          customer_email_id: user[self.agentEmail],

          customer_address: user[self.agentAddress],
        };
      });

      return JSON.stringify(StoreValidUserArray);
    },

    product_selected() {
      this.productCheck = true;
    },
  },
};
</script>
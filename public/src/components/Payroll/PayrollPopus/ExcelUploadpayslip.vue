<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="payslipExceldailog" @update:model-value="$emit('update:payslipExceldailog', $event)" persistent fullscreen transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Upload Details</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <div v-if="dynamicarrray.length == 0" class="mt-2 ml-5">
          Payslip Headers Need to be Updated
        </div>
        <v-row class="mx-8 mt-2">
          <v-col cols="4">
            <v-form ref="form">
              <v-row class="mt-2">
                <v-select
                  v-for="(item, index) in dynamicarrray"
                  :key="index"
                  outlined
                  :label="item.label_name"
                  class=""
                  v-model="selectedItems[index]"
                  :items="headerList"
                  dense
                  :rules="getValidationRules(item)"
                ></v-select>
              </v-row>
            </v-form>
            <v-row justify="center">
              <v-spacer />
              <v-btn
                @click="construct_valid_invalid()"
                class="cardCss white--text"
                dark
                small
                v-if="dynamicarrray.length != 0"
                >Preview</v-btn
              >
              <!-- currency != '' && -->
            </v-row>
          </v-col>

          <v-col cols="8">
            <v-card
              flat
              v-if="headerList.length != 0 && validInputData.length != 0"
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
                      :height="300"
                    >
                      <template v-slot:[`no-data`]>
                        <v-alert class="">No details are Valid</v-alert>
                      </template>
                    </v-data-table>
                    <div>Please Select the Month of the Payslip</div>
                    <v-menu
                      ref="menu"
                      v-model="menu"
                      :close-on-content-click="false"
                      :return-value.sync="date"
                      transition="scale-transition"
                      offset-y
                      max-width="290px"
                      min-width="auto"
                    >
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="date1"
                          label="Select a Month"
                          readonly
                          dense
                          v-bind="attrs"
                          style="max-width: 200px; margin-top: 20px"
                          class="mr-3"
                          outlined
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        :max="new Date().toISOString().substr(0, 10)"
                        v-model="date"
                        type="month"
                        no-title
                        color="primary white--text"
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="menu = false">
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.menu.save(date)"
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                    <v-card-actions class="justify-center">
                      <v-btn
                        dark
                        v-if="UploadList.valid.length != 0"
                        @click="validate_data()"
                        :loading="isLoadingUpload"
                        class="text-capitalize cardCss button-corner mt-2"
                        >Save</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-tab-item>
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
                      <template v-slot:[`item.actions`]="{ item }">
                        <v-tooltip bottom>
                          <template #activator="{ on }">
                            <a @click="deleteitem(item)">
                              <v-icon small v-on="on" color="red" class="mr-2">
                                mdi-delete
                              </v-icon>
                            </a>
                          </template>
                          <span class="white--text">Delete current record</span>
                        </v-tooltip>
                        <!-- <v-tooltip bottom>
                          <template #activator="{ on }">
                            <a @click="editItem(item)">
                              <v-icon
                                small
                                v-on="on"
                                color="primary"
                                class="mr-2"
                              >
                                mdi-pencil
                              </v-icon>
                            </a>
                          </template>
                          <span class="white--text">Edit Member Details</span>
                        </v-tooltip> -->
                      </template>
                    </v-data-table>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
    <v-dialog :model-value="dialogEdited" @update:model-value="$emit('update:dialogEdited', $event)" persistent max-width="600px" transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar dense dark class="gradient-bg2">
          <v-toolbar-items
            ><v-card-title>
              <span class="white--black titcss">Edit Customers</span>
            </v-card-title>
          </v-toolbar-items>
          <v-spacer></v-spacer>
          <v-btn text class="icon-class" dark @click="dialogEdited = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form ref="form">
          <v-card-text class="mt-4">
            <v-row class="mx-3">
              <v-col
                v-for="item in dynamicarrray"
                :key="item.headers_name"
                cols="12"
              >
                <v-text-field
                  v-model="editStoreObj[item.headers_name]"
                  :rules="getValidationdailogRules(item.headers_name)"
                  :label="item.headers_name"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              dark
              class="cardCssnav mr-7 mb-8"
              @click="ValidateAddDialog(editStoreObj)"
              ><v-icon small class="mr-3">mdi-content-save</v-icon> Save
              Details</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <OverlayComp :overlay="overlay" />
  </div>
</template>
  <script>
/* eslint-disable */
import OverlayComp from "@/components/OverlayComp.vue";
import { bulk_upload_payslips } from "@/graphql/mutations.js";
import { get_payslip_headers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    payslipExceldailog: Boolean,
    excelHeaders: Array,
    excelTableData: Array,
  },
  components: {
    OverlayComp,
  },

  data() {
    return {
      customerType: "",
      headerList: [],
      validInputData: [],
      overlay: false,
      menu: false,
      date1:
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
        " " +
        new Date().toISOString().split("T")[0].split("-")[0],
      date: new Date().toISOString().substr(0, 7),
      selectedItems: [],
      validHeaders: [],
      invalidHeaders: [],
      validInvalidTabs: 0,
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
      },
      dataTable: [],
      UploadList: [],
      isLoadingUpload: false,
      dynamicarrray: [],
      editStoreObj: {},
      dialogEdited: false,
    };
  },
  watch: {
    payslipExceldailog: {
      async handler() {
        if (this.payslipExceldailog == true) {
          this.headerList = [];
          this.dataTable = [];
          this.headerList = this.excelHeaders;
          this.dataTable = this.excelTableData;
          this.clear_data();
          this.dynamicarrray = [];

          await this.fetch_usertimelist();
          // this.dynamicarrray = [
          //   {
          //     header_data_type: "Text",
          //     headers_name: "Profile Name",
          //     is_mandatory: true,
          //   },
          //   {
          //     header_data_type: "Text",
          //     headers_name: "Phone",
          //     is_mandatory: true,
          //   },
          //   {
          //     header_data_type: "Emailid",
          //     headers_name: "email",
          //     is_mandatory: true,
          //   },
          // ];
          // this.dynamicarrray.forEach((item) => {
          //   item.headers_name = item.headers_name.split(" ").join("");
          // });
          // console.log(this.dynamicarrray);
        }
      },
      immediate: true,
    },
    date(val) {
      this.date1 =
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(val.split("-")[1]) - 1] +
        " " +
        val.split("-")[0];
    },
  },
  computed: {
    showSaveButton() {
      // Check if at least one v-select is not empty and its corresponding array element is mandatory
      return this.dynamicarrray.some((item, index) => {
        return item.is_mandatory && this.selectedItems[index] !== "";
      });
    },
  },
  methods: {
    getValidationdailogRules(key) {
      // console.log(key);
    },
    editItem(item) {
      this.editStoreObj = item;

      this.dialogEdited = true;
    },
    async fetch_usertimelist() {
      this.overlay = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_payslip_headers, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_payslip_headers);
        this.dynamicarrray = [];
        if (response.Status == "SUCCESS") {
          this.dynamicarrray = response.data[0].header_details;
          this.dynamicarrray.forEach((item) => {
            item.label_name = item.headers_name;
            item.headers_name = item.headers_name.split(" ").join("");
          });
          this.overlay = false;
        } else {
          this.dynamicarrray = [];
          this.overlay = false;
        }
      } catch (error) {
        this.dynamicarrray = [];
        this.overlay = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    getValidationRules(item) {
      // Define validation rules based on the mandatory property of the item
      if (item.is_mandatory) {
        return [(v) => !!v || `Please select ${item.headers_name}`];
      } else {
        return [];
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },

    construct_valid_invalid() {
      if (this.$refs.form.validate()) {
        this.validHeaders = [];
        this.invalidHeaders = [];
        this.dynamicarrray.forEach((item, index) => {
          this.validHeaders.push({
            text: item.headers_name,
            value: this.selectedItems[index],
          });
        });
        this.dynamicarrray.forEach((item, index) => {
          this.invalidHeaders.push({
            text: item.headers_name,
            value: this.selectedItems[index],
          });
        });
        this.invalidHeaders.push({
          text: "Actions",
          value: "actions",
        });

        this.validInputData = this.dataTable;
        this.validate_mandatory_data();
      }
    },
    deleteitem(item) {
      const index = this.UploadList.invalid.indexOf(item);
      if (index !== -1) {
        this.UploadList.invalid.splice(index, 1);
      }
    },

    clear_data() {
      this.customerType = "";
      this.validation;
      this.UploadList.valid = [];
      this.selectedItems = [];
      this.UploadList.invalid = [];
      this.validInputData = [];
      this.dynamicarrray = [];
    },

    validate_mandatory_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };
      this.validInputData.forEach((element) => {
        let valid = true;

        this.dynamicarrray.forEach((item, index) => {
          if (item.is_mandatory == true) {
            if (item.header_data_type == "Emailid") {
              const selectedValues = this.selectedItems[index];
              if (element[selectedValues]) {
                element[selectedValues] = element[selectedValues].toLowerCase();
              }
              if (!/.+@.+\..+/.test(element[selectedValues])) {
                valid = false;
              }
            } else {
              const selectedValue = this.selectedItems[index];

              if (element[selectedValue] == undefined) {
                valid = false;
              }
            }
          }
        });
        if (valid) {
          this.UploadList.valid.push(element);
        } else {
          this.UploadList.invalid.push(element);
        }
      });
    },
    async validate_data() {
      this.isLoadingUpload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(bulk_upload_payslips, {
            input: {
              organization_id: data.organization.organization_id,
              year: this.date.slice(0, 4),
              month: this.date.substring(5),
              Salary_employee: await this.fetch_records(),
            },
          })
        );

        var response = JSON.parse(result.data.bulk_upload_payslips);
        this.isLoadingUpload = false;
        if (response.Status == "SUCCESS") {
          this.isLoadingUpload = false;
          this.$emit("successMsg", response.Message);
          this.$emit("payupdating", "dataValue");
          this.clear_data();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.isLoadingUpload = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_records() {
      let StoreValidUser = this.UploadList.valid;

      const self = this;

      const StoreValidUserArray = StoreValidUser.map((user) => {
        const record = {};

        this.dynamicarrray.forEach((item, index) => {
          const selectedValue = this.selectedItems[index];
          const headerName = item.headers_value;

          if (
            selectedValue !== undefined &&
            user[selectedValue] !== undefined
          ) {
            record[headerName] = user[selectedValue];
          }
        });

        return record;
      });

      return JSON.stringify(StoreValidUserArray);
    },
  },
};
</script>
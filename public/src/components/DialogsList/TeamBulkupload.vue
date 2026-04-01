<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="dropExceldailog"
      @update:model-value="$emit('update:dropExceldailog', $event)"
      persistent
      max-width="1200"
      transition="dialog-top-transition"
    >
      <v-card height="500">
        <v-toolbar elevation="0" density="compact" class="navBar">
          <v-toolbar-title class="text-black ml-2">
            <div class="custom-title">Upload Details</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-row class="mx-8 mt-2">
          <v-col cols="4">
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="First Name*"
                v-model="firstName"
                :items="headerList"
                density="compact"
              />
            </v-row>
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="Last Name"
                v-model="lastName"
                :items="headerList"
                density="compact"
              />
            </v-row>
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="Email ID*"
                v-model="emailID"
                :items="headerList"
                density="compact"
              />
            </v-row>
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="Member ID"
                v-model="memberID"
                :items="headerList"
                density="compact"
              />
            </v-row>
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="Country Code"
                v-model="countycode"
                :items="headerList"
                density="compact"
              />
            </v-row>
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="Contact Number"
                v-model="contactNumber"
                :items="headerList"
                density="compact"
              />
            </v-row>
            <v-row justify="center">
              <v-spacer />
              <v-btn
                v-if="isPreviewButtonEnabled"
                @click="construct_valid_invalid(value)"
                class="cardCss white--text"
                color="primary"
               
                size="small"
                >Preview</v-btn
              >
            </v-row>
          </v-col>

          <v-col cols="8">
            <v-card
              v-if="headerList.length != 0 && validInputData.length != 0"
              flat
            >
              <v-tabs
                v-model="validInvalidTabs"
                center-active
                color="primary"
                slider-color="primary"
              >
                <v-tab>Valid</v-tab>
                <v-tab>Invalid</v-tab>
              </v-tabs>
              <v-window v-model="validInvalidTabs">
                <v-window-item :value="0">
                  <v-data-table
                    :headers="validHeaders"
                    :items="UploadList.valid"
                    density="compact"
                  >
                    <template #no-data>
                      <v-alert type="info">No details are Valid</v-alert>
                    </template>
                  </v-data-table>
                </v-window-item>
                <v-window-item :value="1">
                  <v-data-table
                    :headers="InvalidHeaders"
                    :items="UploadList.invalid"
                    density="compact"
                  >
                    <template #no-data>
                      <v-alert type="info">No details are Invalid</v-alert>
                    </template>
                    <template #item.actions="{ item }">
                      <v-icon
                        size="small"
                        color="primary"
                        class="mr-2"
                        @click="openDialog(item)"
                        >mdi-pencil</v-icon
                      >
                      <v-icon
                        size="small"
                        color="red"
                        class="mr-2"
                        @click="deleteitem(item)"
                        >mdi-delete</v-icon
                      >
                    </template>
                  </v-data-table>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions class="justify-center">
          <v-btn
           
            v-if="headerList.length != 0 && validInputData.length != 0"
            @click="validate_data()"
            :loading="isLoadingUpload"
            class="text-capitalize cardCss button-corner mt-2"
           
            size="small"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      :model-value="dialogEdited"
      @update:model-value="$emit('update:dialogEdited', $event)"
      persistent
      max-width="600px"
      transition="dialog-top-transition"
    >
      <v-card flat>
        <v-toolbar elevation="0" density="compact" class="navBar">
          <v-toolbar-title class="text-black ml-2">
            <div class="custom-title">Edit Member</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="dialogEdited = false"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-form ref="form">
          <v-card-text class="mt-4">
            <v-row class="mx-3">
              <v-text-field
                v-model="editStoreObj[firstName]"
                label="First Name*"
                variant="outlined"
                :rules="[(v) => !!v || 'Required']"
                density="compact"
              />
              <v-text-field
                v-if="lastName != ''"
                v-model="editStoreObj[lastName]"
                label="Last Name"
                variant="outlined"
                density="compact"
              />
              <v-text-field
                v-model="editStoreObj[emailID]"
                label="Email ID*"
                variant="outlined"
                :rules="[emailRule]"
                density="compact"
              />
              <v-text-field
                v-if="memberID != ''"
                v-model="editStoreObj[memberID]"
                label="Member ID"
                variant="outlined"
                density="compact"
              />
              <v-select
                v-if="countycode != ''"
                v-model="editStoreObj[countycode]"
                label="Country Code"
                variant="outlined"
                :rules="
                  editStoreObj[countycode] == undefined &&
                  editStoreObj[contactNumber] == undefined
                    ? []
                    : [(v) => !!v || 'Required']
                "
                density="compact"
                :items="countryitems"
                item-title="name"
                item-value="code"
              />
              <v-text-field
                v-if="contactNumber != ''"
                v-model="editStoreObj[contactNumber]"
                label="Contact Number"
                variant="outlined"
                :rules="
                  editStoreObj[contactNumber] == undefined &&
                  editStoreObj[countycode] == undefined
                    ? []
                    : [
                        (v) =>
                          /^[0-9]{8,14}$/.test(v) ||
                          'Contact number must be between 8 and 14 digits.',
                      ]
                "
                density="compact"
                @keypress="is_number($event)"
                v-on:paste="process($event)"
              />
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            
            <v-btn
              color="primary"
              class="text-capitalize cardCss button-corner mt-2 white--text"
              @click="ValidateAddDialog(editStoreObj)"
              
              size="small"
              ><v-icon size="small" class="mr-3">mdi-content-save</v-icon> Save
              Details</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { bulk_upload_members } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
export default {
  props: {
    dropExceldailog: Boolean,
    excelHeaders: Array,
    excelTableData: Array,
  },
  components: {
    CountryList,
  },
  data() {
    return {
      firstName: "",
      memberID: "",
      lastName: "",
      emailID: "",
      contactNumber: "",
      countycode: "",
      emailRule: (value) => {
        // Regular expression to validate email format
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!value) {
          return "Email is required";
        }
        if (!emailPattern.test(value)) {
          return "Please enter a valid email";
        }
        return true;
      },
      headerList: [],
      validInputData: [],
      editStoreObj: {},
      validHeaders: [],
      InvalidHeaders: [],
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
      countryitems: [],
      UploadList: [],
      isLoadingUpload: false,
      dialogEdited: false,
    };
  },
  watch: {
    dropExceldailog: {
      async handler() {
        if (this.dropExceldailog == true) {
          this.headerList = [];
          this.dataTable = [];
          this.headerList = this.excelHeaders;
          this.dataTable = this.excelTableData;
          this.clear_data();
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  computed: {
    isPreviewButtonEnabled() {
      const isFirstNameEmailFilled =
        this.firstName !== "" && this.emailID !== "";

      const isCountycodeAndContactNumberValid =
        (this.countycode && this.contactNumber) ||
        (!this.countycode && !this.contactNumber);

      // The button is enabled only if:
      // - firstName and emailID are filled
      // - countycode and contactNumber are both selected or both not selected
      return isFirstNameEmailFilled && isCountycodeAndContactNumberValid;
    },
  },
  methods: {
    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.dial_code,
          code: element.dial_code,
        });
      });
      this.countryitems.forEach((obj) => {
        obj.code = obj.code.replace("+", ""); // Remove '+' from code
        obj.name = obj.name.replace("+", ""); // Remove '+' from name
      });
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

    close_dialog() {
      this.$emit("clicked", 0);
    },
    deleteitem(item) {
      this.UploadList.invalid = this.UploadList.invalid.filter(
        (i) => i !== item
      );
    },
    construct_valid_invalid() {
      // Define all possible headers and their corresponding keys
      const allHeaders = [
        { title: "First Name",  key: this.firstName },
        { title: "Last Name", key: this.lastName },
        { title: "Email ID", key: this.emailID },
        { title: "Member ID", key: this.memberID, },
        { title: "Country Code", key: this.countycode },
        {
          title: "Contact Number",
          key: this.contactNumber,
        },
      ];

      this.validHeaders = allHeaders
        .filter((header) => header.key && header.key.trim() !== "")
        .map((header) => ({ title: header.title, key: header.key }));

      this.InvalidHeaders = [
        ...this.validHeaders,
        { title: "Actions", key: "actions" },
      ];
      this.validInputData = this.dataTable;
      this.validate_mandatory_data();
    },
    ValidateAddDialog(item) {
      if (this.$refs.form.validate()) {
        this.UploadList.valid.push(item);
        this.UploadList.invalid.splice(item, 1);

        this.dialogEdited = false;
      }
    },

    clear_data() {
      this.firstName = "";
      this.lastName = "";
      this.emailID = "";
      this.memberID = "";
      this.contactNumber = "";
      this.countycode = "";
      this.validation;
      this.UploadList.valid = [];
      this.UploadList.invalid = [];
      this.validInputData = [];
    },
    openDialog(item) {
      this.editStoreObj = { ...item };
      this.dialogEdited = true;
    },

    validate_mandatory_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };

      this.validInputData.forEach((element) => {
        var valid = true;
        // console.log(element[this.firstName]);
        if (element[this.firstName] == undefined) {
          valid = false;
        }
        if (element[this.memberID] !== undefined) {
          if (element[this.memberID] === "-") {
            element[this.memberID] = "";
          }

          if (element[this.memberID].trim() === "") {
            valid = false;
            // this.UploadList.invalid.push(element);
          }
        }
        if (element[this.emailID] == undefined) {
          valid = false;
          // this.UploadList.invalid.push(element);
        }
        if (element[this.emailID] !== undefined) {
          const emailPattern =
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

          if (!emailPattern.test(element[this.emailID])) {
            valid = false;
            // this.UploadList.invalid.push(element);
          }
        }
        // if (element[this.contactNumber] == undefined) {
        //   valid = false;
        //   // this.UploadList.invalid.push(element);
        // }
        if (element[this.contactNumber] != undefined) {
          if (element[this.countycode] == undefined) {
            valid = false;
            // this.UploadList.invalid.push(element);
          }
          let contactNumber = String(element[this.contactNumber]).trim();

          // Check if it's a valid number (string or number) with only digits
          const isValidNumber = /^\d+$/.test(contactNumber);

          // Check if the number of digits is between 8 and 14
          if (
            !isValidNumber ||
            contactNumber.length < 8 ||
            contactNumber.length > 14
          ) {
            valid = false;
            // this.UploadList.invalid.push(element);
          }
        }
        // if (element[this.countycode] == undefined) {
        //   valid = false;
        //   // this.UploadList.invalid.push(element);
        // }
        if (element[this.countycode] != undefined) {
          if (element[this.contactNumber] == undefined) {
            valid = false;
            // this.UploadList.invalid.push(element);
          }
          let contactcode = String(element[this.countycode]).trim();

          // Check if the contactcode contains a "+" and replace it with an empty string
          contactcode = contactcode.replace("+", "");
          const exists = this.countryitems.some(
            (country) => country.code === contactcode
          );

          if (exists == false) {
            element[this.countycode] = "";
            valid = false;
            // this.UploadList.invalid.push(element);
          } else {
            element[this.countycode] = String(element[this.countycode]).trim();
          }
        }

        if (valid) {
          this.UploadList.valid.push(element);
        } else {
          this.UploadList.invalid.push(element);
        }
      });
    },
    fetch_data() {
      let StoreValidUser = this.UploadList.valid;
      const self = this;
      const StoreValidUserArray = StoreValidUser.map((user) => {
        return {
          first_name: user[self.firstName],
          last_name: user[self.lastName] ?? "",
          member_id: user[self.memberID] ?? "",
          user_country_code:
            user[self.countycode] && String(user[self.countycode]).trim() !== ""
              ? String(user[self.countycode]).startsWith("+")
                ? String(user[self.countycode])
                : "+" + String(user[self.countycode])
              : "", // Default to empty string if undefined or empty
          user_contact_number: String(user[self.contactNumber] ?? ""),
          user_email_id: user[self.emailID],
        };
      });

      return JSON.stringify(StoreValidUserArray);
    },
    async validate_data() {
      this.isLoadingUpload = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(bulk_upload_members, {
            input: {
              organization_id: data.organization.organization_id,
              members_details: await this.fetch_data(),
            },
          })
        );

        this.isLoadingUpload = false;
        var response = JSON.parse(result.data.bulk_upload_members);
        this.isLoadingUpload = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.fetch_audit_message();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.isLoadingUpload = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="customerEdit" @update:model-value="$emit('update:customerEdit', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Customer</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="customerName"
                  label="Customer Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12">
                <v-text-field
                  dense
                  v-model="contactName"
                  label="Contact Person Name*"
                  :rules="[
                    (v) => !!v || 'This field is required',
                    (v) =>
                      /^[a-zA-Z\s]*$/.test(v) ||
                      'Name must not contain numbers',
                  ]"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col> -->
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="supplieremailID"
                  label="Email ID*"
                  :rules="[rules.email]"
                  class="mr-2"
                  outlined
                  @input="supplieremailID = $event.toLowerCase()"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  dense
                  v-model="countryList"
                  label="Country Code"
                  :items="countryitems"
                  class="mr-2"
                  item-text="name"
                  item-value="code"
                  outlined
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="contactNumber"
                  label="Contact Number"
                  class="ml-2 mr-2"
                  maxlength="14"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  dense
                  v-model="customeraddress"
                  label="Address*"
                  :rules="[rules.required]"
                  class="mr-2"
                  outlined
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
          <script>
/* eslint-disable */
import CountryList from "@/JsonFiles/CountryList.json";
import { customer_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    customerEdit: Boolean,
    customerItem: Object,
  },
  components: {
    CountryList,
  },
  data() {
    return {
      loading: false,
      customerName: "",
      contactName: "",
      supplieremailID: "",
      countryList: "",
      contactNumber: "",
      customeraddress: "",
      countryitems: [],
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          if (value === "" || value === null) {
            return true;
          }
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
        phoneNumber: (value) => {
          return (
            (value && /^[0-9]{8,13}$/.test(value)) ||
            "Length must be between 8 and 13 digits"
          );
        },
      },
    };
  },
  watch: {
    customerEdit: {
      async handler() {
        await this.fetch_details();

        this.customerName = this.customerItem.customer_name;
        this.contactName = this.customerItem.customer_contact_name;
        this.supplieremailID = this.customerItem.customer_email_id =
          null ||
          this.customerItem.customer_email_id == undefined ||
          this.customerItem.customer_email_id == "N/A"
            ? ""
            : this.customerItem.customer_email_id;
        this.countryList =
          this.customerItem.customer_country_code == null ||
          this.customerItem.customer_country_code == undefined ||
          this.customerItem.customer_country_code == "N/A"
            ? ""
            : this.customerItem.customer_country_code;
        this.contactNumber =
          this.customerItem.customer_contact_number == null ||
          this.customerItem.customer_contact_number == undefined ||
          this.customerItem.customer_contact_number == "N/A"
            ? ""
            : this.customerItem.customer_contact_number;
        this.customeraddress = this.customerItem.customer_address;
      },
      immediate: true,
    },
  },
  methods: {
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
    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_mutation();
      }
    },

    async edit_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(customer_function, {
            input: {
              customer_id: this.customerItem.customer_id,
              action_type: "UPDATE_CUSTOMER",
              customer_name: this.customerName,
              customer_contact_name: this.contactName,
              customer_country_code:
                this.contactNumber != "" ? this.countryList : undefined,
              customer_contact_number:
                this.countryList != "" ? this.contactNumber : undefined,
              customer_email_id:
                this.supplieremailID != "" ? this.supplieremailID : undefined,
              customer_address: this.customeraddress,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.customer_function);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
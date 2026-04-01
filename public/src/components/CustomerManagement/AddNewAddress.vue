<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="addAddressDialog"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Additional Details</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="contactName"
              label="Contact Name*"
              :rules="[rules.required]"
            ></v-text-field>
            <v-row>
              <v-col cols="4">
                <v-autocomplete
                  label="CCode*"
                  v-model="userCCcode"
                  :items="countryCodes"
                  :search-input.sync="search"
                  @input="search = ''"
                  item-value="value"
                  item-text="title"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                ></v-autocomplete>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  label="Contact Number*"
                  v-model="contact_number"
                  :maxlength="14"
                  :rules="[rules.required, rules.phone]"
                  @keypress="is_number($event, contact_number)"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="designation"
              label="Designation*"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="emailID"
              label="Email-ID*"
              :rules="[rules.required, rules.email]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            class="text-capitalize cardCss mt-n8 mr-2"
            @click="save_deatails()"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
import CountryList from "@/JsonFiles/CountryList.json";

export default {
  props: {
    addAddressDialog: Boolean,
  },
  components: {
    CountryList,
  },
  data() {
    return {
      rules: {
        required: (val) => !!val || "This field is required",
        phone: (val) =>
          (val ? val.length >= 8 : false) ||
          "Phone number must be at least 8 digits",
        email: (val) =>
          (val ? /\S+@\S+\.\S+/.test(val) : false) || "Enter a valid email",
      },
      countryCodes: [],
      search: "",
      userCCcode: "+91",
      emailID: "",
      contactName: "",
      contact_number: "",
      designation: "",
    };
  },
  created() {
    this.countries();
  },
  methods: {
    countries() {
      var countryWithCc = [];
      this.countriesData = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          title: element.dial_code,
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
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
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.contactName = "";
      this.contact_number = "";
      this.designation = "";
      this.emailID = "";
      this.userCCcode = "+91";
    },

    async save_deatails() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        const fullNumber = `${this.userCCcode} ${this.contact_number}`;
        const ContactData = {
          contact_Name: this.contactName,
          contact_number: fullNumber,
          designation: this.designation,
          email_id: this.emailID,
        };
        // console.log(ContactData);
        this.$emit("ContactDataInfo", ContactData);
        this.$refs.form.resetValidation();
        this.$refs.form.reset();
        this.contactName = "";
        this.contact_number = "";
        this.designation = "";
        this.emailID = "";
        this.userCCcode = "+91";
      }
    },
  },
};
</script>

<style>
</style>
<template>
  <v-container fluid>
    <v-row justify="end" class="mb-4">
      <v-btn
        class="mx-2 px-4"
        rounded="xl"
        color="#DB4C77"
        density="comfortable"
        prepend-icon="mdi-content-save"
        :loading="loading"
        @click="onSave"
      >
        Save
      </v-btn>

      <v-btn
        class="mx-2 px-4"
        rounded="xl"
        color="#DB4C77"
        density="comfortable"
        prepend-icon="mdi-content-save"
        @click="onback"
      >
        Back
      </v-btn>
    </v-row>
    <v-expansion-panels v-model="expandedPanel" variant="accordion">
      <!-- Personal Details -->
      <v-expansion-panel :value="0">
        <v-expansion-panel-title>Personal Details</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="gender"
                density="compact"
                variant="outlined"
                label="Gender"
                :items="['Male', 'Female']"
                outlined
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-date-input
                v-model="dateOfBirth"
                :display-format="displayFormat"
                prepend-icon=""
                label="Date of Birth"
                density="compact"
                variant="outlined"
                max-width="368"
              />
              <!-- <v-text-field
                v-model="dateOfBirth"
                density="compact"
                variant="outlined"
                label="Date of Birth"
                type="date"
                outlined
              /> -->
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="bloodGroup"
                variant="outlined"
                density="compact"
                label="Blood Group"
                :items="['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']"
                outlined
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="alternateCCode"
                :items="countryCodes"
                item-title="label"
                item-value="value"
                menu-position="bottom"
                menu-offset
                label="Alternate Country Code"
                density="compact"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="alternatePhoneNumber"
                label="Alt. Phone Number"
                outlined
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="city"
                label="City / Area"
                outlined
              />
            </v-col>

            <!-- <v-col cols="12" md="4">
              <v-select
                v-model="alternateCCode"
                :items="countryCodes"
                item-title="label"
                item-value="value"
                menu-position="bottom"
                menu-offset
                label="Alternate Country Code"
                density="compact"
                variant="outlined"
              />
            </v-col> -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="addressLineOne"
                variant="outlined"
                density="compact"
                label="Address Line 1"
                outlined
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="addressLineTwo"
                variant="outlined"
                density="compact"
                label="Address Line 2"
                outlined
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-textarea
                v-model="permanentAddress"
                variant="outlined"
                density="compact"
                label="Permanent Address"
                rows="1"
                auto-grow
                outlined
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Identity Details Placeholder -->
      <v-expansion-panel :value="1">
        <v-expansion-panel-title>Identity Details</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Nationality"
                v-model="nationality"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Passport Number"
                v-model="passportNumber"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Passport Expiry Date"
                v-model="passportExpiryDate"
              />
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Insurance Name"
                v-model="insuranceName"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Insurance ID"
                v-model="insuranceID"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Insurance Expiry Date"
                v-model="insuranceExpiryDate"
              />
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Government ID Number"
                v-model="govermentId"
              />
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Pan Number"
                v-model="panNumber"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="UAN Number"
                v-model="uanNumber"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="ESI Number"
                v-model="esiNumber"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Bank Account Number"
                v-model="bankAccountNumber"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="IFSC Code"
                v-model="ifscCode"
              />
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Aadhaar Number"
                v-model="aadharNumber"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
/*eslint-disable*/
import CountryList from "@/JsonFiles/CountryList.json";
import axios from "axios";

export default {
  props: {
    selectedParticularData: {
      type: Object,
    },
  },
  data() {
    return {
      expandedPanel: null,
      countryCodes: [],
      gender: "",
      dateOfBirth: null,
      bloodGroup: "",
      permanentAddress: "",
      addressLineTwo: "",
      addressLineOne: "",
      alternateCCode: "",
      alternatePhoneNumber: "",
      alternateContactNumber: "",
      showDatePicker: false,
      aadharNumber: "",
      ifscCode: "",
      bankAccountNumber: "",
      panNumber: "",
      drivingExpiryDate: "",
      drivingLicenceId: "",
      govermentId: "",
      insuranceExpiryDate: "",
      insuranceID: "",
      insuranceName: "",
      passportExpiryDate: "",
      passportNumber: "",
      nationality: "",
      uanNumber: "",
      esiNumber: "",
      loading: false,
    };
  },
  mounted() {
    this.fetch_update_details();
    this.countries();
  },
  methods: {
    displayFormat(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split("T")[0]; // formats to yyyy-MM-dd
    },
    fetch_update_details() {
      var data = this.selectedParticularData;
      this.dateOfBirth =
        this.selectedParticularData.date_of_birth == "N/A"
          ? ""
          : this.selectedParticularData.date_of_birth;
      this.gender =
        this.selectedParticularData.gender == "N/A" ? "" : this.gender;
      this.bloodGroup = data.blood_group == "N/A" ? "" : data.blood_group;
      this.permanentAddress =
        data.permanent_address == "N/A" ? "" : data.permanent_address;
      this.addressLineOne = data.address_1 == "N/A" ? "" : data.address_1;
      this.addressLineTwo = data.address_2 == "N/A" ? "" : data.address_2;
      this.nationality = data.nationality == "N/A" ? "" : data.nationality;
      this.passportNumber = data.identity_number;
      this.passportExpiryDate =
        data.identity_expiry_date == "N/A" ? "" : data.identity_expiry_date;
      this.insuranceName = data.insurance_name;
      this.insuranceID = data.insurance_id;
      this.govermentId = data.government_id;
      this.drivingLicenceId =
        data.driving_licence_id == undefined ? "" : data.driving_licence_id;
      this.panNumber = data.pan_number;
      this.bankAccountNumber = data.bank_account_number;
      this.ifscCode =
        data.bank_ifsc_code == undefined ? "" : data.bank_ifsc_code;
      this.uanNumber = data.uan_number;
      this.esiNumber = data.esi_number;

      //   this.drivingExpiryDate = data.
      //   this.insuranceExpiryDate = data.
    },

    onSave() {
      var data = this.selectedParticularData;
      this.loading = true;
      axios({
        method: "post",
        maxBodyLength: Infinity,

        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/workflow_respective_initiate",
        headers: {
          "x-api-key":
            this.$store.getters.GetOrgDetails.organization["x-api-key"],
          "Content-Type": "application/json",
        },
        data: {
          command: "customInitiatesWorkflows",
          action_type: "UPDATE_PROFILE",
          current_user_email_id:
            this.$store.getters.GetUserObj.user.user_email_id,
          organization_id:
            this.$store.getters.GetUserObj.organization.organization_id,
          first_name: data.first_name,
          last_name: data.last_name,
          user_email_id: data.user_email_id,
          personal_email: data.personal_email,
          user_contact_number: data.user_contact_number,
          user_country_code: data.user_country_code,
          department: data.department,
          designation: data.designation,
          location: data.location,
          reporting_manager: data.reporting_manager,
          date_of_joining:
            data.date_of_joining == "" ? undefined : data.date_of_joining,
          social_media: data.social_media == "" ? undefined : data.social_media,
          blood_group: this.bloodGroup == "" ? undefined : this.bloodGroup,
          date_of_birth: this.dateOfBirth == "" ? undefined : this.dateOfBirth,
          alternative_country_code:
            this.alternateCCode == "" ? undefined : this.alternateCCode,
          alternative_contact_number:
            this.alternatePhoneNumber == ""
              ? undefined
              : this.alternatePhoneNumber,
          address_1:
            this.addressLineOne == "" ? undefined : this.addressLineOne,
          address_2:
            this.addressLineTwo == "" ? undefined : this.addressLineTwo,
          city: this.permanentCity == "" ? undefined : this.permanentCity,
          state:
            this.permanentCountry == "" ? undefined : this.permanentCountry,
          country:
            this.permanentCountry == "" ? undefined : this.permanentCountry,
          permanent_details:
            this.permanentAddress == "" ? undefined : this.permanentAddress,
          nationality: this.nationality == "" ? undefined : this.nationality,
          identity_number:
            this.passportNumber == "" ? undefined : this.passportNumber,
          identity_expiry_date:
            this.passportExpiryDate == "" ? undefined : this.passportExpiryDate,
          government_id: this.govermentId == "" ? undefined : this.govermentId,
          insurance_name:
            this.insuranceName == "" ? undefined : this.insuranceName,
          insurance_id: this.insuranceId == "" ? undefined : this.insuranceId,

          gender: this.gender == "" ? undefined : this.gender,
          member_id: data.member_id,
          date_of_confirmation:
            data.date_of_confirmation == ""
              ? undefined
              : data.date_of_confirmation,
          adhar_number: this.aadharNumber == "" ? undefined : this.aadharNumber,
          pan_number: this.panNumber == "" ? undefined : this.panNumber,
          uan_number: this.uanNumber == "" ? undefined : this.uanNumber,
          esi_number: this.esiNumber == "" ? undefined : this.esiNumber,
          bank_account_number:
            this.bankAccountNumber == "" ? undefined : this.bankAccountNumber,
          bank_ifsc_code: this.ifscCode == "" ? undefined : this.ifscCode,
          driving_licence_id:
            data.driving_licence_id == "N/A" ? undefined : this.drivingId,
          territory_id: data.territory_id == "" ? undefined : data.territory_id,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;
            this.$emit("successMsg", res.data.Message);
          } else {
            this.loading = false;
            this.$emit("errorMsg", res.data.Message);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        });
    },

    onback() {
      this.$emit("backAction", 1);
    },
    countries() {
      var countryccWithIso = [];
      this.countriesData = [];
      var countryWithCc = [];
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
  },
};
</script>

<style scoped>
.action-btn {
  text-transform: none;
  font-weight: 500;
  color: #fff;
  min-height: 36px;
  padding-left: 16px;
  padding-right: 16px;
}

.action-btn:last-child {
  color: #333;
}
</style>
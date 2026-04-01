<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="editDialog"
      @update:model-value="$emit('update:editDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card class="pa-4" style="border-radius: 18px;">
        <v-toolbar elevation="0" color="white" class="mb-2">
          <v-toolbar-title>
            <v-icon color="primary" class="mr-2">mdi-account-edit</v-icon>
            <span v-if="actionItem == 'viewAction'">View details for {{ memberName }}</span>
            <span v-else>Update Your Details</span>
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="close_dialog()" color="grey-darken-1">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="form">
            <v-expansion-panels v-model="panel" multiple>
              <v-expansion-panel class="mt-3" value="personal">
                <v-expansion-panel-title>
                  <v-icon left class="mr-2" color="primary">mdi-account</v-icon>
                  <b>Personal Details</b>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-select
                        label="Gender"
                        :items="['Male', 'Female']"
                        variant="outlined"
                        density="compact"
                        v-model="genderInfo"
                        clearable
                        prepend-inner-icon="mdi-gender-male-female"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="dateOfBirthDisplay"
                        variant="outlined"
                        label="Date Of Birth"
                        density="compact"
                        readonly
                        @click="dateOfBirthDialog = true"
                        prepend-inner-icon="mdi-calendar"
                      ></v-text-field>

                      <v-dialog
                        v-model="dateOfBirthDialog"
                        persistent
                        width="330px"
                      >
                        <v-card>
                          <v-date-picker
                            v-model="dateOfBirth"
                            :max="
                              new Date(
                                Date.now() -
                                  new Date().getTimezoneOffset() * 60000
                              )
                                .toISOString()
                                .substr(0, 10)
                            "
                            min="1950-01-01"
                            scrollable
                          ></v-date-picker>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                              color="primary"
                              variant="text"
                              @click="dateOfBirthDialog = false"
                            >
                              Cancel
                            </v-btn>
                            <v-btn
                              color="primary"
                              variant="text"
                              @click="saveDateOfBirth"
                            >
                              OK
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-select
                        label="Blood Group"
                        :items="['A+','A-','B+','B-','O+','O-','AB+','AB-']"
                        variant="outlined"
                        density="compact"
                        v-model="bloodGroup"
                        clearable
                        prepend-inner-icon="mdi-water"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-select
                        v-model="alternateCCode"
                        :menu-props="{ bottom: true, offsetY: true }"
                        item-text="title"
                        item-value="value"
                        :items="countryCodes"
                        variant="outlined"
                        density="compact"
                        label="Alternate Country Code"
                        clearable
                        prepend-inner-icon="mdi-flag"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        v-model="alternateContactNo"
                        label="Alternate Phone Number"
                        variant="outlined"
                        maxlength="10"
                        clearable
                        prepend-inner-icon="mdi-phone"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="permanentCity"
                        label="City/Area"
                        clearable
                        prepend-inner-icon="mdi-city"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-autocomplete
                        density="compact"
                        variant="outlined"
                        :items="countriesData"
                        v-model="permanentCountry"
                        label="Country"
                        clearable
                        prepend-inner-icon="mdi-earth"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-textarea
                        rows="1"
                        density="compact"
                        variant="outlined"
                        v-model="addressLine1"
                        label="Address Line 1"
                        clearable
                        prepend-inner-icon="mdi-home"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-textarea
                        rows="1"
                        density="compact"
                        variant="outlined"
                        v-model="addressLine2"
                        label="Address Line 2"
                        clearable
                        prepend-inner-icon="mdi-home"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-textarea
                        rows="1"
                        density="compact"
                        variant="outlined"
                        v-model="permanentAddress1"
                        label="Permanent Address"
                        clearable
                        prepend-inner-icon="mdi-map-marker"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel class="mt-3" value="identity">
                <v-expansion-panel-title>
                  <v-icon left class="mr-2" color="primary">mdi-card-account-details</v-icon>
                  <b>Identity Details</b>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="nationalityIdentity"
                        label="Nationality"
                        clearable
                        prepend-inner-icon="mdi-flag"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="passportNumber"
                        label="Passport Number"
                        maxlength="9"
                        clearable
                        prepend-inner-icon="mdi-passport"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="expiryDateDisplay"
                        label="Passport Expiry Date"
                        density="compact"
                        variant="outlined"
                        readonly
                        @click="expiryDateDialog = true"
                        prepend-inner-icon="mdi-calendar"
                      ></v-text-field>

                      <v-dialog
                        v-model="expiryDateDialog"
                        persistent
                        width="330px"
                      >
                        <v-card>
                          <v-date-picker
                            v-model="expiryDate"
                            scrollable
                          ></v-date-picker>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                              color="primary"
                              variant="text"
                              @click="expiryDateDialog = false"
                            >
                              Cancel
                            </v-btn>
                            <v-btn
                              color="primary"
                              variant="text"
                              @click="saveExpiryDate"
                            >
                              OK
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="insuranceName"
                        label="Insurance Name"
                        clearable
                        prepend-inner-icon="mdi-shield-account"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="insuranceId"
                        label="Insurance ID"
                        clearable
                        prepend-inner-icon="mdi-shield-key"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="insuranceExipiryDate"
                        label="Insurance Expiry Date "
                        clearable
                        prepend-inner-icon="mdi-calendar"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="govtIdNumber"
                        label="Government ID Number"
                        clearable
                        prepend-inner-icon="mdi-card-account-details"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="drivingId"
                        label="Driving Licence ID"
                        clearable
                        prepend-inner-icon="mdi-card-account-details"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="drivingExpiryDate"
                        label="Driving Expiry Date "
                        clearable
                        prepend-inner-icon="mdi-calendar"
                      />
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="panNumber"
                        label="Pan Number "
                        clearable
                        prepend-inner-icon="mdi-card-account-details"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="bankaccno"
                        label="Bank Account Number"
                        clearable
                        prepend-inner-icon="mdi-bank"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="ifsccode"
                        label="IFSC Code"
                        clearable
                        prepend-inner-icon="mdi-bank"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="adhar_number"
                        label="Aadhaar Number"
                        clearable
                        prepend-inner-icon="mdi-card-account-details"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text
            color="grey"
            @click="close_dialog()"
            class="mr-2"
          >Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="isChecked"
            @click="edit_user_details()"
            :loading="loading"
            class="text-capitalize"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import CountryList from "@/JsonFiles/CountryList.json";

import { get_member_details } from "@/mixins/GetMemberships.js";
// import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_selected_user_details } from "@/mixins/GetUserDetails.js";

import stateList from "@/mixins/IndiaStates.json";
import { API, graphqlOperation } from "aws-amplify";
// import Croppa from "vue-croppa";
// import "vue-croppa/dist/vue-croppa.css";
// TODO: Replace with Vue 3 compatible image cropper (e.g., vue-cropper, cropperjs)

var axios = require("axios");

export default {
  name: "Croppa",
  props: {
    editDialog: Boolean,
    rowInfo: Object,
    viewAction: String,
    actionItem: String,
  },
  components: {
    CountryList,
    // Croppa,
  },
  mixins: [get_member_details, get_selected_user_details],
  data() {
    return {
      panel: [],
      userFirstName: "",
      userLastName: "",
      userCCode: "+91",
      userPhoneNo: "",
      basicEmail: "",
      personalEmail: "",
      search: "",
      locationSelected: "",
      departmentSelected: "",
      designationSelected: "",
      memberId: "",
      reportingManager: "",
      dateOfJoining: "",
      linkedinUrl: "",
      genderInfo: "",
      dateOfBirth: "",
      bloodGroup: "",
      alternateCCode: "",
      alternateContactNo: "",
      permanentCity: "",
      permanentCountry: "India",
      addressLine1: "",
      addressLine2: "",
      permanentAddress1: "",
      nationalityIdentity: "",
      passportNumber: "",
      expiryDate: "",
      govtIdNumber: "",
      insuranceName: "",
      insuranceId: "",
      memberShipType: "",
      membershipStartDate: "",
      membershipEndDate: "",
      date: null,
      menu: false,
      menu1: false,
      modal: false,
      modal1: false,
      modal2: false,
      designations: [],
      departments: [],
      locations: [],
      countriesData: [],
      reportTo: [],
      membershipitems: [],
      loading: false,
      activePicker: null,
      countryCodes: [],
      isAdminReadOnly: false,
      isUserReadOnly: false,
      fromMenu: false,
      memberName: "",
      monthlySalry: "",
      acccountNumber: "",

      drivingExpiryDate: "",
      drivingId: "",
      insuranceExipiryDate: "",
      croppa1: {},
      imgSrc: "",
      imgSrc1: "",
      imgSrc3: "",
      imgSrc4: "",
      imgSrc6: "",
      imgSrc5: "",
      selectedFile: "",
      ifsccode: "",
      bankaccno: "",
      panNumber: "",
      date_of_confirmation: "",
      adhar_number: "",
      uan_number: "",
      esi_number: "",
      isChecked: false,
      dateOfBirthDialog: false,
      dateOfBirthDisplay: "",
      expiryDateDialog: false,
      expiryDateDisplay: "",
    };
  },
  /* eslint-disable */
  watch: {
    editDialog: {
      async handler() {
        if (this.editDialog == true) {
          this.isChecked = true;
          this.panel = [];
          this.countries();
          await this.get_selected_user_details();
          await this.get_member_details();
          this.fetch_details();
          this.isChecked = false;
          this.basicEmail = this.fetchUserInfo.user_email_id;
          this.personalEmail =
            this.fetchUserInfo.personal_email == undefined
              ? "N/A"
              : this.fetchUserInfo.personal_email;
          this.memberName = this.fetchUserInfo.full_user_name;
          this.userFirstName = this.fetchUserInfo.first_name;
          this.userLastName = this.fetchUserInfo.last_name;
          this.memberId = this.fetchUserInfo.member_id;
          this.userCCode = this.fetchUserInfo.user_country_code;
          // == "N/A"
          //   ? "+91"
          //   : this.fetchUserInfo.user_country_code;

          this.userPhoneNo = this.fetchUserInfo.user_contact_number;
          this.locationSelected = this.fetchUserInfo.location;
          this.departmentSelected = this.fetchUserInfo.department_name;

          this.reportingManager = this.fetchUserInfo.reporting_manager_name;
          this.designationSelected = this.fetchUserInfo.designation_name;

          this.dateOfJoining =
            this.fetchUserInfo.date_of_joining == "N/A"
              ? ""
              : this.fetchUserInfo.date_of_joining;

          this.bloodGroup = this.fetchUserInfo.blood_group;
          this.genderInfo = this.fetchUserInfo.gender;
          this.permanentAddress1 = this.fetchUserInfo.permanent_address;
          this.permanentCity = this.fetchUserInfo.city;
          this.permanentCountry = this.fetchUserInfo.country;

          this.addressLine2 = this.fetchUserInfo.address_2;
          this.addressLine1 = this.fetchUserInfo.address_1;
          this.dateOfBirth =
            this.fetchUserInfo.date_of_birth == "N/A"
              ? ""
              : this.fetchUserInfo.date_of_birth;
          this.dateOfBirthDisplay = this.formatDateForDisplay(this.dateOfBirth);
          this.nationalityIdentity = this.fetchUserInfo.nationality;
          this.passportNumber = this.fetchUserInfo.identity_number;
          this.expiryDate =
            this.fetchUserInfo.identity_expiry_date == "N/A"
              ? ""
              : this.fetchUserInfo.identity_expiry_date;
          this.expiryDateDisplay = this.formatDateForDisplay(this.expiryDate);
          this.alternateCCode = this.fetchUserInfo.alternative_country_code;
          this.alternateContactNo =
            this.fetchUserInfo.alternative_contact_number;

          this.linkedinUrl = this.fetchUserInfo.social_media;

          this.memberShipType = this.fetchUserInfo.membership_type;

          this.membershipStartDate =
            this.fetchUserInfo.membership_start_date == "N/A"
              ? ""
              : this.fetchUserInfo.membership_start_date
                  .split("-")
                  .reverse()
                  .join("-");

          this.membershipEndDate =
            this.fetchUserInfo.membership_end_date == "N/A"
              ? ""
              : this.fetchUserInfo.membership_end_date
                  .split("-")
                  .reverse()
                  .join("-");
          this.govtIdNumber = this.fetchUserInfo.government_id;
          this.drivingId = this.fetchUserInfo.driving_licence_id;
          this.insuranceName = this.fetchUserInfo.insurance_name;
          this.insuranceId = this.fetchUserInfo.insurance_id;
          this.panNumber = this.fetchUserInfo.pan_number;
          this.bankaccno = this.fetchUserInfo.bank_account_number;
          this.ifsccode =
            this.fetchUserInfo.bank_ifsc_code == undefined
              ? "N/A"
              : this.fetchUserInfo.bank_ifsc_code;
          this.date_of_confirmation = this.fetchUserInfo.date_of_confirmation;
          this.adhar_number = this.fetchUserInfo.adhar_number;
          this.uan_number = this.fetchUserInfo.uan_number;
          this.esi_number = this.fetchUserInfo.esi_number;
        }
      },

      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      this.membershipDeatils.forEach((element) => {
        this.membershipitems.push({
          membership_types: element.membership_name,
          membership_id: element.membership_id,
        });
      });
    },
    get_image() {},
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },
    checkImagePresent() {
      if (this.imgSrc || this.imgSrc == "") {
        this.$refs["image-upload-input"].click();
      }
    },
    checkImage1Present() {
      if (this.imgSrc1 || this.imgSrc1 == "") {
        this.$refs["image-upload-input"].click();
      }
    },
    checkImage2Present() {
      if (this.imgSrc3 || this.imgSrc3 == "") {
        this.$refs["image-upload-input"].click();
      }
    },

    checkImage3Present() {
      if (this.imgSrc4 || this.imgSrc4 == "") {
        this.$refs["image-upload-input"].click();
      }
    },

    checkImage4Present() {
      if (this.imgSrc5 || this.imgSrc5 == "") {
        this.$refs["image-upload-input"].click();
      }
    },

    checkImage5Present() {
      if (this.imgSrc6 || this.imgSrc6 == "") {
        this.$refs["image-upload-input"].click();
      }
    },

    handleClick(e) {
      var self = this;
      var fileReader = new FileReader();
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      const MIME_TYPE = "image/jpeg";
      const QUALITY = 0.1;

      fileReader.readAsDataURL(e.target.files[0]);
      fileReader.onload = async function (val) {
        self.imgSrc = val.target.result;
        var img = new Image();
        img.src = val.target.result;
        img.onload = function (value) {
          const [newWidth, newHeight] = self.calculateSize(
            img,
            MAX_WIDTH,
            MAX_HEIGHT
          );
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          self.selectedFile = e.target.files[0];

          self.upload_file = true;
        };
      };
    },
    calculateSize(img, maxWidth, maxHeight) {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      return [width, height];
    },
    countries() {
      var countryccWithIso = [];
      this.countriesData = [];
      var countryWithCc = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          title: element.name + "(" + element.dial_code + ")",
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
    },

    is_Number(evt) {
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
    fetch_value(val) {
      const d = new Date(parseInt(val) * 1000);
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        year +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        (+date <= 9 ? "0" + date : date)
      );
    },

    saveDateOfBirth() {
      this.dateOfBirthDialog = false;
      // dateOfBirth is already in yyyy-mm-dd format for API
      this.dateOfBirthDisplay = this.formatDateForDisplay(this.dateOfBirth);
    },

    saveExpiryDate() {
      this.expiryDateDialog = false;
      // expiryDate is already in yyyy-mm-dd format for API
      this.expiryDateDisplay = this.formatDateForDisplay(this.expiryDate);
    },

    formatDateForDisplay(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    },

    formatDateForAPI(dateString) {
      if (!dateString) return "";
      // If already in yyyy-mm-dd format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      // If in dd-mm-yyyy format, convert to yyyy-mm-dd
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        return `${year}-${month}-${day}`;
      }

      return dateString;
    },

    edit_user_details() {
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
          first_name: this.userFirstName,
          last_name: this.userLastName,
          user_email_id: this.basicEmail,
          personal_email: this.personalEmail,
          user_contact_number: this.userPhoneNo,
          user_country_code: this.userCCode,
          department: this.fetchUserInfo.department,
          designation: this.fetchUserInfo.designation,
          location: this.locationSelected,
          reporting_manager: this.fetchUserInfo.reporting_manager,
          date_of_joining:
            this.dateOfJoining == "" ? undefined : this.dateOfJoining,
          social_media: this.linkedinUrl == "" ? undefined : this.linkedinUrl,
          blood_group: this.bloodGroup == "" ? undefined : this.bloodGroup,
          date_of_birth: this.dateOfBirth == "" ? undefined : this.dateOfBirth,
          alternative_country_code:
            this.alternateCCode == "" ? undefined : this.alternateCCode,
          alternative_contact_number:
            this.alternateContactNo == "" ? undefined : this.alternateContactNo,
          address_1: this.addressLine1 == "" ? undefined : this.addressLine1,
          address_2: this.addressLine2 == "" ? undefined : this.addressLine2,
          city: this.permanentCity == "" ? undefined : this.permanentCity,
          state:
            this.permanentCountry == "" ? undefined : this.permanentCountry,
          country:
            this.permanentCountry == "" ? undefined : this.permanentCountry,
          permanent_details:
            this.permanentAddress1 == "" ? undefined : this.permanentAddress1,
          nationality:
            this.nationalityIdentity == ""
              ? undefined
              : this.nationalityIdentity,
          identity_number:
            this.passportNumber == "" ? undefined : this.passportNumber,
          identity_expiry_date:
            this.expiryDate == "" ? undefined : this.expiryDate,
          government_id:
            this.govtIdNumber == "" ? undefined : this.govtIdNumber,
          insurance_name:
            this.insuranceName == "" ? undefined : this.insuranceName,
          insurance_id: this.insuranceId == "" ? undefined : this.insuranceId,
          membership_type:
            this.memberShipType == "" ? undefined : this.memberShipType,
          membership_start_date:
            this.membershipStartDate == ""
              ? undefined
              : this.membershipStartDate,
          membership_end_date:
            this.membershipEndDate == "" ? undefined : this.membershipEndDate,
          gender: this.genderInfo == "" ? undefined : this.genderInfo,
          member_id: this.memberId,
          date_of_confirmation:
            this.date_of_confirmation == ""
              ? undefined
              : this.date_of_confirmation,
          adhar_number: this.adhar_number == "" ? undefined : this.adhar_number,
          pan_number: this.panNumber == "" ? undefined : this.panNumber,
          uan_number: this.uan_number == "" ? undefined : this.uan_number,
          esi_number: this.esi_number == "" ? undefined : this.esi_number,
          bank_account_number:
            this.bankaccno == "" ? undefined : this.bankaccno,
          bank_ifsc_code: this.ifsccode == "" ? undefined : this.ifsccode,
          driving_licence_id: this.drivingId == "" ? undefined : this.drivingId,
          territory_id:
            this.fetchUserInfo.territory_id == ""
              ? undefined
              : this.fetchUserInfo.territory_id,
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

    close_dialog() {
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },
  },
};
</script>
<style scoped>
.image-upload-input {
  display: none;
  z-index: -9999;
}
</style>
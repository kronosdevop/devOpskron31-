<template>
  <!-- eslint-disable -->
  <div>
    <!-- Organization Logo Section -->
    <v-card class="mb-4" flat>
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h3 class="text-h6 font-weight-bold mb-1">Organization Logo</h3>
            <p class="text-body-2 text-medium-emphasis">Upload your organization logo. Recommended size: 200x200px</p>
          </div>
          <div class="d-flex align-center">
            <v-btn
              variant="outlined"
              color="grey"
              @click="close_dialog()"
              class="text-capitalize mr-3"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="validate_data()"
              :loading="loading"
              class="text-capitalize mr-3"
            >
              Save Changes
            </v-btn>
            <!-- <v-btn
              @click="close_dialog()"
              color="grey"
              variant="text"
              prepend-icon="mdi-close"
              class="text-capitalize"
            >
              Close
            </v-btn> -->
          </div>
        </div>
        
        <div class="d-flex align-center">
          <div class="logo-container mr-4">
            <v-img
              v-if="imgSrc && imgSrc !== ''"
              :src="imgSrc"
              width="120"
              height="120"
              class="rounded-lg"
              cover
            />
            <div
              v-else
              class="logo-placeholder d-flex align-center justify-center"
            >
              <span class="text-h4 font-weight-bold text-white">
                {{ orgName ? orgName.substring(0, 2).toUpperCase() : 'LO' }}
              </span>
            </div>
          </div>
          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-upload"
            class="text-capitalize"
            @click="checkImagePresent()"
          >
            Change Logo
          </v-btn>
        </div>
        
        <!-- Hidden file input for logo upload -->
        <input
          ref="image-upload-input"
          accept="image/*"
          capture="user"
          class="image-upload-input"
          type="file"
          @change="handleClick"
        />
      </v-card-text>
    </v-card>

    <!-- Organization Details Section -->
    <v-card class="mb-4" flat>
      <v-card-text class="pa-6">
        <h3 class="text-h6 font-weight-bold mb-4">Organization Details</h3>
        
        <v-form ref="form">
          <v-row>
            <v-col cols="6">
              <v-text-field
                label="Account Name*"
                density="compact"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                v-model="orgName"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                density="compact"
                class="ml-2"
                variant="outlined"
                label="Team Id*"
                maxlength="10"
                :rules="[(v) => !!v || 'required ']"
                @keydown.space.prevent="preventLeadingSpace"
                v-on:keypress="isLetterOrNumber($event)"
                @input="teamId = teamId.toUpperCase()"
                v-model="teamId"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                :items="['1-99', '100-200', '200-300', 'More than 300']"
                label="No. of Members*"
                density="compact"
                variant="outlined"
                v-model="noOfMembers"
                :rules="[(v) => !!v || 'required ']"
                :menu-props="{ contentClass: 'select-items' }"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="selectedCountry"
                :items="countries"
                item-title="name"
                class="ml-2"
                item-value="isoCode"
                variant="outlined"
                density="compact"
                label="Select Country"
                @change="filterStates"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="selectedState"
                :items="filteredStates"
                item-title="name"
                item-value="name"
                variant="outlined"
                density="compact"
                label="Select State"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                class="ml-2"
                density="compact"
                variant="outlined"
                v-model="OrgCity"
                label="City"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="gstNo"
                maxlength="15"
                label="TaxId"
              />
            </v-col>
            <v-col cols="6">
              <v-textarea
                rows="1"
                density="compact"
                variant="outlined"
                class="ml-2"
                v-model="address1"
                label="Address Line 1"
              />
            </v-col>
            <v-col cols="6">
              <v-textarea
                rows="1"
                density="compact"
                variant="outlined"
                v-model="address2"
                class=""
                label="Address Line 2"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                class="ml-2"
                v-model="currency"
                :menu-props="{
                  contentClass: 'select-items',
                }"
                label="Currency"
                :items="currencyData"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                variant="outlined"
                density="compact"
                item-title="text"
                item-value="value"
                label="Date Format"
                :menu-props="{
                  contentClass: 'select-items',
                }"
                :items="dateformatitems"
                v-model="formatdate"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                variant="outlined"
                density="compact"
                item-title="text"
                item-value="value"
                label="Time Format"
                :menu-props="{
                  contentClass: 'select-items',
                }"
                :items="timeformatitems"
                v-model="formatetime"
                class="ml-2"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Weekly Off Section -->
    <v-card class="mb-4" flat>
      <v-card-text class="pa-6">
        <h3 class="text-h6 font-weight-bold mb-4">Weekly Off</h3>
        
        <v-form ref="form">
          <v-row>
            <v-col
              v-for="(category, index) in types"
              :key="types[index].text"
              cols="12"
              sm="3"
            >
              <v-checkbox
                light
                :label="category.text"
                v-model="category.value"
                @click="get_value(category)"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Work Timings Section -->
    <v-card class="mb-4" flat>
      <v-card-text class="pa-6">
        <h3 class="text-h6 font-weight-bold mb-4">Work Timings</h3>
        
        <v-form ref="form">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="time"
                label="Start Time"
                density="compact"
                variant="outlined"
                readonly
                @click="startTimeDialog = true"
              />
              
              <v-dialog v-model="startTimeDialog" persistent max-width="290">
                <v-card>
                  <v-time-picker
                    v-model="tempStartTime"
                    format="24hr"
                    full-width
                    color="#DB4C77"
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn text color="primaryColor" @click="cancelStartTime">
                      Cancel
                    </v-btn>
                    <v-btn text color="primaryColor" @click="saveStartTime">
                      OK
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="time1"
                label="End Time"
                variant="outlined"
                density="compact"
                class="ml-2"
                readonly
                @click="endTimeDialog = true"
              />
              
              <v-dialog v-model="endTimeDialog" persistent max-width="290">
                <v-card>
                  <v-time-picker
                    v-model="tempEndTime"
                    format="24hr"
                    full-width
                    color="#DB4C77"
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn text color="primaryColor" @click="cancelEndTime">
                      Cancel
                    </v-btn>
                    <v-btn text color="primaryColor" @click="saveEndTime">
                      OK
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Custom Info Section -->
    <v-card class="mb-4" flat>
      <v-card-text class="pa-6">
        <h3 class="text-h6 font-weight-bold mb-4">Custom Info</h3>
        
        <v-form ref="form">
          <v-row>
            <v-col cols="12">
              <v-textarea
                density="compact"
                variant="outlined"
                v-model="customNotes"
                label="Notes"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Additional Setting Section -->
    <v-card class="mb-4" flat>
      <v-card-text class="pa-6">
        <h3 class="text-h6 font-weight-bold mb-4">Additional Setting</h3>
        
        <v-form ref="form">
          <v-row>
            <v-col cols="6">
              <v-select
                density="compact"
                variant="outlined"
                v-model="scanTolerance"
                v-on:keypress="is_Number($event)"
                :items="itemsData"
                label="Scan Tolerance"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import stateList from "@/mixins/IndiaStates.json";
import CountryList from "@/JsonFiles/CountryList.json";
import CurrencyList from "@/JsonFiles/CurrencyList.json";
import { edit_organization } from "@/graphql/mutations.js";
import { get_s3_regions } from "@/mixins/GetBucketRegion.js";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
// import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { Country, State } from "country-state-city";

export default {
  props: {
    editDialog: Boolean,
    rowInfo: Object,
  },
  mixins: [
    get_s3_regions,
    //  update_audit_logs
  ],
  data() {
    return {
      orgName: "",
      teamId: "",
      noOfMembers: "",
      itemsData: [],
      orgCountry: "",
      indianStatesArray: [],
      OrgCity: "",
      gstNo: "",
      orgPrefix: "",
      timeformatitems: [
        { text: "HH:MM", value: "HH:mm" },
        { text: "HH:MM AM/PM", value: "hh:mm a" },
      ],
      dateformatitems: [
        { text: "DD-MM-YYYY", value: "dd-MM-yyyy" },
        { text: "DD-MON-YYYY", value: "dd-MMM-yyyy" },
        { text: "MM-DD-YYYY", value: "MM-dd-yyyy" },
        { text: "MON-DD-YYYY", value: "MMM-dd-yyyy" },
        { text: "YYYY-MM-DD", value: "yyyy-MM-dd" },
        { text: "YYYY-DD-MM", value: "yyyy-dd-MM" },
      ],
      formatdate: "",
      formatetime: "",
      teamVisibility: "",
      address1: "",
      address2: "",
      loading: false,
      permanentState: "",
      weeklyOfs: "",
      types: [
        { text: "Sunday", value: false },
        { text: "Monday", value: false },
        { text: "Tuesday", value: false },
        { text: "Wednesday", value: false },
        { text: "Thursday", value: false },
        { text: "Friday", value: false },
        { text: "Saturday", value: false },
      ],
      selectedWeeks: [],
      startTimeDialog: false,
      endTimeDialog: false,
      time: null,
      time1: null,
      tempStartTime: "",
      tempEndTime: "",
      upload_file: false,
      panel: [],
      countriesData: [],
      countries: [],
      states: [],
      folderName: "",
      bucketRegion: "",
      bucketList: [],
      customNotes: "",
      imgSrc: "",
      currency: "",
      currencyData: [],
      scanTolerance: null,
      selectedCountry: "",
      selectedState: "",
      selectedFile: null,
      orgOwner: "",
      ownerEmail: "",
      createdOn: "",
      timeZone: "",
    };
  },
  watch: {
    editDialog: {
      async handler() {
        // console.log(this.$store.getters.GetOrgDetails.organization.organization_logo,"this.$store.getters.GetOrgDetails");
        this.itemsData = [];
        this.fetch_items();
        this.countries = Country.getAllCountries();
        // console.log(this.countries);
        this.states = State.getAllStates();
        const matchingCountry = this.countries.find(
          (country) =>
            country.name === this.rowInfo.organization.organization_country
        );
        // this.selectedCountry = this.refObj.organisation_country;
        this.selectedCountry = matchingCountry.isoCode;
        this.panel = [];
        // this.countries();
        this.countcurrency();
        this.scanTolerance =
          this.rowInfo.organization.organization_scan_tolerance;
        this.upload_file = false;
        this.indianStatesArray = stateList.states;
        this.orgName = this.rowInfo.organization.organization_name;
        this.teamId = this.rowInfo.organization.organization_team_id;
        this.createdOn = this.rowInfo.organization.organization_created_on;
        this.ownerEmail = this.rowInfo.organization.organization_created_by;
        this.orgOwner = this.rowInfo.owner.full_user_name;
        this.membersOnboard = this.rowInfo.organization.total_number_of_users;
        this.currency = this.rowInfo.organization.organization_currency;
        this.teamVisibility = this.rowInfo.organization.team_visibilty;
        this.noOfMembers = this.rowInfo.organization.no_of_employees;
        this.orgPrefix = this.rowInfo.organization.member_id_prefix;
        this.gstNo = this.rowInfo.organization.organization_gst_number;
        this.weeklyOfs = this.get_weekly_Of(this.rowInfo.organization.week_off);
        this.time = this.rowInfo.organization.working_timeings.start;
        this.time1 = this.rowInfo.organization.working_timeings.end;
        this.tempStartTime = this.time;
        this.tempEndTime = this.time1;
        // this.selectedCountry = this.rowInfo.organization.organization_country;
        this.selectedState =
          this.rowInfo.organization.organization_state == undefined
            ? ""
            : this.rowInfo.organization.organization_state;
        this.OrgCity =
          this.rowInfo.organization.organization_city == undefined
            ? ""
            : this.rowInfo.organization.organization_city;
        this.address1 =
          this.rowInfo.organization.organization_address_1 == undefined
            ? ""
            : this.rowInfo.organization.organization_address_1;
        this.address2 =
          this.rowInfo.organization.organization_address_2 == undefined
            ? ""
            : this.rowInfo.organization.organization_address_2;
        this.folderName =
          this.rowInfo.organization.bucket_folder_name == "" ||
          this.rowInfo.organization.bucket_folder_name == undefined
            ? ""
            : this.rowInfo.organization.bucket_folder_name;
        this.bucketRegion =
          this.rowInfo.organization.bucket_region == "" ||
          this.rowInfo.organization.bucket_region == undefined
            ? ""
            : this.rowInfo.organization.bucket_region;
        this.customNotes =
          this.rowInfo.organization.organization_note == undefined ||
          this.rowInfo.organization.organization_note == "N/A"
            ? ""
            : this.rowInfo.organization.organization_note;
        this.formatetime =
          this.rowInfo.organization.time_format == undefined
            ? "HH:mm"
            : this.rowInfo.organization.time_format;
        this.formatdate =
          this.rowInfo.organization.date_format == undefined
            ? "dd-MM-yyyy"
            : this.rowInfo.organization.date_format;
        this.selectedWeeks = [];
        this.imgSrc =
          this.rowInfo.organization.organization_logo == "N/A" ||
          this.rowInfo.organization.organization_logo == undefined ||
          this.rowInfo.organization.organization_logo.includes("/N/A")
            ? ""
            : await this.getS3SignedUrlForLogo();
        this.timeZone = this.rowInfo.organization.default_timezone || "";
      },
      immediate: true,
    },
  },
  computed: {
    filteredStates() {
      // console.log(this.selectedCountry);

      return this.states.filter(
        (state) => state.countryCode === this.selectedCountry
      );
    },
  },
  methods: {
    async getS3SignedUrlForLogo() {
      const rawUrl = this.rowInfo.organization.organization_logo;
      // console.log("Organization Logo URL:", rawUrl);
      const details = this.$store.getters.GetOrgDetails;
      // console.log("Org Details:", details);

      if (!rawUrl || !details || !details.s3_details) {
        // console.log("Missing required data for S3 signed URL");
        return "";
      }

      try {
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
        // console.log("Signed URL:", signedUrl);
        return signedUrl;
      } catch (error) {
        console.error("Error getting S3 signed URL:", error);
        return "";
      }
    },
    fetch_items() {
      for (let i = 50; i <= 1000; i += 50) {
        this.itemsData.push(i);
      }
    },
    filterStates() {
      // Filter states based on the selected country
      this.selectedState = ""; // Reset selected state
    },
    changeRefBys() {
      const matchingCountry = this.countries.find(
        (country) => country.isoCode === this.selectedCountry
      );
      // console.log(matchingCountry);
    },
    checkImagePresent() {
      if (this.imgSrc || this.imgSrc == "") {
        this.$refs["image-upload-input"].click();
      }
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

    handleClick(e) {
      const self = this;
      const file = e.target.files[0];
      if (!file) return;

      self.selectedFile = file;

      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      const MIME_TYPE = "image/jpeg";
      const QUALITY = 0.1;

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = function () {
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

        canvas.toBlob(
          (blob) => {
            self.compressedFile = blob;
            self.imgSrc = URL.createObjectURL(blob);
            self.upload_file = true;
          },
          MIME_TYPE,
          QUALITY
        );
      };
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_regions() {
      this.bucketList = [];
      this.listRegions.forEach((element) => {
        this.bucketList.push({
          label: element.region_name,
          value: element.region,
        });
      });
    },
    countries() {
      this.countriesData = [];
      CountryList.forEach((element) => {
        this.countriesData.push(element.name);
      });
    },
    countcurrency() {
      this.currencyData = [];
      CurrencyList.forEach((element) => {
        this.currencyData.push(element.currency_code);
      });
    },
    preventLeadingSpace(e) {
      if (!e.target.value) e.preventDefault();
      else if (e.target.value[0] == " ")
        e.target.value = e.target.value.replace(/^\s*/, "");
    },
    get_value(val) {
      this.selectedWeeks.push(val);
    },
    get_weekly_Of(val) {
      var array = [];
      for (const key in val) {
        array.push({
          text: `${key}`,
          value: `${val[key]}` == "true" ? true : false,
        });
      }

      for (var i = 0; i < this.types.length; i++) {
        for (var j = 0; j < array.length; j++) {
          if (this.types[i].text == array[j].text) {
            this.types[i].value = array[j].value;
          }
        }
      }

      return array;
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
    isLetterOrNumber(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[A-Za-z0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },

    async validate_data() {
      if (this.upload_file == true) {
        this.upload_new_func();
      } else {
        this.update_actions();
      }
    },
    async upload_new_func() {
      if (!this.selectedFile) return;
      this.loading = true;
      const orgDetails = this.$store.getters.GetOrgDetails;
      // console.log(orgDetails);
      const Key = [
        "AllorganizationLogos",
        orgDetails.organization.organization_id,
        Math.floor(new Date().getTime()),
        this.replaceSpecialCharacters(this.selectedFile.name),
      ].join("/");

      try {
        const fileUrl = await uploadToS3(
          this.selectedFile,
          orgDetails.s3_details,
          Key
        );
        if (fileUrl) {
          // console.log(fileUrl);
          this.update_actions(fileUrl);
        }
      } catch (err) {
        this.loading = false;
      }
    },

    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async update_actions(url) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      const matchingCountry = this.countries.find(
        (country) => country.isoCode === this.selectedCountry
      );
      // console.log(matchingCountry.name);
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              organization_name: this.orgName,
              organization_scan_tolerance: this.scanTolerance,
              team_visibilty: this.teamVisibility,
              organization_team_id: this.teamId,
              organization_country: matchingCountry.name,
              no_of_employees: this.noOfMembers,
              organization_state:
                this.selectedState == "" ? undefined : this.selectedState,
              organization_address_1:
                this.address1 == "" ? undefined : this.address1,
              organization_address_2:
                this.address2 == "" ? undefined : this.address2,
              organization_city: this.OrgCity == "" ? undefined : this.OrgCity,
              organization_gst_number: this.gstNo,
              user_email_id: data.user.user_email_id,
              member_id_prefix: this.orgPrefix,
              week_off: this.get_week_of(),
              working_timeings: this.get_work_timings(),
              organization_logo: url != undefined ? url : "N/A",
              organization_note: this.customNotes,
              organization_currency: this.currency,
              date_format: this.formatdate,
              time_format: this.formatetime,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    get_week_of() {
      for (var i = 0; i < this.types.length; i++) {
        for (var j = 0; j < this.selectedWeeks.length; j++) {
          if (this.types[i].text == this.selectedWeeks[j].text) {
            this.types[i].value = this.selectedWeeks[j].value;
          }
        }
      }
      var mapped = this.types.map((item) => ({
        [item.text]: item.value == true,
      }));
      var newObj = Object.assign({}, ...mapped);
      return JSON.stringify(newObj);
    },
    get_work_timings() {
      var data = {
        start: this.time,
        end: this.time1,
      };
      return JSON.stringify(data);
    },
    saveStartTime() {
      this.time = this.tempStartTime;
      this.startTimeDialog = false;
    },
    cancelStartTime() {
      this.tempStartTime = this.time;
      this.startTimeDialog = false;
    },
    saveEndTime() {
      this.time1 = this.tempEndTime;
      this.endTimeDialog = false;
    },
    cancelEndTime() {
      this.tempEndTime = this.time1;
      this.endTimeDialog = false;
    },
    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        year
      );
    },
  },
};
</script>

<style scoped>
/* Logo Container */
.logo-container {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #DB4C77 0%, #9C27B0 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3);
}

/* Info Field Styling */
.info-field {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-field:hover {
  background: #ffffff;
  border-color: #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.field-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
}

/* Card Styling */
.v-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e9ecef !important;
  background: #ffffff !important;
}

.v-card-text {
  padding: 24px !important;
}

/* Button Styling */
.v-btn {
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
}

/* Typography */
.text-h6 {
  color: #2c3e50 !important;
  font-weight: 700 !important;
  font-size: 20px !important;
  margin-bottom: 16px !important;
}

.text-body-2 {
  color: #6c757d !important;
  line-height: 1.5 !important;
  font-size: 14px !important;
}

/* Icon Styling */
.v-icon {
  opacity: 0.8;
  color: #6c757d !important;
}

/* Hidden file input */
.image-upload-input {
  display: none;
  z-index: -9999;
}
</style>
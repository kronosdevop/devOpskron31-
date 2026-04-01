<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <!-- Back Button Header -->
    <!-- <v-card flat class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="primary">mdi-domain</v-icon>
        <span class="text-h6">Team Details</span>
      </v-card-title>
    </v-card> -->
    
    <!-- Team Details View -->
    <div v-if="!editDialog">
      <v-card flat :height="windowHeight" class="overflow-y-auto mt-4">
      <!-- Organization Logo Section -->
      <v-card class="mb-4" flat>
        <v-card-text class="pa-6">
          <div class="d-flex align-center">
            <div class="logo-container">
              <v-img
                v-if="logoUrl && logoUrl !== ''"
                :src="logoUrl"
                width="120"
                height="120"
                class="rounded-lg"
                contain
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
            <v-spacer></v-spacer>
            <v-btn 
              text
              @click="goBack"
              class="back-link"
              color="primary"
            >
              <!-- <v-icon left color="white">mdi-arrow-left</v-icon> -->
              Back 
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

      <!-- Organization Information Section -->
      <v-card class="mb-4" flat>
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-bold">Organization Information</h3>
            <v-btn
              @click="edit_dialog()"
              :loading="loading"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-pencil"
              class="text-capitalize"
            >
              Edit Details
            </v-btn>
          </div>
          
          <v-row>
            <!-- Left Column -->
            <v-col cols="12" md="6">
              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-domain</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Account Name</span>
                </div>
                <div class="field-value">{{ orgName || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-account</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Account Owner</span>
                </div>
                <div class="field-value">{{ orgOwner || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-email</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Owner Email Id</span>
                </div>
                <div class="field-value">{{ ownerEmail || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-calendar</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Onboarded On</span>
                </div>
                <div class="field-value">{{ fetch_value(createdOn) || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-pound</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Team Id</span>
                </div>
                <div class="field-value">{{ teamId || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-account-group</v-icon>
                  <span class="text-body-2 text-medium-emphasis">No. of Members</span>
                </div>
                <div class="field-value">{{ noOfMembers || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-earth</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Team Visibility</span>
                </div>
                <div class="field-value">{{ display_visibility(teamVisibility) || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-clock</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Time Zone</span>
                </div>
                <div class="field-value">{{ timeZone || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-calendar</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Date Format</span>
                </div>
                <div class="field-value">{{ display_formart(dateformat) || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-clock</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Time Format</span>
                </div>
                <div class="field-value">{{ display_time(timeformat) || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-pound</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Scan Tolerance</span>
                </div>
                <div class="field-value">{{ scanTolerance || "N/A" }}</div>
              </div>
            </v-col>

            <!-- Right Column -->
            <v-col cols="12" md="6">
              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-pound</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Tax ID</span>
                </div>
                <div class="field-value">{{ gstNo || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-clock</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Work Timings</span>
                </div>
                <div class="field-value">{{ formatTeamWorkTimings(workTimings) || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-calendar</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Weekly Off</span>
                </div>
                <div class="field-value">{{ Array.isArray(weeklyOff) ? weeklyOff.join(', ') : weeklyOff || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-earth</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Country</span>
                </div>
                <div class="field-value">{{ orgCountry || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-map-marker</v-icon>
                  <span class="text-body-2 text-medium-emphasis">State</span>
                </div>
                <div class="field-value">{{ permanentState || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-map-marker</v-icon>
                  <span class="text-body-2 text-medium-emphasis">City</span>
                </div>
                <div class="field-value">{{ OrgCity || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-map-marker</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Address Line 1</span>
                </div>
                <div class="field-value">{{ address1 || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-map-marker</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Address Line 2</span>
                </div>
                <div class="field-value">{{ address2 || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-currency-usd</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Currency</span>
                </div>
                <div class="field-value">{{ currency || "N/A" }}</div>
              </div>

              <div class="info-field">
                <div class="field-label">
                  <v-icon size="20" color="grey" class="mr-2">mdi-server</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Data Hosted In</span>
                </div>
                <div class="field-value">{{ bucketRegion ? `${bucketRegion} (${getRegionDisplayName(bucketRegion)})` : "N/A" }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card>
    </div>

    <!-- Edit Team Details View -->
    <div v-else>
      <v-card flat :height="windowHeight" class="overflow-y-auto mt-4">
      <EditTeamDetails
        :editDialog="editDialog"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editDialog = false"
      />
      </v-card>
    </div>
    
    <OverlayComp :overlay="overlay" />
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import EditTeamDetails from "@/components/SettingsDialogs/EditTeamDetails.vue";
import stateList from "@/mixins/IndiaStates.json";
import OverlayComp from "@/components/OverlayComp.vue";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  // Components
  components: {
    SnackBar,
    EditTeamDetails,
    OverlayComp,
  },

  // Mixins
  mixins: [get_Org_details],

  // Data
  data() {
    return {
      // UI state properties
      loading4: false,
      loading: false,
      overlay: false,
      editDialog: false,
      componentCheck: 0,
      windowHeight: 0,
      // SnackBar component
      SnackBarComponent: {},

      // Organization information
      orgOwner: "",
      orgName: "",
      teamId: "",
      createdOn: "",
      ownerEmail: "",
      membersOnboard: "",
      noOfMembers: "",
      orgPrefix: "",
      orgCountry: "INDIA",

      // Organization settings
      currency: "",
      scanTolerance: "",
      teamVisibility: "",
      workTimings: "",
      weeklyOff: "",
      timeZone: "",
      timeformat: "",
      dateformat: "",
      dateformatitems: [],

      // Address information
      permanentState: "",
      OrgCity: "",
      address1: "",
      address2: "",
      gstNo: "",
      indianStatesArray: [],

      // S3 and file properties
      logoUrl: "",
      bucketRegion: "",
      folderName: "",
      imgSrc: "",

      // Component data
      rowInfo: {},
    };
  },

  // Lifecycle hooks
  async created() {
    this.overlay = true;
    this.windowHeight = window.innerHeight - 180;
    await this.get_Org_details();
    await this.fetch_team_details(this.orgDetails);

    this.formatTeamWorkTimings(); // Call your formatting logic here

    this.overlay = false;
  },

  // Methods
  methods: {
    // Data fetching methods
    async fetch_team_details(value) {
      this.overlay = false;
      var response = value;
      this.rowInfo = value;
      this.$store.commit("SetadministrationCheck", true);
      
      // Organization basic info
      this.scanTolerance = response.organization.organization_scan_tolerance;
      this.currency = response.organization.organization_currency;
      this.orgName = response.organization.organization_name;
      this.orgInfo = response.organization.organization_name;
      this.orgOwner = response.owner.full_user_name;
      this.teamId = response.organization.organization_team_id;
      this.createdOn = response.organization.organization_created_on;
      this.ownerEmail = response.organization.organization_created_by;
      this.membersOnboard = response.organization.total_number_of_users;
      this.billingRate = response.organization.billing_rate;
      this.teamVisibility = response.organization.team_visibilty;
      this.noOfMembers = response.organization.no_of_employees;
      this.orgPrefix = response.organization.member_id_prefix;
      this.orgCountry = response.organization.organization_country;
      
      // Organization settings
      this.timeformat = response.organization.time_format == undefined ? "N/A" : response.organization.time_format;
      this.dateformat = response.organization.date_format == undefined ? "N/A" : response.organization.date_format;
      this.timeZone = response.organization.default_timezone == undefined ? "" : response.organization.default_timezone;
      
      // Address information
      this.permanentState = response.organization.organization_state == undefined ? "" : response.organization.organization_state;
      this.OrgCity = response.organization.organization_city == undefined ? "" : response.organization.organization_city;
      this.address1 = response.organization.organization_address_1 == undefined ? "" : response.organization.organization_address_1;
      this.address2 = response.organization.organization_address_2 == undefined ? "" : response.organization.organization_address_2;
      this.gstNo = response.organization.organization_gst_number == undefined ? "" : response.organization.organization_gst_number;
      
      // Work settings
      this.workTimings = response.organization.working_timeings.start + "-" + response.organization.working_timeings.end;
      this.weeklyOff = this.get_weekly(response.organization.week_off);
      this.indianStatesArray = stateList.states;
      
      // S3 settings
      this.folderName = response.organization.bucket_folder_name == "" || response.organization.bucket_folder_name == undefined ? "" : response.organization.bucket_folder_name;
      this.bucketRegion = response.organization.bucket_region == "" || response.organization.bucket_region == undefined ? "" : response.organization.bucket_region;

      this.logoUrl = await this.fetch_s3_url(response);
    },

    async fetch_s3_url(response) {
      const rawUrl = response.organization.organization_logo;
      const details = this.$store.getters.GetOrgDetails;

      if (!rawUrl || !details || !details.s3_details) {
        return;
      }

      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);

      if (signedUrl) {
        return signedUrl;
      }
    },

    // Formatting methods
    display_formart(value) {
      var data = "";
      if (value == "dd-MM-yyyy") {
        data = "DD-MM-YYYY";
      } else if (value == "dd-MMM-yyyy") {
        data = "DD-MON-YYYY";
      } else if (value == "MM-dd-yyyy") {
        data = "MM-DD-YYYY";
      } else if (value == "MMM-dd-yyyy") {
        data = "MON-DD-YYYY";
      } else if (value == "yyyy-MM-dd") {
        data = "YYYY-MM-DD";
      } else if (value == "yyyy-dd-MM") {
        data = "YYYY-DD-MM";
      }
      return data;
    },

    display_time(value) {
      var data = "";
      if (value == "HH:mm") {
        data = "HH:MM";
      } else if (value == "hh:mm a") {
        data = "HH:MM AM/PM";
      }
      return data;
    },

    formatTeamWorkTimings(workTimings) {
      if (!workTimings || !workTimings.includes("-")) return "N/A";
      return this.display_work_timings(workTimings);
    },

    display_work_timings(value) {
      const [start, end] = value.split("-");
      const formattedStart = this.format_time(start);
      const formattedEnd = this.format_time(end);
      return `${formattedStart} - ${formattedEnd}`;
    },

    format_time(time) {
      const [hours, minutes] = time.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = ((hours + 11) % 12) + 1; // Convert 24-hour to 12-hour format
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    },

    display_visibility(val) {
      switch (val) {
        case "USER_REPORTES_ONLY": {
          return "Users Reportees Only";
        }
        case "ALL_USERS": {
          return "All Users";
        }
        case "USER_REPORTIES_AND_REPORTING_MANAGER": {
          return "Users Reportees And Reporting Manage";
        }
        case "USER_COMMON_LOCATION": {
          return "Users With Common Location";
        }
        case "USER_COMMON_DEPARTMENT": {
          return "Users With Common Department";
        }
        default:
          return "";
      }
    },

    get_weekly(val) {
      var data = [];
      for (const key in val) {
        if (`${val[key]}` == "true") {
          data.push(`${key}`);
        }
      }
      return data;
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

    getRegionDisplayName(region) {
      const regionMap = {
        'ap-south-1': 'Asia (Mumbai)',
        'us-east-1': 'US East (N. Virginia)',
        'us-west-2': 'US West (Oregon)',
        'eu-west-1': 'Europe (Ireland)',
        'ap-southeast-1': 'Asia Pacific (Singapore)',
        'ap-northeast-1': 'Asia Pacific (Tokyo)',
        'eu-central-1': 'Europe (Frankfurt)',
        'sa-east-1': 'South America (São Paulo)'
      };
      return regionMap[region] || region;
    },

    // Image handling methods
    s3get(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "AllorganizationLogos/" + response.organization.organization_logo.split("AllorganizationLogos/")[1],
        Expires: 6000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      return url;
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
          const [newWidth, newHeight] = self.calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          self.selectedFile = e.target.files[0];
        };
      };
    },

    // Validation methods
    preventLeadingSpace(e) {
      if (!e.target.value) e.preventDefault();
      else if (e.target.value[0] == " ")
        e.target.value = e.target.value.replace(/^\s*/, "");
    },

    isLetterOrNumber(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[A-Za-z0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.update_actions();
      }
    },

    // Dialog and navigation methods
    edit_dialog() {
      this.editDialog = true;
    },

    goBack() {
      this.$emit('backAction');
    },

    // Notification methods
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.editDialog = false;
      await this.get_Org_details();
      this.$store.commit("SetOrgDetails", this.orgDetails);

      await this.fetch_team_details(this.orgDetails);
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
  margin-bottom: 16px;
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

.field-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  margin-top: 4px;
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

/* Chip Styling */
.v-chip {
  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .info-field {
    padding: 12px;
  }
  
  .field-value {
    font-size: 14px;
  }
  
  .logo-container {
    width: 100px;
    height: 100px;
  }
  
  .logo-placeholder {
    width: 100px;
    height: 100px;
  }
}

/* Hidden file input */
.image-upload-input {
  display: none;
  z-index: -9999;
}
</style>

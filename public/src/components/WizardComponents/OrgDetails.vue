<template>
  <div>
    <v-card flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-form ref="form">
        <v-row class="mt-3" no-gutters>
          <v-col cols="4">
            <v-text-field
              dense
              outlined
              :rules="[(v) => !!v || 'Required ']"
              label="Organization Name"
              v-model="orgName"
            >
            </v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              density="compact"
              class="ml-2"
              outlined
              label="Team Id"
              maxlength="10"
              :rules="[(v) => !!v || 'Required ']"
              @keydown.space.prevent="preventLeadingSpace"
              v-on:keypress="isLetterOrNumber($event)"
              @input="teamId = teamId.toUpperCase()"
              v-model="teamId"
            >
            </v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              density="compact"
              class="ml-2"
              outlined
              label="Team Visibility"
              v-model="teamVisibility"
              item-text="text"
              item-value="value"
              :items="[
                { text: 'All Users', value: 'ALL_USERS' },
                { text: 'Users Reportees Only ', value: 'USER_REPORTES_ONLY' },
                {
                  text: 'Users Reportees And Reporting Manager',
                  value: 'USER_REPORTIES_AND_REPORTING_MANAGER',
                },
                {
                  text: 'Users With Common Location',
                  value: 'USER_COMMON_LOCATION',
                },
                {
                  text: 'Users With Common Group',
                  value: 'USER_COMMON_DEPARTMENT',
                },
                {
                  text: 'Users With Common Group',
                  value: 'USER_COMMON_DEPARTMENT',
                },
                {
                  text: 'User Reportees and Reporting hierarchy',
                  value: 'USER_REPORTEES_AND_REPORTING_HIERARCHY',
                },
                {
                  text: 'User reportees and peers',
                  value: 'USER_REPORTEES_AND_PEERS',
                },
              ]"
            >
            </v-select>
          </v-col>

          <v-col cols="4">
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="gstNo"
              maxlength="15"
              label="TaxID"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-autocomplete
              class="ml-2"
              label="Time Zone"
              v-model="timeZonesSelected"
              :items="timezonesArray"
              :search-input.sync="search"
              @input="search = ''"
              density="compact"
              variant="outlined"
              :menu-props="{ offsetY: true, maxHeight: 200 }"
            ></v-autocomplete>
            <!-- <v-select
              dense
              class="ml-2"
              outlined
              label="Time Zone"
              :rules="[(v) => !!v || 'Required ']"
              v-model="timeZonesSelected"
              :items="timezonesArray"
            /> -->
          </v-col>
          <v-col cols="4">
            <v-textarea
              rows="1"
              dense
              outlined
              class="ml-2"
              v-model="address1"
              label="Address "
            />
          </v-col>
          <!-- <v-col cols="4">
            <v-textarea
              rows="1"
              dense
              outlined
              v-model="address2"
              class="ml-2"
              label="Address Line 2"
            />
          </v-col> -->
        </v-row>
        <v-row class="mt-1" no-gutters>
          <v-col cols="6">
            <div class="text-left mt-n2"><b>Weekly Off</b></div>
          </v-col>
          <v-col cols="6">
            <div class="text-left mt-n2"><b>Data Hosted In</b></div>
          </v-col>
          <!-- <v-col cols="6">
            <div class="text-left mt-n2"><b>Work Timings</b></div>
          </v-col> -->
        </v-row>

        <v-row no-gutters>
          <v-col cols="6">
            <v-row no-gutters>
              <v-col
                v-for="(category, index) in types"
                :key="types[index].text"
                cols="12"
                sm="3"
                class=""
              >
                <v-checkbox
                  light
                  :label="category.text"
                  v-model="category.value"
                  @click="get_value(category)"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="6">
            <v-row no-gutters>
              <v-col class="mt-n3" cols="12">
                <v-radio-group
                  :rules="[(v) => !!v || 'Required ']"
                  v-model="dataSeletion"
                  row
                >
                  <v-radio
                    label="Default Repository"
                    value="defaultRepository"
                  ></v-radio>
                  <v-radio
                    label="Custom Repository"
                    value="customRepository"
                  ></v-radio>
                </v-radio-group>
              </v-col>

              <v-col
                v-if="dataSeletion == 'defaultRepository'"
                class="mt-3"
                cols="6"
              >
                <v-select
                  dense
                  outlined
                  :rules="
                    dataSeletion == 'defaultRepository'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  :items="bucketList"
                  v-model="bucketRegion"
                  label="Select Region"
                  item-text="label"
                  item-value="value"
                />
              </v-col>
              <v-col v-if="dataSeletion == 'customRepository'" cols="6">
                <v-textarea
                  dense
                  auto-grow
                  outlined
                  :rules="
                    dataSeletion == 'customRepository'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  v-model="accesKeyID"
                  rows="0"
                  label="AWS Access Key"
                />
              </v-col>
              <v-col v-if="dataSeletion == 'customRepository'" cols="6">
                <v-textarea
                  dense
                  auto-grow
                  class="ml-2"
                  outlined
                  :rules="
                    dataSeletion == 'customRepository'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  v-model="secretKeyId"
                  rows="0"
                  label="AWS Secret Key "
                />
              </v-col>
              <v-col v-if="dataSeletion == 'customRepository'" cols="6">
                <v-select
                  dense
                  outlined
                  :rules="
                    dataSeletion == 'customRepository'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  :items="bucketList"
                  v-model="awsRegion"
                  label="AWS Region"
                  item-text="label"
                  item-value="value"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
      <v-row class="mt-1" no-gutters> </v-row>
      <v-card-actions class="justify-satrt">
        <v-btn color="primary" :loading="loading" @click="validate_data()">
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
var axios = require("axios");
import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_s3_regions } from "@/mixins/GetBucketRegion.js";
import { get_timezones_details } from "@/mixins/GetTimeZones.js";

import { edit_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_Org_details, get_s3_regions, get_timezones_details],
  data() {
    return {
      orgName: "",
      teamId: "",
      teamVisibility: "",
      noOfMembers: "",
      loading: false,
      SnackBarComponent: {},
      gstNo: "",
      address1: "",
      address2: "",
      types: [
        { text: "Sunday", value: false },
        { text: "Monday", value: false },
        { text: "Tuesday", value: false },
        { text: "Wednesday", value: false },
        { text: "Thursday", value: false },
        { text: "Friday", value: false },
        { text: "Saturday", value: false },
      ],
      menu2: false,
      time: null,
      menu3: false,
      time1: null,
      selectedWeeks: [],
      bucketRegion: "",
      folderName: "",
      bucketList: [],
      dataSeletion: "",
      accesKeyID: "",
      secretKeyId: "",
      awsRegion: "",
      timeZonesSelected: "",
      timezonesArray: [],
      search: "",
    };
  },

  async created() {
    this.selectedWeeks = [];
    this.timezonesArray = [];
    await this.get_Org_details();
    await this.get_timezones_details();
    await this.get_s3_regions();

    this.fetch_team_details();
    this.fetch_regions();
  },
  mounted() {
    const apiKey = "7dc7ae8d1cc54ab2ae3753110b2a7726";

    this.getTimezoneAndCountry(apiKey);
  },

  methods: {
    getTimezoneAndCountry(apiKey) {
      const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;

          if (data) {
            this.getTimezone(
              apiKey,
              data.location.latitude,
              data.location.longitude
            );
          } else {
            // console.error("No location data found.");
          }
        })
        .catch((error) => {
          // console.error("Error fetching geolocation data:", error);
        });
    },
    getTimezone(apiKey, latitude, longitude) {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;

          if (data) {
            this.timeZonesSelected = data.results[0].timezone.name;
          } else {
          }
        })
        .catch((error) => {});
    },
    fetch_regions() {
      this.bucketList = [];

      this.timezonesArray = this.timeZonesList;
      this.listRegions.forEach((element) => {
        this.bucketList.push({
          label: element.region_name,
          value: element.region,
        });
      });
    },
    fetch_team_details() {
      var response = this.orgDetails;
      this.orgName = response.organization.organization_name;
      this.teamId = response.organization.organization_team_id;
      this.teamVisibility = response.organization.team_visibilty;
      this.weeklyOfs = this.get_weekly_Of(response.organization.week_off);
      this.address1 =
        response.organization.organization_address_1 == undefined
          ? ""
          : response.organization.organization_address_1;
      this.address2 =
        response.organization.organization_address_2 == undefined
          ? ""
          : response.organization.organization_address_1;
      this.gstNo =
        response.organization.organization_gst_number == undefined
          ? ""
          : response.organization.organization_gst_number;
      this.time = response.organization.working_timeings.start;
      this.time1 = response.organization.working_timeings.end;
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
    validate_data() {
      if (this.$refs.form.validate()) {
        this.emit_step1_data();
      }
    },
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

    async emit_step1_data() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              organization_name: this.orgName,
              team_visibilty: this.teamVisibility,
              organization_team_id: this.teamId,
              user_email_id: data.user.user_email_id,
              organization_gst_number: this.gstNo == "" ? "N/A" : this.gstNo,
              organization_address_1:
                this.address1 == "" ? undefined : this.address1,
              organization_address_2:
                this.address2 == "" ? undefined : this.address2,
              week_off: this.get_week_of(),
              working_timeings: this.get_work_timings(),
              is_default_repository:
                this.dataSeletion == "defaultRepository" ? true : false,
              aws_credentials:
                this.dataSeletion == "customRepository"
                  ? this.fetch_aws_data()
                  : undefined,
              default_timezone: this.timeZonesSelected,
              // bucket_folder_name: this.folderName,
              bucket_region:
                this.dataSeletion == "defaultRepository"
                  ? this.bucketRegion
                  : undefined,
            },
          })
        );

        this.loading = false;
        this.$emit("nextStep", 1);
        var response = JSON.parse(result.data.edit_organization);

        if (response.Status == "SUCCESS") {
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    fetch_aws_data() {
      var data = {};
      data = {
        access_key: this.accesKeyID,
        secret_key: this.secretKeyId,
        bucket_name: this.awsRegion,
      };
      return data;
    },
    get_value(val) {
      this.selectedWeeks.push(val);
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
  },
};
</script>
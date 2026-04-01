<template>
  <v-app
    id="inspire"
    :style="{
      'background-image':
        'url(' + require('@/assets/loginbackgroundimg.png') + ')',
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    }"
    style="background-size: cover"
  >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- <div style="height: 100vh; width: 100%" class="maindiv"> -->
    <v-container fluid class="fill-height">
      <!-- <v-row no-gutters   class="fill-height"> -->
      <!-- <v-col cols="6" > -->
      <!-- <v-img src="@/assets/signupBackground.png" class="mt-16"> </v-img> -->
      <!-- </v-col> -->
      <!-- <v-col cols="12" lg="6" md="6" sm="12" xl="6" xs="12" >
          <v-col cols="12" lg="10" md="12" sm="12" xl="6" xs="12">
            <v-card class="d-flex align-center justify-center" width="100%" height="auto"> -->
      <v-row align="center" justify="center">
        <v-col cols="6">
          <div
            class="d-flex align-center justify-center mx-auto"
            width="80%"
            height="auto"
          >
            <v-img
              max-width="180"
              max-height="60"
              :src="stichhLogo"
              @click="backtologin()"
            >
            </v-img>
          </div>
          <div
            class="d-flex align-center justify-center mx-auto mt-5"
            width="80%"
            height="auto"
          >
            <h1>Empowering Businesses</h1>
          </div>
          <div
            class="d-flex align-center justify-center mx-auto"
            width="80%"
            height="auto"
          >
            <h1>to Go Digital Seamlessly!</h1>
          </div>
        </v-col>
        <v-col cols="6">
          <v-card
            class="d-flex align-center justify-center mx-auto"
            width="80%"
            height="auto"
          >
            <v-container>
              <v-row>
                <v-col cols="12">
                  <div class="d-flex justify-center mt-3">
                    <h2>Sign Up</h2>

                    <!-- <v-img
                      max-width="180"
                      max-height="60"
                      src="@/assets/horizontal-logo.png"
                    >
                      <template #placeholder></template>
                    </v-img> -->
                  </div>
                  <div class="d-flex justify-center font-weight-medium mt-3">
                    Start your digital journey today!
                  </div>
                </v-col>
              </v-row>

              <v-form ref="form1" class="mt-4">
                <v-row dense class="pa-2">
                  <!-- Onboarding Type Selection -->
                  <!-- <v-col cols="12" lg="12" md="12" sm="12" xl="12" xs="12">
                    <div class="text-center mb-3">
                      <strong>Are you onboarding through self or through a partner?</strong>
                    </div>
                    <v-radio-group
                      v-model="onboardingType"
                      inline
                      class="justify-center"
                    >
                      <v-radio
                        label="Self Onboard"
                        value="self"
                        class="mr-4"
                      ></v-radio>
                      <v-radio
                        label="Partner Onboard"
                        value="partner"
                      ></v-radio>
                    </v-radio-group>
                  </v-col> -->

                  <!-- Partner Selection Dropdown -->
                  <!-- <v-col 
                    v-if="onboardingType === 'partner'" 
                    cols="12" 
                    lg="12" 
                    md="12" 
                    sm="12" 
                    xl="12" 
                    xs="12"
                  >
                    <v-autocomplete
                      label="Select Partner *"
                      v-model="selectedPartner"
                      :items="partners"
                      item-title="partner_name"
                      item-value="partner_id"
                      density="compact"
                      variant="outlined"
                      :rules="onboardingType === 'partner' ? [(v) => !!v || 'Partner selection is required'] : []"
                      :loading="loading"
                      :menu-props="{ contentClass: 'select-items' }"
                    >
                    </v-autocomplete>
                  </v-col> -->

                  <v-col cols="12" lg="12" md="12" sm="12" xl="12" xs="12">
                    <v-text-field
                      label="Organization Name *"
                      v-model="orgName"
                      :rules="rules"
                      density="compact"
                      variant="outlined"
                      validate-on-blur
                      maxlength="50"
                      class="mt-n2"
                      @update:model-value="validate_orgname"
                      @keydown.enter="validate_orgname"
                      @blur="validate_orgname"
                    >
                    </v-text-field>
                  </v-col>
                  <v-col
                    v-if="teamBtn == 0"
                    cols="12"
                    lg="12"
                    md="12"
                    sm="12"
                    xl="12"
                    xs="12"
                  >
                    <v-text-field
                      label="Organization Team ID*"
                      density="compact"
                      variant="outlined"
                      v-model="teamId"
                      maxlength="10"
                      @keydown.space.prevent="preventLeadingSpace"
                      v-on:keypress="isLetterOrNumber($event)"
                      @input="teamId = teamId.toUpperCase()"
                      class="mt-n3"
                      @blur="verify_team_id()"
                    >
                    </v-text-field>
                  </v-col>
                  <v-row
                    v-if="teamBtn == 1"
                    dense
                    justify="center"
                    align="center"
                  >
                    <v-col cols="12" lg="11" md="12" sm="12" xl="12" xs="12">
                      <v-text-field
                        label="Organization Team ID*"
                        density="compact"
                        variant="outlined"
                        v-model="teamId"
                        maxlength="10"
                        @keydown.space.prevent="preventLeadingSpace"
                        v-on:keypress="isLetterOrNumber($event)"
                        @input="teamId = teamId.toUpperCase()"
                        class="mt-n3 ml-1"
                        @blur="verify_team_id()"
                      >
                      </v-text-field>
                    </v-col>

                    <v-col
                      cols="12"
                      lg="1"
                      md="12"
                      sm="12"
                      xl="12"
                      xs="12"
                      class="mt-n2"
                    >
                      <v-tooltip
                        bottom
                        :color="teamBtn === 1 ? 'success' : 'error'"
                      >
                        <template #activator="{ on, attrs }">
                          <v-btn
                            icon
                            v-on="on"
                            :loading="btnLoding"
                            v-bind="attrs"
                            class="mt-n8"
                          >
                            <v-icon
                              large
                              :color="teamBtn === 1 ? 'success' : 'error'"
                            >
                              {{
                                teamBtn === 1
                                  ? "mdi-check-circle"
                                  : "mdi-close-circle"
                              }}
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>{{
                          teamBtn === 1 ? "Verified" : "Not Available"
                        }}</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                  <!-- <v-col cols="12" lg="12" md="12" sm="12" xl="12" xs="12">
                      <v-select
                        :items="membersCount"
                        label="No. of Members*"
                        dense
                        outlined
                        v-model="noOfMembers"
                        :menu-props="{ contentClass: 'select-items' }"
                        class="mt-n3"
                      ></v-select>
                    </v-col> -->
                  <v-col colss="12" lg="12" md="12" sm="12" xl="12" xs="12">
                    <div class="mt-n4 mb-1 text-center">
                      <Strong> Account Owner Details</Strong>
                    </div>
                  </v-col>
                  <v-col class="mt-n1" cols="12" lg="6" md="12" xl="12" xs="12">
                    <v-text-field
                      label="First Name *"
                      density="compact"
                      variant="outlined"
                      v-model="firstName"
                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-n1" cols="12" lg="6" md="12" xl="12" xs="12">
                    <v-text-field
                      label="Last Name "
                      density="compact"
                      variant="outlined"
                      class=""
                      v-model="lastName"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="12"
                    lg="6"
                    md="12"
                    xl="12"
                    xs="12"
                    class="mt-n1"
                  >
                    <v-text-field
                      label="Email ID *"
                      density="compact"
                      variant="outlined"
                      class="mt-n4"
                      @keydown.space.prevent="preventLeadingSpace"
                      v-model="userEmail"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="12"
                    lg="6"
                    md="12"
                    xl="12"
                    xs="12"
                    class="mt-n1"
                  >
                    <v-autocomplete
                      class="mt-n4"
                      v-model="countrySelected"
                      :menu-props="{ contentClass: 'select-items' }"
                      v-model:search-input="searchF"
                      label="Country"
                      :items="countriesData"
                      density="compact"
                      variant="outlined"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" lg="6" md="12" xl="12" xs="12">
                    <v-autocomplete
                      class="mt-n4"
                      label="Select"
                      v-model="userCCcode"
                      :items="countryCodes"
                      v-model:search-input="search"
                      @input="search = ''"
                      item-value="value"
                      item-title="label"
                      density="compact"
                      variant="outlined"
                      :menu-props="{ offsetY: true, maxHeight: 200 }"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" lg="6" md="12" xl="12" xs="12">
                    <v-text-field
                      label="Phone Number "
                      @keypress="is_number($event)"
                      v-on:paste="process($event)"
                      class="mt-n4"
                      maxlength="10"
                      density="compact"
                      variant="outlined"
                      v-model="phoneNumber"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <!-- <v-row>
                    <v-col cols="12">
                      <div class="text-left">
                        <h6>
                          <i>
                            Note: This Sign-up is strictly for onboarding a Team
                            and not for each member of the team. Members of the
                            team need to join from the Stichh mobile app on
                            invitation by the Team Owner/Admin
                          </i>
                        </h6>
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="text-left">
                        <div>
                          Already a user ?
                              <v-btn
                                x-small
                                text
                                color="#ef3f6e"
                                @click="backtologin()"
                                ><b><u>Back to Login</u></b></v-btn
                              >
                            </div>
                      </div>
                    </v-col>
                  </v-row> -->
              </v-form>
              <!-- <v-row justify="center">
                    <v-col cols="12" md="8" class="mt-3">
                      <v-btn
                        text
                        class="white--text cardCss ml-2 elevation-0 mb-0 text-capitalize"
                        outlined
                        dark
                        :loading="loading"
                        @click="validate_user()"
                      >
                        Confirm
                      </v-btn>
                    </v-col>
                  </v-row> -->
              <v-card-actions class="mt-n4 pa-1">
                <v-btn
                  text
                  size="small"
                  class="cardCss ml-1 elevation-0 mb-0 text-capitalize"
                  outlined
                  dark
                  :loading="loading3"
                  @click="backtologin()"
                >
                  Back
                </v-btn>
                <v-spacer />
                <v-btn
                  text
                  class="cardCss mr-1 elevation-0 mb-0 text-capitalize"
                  outlined
                  dark
                  size="small"
                  :loading="loading"
                  @click="validate_user()"
                >
                  Confirm
                </v-btn>
              </v-card-actions>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <!-- </div> -->
  </v-app>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import CountryList from "@/JsonFiles/CountryList.json";
import stichhLogo from "@/assets/StichhlogoHzblk.png";
// import { Auth } from "aws-amplify";

var axios = require("axios");
// var AWS = require("aws-sdk");

export default {
  components: {
    SnackBar,
    CountryList,
  },
  computed: {
    change_data: {
      get() {
        this.teamId =
          this.orgName.length > 6
            ? this.orgName.substring(0, 7).toUpperCase()
            : "";
      },
      set() {
        return (this.teamId = this.orgName.toUpperCase());
      },
    },
  },
  data() {
    return {
      userCCcode: "",
      btnLoding: false,
      loading3: false,
      rules: [],
      teamId: "",
      loading: false,
      phoneNumber: "",
      designationRoot: "",
      userEmail: "",
      lastName: "",
      firstName: "",
      noOfMembers: "",
      membersCount: ["1-99", "100-200", "200-300", "More than 300"],
      orgName: "",
      SnackBarComponent: {},
      teamBtn: 0,
      countryCodes: [],
      countriesData: [],
      countrySelected: "",
      searchF: "",
      currentCountryCode: null,
      currentTimeZone: null,
      search: "",
      stichhLogo,
      onboardingType: "self", // "self" or "partner"
      partners: [],
      selectedPartner: "",
    };
  },
  watch: {
    orgName(newVal) {
      if (newVal) {
        this.validate_orgname();
      }
    },
  },
  created() {
    this.countries();
    this.fetchPartners();
  },
  mounted() {
    const apiKey = "7dc7ae8d1cc54ab2ae3753110b2a7726";

    this.getTimezoneAndCountry(apiKey);
  },
  methods: {
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
    backtologin() {
      window.location.href = "https://www.stichh.com/";
    },
    getTimezoneAndCountry(apiKey) {
      const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;

          if (data) {
            // this.currentTimeZone = data.location.timezone;
            this.countrySelected = data.country.name;
            this.userCCcode = "+" + data.country.phone_code;

            this.getTimezone(
              apiKey,
              data.location.latitude,
              data.location.longitude
            );
          } else {
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
          } else {
          }
        })
        .catch((error) => {});
    },

    countries() {
      var countryccWithIso = [];
      var countryWithCc = [];
      this.countriesData = [];
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
    validate_orgname() {
      if (!this.orgName) {
        return;
      }
      var data = this.orgName.toUpperCase();
      // Get first 3 letters, or all letters if less than 3
      this.teamId = data.substring(0, Math.min(3, data.length));
      // this.setRules();
      // this.compute();
    },
    isLetterOrNumber(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[A-Za-z0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },
    get_value(val) {
      return val.toUpperCase();
    },
    handleVaalue() {},
    setRules() {
      this.rules = [(v) => !!v || /^([a-zA-Z])?[0-9]+$/.test(v) || "Required."];
    },
    compute() {
      try {
        this.orgName = this.orgName;
      } catch (e) {}
    },
    clear_rules() {
      this.rules = [];
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
    back_login() {
      this.$router.push("/");
    },
    preventLeadingSpace(e) {
      if (!e.target.value) e.preventDefault();
      else if (e.target.value[0] == " ")
        e.target.value = e.target.value.replace(/^\s*/, "");
    },
    async validate_data() {
      try {
        let data = await Auth.signIn("mohankumar@mobil80.com");
      } catch (err) {}
    },

    validate_user() {
      var valid = true;
      var emailPat =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (
        this.orgName == "" ||
        this.firstName == "" ||
        this.userEmail == "" ||
        this.teamId == ""
      ) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please Provide Details",
          timeout: 5000,
          Top: true,
        };
      } else if (this.userEmail != "" && !this.userEmail.match(emailPat)) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Invalid Email",
          timeout: 5000,
          Top: true,
        };
      } else if (this.teamBtn !== 1) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "Team ID is not verified. Please verify your Team ID first.",
          timeout: 5000,
          Top: true,
        };
      } else if (this.onboardingType === "partner" && !this.selectedPartner) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please select a partner",
          timeout: 5000,
          Top: true,
        };
      }
      if (valid) {
        this.loading = true;
        this.$store.commit("SetFirstSignup", false);
        this.create_user();
      }
    },

    async create_user() {
      axios({
        method: "POST",
        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/create_oragnization",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
        },
        data: {
          // no_of_employees: this.noOfMembers,
          user_email_id: this.userEmail,
          organization_name: this.orgName,
          first_name: this.firstName,
          last_name: this.lastName == "" ? undefined : this.lastName,
          user_contact_number:
            this.phoneNumber == "" ? undefined : this.phoneNumber,
          user_country_code:
            this.phoneNumber == "" ? undefined : this.userCCcode,
          organization_team_id: this.teamId,
          organization_country: this.countrySelected,
          partner_id: this.selectedPartner===""?undefined:this.selectedPartner,

          //   designation:
          //     this.designationRoot == "" ? undefined : this.designationRoot,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;
            // this.$root.$emit("Sign Up Mesage", "Signed Up");
            // this.$store.commit("SetFirstSignup", true);
            // this.$store.commit("SetUserEmail", this.userEmail);
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: res.data.Message,
              timeout: 5000,
              Top: true,
            };

            //www yourwebsite com/content/ocncontent?userid=43&contentid=
            // window.location.href = "https://www.stichh.com/portal/#/";
            setTimeout(() => {
              this.$router.push("/");
            }, 2000);

            // this.$router.push({
            //   name: "login",
            //   params: {
            //     otp: 1,
            //     email: this.userEmail,
            //   },
            // });
            this.clear_field();
          } else {
            this.loading = false;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: res.data.Message,
              timeout: 5000,
              Top: true,
            };
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },

    async verify_team_id() {
      this.btnLoding = true;
      await axios({
        method: "POST",
        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/check_organization_team_id",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
        },
        data: {
          organization_team_id: this.teamId,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            // this.SnackBarComponent = {
            //   SnackbarVmodel: true,
            //   SnackbarColor: "green",
            //   SnackbarText: res.data.Message,
            //   timeout: 5000,
            //   Top: true,
            // };
            this.btnLoding = false;
            this.teamBtn = 1;
          } else {
            this.btnLoding = false;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: res.data.Message,
              timeout: 5000,
              Top: true,
            };
          }
        })
        .catch((err) => {
          this.btnLoding = false;
        });
    },
    clear_field() {
      this.$refs.form1.reset();
    },

        async fetchPartners() {
      try {
        this.loading = true;
        const response = await axios({
          method: "POST",
          url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/list_partners",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
          },
          data: {
            command: "listPartners"
          }
        });
        
        if (response.data.Status === "SUCCESS") {
          // console.log("Partners data:", response.data);
          this.partners = response.data.data || [];
           let partner_id = this.partners.find(partner => partner.partner_email === "contactus@stichh.com");
           if(partner_id){
            this.selectedPartner = partner_id.partner_id;
      
          }
        } else {
          console.error("Failed to fetch partners:", response.data.Message);
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Failed to load partners",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error loading partners",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

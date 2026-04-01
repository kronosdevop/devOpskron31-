<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="dashboardedition" @update:model-value="$emit('update:dashboardedition', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Edit Details for
              {{ detailsdashboard.dashboard_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  maxlength="50"
                  label="Name"
                  :rules="[(v) => !!v || 'Required']"
                  :counter="50"
                  v-model="dashboard_name"
                />
                <v-textarea
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'Required']"
                  :counter="500"
                  maxlength="500"
                  auto-grow
                  rows="0"
                  label="Description"
                  v-model="description"
                />
              </v-col>
              <!-- <v-col :cols="dashboardVisbility == 'ALL_MEMBERS' ? 12 : 6">
                <div class="mt-n8"><b>Visible to </b></div>
                <v-radio-group
                  @change="clear_value()"
                  v-model="dashboardVisbility"
                  class=""
                  :rules="[(v) => !!v || 'required ']"
                  row
                >
                  <v-radio label="All Members" value="ALL_MEMBERS"></v-radio>
                  <v-radio
                    label="Restricted Users"
                    value="RESTRICTED_MEMBERS"
                  ></v-radio>
                </v-radio-group>
              </v-col> -->
              <!-- <v-col v-if="dashboardVisbility == 'RESTRICTED_MEMBERS'" cols="6">
                <v-autocomplete
                  dense
                  v-model="userDetails"
                  label="Select Users"
                  :menu-props="{ maxHeight: '200' }"
                  outlined
                  multiple
                  :items="visibilityUsers"
                  item-text="full_user_name"
                  item-value="user_id"
                  :search-input.sync="search"
                  @input="onuserinput"
                >
                </v-autocomplete>
              </v-col> -->

              <v-col cols="12">
                <v-text-field
                  v-model="idaccount"
                  v-show="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                  "
                  variant="outlined"
                  density="compact"
                  :rules="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Account ID"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="awsAccountName"
                  v-show="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                  "
                  variant="outlined"
                  density="compact"
                  :rules="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Account Name"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="screatkey"
                  variant="outlined"
                  density="compact"
                  v-show="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                  "
                  :rules="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Secret key"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="accesskey"
                  variant="outlined"
                  density="compact"
                  v-show="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                  "
                  :rules="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    detailsdashboard.dashboard_feed_type == 'AWS_COST'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Access key"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="clientid"
                  variant="outlined"
                  density="compact"
                  v-if="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                  "
                  :rules="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Client Id"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="clientscret"
                  variant="outlined"
                  density="compact"
                  v-if="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                  "
                  :rules="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Secret  key"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="subscription_id"
                  variant="outlined"
                  density="compact"
                  v-if="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                  "
                  :rules="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Subscription Id"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="tenant_id"
                  variant="outlined"
                  density="compact"
                  v-if="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                  "
                  :rules="
                    detailsdashboard.dashboard_feed_type == 'AZURE_COST' &&
                    detailsdashboard.dashboard_publish_type == 'FEED'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  label="Tenant Id"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="broadcastFrequency"
                  v-if="
                    detailsdashboard.dashboard_publish_type == 'FEED' &&
                    (detailsdashboard.dashboard_feed_type == 'AWS_COST' ||
                      detailsdashboard.dashboard_feed_type == 'AZURE_COST')
                  "
                  variant="outlined"
                  density="compact"
                  :items="['1', '2', '3', '4', '6', '8', '12', '24']"
                  label="Cost Update Frequency"
                />
              </v-col>
              <div v-if="broadcastFrequency != ''" class="mb-1">
                {{
                  broadcastFrequency == "1"
                    ? "1 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      ")"
                    : broadcastFrequency == "2"
                    ? "2 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      " and " +
                      convertToTimeZone("12:00") +
                      ")"
                    : broadcastFrequency == "3"
                    ? "3 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("08:00") +
                      " and " +
                      convertToTimeZone("16:00") +
                      ")"
                    : broadcastFrequency == "4"
                    ? "4 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("06:00") +
                      "," +
                      convertToTimeZone("12:00") +
                      " and " +
                      convertToTimeZone("18:00") +
                      ")"
                    : broadcastFrequency == "6"
                    ? "6 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("04:00") +
                      "," +
                      convertToTimeZone("08:00") +
                      "," +
                      convertToTimeZone("12:00") +
                      "," +
                      convertToTimeZone("16:00") +
                      " and " +
                      convertToTimeZone("20:00") +
                      ")"
                    : broadcastFrequency == "8"
                    ? "8 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("03:00") +
                      "," +
                      convertToTimeZone("06:00") +
                      "," +
                      convertToTimeZone("09:00") +
                      "," +
                      convertToTimeZone("12:00") +
                      "," +
                      convertToTimeZone("15:00") +
                      "," +
                      convertToTimeZone("18:00") +
                      " and " +
                      convertToTimeZone("21:00") +
                      ")"
                    : broadcastFrequency == "12"
                    ? "12 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("02:00") +
                      "," +
                      convertToTimeZone("04:00") +
                      "," +
                      convertToTimeZone("06:00") +
                      "," +
                      convertToTimeZone("08:00") +
                      "," +
                      convertToTimeZone("10:00") +
                      "," +
                      convertToTimeZone("12:00") +
                      "," +
                      convertToTimeZone("14:00") +
                      "," +
                      convertToTimeZone("16:00") +
                      "," +
                      convertToTimeZone("18:00") +
                      "," +
                      convertToTimeZone("20:00") +
                      " and " +
                      convertToTimeZone("22:00") +
                      ")"
                    : "24 time a day, the service cost is updated " +
                      "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("01:00") +
                      "," +
                      convertToTimeZone("02:00") +
                      "," +
                      convertToTimeZone("03:000") +
                      "," +
                      convertToTimeZone("04:00") +
                      "," +
                      convertToTimeZone("05:00") +
                      "," +
                      convertToTimeZone("06:00") +
                      "," +
                      convertToTimeZone("07:00") +
                      "," +
                      convertToTimeZone("08:00") +
                      "," +
                      convertToTimeZone("09:00") +
                      "," +
                      convertToTimeZone("10:00") +
                      "," +
                      convertToTimeZone("11:00") +
                      "," +
                      convertToTimeZone("12:00") +
                      "," +
                      convertToTimeZone("13:00") +
                      "," +
                      convertToTimeZone("14:00") +
                      "," +
                      convertToTimeZone("15:00") +
                      "," +
                      convertToTimeZone("16:00") +
                      "," +
                      convertToTimeZone("17:00") +
                      "," +
                      convertToTimeZone("18:00") +
                      "," +
                      convertToTimeZone("19:00") +
                      "," +
                      convertToTimeZone("20:00") +
                      "," +
                      convertToTimeZone("21:00") +
                      "," +
                      convertToTimeZone("22:00") +
                      " and " +
                      convertToTimeZone("23:00") +
                      ")"
                }}
              </div>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end mt-n8">
          <v-btn
            depressed
            :loading="loading"
            @click="edit_mutation()"
            dark
            class="cardCss"
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
import { edit_dashboard_details } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  mixins: [get_all_org_users],
  props: {
    dashboardedition: Boolean,
    detailsdashboard: Object,
  },
  data() {
    return {
      loading: false,
      dashboard_name: "",
      description: "",
      awsAccountName: "",
      dashboardVisbility: "ALL_MEMBERS",
      userDetails: [],
      visibilityUsers: [],
      search: "",
      visibilityobject: {},
      idaccount: "",
      screatkey: "",
      accesskey: "",
      clientid: "",
      clientscret: "",
      subscription_id: "",
      tenant_id: "",
      awscostobject: {},
      azureobject: {},
      broadcastFrequency: "",
    };
  },
  watch: {
    dashboardedition: {
      async handler() {
        if (this.dashboardedition == true) {
          this.$store.commit("Setnamesearch", "");
          this.broadcastFrequency = "";
          await this.get_all_org_users();
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    convertToTimeZone(time) {
      let [hours, minutes] = time.split(":");
      let date = new Date();
      date.setUTCHours(parseInt(hours));
      date.setUTCMinutes(parseInt(minutes));
      let options = {
        // timeZone: "Asia/Kolkata",
        timeZone:
          this.$store.getters.GetOrgDetails.organization.default_timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // 24-hour format
      };

      return new Intl.DateTimeFormat("en-US", options).format(date);
    },
    onuserinput(value) {
      if (!value.includes(this.$store.getters.GetUserObj.user?.user_id)) {
        value.push(this.$store.getters.GetUserObj.user?.user_id);
      }
      this.userDetails = value;
      this.search = "";
    },
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.visibilityUsers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.dashboard_name = this.detailsdashboard.dashboard_name;
      this.description = this.detailsdashboard.dashboard_description;
      this.dashboardVisbility =
        this.detailsdashboard.dashboard_visibility.visible_type;
      this.userDetails =
        this.detailsdashboard.dashboard_visibility.visible_members;
      // this.userDetails = this.userDetails.filter(
      //   (id) => id !== this.$store.getters.GetUserObj.user?.user_id
      // );
      if (this.detailsdashboard != undefined) {
        const acc = this.detailsdashboard.dashboard_account_details || {};
        this.accesskey = acc.accesskey || "";
        this.idaccount = acc.account_id || "";
        this.screatkey = acc.secretkey || "";
        this.awsAccountName = acc.account_name || "";
        this.broadcastFrequency = (this.detailsdashboard.dashboard_publish_frequency || "").toString();
      }
    },
    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.dashboardVisbility == "ALL_MEMBERS") {
        this.userDetails = [];
      } else {
        this.userDetails = [];
        this.orgUsers.forEach((element) => {
          // if (element.user_id != data.user.user_id) {
          if (element.user_status == "ACTIVE") {
            this.visibilityUsers.push({
              full_user_name: element.full_user_name,
              user_id: element.user_id,
            });
          }
          // }
        });
        this.userDetails.push(this.$store.getters.GetUserObj.user?.user_id);
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
   async edit_mutation() {
    const {valid} = await this.$refs.form.validate();
      if (valid) {
        // if (this.dashboardVisbility == "RESTRICTED_MEMBERS") {
        //   const userId = this.$store.getters.GetUserObj.user?.user_id;
        //   if (!this.userDetails.includes(userId)) {
        //     this.userDetails.push(userId);
        //   }
        // }
        (this.visibilityobject = {
          visible_type: this.dashboardVisbility,
          visible_members: this.userDetails,
        }),
          (this.awscostobject = {
            account_id: this.idaccount,
            accesskey: this.accesskey,
            account_name: this.awsAccountName,
            secretkey: this.screatkey,
          });
        this.azureobject = {
          client_id: this.clientid,
          client_secrect: this.clientscret,
          subscription_id: this.subscription_id,
          tenant_id: this.tenant_id,
        };
        this.edit_dashboard();
      }
    },

    async edit_dashboard() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_dashboard_details, {
            input: {
              organization_id: data.organization.organization_id,
              dashboard_id: this.detailsdashboard.dashboard_id,
              dashboard_description: this.description,
              dashboard_name: this.dashboard_name,
              dashboard_visibility: this.visibilityobject,
              dashboard_account_details:
                this.detailsdashboard.dashboard_publish_type == "FEED"
                  ? this.detailsdashboard.dashboard_feed_type == "AWS_COST"
                    ? JSON.stringify(this.awscostobject)
                    : JSON.stringify(this.azureobject)
                  : undefined,
              broadcast_frequency:
                this.detailsdashboard.dashboard_publish_type == "FEED"
                  ? parseInt(this.broadcastFrequency)
                  : undefined,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_dashboard_details);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
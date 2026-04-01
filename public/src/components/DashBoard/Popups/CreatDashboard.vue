<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="dashboardCreation"
    @update:model-value="$emit('update:dashboardCreation', $event)"
    persistent
    max-width="950"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">Create Dashboard</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row no-gutters>
            <v-col cols="6">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    density="compact"
                    @input="get_dashboard_name(dashboard_name)"
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
                <v-col cols="12">
                  <div class=""><b>Visible to </b></div>
                  <v-radio-group
                    @change="clear_value()"
                    v-model="dashboardVisbility"
                    density="compact"
                    :rules="[(v) => !!v || 'required ']"
                    inline
                    :disabled="checkbit"
                  >
                    <v-radio label="All Members" value="ALL_MEMBERS"></v-radio>
                    <v-radio
                      label="Restricted Users"
                      value="RESTRICTED_MEMBERS"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col
                  v-if="dashboardVisbility == 'RESTRICTED_MEMBERS'"
                  cols="12"
                >
                  <v-autocomplete
                    density="compact"
                    v-model="userDetails"
                    label="Select Users"
                    :menu-props="{ maxHeight: '200' }"
                    variant="outlined"
                    multiple
                    :items="visibilityUsers"
                    item-title="full_user_name"
                    item-value="user_id"
                    v-model:search="search"
                
                    @update:model-value="onuserinput"
                  >
                  </v-autocomplete>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row no-gutters class="ml-5">
                <v-col cols="12">
                  <div class=""><b>Dashboard Type </b></div>
                  <v-radio-group
                    v-model="dashboardtype"
                    density="compact"
                    :rules="[(v) => !!v || 'required ']"
                    inline
                  >
                    <v-radio
                      label="Textboard (Text Only, last message only displayed)"
                      value="TEXT"
                    ></v-radio>
                    <v-radio
                      class="mt-2"
                      label="Dashboard (With sections, ideal for business metrics, microsites etc)"
                      value="DASHBOARD"
                    ></v-radio>
                    <v-radio
                      class="mt-2"
                      label="Feed (Deploy Feed Content )"
                      value="FEED"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12">
                  <v-select
                    variant="outlined"
                    :items="feedItems"
                    item-title="name"
                    v-if="dashboardtype == 'FEED'"
                    item-value="value"
                    density="compact"
                    label="Feed Type"
                    v-model="feedType"
                    :rules="dashboardtype == 'FEED' ? [(v) => !!v || 'Feed Type is required'] : []"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="idaccount"
                    v-if="feedType == 'AWS_COST' && dashboardtype == 'FEED'"
                    variant="outlined"
                    rows="0"
                    density="compact"
                    :rules="feedType == 'AWS_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Account ID is required'] : []"
                    label="Account ID"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="awsAccountName"
                    v-if="feedType == 'AWS_COST' && dashboardtype == 'FEED'"
                    variant="outlined"
                    rows="0"
                    density="compact"
                    :rules="feedType == 'AWS_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Account Name is required'] : []"
                    label="Account Name"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="screatkey"
                    variant="outlined"
                    v-if="feedType == 'AWS_COST' && dashboardtype == 'FEED'"
                    density="compact"
                    rows="0"
                    :rules="feedType == 'AWS_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Secret key is required'] : []"
                    label="Secret key"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="accesskey"
                    variant="outlined"
                    rows="0"
                    v-if="feedType == 'AWS_COST' && dashboardtype == 'FEED'"
                    density="compact"
                    :rules="feedType == 'AWS_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Access key is required'] : []"
                    label="Access key"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="clientid"
                    variant="outlined"
                    v-if="feedType == 'AZURE_COST' && dashboardtype == 'FEED'"
                    density="compact"
                    :rules="feedType == 'AZURE_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Client Id is required'] : []"
                    label="Client Id"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="clientscret"
                    variant="outlined"
                    rows="0"
                    v-if="feedType == 'AZURE_COST' && dashboardtype == 'FEED'"
                    density="compact"
                    :rules="feedType == 'AZURE_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Secret key is required'] : []"
                    label="Secret key"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="subscription_id"
                    variant="outlined"
                    v-if="feedType == 'AZURE_COST' && dashboardtype == 'FEED'"
                    density="compact"
                    :rules="feedType == 'AZURE_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Subscription Id is required'] : []"
                    label="Subscription Id"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="tenant_id"
                    variant="outlined"
                    v-if="feedType == 'AZURE_COST' && dashboardtype == 'FEED'"
                    density="compact"
                    :rules="feedType == 'AZURE_COST' && dashboardtype == 'FEED' ? [(v) => !!v || 'Tenant Id is required'] : []"
                    label="Tenant Id"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="accountEmailId"
                    variant="outlined"
                    rows="0"
                    v-if="
                      dashboardtype == 'FEED' &&
                      (feedType == 'AZURE_COST' || feedType == 'AWS_COST')
                    "
                    density="compact"
                    :rules="dashboardtype == 'FEED' && (feedType == 'AZURE_COST' || feedType == 'AWS_COST') ? [(v) => !!v || 'Account Email ID is required'] : []"
                    label="Account Email-ID"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="broadcastFrequency"
                    v-if="
                      dashboardtype == 'FEED' &&
                      (feedType == 'AZURE_COST' || feedType == 'AWS_COST')
                    "
                    density="compact"
                    variant="outlined"
                    :items="['1', '2', '3', '4', '6', '8', '12', '24']"
                    label="Cost Update Frequency"
                    :rules="dashboardtype == 'FEED' && (feedType == 'AZURE_COST' || feedType == 'AWS_COST') ? [(v) => !!v || 'Cost Update Frequency is required'] : []"
                  />
                </v-col>
                <div v-if="broadcastFrequency != ''">
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
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          variant="flat"
          :loading="loading"
          @click="create_dashboard()"
          dark
          class="cardCss button-corner text-capitalize"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
    
    <script>
/* eslint-disable */
import { createDashboard_v1 } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  mixins: [get_all_org_users],
  props: {
    dashboardCreation: Boolean,
  },
  data() {
    return {
      loading: false,
      checkbit:true,
      dashboard_name: "",
      dashboardtype: "",
      subscription_id: "",
      userDetails: [],
      visibilityUsers: [],
      search: "",
      feedType: "",
      screatkey: "",
      idaccount: "",
      clientid: "",
      clientscret: "",
      awsAccountName: "",
      accesskey: "",
      dashboardVisbility: "ALL_MEMBERS",
      tenant_id: "",
      awscostobject: {},
      azureobject: {},
      visibilityobject: {},
      description: "",
      feedItems: [
        { name: "AWS Cost Monitor", value: "AWS_COST" },
        { name: "Azure Cost Monitor", value: "AZURE_COST" },
      ],
      broadcastFrequency: "",
      accountEmailId: "",
    };
  },
  watch: {
    dashboardCreation: {
      async handler() {
        if (this.dashboardCreation == true) {
          this.$store.commit("Setnamesearch", "");
          this.dashboardtype = null;
          this.broadcastFrequency = "";
          this.dashboardVisbility = "ALL_MEMBERS";
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
    get_dashboard_name(value) {
      this.description = value;
    },
    fetch_details() {
      this.checkbit=false;
      this.orgUsers.forEach((element) => {
        if (
          element.user_status == "ACTIVE" &&
          this.$store.getters.GetUserObj.user?.user_id != element.user_id
        ) {
          this.visibilityUsers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.dashboardVisbility == "ALL_MEMBERS") {
        this.userDetails = [];
      } else {
        this.userDetails = [];
        this.visibilityUsers = [];
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
      this.broadcastFrequency = "";
      this.$refs.form.reset();
      this.$refs.form.resetValidation();

      this.$emit("clicked", 0);
    },

    async create_dashboard() {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        this.awscostobject = {
          account_id: this.idaccount,
          accesskey: this.accesskey,
          account_name: this.awsAccountName,
          secretkey: this.screatkey,
        };
        this.azureobject = {
          client_id: this.clientid,
          client_secrect: this.clientscret,
          subscription_id: this.subscription_id,
          tenant_id: this.tenant_id,
        };
        // if (this.dashboardVisbility == "RESTRICTED_MEMBERS") {
        //   this.userDetails.push(this.$store.getters.GetUserObj.user?.user_id);
        // }
        (this.visibilityobject = {
          visible_type: this.dashboardVisbility,
          visible_members: this.userDetails,
        }),
          // console.log(this.visibilityobject, " this.visibilityobject");
          this.Createdash_board();
      }
    },

    async Createdash_board() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(createDashboard_v1, {
            input: {
              organization_id: data.organization.organization_id,
              dashboard_name: this.dashboard_name,
              user_email_id: data.user.user_email_id,
              dashboard_visibility: this.visibilityobject,
              dashboard_description: this.description,
              dashboard_publish_type: this.dashboardtype,
              dashboard_feed_type:
                this.dashboardtype == "FEED" ? this.feedType : undefined,
              dashboard_account_details:
                this.dashboardtype == "FEED"
                  ? this.feedType == "AWS_COST"
                    ? JSON.stringify(this.awscostobject)
                    : JSON.stringify(this.azureobject)
                  : undefined,
              broadcast_frequency:
                this.dashboardtype == "FEED"
                  ? parseInt(this.broadcastFrequency)
                  : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.createDashboard_v1);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "data");
          this.broadcastFrequency = "";
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
    
    <style>
</style>
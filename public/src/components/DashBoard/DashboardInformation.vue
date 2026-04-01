<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <v-card flat class="mt-2"  outlined>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <div class="primary--text">
              <b>Dashboard Details</b>
              <v-icon
                v-show="
                  $store.getters.GetdashboardDetails.dashboard_created_by ==
                    $store.getters.GetUserObj.user?.user_email_id &&
                  $store.getters.GetdashboardDetails.dashboard_type !=
                    'STANDARD'
                "
                class="ml-4 mt-n2"
                color="primary"
                @click="edit_dashboard_details()"
                >mdi-pencil</v-icon
              >
            </div>
            <v-divider class="mt-2" />
            <v-col cols="12">
              <div>
                <b>Dashboard Name</b> :
                {{ dashboardName }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Dashboard Description </b> :
                {{ dashboardDescription }}
              </div>
            </v-col>
            <v-col cols="12" v-show="dashboardfeeedtype != ''">
              <div>
                <b>Feed Type </b> :
                {{
                  dashboardfeeedtype == "AWS_COST"
                    ? "Aws Cost"
                    : dashboardfeeedtype == "AZURE_COST"
                    ? "Azure Cost"
                    : ""
                }}
              </div>
            </v-col>
            <v-col cols="12" v-show="dashboard_frequency != ''">
              <div>
                <b>Cost Update Frequency </b> : {{ dashboard_frequency }}
                {{
                  dashboard_frequency == "1"
                    ? "(" + convertToTimeZone("00:00") + ")"
                    : dashboard_frequency == "2"
                    ? "(" +
                      convertToTimeZone("00:00") +
                      " and " +
                      convertToTimeZone("12:00") +
                      ")"
                    : dashboard_frequency == "3"
                    ? "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("08:00") +
                      " and " +
                      convertToTimeZone("16:00") +
                      ")"
                    : dashboard_frequency == "4"
                    ? "(" +
                      convertToTimeZone("00:00") +
                      "," +
                      convertToTimeZone("06:00") +
                      "," +
                      convertToTimeZone("12:00") +
                      " and " +
                      convertToTimeZone("18:00") +
                      ")"
                    : dashboard_frequency == "6"
                    ? "(" +
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
                    : dashboard_frequency == "8"
                    ? "(" +
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
                    : dashboard_frequency == "12"
                    ? "(" +
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
                    : "(" +
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
            </v-col>
            <v-col cols="12" v-show="feedAccountname != ''">
              <div>
                <b>Account Name </b> :
                {{ feedAccountname }}
              </div>
            </v-col>
            <v-col cols="12" v-show="feedAccountid != ''">
              <div>
                <b>Account ID </b> :
                {{ feedAccountid }}
              </div>
            </v-col>
            <v-col cols="12" v-show="feedAccountemailid != ''">
              <div>
                <b>Account Email-ID </b> :
                {{ feedAccountemailid }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>#Subscribers </b> :
                {{ dashboardsubcount }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Visibility </b> :
                {{ dashboardvisibility }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Created By </b> :
                {{ dashboardcreatedby }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Created On </b> :
                {{ fetch_value(dashboardcreatedon) }}
              </div>
            </v-col>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <EditDashboarddetails
        :dashboardedition="dashboardedition"
        @clicked="dashboardedition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :detailsdashboard="detailsdashboard"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import OverlayComp from "@/components/OverlayComp.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import EditDashboarddetails from "@/components/DashBoard/Popups/EditDashboarddetails.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { get_particular_dashboard } from "@/graphql/queries.js";
export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
    EditDashboarddetails,
    OverlayComp,
  },
  data() {
    return {
      SnackBarComponent: {},
      componentCheck: 0,
      dashboardName: "",
      dashboardDescription: "",
      dashboardfeeedtype: "",
      dashboard_frequency: "",
      dashboardsubcount: "",
      dashboardvisibility: "",
      dashboardcreatedon: "",
      dashboardcreatedby: "",
      feedAccountid: "",
      feedAccountemailid: "",
      feedAccountname: "",
      allUsers: [],
      dashboardedition: false,
      overlay: false,
      detailsdashboard: {},
    };
  },
  async mounted() {
    this.overlay = true;
    await this.get_all_org_users();
    this.allUsers = this.orgUsers;
    await this.get_dashboard_details();
    this.overlay = false;
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
    async get_dashboard_details() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_dashboard, {
            input: {
              dashboard_id:
                this.$store.getters.GetdashboardDetails.dashboard_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_dashboard);
        this.tableLoading = false;
        if (response.Status == "SUCCESS" && response.data && response.data.length > 0) {
          var data = response.data[0];
          this.detailsdashboard = response.data[0];
          this.dashboardName = data.dashboard_name || "";
          this.dashboardDescription = data.dashboard_description || "";
          this.dashboardsubcount = data.subscribe_counts || 0;
          
          // Safe handling of dashboard_visibility
          try {
            this.dashboardvisibility =
              data.dashboard_visibility && data.dashboard_visibility.visible_type == "RESTRICTED_MEMBERS"
                ? "Restricted Users" +
                  " " +
                  "(" +
                  this.fetch_names(data.dashboard_visibility.visible_members || []) +
                  ")"
                : "All Members";
          } catch (error) {
            console.warn("Error processing dashboard visibility:", error);
            this.dashboardvisibility = "All Members";
          }
          
          this.dashboardcreatedon = data.dashboard_created_on || "";
          this.dashboardcreatedby = data.dashboard_created_by || "";
          this.dashboardfeeedtype =
            data.dashboard_feed_type == undefined
              ? ""
              : data.dashboard_feed_type;
          this.dashboard_frequency =
            data.dashboard_publish_frequency == undefined
              ? ""
              : data.dashboard_publish_frequency;
          this.feedAccountid =
            data.dashboard_account_details == undefined
              ? ""
              : data.dashboard_account_details.account_id;
          this.feedAccountemailid =
            data.dashboard_account_details == undefined
              ? ""
              : data.dashboard_account_details.account_email_id;
          this.feedAccountname =
            data.dashboard_account_details == undefined
              ? ""
              : data.dashboard_account_details.account_name;

          this.$store.commit("SetdashboardDetails", data);
        } else {
          console.warn("No dashboard data available");
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "orange",
            SnackbarText: "No dashboard data available",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.log(error);
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    fetch_value(val) {
      return format_Date(val);
    },
    fetch_names(ids) {
      var names = [];
      if (!ids || !Array.isArray(ids)) {
        return names;
      }
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        for (var j = 0; j < this.allUsers.length; j++) {
          if (this.allUsers[j].user_id === id) {
            names.push(this.allUsers[j].full_user_name);
            break; // Break the inner loop once match is found
          }
        }
      }
      return names;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.dashboardedition = false;
      this.get_dashboard_details();
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
    edit_dashboard_details() {
      this.componentCheck = 1;
      this.dashboardedition = true;
    },
  },
};
</script>

<style>
</style>
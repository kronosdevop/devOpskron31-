<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!--Toolbar-->
    <v-toolbar color="transparent" class="mt-n5">
      <v-toolbar-title
        ><v-icon color="primary" class="mr-1">mdi-cog</v-icon
        >Settings</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-btn
        class="text-capitalize ml-4 mt-3 mr-5 cardCss text-white"
        @click="validate_user()"
        :loading="loading"
        dark
        >Save</v-btn
      >
    </v-toolbar>

    <!--Card Container-->
    <v-container class="pl-4 pr-4 mt-n4">
      <v-card
        variant="solo"
        rounded="lg"
        style="overflow-y: auto"
        class="mt-n3"
        :height="CommonVuetifyObj.height - 195"
      >
        <v-card-text>
          <div class="font-weight-bold">
            Configure different color codes for different Attendance duration
          </div>
          <v-row class="mt-1">
            <!-- Configure different color-->
            <v-col cols="6">
              <v-card
                variant="solo"
                elevation="6"
                rounded="lg"
                class="pa-2"
                height="62vh"
              >
                <v-form ref="form">
                  <v-row>
                    <v-col cols="3">
                      <v-select
                        style="max-width: 200px"
                        density="compact"
                        variant="outlined"
                        class="ml-4 mt-2"
                        label="From Hr"
                        v-model="from_hr"
                        @change="setduration"
                        :items="hoursItems"
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-select
                        style="max-width: 200px"
                        density="compact"
                        variant="outlined"
                        class="ml-4 mt-2"
                        label="To Hr"
                        v-model="to_hr"
                        :rules="[
                          (v) =>
                            v !== null && v !== undefined && v !== ''
                              ? true
                              : 'Required',
                        ]"
                        :items="validToHrsItems"
                      />
                    </v-col>
                    <v-col cols="1">
                      <v-btn
                        class="mx-2 mt-2"
                        fab
                        @click="colordailog()"
                        height="40"
                        color="primary"
                        ><v-icon color="white">mdi-palette</v-icon></v-btn
                      >
                    </v-col>
                    <v-col cols="2">
                      <v-btn
                        @click="add_action()"
                        class="elevation-0 ml-8 mt-2 cardCss"
                        height="40"
                      >
                        <v-icon color="white" dark> mdi-plus </v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
                <v-card-text elevation="0">
                  <v-data-table
                    :height="CommonVuetifyObj.height - 380"
                    :fixed-header="fixed"
                    :headers="headers"
                    :items="tableData"
                    :loading="tableLoading"
                    :items-per-page-options="[10, 20]"
                    :items-per-page="20"
                    :sort-by="['from_duration']"
                    density="compact"
                    class="mt-n5 dtwidth"
                    hide-default-footer
                  >
                    <template v-slot:[`item.color_code`]="{ item }">
                      <v-progress-linear
                        :color="item.color_code"
                        :input="true"
                        height="22"
                        style="width: 150px"
                      >
                      </v-progress-linear>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                      <v-icon
                        size="small"
                        @click="delet_leave(item)"
                        color="red"
                        >mdi-delete</v-icon
                      >
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>

            <!--Attendance Report Configuration && Holiday Setting-->
            <v-col cols="6">
              <!--Attendance Report Configuration-->
              <div class="font-weight-bold mt-n9">
                Attendance Report Configuration
              </div>
              <v-card elevation="6" rounded="lg" height="35vh" class="mt-4">
                <v-toolbar density="compact" color="transparent">
                  <div class="font-weight-bold ml-3">Report Settings</div>
                  <v-spacer></v-spacer>

                  <!--Daily and Monthly Time Pickers-->
                  <!--Daily-->
                  <div v-if="dailyReport">
                    <v-menu
                      v-model="dailyTimeMenu"
                      :close-on-content-click="false"
                    >
                      <template #activator="{ props }">
                        <v-text-field
                          v-bind="props"
                          v-model="formattedEnteredDailyTime"
                          variant="outlined"
                          density="compact"
                          rounded="lg"
                          label="Daily Time..."
                          width="200px"
                          class="mr-2 mt-7"
                          prepend-inner-icon="mdi-clock-outline"
                          clearable
                          @click:clear="clearDailyTime"
                        />
                      </template>
                      <v-time-picker v-model="enteredDailyTime" format="24hr">
                        <template #actions>
                          <v-btn
                            color="primary"
                            flat
                            @click="dailyTimeMenu = false"
                            >Close</v-btn
                          >
                        </template>
                      </v-time-picker>
                    </v-menu>
                  </div>

                  <!--Monthly-->
                  <div v-else>
                    <v-menu
                      v-model="monthlyTimeMenu"
                      :close-on-content-click="false"
                    >
                      <template #activator="{ props }">
                        <v-text-field
                          v-bind="props"
                          v-model="formattedEnteredMonthlyTime"
                          variant="outlined"
                          density="compact"
                          rounded="lg"
                          label="Monthly Time..."
                          width="200px"
                          class="mr-2 mt-7"
                          prepend-inner-icon="mdi-clock-outline"
                          @click:clear="clearMonthlyTime"
                        />
                      </template>
                      <v-time-picker v-model="enteredMonthlyTime" format="24hr">
                        <template #actions>
                          <v-btn
                            color="primary"
                            flat
                            @click="monthlyTimeMenu = false"
                            >Close</v-btn
                          >
                        </template>
                      </v-time-picker>
                    </v-menu>
                  </div>
                </v-toolbar>
                <v-row>
                  <v-col cols="12">
                    <v-radio-group
                      v-model="reportType"
                      inline
                      color="primary"
                      class="ml-4"
                    >
                      <v-radio label="Daily Report" value="daily" />
                      <v-radio label="Monthly Report" value="monthly" />
                    </v-radio-group>
                  </v-col>

                  <!--Report Members-->
                  <v-col cols="12" class="mt-n8">
                    <div v-if="reportType === 'daily'">
                      <div class="font-weight-bold ml-5">
                        Daily Report Members
                      </div>
                      <v-combobox
                        v-model="daily_report_members_array"
                        :items="userList"
                        :loading="loading"
                        variant="outlined"
                        rounded="lg"
                        class="pa-5 mt-n2 combobox-fixed"
                        multiple
                        chips
                        closable-chips
                        hide-details
                      >
                        <template #no-data>
                          <div class="pa-2 text-grey">
                            No matching users found
                          </div>
                        </template>
                      </v-combobox>
                    </div>

                    <div v-else>
                      <div class="font-weight-bold ml-5">
                        Monthly Report Members
                      </div>
                      <v-combobox
                        v-model="monthly_report_members_array"
                        :items="userList"
                        :loading="loading"
                        :menu-props="{ maxHeight: '300px' }"
                        variant="outlined"
                        rounded="lg"
                        class="pa-5 mt-n2 combobox-fixed"
                        multiple
                        chips
                        closable-chips
                        hide-details
                      >
                        <template #no-data>
                          <div class="pa-2 text-grey">
                            No matching users found
                          </div>
                        </template>
                      </v-combobox>
                    </div>
                  </v-col>
                </v-row>
              </v-card>

              <!--Holiday Settings-->
              <div class="font-weight-bold ml-1 mt-4">Holiday Setting</div>
              <v-card elevation="6" class="mt-3 pa-2" rounded="lg" height="7vh">
                <v-radio-group
                  v-model="location_holiday"
                  inline
                  color="primary"
                  class="ml-3"
                >
                  <v-radio
                    label="Default holiday list"
                    value="defaultholiday"
                  ></v-radio>
                  <v-radio
                    label="Holiday list based on location"
                    value="locationholiday"
                  ></v-radio>
                </v-radio-group>
              </v-card>

              <!--Scan Settings-->
              <div class="font-weight-bold mt-4">Scan Setting</div>
              <v-card elevation="6" class="mt-3" rounded="lg" height="7vh">
                <v-row class="pa-4">
                  <v-switch
                    v-model="faceScan"
                    :label="
                      faceScan ? 'Face Scan Enabled' : 'Face Scan Disabled'
                    "
                    class="ml-4"
                    color="primary"
                    @change="toggleSwitch('face')"
                  ></v-switch>
                  <v-switch
                    v-model="doorScan"
                    :label="
                      doorScan ? 'Door Scan Enabled' : 'Door Scan Disabled'
                    "
                    class="ml-10 mt-n1"
                    color="primary"
                    @change="toggleSwitch('door')"
                  ></v-switch>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!--Color Picker-->
    <v-dialog
      v-model="colorpopup"
      transition="dialog-bottom-transition"
      persistent
      max-width="400"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Color Picker</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-color-picker
            class="mt-2"
            v-model="color"
            hide-inputs
            mode="hexa"
          ></v-color-picker>

          <span>Color:{{ color }}</span>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { useDisplay } from "vuetify/lib/framework.mjs";
import { GetAllDailyReportMembers } from "@/mixins/GetAllDailyReportMembers";
import { GetAllListMonthlyReportMembers } from "@/mixins/GetAllListMonthlyReportMembers";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { edit_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "@/components/SnackBar.vue";

export default {
  mixins: [
    get_Org_details,
    GetAllDailyReportMembers,
    GetAllListMonthlyReportMembers,
    get_all_org_users,
  ],

  components: {
    SnackBar,
  },

  data() {
    return {
      reportType: "daily",
      daily_report_members_array: [],
      monthly_report_members_array: [],
      scanTolerance: "",
      color: "#191A1BFF",

      height: 0,
      from_hr: 0,
      to_hr: 0,

      location_holiday: null,

      loading: false,
      colorpopup: false,
      tableLoading: false,
      dailyReport: true,
      monthlyReport: false,
      faceScan: true,
      doorScan: false,
      fixed: true,
      dailyTimeMenu: false,
      monthlyTimeMenu: false,

      SnackBarComponent: {},
      CommonVuetifyObj: {},

      hoursItems: Array.from({ length: 25 }, (_, i) => i),
      enteredDailyTime: "",
      enteredMonthlyTime: "",

      tableData: [],
      itemsData: [],
      ListAllDailyReportMembers: [],
      ListAllListMonthlyReportMembers: [],
      fromhrsitems: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ],
      tohrsitems: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ],
      headers: [
        {
          title: "From Hr",
          key: "from_duration",
          sortable: false,
        },
        {
          title: "To Hr",
          key: "to_duration",
          sortable: false,
        },
        {
          title: "Color",
          key: "color_code",
          sortable: false,
        },
        { title: "Action", key: "actions", sortable: false },
      ],
    };
  },

  watch: {
    reportType(type) {
      const orgId =
        this.$store.getters.GetOrgDetails.organization.organization_id;

      if (type === "daily") {
        this.dailyReport = true;
        this.monthlyReport = false;

        this.GetAllDailyReportMembersMethod().then(() => {
          const match = this.ListAllDailyReportMembers.find(
            (item) => item.organization_id === orgId,
          );
          this.daily_report_members_array =
            match?.daily_report_receiver_group || [];
        });
      } else {
        this.dailyReport = false;
        this.monthlyReport = true;

        this.GetAllListMonthlyReportMembersMethod().then(() => {
          const match = this.ListAllListMonthlyReportMembers.find(
            (item) => item.organization_id === orgId,
          );
          this.monthly_report_members_array =
            match?.monthly_report_receiver_group || [];
        });
      }
    },
  },

  computed: {
    validToHrsItems() {
      if (this.from_hr !== null) {
        return this.hoursItems.filter((hour) => hour >= this.from_hr);
      } else {
        return this.hoursItems;
      }
    },
    userList() {
      return this.orgUsers
        .filter((user) => user.user_status === "ACTIVE")
        .sort((a, b) => a.user_email_id.localeCompare(b.user_email_id))
        .map((user) => ({
          title: user.user_email_id,
          value: user.user_email_id,
        }));
    },
    formattedEnteredDailyTime() {
      if (!this.enteredDailyTime) return "";
      const [h, m] = this.enteredDailyTime.split(":");
      return new Date(0, 0, 0, h, m).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formattedEnteredMonthlyTime() {
      if (!this.enteredMonthlyTime) return "";
      const [h, m] = this.enteredMonthlyTime.split(":");
      return new Date(0, 0, 0, h, m).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },

  async mounted() {
    this.CommonVuetifyObj = useDisplay();

    await this.GetAllDailyReportMembersMethod();
    await this.GetAllListMonthlyReportMembersMethod();
    await this.get_all_org_users();

    const orgId =
      this.$store.getters.GetOrgDetails.organization.organization_id;

    const dailyConfig = this.ListAllDailyReportMembers.find(
      (item) => item.organization_id === orgId,
    );

    const monthlyConfig = this.ListAllListMonthlyReportMembers.find(
      (item) => item.organization_id === orgId,
    );

    this.daily_report_members_array =
      dailyConfig?.daily_report_receiver_group || [];

    this.monthly_report_members_array =
      monthlyConfig?.monthly_report_receiver_group || [];

    this.enteredDailyTime = dailyConfig?.daily_tigger_timings
      ? this.convertTo24Hour(dailyConfig.daily_tigger_timings)
      : "";

    this.enteredMonthlyTime = monthlyConfig?.monthly_tigger_timings
      ? this.convertTo24Hour(monthlyConfig.monthly_tigger_timings)
      : "";
  },

  async created() {
    this.height = window.innerHeight - 390;
    await this.get_Org_details();
    this.location_holiday = "defaultholiday";
    var response = this.orgDetails;
    var data = this.$store.getters.GetOrgDetails;
    this.tableData = response.organization.presence_color_codes;

    this.location_holiday =
      data.organization.default_holiday_list == undefined
        ? "defaultholiday"
        : data.organization.default_holiday_list == true
        ? "defaultholiday"
        : "locationholiday";

    this.scanTolerance = data.organization.organization_scan_tolerance;

    if (data.organization.scan_settings != undefined) {
      this.faceScan = data.organization.scan_settings.is_face_scan;
      this.doorScan = data.organization.scan_settings.is_door_scan;
    } else {
      this.faceScan = true;
      this.doorScan = false;
    }

    this.itemsData = [];
    this.fetch_items();
  },

  methods: {
    async validate_user() {
      const newData = this.tableData.map(
        ({ color_code, from_duration, to_duration }) => ({
          color_code,
          from_duration,
          to_duration,
        }),
      );
      this.tableData = newData;
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      let sacnSetting = {
        is_face_scan: this.faceScan,
        is_door_scan: this.doorScan,
      };
      const payload = {};

      if (this.reportType === "daily") {
        payload.daily_attendence_report = true;
        payload.daily_report_receiver_group =
          this.daily_report_members_array.map((item) =>
            typeof item === "string" ? item : item.value || item.title,
          );
        payload.daily_tigger_timings = this.formattedEnteredDailyTime;
        payload.organization_id = data.organization.organization_id;
        payload.user_email_id = data.user.user_email_id;
        payload.organization_scan_tolerance = this.scanTolerance;
        payload.presence_color_codes = this.tableData;
        payload.default_holiday_list =
          this.location_holiday == "defaultholiday" ? true : false;
        payload.scan_settings = JSON.stringify(sacnSetting);
      }

      if (this.reportType === "monthly") {
        payload.monthly_progressive_attendence_report = true;
        payload.monthly_report_receiver_group =
          this.monthly_report_members_array.map((item) =>
            typeof item === "string" ? item : item.value || item.title,
          );
        payload.monthly_tigger_timings = this.formattedEnteredMonthlyTime;
        payload.organization_id = data.organization.organization_id;
        payload.user_email_id = data.user.user_email_id;
        payload.organization_scan_tolerance = this.scanTolerance;
        payload.presence_color_codes = this.tableData;
        payload.default_holiday_list =
          this.location_holiday == "defaultholiday" ? true : false;
        payload.scan_settings = JSON.stringify(sacnSetting);
      }
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: payload,
          }),
        );
        this.loading = false;
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          await this.get_Org_details();
          this.$store.commit("SetOrgDetails", this.orgDetails);
          var response = this.orgDetails;
          this.tableData = response.organization.presence_color_codes;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {}
    },
    toggleSwitch(type) {
      if (type === "face") {
        if (!this.faceScan && !this.doorScan) {
          this.doorScan = true;
        }
      } else if (type === "door") {
        if (!this.doorScan && !this.faceScan) {
          this.faceScan = true;
        }
      }
    },
    delet_leave(item) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (
          item.from_duration === this.tableData[i].from_duration &&
          item.to_duration === this.tableData[i].to_duration
        ) {
          this.tableData.splice(i, 1);
          break;
        }
      }
    },
    setduration() {
      this.to_hr = "";
    },
    add_action() {
      if (this.$refs.form.validate()) {
        var key_object = {
          from_duration: this.from_hr,
          to_duration: this.to_hr,
          color_code: this.color,
        };

        var hasMatchingCode = this.tableData.some(
          (obj) =>
            obj.from_duration === this.from_hr &&
            obj.to_duration === this.to_hr,
        );
        if (hasMatchingCode == false) {
          this.tableData.push(key_object);
          this.from_hr = 0;
          this.to_hr = 0;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: "Duration already exists",
          };
        }
      }
    },
    colordailog() {
      this.colorpopup = true;
    },
    close_dialog() {
      this.colorpopup = false;
    },
    fetch_items() {
      for (let i = 50; i <= 1000; i += 50) {
        this.itemsData.push(i);
      }
    },
    clearDailyTime() {
      this.enteredDailyTime = null;
    },
    clearMonthlyTime() {
      this.enteredMonthlyTime = null;
    },
    convertTo24Hour(time12h) {
      if (!time12h) return "";

      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");

      hours = parseInt(hours, 10);

      if (modifier === "PM" && hours < 12) {
        hours += 12;
      }
      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    },
  },
};
</script>

<style scoped>
.combobox-fixed :deep(.v-field__input) {
  max-height: 120px;
  overflow-y: auto;
  align-items: flex-start !important;
  padding-bottom: 8px;
}
</style>

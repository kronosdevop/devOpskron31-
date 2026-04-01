<template>
  <div>
    <v-card flat>
      <OverlayComp :overlay="overlay" />
      <Snackbar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar color="transparent" class="mt-n3">
        <v-card-title class="">
          <v-icon color="primary" class="mr-2">mdi-cash</v-icon>Early Salary
          Access
        </v-card-title>
        <v-switch
          @change="save_actions()"
          v-model="is_early_salary_enabled"
          dense
          class="mt-6"
          color="primary"
        >
        </v-switch>
      </v-toolbar>
      <v-card-subtitle class="mt-n4 mb-2 text-left"
        ><strong
          >(Enable, if you wish to grant employees access a portion of their
          earned salary at any time before their payday)</strong
        >
        <v-menu v-model="menuOpen" location="bottom" offset="10" open-on-hover>
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              color="primary"
              size="small"
              class="cursor-pointer ml-2"
            >
              mdi-information-outline
            </v-icon>
          </template>
          <v-card class="pa-4" max-width="400" variant="outlined">
            <v-card-title class="text-h6 pb-2">Note:</v-card-title>
            <v-card-text class="pt-0">
              <ul class="text-left">
                <li class="mb-2">
                  <strong>Hourly/daily rate:</strong> Rate at which you would
                  consider early salary (calculated on a pro rata basis)
                </li>
                <li class="mb-2">
                  <strong>Min/Max Amount Request:</strong> Set the minimum and
                  maximum amount that an employee can request (setting limits
                  for each request)
                </li>
                <li class="mb-2">
                  <strong>Max No Of Request:</strong> Number of times an
                  individual can avail facility (number of requests in a month)
                </li>
                <li class="mb-2">
                  <strong>Service Fee:</strong> Amount which is the service fee
                  (fixed fee is charged for every request)
                </li>
                <li class="mb-2">
                  <strong>Max Amount / Month:</strong> Amount which is the
                  maximum limit for a month (total amount in a month)
                </li>
                <li class="mb-2">
                  <strong>Final Amount Calculation:</strong><br />
                  (Number of worked days/hours × rate) - Service Fee = Final
                  Amount<br />
                  <em>Example: 10 Days × INR 500 - INR 250 = INR 4750</em>
                </li>
              </ul>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-subtitle>
      <v-card-text class="ml-n3" v-show="is_early_salary_enabled == true">
        <v-form ref="form">
          <v-row class="text-left">
            <v-col cols="12" sm="6" md="6" lg="6" xl="6">
              <v-card
                class="pl-2 pr-3 elevation-1"
                :disabled="is_early_salary_enabled == false"
              >
                <v-row class="ml-1 mt-2">
                  <v-col>
                    <label class="font-weight-medium">Pay Type:</label>
                    <v-select
                      v-model="Duration"
                      density="compact"
                      variant="outlined"
                      :items="duration_item"
                      style="max-width: 250px"
                      class="mt-1 ml-n1"
                    >
                    </v-select>
                  </v-col>
                  <v-col>
                    <label class="font-weight-medium">Earned Rate:</label>
                    <v-text-field
                      v-model="hourly_earning_rate"
                      :rules="billing_amount_rule"
                      density="compact"
                      variant="outlined"
                      style="max-width: 250px"
                      class="mt-1"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-col cols="12" sm="12" md="12" lg="12" xl="12" class="mt-n12">
                  <v-row class="mt-1">
                    <v-col>
                      <label class="font-weight-medium"
                        >Min Amount Request:</label
                      >

                      <v-text-field
                        v-model="min_ammount_per_trans"
                        :rules="billing_amount_rule"
                        density="compact"
                        variant="outlined"
                        label="Min"
                        style="max-width: 250px"
                        class="mt-1"
                      />
                    </v-col>
                    <v-col>
                      <label class="ml-2 font-weight-medium"
                        >Max Amount Request:</label
                      >

                      <v-text-field
                        v-model="max_ammount_per_trans"
                        :rules="billing_amount_rule"
                        density="compact"
                        variant="outlined"
                        label="Max"
                        style="max-width: 250px"
                        class="ml-2 mt-1"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="12" xl="12" class="mt-n11">
                  <v-row class="mt-1">
                    <v-col>
                      <label class="font-weight-medium"
                        >Max No Of Request:</label
                      >

                      <v-text-field
                        v-model="max_request_per_user"
                        :rules="billing_amount_rule"
                        density="compact"
                        variant="outlined"
                        style="max-width: 250px"
                        class="mt-1"
                      />
                    </v-col>
                    <v-col>
                      <label class="ml-2 font-weight-medium"
                        >Service Fee Request / Transaction:</label
                      >

                      <v-text-field
                        v-model="service_fee_per_trans"
                        :rules="billing_amount_rule"
                        density="compact"
                        variant="outlined"
                        style="max-width: 250px"
                        class="ml-2 mt-1"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="12" md="12" lg="12" xl="12" class="mt-n12">
                  <v-row class="mt-1">
                    <v-col>
                      <label class="font-weight-medium"
                        >Max Amount / Month:</label
                      >
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        v-model="total_ammount_monthly_max_request"
                        :rules="billing_amount_rule"
                        style="max-width: 250px"
                        class="mt-1"
                      />
                    </v-col>
                    <v-col>
                      <label class="font-weight-medium ml-2"
                        >Select Approver:</label
                      >
                      <v-autocomplete
                        :rules="[(v) => !!v || 'Required']"
                        v-model="approvalUserEmail"
                        :items="userList"
                        @input="search = ''"
                        item-text="title"
                        class="ml-2 mt-1"
                        item-value="value"
                        style="max-width: 250px"
                        density="compact"
                        variant="outlined"
                        :menu-props="{ offsetY: true, maxHeight: 200 }"
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-col>

                <v-card-actions class="justify-center">
                  <v-btn
                    depressed
                    :loading="isLoading"
                    @click="save_actions()"
                    height="40"
                    class="cardCss ml-6 text-capitalize text-white"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { early_salary_settings } from "@/graphql/mutations.js";
import ESAApprovals from "@/components/PresenceApp/AdminLevelComponents/ESAApprovals.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import { API, graphqlOperation } from "aws-amplify";
import { get_early_salary_settings } from "@/graphql/queries.js";
import Snackbar from "@/components/SnackBar.vue";
import { all_users_of_organization } from "@/graphql/queries.js";

export default {
  components: {
    Snackbar,
    ESAApprovals,
    OverlayComp,
  },
  data: () => ({
    service_fee_per_trans: 20,
    month_max: "2023-03-31",
    mount_min: "2023-03",
    max: 100,
    min: 0,
    start: false,
    billing_amount_rule: [
      (v) => !!v || "required ",
      (value) => /^\d+$/.test(value) || "Only numbers are allowed",
    ],
    search: "",
    max2: 100,
    isLoading: false,
    rules: [(v) => !!v || "required"],
    min2: 10,
    startDate: new Date(new Date().getFullYear(), "0", "01"),
    endDate: new Date(new Date().getFullYear() + 1, "11", "31"),
    SnackBarComponent: {},
    userList: [],
    is_early_salary_enabled: false,
    min_ammount_per_trans: 2000,
    maxamount: [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
    maxamount1: [5000, 6000, 7000, 8000, 9000, 10000],
    minamount: [500, 1000, 1500, 2000],
    request: [1, 2, 3],
    servicecharge: [],
    total_ammount_monthly_max_request: 5000,
    max_request_per_user: 2,
    max_ammount_per_trans: 5000,
    approver_id: "",
    hourly_earning_rate: 10,
    DataItems: [],
    Duration: "Hourly",
    duration_item: ["Hourly", "Daily"],
    date: new Date().toISOString().substr(0, 10),
    button_condition: false,
    approvalUserEmail: "",
    overlay: false,
    menuOpen: false,
  }),
  async created() {
    this.overlay = true;
    this.$store.commit("Setnamesearch", this.search);
    await this.get_all_org_users();

    await this.get_datails();
  },

  computed: {},
  watch: {},
  methods: {
    fetch_users() {
      this.userList = [];

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            title: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
    },

    async get_all_org_users() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(all_users_of_organization, {
            input: {
              organization_id: data.organization.organization_id,
              name_search: this.search,
            },
          })
        );
        this.orgUsers = [];

        var response = JSON.parse(result.data.all_users_of_organization);

        this.orgUsers = response.data == undefined ? [] : response.data;

        this.userList = [];

        this.orgUsers.forEach((element) => {
          if (
            element.user_status == "ACTIVE" &&
            element.user_type != "CHATBOT"
          ) {
            this.userList.push({
              title: element.full_user_name,
              value: element.user_email_id,
            });
          }
        });
      } catch (error) {}
    },
    async save_actions() {
      if (this.$refs.form.validate()) {
        if (this.min_ammount_per_trans < this.max_ammount_per_trans) {
          this.isLoading = true;
          var data = this.$store.getters.GetUserObj;
          try {
            let result = await API.graphql(
              graphqlOperation(early_salary_settings, {
                input: {
                  organization_id: data.organization.organization_id,
                  hourly_earning_rate: +this.hourly_earning_rate,
                  is_daily: this.Duration != "Hourly" ? true : false,
                  is_earlysalary_enabled: this.is_early_salary_enabled,
                  max_amount_per_trans: +this.max_ammount_per_trans,
                  min_amount_per_trans: +this.min_ammount_per_trans,
                  max_request_per_user: +this.max_request_per_user,
                  service_fee_month_trans: +this.service_fee_per_trans,
                  total_monthly_max_request_amount:
                    +this.total_ammount_monthly_max_request,
                  settings_id: this.DataItems.settings_id,
                  user_email_id: data.user.user_email_id,
                  approval_email_id: this.approvalUserEmail,
                },
              })
            );
            this.isLoading = false;

            this.get_datails();
            var response = JSON.parse(result.data.early_salary_settings);
            if (response.Status == "SUCCESS") {
              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "green",
                SnackbarText: response.Message,
                timeout: 5000,
                Top: true,
              };
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
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: error.errors[0].message,
              timeout: 5000,
              Top: true,
            };
          }
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Max Amount Can't be less then Min Amount",
            timeout: 5000,
            Top: true,
          };
        }
      }
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "PREZENCE",
        AuditAction: "PREZENCE_ESA_SETTING",
        AuditMessage: `${data.user.full_user_name} Updated Presence Esa Details`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
    async get_datails() {
      var data = this.$store.getters.GetUserObj;
      try {
        await API.graphql(
          graphqlOperation(get_early_salary_settings, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        ).then((res) => {
          this.overlay = false;
          this.DataItems = JSON.parse(res.data.get_early_salary_settings).data;

          this.is_early_salary_enabled = this.DataItems.is_earlysalary_enabled;
          this.Duration = this.DataItems.is_daily != true ? "Hourly" : "Daily";
          this.hourly_earning_rate = this.DataItems.hourly_earning_rate;
          this.min_ammount_per_trans = this.DataItems.min_amount_per_trans;
          this.max_ammount_per_trans = this.DataItems.max_amount_per_trans;
          this.max_request_per_user = this.DataItems.max_request_per_user;
          this.service_fee_per_trans = this.DataItems.service_fee_month_trans;
          this.total_ammount_monthly_max_request =
            this.DataItems.total_monthly_max_request_amount;
          this.approvalUserEmail =
            this.DataItems.approval_email_id == "N/A"
              ? ""
              : this.DataItems.approval_email_id;
        });
      } catch (error) {
        this.overlay = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style>
.pageBreak {
  word-spacing: 1px;
}
.pageBreak1 {
  word-spacing: 3px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>

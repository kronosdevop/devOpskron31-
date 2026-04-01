<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="6">
            <v-select
              density="compact"
              variant="outlined"
              label="Team Visibility"
              v-model="teamVisibility"
              class=""
              item-text="title"
              item-value="value"
              :items="[
                { title: 'All Users', value: 'ALL_USERS' },
                {
                  title: 'Users Reportees Only ',
                  value: 'USER_REPORTES_ONLY',
                },
                {
                  title: 'Users Reportees And Reporting Manager',
                  value: 'USER_REPORTIES_AND_REPORTING_MANAGER',
                },
                {
                  title: 'Users With Common Location',
                  value: 'USER_COMMON_LOCATION',
                },
                {
                  title: 'Users With Common Group',
                  value: 'USER_COMMON_DEPARTMENT',
                },
                {
                  title: 'User Reportees and Reporting hierarchy',
                  value: 'USER_REPORTEES_AND_REPORTING_HIERARCHY',
                },
                {
                  title: 'User reportees and peers',
                  value: 'USER_REPORTEES_AND_PEERS',
                },
              ]"
            >
            </v-select>
            <v-select
              density="compact"
              variant="outlined"
              label="Summary Fields(In Team List)"
              v-model="summaryField"
              class=""
              item-text="title"
              item-value="value"
              :items="[
                { title: 'Email', value: 'EMAIL' },
                {
                  title: 'Group',
                  value: 'DEPARTMENT',
                },
                {
                  title: 'Location',
                  value: 'LOCATION',
                },
                {
                  title: 'Designation',
                  value: 'DESIGNATION',
                },
              ]"
            >
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions justify-start>
        <v-btn
          dark
          size="small"
          @click="save_visibility()"
          :loading="loading"
          class="text-capitalize cardCss ml-4 button-corner"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { edit_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  components: {
    SnackBar,
  },
  mixins: [
    get_Org_details,
    // update_audit_logs
  ],
  data() {
    return {
      teamVisibility: "",
      loading: false,
      SnackBarComponent: {},
      summaryField: "",
    };
  },
  created() {
    var data = this.$store.getters.GetOrgDetails;

    this.teamVisibility = data.organization.team_visibilty;
    this.summaryField = data.organization.app_themes.summary_visibilty;
    // console.log(data.organization.app_themes);
  },
  methods: {
    async save_visibility() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              team_visibilty: this.teamVisibility,
              app_themes: await this.fetch_summary(),
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Updated Successfully",
            timeout: 5000,
            Top: true,
          };
          this.loading = false;
          await this.get_Org_details();
          this.$store.commit("SetOrgDetails", this.orgDetails);
        } else {
          this.loading = false;
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
    fetch_summary() {
      var data2 = this.$store.getters.GetOrgDetails;
      var data = {};
      data = {
        summary_visibilty: this.summaryField,
        tabs_visiblity: data2.organization.app_themes.tabs_visiblity,
      };

      return data;
    },
  },
};
</script>
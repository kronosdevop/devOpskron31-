<template>
  <v-container fluid>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- <template #label> -->
    <div><strong>Summary Fields(In Team List)</strong></div>
    <!-- </template> -->
    <v-radio-group row v-model="summaryField">
      <v-radio class="" value="EMAIL">
        <template #label>
          <div>
            <strong class="">Email</strong>
          </div>
        </template>
      </v-radio>
      <v-radio value="DEPARTMENT">
        <template #label>
          <div>
            <strong class="">Group</strong>
          </div>
        </template>
      </v-radio>
      <v-radio value="LOCATION">
        <template #label>
          <div>
            <strong class="">Location</strong>
          </div>
        </template>
      </v-radio>
      <v-radio value="DESIGNATION">
        <template #label>
          <div>
            <strong class="">Designation</strong>
          </div>
        </template>
      </v-radio>
    </v-radio-group>
    <v-row no-gutters class="justify-start">
      <v-btn
        :loading="loading"
        dark
        @click="save_data()"
        class="text-capitalize cardCss"
        >Save</v-btn
      >
    </v-row>
    <!-- <v-row no-gutters>
      <div><strong> Bottom Bar Visibility </strong></div>

      <v-col class="mt-n5 ml-5" cols="12" sm="2" md="2">
        <v-checkbox
          v-model="myTeam"
          readonly
          label="My Team"
          color="primary"
        ></v-checkbox>
      </v-col>
      <v-col class="mt-n5 ml-n8" cols="12" sm="2" md="2">
        <v-checkbox
          v-model="chat"
          readonly
          label="Chat"
          color="primary"
        ></v-checkbox>
      </v-col>
      <v-col class="mt-n5 ml-n8" cols="12" sm="2" md="2">
        <v-checkbox
          v-model="dahsnoard"
          label="Dashboard"
          readonly
          color="primary"
        ></v-checkbox>
      </v-col>
      <v-col class="mt-n5 ml-n8" cols="12" sm="2" md="2">
        <v-checkbox v-model="forms" label="Forms" color="primary"></v-checkbox>
      </v-col>
      <v-col class="mt-n5 ml-n8" cols="12" sm="2" md="2">
        <v-checkbox
          v-model="cabinet"
          label="Cabinet"
          color="primary"
        ></v-checkbox>
      </v-col>
    </v-row> -->
  </v-container>
</template>
<script>
/* eslint-disable */
import { edit_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import SnackBar from "@/components/SnackBar.vue";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  mixins: [get_Org_details,
  //  update_audit_logs
  ],
  components: {
    SnackBar,
  },
  data() {
    return {
      summaryField: "",
      cabinet: true,
      forms: true,
      dahsnoard: true,
      chat: true,
      myTeam: true,
      loading: false,
      SnackBarComponent: {},
    };
  },
  async created() {
    await this.get_Org_details();
    this.fetch_details();
  },
  methods: {
    fetch_details() {
      this.summaryField =
        this.orgDetails.organization.app_themes.summary_visibilty;
    },
    async save_data() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: this.orgDetails.organization.organization_id,
              user_email_id: data.user.user_email_id,
              app_themes: await this.fetch_summary(),
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Updated Successfully",
            timeout: 5000,
            Top: true,
          };
          await this.get_Org_details();
          this.fetch_details();
          // this.fetch_audit_message();
          this.loading = false;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.loading = false;
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
      var data = {};
      data = {
        summary_visibilty: this.summaryField,
        tabs_visiblity: this.orgDetails.organization.app_themes.tabs_visiblity,
      };

      return data;
    },
    async fetch_audit_message() {
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WEB_ACTION",
        AuditAction: "EDIT_APP_THEME",
        AuditMessage: `${datas.user.full_user_name} edited Organization App Theme`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>
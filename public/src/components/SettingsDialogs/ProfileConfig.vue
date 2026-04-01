<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <OverlayComp :overlay="overlay" />
    <v-card v-if="queryCheck == 1" flat >
      <v-card-text>
        <v-expansion-panels>
          <v-expansion-panel v-for="(items, name) in dataFields" :key="name">
            <v-expansion-panel-title>
              {{ name }}
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-row no-gutters>
                <v-col
                  v-for="item in items"
                  :key="item.name"
                  cols="12"
                  sm="3"
                  class=""
                >
                  <v-checkbox
                    light
                    :label="item.display_label"
                    v-model="item.is_displayed"
                    color="blue"
                  >
                    <!-- @click="get_value(item)" -->
                  </v-checkbox>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          dark
          size="small"
          :loading="loading"
          @click="save_actions()"
          class="text-capitalize cardCss text-white mr-2"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { edit_organization } from "@/graphql/mutations.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  mixins: [
    get_Org_details,
    // update_audit_logs
  ],
  components: {
    SnackBar,
    OverlayComp,
  },
  data() {
    return {
      SnackBarComponent: {},
      panel: "",
      dataFields: {},
      selectedItems: [],
      queryCheck: 0,
      loading: false,
      gloabalElements: [],
      overlay: false,
    };
  },
  async created() {
    this.overlay = true;
    await this.get_Org_details();
    this.overlay = false;
    this.fetch_details();
  },
  methods: {
    fetch_details() {
      var elements = [];
      this.gloabalElements = [];
      elements = this.orgDetails.organization.member_information_settings;
      this.gloabalElements =
        this.orgDetails.organization.member_information_settings;
      this.get_detilas(elements);
      this.queryCheck = 1;
    },

    get_detilas(value) {
      const groupedData = value.reduce((result, obj) => {
        const name = obj.section;

        if (!result[name]) {
          result[name] = [];
        }
        result[name].push(obj);

        return result;
      }, {});

      this.dataFields = groupedData;
    },

    async save_actions() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              member_information_settings: JSON.stringify(this.gloabalElements),
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

          this.loading = false;
          // this.fetch_audit_message();
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
    async fetch_audit_message() {
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WEB_ACTION",
        AuditAction: "PROFILE_CONFIGURATION",
        AuditMessage: ` ${datas.user.full_user_name} updated Profile Configuration `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>
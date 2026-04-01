<template>
  <div>
    <!-- Back Button Header -->
    <v-card flat class="mb-4">
      <v-card-text class="pa-4">
        <v-btn
          variant="text"
          class="back-link"
          @click="$emit('backAction')"
        >
          <v-icon>mdi-arrow-left</v-icon>
          Back to Asset Settings
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <!-- <v-toolbar class="mt-n1" flat dense>
        <v-spacer />
      </v-toolbar> -->
      <v-card-text class="mt-n4">
        <v-form ref="form">
          <!-- <div><b>Location Settings</b></div>
          <v-row no-gutters>
            <v-radio-group class="" v-model="locationSettting" inline color="blue">
              <v-radio
                label="Use Default Organization Master Locations"
                value="defaultLocation"
              ></v-radio>
              <v-radio
                label="Create Custom Asset Locations(internal + external)"
                value="customLocation"
              ></v-radio>
            </v-radio-group>
          </v-row> -->
          <!-- <div v-show="locationSettting == 'customLocation'" class="mt-3">
            <b>Assets deployment</b>
          </div> -->
          <!-- <v-row v-show="locationSettting == 'customLocation'" no-gutters>
          
            <v-radio-group
              :rules="
                locationSettting == 'customLocation'
                  ? [(v) => !!v || 'required ']
                  : []
              "
              class=""
              v-model="assetsDeployemnt"
            >
              <v-radio
                label="Internally in the organization"
                value="internalOrganization"
              ></v-radio>
              <v-radio
                label="Internally in the organization as well as externally with distributors and retailers"
                value="asstesExternalDeploy"
              ></v-radio>
            </v-radio-group>
          </v-row> -->
          <div class="mt-3"><b>Asset Verification Frequency</b></div>
          <v-row no-gutters>
            <v-select
              style="max-width: 400px"
              density="compact"
              variant="outlined"
              class="mt-3"
              v-model="verificationFrequency"
              :items="[
                {
                  title: '1 (Every Month)',
                  value: 1,
                },
                { title: '2 (Every Two Months)', value: 2 },
                { title: '3 (Every Three Months)', value: 3 },
                { title: '4 (Every Four Months)', value: 4 },
                { title: '6 (Every Six Months)', value: 6 },
                { title: '12(Yearly once)', value: 12 },
              ]"
            />

            <!-- { text: '8(Every Eight Months)', value: 8 },
              { text: '10(Every 10 Months)', value: 10 }, -->
          </v-row>

          <div class="mt-n3">
            {{
              verificationFrequency == 1
                ? `(Jan 1st,
                  Feb 1st,
                  Mar 1st,
                  Apr 1st,
                  May 1st,
                  Jun 1st,
                  July 1st,
                  Aug 1st,
                  Sep 1st,
                  Oct 1st,
                  Nov 1st,
                  Dec 1st)`
                : verificationFrequency == 2
                ? `(Jan 1st,
                  Mar 1st,
                  May 1st,
                  July 1st,
                  Sep 1st,
                  Nov 1st)`
                : verificationFrequency == 3
                ? `(Jan 1st,
                  May 1st,
                  Sep 1st)`
                : verificationFrequency == 4
                ? `(Jan 1st,
                  Apr 1st,
                  Aug 1st,
                  Dec 1st)`
                : verificationFrequency == 6
                ? `(Jan 1st,
                  July 1st)`
                : `(Jan 1st)`
            }}
          </div>
          <div class="mt-5"><b>Enable Assets Tags</b></div>
          <v-row no-gutters>
            <v-radio-group class="" v-model="assetTagsSettings" inline color="blue">
              <v-radio label="Yes" value="yes"></v-radio>
              <v-radio label="No" value="no"></v-radio>
            </v-radio-group>
          </v-row>

          <!-- <div class="mt-3">
            <b>Choose an approver for the asset retirement process</b>
          </div> -->
          <!-- <v-row no-gutters>
            <v-autocomplete
              style="max-width: 400px"
              label="Select Member"
              v-model="selectedMember"
              :items="userList"
              :search-input.sync="search"
              @input="search = ''"
              item-text="label"
              item-value="value"
              clearable
              dense
              outlined
              class="mt-4"
              :menu-props="{ offsetY: true, maxHeight: 200 }"
            ></v-autocomplete>
           
          </v-row> -->
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-start">
        <v-btn
          @click="save_action()"
          :loading="loading"
          dark
          size="small"
          class="text-capitalize cardCss button-corner mt-4 ml-4 text-white"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import { asset_config_create_list_update_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { EventBus } from "@/EventBus";

export default {
  components: {
    SnackBar,
  },
  emits: ['backAction'],
  mixins: [get_Org_details, get_all_org_users],
  data() {
    return {
      locationSettting: "",
      selectedMember: "",
      userList: [],
      search: "",
      loading: false,
      SnackBarComponent: {},
      toggle_exclusive: "NO",
      verificationFrequency: 3,
      assetsDeployemnt: null,
      assetTagsSettings: "no",

      // internalOrganization: false,
      // asstesExternalDeploy: false,
    };
  },
  async created() {
    // await this.get_Org_details();
    // await this.get_all_org_users();
    // await this.fetch_users();
    var data = this.$store.getters.GetOrgDetails;
    this.verificationFrequency =
      data.organization.asset_verification_frequency != undefined
        ? data.organization.asset_verification_frequency
        : 3;
    this.locationSettting =
      data.organization.is_asset_location_configured == false
        ? "defaultLocation"
        : "customLocation";
    this.assetsDeployemnt =
      data.organization.is_asset_deployed_external == true
        ? "asstesExternalDeploy"
        : "internalOrganization";
    this.assetTagsSettings =
      data.organization.enable_asset_tags == false ? "no" : "yes";
    // var asset_approval =
    //   this.orgDetails.organization.asset_management_settings != undefined
    //     ? this.orgDetails.organization.asset_management_settings
    //     : {};
    // if (this.orgDetails.organization.asset_management_settings != undefined) {
    //   this.selectedMember =
    //     asset_approval.is_approval == true
    //       ? asset_approval.approvers_list[0].user_email_id
    //       : "";
    // }
    // this.toggle_exclusive = asset_approval.is_approval == true ? "YES" : "NO";
  },

  methods: {
    cleardata() {
      this.selectedMember = "";
    },
    createApprovalObject(isApproval, memberEmail) {
      const baseObject = {
        name: "RETIRE_ASSET",
        approvers_list: [],
        is_approval: true,
      };
      // isApproval == "YES" ? true : false,

      if (isApproval && memberEmail && memberEmail.trim() !== "") {
        baseObject.approvers_list.push({
          step_no: 1,
          user_email_id: memberEmail,
        });
      }

      return JSON.stringify(baseObject);
    },
    fetch_data() {
      const baseObject = {
        name: "RETIRE_ASSET",
        approvers_list: [],
        is_approval: false,
      };
      return JSON.stringify(baseObject);
    },
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
      this.userList.sort((a, b) => a.label.localeCompare(b.label));
    },
    async save_action() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(asset_config_create_list_update_locations, {
              input: {
                action_type: "CONFIGURE",
                is_asset_location_configured:
                  this.locationSettting == "defaultLocation" ? false : true,
                organization_id: data.organization.organization_id,
                asset_verification_frequency: parseInt(
                  this.verificationFrequency
                ),
                asset_management_settings:
                  this.selectedMember != null || this.selectedMember != ""
                    ? this.createApprovalObject(
                        this.toggle_exclusive,
                        this.selectedMember
                      )
                    : this.fetch_data(),
                enable_asset_tags:
                  this.assetTagsSettings == "yes" ? true : false,
              },
            })
          );
          var response = JSON.parse(
            result.data.asset_config_create_list_update_locations
          );
          if (response.Status == "SUCCESS") {
            await this.get_Org_details();
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.loading = false;
            this.$store.commit("SetOrgDetails", this.orgDetails);
            this.locationSettting =
              this.orgDetails.organization.is_asset_location_configured == false
                ? "defaultLocation"
                : "customLocation";
            var data = {
              location: this.locationSettting,
              tagSetiing: this.assetTagsSettings,
            };
            // EventBus.$emit("locationsetting", data);
            // EventBus.$emit("", this.locationSettting);
          } else {
            this.loading = false;
          }
        } catch (error) {
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
/* Back Button */
.back-link {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  color: #DB4C77 !important;
}

.back-link:hover {
  background-color: rgba(219, 76, 119, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
}
</style>
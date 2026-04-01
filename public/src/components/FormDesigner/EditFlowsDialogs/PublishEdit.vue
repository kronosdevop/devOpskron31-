<template>
  <!-- eslint-disable -->
  <div>
    <v-card-text>
      <v-row class="mt-3" no-gutters>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <v-spacer />
        <v-btn
          size="small"
          @click="back_step()"
          class="mt-n3 text-white cardCss"
          >Back</v-btn
        >
        <v-btn
          size="small"
          @click="next_option()"
          :disabled="formpublishCheck == true"
          class="mt-n3 ml-2 text-white cardCss"
          >Next</v-btn
        >
        <!-- <v-btn
          small
          @click="validate_data()"
          :loading="loading"
          :disabled="formpublishCheck == true"
          class="mt-n3 ml-2 white--text cardCss"
          >Publish</v-btn
        > -->
      </v-row>
      <v-form ref="form">
        <v-row class="mt-2" no-gutters>
          <v-col cols="6">
            <v-row no-gutters>
              <v-col cols="12">
                <v-card flat class="" max-width="700">
                  <!-- <v-card-title>F</v-card-title> -->
                  <v-card-text>
                    <v-row no-gutters>
                      <v-col cols="12">
                        <v-text-field
                          variant="outlined"
                          label="Form Name"
                          :rules="[(v) => !!v || 'required ']"
                          v-model="wrkflowName"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          variant="outlined"
                          rows="1"
                          :rules="[(v) => !!v || 'required ']"
                          label="Form Description"
                          v-model="formDescription"
                          density="compact"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card flat class="mt-n2" max-width="700">
                  <v-card-text>
                    <v-expansion-panels>
                      <v-expansion-panel title="Webhook/Other Settings">
                        <v-expansion-panel-text>
                          <v-row no-gutters class="pa-2">
                            <v-col cols="12">
                              <v-text-field
                                variant="outlined"
                                label="URL"
                                v-model="invokeUrl"
                                density="compact"
                              />
                            </v-col>
                            <v-col cols="12">
                              <v-text-field
                                variant="outlined"
                                label="Authorization"
                                v-model="webhoolAuth"
                                density="compact"
                              />
                            </v-col>
                            <!-- <v-col class="mt-n4" cols="6">
            <v-checkbox
              v-model="enableGeoLoc"
              label="Enable Geolocation"
            ></v-checkbox>
          </v-col>
          <v-col class="mt-n4" cols="6">
            <v-checkbox
              v-model="enableAttachments"
              label="Enable Attachments"
            ></v-checkbox>
          </v-col> -->
                          </v-row>
                          <!-- </v-card-text> -->
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="6">
            <v-card flat>
              <v-card-subtitle class="font-weight-bold"
                >Select Summary Fields</v-card-subtitle
              >
              <v-card-text class="mt-n2">
                <v-row no-gutters>
                  <v-col cols="6">
                    <v-select
                      density="compact"
                      label="Summary One"
                      :items="sumarrayItems"
                      v-model="summaryField1"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      class="ml-2"
                      density="compact"
                      label="Summary Two"
                      :items="sumarrayItems"
                      v-model="summaryField2"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-subtitle
                class="mt-n4 font-weight-bold"
                v-if="params.formType == 'DEFAULT'"
                >Visibility</v-card-subtitle
              >
              <v-card-text class="mt-n2" v-if="params.formType == 'DEFAULT'">
                <v-radio-group
                  @change="clear_value()"
                  v-model="teamVisibility"
                  class="mt-n2"
                  row
                >
                  <v-radio label="All Members" value="ALL_MEMBERS"></v-radio>
                  <v-radio label="Group Level" value="GROUPS"></v-radio>
                </v-radio-group>
                <v-select
                  v-if="teamVisibility == 'GROUPS'"
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                  v-model="selectGroup"
                  :items="allGroups"
                  item-title="label"
                  item-value="value"
                  :rules="
                    teamVisibility == 'GROUPS'
                      ? [
                          (v) =>
                            (v && v.length > 0) ||
                            'At least one group is required',
                        ]
                      : []
                  "
                  :menu-props="{ maxHeight: '300' }"
                  label="Select Group"
                  multiple
                ></v-select>
              </v-card-text>
              <v-card-subtitle
                class="mt-n4 font-weight-bold"
                v-if="params.formType == 'DEFAULT'"
                >Notification (You will be notified by email and by app
                notification)</v-card-subtitle
              >
              <v-card-text v-if="params.formType == 'DEFAULT'">
                <v-autocomplete
                  density="compact"
                  v-model="selectTeam"
                  label="Select User"
                  variant="outlined"
                  item-title="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  @input="searchF = ''"
                  hide-no-data
                  hide-selected
                  placeholder="Min 3 Character"
                  multiple
                />
                <v-card-subtitle class="mt-n4 ml-n3 font-weight-bold">
                  <v-checkbox
                    v-model="groupheadNotification"
                    label="Group Head will be notified by email and by app
              notification"
                  />
                </v-card-subtitle>
              </v-card-text>
              <!-- <v-card-title class="mt-n4">Geo Settings</v-card-title>
            <v-card-text class="mt-n2">
              <v-checkbox
                v-model="enableGeoLoc"
                label="Enable geo location on submission"
                class="mt-n2"
              ></v-checkbox>
            </v-card-text>
            <v-card-title class="mt-n4">Attachments </v-card-title>
            <v-card-text class="mt-n2">
              <v-checkbox
                v-model="attachmentManadatory"
                label="Make attachment mandatory on  submission"
                class="mt-n2"
              ></v-checkbox>
            </v-card-text> -->
            </v-card>
          </v-col>
        </v-row>
      </v-form>
      <!-- <v-card class="mt-n4" max-width="700">
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  variant="outlined"
                  readonly
                  label="Form Name"
                  :rules="[(v) => !!v || 'required ']"
                  v-model="params.formSelected.workflow_name"
                  density="compact"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  variant="outlined"
                  readonly
                  rows="1"
                  :rules="[(v) => !!v || 'required ']"
                  label="Form Description"
                  v-model="params.formSelected.workflow_description"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
      <v-card class="mt-3" max-width="700">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Webhook/Other Settings
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    label="URL"
                    v-model="invokeUrl"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    variant="outlined"
                    label="Authorization"
                    v-model="webhoolAuth"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card> -->
    </v-card-text>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { create_worklow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  components: {
    SnackBar,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  mixins: [get_department_details, get_all_org_users],

  data() {
    return {
      wrkflowName: "",
      workflowDescription: "",
      SnackBarComponent: {},
      stepsCount: [],
      loading: false,
      invokeUrl: "",
      webhoolAuth: "",
      selectTeam: [],
      userArray: [],
      searchF: "",
      enableAttachments: false,
      formpublishCheck: false,
      groupheadNotification: false,
      enableGeoLoc: false,
      allGroups: [],
      teamVisibility: "ALL_MEMBERS",
      selectGroup: [],
      attachmentManadatory: false,
      summaryField1: "",
      summaryField2: "",
      sumarrayItems: [],
      formDescription: "",
    };
  },
  async created() {
    this.formDescription = this.params.formSelected.workflow_description;
    // console.log(this.params);
    this.groupheadNotification =
      this.params.formSelected.is_group_noftication_enabled == undefined
        ? false
        : this.params.formSelected.is_group_noftication_enabled;

    this.params.formSelected.formSelected;
    this.wrkflowName = this.params.formSelected.workflow_name;
    this.invokeUrl =
      this.params.formSelected.workflow_webhook.invoke_url == "N/A"
        ? ""
        : this.params.formSelected.workflow_webhook.invoke_url;
    this.webhoolAuth =
      this.params.formSelected.workflow_webhook.authorization == "N/A"
        ? ""
        : this.params.formSelected.workflow_webhook.authorization;
    this.teamVisibility =
      this.params.formSelected.workflow_visibility != undefined
        ? this.params.formSelected.workflow_visibility.visible_type
        : "ALL_MEMBERS";
    this.selectGroup =
      this.params.formSelected.workflow_visibility != undefined
        ? this.params.formSelected.workflow_visibility.visible_groups
        : [];
    this.attachmentManadatory =
      this.params.formSelected.no_of_attachments == 0 ? false : true;
    this.enableGeoLoc = this.params.formSelected.is_geo_enabled;
    this.fetch_summary_fields();
    this.summaryField1 =
      this.params.formSelected.summary_field_1 != undefined
        ? this.params.formSelected.summary_field_1
        : "";
    this.summaryField2 =
      this.params.formSelected.summary_field_2 != undefined
        ? this.params.formSelected.summary_field_2
        : "";
    this.selectTeam =
      this.params.formSelected.notifications != undefined
        ? this.params.formSelected.notifications
        : [];
    this.formpublishCheck = true;
    await this.get_all_org_users();
    await this.get_department_details();
    this.formpublishCheck = false;
    this.fetch_groups();
    if (this.params.publishInfo.form_id != undefined) {
      this.bind_data();
    }
    if (this.params.formType != "DEFAULT") {
      this.selectTeam = [];
      this.selectGroup = [];
      this.teamVisibility = "ALL_MEMBERS";
      this.groupheadNotification = false;
    }
    // console.log(this.params.formType, "params");
  },

  methods: {
    bind_data() {
      this.wrkflowName = this.params.publishInfo.workflow_name;
      this.formDescription = this.params.publishInfo.workflow_description;
      let webhook = JSON.parse(this.params.publishInfo.workflow_webhook);

      this.invokeUrl = webhook.invoke_url == "N/A" ? "" : webhook.invoke_url;
      this.webhoolAuth =
        webhook.authorization == "N/A" ? "" : webhook.authorization;
      this.summaryField1 =
        this.params.publishInfo.summary_field_1 == "N/A"
          ? ""
          : this.params.publishInfo.summary_field_1;
      this.summaryField2 =
        this.params.publishInfo.summary_field_2 == "N/A"
          ? ""
          : this.params.publishInfo.summary_field_2;
      this.teamVisibility =
        this.params.publishInfo.workflow_visibility.visible_type;
      if (this.teamVisibility == "GROUPS") {
        this.selectGroup =
          this.params.publishInfo.workflow_visibility.visible_groups;
      }
      this.selectTeam = this.params.publishInfo.notifications;
      this.groupheadNotification =
        this.params.publishInfo.is_group_noftication_enabled;
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // this.fetch_workflow_steps(this.params.flowConfiguredSteps);
        this.publish_workflow();
      }
    },

    fetch_summary_fields() {
      var data = this.params.formSelected;
      // console.log(this.params.formSelected);
      this.sumarrayItems = [];

      data.workflow_template.forEach((element) => {
        if (
          element.data_type != "label" &&
          element.data_type != "boolean" &&
          element.data_type != "url" &&
          element.data_type != "url" &&
          element.data_type != "gallery" &&
          element.data_type != "media"
        ) {
          this.sumarrayItems.push({
            label: element.display_label,
            value: this.fetch_keys(element),
          });
        }
      });
    },

    fetch_keys(value) {
      var data = "";
      if (value.input_value == "list_users") {
        data = "user_id_text";
      } else if (value.input_value == "list_designations") {
        data = "designation_text";
      } else if (value.input_value == "list_locations") {
        data = "location_text";
      } else if (value.input_value == "list_departments") {
        data = "department_text";
      }
      // else if (value.type == "COUNTRYLIST") {
      //   data = "iso_code";
      // }
      else {
        data = value.display_label.toLowerCase().replace(/ /g, "_");
      }

      return data;
    },
    fetch_groups() {
      this.departmentList.forEach((element) => {
        this.allGroups.push({
          label: element.department_name,
          value: element.department_id,
        });
      });
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },

    clear_value() {
      if (this.teamVisibility == "ALL_MEMBERS") {
        this.selectGroup = [];
      }
    },

    async publish_workflow() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_worklow, {
            input: {
              workflow_design_type: this.params.formType,
              is_group_noftication_enabled: this.groupheadNotification,
              workflow_name: this.wrkflowName,
              workflow_description: this.formDescription,
              organization_id: data.organization.organization_id,
              form_id: this.params.formSelected.form_id,
              workflow_template: JSON.stringify(this.params.zeroConfigStep),
              workflow_type: "CUSTOM_FLOWS",
              workflow_starts: JSON.stringify(this.params.zeroConfigStep),
              workflow_approval_steps: await this.fetch_workflow_steps(
                this.params.flowConfiguredSteps
              ),
              workflow_count_steps: this.stepsCount.length,
              user_email_id: data.user.user_email_id,
              is_attachments:
                this.params.statrStepSettings.enableAttachments == true ? 1 : 0,
              is_enable_geoloc:
                this.params.statrStepSettings.enableGeoLocation == true ? 1 : 0,
              workflow_webhook: this.fetch_weebhook_action(),
              workflow_visibility: this.fetch_visibility(),
              summary_field_1:
                this.summaryField1 != "" ? this.summaryField1 : undefined,
              summary_field_2:
                this.summaryField2 != "" ? this.summaryField2 : undefined,
              notifications: this.selectTeam,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.create_worklow);
        if (response.Status == "SUCCESS") {
          this.$emit("completion", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
        // this.loading = false;
      }
    },

    fetch_visibility() {
      var data = {
        visible_type: this.teamVisibility,
        visible_groups:
          this.teamVisibility == "ALL_MEMBERS" ? undefined : this.selectGroup,
      };
      return data;
    },
    async next_option() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        var data = this.$store.getters.GetUserObj;
        let input = {
          workflow_design_type: this.params.formType,
          is_group_noftication_enabled: this.groupheadNotification,
          workflow_name: this.wrkflowName,
          workflow_description: this.formDescription,
          organization_id: data.organization.organization_id,
          form_id: this.params.formSelected.form_id,
          workflow_template: JSON.stringify(this.params.zeroConfigStep),
          workflow_type: "CUSTOM_FLOWS",
          workflow_starts: JSON.stringify(this.params.zeroConfigStep),
          workflow_approval_steps: await this.fetch_workflow_steps(
            this.params.flowConfiguredSteps
          ),
          workflow_count_steps: this.stepsCount.length,
          user_email_id: data.user.user_email_id,
          is_attachments:
            this.params.statrStepSettings.enableAttachments == true ? 1 : 0,
          is_enable_geoloc:
            this.params.statrStepSettings.enableGeoLocation == true ? 1 : 0,
          workflow_webhook: this.fetch_weebhook_action(),
          workflow_visibility: this.fetch_visibility(),
          summary_field_1:
            this.summaryField1 != "" ? this.summaryField1 : "N/A",
          summary_field_2:
            this.summaryField2 != "" ? this.summaryField2 : "N/A",
          notifications: this.selectTeam,
        };
        this.$emit("previewStep", input);
      }
    },
    back_step() {
      // console.log(this.params);
      // this.$emit("workflowSteps", this.params.flowStepsData);
      this.$emit("workflowSteps", this.params.flowStepsData);

      this.$emit("prevZeroStep", this.params.zeroConfigStep);
    },

    fetch_weebhook_action() {
      var data = {};
      data = {
        invoke_url: this.invokeUrl == "" ? "N/A" : this.invokeUrl,
        authorization: this.webhoolAuth == "" ? "N/A" : this.webhoolAuth,
      };
      return JSON.stringify(data);
    },

    fetch_workflow_steps(value) {
      // console.log("valhd", value);
      var array = [];
      var steps = [];
      this.stepsCount = [];
      steps = value;
      var self = this;
      var count = 1;

      for (let i = 0; i < steps.length; i++) {
        array.push({
          user_type: steps[i].key,
          user_id:
            steps[i].key == "roles" || steps[i].key == "team_member"
              ? steps[i].value
              : "N/A",
          step_no: count++,
          workflow_template: steps[i].formDetails,
          hooks_details: steps[i].key == "hook" ? steps[i].hooks_details : {},
          action_buttons: steps[i].action_buttons,
          enable_geoLocation: steps[i].enable_geoLocation,
          enable_attachments: steps[i].enable_attachments,
        });
      }

      this.stepsCount = array;
      // console.log(array);
      return JSON.stringify(array);
    },
  },
};
</script>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editVisibilityDialog"
      @update:model-value="$emit('update:editVisibilityDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Edit Settings for {{ rowInfo.workflow_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <b>Visbility Settings</b>
            <v-radio-group @change="clear_value()" v-model="teamVisibility" row>
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
              :menu-props="{ maxHeight: '300' }"
              label="Select Group"
              multiple
              :rules="[groupRequiredRule]"
            ></v-select>
          </v-form>
          <!-- <b>Geo Settings</b>
          <v-checkbox
            v-model="enableGeoLoc"
            label="Enable geo location on submission "
          ></v-checkbox>
          <b>Attachment Settings</b>
          <v-checkbox
            v-model="attachmentManadatory"
            label="Make attachment mandatory on  submission"
          ></v-checkbox> -->
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="edit_visbility()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_department_details } from "@/mixins/GetDepartments.js";
import { create_worklow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    editVisibilityDialog: Boolean,
    rowInfo: Object,
  },
  mixins: [get_department_details],

  data() {
    return {
      selectGroup: [],
      allGroups: [],
      groupRequiredRule: (value) => {
        if (
          this.teamVisibility === "GROUPS" &&
          (!value || value.length === 0)
        ) {
          return "Please select at least one group.";
        }

        return true;
      },
      teamVisibility: null,
      loading: false,
      enableGeoLoc: false,
      attachmentManadatory: false,
    };
  },
  watch: {
    editVisibilityDialog: {
      async handler() {
        if (this.editVisibilityDialog == true) {
          this.enableGeoLoc = null;
          await this.get_department_details();
          this.fetch_groups();
          this.enableGeoLoc = this.rowInfo.is_geo_enabled;
          this.attachmentManadatory =
            this.rowInfo.no_of_attachments == 0 ? false : true;
          if (this.rowInfo.workflow_visibility != undefined) {
            this.teamVisibility = this.rowInfo.workflow_visibility.visible_type;
            this.selectGroup = this.rowInfo.workflow_visibility.visible_groups;
          } else {
            this.teamVisibility = "ALL_MEMBERS";
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    clear_value() {
      if (this.teamVisibility == "ALL_MEMBERS") {
        this.selectGroup = [];
      }
    },
    fetch_groups() {
       this.allGroups=[]
      this.departmentList.forEach((element) => {
        this.allGroups.push({
          label: element.department_name,
          value: element.department_id,
        });
      });
    },
    async edit_visbility() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(create_worklow, {
              input: {
                workflow_name: this.rowInfo.workflow_name,
                workflow_description: this.rowInfo.workflow_description,
                organization_id: data.organization.organization_id,
                form_id: this.rowInfo.form_id,
                workflow_template: JSON.stringify(
                  this.rowInfo.workflow_template
                ),
                workflow_type: "CUSTOM_FLOWS",
                workflow_starts: JSON.stringify(this.rowInfo.workflow_starts),
                workflow_approval_steps: JSON.stringify(
                  this.rowInfo.workflow_approval_steps
                ),
                workflow_count_steps: this.rowInfo.workflow_count_steps,
                user_email_id: data.user.user_email_id,
                is_attachments: this.attachmentManadatory == false ? 0 : 1,
                is_enable_geoloc: this.enableGeoLoc,
                workflow_webhook: JSON.stringify(this.rowInfo.workflow_webhook),
                summary_field: "N/A",
                workflow_visibility: this.fetch_visibility(),
                summary_field_1: this.rowInfo.summary_field_1,
                summary_field_2: this.rowInfo.summary_field_2,
              },
            })
          );

          this.loading = false;
          var response = JSON.parse(result.data.create_worklow);

          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;

          this.$emit("errorMsg", error.errors[0].message);
          // this.loading = false;
        }
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
  },
};
</script>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="formViewDailog" @update:model-value="$emit('update:formViewDailog', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card v-if="formCheck == true" class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="custom-title text--black ml-2">
            <div class="custom-title">
              {{
                viewAction == "Deployed"
                  ? formDetails.form_name
                  : formDetails.workflow_name
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-4">
              <v-col
                v-for="(index, Idx) in formDisplay"
                :key="Idx"
                cols="6"
                sm="6"
                xs="6"
              >
                <TextField
                  v-if="
                    index.data_type == 'string' && index.is_displayed == true
                  "
                  v-on:textinput="textfield_value"
                  :index="index"
                  :viewAction="viewAction"
                />

                <DropdowmField
                  :index="index"
                  v-on:dropdown="dropdown_value"
                  :viewAction="viewAction"
                  v-if="
                    index.data_type == 'single_choice' &&
                    index.is_displayed == true
                  "
                />
                <DateField
                  :viewAction="viewAction"
                  v-if="index.data_type == 'date' && index.is_displayed == true"
                  :index="index"
                />
                <NumberField
                  v-if="
                    index.data_type == 'number' && index.is_displayed == true
                  "
                  :index="index"
                  v-on:numberFields="number_value"
                />
                <UrlField
                  v-if="index.data_type == 'link' && index.is_displayed == true"
                  :index="index"
                  v-on:urlInput="url_value"
                  :viewAction="viewAction"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            v-if="actionItem == 'Initiate'"
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize ml-1 cardCss button-corner"
            >Submit</v-btn
          >
          <v-textarea
            dense
            label="Comments"
            outlined
            v-if="actionItem == 'Pending'"
            rows="0"
            auto-grow
            v-model="approvalComments"
          />
          <v-btn
            v-if="actionItem == 'Pending'"
            dark
            @click="validate_aprrovals('APPROVED')"
            :loading="loading"
            color="#4747fe"
            class="text-capitalize ml-1 mt-n7"
            >Approve</v-btn
          >
          <v-btn
            v-if="actionItem == 'Pending'"
            dark
            @click="validate_aprrovals('REJECTED')"
            :loading="loading1"
            color="red"
            class="text-capitalize ml-1 mt-n7"
            >Reject</v-btn
          >
          <v-btn
            v-if="actionItem == 'Pending'"
            dark
            @click="forward_data('FORWARD')"
            :loading="loading1"
            color="#ef3f6e"
            class="text-capitalize ml-1 mt-n7"
            >Forward</v-btn
          >

          <v-select
            v-if="forwardAction == true"
            dense
            outlined
            label="Select User"
            class="ml-2"
            item-text="full_user_name"
            item-value="user_email_id"
            :items="forwardList"
            v-model="forwardUser"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <MiniOverlayComp :overlay="overlay" />
  </div>
</template>
<script>
/* eslint-disable */
// import TextField from "@/components/FormDesigner/FormFields.vue/TextField.vue";
// import NumberField from "@/components/FormDesigner/FormFields.vue/NumberField.vue";
// import CheckboxField from "@/components/FormDesigner/FormFields.vue/CheckboxField.vue";
// import TextAreaField from "@/components/FormDesigner/FormFields.vue/TextAreaField.vue";
// import DropdowmField from "@/components/FormDesigner/FormFields.vue/DropdowmField.vue";
// import DateField from "@/components/FormDesigner/FormFields.vue/DateField.vue";
// import UrlField from "@/components/FormDesigner/FormFields.vue/UrlField.vue";

import MiniOverlayComp from "@/components/MiniOverlayComp.vue";
import CountryList from "@/JsonFiles/CountryList.json";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_designations_details } from "@/mixins/GetDesignations.js";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { workflow_initiates, workflow_appr_rej } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    formViewDailog: Boolean,
    formDetails: Object,
    actionItem: String,
    viewAction: String,
  },
  mixins: [
    get_location_details,
    get_designations_details,
    get_department_details,
    get_all_org_users,
    // update_audit_logs,
  ],
  components: {
    // TextField,
    // NumberField,
    // CheckboxField,
    // TextAreaField,
    // DropdowmField,
    // DateField,
    CountryList,
    MiniOverlayComp,
    // UrlField,
  },
  watch: {
    formViewDailog: {
      async handler() {
        if (this.formViewDailog == true) {
          this.textfieldArray = [];
          if (this.viewAction == "Inititaie") {
            // this.overlay = true;
            this.formCheck = true;
            this.formDisplay = this.formDetails.workflow_template;

            await this.get_location_details();
            await this.get_department_details();
            this.$store.commit("Setnamesearch", this.search);
            await this.get_all_org_users();
            this.fetch_master_lists();

            // this.overlay = false;
          } else if (
            this.viewAction == "Pending" ||
            this.viewAction == "Submited"
          ) {
            this.overlay = true;
            await this.get_location_details();
            await this.get_department_details();
            this.$store.commit("Setnamesearch", this.search);
            await this.get_all_org_users();
            this.fetch_master_lists();
            this.fetch_pending_data();

            this.formDisplay = this.formDetails.workflow_template;
            this.overlay = false;
          } else if (this.viewAction == "Deployed") {
            this.formCheck = true;
            this.formDisplay = this.formDetails.form_template;
          }
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      dropdownValues: [],
      inputDropdownValues: [],
      allCountires: [],
      arrayDetails: [],
      textfieldArray: [],
      numberFieldArray: [],
      dropdownFieldArray: [],
      loading: false,
      formObject: {},
      formDisplay: {},
      formCheck: false,
      approvalComments: "",
      loading1: false,
      overlay: false,
      forwardUser: "",
      forwardList: [],
      forwardAction: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.formCheck = false;
      this.approvalComments = "";
      if (this.viewAction == "Inititaie" || this.viewAction == "Deployed") {
        this.$refs.form.reset();
      }
    },
    forward_data() {
      this.forwardAction = true;
    },
    fetch_pending_data() {
      var array = [];
      array = this.formDetails.workflow_template;

      for (var i = 0; i < array.length; i++) {
        for (let data in this.formDetails.workflow_payload) {
          if (array[i].key == `${data}`) {
            array[i].value = `${this.formDetails.workflow_payload[data]}`;
          }
        }
      }
      this.formCheck = true;
    },

    fetch_master_lists() {
      this.allCountires = [];
      this.arrayDetails = [];
      var countryWithCc = [];
      var masterDepartment = [];
      var masterDesignataion = [];
      var masterLocation = [];
      var masterUsers = [];
      this.forwardList = [];

      this.arrayDetails = this.formDetails.workflow_template;

      CountryList.forEach((element) => {
        countryWithCc.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });

      this.locationList.forEach((element) => {
        masterLocation.push({
          location_name: element.location_name,
        });
      });

      this.departmentList.forEach((element) => {
        masterDepartment.push({
          department_name: element.department_name,
        });
      });

      this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
          masterUsers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });

          this.forwardList.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
          });
        }
      });

      this.arrayDetails.forEach((element) => {
        if (element.input_value == "country_list") {
          element.input_array_value = countryWithCc;
        }
        if (element.input_value == "list_designations") {
          element.input_array_value = masterDesignataion;
        }
        if (element.input_value == "list_departments") {
          element.input_array_value = masterDepartment;
        }
        if (element.input_value == "list_locations") {
          element.input_array_value = masterLocation;
        }
        if (element.input_value == "list_users") {
          element.input_array_value = masterUsers;
        }
      });
    },

    textfield_value(val) {
      this.textfieldArray.push(val);
    },

    number_value(val) {
      this.numberFieldArray.push(val);
    },
    url_value(val) {
      this.textfieldArray.push(val);
    },
    dropdown_value(val) {
      this.dropdownFieldArray.push(val);
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.initiate_action();
      }
    },

    validate_aprrovals(val) {
      this.forwardAction = false;
      if (this.$refs.form.validate()) {
        this.approve_action(val);
      }
    },
    async approve_action(val) {
      if (val == "REJECTED") {
        this.loading1 = true;
      } else {
        this.loading = true;
      }
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(workflow_appr_rej, {
            input: {
              user_email_id: data.user.user_email_id,
              initiate_id: this.formDetails.initiate_id,
              approval_status: val,
              workflow_payload: await this.fetch_approvals_values(),
              comments: this.approvalComments,
              forward_user_email_id:
                val == "FORWARD" ? this.forwardUserEmail : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.workflow_appr_rej);
        this.loading = false;
        this.loading1 = false;
        if (response.Status == "SUCCESS") {
          this.get_audit_message(val, data);
          this.$emit("successMsg", response.Message);
          this.approvalComments = "";
          this.formCheck = false;
        } else {
          this.loading = false;
          this.loading1 = false;
          this.formCheck = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
        this.loading1 = false;
      }
    },
    async initiate_action() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(workflow_initiates, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              workflow_id: this.formDetails.workflow_id,
              workflow_payload: await this.fetch_paylod_values(),
            },
          })
        );

        var response = JSON.parse(result.data.workflow_initiates);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    get_audit_message(val, data) {
      if (val == "APPROVED") {
        var auditPayload = {
          AuditType: "WORKFLOW_ACTION",
          AuditAction: "WORKFLOW_APPROVALS",
          AuditMessage: `${data.user.full_user_name} approved  ${this.formDetails.workflow_name} Workflow`,
        };
      } else if (val == "REJECTED") {
        var auditPayload = {
          AuditType: "WORKFLOW_ACTION",
          AuditAction: "WORKFLOW_REJECTS",
          AuditMessage: `${data.user.full_user_name} rejected  ${this.formDetails.workflow_name} Workflow`,
        };
      } else if (val == "FORWARD") {
        var auditPayload = {
          AuditType: "WORKFLOW_ACTION",
          AuditAction: "WORKFLOW_FORWARED",
          AuditMessage: `${data.user.full_user_name} forwarded ${this.formDetails.workflow_name} Workflow to ${this.forwardUser.full_user_name}`,
        };
      } else if (val == "WITHDRAWN") {
        var auditPayload = {
          AuditType: "WORKFLOW_ACTION",
          AuditAction: "WORKFLOW_WITHDRAWN",
          AuditMessage: `${data.user.full_user_name} withdrawn  ${this.formDetails.workflow_name} Workflow`,
        };
      }

      this.$store.commit("SetAuditActions", auditPayload);
      // this.update_audit_logs();
    },

    fetch_approvals_values() {
      var existingArray = [];
      var newArray = [];
      var updatedObj = {};
      var finalRes = "";
      existingArray = this.formDetails.workflow_template;
      if (this.textfieldArray.length != 0) {
        existingArray.forEach((element) => {
          for (var i = 0; i < this.textfieldArray.length; i++) {
            if (element.key == this.textfieldArray[i].key) {
              newArray.push({
                label: this.textfieldArray[i].key,
                value: this.textfieldArray[i].value,
              });
            }
          }
        });
      }
      if (this.dropdownFieldArray.length != 0) {
        existingArray.forEach((element) => {
          for (var i = 0; i < this.dropdownFieldArray.length; i++) {
            if (element.key == this.dropdownFieldArray[i].key) {
              newArray.push({
                label: this.dropdownFieldArray[i].key,
                value: this.dropdownFieldArray[i].value,
              });
            }
          }
        });
      }
      if (newArray.length != 0) {
        for (const a of newArray) {
          updatedObj = Object.assign(updatedObj, { [a.label]: a.value });
        }
        const concatenatedObj = Object.assign(
          {},
          this.formDetails.workflow_payload,
          updatedObj
        );

        finalRes = concatenatedObj;
      } else {
        finalRes = this.formDetails.workflow_payload;
      }

      return JSON.stringify(finalRes);
    },

    async fetch_paylod_values() {
      var staticArray = [];
      var payloadData = [];
      var obj = {};
      var data = "";
      staticArray = this.formDetails.workflow_template;
      staticArray.forEach((element) => {
        for (var i = 0; i < this.textfieldArray.length; i++) {
          if (element.key == this.textfieldArray[i].key) {
            payloadData.push({
              label: this.textfieldArray[i].key,
              value: this.textfieldArray[i].value,
            });
          }
        }
        for (var i = 0; i < this.dropdownFieldArray.length; i++) {
          if (element.key == this.dropdownFieldArray[i].key) {
            payloadData.push({
              label: this.dropdownFieldArray[i].key,
              value: this.dropdownFieldArray[i].value,
            });
          }
        }
      });

      for (const a of payloadData) {
        obj = Object.assign(obj, { [a.label]: a.value });
      }

      return JSON.stringify(obj);
    },
  },
};
</script>
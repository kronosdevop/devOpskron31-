<template>
  <div>
    <!-- eslint-disable --> 
    <v-dialog :model-value="addEntryDialog" @update:model-value="$emit('update:addEntryDialog', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Add Entry for {{ formInfo.directory_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text
          v-show="$store.getters.GetFormObject.is_directory_designed == false"
        >
          <div class="mt-4">Design Template to add the Entries</div>
        </v-card-text>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-row class="mt-4">
                  <v-col
                    v-for="(index, Idx) in formtemplate"
                    :key="Idx"
                    :cols="Idx === 0 ? '12' : '12 mt-n5'"
                    sm="12"
                    md="12"
                    xs="12"
                  >
                    <TextField
                      v-if="
                        index.data_type == 'string' ||
                        index.data_type == 'paragraph'
                      "
                      :formActionType="formActionType"
                      v-on:textinput="fetch_input_value"
                      :index="index"
                    />
                    <EmailField
                      v-if="index.data_type == 'email'"
                      :formActionType="formActionType"
                      v-on:emailValue="fetch_input_value"
                      :index="index"
                    />
                    <NumberField
                      v-if="index.data_type == 'number'"
                      :formActionType="formActionType"
                      v-on:numberFieldData="fetch_input_value"
                      :index="index"
                    />
                    <CheckboxField
                      v-if="index.data_type == 'checkbox'"
                      :formActionType="formActionType"
                      v-on:checkboxvalue="fetch_input_value"
                      :index="index"
                    />

                    <DateField
                      :formActionType="formActionType"
                      v-if="index.data_type == 'date'"
                      v-on:dateField="fetch_input_value"
                      :index="index"
                    />
                    <DropdowmField
                      v-if="index.data_type == 'single_choice'"
                      :formActionType="formActionType"
                      v-on:dropDownField="fetch_input_value"
                      :index="index"
                    />
                    <TimePicker
                      :formActionType="formActionType"
                      v-if="index.data_type == 'time'"
                      v-on:timeInput="fetch_input_value"
                      :index="index"
                    />
                    <RatingFile
                      class="mt-n1"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'rating'"
                      v-on:ratingField="fetch_input_value"
                      :index="index"
                    />
                    <DividerComp
                      :formActionType="formActionType"
                      v-if="index.data_type == 'divider'"
                      :index="index"
                    />
                    <FlipSwitch
                      class="mt-n2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'boolean'"
                      v-on:flipSwitchh="fetch_input_value"
                      :index="index"
                    />
                    <LabelField
                      class="mt-n2 mb-2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'label'"
                      :index="index"
                    />
                    <MediaField
                      class="mt-n2"
                      v-if="index.data_type == 'media'"
                      v-on:mediaUploaded="fetch_input_value"
                      :formActionType="formActionType"
                      :index="index"
                      :key="componentKey"
                    />
                    <!-- <CountryListField
                      class="mt-n2"
                      :formActionType="formActionType"
                      v-if="index.data_type == 'countrylist'"
                      :index="index"
                    /> -->
                    <ImageviewField
                      :formActionType="formActionType"
                      v-if="index.data_type == 'gallery'"
                      :index="index"
                    />
                    <UrlField
                      :formActionType="formActionType"
                      v-if="
                        index.data_type == 'url' || index.data_type == 'youtube'
                      "
                      :index="index"
                      v-on:urlInput="fetch_input_value"
                    />
                    <!-- <TeamsList
                      :formActionType="formActionType"
                      v-if="index.data_type == 'team_list'"
                      :index="index"
                    />
                    <LoctionList
                      :formActionType="formActionType"
                      v-if="index.data_type == 'location_list'"
                      :index="index"
                    />
                    <DesginationList
                      v-if="index.data_type == 'designation_list'"
                      :formActionType="formActionType"
                      :index="index"
                    />
                    <GroupList
                      v-if="index.data_type == 'group_list'"
                      :formActionType="formActionType"
                      :index="index"
                    /> -->
                    <MobileNumberField
                      v-if="index.data_type == 'phonenumber'"
                      :formActionType="formActionType"
                      v-on:phonenumberData="fetch_input_value"
                      :index="index"
                    />
                    <DateTimeField
                      v-if="index.data_type == 'datetime'"
                      :formActionType="formActionType"
                      v-on:dateTimeVal="fetch_input_value"
                      :index="index"
                    />
                    <YearField
                      v-if="index.data_type == 'year'"
                      :formActionType="formActionType"
                      v-on:yearField="fetch_input_value"
                      :index="index"
                    />
                    <UserMultiChoice
                      v-if="index.data_type == 'multi_choice'"
                      :formActionType="formActionType"
                      v-on:multichoice="fetch_input_value"
                      :index="index"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions
          v-show="formInfo.is_directory_designed == true"
          class="justify-end"
        >
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize ml-1 cardCss button-corner"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import GroupList from "@/components/FormDesigner/ActiiveFileds/GroupList.vue";
import ImageviewField from "@/components/FormDesigner/FormFields/ImageviewField.vue";
import TextField from "@/components/FormDesigner/FormFields/TextField.vue";
import NumberField from "@/components/FormDesigner/FormFields/NumberField.vue";
import CheckboxField from "@/components/FormDesigner/FormFields/CheckboxField.vue";
import TextAreaField from "@/components/FormDesigner/FormFields/TextAreaField.vue";
import DateField from "@/components/FormDesigner/FormFields/DateField.vue";
import DropdowmField from "@/components/FormDesigner/FormFields/DropdowmField.vue";
import TimePicker from "@/components/FormDesigner/FormFields/TimePicker.vue";
import RatingFile from "@/components/FormDesigner/FormFields/RatingFile.vue";
import DividerComp from "@/components/FormDesigner/FormFields/DividerComp.vue";
import FlipSwitch from "@/components/FormDesigner/FormFields/FlipSwitch.vue";
import SnackBar from "@/components/SnackBar.vue";
import EmailField from "@/components/FormDesigner/FormFields/EmailField.vue";
import UrlField from "@/components/FormDesigner/FormFields/UrlField.vue";
import LabelField from "@/components/FormDesigner/FormFields/LabelField.vue";
import MediaField from "@/components/FormDesigner/FormFields/MediaField.vue";
import CountryListField from "@/components/FormDesigner/FormFields/CountryListField.vue";
import { workflow_initiates } from "@/graphql/mutations.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import TeamsList from "@/components/FormDesigner/ActiiveFileds/TeamsList.vue";
import LoctionList from "@/components/FormDesigner/ActiiveFileds/LoctionList.vue";
import DesginationList from "@/components/FormDesigner/ActiiveFileds/DesginationList.vue";
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";

var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { Entry_for_directory } from "@/graphql/mutations.js";

import { API, graphqlOperation } from "aws-amplify";
export default {
  // mixins: [update_audit_logs],
  components: {
    TextField,
    ImageviewField,
    NumberField,
    LoctionList,
    TeamsList,
    CheckboxField,
    TextAreaField,
    DateField,
    DropdowmField,
    TimePicker,
    RatingFile,
    DividerComp,
    FlipSwitch,
    SnackBar,
    EmailField,
    UrlField,
    LabelField,
    MediaField,
    CountryListField,
    DesginationList,
    GroupList,
    MobileNumberField,
    YearField,
    DateTimeField,
    UserMultiChoice,
  },
  props: {
    addEntryDialog: Boolean,
    // formInfo: Object,
  },

  data() {
    return {
      loading: false,
      formValues: [],
      formActionType: "initiate",
      contentdocumentFiles: [],
      uploadload: false,
      regularS3URLsnew: [],
      arrayurls: [],
      signimagesarrayurls: [],
      formInfo: {},
      componentKey: 0,
      formtemplate: null,
    };
  },

  watch: {
    addEntryDialog: {
      async handler() {
        if (this.addEntryDialog == true) {
          this.formInfo = this.$store.getters.GetFormObject;
          this.componentKey += 1;
          this.formValues = [];

          if (
            this.$store.getters.GetUserObj.user.user_type == "OWNER" ||
            this.$store.getters.GetUserObj.user.user_email_id ==
              this.formInfo.directory_created_by
          ) {
            this.formtemplate = this.formInfo.directory_template;
          } else {
            if (this.formInfo.is_directory_enabled_as_extrenal_form == true) {
              var directoryDesignTemplate = this.formInfo.directory_template;
              this.formtemplate = directoryDesignTemplate.filter(
                (item) => item.hide_on_creation === false
              );
            } else {
              this.formtemplate = this.formInfo.directory_template;
            }
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    async close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },

  async  validate_data() {
    const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.initiate_action();
      }
    },

    fetch_input_value(val) {
      this.formValues.push(val);
    },

    async initiate_action() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(Entry_for_directory, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              directory_id: this.formInfo.directory_id,
              workflow_payload: await this.fetch_paylod_values(),
              // summary_field_1: this.formInfo.summary_field_1,
              // summary_field_2:
              //   this.formInfo.summary_field_2 != undefined ||
              //   this.formInfo.summary_field_2 != null
              //     ? this.formInfo.summary_field_2
              //     : undefined,
              // filter_by:
              //   this.formInfo.filter_by != undefined ||
              //   this.formInfo.filter_by != null
              //     ? this.formInfo.filter_by
              //     : undefined,
            },
          })
        );

        var response = JSON.parse(result.data.Entry_for_directory);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.fetch_audit_message();
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

    async fetch_paylod_values() {
      var staticArray = [];
      var payloadData = [];
      var obj = {};
      var data = "";

      staticArray = this.formInfo.directory_template;

      staticArray.forEach((element) => {
        for (var i = 0; i < this.formValues.length; i++) {
          if (element.key == this.formValues[i].key) {
            if (element.data_type == "single_choice") {
              payloadData.push({
                label: this.formValues[i].key,
                value: this.formValues[i].value,
                [element.key + "_text"]: this.formValues[i].text,
              });
            } else {
              payloadData.push({
                label: this.formValues[i].key,
                value: this.formValues[i].value,
              });
            }
          }
        }
      });

      for (const a of payloadData) {
        obj = Object.assign(obj, { [a.label]: a.value });
      }
      const hasNewKey = payloadData.some((a) =>
        Object.keys(a).some((key) => key !== "label" && key !== "value")
      );
      if (hasNewKey) {
        payloadData.forEach((a) => {
          Object.keys(a).forEach((key) => {
            if (key !== "label" && key !== "value") {
              obj[key] = a[key];
            }
          });
        });
      }

      return JSON.stringify(obj);
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "DIRECTORY_ACTION",
        AuditAction: "ADD_DIRECTORY_ENTRY",
        AuditMessage: `${data.user.full_user_name} Added New Entry for   ${this.$store.getters.GetFormObject.directory_name} Directory`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },

    //  async fetch_paylod_values() {
    //   var staticArray = [];
    //   var payloadData = [];
    //   var obj = {};
    //   var data = "";

    //   staticArray = this.formInfo.directory_template;
    //   staticArray.forEach((element) => {
    //     for (var i = 0; i < this.formValues.length; i++) {
    //       if (element.key == this.formValues[i].key) {
    //         payloadData.push({
    //           label: this.formValues[i].key,
    //           value: this.formValues[i].value,
    //         });
    //       }
    //     }
    //   });

    //   for (const a of payloadData) {
    //     obj = Object.assign(obj, { [a.label]: a.value });
    //   }

    //   return JSON.stringify(obj);
    // },
  },
};
</script>
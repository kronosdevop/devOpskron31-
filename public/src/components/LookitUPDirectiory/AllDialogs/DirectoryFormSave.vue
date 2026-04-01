<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="directoryFormDialog"
      @update:model-value="$emit('update:directoryFormDialog', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Publish Form</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  v-model="summarField1"
                  label="Summary Field One*"
                  :rules="[(v) => !!v || 'Required']"
                  item-title="displayLabel"
                  item-value="key"
                  :items="summaryArray"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  v-model="summarField2"
                  label="Summary Field Two"
                  item-title="displayLabel"
                  item-value="key"
                  :items="summaryArray"
                />
              </v-col>
              <v-col v-if="singleChoiceValues.length != 0" cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  v-model="singleChoiceFilter"
                  label="Filter By"
                  item-title="displayLabel"
                  item-value="key"
                  :items="singleChoiceValues"
                />
              </v-col>
            </v-row>
          </v-form>
          <!-- <div class="text-left">Are you sure you want to publish form ?</div> -->
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_form()"
            dark
            class="cardCss"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { custom_directory_design } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    directoryFormDialog: Boolean,
    formDataArray: Array,
  },
  data() {
    return {
      loading: false,
      summarField1: "",
      summarField2: "",
      summaryArray: [],
      singleChoiceValues: [],
      singleChoiceFilter: "",
      newformDataArray: [],
    };
  },

  watch: {
    directoryFormDialog: {
      async handler() {
        if (this.directoryFormDialog == true) {
          // key: this.fetch_keys(element.displayLabel.toLowerCase().replace(/ /g, "_")),
          this.summaryArray = [];
          this.singleChoiceValues = [];

          var allfields = this.formDataArray.slice(1);

          allfields.forEach((element) => {
            if (
              element.type != "MEDIA" &&
              element.backend_type != "LABEL" &&
              element.backend_type != "gallery"
            ) {
              this.summaryArray.push({
                backend_type: element.backend_type,
                type: element.type,
                displayLabel: element.displayLabel,
                key: this.fetch_keys(element),

                fieldOptions: element.fieldOptions,
              });
            }
            if (
              element.backend_type == "single_choice" ||
              element.type == "DROPDOWN"
            ) {
              this.singleChoiceValues.push({
                backend_type: element.backend_type,
                type: element.type,
                displayLabel: element.displayLabel,
                key: this.fetch_keys(element),

                fieldOptions: element.fieldOptions,
              });
            }
          });

          if (this.$store.getters.GetFormObject.is_directory_designed == true) {
            // console.log(this.summaryArray);
            this.summarField1 =
              this.$store.getters.GetFormObject.summary_field_1 || "";
            this.summarField2 =
              this.$store.getters.GetFormObject.summary_field_2 || "";
            this.singleChoiceFilter =
              this.$store.getters.GetFormObject.filter_by || "";
          }
          this.newformDataArray = await this.convertRegualr(this.formDataArray);
          // console.log(this.summarField1);
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    fetch_keys(value) {
      var data = "";
      if (value.type == "TEAMLIST") {
        data = "user_id";
      } else if (value.type == "GROUPLIST") {
        data = "department_name";
      } else if (value.type == "LOCATIONLIST") {
        data = "location_id";
      } else if (value.type == "DESIGNATIONLIST") {
        data = "designation_id";
      } else if (value.type == "COUNTRYLIST") {
        data = "iso_code";
      } else {
        data = value.displayLabel.toLowerCase().replace(/ /g, "_");
      }
      return data;
    },

    async validate_form() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // this.modify_template();
        this.publish_form();
      }
    },
    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }
      return this.arrayurls;
    },
    convertToRegularS3URL(presignedURL) {
      const url = new URL(presignedURL);
      const regularS3URL = url.origin + url.pathname;
      return regularS3URL;
    },

    convertRegualr(array) {
      for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        if (obj.type === "GALLERY") {
          obj.fieldOptions = this.convertArrayToRegularS3URLs(obj.fieldOptions);
        }
      }
      return array;
    },
    async modify_template() {
      let modifiyTemplate = this.newformDataArray;

      if (this.summarField1.displayLabel != undefined) {
        modifiyTemplate.forEach((element) => {
          if (
            element.displayLabel.toLowerCase().replace(/ /g, "_") ==
            this.summarField1.key
          ) {
            element.is_required = true;
          }
        });
      } else if (
        this.summarField2 != "" &&
        this.summarField1.displayLabel != undefined
      ) {
        modifiyTemplate.forEach((element) => {
          if (element.displayLabel == this.summarField1.displayLabel) {
            element.is_required = true;
          }
        });
      } else if (
        this.singleChoiceFilter != "" &&
        this.singleChoiceFilter.displayLabel != undefined
      ) {
        modifiyTemplate.forEach((element) => {
          if (
            element.displayLabel.toLowerCase().replace(/ /g, "_") ==
            this.summarField1.displayLabel
          ) {
            element.is_required = true;
          }
        });
      }

      return JSON.stringify(modifiyTemplate);
    },

    async publish_form() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(custom_directory_design, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
              directory_design_template: await this.modify_template(),
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              is_directory_designed: true,
              action_type: "CUSTOM",
              summary_field_1: this.summarField1,
              summary_field_2:
                this.summarField2 == "" ? undefined : this.summarField2,
              filter_by:
                this.singleChoiceFilter == ""
                  ? undefined
                  : this.singleChoiceFilter,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.custom_directory_design);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response);
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
        // this.$emit("successMsg", "Form Created Successfully");
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
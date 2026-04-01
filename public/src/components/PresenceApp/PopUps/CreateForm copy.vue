<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="formCreationpow" @update:model-value="$emit('update:formCreationDialog', $event)" persistent
      max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create Form</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text v-if="customForm == true" class="mt-4">
          <v-row no-gutters>
            <v-col cols="6">
              <v-card @click="form_library()" height="100px">
                <v-card-text class="justify-center">
                  <v-icon color="primaryColor" large> mdi-form-select </v-icon>
                  <br />
                  <div class="mt-2">Form Library</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card @click="get_custom()" class="ml-2" height="100px">
                <v-card-text class="justify-center">
                  <v-icon color="primaryColor" large>
                    mdi-note-edit-outline</v-icon>
                  <br />
                  <div class="mt-2">Custom Form</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6"> </v-col>
          </v-row>
        </v-card-text>
        <v-card-text class="mt-4">
          <v-form v-if="customForm == false" ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field density="compact" variant="outlined" :rules="[(v) => !!v || 'Required']" label="Form Name"
                  v-model="formName" />
              </v-col>
              <v-col cols="12">
                <v-text-field label="description" variant="outlined" v-model="formDesc"
                  @input="isDescriptionEdited = true" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="customForm == false" class="justify-end">
          <v-btn depressed :loading="loading" @click="validate_data()" dark
            class="cardCss button-corner text-capitalize text-white">
            Next
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable */
import { Worktype_list } from "@/mixins/AllWorkType.js";
import { create_worktype } from "@/graphql/mutations.js";
import { custom_form_creation } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { Handler } from "leaflet";
export default {
  props: {
    formCreationpow: Boolean,
    formDataArray: Array,
    actiontype: String,
  },
  mixins: [Worktype_list],
  data() {
    return {
      formName: "",
      formDesc: "",
      loading: false,
      customForm: false,
      formLibrayCheck: false,
      responseData: {},
      selected_worktype: [],
      isDescriptionEdited: false,
    };
  },
  watch: {
    formCreationpow: {
      async handler() {
        await this.Worktype_list();
        this.selected_worktype = this.worktypeList;
        console.log("selected_worktype", this.selected_worktype);
      },
      immediate: true,
    },
    formName(val) {
      if (!this.isDescriptionEdited) {
        this.formDesc = val;
      }
    }
  },

  methods: {
    close_dialog() {
      //   this.$store.commit("SetformLibrary", false);
      //   this.$store.commit("SetDirectoryForm", false);
      this.$emit("close", 0);
      this.customForm = false;
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        this.$store.commit("SetFormName", this.formName);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);
        this.$store.commit("SetCustomFormDesign", true);
        await this.next_click();
      }
    },

    async next_click() {
      var data = this.$store.getters.GetUserObj;

      try {
        const result = await API.graphql(
          graphqlOperation(create_worktype, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              worktype_name: this.formName,
              worktype_description: this.formDesc,
              worktype_form_template: JSON.stringify(this.formFields),
            }
          })
        )
        const response = JSON.parse(result.data.create_worktype)
        if (response.Status == "SUCCESS") {
          this.responseData = response;
          console.log("response", response)
          // this.$emit("navigateto", response); 
          this.customForm = true;
          this.$refs.form.reset();
        } else {

        }
      } catch (error) {
        console.log("error", error)
      }
    },


    get_custom() {
      this.$store.commit("Setlibraryformtype", "");
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormType", "CUSTOM");
      this.$emit("navigateto", this.responseData);
      this.$emit("successMsg", this.responseData.Message);
      this.customForm = true;
    },

    fetch_form_name(val) {
      this.formDesc = val;
    },

    form_library() {
      this.$store.commit("Setlibraryformtype", "FORM_LIBRARY");
      this.$store.commit("SetformLibrary", true);
      this.$store.commit("SetFormType", "FORMS_LIBRARY");
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetExternalForm", false);
      this.$router.push("/home/PowForms");
      this.formLibrayCheck = true;
    },

    async create_form() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(custom_form_creation, {
            input: {
              form_name: this.formName,
              form_description: this.formDesc,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              action_type:
                this.actiontype == "CRM" ? "CRM_FLOWS" : "CUSTOM_FLOWS",
              product_id:
                this.actiontype == "CRM"
                  ? this.$store.getters.Getproductitems.product_id
                  : undefined,
            },
          }),
        );
        var response = JSON.parse(result.data.custom_form_creation);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          console.log("response data", response);
          this.responseData = response;
          // this.$emit("successMsg", response.Message);
          // this.$emit("navigateto", response);
          this.customForm = true;
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>

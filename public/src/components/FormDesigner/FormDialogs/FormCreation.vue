<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="formCreationDialog"
      @update:model-value="$emit('update:formCreationDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Create Form</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text v-if="customForm == false" class="mt-4">
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
                    mdi-note-edit-outline</v-icon
                  >
                  <br />
                  <div class="mt-2">Custom Form</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6"> </v-col>
          </v-row>
        </v-card-text>
        <v-card-text class="mt-4">
          <v-form v-if="customForm == true" ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Name"
                  @input="fetch_form_name(formName)"
                  v-model="formName"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Description"
                  v-model="formDesc"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="customForm == true" class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable */
import { custom_form_creation } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    formCreationDialog: Boolean,
    formDataArray: Array,
    actiontype: String,
  },
  data() {
    return {
      formName: "",
      formDesc: "",
      loading: false,
      customForm: false,
      formLibrayCheck: false,
    };
  },
  methods: {
    close_dialog() {
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetDirectoryForm", false);
      this.$emit("clicked", 0);
      this.customForm = false;
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.$store.commit("SetFormName", this.formName);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);
        this.$store.commit("SetCustomFormDesign", true);
        this.create_form();
      }
    },

    get_custom() {
      this.$store.commit("Setlibraryformtype", "");
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormType", "CUSTOM");
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
      this.$router.push("/home/Forms");
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
          })
        );
        var response = JSON.parse(result.data.custom_form_creation);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("navigateto", response);
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
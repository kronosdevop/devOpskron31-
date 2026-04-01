<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="createPopup" @update:model-value="$emit('update:createPopup', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            Create
          </div> </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  dense
                  outlined
                  :rules="[(v) => !!v || 'Required']"
                  label=" Name"
                  v-model="formName"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  outlined
                  :rules="[(v) => !!v || 'Required']"
                  label=" Description"
                  v-model="formDesc"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss button-corner text-capitalize"
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
    createPopup: Boolean,
  },
  data() {
    return {
      formName: "",
      formDesc: "",
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        // this.create_form();
      }
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
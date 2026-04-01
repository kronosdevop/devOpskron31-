<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="editFormDialog" @update:model-value="$emit('update:editFormDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >
            <div class="custom-title">
            Edit {{ formName }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <!-- <v-col cols="12">
                <v-text-field
                  dense
                  outlined
                  readonly
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Name"
                  v-model="formName"
                />
              </v-col> -->
              <v-col cols="12">
                <v-textarea
                  dense
                  auto-grow
                  outlined
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Description"
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
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable */
import { edit_form_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    editFormDialog: Boolean,
    formInfo: Object,
  },
  data() {
    return {
      formName: "",
      formDesc: "",
      loading: false,
    };
  },
  watch: {
    editFormDialog: {
      async handler() {
        if (this.editFormDialog == true) {
          this.formName = this.formInfo.form_name;
          this.formDesc = this.formInfo.form_description;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_form();
      }
    },
    async edit_form() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_form_details, {
            input: {
              form_id: this.formInfo.form_id,
              form_description: this.formDesc,
            },
          })
        );
        var response = JSON.parse(result.data.edit_form_details);
        this.loading = false;
        if (response.Status == "success") {
          this.$emit("successMsg", response.Message);
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
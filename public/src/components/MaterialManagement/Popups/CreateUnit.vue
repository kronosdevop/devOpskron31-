<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="unitcreation"
      @update:model-value="$emit('update:unitcreation', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Unit</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="unitName"
                  label="Unit"
                  :rules="[(v) => !!v || 'required ']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="text-capitalize cardCss button-corner"
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
import { create_list_edit_delete_units } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    unitcreation: Boolean,
  },
  data() {
    return {
      loading: false,
      unitName: "",
    };
  },
  watch: {
    unitcreation: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async delete_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(create_list_edit_delete_units, {
              input: {
                material_unit_name: this.unitName,
                organization_id: data.organization.organization_id,
                action_type: "CREATE_UNIT",
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(
            result.data.create_list_edit_delete_units
          );
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
  },
};
</script>
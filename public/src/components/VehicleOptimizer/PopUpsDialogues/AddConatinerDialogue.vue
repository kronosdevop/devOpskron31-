<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="addContainerSizes"
      @update:model-value="$emit('update:addContainerSizes', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Create Item</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  outlined
                  dense
                  label="Cargo Name"
                  :rules="[(v) => !!v || 'Required']"
                  v-model="cargo_name"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Cargo Type"
                  v-model="cargo_type"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Inner Length(mts)"
                  v-model="inner_length"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Inner Width(mts)"
                  v-model="inner_width"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Inner Height(mts)"
                  v-model="inner_height"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Weight(lb)"
                  v-model="max_weight"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="create_Cargo()"
            dark
            class="cardCss mt-n4 button-corner text-capitalize"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { create_edit_delete_cargo_space } from "@/graphql/mutations.js";

export default {
  props: {
    addContainerSizes: Boolean,
  },

  data() {
    return {
      cargo_name: "",
      cargo_type: "",
      inner_height: "",
      inner_width: "",
      inner_length: "",
      max_weight: "",
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    create_Cargo() {
      if (this.$refs.form.validate()) {
        this.create_Cargo_space();
      }
    },

    async create_Cargo_space() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_edit_delete_cargo_space, {
            input: {
              action_type: "CREATE_CARGO_SPACE",
              cargo_space_name: this.cargo_name,
              cargo_space_type: this.cargo_type,
              inner_height_in_mts: this.inner_height,
              inner_length_in_mts: this.inner_length,
              inner_width_in_mts: this.inner_width,
              max_load_in_lb: this.max_weight,
            },
          })
        );
        var response = JSON.parse(result.data.create_edit_delete_cargo_space);
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

<style>
</style>
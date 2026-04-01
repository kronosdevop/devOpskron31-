<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="order_sort" @update:model-value="$emit('update:order_sort', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            Edit Sort order for {{ rowInfo.dashboard_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              :value="sort_number[0]"
              @change="$set(sort_number, 0, $event)"
              dense
              outlined
              :rules="number_rules"
              :max="max"
              :min="min"
              label="Sort Weightage"
              :items="servicecharge"
              v-model="sort_number"
              type="number"
              class="mt-5"
            >
            </v-text-field>
            <div class="d-flex justify-start text-left">
              <i>
                Note :Lower the weightage, higher up in the order of the
                sections in the Dashboard page on the mobile app.</i
              >
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    order_sort: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      max: 999,
      min: 1,
      servicecharge: [],
      sort_number: 1,
      loading: false,

      number_rules: [(v) => /^[0-9]{1,3}$/.test(v) || " Number must be valid"],
    };
  },
  watch: {
    order_sort: {
      async handler() {
        if (this.order_sort == true) {
          this.sort_number =
            this.rowInfo.sort_range == undefined ? 1 : this.rowInfo.sort_range;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async validate_data() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(edit_or_delete_dashboard_topic, {
              input: {
                action_type: "EDIT",
                dashboard_id: this.rowInfo.dashboard_id,
                organization_id: data.organization.organization_id,
                is_visible: this.rowInfo.is_visible,
                sort_range: parseInt(this.sort_number),
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            // this.$refs.form.reset();
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

<style>
</style>
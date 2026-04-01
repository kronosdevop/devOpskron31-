<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="locationdeletion" @update:model-value="$emit('update:locationdeletion', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Delete Loaction Type
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to delete

            <b> {{ rowInfo.location_type }} </b> ?
          </div>
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
import { create_list_edit_location_type } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    locationdeletion: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    locationdeletion: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_location_type, {
            input: {
              action_type: "DELETE",
              organization_id: data.organization.organization_id,
              location_type_id: this.rowInfo.location_type_id,
              location_type_status: "DEACTIVE",
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_location_type);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
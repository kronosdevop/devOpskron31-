<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="deletevisitDialoge" @update:model-value="$emit('update:deletevisitDialoge', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Delete Visit Type</div></v-toolbar-title
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

            <b> {{ rowInfo.visit_type_name }} </b> ?
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
import { delete_visitType } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    deletevisitDialoge: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    deletevisitDialoge: {
      async handler() {
        if (this.deletevisitDialoge == true) {
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(delete_visitType, {
            input: {
              visit_type_id: this.rowInfo.visit_type_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.delete_visitType);
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
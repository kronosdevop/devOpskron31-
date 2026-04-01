<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="phasedeletion"
      @update:model-value="$emit('update:phasedeletion', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Delete Phase</div></v-toolbar-title
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
        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to delete
            <b> {{ projData.phase_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
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
import { create_list_edit_phases } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    phasedeletion: Boolean,
    projData: Object,
  },

  data() {
    return {
      loading: false,
    };
  },
  watch: {
    phasedeletion: {
      async handler() {
        if (this.phasedeletion == true) {
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
      let Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phases, {
            input: {
              project_id: Projecctdetails.project_id,
              phase_id: this.projData.phase_id,
              action_type: "DELETE",
              phase_status: "DEACTIVE",
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.create_list_edit_phases);
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
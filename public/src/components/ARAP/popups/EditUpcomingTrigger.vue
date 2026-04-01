<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      v-model="editTriggers"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Trigger</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            <v-row>
              <!-- Duration Dropdown -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedDuration"
                  :items="durationOptions"
                  item-text="text"
                  item-value="value"
                  label="Duration"
                  outlined
                  dense
                ></v-select>
              </v-col>

              <!-- Preferred Time Dropdown -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="preferredTime"
                  :items="timeOptions"
                  item-text="text"
                  item-value="value"
                  label="Preferred Time"
                  outlined
                  dense
                ></v-select>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutations()"
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
import { assets } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    editTriggers: Boolean,
    triggerItems: Object,
  },
  data() {
    return {
      loading: false,
      selectedDuration: null,
      preferredTime: null,
      durationOptions: Array.from({ length: 7 }, (_, i) => ({
        text: `${i + 1} Day${i + 1 > 1 ? "s" : ""}`,
        value: i + 1,
      })),
      timeOptions: Array.from({ length: 24 }, (_, i) => ({
        text: `${i + 1}:00`,
        value: i + 1,
      })),
    };
  },
  watch: {
    editTriggers: {
      async handler() {
        this.selectedDuration = Number(this.triggerItems.scheduled_date);
        this.preferredTime = Number(this.triggerItems.scheduled_time);
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
          graphqlOperation(assets, {
            input: {
              action_type: "DELETE_ASSET",
              asset_id: this.triggerItems.asset_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.assets);
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
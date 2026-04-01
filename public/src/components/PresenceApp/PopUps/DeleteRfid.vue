<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="rfidDeletion"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <!-- <v-toolbar-title class="ml-2">
            <div class="custom-title">Delete Location</div></v-toolbar-title
          > -->
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
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
          <div class="text-center">
            Are you sure you want to delete the
            <b> {{ rowInfo.box_id }} </b> from

            <b> {{ rowInfo.location_name }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            depressed
            density="compact"
            :loading="loading"
            @click="delete_Entity()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
import { update_rfid_location } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rfidDeletion: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
    };
  },
  watch: {
    rfidDeletion: {
      async handler() {},
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_Entity() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_rfid_location, {
            input: {
              mapping_status: "DEACTIVE",
              location_id: this.rowInfo.location_id,
              mapping_id: this.rowInfo.mapping_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.update_rfid_location);
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
  
  <style>
</style>
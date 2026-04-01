<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="rfidMapping"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Unmap RFID</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to unmap the RFID
            <b> {{ membersItem.rfid }} </b> from

            <b> {{ membersItem.full_user_name }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_Entity()"
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
import { update_user_presence_settings } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rfidMapping: Boolean,
    membersItem: Object,
  },

  data() {
    return {
      loading: false,
    };
  },
  watch: {
    rfidMapping: {
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
          graphqlOperation(update_user_presence_settings, {
            input: {
              user_id: this.membersItem.user_id,
              rfid: "N/A",
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.update_user_presence_settings);
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
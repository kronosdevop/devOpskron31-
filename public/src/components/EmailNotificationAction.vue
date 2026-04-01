<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="enableDisbaleNotification" @update:model-value="$emit('update:enableDisbaleNotification', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >
            <div class="custom-title">
            Enable/Disable Notification
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          Are you sure you want to
          {{ switch1 == true ? "enable" : "disable" }} all the email
          notifications ?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="enable_diable_notification()"
            :loading="loading"
            class="text-capitalize cardCss"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { email_notification_on_off } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    switch1: Boolean,
    enableDisbaleNotification: Boolean,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("emitedValue", this.switch1);
    },

    async enable_diable_notification() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(email_notification_on_off, {
            input: {
              user_email_id: data.user.user_email_id,
              email_notification: this.switch1,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.email_notification_on_off);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
          this.$emit("successValue", this.switch1);
        } else {
          this.loading = false;
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
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="teamJoinDialog" @update:model-value="$emit('update:teamJoinDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Join Discussion Room
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to join
            {{ rowInfo.team_name }} ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="save_action()"
            :loading="loading"
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
var axios = require("axios");
export default {
  props: {
    teamJoinDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    save_action() {
      this.loading = true;

      var current = this.$store.getters.GetUserObj;
      axios({
        method: "POST",
        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/join_team",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
        },
        data: {
          command: "requestAccess",
          organization_id: current.organization.organization_id,
          team_id: this.rowInfo.team_id,
          user_email_id: current.user.user_email_id,
        },
      })
        .then((res) => {
          this.loading = false;
          if (res.data.Status == "SUCCESS") {
            this.$emit("successMsg", res.data.Message);
          } else {
            this.loading = false;
            this.$emit("successMsg", res.data.Message);
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>
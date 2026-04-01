<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="activateDeactivate"
      @update:model-value="activateDeactivate = $event"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              {{
                rowInfo.tag_status == "ACTIVE" ? "Disable Tag" : "Enable Tag"
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          Are you sure you want to
          {{
            rowInfo.tag_status == "ACTIVE"
              ? "disable" + " " + rowInfo.tag_name
              : "enable" + " " + rowInfo.tag_name
          }}
          ?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="enable_diable_notification()"
            :loading="loading"
            class="text-capitalize cardCss text-white"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { create_list_delete_tags } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rowInfo: Object,
    activateDeactivate: Boolean,
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

    async enable_diable_notification() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_delete_tags, {
            input: {
              action_type: "DELETE_TAGS",
              tag_status:
                this.rowInfo.tag_status == "ACTIVE" ? "DEACTIVE" : "ACTIVE",
              tag_id: this.rowInfo.tag_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.create_list_delete_tags);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
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
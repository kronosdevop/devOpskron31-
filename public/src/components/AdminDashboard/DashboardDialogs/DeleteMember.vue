<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="memberdelete" @update:model-value="$emit('update:memberdelete', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Remove Member for
              {{ dashboarditems.dashboard_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to remove
            <b> {{ subscriberitem.client_id }} </b>from the
            {{ dashboarditems.dashboard_name }} ?
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
import { add_remove_member_dashboard } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    memberdelete: Boolean,
    subscriberitem: Object,
    dashboarditems: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    memberdelete: {
      async handler() {
        // console.log(this.subscriberitem);
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
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_remove_member_dashboard, {
            input: {
              dashboard_id: this.dashboarditems.dashboard_id,
              user_id: [this.subscriberitem.user_id],
              organization_id: data.organization.organization_id,
              action_type: "REMOVE",
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.add_remove_member_dashboard);
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
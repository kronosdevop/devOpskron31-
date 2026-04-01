<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="bulkRejectDialog"
      @update:model-value="bulkRejectDialog = $event"
      persistent
      max-width="550"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2"> knock off</v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <div class="font-weight-bold ml-1">
            Are you sure you want to knock off the
            {{ bulkitems.transaction_id }} ?
            <!-- {{bulkitems.initiate_id}}  -->
          </div>
          <v-form ref="form1">
            <v-row class="mt-4" no-gutters>
              <v-col cols="12">
                <v-textarea
                  density="compact"
                  label="Comments"
                  :rules="[(v) => !!v || 'Required']"
                  variant="outlined"
                  rows="0"
                  auto-grow
                  v-model="approvalComments"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_aprrovals()"
            :loading="loading"
            class="text-capitalize cardCss text-white mt-n10 mr-4"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import { aging_knockoff_workflow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    bulkRejectDialog: Boolean,
    bulkitems: Object,
  },

  data() {
    return {
      approvalComments: "",

      loading: false,
    };
  },
  watch: {
    bulkRejectDialog: {
      async handler() {
        if (this.bulkRejectDialog == true) {
        }
      },

      immediate: true,
    },
  },
  methods: {
    async validate_aprrovals() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        await this.bulk_reject_ids();
      }
    },

    async bulk_reject_ids() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(aging_knockoff_workflow, {
            input: {
              user_email_id: data.user.user_email_id,
              initiate_id: this.bulkitems.initiate_id,
              comments: this.approvalComments,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.aging_knockoff_workflow);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
          this.$refs.form1.reset();
        } else {
          this.loading = false;

          // this.formCheck = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form1.reset();
    },
  },
};
</script>
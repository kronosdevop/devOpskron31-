<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="rejectDialog"
      @update:model-value="rejectDialog = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Reject Asset</div></v-toolbar-title
          >
          <v-spacer />
          <!-- <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon> -->
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                Are you sure you want to reject asset request by
                {{ rowData.user_id_text }} ?
              </v-col>
              <v-col cols="12">
                <v-textarea
                  density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'required ']"
                  v-model="reasonforRejection"
                  label="Reason for rejection"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end" style="border-top: 2px solid #eee">
          <v-btn text @click="close_dialog()">Back</v-btn>
          <v-btn color="primary" @click="reject_action()" :loading="loading"
            >Yes</v-btn
          >
        </v-card-actions>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="reject_action()"
            :loading="loading"
            size="small"
            class="text-capitalize cardCss button-corner text-white mt-n6"
            >Yes</v-btn
          >
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { approve_reject_requested_assets } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rejectDialog: Boolean,
    rowData: Object,
  },
  data() {
    return {
      loading: false,
      reasonforRejection: "",
    };
  },
  watch: {
    rejectDialog: {
      async handler() {
        if (this.rejectDialog == true) {
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async reject_action() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(approve_reject_requested_assets, {
            input: {
              initiate_id: this.rowData.responeObj.initiate_id,
              approval_status: "REJECTED",
              asset_dispatch_comments: this.reasonforRejection,
            },
          })
        );
        var response = JSON.parse(result.data.approve_reject_requested_assets);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.reasonforRejection = "";
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    }
    },
  },
};
</script>
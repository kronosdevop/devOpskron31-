<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="bulkapprovalDialog" @update:model-value="$emit('clicked', false)" persistent max-width="550" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >  <div class="custom-title">Bulk Approvals</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <div class="font-weight-bold mt-4 ml-1">
            Are you sure you want to Approve the workflows?
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
            @click="validate_aprrovals()"
            :loading="loading"
            class="text-capitalize cardCss"
            >Approve</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */

import { workflow_bulk_approve } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    bulkapprovalDialog: Boolean,
    allselecctedRecords: Array,
  },

  data() {
    return {
      approvalComments: "",

      loading: false,
    };
  },
  watch: {
    bulkapprovalDialog: {
      async handler() {
        if (this.bulkapprovalDialog == true) {
        }
      },

      immediate: true,
    },
  },
  methods: {
    async validate_aprrovals() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        this.bulk_reject_ids();
      }
    },

    async bulk_reject_ids() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(workflow_bulk_approve, {
            input: {
              user_email_id: data.user.user_email_id,
              initiate_id: this.allselecctedRecords,
              comments: this.approvalComments,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.workflow_bulk_approve);
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
        // console.log(error);
        this.loading = false;
      }
    },

    fetch_all_ids() {
      var array = [];
      this.allselecctedRecords.forEach((element) => {
        array.push(element.initiate_id);
      });
      return array;
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form1.reset();
    },
  },
};
</script>
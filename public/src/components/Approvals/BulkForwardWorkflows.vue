<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="bulkForwardDialog"
      @update:model-value="$emit('clicked', false)"
      persistent
      max-width="550"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Bulk Forward</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form1">
            <v-row class="mt-4" no-gutters>
              <v-col cols="12">
                <v-autocomplete
                  label="Select User"
                  :rules="[(v) => !!v || 'Required']"
                  item-title="full_user_name"
                  item-value="user_email_id"
                  :items="forwardList"
                  v-model="forwardUser"
                  density="compact"
                  variant="outlined"
                  :menu-props="{ maxHeight: 200 }"
                  clearable
                  hide-no-data
                  placeholder="Start typing to search users..."
                ></v-autocomplete>
              </v-col>
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
            >Forward</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { bulk_forward_workflow } from "@/graphql/mutations.js";

import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    bulkForwardDialog: Boolean,
    allselecctedRecords: Array,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      approvalComments: "",
      forwardList: [],
      forwardUser: "",
      search: "",
      loading: false,
    };
  },
  watch: {
    bulkForwardDialog: {
      async handler() {
        if (this.bulkForwardDialog == true) {
          this.$store.commit("Setnamesearch", "");
          this.forwardList=[]
          await this.get_all_org_users();
          this.fetch_details();
        }
      },

      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      // Clear the list once before the loop
      this.forwardList = [];
      
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (element.user_email_id != data.user.user_email_id) {
            this.forwardList.push({
              full_user_name: element.full_user_name,
              user_email_id: element.user_email_id,
            });
          }
        }
      });
      // console.log('Forward list populated with', this.forwardList.length, 'users:', this.forwardList);
    },
    async validate_aprrovals() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        this.bulk_forward_ids();
      }

    },

    async bulk_forward_ids() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(bulk_forward_workflow, {
            input: {
              user_email_id: data.user.user_email_id,
              initiate_id: this.allselecctedRecords,
              forward_user_email_id: this.forwardUser,
              approval_status: "FORWARD",
              comments: this.approvalComments,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.bulk_forward_workflow);
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
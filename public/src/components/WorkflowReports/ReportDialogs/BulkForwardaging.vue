<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="bulkForwardDialog"
      @update:model-value="bulkForwardDialog = $event"
      persistent
      max-width="550"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2"
            >Bulk Forward</v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form1">
            <v-row class="" no-gutters>
              <v-col cols="12">
                <v-autocomplete
                  label="Select User"
                  :rules="[(v) => !!v || 'Required']"
                  item-title="full_user_name"
                  item-value="user_email_id"
                  :items="forwardList"
                  :search-input.sync="search"
                  @input="search = ''"
                  v-model="forwardUser"
                  density="compact"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
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
            dark
            @click="validate_aprrovals()"
            :loading="loading"
            color="#ef3f6e"
            class="text-capitalize"
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
import { aging_forward_workflow } from "@/graphql/mutations.js";
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
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          // if (element.user_email_id != data.user.user_email_id) {
          this.forwardList.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
          });
          // }
        }
      });
    },
    async validate_aprrovals() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        await this.bulk_forward_ids();
      }
    },

    async bulk_forward_ids() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(aging_forward_workflow, {
            input: {
              initiate_id:  this.allselecctedRecords,
              forward_user_email_id: this.forwardUser,
              approval_status: "FORWARD",
              comments: this.approvalComments,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.aging_forward_workflow);
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
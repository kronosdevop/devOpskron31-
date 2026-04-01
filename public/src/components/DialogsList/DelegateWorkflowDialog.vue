<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="delegateDialog"
      @update:model-value="$emit('update:delegateDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Delegate Workflows</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text
          v-if="currentDelelegateAction == false || showeditDialog == 'show'"
        >
          <div>
            Are you sure you want to enable delegation of incoming workflows to?
          </div>
          <v-row no-gutters>
            <v-col cols="12">
              <v-select
                v-model="selectedUser"
                label="Select User"
                density="compact"
                class="mt-4"
                :items="userList"
                style="max-width: 300px"
                item-text="title"
                item-value="value"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text
          class="mt-4"
          v-if="currentDelelegateAction == true && showeditDialog == ''"
        >
          Are you sure you want to cancel workflow delegation ?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="enable_disable_actions()"
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { delegation_on_off } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    userEmail: String,
    currentObject: Object,
    delegateDialog: Boolean,
    delegateOption: Boolean,
    currentDelelegateAction: Boolean,
    delegateEditAction: String,
    showeditDialog: String,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      selectedUser: "",
      userList: [],
      search: "",
      loading: false,
    };
  },
  watch: {
    delegateDialog: {
      async handler() {
        if (this.delegateDialog == true) {
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          if (this.delegateEditAction == "new") {
            this.selectedUser = "";
          } else {
            this.selectedUser = this.currentObject.user.delegated_email_id;
          }

          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("emitValue", this.delegateOption);
      this.selectedUser = "";
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (element.user_email_id != this.userEmail) {
            this.userList.push({
              title: element.full_user_name,
              value: element.user_email_id,
            });
          }
        }
      });
    },

    async enable_disable_actions() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(delegation_on_off, {
            input: {
              user_email_id: data.user.user_email_id,
              delegated_workflow:
                this.currentDelelegateAction == false ? true : false,
              delegated_email_id:
                this.currentDelelegateAction == false
                  ? this.selectedUser
                  : undefined,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.delegation_on_off);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
          this.$emit("successValue", this.delegateOption);
          this.selectedUser = "";
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
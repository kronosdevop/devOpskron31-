<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="tranferOwnerDialog"
      @update:model-value="$emit('update:tranferOwnerDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Transfer Ownership</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="forms">
            <div class="text-left">
              Are you sure you want to transfer ownership of
              <b>{{ rowInfo.Key }}</b> to ?
            </div>
            <div>
              <v-select
                density="compact"
                variant="outlined"
                v-model="selectUser"
                class="mt-2"
                item-title="full_user_name"
                item-value="user_email_id"
                label="Select User"
                :rules="[(v) => !!v || 'required ']"
                :items="userItems"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            size="small"
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss mr-2"
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
import { transfer_ownership_folder } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    tranferOwnerDialog: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      selectUser: "",
      userItems: [],
      loading: false,
      allusers: [],
    };
  },

  watch: {
    tranferOwnerDialog: {
      async handler() {
        if (this.tranferOwnerDialog == true) {
          this.userItems = [];
          await this.get_all_org_users();
          this.orgUsers.forEach((element) => {
            if (
              element.user_status == "ACTIVE" &&
              element.user_type != "CHATBOT" &&
              element.user_email_id != this.rowInfo.folder_created_by_email
            ) {
              this.userItems.push({
                full_user_name: element.full_user_name,
                user_email_id: element.user_email_id,
              });
            }
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    async validate_data() {
      const { valid } = await this.$refs.forms.validate();
      if (valid) {
        this.transfer_ownership();
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },

    async transfer_ownership() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      // console.log(this.entryInfo.responseObject.directory_id);
      try {
        let result = await API.graphql(
          graphqlOperation(transfer_ownership_folder, {
            input: {
              folder_id: this.rowInfo.folder_id,
              transfer_to_email: this.selectUser,
              organization_id: data.organization.organization_id,
              current_user_email: data.user.user_email_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.transfer_ownership_folder);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
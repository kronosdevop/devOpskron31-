<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="ownerupdate"
      @update:model-value="$emit('update:ownerupdate', $event)"
      persistent
      max-width="550"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >Change Owner</v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <div class="mt-4 font-weight-bold">
            Are you sure you want to change the owner?
          </div>
          <v-form ref="form1">
            <v-row class="mt-4" no-gutters>
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
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { change_of_owner_ship } from "@/graphql/mutations.js";

import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    ownerupdate: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      forwardList: [],
      forwardUser: "",
      search: "",
      loading: false,
    };
  },
  watch: {
    ownerupdate: {
      async handler() {
        if (this.ownerupdate == true) {
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
          if (element.user_email_id != data.user.user_email_id) {
            this.forwardList.push({
              full_user_name: element.full_user_name,
              user_email_id: element.user_email_id,
            });
          }
        }
      });
    },
    async validate_aprrovals() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        this.ownershipChange();
      }
    },

    async ownershipChange() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(change_of_owner_ship, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: this.forwardUser,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.change_of_owner_ship);
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
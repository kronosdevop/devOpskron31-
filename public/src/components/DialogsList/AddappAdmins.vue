<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="appAdmins" @update:model-value="$emit('update:appAdmins', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Admins</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  hide-selected
                  placeholder="Min 3 Character"
                  return-object
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { add_and_list_appadmins } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    appAdmins: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      selectTeam: "",
      loading: false,
      searchF: "",
      userArray: [],
    };
  },
  watch: {
    appAdmins: {
      async handler() {
        this.$store.commit("Setnamesearch", this.searchF);
        await this.get_all_org_users();
        this.fetch_details();
      },
      immediate: true,
    },
    async searchF() {
      if (this.searchF != "") {
        if (this.searchF.length >= 3) {
          this.$store.commit("Setnamesearch", this.searchF);
          await this.get_all_org_users();
          await this.fetch_details();
        }
      } else {
        this.$store.commit("Setnamesearch", this.searchF);
        await this.get_all_org_users();
        await this.fetch_details();
      }
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectTeam = "";
      this.$refs.form.resetValidation();
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.grant_admin_access();
      }
    },
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },

    async grant_admin_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_and_list_appadmins, {
            input: {
              action_type: "ADD",
              user_email_id: this.selectTeam.user_id,
              app_id: this.rowInfo.dashboard_id,
            },
          })
        );
        this.loading = false;
        // console.log(result);
        var response = JSON.parse(result.data.add_and_list_appadmins);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.fetch_audit_message();
          this.selectTeam = "";
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    async fetch_audit_message() {
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WEB_ACTION",
        AuditAction: "ADD_APP_ADMIN",
        AuditMessage: ` ${datas.user.full_user_name} added ${this.selectTeam.full_user_name} as  Admin  of ${this.rowInfo.dashboard_name} App  `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>
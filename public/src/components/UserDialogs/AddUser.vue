<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addDialog" @update:model-value="$emit('update:addDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">Add User</v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="firstName"
                  label="First Name*"
                  outlined
                  maxlength="30"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="lastName"
                  label="Last Name"
                  class="ml-2"
                  outlined
                  maxlength="20"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="userEmail"
                  label="Email*"
                  outlined
                  maxlength="30"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  dense
                  v-model="orgPrefix"
                  outlined
                  label="Prefix"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="10">
                <v-text-field
                  dense
                  v-model="memberId"
                  label="Member Id"
                  class="ml-2"
                  outlined
                  maxlength="5"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import axios from "axios";
// import { get_Org_details } from "@/mixins/GetOrgDetails.js";
/* eslint-disable */
// import { create_user } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_member_id } from "@/graphql/queries.js";
export default {
  props: {
    addDialog: Boolean,
  },
  // mixins: [get_Org_details],
  data() {
    return {
      firstName: "",
      lastName: "",
      userEmail: "",
      loading: false,
      memberId: "",
      orgPrefix: "",
    };
  },
  watch: {
    addDialog: {
      async handler() {
        if (this.addDialog == true) {
          this.GetMemberID();
          // await this.get_Org_details();
          // var response = this.orgDetails;
          // this.orgPrefix = this.orgDetails.organization.member_id_prefix;
        }
      },

      immediate: true,
    },
  },
  methods: {
    async GetMemberID() {
      let result = await API.graphql(
        graphqlOperation(get_member_id, {
          input: { organization_id: this.$store.getters.GetUserObj.organization.organization_id },
        })
      );
      // console.log(result,"result");
    },
    close_dialog() {
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },
    validate_data() {
      var valid = true;
      var emailPat =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (this.firstName == "" || this.userEmail == "") {
        valid = false;
        this.$emit("clicked", 1);
      } else if (this.userEmail != "" && !this.userEmail.match(emailPat)) {
        valid = false;
        this.$emit("clicked", 2);
      }
      if (valid) {
        this.loading = true;
        // this.create_user_details();
        this.create_user();
      }
    },
    async create_user() {
      var data = this.$store.getters.GetUserObj;
      await axios({
        method: "POST",
        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/add_user",
        headers: {
          "Content-Type": "application/json",
          // "x-api-key": "ml7kLghDhR971gM4xzJml80t56Jrysxg6gNz1xBh",
        },
        data: {
          first_name: this.firstName,
          last_name: this.lastName == "" ? undefined : this.lastName,
          organization_id: data.organization.organization_id,
          user_email_id: this.userEmail,
          member_id:
            this.memberId == "" ? undefined : this.orgPrefix + this.memberId,
        },
      })
        .then((res) => {
          this.loading = false;
          if (res.data.Status == "SUCCESS") {
            this.currentObject = res.data.details;
            this.$emit("succesMsg", res.data.Message);
            this.$refs.form.reset();
          } else {
            this.$emit("errorMsg", res.data.Message);
          }
        })
        .catch((err) => {
          this.loading = false;
          // this.$emit("errorMsg", err.errors[0].Message);
        });
    },

    async create_user_details() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_user, {
            input: {
              first_name: this.firstName,
              last_name: this.lastName == "" ? undefined : this.lastName,
              organization_id: data.organization.organization_id,
              user_email_id: this.userEmail,
            },
          })
        );
        var response = result.data.create_user;
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("clicked", 3);
          this.$emit("succesMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errorType.errorMessage);
        this.loading = false;
      }
    },
  },
};
</script>
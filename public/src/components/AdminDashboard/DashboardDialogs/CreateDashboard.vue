<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="Create_dash_board" @update:model-value="$emit('update:Create_dash_board', $event)" persistent max-width="900" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">
          Create Dashboard
          </div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row>
            <v-col cols="6">
              <v-text-field
                outlined
                dense
                style="max-width: 400px"
                label="Name"
                :rules="name_rule"
                :counter="25"
                v-model="dashboard_name"
              />
              <v-textarea
                outlined
                dense
                :rules="description_rule"
                style="max-width: 400px"
                :counter="100"
                label="Description"
                v-model="description"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                outlined
                :items="Dashboard_item"
                item-text="name"
                item-value="value"
                dense
                style="max-width: 400px"
                label="Dashboard Type"
                v-model="dashboard_typee"
              />
              <v-select
                outlined
                :items="feed_item"
                item-text="name"
                v-if="dashboard_typee == 'FEED'"
                item-value="value"
                dense
                style="max-width: 400px"
                label="Feed Type"
                v-model="feed_typee"
              />
              <v-text-field
                v-model="idaccount"
                v-if="feed_typee == 'AWS_COST' && dashboard_typee == 'FEED'"
                outlined
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Account ID"
              />
              <v-text-field
                v-model="screatkey"
                outlined
                v-if="feed_typee == 'AWS_COST' && dashboard_typee == 'FEED'"
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Secret key"
              />
              <v-text-field
                v-model="accesskey"
                outlined
                v-if="feed_typee == 'AWS_COST' && dashboard_typee == 'FEED'"
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Access key"
              />
              <v-text-field
                v-model="clientid"
                outlined
                v-if="feed_typee == 'AZURE_COST' && dashboard_typee == 'FEED'"
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Client Id"
              />
              <v-text-field
                v-model="clientscret"
                outlined
                v-if="feed_typee == 'AZURE_COST' && dashboard_typee == 'FEED'"
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Secret  key"
              />
              <v-text-field
                v-model="subscription_id"
                outlined
                v-if="feed_typee == 'AZURE_COST' && dashboard_typee == 'FEED'"
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Subscription Id"
              />
              <v-text-field
                v-model="tenant_id"
                outlined
                v-if="feed_typee == 'AZURE_COST' && dashboard_typee == 'FEED'"
                dense
                style="max-width: 400px"
                :rules="[(v) => !!v || 'Required']"
                label="Tenant Id"
              />
              <v-row>
                <v-col cols="10">
                  <v-select
                    outlined
                    :items="types_item"
                    dense
                    style="max-width: 400px"
                    label="Security Type"
                    v-model="dashboard_type"
                  />
                </v-col>
                <v-col cols="2">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-icon class="mt-2" v-bind="attrs" v-on="on"
                        >mdi-help-circle</v-icon
                      >
                    </template>
                    <span
                      >Open<br />
                      Restricted</span
                    >
                  </v-tooltip>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-if="dashboard_type == 'RESTRICTED'"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'Required']"
                    style="max-width: 400px"
                    class="mt-n6"
                    label="Password"
                    v-model="Password"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="create_dashboard()"
          dark
          class="cardCss button-corner text-capitalize"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  <script>
import { createDashboard } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    Create_dash_board: Boolean,
  },
  data() {
    return {
      loading: false,
      dashboard_name: "",
      dashboard_typee: "",
      subscription_id: "",
      feed_typee: "",
      screatkey: "",
      idaccount: "",
      clientid: "",
      clientscret: "",
      accesskey: "",
      tenant_id: "",
      awscostobject: {},
      azureobject: {},
      description: "",
      dashboard_type: "",
      Password: "",
      Dashboard_item: [
        { name: "Dashboard", value: "DASHBOARD" },
        { name: "Feed", value: "FEED" },
      ],
      feed_item: [
        { name: "AWS Cost", value: "AWS_COST" },
        { name: "Azure Cost", value: "AZURE_COST" },
      ],
      types_item: ["OPEN", "RESTRICTED"],
      name_rule: [
        (v) => !!v || "Required",
        // (v) => v.length <= 25 || "Max 25 characters",
        // (v) => v.trim().length != 0 || "Name Cannot be empty",
      ],
      description_rule: [
        (v) => !!v || "Required",
        // (v) => v.length <= 100 || "Max 100 characters",
        // (v) => v.trim().length != 0 || "Description Cannot be empty",
      ],
    };
  },

  methods: {
    close_dialog() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();

      this.$emit("clicked", 0);
    },
    create_dashboard() {
      if (this.$refs.form.validate()) {
        this.awscostobject = {
          account_id: this.idaccount,
          accesskey: this.accesskey,
          secretkey: this.screatkey,
        };
        this.azureobject = {
          client_id: this.clientid,
          client_secrect: this.clientscret,
          subscription_id: this.subscription_id,
          tenant_id: this.tenant_id,
        };

        this.Createdash_board();
      }
    },
    async Createdash_board() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(createDashboard, {
            input: {
              dashboard_name: this.dashboard_name,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              dashboard_description: this.description,
              dashboard_security: this.dashboard_type,
              dashboard_password:
                this.dashboard_type == "RESTRICTED" ? this.Password : "NONE",
              dashboard_publish_type: this.dashboard_typee,
              dashboard_feed_type:
                this.dashboard_typee == "FEED" ? this.feed_typee : undefined,
              dashboard_account_details:
                this.dashboard_typee == "FEED"
                  ? this.feed_typee == "AWS_COST"
                    ? JSON.stringify(this.awscostobject)
                    : JSON.stringify(this.azureobject)
                  : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.createDashboard);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
  
  <style>
</style>
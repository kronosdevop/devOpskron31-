<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="formDeployed" @update:model-value="$emit('update:formDeployed', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              {{
                actionItem.label == "deployed" ? "Undeploy Flow" : "Deploy Flow"
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left" v-if="actionItem.label == 'deployed'">
            Are you sure you want to undeploy
            <b> {{ actionItem.Info.workflow_name }}</b> ?
          </div>
          <div class="text-left" v-else>
            Are you sure you want to deploy
            <b>{{ actionItem.Info.workflow_name }} </b>?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="deploy_workflow()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white"
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
import { publish_and_unpublish_flows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    formDeployed: Boolean,
    actionItem: Object,
  },
  data() {
    return {
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async deploy_workflow() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(publish_and_unpublish_flows, {
            input: {
              organization_id: data.organization.organization_id,
              workflow_id: this.actionItem.Info.workflow_id,
              workflow_deploy_status:
                this.actionItem.Info.workflow_deploy_status == "DEPLOY"
                  ? "UNDEPLOY"
                  : "DEPLOY",
            },
          })
        );
        var response = JSON.parse(result.data.publish_and_unpublish_flows);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
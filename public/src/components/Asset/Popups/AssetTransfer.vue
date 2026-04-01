<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="transferingasset"
      @update:model-value="transferingasset = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Asset Transfer</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-2">
              <v-col cols="12">
                <v-autocomplete
                  v-model="assetHead"
                  label="Transfer To"
                  :items="masterUsers"
                  :search-input.sync="searchF"
                  item-text="title"
                  item-value="value"
                  :rules="[(v) => !!v || 'required ']"
                  density="compact"
                  variant="outlined"
                  hide-no-data
                  hide-selected
                  return-object
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss mt-n4 button-corner text-white"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { transfer_asset } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  props: {
    transferingasset: Boolean,
    assetitems: Object,
  },
  mixins: [get_all_users],
  data() {
    return {
      assetHead: "",
      masterUsers: [],
      searchF: null,
      loading: false,
    };
  },
  watch: {
    transferingasset: {
      async handler() {
        if (this.transferingasset == true) {
          await this.get_all_users();
          await this.fetch_users();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    fetch_users() {
      this.masterUsers = [];
      this.listUsers.forEach((element) => {
        if (element.user_email_id != this.assetitems.asset_assined_to) {
          this.masterUsers.push({
            title: element.full_user_name,
            value: element.user_email_id,
          });
        }

        this.masterUsers.sort((a, b) => a.title.localeCompare(b.title));
      });
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.asset_transfering();
      }
    },

    async asset_transfering() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(transfer_asset, {
            input: {
              current_user_email: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              asset_id: this.assetitems.asset_id,
              transfer_asset_email: this.assetHead.value,
              asset_tranfered_to_name: this.assetHead.title,
            },
          })
        );
        var response = JSON.parse(result.data.transfer_asset);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          // this.fetch_audit_message();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "ASSET_ACTION",
        AuditAction: "ASSET_TRANSFER",
        AuditMessage: `${data.user.full_user_name} initiated Asset Transfer Workflow`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>
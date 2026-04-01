<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assetactivation"
      @update:model-value="assetactivation = $event"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Retire Asset</div></v-toolbar-title
          >
          <v-spacer />
          <!-- <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon> -->
        </v-toolbar>
        <v-card-text class="">
          <div class="text-left">
            Are you sure you want to
            {{
              adminassetItems.asset_status == "ACTIVE" ? "Retire" : "Acquire"
            }}
            the

            <b> {{ adminassetItems.asset_prefix }} </b> ?
          </div>
          <v-form ref="form">
            <v-select
              density="compact"
              variant="outlined"
              label="Reason"
              style="max-width: 350px"
              v-model="assetreason"
              :items="reasonitems"
              v-if="adminassetItems.asset_status != 'DEACTIVE'"
              :rules="[(v) => !!v || 'required ']"
              item-text="title"
              item-value="value"
              class="mt-5"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end" style="border-top: 2px solid #eee">
          <v-btn text @click="close_dialog()">Cancel</v-btn>
          <v-btn color="primary" @click="delete_mutation()" :loading="loading"
            >Update</v-btn
          >
        </v-card-actions>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            size="small"
            class="text-capitalize cardCss button-corner text-white mt-n6"
          >
            Yes
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { assets, asset_retire } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    assetactivation: Boolean,
    adminassetItems: Object,
  },
  data() {
    return {
      loading: false,
      reasonitems: [],
      assetreason: "",
    };
  },
  watch: {
    assetactivation: {
      async handler() {
        await this.fetch_assetretire();
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
    async delete_mutation() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(assets, {
              input: {
                asset_id: this.adminassetItems.asset_id,
                action_type: "UPDATE_ASSET_STATUS",
                asset_status:
                  this.adminassetItems.asset_status != "ACTIVE"
                    ? "ACTIVE"
                    : "RETIRED",
                asset_retire_reason: this.assetreason,
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.assets);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
    async fetch_assetretire() {
      this.reasonitems = [];
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_retire, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_RETIRE_REASON",
            },
          })
        );
        var response = JSON.parse(result.data.asset_retire);

        if (response.Status == "SUCCESS") {
          var suppliereRecords = response.data;

          suppliereRecords.forEach((element) => {
            this.reasonitems.push({
              title: element.retire_reason,
              value: element.retire_reason,
            });
          });
        } else {
          this.reasonitems = [];
        }
      } catch (error) {
        this.reasonitems = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
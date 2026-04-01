<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="assettagged"
      @update:model-value="assettagged = $event"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Tag / Untag Asset</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to
            {{
              adminassetItems.asset_tagged_status == "UNTAGGED "
                ? "Tag QR"
                : "Untag QR"
            }}
            the

            <b> {{ adminassetItems.asset_prefix }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
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
import { assets } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    assettagged: Boolean,
    adminassetItems: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    assettagged: {
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
                  : "DEACTIVE",
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
    },
  },
};
</script>
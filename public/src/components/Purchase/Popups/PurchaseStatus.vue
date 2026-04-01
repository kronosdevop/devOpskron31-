<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="purchaseUpdate" @update:model-value="$emit('update:purchaseUpdate', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Purchase Status</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            Is the <b> {{ rowInfo.material_name }} </b> delivered to the
            <b> {{ rowInfo.location_name }} </b>?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="status_update()"
            dark
            class="text-capitalize cardCss button-corner"
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
import { apprv_rej_purchase_orders } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    purchaseUpdate: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    purchaseUpdate: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async status_update() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(apprv_rej_purchase_orders, {
            input: {
              // order_dispatch_comments: "",
              order_delivery_status: "COMPLETED",
              initiate_id: this.rowInfo.initiate_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.apprv_rej_purchase_orders);
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
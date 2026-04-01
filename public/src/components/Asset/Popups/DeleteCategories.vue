<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriesdeletion"
      @update:model-value="categoriesdeletion = $event"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <!-- <v-toolbar-title class="ml-2">
            <div class="custom-title">Delete Categories</div></v-toolbar-title
          > -->
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="">
          <div class="text-center">
            Are you sure you want to delete

            <b> {{ categoriesItem.category_name }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
          Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
        <script>
/* eslint-disable */
import { asset_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    categoriesdeletion: Boolean,
    categoriesItem: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    categoriesdeletion: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_categories, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "DELETE_CATEGORY",
              category_id: this.categoriesItem.category_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.asset_categories);
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
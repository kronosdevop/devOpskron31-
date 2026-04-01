<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="deleteBusinessType"
      @update:model-value="deleteBusinessType = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Delete Business Type</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <div class="text-body-1 mb-4">
            Are you sure you want to delete the business type
            <strong>"{{ businessTypeItem.bussinesstypes_name }}"</strong>?
          </div>
          <div class="text-body-2 text-grey">
            This action cannot be undone.
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="close_dialog()"
            variant="outlined"
            size="small"
            class="mr-2"
          >
            Cancel
          </v-btn>
          <v-btn
            @click="delete_mutation()"
            :loading="loading"
            dark
            size="small"
            color="red"
            class="text-capitalize"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { create_list_edit_bussinesstype } from "@/graphql/mutations.js";

export default {
  props: {
    deleteBusinessType: Boolean,
    businessTypeItem: Object,
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
    async delete_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_bussinesstype, {
            input: {
              action_type: "DELETE",
              bussinesstype_id: this.businessTypeItem.bussinesstype_id,
            },
          })
        );
        var response = JSON.parse(result.data.create_list_edit_bussinesstype);
        
        this.loading = false;
        
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.close_dialog();
        } else {
          this.$emit("errorMsg", response.Message || "Failed to delete business type");
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors?.[0]?.message || "Error deleting business type");
      }
    },
  },
};
</script>

<style scoped>
.navBar {
  background: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0;
}

.custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 18px;
}
</style>


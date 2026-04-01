<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogDeleteCategory" max-width="400px" persistent>
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Delete Category</span>
          <v-btn
            icon
            variant="text"
            @click="DialogDeleteCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div class="d-flex justify-center mt-3">
          Do you want to delete {{ StoreObj.category_name }}?
        </div>

        <v-card-actions class="d-flex justify-end">
          <v-btn
            rounded="xl"
            color="primary"
            @click="DeleteCategory"
            :loading="loading"
          >
            Delete
            <template #loader>
              <v-progress-circular indeterminate color="primary" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_category } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogDeleteCategory: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    loading: false,

    SnackBarComponent: {},
  }),

  methods: {
    DialogDeleteCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async DeleteCategory() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_category, {
            input: {
              action_type: "DELETE",
              category_id: this.StoreObj.category_id,
            },
          })
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_category
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.$emit("refresh-list");
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogDeleteCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to update category, try again!",
        };
      }
      this.loading = false;
    },
  },
};
</script>

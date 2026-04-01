<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogDeleteCategory" max-width="450px" persistent>
      <v-card class="d-flex justify-center" rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Delete Question </span>
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

        <!--Text field-->
        <div class="text-center pa-4 font-weight-bold">
          Are you sure you want to delete category -
          {{ StoreObj.splay_category_name }}?
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n4">
          <v-btn
            variant="flat"
            size="small"
            color="primary"
            @click="DeleteQuestion"
            :loading="loading"
          >
            Delete
            <template #loader>
              <v-progress-circular indeterminate color="white" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_splay_categories } from "@/graphql/mutations";
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
    async DeleteQuestion() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_categories, {
            input: {
              action_type: "DELETE",
              splay_category_id: this.StoreObj.splay_category_id,
            },
          }),
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_splay_categories,
        );
        if (resultObj && resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogDeleteCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to delete question, try again",
        };
      }
      this.loading = false;
    },
    DialogDeleteCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>

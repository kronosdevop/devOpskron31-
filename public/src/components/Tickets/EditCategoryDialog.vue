<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogEditCategory" max-width="350px">
      <v-card rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Edit Category</span>
          <v-btn
            icon
            variant="text"
            @click="DialogEditCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="form" class="pa-5">
          <v-text-field
            v-model="edit_category_name"
            label="Category Type"
            variant="outlined"
            density="compact"
            rounded="xl"
            width="300"
            :rules="[(v) => !!v || 'Required']"
          />
        </v-form>

        <v-card-actions class="mt-n10">
          <v-btn
            class="text-white mr-4"
            variant="flat"
            color="primary"
            rounded="lg"
            @click="ValidateForm"
            :loading="loading"
          >
            <v-icon color="white">mdi-content-save</v-icon>
            Update
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
import { create_list_edit_delete_category } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogEditCategory: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    edit_category_name: "",

    loading: false,

    SnackBarComponent: {},
  }),

  watch: {
    DialogEditCategory(val) {
      if (val) {
        this.edit_category_name = this.StoreObj.category_name;
      }
    },
  },

  methods: {
    DialogEditCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.EditCategory();
      }
    },
    async EditCategory() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_category, {
            input: {
              action_type: "UPDATE",
              category_name: this.edit_category_name,
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
            SnackbarText: resultObj.Message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogEditCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to update category, try again!",
        };
      }
      this.loading = false;
    },
  },
};
</script>

<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogAddCategory" max-width="350px" persistent>
      <v-card rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Add Category</span>
          <v-btn
            icon
            variant="text"
            @click="DialogAddCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="form" class="pa-5">
          <v-text-field
            v-model="category_name"
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
            <v-icon color="white">mdi-plus</v-icon>
            Add
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
  props: { DialogAddCategory: Boolean },

  components: { SnackBar },

  data: () => ({
    category_name: "",

    loading: false,

    SnackBarComponent: {},
  }),

  watch: {
    DialogAddCategory(val) {
      if (!val) {
        this.$refs.form.reset();
      }
    },
  },

  methods: {
    DialogAddCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.AddCategory();
      }
    },
    async AddCategory() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_category, {
            input: {
              action_type: "CREATE",
              category_name: this.category_name,
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
        }
        this.loading = false;
        this.DialogAddCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to add category, try again",
        };
      }
      this.loading = false;
    },
  },
};
</script>

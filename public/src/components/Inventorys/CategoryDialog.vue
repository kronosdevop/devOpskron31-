<template>
  <v-dialog
    :model-value="dialog"
    persistent
    max-width="420"
    transition="dialog-top-transition"
  >
    <v-card class="rounded-xl">
      <v-card-title class="d-flex justify-space-between">
        <span class="font-weight-bold">
          {{ editingCategory ? "Edit Category" : "Add Category" }}
        </span>
        <v-btn icon variant="text" @click="close_dialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="categoryForm.category_name"
            label="Category Name"
            variant="outlined"
            :rules="[v => !!v || 'Required']"
          />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close_dialog">Cancel</v-btn>
        <v-btn color="primary" :loading="loading" @click="save_category">
          {{ editingCategory ? "Update" : "Create" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { items_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "CategoryDialog",
  props: {
    dialog: Boolean,
    editingCategory: Object,
  },

  data() {
    return {
      loading: false,
      categoryForm: {
        category_name: "",
      },
    };
  },

  watch: {
    editingCategory: {
      immediate: true,
      handler(val) {
        this.categoryForm = val
          ? { ...val }
          : { category_name: "" };
      },
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked");
      this.$refs.form?.reset();
      this.$refs.form?.resetValidation();
    },

    async save_category() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.loading = true;

      try {
        const result = await API.graphql(
          graphqlOperation(items_categories, {
            input: {
              category_id: this.editingCategory?.category_id,
              category_name: this.categoryForm.category_name,
              action_type: this.editingCategory ? "UPDATE" : "CREATE",
            },
          })
        );

        const res = JSON.parse(result.data.items_categories);
        res.Status === "SUCCESS"
          ? this.$emit("successMsg", res.Message)
          : this.$emit("errorMsg", res.Message);
      } catch (e) {
        this.$emit("errorMsg", e.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

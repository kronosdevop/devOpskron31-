<template>
  <div>
    <v-dialog
      :model-value="dialog"
      @update:model-value="$emit('update:dialog', $event)"
      persistent
      max-width="420"
      transition="dialog-top-transition"
    >
      <v-card class="pa-0 rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
          <span class="font-weight-bold text-h5">{{ editingUnit ? "Edit Unit" : "Add Unit" }}</span>
          <v-btn icon variant="text" @click="close_dialog()" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="px-6 py-5">
          <v-form ref="form">
            <v-text-field
              variant="outlined"
              density="comfortable"
              v-model="unitForm.unit_name"
              label="Full Name"
              :rules="[(v) => !!v || 'Full name is required']"
              class="mb-4"
            />
            <v-text-field
              variant="outlined"
              density="comfortable"
              v-model="unitForm.short_name"
              label="Short Name"
              maxlength="5"
              @input="unitForm.short_name = $event.target.value.toUpperCase()"
              :rules="[(v) => !!v || 'Short name is required']"
            />
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 justify-end">
          <v-btn text @click="close_dialog()">Cancel</v-btn>
          <v-btn
            color="primary"
            class="ml-2"
            :loading="loading"
            @click="save_unit()"
          >
            {{ editingUnit ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_units } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "UnitDialog",
  props: {
    dialog: Boolean,
    editingUnit: Object,
  },
  data() {
    return {
      loading: false,
      unitForm: {
        unit_name: "",
        short_name: "",
      },
    };
  },
  watch: {
    editingUnit: {
      handler(newVal) {
        if (newVal) {
          // Editing mode - populate form with existing data
          this.unitForm = { ...newVal };
        } else {
          // Add mode - reset form
          this.unitForm = { unit_name: "", short_name: "" };
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.unitForm = { unit_name: "", short_name: "" };
    },
    async save_unit() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(create_list_edit_delete_units, {
              input: {
                unit_id:this.editingUnit ? this.editingUnit.unit_id : undefined,
                unit_name: this.unitForm.unit_name,
                short_name: this.unitForm.short_name,
                organization_id: data.organization.organization_id,
                action_type: this.editingUnit ? "EDIT" : "CREATE",
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(
            result.data.create_list_edit_delete_units
          );
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-btn[variant="text"] {
  color: #888;
}
</style>

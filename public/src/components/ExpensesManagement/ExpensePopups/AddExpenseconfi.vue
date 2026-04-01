<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addConfiguration"
      @update:model-value="$emit('update:addConfiguration', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Add Expense Category
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="expenseName"
                  label="Name"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <!-- <v-select
                  dense
                  v-model="expensecategory"
                  label="Expense Category"
                  :items="expensecategoryitems"
                  item-text="label"
                  item-value="value"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-select> -->
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { create_expense_category } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addConfiguration: Boolean,
  },

  data() {
    return {
      expenseName: "",

      // expensecategory: "",
      // expensecategoryitems: [],
      loading: false,
    };
  },
  watch: {
    addConfiguration: {
      async handler() {
        if (this.addConfiguration == true) {
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },

    async validate_data() {
      const { valid } = await this.$refs.form?.validate?.();
      if (valid) {
        this.create_master_designations();
      }
    },
    async create_master_designations() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_expense_category, {
            input: {
              // team_name: this.broadcastName,

              organization_id: data.organization.organization_id,
              expense_name: this.expenseName,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.create_expense_category);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("categoeryRefresh", "refresh");
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
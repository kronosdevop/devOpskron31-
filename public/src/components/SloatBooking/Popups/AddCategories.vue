<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriesAddition"
      @update:model-value="$emit('update:categoriesAddition', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="">Add Categories</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="categoriesName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            size="small"
            class="text-capitalize cardCss button-corner"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
import { slot_category } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    categoriesAddition: Boolean,
  },
  data() {
    return {
      categoriesName: "",

      loading: false,
    };
  },
  watch: {
    categoriesAddition: {
      async handler() {},
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(slot_category, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              slot_category_name: this.categoriesName,
              action_type: "CREATE",
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.slot_category);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.$refs.form.reset();
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
  
  <style>
</style>
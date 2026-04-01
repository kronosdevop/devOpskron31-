<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addConfiguration" @update:model-value="$emit('update:addConfiguration', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title"> Create Category
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="categoryName"
                  label="Name"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
      <script>
/* eslint-disable */
import { create_categories_for_product } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addConfiguration: Boolean,
  },

  data() {
    return {
      categoryName: "",
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

    validate_data() {
      if (this.$refs.form.validate()) {
        this.create_master_designations();
      }
    },
    async create_master_designations() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_categories_for_product, {
            input: {
              // team_name: this.broadcastName,

              organization_id: data.organization.organization_id,
              categorie_name: this.categoryName,
              product_id: this.$store.getters.Getproductitems.product_id,
              // categorie_description:
              create_by: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.create_categories_for_product);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("serviceRefresh", "refresh");
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
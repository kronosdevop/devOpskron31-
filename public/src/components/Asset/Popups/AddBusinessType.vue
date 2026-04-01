<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createBusinessType"
      @update:model-value="createBusinessType = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Add Business Type</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="businessTypeName"
                  label="Business Type Name*"
                  :rules="[(v) => !!v || 'Required']"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
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
            @click="validate_data()"
            :loading="loading"
            dark
            size="small"
            class="text-capitalize cardCss"
          >
            Add
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
    createBusinessType: Boolean,
  },
  data() {
    return {
      businessTypeName: "",
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.businessTypeName = "";
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
        this.$refs.form.reset();
      }
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_bussinesstype, {
            input: {
              action_type: "CREATE",
              bussinesstypes_name: this.businessTypeName,
            },
          })
        );
        var response = JSON.parse(result.data.create_list_edit_bussinesstype);
        
        this.loading = false;
        
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.close_dialog();
        } else {
          this.$emit("errorMsg", response.Message || "Failed to add business type");
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors?.[0]?.message || "Error adding business type");
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

.cardCss {
  background: #db4c77 !important;
}
</style>


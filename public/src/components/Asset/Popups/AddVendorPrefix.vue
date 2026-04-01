<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="addPrefixDialog"
      @update:model-value="addPrefixDialog = $event"
      persistent
      max-width="450"
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-lg">
        <v-toolbar elevation="0" dark dense class="navBar rounded-t-lg">
          <v-toolbar-title class="text--white ml-2">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-identifier</v-icon>
              <span>{{
                prefixData == undefined ? "Add Prefix" : "Edit Prefix"
              }}</span>
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="close_dialog()" class="mr-2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form">
            <div class="text-body-2 mb-4 grey--text">
              Set a prefix for vendor identification. This will be used to
              generate unique vendor IDs.
            </div>

            <v-text-field
              v-model="prefix"
              label="Prefix*"
              variant="outlined"
              density="compact"
              :maxlength="5"
              :rules="prefixRules"
              placeholder="Enter 3-5 characters"
              prepend-inner-icon="mdi-identifier"
              @input="prefix = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '')"
              clearable
            >
              <template v-slot:append>
                <v-chip size="small" color="primary" variant="flat">
                  {{ prefix.length }}/5
                </v-chip>
              </template>
            </v-text-field>

            <div class="text-caption grey--text mt-2">
              <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
              Only uppercase letters and numbers are allowed (3-5 characters)
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            @click="close_dialog()"
            variant="outlined"
            class="mr-3"
            size="large"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="loading"
            @click="validateAndsave()"
            color="primary"
            class="text-capitalize"
            size="large"
            prepend-icon="mdi-plus"
          >
            {{ prefixData == undefined ? "Add Prefix" : "Update Prefix" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { create_organization_prefixs } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addPrefixDialog: Boolean,
    prefixData: String,
  },

  data() {
    return {
      prefix: "",
      prefixRules: [
        (v) => !!v || "Prefix is required",
        (v) => /^[A-Z0-9]+$/.test(v) || "Only letters and numbers allowed",
        (v) => v.length >= 3 || "Minimum 3 characters",
        (v) => v.length <= 5 || "Maximum 5 characters",
      ],
      loading: false,
    };
  },

  watch: {
    addPrefixDialog: {
      immediate: true,
      async handler() {
        const preData = this.prefixData;
        this.prefix = preData || "";
        // console.log("Prefix initialized as:", this.prefix);
      },
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      // this.$refs.form.reset();
    },
    async validateAndsave() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.Add_Prefix();
      } 
    },

    async Add_Prefix() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(create_organization_prefixs, {
            input: {
              organization_id: data.organization.organization_id,
              prefix_name: this.prefix,
              prefix_type: "VENDOR",
            },
          })
        );
        var response = JSON.parse(result.data.create_organization_prefixs);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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

<style scoped>
.rounded-lg {
  border-radius: 12px !important;
}

.rounded-t-lg {
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
}

.v-dialog :deep(.v-card) {
  border-radius: 12px;
}

.v-dialog :deep(.v-toolbar) {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.v-text-field :deep(.v-field__append) {
  padding-right: 8px;
}

.v-chip {
  font-size: 11px;
  height: 20px;
}
</style>
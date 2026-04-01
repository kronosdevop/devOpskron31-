<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addDialog"
      @update:model-value="$emit('update:addDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Add Designation/Roles
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
                  density="compact"
                  v-model="disgnationDept"
                  label="Designation"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  @keyup.enter="validate_data()"
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
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { create_designation } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    addDialog: Boolean,
  },

  data() {
    return {
      locationName: "",
      disgnationDept: "",
      loading: false,
    };
  },
  watch: {
    addDialog: {
      async handler() {
        if (this.addDialog == true) {
          // await this.get_all_users();
          // this.fetch_users();
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_users() {
      this.masterUsers = [];
      this.listUsers.forEach((element) => {
        masterUsers.push({
          full_user_name: element.full_user_name,
          user_id: element.user_id,
        });
      });
    },

    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.create_master_designations();
      }
    },
    async create_master_designations() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_designation, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              designation_name: this.disgnationDept,
            },
          })
        );
        var response = JSON.parse(result.data.create_designation);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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
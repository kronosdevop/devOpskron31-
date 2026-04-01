<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addDialog"
      @update:model-value="$emit('update:addDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Group</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="departmentName"
                  label="Group"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="departmentHead"
                  label="Group Head"
                  :items="masterUsers"
                  item-title="label"
                  :search-input.sync="searchF"
                  item-value="value"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  hide-no-data
                  hide-selected
                />
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
import { create_departments } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_users } from "@/mixins/GetAllUsers.js";
export default {
  props: {
    addDialog: Boolean,
  },
  mixins: [get_all_users],
  data() {
    return {
      loading: false,
      departmentName: "",
      departmentHead: "",
      masterUsers: [],
      searchF: null,
    };
  },
  watch: {
    addDialog: {
      async handler() {
        if (this.addDialog == true) {
          await this.get_all_users();
          this.fetch_users();
        }
      },
      immediate: true,
    },
  },

  methods: {
    fetch_users() {
      this.masterUsers = [];
      // if (this.listUsers.length == 0) {
      //   this.departmentHead = this.listUsers[0].user_id;
      // }
      this.listUsers.forEach((element) => {
        if (element.user_type != "CHATBOT") {
          this.masterUsers.push({
            label: element.full_user_name,
            value: element.user_id,
          });
        }
      });
      this.masterUsers.sort((a, b) => a.label.localeCompare(b.label));
      if (this.masterUsers.length == 1) {
        this.departmentHead = this.masterUsers[0].value;
      }
    },
    close_dialog() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.create_master_department();
      }
    },
    async create_master_department() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_departments, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              department_name: this.departmentName,
              department_head: this.departmentHead,
            },
          })
        );
        var response = JSON.parse(result.data.create_departments);
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
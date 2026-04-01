<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editMasterDailog"
      @update:model-value="$emit('update:editMasterDailog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{
                tabName == "Group"
                  ? `Edit Group Head for ${rowInfo.department_name} `
                  : `Edit Location Head for ${rowInfo.location_name}`
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="departmentHead"
                  :label="tabName == 'Group' ? 'Group Head' : 'Location Head'"
                  :items="masterUsers"
                  :search-input.sync="searchF"
                  item-title="label"
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
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { get_all_users } from "@/mixins/GetAllUsers.js";
import {
  update_department,
  change_location_head,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    editMasterDailog: Boolean,
    rowInfo: Object,
    tabName: String,
  },
  mixins: [get_all_users],
  data() {
    return {
      departmentHead: "",
      masterUsers: [],
      searchF: null,
      loading: false,
    };
  },
  watch: {
    editMasterDailog: {
      async handler() {
        if (this.editMasterDailog == true) {
          this.departmentHead = "";
          await this.get_all_users();

          this.fetch_users();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_users() {
      this.masterUsers = [];
      this.departmentHead = "";

      this.listUsers.forEach((element) => {
        this.masterUsers.push({
          label: element.full_user_name,
          value: element.user_id,
        });
        this.masterUsers.sort((a, b) => a.label.localeCompare(b.label));
        if (
          element.full_user_name ==
          (this.tabName == "Group"
            ? this.rowInfo.department_head
            : this.rowInfo.location_head)
        ) {
          this.departmentHead = element.user_id;
        }
      });
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.tabName == "Group") {
          await this.edit_department_head();
        } else {
          await this.edit_location_head();
        }
      }
    },
    async edit_department_head() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_department, {
            input: {
              department_id: this.rowInfo.department_id,
              department_head: this.departmentHead,
            },
          })
        );
        this.loading = false;
        this.$emit("successMsg", "Department Head Updated Successfully");
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    async edit_location_head() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(change_location_head, {
            location_id: this.rowInfo.location_id,
            location_head: this.departmentHead,
          })
        );
        this.loading = false;
        this.$emit("successMsg", "Group Head Updated Successfully");
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
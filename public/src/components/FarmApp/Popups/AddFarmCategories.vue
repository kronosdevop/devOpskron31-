<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addConfiguration" @update:model-value="$emit('update:addConfiguration', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title"> Farm Category</div></v-toolbar-title
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
                  v-model="farmName"
                  label="Category"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-combobox
                  v-model="tosender"
                  chips
                  clearable
                  multiple
                  outlined
                  dense
                  label="Sub Categories"
                  hide-selected
                  append-icon=""
                >
                  <template
                    #selection="{ attrs, item, select, selected }"
                  >
                    <v-chip
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="remove(item)"
                    >
                      <strong>{{ item }}</strong
                      >&nbsp;
                    </v-chip>
                  </template>
                </v-combobox>
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
import { create_expense_category } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addConfiguration: Boolean,
  },

  data() {
    return {
      farmName: "",
      tableLoading: false,
      tosender: [],
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
    remove(item) {
      this.tosender.splice(this.tosender.indexOf(item), 1);
    },
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.$emit("clicked", 0);
        //   this.create_master_designations();
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
              expense_name: this.farmName,
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
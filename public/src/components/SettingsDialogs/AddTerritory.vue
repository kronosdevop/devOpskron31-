<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createTerritoryDialog"
      @update:model-value="$emit('update:createTerritoryDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add Territory</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="territoryName"
                  label=" Name*"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="terriotoryManager"
                  label="Territory Head"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  item-title="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  return-object
                  placeholder="Min 3 Character"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
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
/* eslint-disable */
import { create_list_edit_territories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  props: {
    createTerritoryDialog: Boolean,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      loading: false,
      territoryName: "",
      searchF: "",
      territoryCity: "",
      terriotoryManager: "",
      userArray: [],
    };
  },
  watch: {
    createTerritoryDialog: {
      async handler() {
        if (this.createTerritoryDialog == true) {
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },
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
          graphqlOperation(create_list_edit_territories, {
            input: {
              action_type: "CREATE",
              territory_name: this.territoryName,
              territory_head: this.terriotoryManager.user_id,
              territory_head_name: this.terriotoryManager.full_user_name,
              organization_id: data.organization.organization_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_territories);
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
    },
  },
};
</script>

<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="editTerritoryDialogue" @update:model-value="$emit('update:editTerritoryDialogue', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Territory</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="territoryName"
                  label=" Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="territoryDescription"
                  label="Description"
                  class=""
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="terriotoryManager"
                  label="Territory Head"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  return-object
                  placeholder="Min 3 Character"
                  @input="change_manager()"
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
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { edit_territories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  props: {
    editTerritoryDialogue: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      loading: false,
      territoryName: "",
      territoryCity: "",
      territoryDescription: "",
      terriotoryManager: "",
      userArray: [],
      searchF: "",
      changedManager: false,
    };
  },
  watch: {
    editTerritoryDialogue: {
      async handler() {
        if (this.editTerritoryDialogue == true) {
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          this.territoryName = this.rowInfo.territory_name;
          this.territoryDescription = this.rowInfo.territory_description;
          this.terriotoryManager = this.rowInfo.territory_manager;
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

    change_manager() {
      this.changedManager = true;
    },

    close_dialog() {
      this.$emit("clicked", 0);
      //   this.$refs.form.resetValidation();
      //   this.$refs.form.reset();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_mutation();
      }
    },

    async edit_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_territories, {
            input: {
              territory_id: this.rowInfo.territory_id,
              territory_name: this.territoryName,
              territory_description: this.territoryDescription,
              territory_manager:
                this.changedManager == true
                  ? this.terriotoryManager.user_id
                  : this.rowInfo.territory_manager,
              territory_manager_name:
                this.changedManager == true
                  ? this.terriotoryManager.full_user_name
                  : this.rowInfo.territory_manager_name,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.edit_territories);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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
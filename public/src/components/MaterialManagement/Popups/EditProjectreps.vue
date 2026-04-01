<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="vistrepedition" @update:model-value="$emit('update:vistrepedition', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Material Reps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form2">
            <v-autocomplete
              dense
              v-model="selectsite"
              label="Select Project Site"
              :rules="[(v) => v.length > 0 || 'required ']"
              outlined
              item-text="text"
              item-value="value"
              class="mt-2"
              :items="projectsiteitems"
              :search-input.sync="searchV"
              multiple
              hide-no-data
              placeholder="Min 3 Character"
            >
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="edit_action()"
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

import { edit_delete_project_site_users } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  mixins: [get_location_details],
  props: {
    vistrepedition: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      projectsiteitems: [],
      selectsite: [],
      searchV: "",
    };
  },
  watch: {
    vistrepedition: {
      async handler() {
        if (this.vistrepedition == true) {
          await this.get_location_details();
          this.fetch_details();
          this.selectsite = this.rowInfo.project_site_id;
        }
      },
      immediate: true,
    },
  },
  methods: {
    edit_action() {
      if (this.$refs.form2.validate()) {
        this.delete_mutation();
      }
    },
    fetch_details() {
      this.projectsiteitems = [];

      var loaction = this.locationList;
      loaction = loaction.filter((obj) => obj.location_type == "PROJECT SITE");
      loaction.forEach((element) => {
        this.projectsiteitems.push({
          text: element.location_name,
          value: element.location_id,
        });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_delete_project_site_users, {
            input: {
              project_site_user_id: this.rowInfo.project_site_user_id,
              project_site_id: this.selectsite,
              action_type: "EDIT_USER",
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.edit_delete_project_site_users);
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
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="vistrepedition" @update:model-value="$emit('update:vistrepedition', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Visit Reps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form2">
            <!-- <v-autocomplete
              dense
              v-model="selectTerritory"
              label="Select Territory"
              :rules="[(v) => v.length > 0 || 'required ']"
              outlined
              item-text="text"
              item-value="value"
              class="mt-2"
              :items="territoryArray"
              :search-input.sync="searchT"
              hide-no-data
              multiple
              placeholder="Min 3 Character"
            ></v-autocomplete> -->
            <v-autocomplete
              dense
              v-model="selectvisitor"
              label="Select Visit Types"
              :rules="[(v) => v.length > 0 || 'required ']"
              outlined
              item-text="text"
              item-value="value"
              class="mt-2"
              :items="visitTypes"
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
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
                <script>
/* eslint-disable */
import { get_visit_terittory } from "@/mixins/GetVisitTerritory.js";
import { edit_visit_reps } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_visit_type } from "@/mixins/GetVisitType";
export default {
  mixins: [get_visit_terittory, get_visit_type],
  props: {
    vistrepedition: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      visitTypes: [],
      selectvisitor: [],
      searchV: "",
      selectTerritory: [],
      territoryArray: [],
      searchT: "",
    };
  },
  watch: {
    vistrepedition: {
      async handler() {
        if (this.vistrepedition == true) {
          await this.get_visit_terittory();
          await this.get_visit_type();
          this.fetch_details();
    
          this.selectTerritory = this.rowInfo.territory_id;
          this.selectvisitor = this.rowInfo.visit_type_id;
 
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
      this.territoryArray = [];
      this.visitTypes = [];
      this.visitTerittory.forEach((element) => {
        this.territoryArray.push({
          text: element.territory_name,
          value: element.territory_id,
        });
      });
      this.typeVist.forEach((element) => {
        this.visitTypes.push({
          text: element.visit_type_name,
          value: element.visit_type_id,
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
          graphqlOperation(edit_visit_reps, {
            input: {
              visit_reps_id: this.rowInfo.visit_reps_id,
              visit_type_id: this.selectvisitor,
              territory_id: this.selectTerritory,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.edit_visit_reps);
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
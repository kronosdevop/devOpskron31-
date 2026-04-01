<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="editVisitDialogue" @update:model-value="$emit('update:editVisitDialogue', $event)" persistent max-width="500px" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Visit Type</div></v-toolbar-title
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
                  v-model="visitName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="visitFrequency"
                  label="Visit Frequency"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  :items="[
                    'Daily',
                    'Once in one week',
                    'Once in two weeks',
                    'Monthly',
                    'Quarterly',
                    'Once a year',
                  ]"
                  :search-input.sync="searchF"
                  hide-no-data
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-radio-group
                  class="mt-n3"
                  label="Visit Type"
                  v-model="visitTypeAction"
                  row
                >
                  <v-radio label="Physical" value="PHYSICAL"></v-radio>
                  <v-radio label="Virtual" value="VIRTUAL"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="12">
                <v-radio-group
                  class="mt-n1"
                  label="Adhoc Approval Requried"
                  v-model="adhocapproval"
                  :rules="[(v) => !!v || 'required ']"
                  row
                >
                  <v-radio label="Yes" value="YES"></v-radio>
                  <v-radio label="No" value="NO"></v-radio>
                </v-radio-group>
              </v-col>
              <!-- <v-col cols="12">
                <v-text-field
                  dense
                  v-show="visitTypeAction == 'PHYSICAL'"
                  v-model="scanTolerance"
                  label="Scan Tolerance"
                  class=""
                  outlined
                ></v-text-field>
              </v-col> -->
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
import { edit_visittype } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    editVisitDialogue: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      adhocapproval: "YES",
      territoryName: "",
      territoryCity: "",
      territoryDescription: "",
      terriotoryManager: "",
      userArray: [],
      searchF: "",
      visitFrequency: "",
      visitTypeAction: null,
      scanTolerance: 0,
      visitType: "",
      visitName: "",
    };
  },
  watch: {
    editVisitDialogue: {
      async handler() {
        if (this.editVisitDialogue == true) {
          this.visitName = this.rowInfo.visit_type_name;
          this.visitFrequency = this.rowInfo.visit_type_frequency;
          this.visitTypeAction = this.rowInfo.visit_type_representation;
          this.scanTolerance = this.rowInfo.scan_tolerance;
          this.adhocapproval =
            this.rowInfo.adhock_approval_required == undefined
              ? "NO"
              : this.rowInfo.adhock_approval_required == true
              ? "YES"
              : "NO";

          // console.log(this.rowInfo);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },

    async add_mutation() {
      this.loading = true;

      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_visittype, {
            input: {
              visit_type_id: this.rowInfo.visit_type_id,
              visit_type_name: this.visitName,
              visit_type_frequency: this.visitFrequency,
              visit_type_representation: this.visitTypeAction,

              scan_tolerance:
                this.visitTypeAction == "VIRTUAL"
                  ? 0
                  : Number(this.scanTolerance),
              adhock_approval_required:
                this.adhocapproval == "YES" ? true : false,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.edit_visittype);
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
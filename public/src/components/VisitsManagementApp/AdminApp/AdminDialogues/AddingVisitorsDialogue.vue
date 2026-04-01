<template>
  <div>
    <!--eslint-disable  -->
    <v-dialog
      :model-value="addPrermissionDialog"
      @update:model-value="$emit('update:addPrermissionDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" density="compact">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add User</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form3">
            <v-autocomplete
              density="compact"
              v-model="selectTeam"
              label="Select User"
              :rules="[(v) => v.length > 0 || 'required ']"
              variant="outlined"
              item-title="full_user_name"
              item-value="user_id"
              @input="searchF = ''"
              :items="userArray"
              class="mt-2"
              multiple
              :search-input.sync="searchF"
              hide-no-data
              placeholder="Min 3 Character"
            />
            <v-autocomplete
              density="compact"
              v-model="selectvisitor"
              label="Select Visit Types"
              :rules="[(v) => v.length > 0 || 'required ']"
              variant="outlined"
              item-title="text"
              item-value="value"
              class="mt-2"
              :items="visitTypes"
              :search-input.sync="searchV"
              multiple
              hide-no-data
              placeholder="Min 3 Character"
            />
          </v-form>

          <!-- <v-stepper v-model="stepperflow" vertical>
            <v-stepper-step :complete="stepperflow > 1" step="1">
              Select a User
            </v-stepper-step>
            <v-stepper-content step="1">
              <v-card flat>
                <v-form ref="form">
                  <v-autocomplete
                    dense
                    v-model="selectTeam"
                    label="Select User"
                    :rules="[(v) => v.length > 0 || 'required ']"
                    outlined
                    item-text="full_user_name"
                    item-value="user_id"
                    @input="searchF = ''"
                    :items="userArray"
                    class="mt-2"
                    multiple
                    :search-input.sync="searchF"
                    hide-no-data
                    placeholder="Min 3 Character"
                  >
                  </v-autocomplete>
                </v-form>
              </v-card>
              <v-btn class="text-capitalize cardCss" dark @click="nextstep()">
                Continue
              </v-btn>
            </v-stepper-content> -->
          <!-- <v-stepper-step :complete="stepperflow > 2" step="2">
              Map an Territory
            </v-stepper-step>
            <v-stepper-content step="2">
              <v-card flat>
                <v-form ref="form2">
                  <v-autocomplete
                    dense
                    v-model="selectTerritory"
                    label="Select Territory"
                    :rules="[(v) => v.length > 0 || 'required ']"
                    outlined
                    item-text="text"
                    item-value="value"
                    class="mt-2"
                    :items="territoryArray"
                    @input="searchT = ''"
                    :search-input.sync="searchT"
                    hide-no-data
                    placeholder="Min 3 Character"
                    multiple
                  >
                  </v-autocomplete>
                </v-form>
              </v-card>
              <v-btn
                class="text-capitalize cardCss"
                dark
                @click="stepperflow = 1"
              >
                Previous
              </v-btn>
              <v-btn
                class="text-capitalize cardCss ml-2"
                dark
                @click="nextstep2()"
              >
                Continue
              </v-btn>
            </v-stepper-content> -->
          <!-- <v-stepper-step step="2"> Map an Visit Types </v-stepper-step>
            <v-stepper-content step="2">
              <v-card flat>
                <v-form ref="form3">
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
              </v-card>
              <v-btn
                class="text-capitalize cardCss"
                dark
                @click="stepperflow = 1"
              >
                Previous
              </v-btn>
              <v-btn
                class="text-capitalize cardCss ml-2"
                dark
                @click="save_action"
                :loading="loading"
              >
                Add
              </v-btn>
            </v-stepper-content>
          </v-stepper> -->
          <v-card-actions class="justify-end">
            <v-btn
              :loading="loading"
              @click="save_action()"
              dark
              class="text-capitalize cardCss button-corner"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_master_terittory } from "@/mixins/GetMasterTerritory";

// import { get_visit_terittory } from "@/mixins/GetVisitTerritory.js";
import { get_visit_type } from "@/mixins/GetVisitType";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_visit_reps } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addPrermissionDialog: Boolean,
  },
  mixins: [get_all_org_users, get_visit_type, get_master_terittory],
  watch: {
    addPrermissionDialog: {
      async handler() {
        if (this.addPrermissionDialog == true) {
          this.stepperflow = 1;
          this.selectTerritory = [];
          this.selectvisitor = [];
          this.$store.commit("Setnamesearch", "");
          await this.get_master_terittory();
          await this.get_visit_type();
          await this.get_all_org_users();
          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      stepperflow: 1,
      userArray: [],
      selectTeam: [],
      searchF: "",
      loading: false,
      territoryArray: [],
      selectvisitor: [],
      searchT: "",
      selectTerritory: [],
      visitTypes: [],
      searchV: "",
    };
  },
  methods: {
    nextstep() {
      if (this.$refs.form.validate()) {
        this.stepperflow = 2;
      }
    },
    nextstep2() {
      if (this.$refs.form2.validate()) {
        this.stepperflow = 3;
      }
    },
    close_dialog() {
      this.$refs.form3.resetValidation();
      this.$refs.form3.reset();
      this.selectTerritory = [];
      this.selectvisitor = [];
      this.$emit("clicked", 0);
    },
    save_action() {
      if (this.$refs.form3.validate()) {
        this.add_mutation();
      }
    },
    fetch_details() {
      this.territoryArray = [];
      this.visitTypes = [];
      this.orgTerittory.forEach((element) => {
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
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },
    async add_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_visit_reps, {
            input: {
              user_email_id: this.selectTeam,
              visit_type_id: this.selectvisitor,
              territory_id: this.selectTerritory,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_visit_reps);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("userupdate", "dataValue");
          this.$refs.form3.resetValidation();
          this.$refs.form3.reset();
          this.stepperflow = 1;
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

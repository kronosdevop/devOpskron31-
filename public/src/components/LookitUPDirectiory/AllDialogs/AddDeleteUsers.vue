<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addDeleteMember" @update:model-value="$emit('update:addDeleteMember', $event)" persistent max-width="450" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              {{ actionType == "Delete" ? "Delete Member" : "Add Member" }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text v-show="actionType == 'Delete'" class="mt-4">
          <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
          <!-- <div
            v-if="
              $store.getters.GetFormObject.directory_created_by ==
              rowInfo.user_email_id
            "
          >
            You can't delete yourself from the directory since you're the owner.
          </div> -->
          <div class="text-left">
            Are you sure you want to delete
            <b>{{ rowInfo.full_user_name }}</b> from directory ?
          </div>
        </v-card-text>
        <v-card-text v-if="actionType == 'Add'" class="mt-4">
          <v-form ref="form">
            <v-row no-gutters class="mt-6">
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="selectTeam"
                  label="Select Member"
                  :rules="[
                    (v) =>
                      selectTeam.length > 0 ||
                      'At least one user must be selected',
                  ]"
                  variant="outlined"
                  item-title="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  multiple
                  :search-input.sync="searchF"
                  @input="searchF = ''"
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_add_mutation()"
            dark
            v-if="
              actionType == 'Delete' &&
              $store.getters.GetFormObject.directory_created_by !=
                rowInfo.user_email_id
            "
            class="cardCss"
          >
            Yes
          </v-btn>
          <v-btn
            depressed
            :loading="loading"
            @click="validation_add()"
            dark
            v-if="actionType == 'Add'"
            class="cardCss"
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { subscribe_unsubscribe_from_directory } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addDeleteMember: Boolean,
    rowInfo: Object,
    actionType: String,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      loading: false,
      userArray: [],
      selectTeam: [],
      searchF: "",
    };
  },
  watch: {
    addDeleteMember: {
      async handler() {
        if (this.actionType == "Add") {
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      // Only reset form if it exists (when actionType is 'Add')
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    async delete_add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var userId = [];
      userId.push(this.rowInfo.user_id);
      // console.log(this.entryInfo.responseObject.directory_id);
      try {
        let result = await API.graphql(
          graphqlOperation(subscribe_unsubscribe_from_directory, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
              user_id: this.actionType == "Add" ? this.selectTeam : userId,
              action_type:
                this.actionType == "Add" ? "SUBSCRIBE" : "UNSUBSCRIBE",
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(
          result.data.subscribe_unsubscribe_from_directory
        );

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

  async  validation_add() {
    const { valid } = await this.$refs.form.validate();
  
      if (valid) {
        this.delete_add_mutation();
      }
    },

    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      var existingMembers = localStorage.getItem("directoryMembers");
      var existingData = JSON.parse(existingMembers);
      var oldArray = [];
      existingData.forEach((element) => {
        oldArray.push({
          full_user_name: element.full_user_name,
          user_id: element.user_id,
        });
      });
      var allusers = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          allusers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      let uniqueInArray1 = oldArray.filter(
        (obj1) =>
          !allusers.find(
            (obj2) =>
              obj1.full_user_name === obj2.full_user_name &&
              obj1.user_id === obj2.user_id
          )
      );
      let uniqueInArray2 = allusers.filter(
        (obj2) =>
          !oldArray.find(
            (obj1) =>
              obj1.full_user_name === obj2.full_user_name &&
              obj1.user_id === obj2.user_id
          )
      );
      let finalArray = [...uniqueInArray1, ...uniqueInArray2];
      this.userArray = finalArray;
    },

    function_check() {
      // alert(5);
    },
  },
};
</script>
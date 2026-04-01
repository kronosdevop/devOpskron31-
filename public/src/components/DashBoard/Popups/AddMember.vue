<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="memberaddition" @update:model-value="$emit('update:memberaddition', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Add Member for
              {{ $store.getters.GetdashboardDetails.dashboard_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  item-title="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  @input="searchF = ''"
                  multiple
                  hide-no-data
                  placeholder="Min 3 Character"
                >
                </v-autocomplete>
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { add_remove_member_dashboard } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    memberaddition: Boolean,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      selectTeam: "",
      loading: false,
      searchF: "",
      userArray: [],
    };
  },
  watch: {
    memberaddition: {
      async handler() {
        this.$store.commit("Setnamesearch", "");
        await this.get_all_org_users();
        await this.fetch_details();
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectTeam = "";
      this.$refs.form.resetValidation();
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.grant_admin_access();
      }
    },
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    async grant_admin_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_remove_member_dashboard, {
            input: {
              dashboard_id:
                this.$store.getters.GetdashboardDetails.dashboard_id,
              user_id: this.selectTeam,
              organization_id: data.organization.organization_id,
              action_type: "ADD",
            },
          })
        );
        this.loading = false;
        // console.log(result);
        var response = JSON.parse(result.data.add_remove_member_dashboard);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "data");
          this.selectTeam = "";
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
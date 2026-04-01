<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addDialog" @update:model-value="$emit('update:addDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Grant Access</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="label"
                  item-value="value"
                  :search-input.sync="searchF"
                  :items="userArray"
                  hide-no-data
                  hide-selected
                >
                </v-autocomplete>
                <!-- <v-select
                  dense
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="username"
                  item-value="userId"
                  :items="userArray"
                ></v-select> -->
              </v-col>
            </v-row>
            <!-- <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-select
                  dense
                  v-model="selectTeam"
                  label="Select Type"
                  outlined
                  :items="['Organization Admin', 'Workflow Admin']"
                ></v-select>
              </v-col>
            </v-row> -->
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Confirm</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { add_product_admins } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    addDialog: Boolean,
    // userArray: Array,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      selectTeam: "",
      loading: false,
      searchF: null,
      userArray: [],
    };
  },
  watch: {
    addDialog: {
      async handler() {
        this.$store.commit("Setnamesearch", this.searchF);
        await this.get_all_org_users();
        await this.fetch_details();
      },

      immediate: true,
    },
    async searchF() {
      if (this.searchF != null) {
        if (this.searchF.length >= 3) {
          this.$store.commit("Setnamesearch", this.searchF);
          await this.get_all_org_users();
          await this.fetch_details();
        }
      }
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectTeam = "";
      this.searchF = null;
      this.$refs.form.resetValidation();
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            label: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      this.userArray.sort((a, b) => a.label.localeCompare(b.label));
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      // console.log(valid);
      if (valid) {
        this.grant_admin_access();
      }
    },
    async grant_admin_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_product_admins, {
            input: {
              user_email_id: this.selectTeam,
              product_id: this.$store.getters.Getproductitems.product_id,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.add_product_admins);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("adminRefresh", "refresh");
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
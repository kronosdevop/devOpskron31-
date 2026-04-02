<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="addBroadcastmember" @update:model-value="$emit('update:addBroadcastmember', $event)" persistent max-width="800" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
            Add / Edit Member for {{ broadcast_info.team_name }}
          </div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-toolbar flat>
            <v-autocomplete
              dense
              v-model="selectTeam"
              label="Select User"
              :rules="[(v) => !!v || 'required ']"
              outlined
              item-text="full_user_name"
              item-value="user_id"
              :items="userArray"
              :search-input.sync="searchF"
              hide-no-data
              style="max-width: 250px"
              hide-selected
              placeholder="Min 3 Character"
            >
            </v-autocomplete>
            <v-btn
              dark
              @click="validate_data()"
              :loading="loading"
              class="text-capitalize cardCss ml-2 mt-n5"
              >Add</v-btn
            >
          </v-toolbar>
        </v-form>
        <v-data-table
          :headers="headers"
          :items="tableData"
          :height="height"
          :fixed-header="fixed"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.full_user_name`]="{ item }">
            <span class="caption">{{ item.full_user_name }}</span>
            <v-icon small class="ml-2" color="pink" v-if="item.is_admin == true"
              >mdi-account</v-icon
            >
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              small
              color="red"
              @click.stop="delete_item(item)"
              v-if="item.is_admin == false"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { add_remove_user_to_team } from "@/graphql/mutations.js";
import { get_particular_broadcast_details } from "@/graphql/queries.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addBroadcastmember: Boolean,
    broadcast_info: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      tableLoading: false,
      selectTeam: "",
      headers: [
        { text: "User Name", value: "full_user_name", sortable: false },
        {
          text: "User Email ID",
          value: "user_email_id",
          sortable: false,
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
      tableData: [],
      loading: false,
      userArray: [],
      fixed: true,
      searchF: "",
    };
  },
  watch: {
    addBroadcastmember: {
      async handler() {
        if (this.addBroadcastmember == true) {
          this.height = window.innerHeight - 310;
          await this.get_broadcastlist();
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  // created() {
  //   this.get_broadcastlist();
  //   this.height = window.innerHeight - 270;
  // },
  methods: {
    validate_data() {
      if (this.$refs.form.validate()) {
        this.grant_admin_access();
      }
    },
    async delete_item(item) {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_remove_user_to_team, {
            input: {
              admin_user_id: this.broadcast_info.team_owner_id,
              organization_id: data.organization.organization_id,
              team_id: this.broadcast_info.team_id,
              action_type: "REMOVE",
              user_id: item.user_id,
            },
          })
        );

        var response = JSON.parse(result.data.add_remove_user_to_team);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async grant_admin_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_remove_user_to_team, {
            input: {
              admin_user_id: this.broadcast_info.team_owner_id,
              organization_id: data.organization.organization_id,
              team_id: this.broadcast_info.team_id,
              action_type: "ADD",
              user_id: this.selectTeam,
            },
          })
        );
        this.loading = false;
        // console.log(result);
        var response = JSON.parse(result.data.add_remove_user_to_team);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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
    close_dialog() {
      this.selectTeam = "";
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },
    fetch_details() {
      this.userArray = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          if (
            !this.tableData.some((user) => user.user_id === element.user_id)
          ) {
            this.userArray.push({
              full_user_name: element.full_user_name,
              user_id: element.user_id,
            });
          }
        }
      });
    },
    async get_broadcastlist() {
      this.tableLoading = true;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
              team_id: this.broadcast_info.team_id,
            },
          })
        );
        var dataArray = [];

        var response = JSON.parse(result.data.get_particular_broadcast_details);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          dataArray = response.data[0].team_users_list;
          this.tableData = dataArray;

          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style>
</style>
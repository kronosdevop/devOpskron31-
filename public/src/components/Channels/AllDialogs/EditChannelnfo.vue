<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="editChannel" @update:model-value="$emit('update:editChannel', $event)" persistent max-width="550" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Edit Channel</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                label="Title"
                :rules="[(v) => !!v || 'Required']"
                :counter="25"
                v-model="broadcastName"
                @input="fetch_name()"
                maxlength="25"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                outlined
                dense
                rows="0"
                :rules="[(v) => !!v || 'Required']"
                :counter="500"
                label="Description"
                v-model="description"
                maxlength="500"
              />
            </v-col>
            <!-- <v-col cols="12">
              <div class="mt-n1"><b>Visible to -</b></div>

              <v-radio-group
                @change="clear_value()"
                v-model="channelVisbility"
                class="ml-2"
                :rules="[(v) => !!v || 'required ']"
                row
              >
                <v-radio label="All Members" value="OPEN"></v-radio>
                <v-radio label="Restricted Users" value="RESTRICTED"></v-radio>
              </v-radio-group>
            </v-col>
            <v-col v-if="channelVisbility == 'RESTRICTED'" cols="12">
              <span>The user + any additional users if needed</span>
              <v-autocomplete
                dense
                v-model="userDetails"
                label="Select Users"
                :menu-props="{ maxHeight: '200' }"
                outlined
                multiple
                :items="visibilityUsers"
                item-text="full_user_name"
                class="mt-2"
                item-value="user_id"
                :search-input.sync="search"
                @input="onuserinput"
              >
              </v-autocomplete>
            </v-col> -->
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="validate_data()"
          dark
          class="cardCss button-corner text-capitalize"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  <script>
/* eslint-disable */
import { edit_stichh_channel } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  props: {
    editChannel: Boolean,
    rowInfo: Object,
    allUsers: Array,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      loading: false,
      broadcastName: "",
      description: "",
      dashboard_type: "",
      Password: "",
      broadcastType: null,
      sourceInfo: "",
      imageUrl: "",
      channelVisbility: null,
      visibilityUsers: [],
      search: "",
      userDetails: [],
    };
  },
  watch: {
    editChannel: {
      async handler() {
        if (this.editChannel == true) {
          // this.fetch_details();
          this.broadcastName = this.rowInfo.team_name;
          this.description = this.rowInfo.team_description;

          this.channelVisbility = this.rowInfo.team_visibility;

          this.userDetails = this.rowInfo.restricted_users;
          //   await this.get_all_org_users();

          // this.broadcastType = "";
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();

      this.$emit("clicked", 0);
    },
    fetch_name() {
      this.description = this.broadcastName;
    },

    onuserinput(value) {
      if (!value.includes(this.$store.getters.GetUserObj.user.user_id)) {
        value.push(this.$store.getters.GetUserObj.user.user_id);
      }
      this.userDetails = value;
      this.search = "";
    },

    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.channelVisbility == "OPEN") {
        this.userDetails = [];
      } else {
        var arrayNew = [
          {
            full_user_name: data.user.full_user_name,
            user_id: data.user.user_id,
          },
        ];
        this.userDetails =
          this.rowInfo.team_visibility == "RESTRICTED"
            ? this.rowInfo.team_visibility.restricted_users
            : arrayNew;

        // this.userDetails.push(data.user.user_id);
      }
    },

    fetch_details() {
      this.allUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.visibilityUsers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.Create_broadcast_message();
      }
    },
    async Create_broadcast_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_stichh_channel, {
            input: {
              user_email_id: data.user.user_email_id,
              team_id: this.rowInfo.team_id,
              organization_id: data.organization.organization_id,
              team_name: this.broadcastName,
              team_description: this.description,
              team_visibility: this.channelVisbility,
              restricted_users:
                this.channelVisbility == "OPEN" ? undefined : this.userDetails,
            },
          })
        );
        var response = JSON.parse(result.data.edit_stichh_channel);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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
  
  <style>
</style>
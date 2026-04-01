<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="editchat" @update:model-value="$emit('update:editchat', $event)" persistent max-width="500" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
          Edit Groupchat
          </div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                style="max-width: 450px"
                label="Name"
                :rules="[(v) => !!v || 'Required']"
                :counter="25"
                v-model="groupchatname"
                maxlength="25"
              />
              <v-textarea
                outlined
                dense
                :rules="[(v) => !!v || 'Required']"
                style="max-width: 450px"
                :counter="500"
                label="Description"
                v-model="description"
                maxlength="500"
              />
            </v-col>
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
import { edit_team_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    editchat: Boolean,
    groupinfo: Object,
  },
  data() {
    return {
      loading: false,
      groupchatname: "",
      description: "",
      dashboard_type: "",
      Password: "",
      broadcastType: null,
      sourceInfo: "",
      imageUrl: "",
    };
  },
  watch: {
    editchat: {
      async handler() {
        if (this.editchat == true) {
          this.groupchatname = this.groupinfo.team_name;
          this.description = this.groupinfo.team_description;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$refs.form.reset();

      this.$emit("clicked", 0);
    },
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_team_details_message();
      }
    },
    async edit_team_details_message() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_team_details, {
            input: {
              team_id: this.groupinfo.team_id,
              team_description: this.description,
              team_name: this.groupchatname,
            },
          })
        );
        var response = JSON.parse(result.data.edit_team_details);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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
      
      <style>
</style>
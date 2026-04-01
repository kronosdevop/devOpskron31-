<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="editionbroadcast" @update:model-value="$emit('update:editionbroadcast', $event)" persistent max-width="600" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
            Edit Channel for {{ broadcast_info.team_name }}
          </div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row class="ml-1">
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                label="Title"
                :rules="[(v) => !!v || 'Required']"
                :counter="25"
                v-model="broadcastName"
                maxlength="25"
              />
              <v-textarea
                outlined
                dense
                :rules="[(v) => !!v || 'Required']"
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
/*eslint-disable*/

import { edit_broadcast_channel } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    editionbroadcast: Boolean,
    broadcast_info: Object,
  },

  data() {
    return {
      loading: false,
      broadcastName: "",
      description: "",
      dashboard_type: "",
      member_qr: "",
      sourceInfo: "",
      imageUrl: "",
    };
  },
  watch: {
    editionbroadcast: {
      async handler() {
        if (this.editionbroadcast == true) {
          this.broadcastName = this.broadcast_info.team_name;
          this.description = this.broadcast_info.team_description;
        }
      },
      immediate: true,
    },
  },
  created() {},

  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
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
        this.edit_broadcast_message();
      }
    },
    async edit_broadcast_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_broadcast_channel, {
            input: {
              team_id: this.broadcast_info.team_id,
              user_email_id: data.user.user_email_id,
              team_name: this.broadcastName,
              team_description: this.description,
              // team_owner_id:data.user.user_id
            },
          })
        );
        var response = JSON.parse(result.data.edit_broadcast_channel);
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
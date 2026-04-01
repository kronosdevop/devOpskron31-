<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="annoucementDialog" @update:model-value="$emit('update:annoucementDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Create Channel</div></v-toolbar-title
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
                style="max-width: 450px"
                :counter="500"
                label="Description"
                v-model="description"
                maxlength="500"
              />
              <!-- <div class="text-left font-weight-black">Properties:</div>
              <br />

              <div class="text-left mt-n2">Message Type</div>
              <v-radio-group
                :rules="[(v) => !!v || 'Required']"
                v-model="broadcastType"
              >
                <v-radio label="Group Cast" value="GROUP_CAST"></v-radio>
                <v-radio label="Broad Cast" value="BROAD_CAST"></v-radio>
              </v-radio-group> -->
            </v-col>

            <v-col cols="6"> </v-col>
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
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  <script>
import { create_broadcast } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    annoucementDialog: Boolean,
  },
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
    };
  },
  watch: {
    annoucementDialog: {
      async handler() {
        if (this.annoucementDialog == true) {
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
          graphqlOperation(create_broadcast, {
            input: {
              team_name: this.broadcastName,
              team_description: this.description,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              team_action_type: "BROAD_CAST",
              // this.broadcastType,
            },
          })
        );
        var response = JSON.parse(result.data.create_broadcast);
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
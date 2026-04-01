<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="publishMessage" @update:model-value="$emit('update:publishMessage', $event)" persistent max-width="900" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Publish Message</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  :rules="[(v) => !!v || 'Required']"
                  :counter="100"
                  outlined
                  dense
                  v-model="title"
                  maxlength="100"
                  label="Title"
                />
                <v-textarea
                  outlined
                  dense
                  v-model="imageurl"
                  rows="0"
                  :rules="[
                    (v) =>
                      !v ||
                      (!!v && v.length > 0, this.validateURL(v)) ||
                      'Invalid URL format',
                  ]"
                  maxlength="1000"
                  label="Image URL (optional)"
                ></v-textarea>
                <v-textarea
                  outlined
                  dense
                  class="mt-2"
                  height="150px"
                  v-model="decription"
                  label="Description"
                />
              </v-col>
              <v-col cols="6">
                <v-textarea
                  :counter="200"
                  outlined
                  dense
                  class=""
                  height="50px"
                  v-model="summary"
                  maxlength="200"
                  label="Summary(optional)"
                />

                <v-text-field
                  outlined
                  dense
                  class="mt-2"
                  :rules="[
                    (v) =>
                      !v ||
                      (!!v && v.length > 0, this.validateURL(v)) ||
                      'Invalid URL format',
                  ]"
                  v-model="Information_url"
                  maxlength="1000"
                  label="Information URL(optional)"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="publish_view()"
            dark
            class="cardCss text-capitalize button-corner"
          >
            Publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
          
          <script>
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
var axios = require("axios");
export default {
  props: {
    dashboarditems: Object,
    publishMessage: Boolean,
  },
  mixins: [get_Org_details],
  data() {
    return {
      loading: false,
      Information_url: "",
      summary: "",
      decription: "",
      imageurl: "",
      SnackBarComponent: {},
      title: "",
    };
  },
  watch: {
    publishMessage: {
      async handler() {
        if (this.publishMessage == true) {
          await this.get_Org_details();
        }
      },
      immediate: true,
    },
  },

  created() {},
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

    publish_view() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.x_api_key = this.orgDetails.organization["x-api-key"];
        this.api_key = this.dashboarditems.dashboard_api_key;
        this.url = this.orgDetails.organization.invoke_url;
        axios({
          method: "post",
          maxBodyLength: Infinity,
          url: this.url,
          headers: {
            "x-api-key": this.x_api_key,
            "Content-Type": "application/json",
          },
          data: {
            dashboard_api_key: this.api_key,
            dashboard_message: {
              title: this.title,
              summary: this.summary,
              description: this.decription,
              image_url: this.imageurl,
              information_url: this.Information_url,
            },
            team_api_key: this.orgDetails.organization.team_api_key,
            content_type: "JSON",
            command: "dashboardMessagePublish",
          },
        })
          .then((res) => {
            if (res.data.Status == "SUCCESS") {
              this.loading = false;
              //   this.SnackBarComponent = {
              //     SnackbarVmodel: true,
              //     SnackbarColor: "green",
              //     SnackbarText: res.data.Message,
              //     timeout: 5000,
              //     Top: true,
              //   };
              this.$emit("successMsg", res.data.Message);
              this.$refs.form.reset();
            } else {
              this.loading = false;
              this.$emit("errorMsg", res.data.Message);
              //   this.SnackBarComponent = {
              //     SnackbarVmodel: true,
              //     SnackbarColor: "red",
              //     SnackbarText: res.data.Message,
              //     timeout: 5000,
              //     Top: true,
              //   };
            }
          })
          .catch((err) => {
            this.$emit("errorMsg", err.errors[0].message);
          });
      }
    },
  },
};
</script>
          
          <style>
</style>
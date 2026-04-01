<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="tvboardCreation" @update:model-value="$emit('update:tvboardCreation', $event)" persistent max-width="950" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">Create Tv Board</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row no-gutters>
            <v-col cols="6">
              <v-row no-gutters>
                <v-col cols="12">
                  <v-text-field
                    outlined
                    dense
                    @input="get_tvboard_name(tvboard_name)"
                    maxlength="50"
                    label="Name"
                    :rules="[(v) => !!v || 'Required']"
                    :counter="50"
                    v-model="tvboard_name"
                  />
                  <v-textarea
                    outlined
                    dense
                    :rules="[(v) => !!v || 'Required']"
                    :counter="500"
                    maxlength="500"
                    auto-grow
                    rows="0"
                    label="Description"
                    v-model="description"
                  />
                  <v-select
                    outlined
                    dense
                    item-text="text"
                    item-value="value"
                    :items="[
                      { text: '10 Seconds', value: 10000 },
                      { text: '15 Seconds', value: 15000 },
                      { text: '30 Seconds', value: 30000 },
                      { text: '45 Seconds', value: 45000 },
                      { text: '60 Seconds', value: 60000 },
                    ]"
                    label="Transition Frequency"
                    :rules="[(v) => !!v || 'Required']"
                    v-model="frequencytransition"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row no-gutters class="ml-5">
                <v-col cols="12">
                  <div class=""><b>Tv Board Type </b></div>
                  <v-radio-group
                    v-model="tvboardtype"
                    dense
                    class=""
                    :rules="[(v) => !!v || 'required ']"
                  >
                    <v-radio label="TV Signage" value="TV_SIGNAGE"></v-radio>
                    <!-- <v-radio
                      class="mt-2"
                      label="Presentation"
                      value="PRESENTATION"
                    ></v-radio> -->
                    <v-radio
                      class="mt-2"
                      label="Feed (Deploy Feed Content )"
                      value="FEED"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="create_board()"
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
/* eslint-disable */
import { create_tv_board } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    tvboardCreation: Boolean,
  },
  data() {
    return {
      loading: false,
      tvboard_name: "",
      tvboardtype: "",
      subscription_id: "",
      frequencytransition: 10000,
      search: "",
      feedType: "",
      screatkey: "",
      idaccount: "",
      clientid: "",
      clientscret: "",
      awsAccountName: "",
      accesskey: "",
      tenant_id: "",
      awscostobject: {},
      azureobject: {},
      description: "",
      feedItems: [
        { name: "AWS Cost Monitor", value: "AWS_COST" },
        { name: "Azure Cost Monitor", value: "AZURE_COST" },
      ],
      broadcastFrequency: "",
    };
  },
  watch: {
    tvboardCreation: {
      async handler() {
        if (this.tvboardCreation == true) {
          this.tvboardtype = null;
          this.broadcastFrequency = "";
        }
      },
      immediate: true,
    },
  },
  methods: {
    get_dashboard_name(value) {
      this.description = value;
    },
    convertToTimeZone(time) {
      let [hours, minutes] = time.split(":");
      let date = new Date();
      date.setUTCHours(parseInt(hours));
      date.setUTCMinutes(parseInt(minutes));
      let options = {
        // timeZone: "Asia/Kolkata",
        timeZone:
          this.$store.getters.GetOrgDetails.organization.default_timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // 24-hour format
      };

      return new Intl.DateTimeFormat("en-US", options).format(date);
    },

    get_tvboard_name(value) {
      this.description = value;
    },

    close_dialog() {
      this.broadcastFrequency = "";
      this.$refs.form.reset();
      this.$refs.form.resetValidation();

      this.$emit("clicked", 0);
    },

    create_board() {
      if (this.$refs.form.validate()) {
        // this.awscostobject = {
        //   account_id: this.idaccount,
        //   accesskey: this.accesskey,
        //   account_name: this.awsAccountName,
        //   secretkey: this.screatkey,
        // };
        // this.azureobject = {
        //   client_id: this.clientid,
        //   client_secrect: this.clientscret,
        //   subscription_id: this.subscription_id,
        //   tenant_id: this.tenant_id,
        // };
        this.Createdash_board();
      }
    },

    async Createdash_board() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_tv_board, {
            input: {
              tv_board_name: this.tvboard_name,
              tv_board_account_details: undefined,
              transition_frequency: this.frequencytransition,
              tv_board_description: this.description,
              tv_board_publish_type: this.tvboardtype,
              tv_board_feed_type: undefined,
              broadcast_frequency: undefined,
            },
          })
        );
        var response = JSON.parse(result.data.create_tv_board);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", 0);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
      
      <style>
</style>
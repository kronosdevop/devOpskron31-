<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="tvboardedition" @update:model-value="$emit('update:tvboardedition', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Edit Details for
              {{ detailstvboard.tv_board_name }}
            </div>
          </v-toolbar-title>
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
                  maxlength="50"
                  label="Name"
                  :rules="[(v) => !!v || 'required ']"
                  :counter="50"
                  v-model="boardtv_name"
                />
                <v-textarea
                  outlined
                  dense
                  :rules="[(v) => !!v || 'required ']"
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
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end mt-n8">
          <v-btn
            depressed
            :loading="loading"
            @click="edit_mutation()"
            dark
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
import { edit_tv_board_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    tvboardedition: Boolean,
    detailstvboard: Object,
  },
  data() {
    return {
      loading: false,
      boardtv_name: "",
      description: "",
      awsAccountName: "",
      search: "",
      visibilityobject: {},
      idaccount: "",
      screatkey: "",
      accesskey: "",
      clientid: "",
      clientscret: "",
      subscription_id: "",
      tenant_id: "",
      awscostobject: {},
      azureobject: {},
      broadcastFrequency: "",
      frequencytransition: 10000,
    };
  },
  watch: {
    tvboardedition: {
      async handler() {
        if (this.tvboardedition == true) {
          this.broadcastFrequency = "";
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
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

    fetch_details() {
      this.boardtv_name = this.detailstvboard.tv_board_name;
      this.description = this.detailstvboard.tv_board_description;
      this.frequencytransition = this.detailstvboard.transition_frequency;
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },
    edit_mutation() {
      if (this.$refs.form.validate()) {
        this.edit_dashboard();
      }
    },

    async edit_dashboard() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_tv_board_details, {
            input: {
              action_type: "UPDATE",
              tv_board_id: this.detailstvboard.tv_board_id,
              tv_board_name: this.boardtv_name,
              tv_board_account_details: undefined,
              transition_frequency: Number(this.frequencytransition),
              tv_board_description: this.description,
              broadcast_frequency: undefined,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_tv_board_details);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
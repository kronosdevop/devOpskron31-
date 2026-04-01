<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      v-model="triggerCreation"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Trigger</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            <v-form ref="form">
              <v-radio-group
                v-model="selectedOption"
                row
                :rules="[(v) => !!v || 'required ']"
              >
                <v-radio label="Daily" value="daily"></v-radio>
                <v-radio label="Weekly" value="weekly"></v-radio>
                <v-radio label="Date of Month" value="date_of_month"></v-radio>
              </v-radio-group>
              <v-row>
                <v-col cols="6" v-if="selectedOption == 'weekly'">
                  <v-select
                    v-model="selectedDay"
                    :items="daysOfWeek"
                    label="Day"
                    outlined
                    :rules="
                      selectedOption == 'weekly'
                        ? [(v) => !!v || 'required ']
                        : []
                    "
                    dense
                  ></v-select>
                </v-col>
                <v-col cols="6" v-if="selectedOption == 'date_of_month'">
                  <v-select
                    v-model="selectedDate"
                    :items="dateOptions"
                    label="Date"
                    outlined
                    :rules="
                      selectedOption == 'date_of_month'
                        ? [(v) => !!v || 'required ']
                        : []
                    "
                    dense
                  ></v-select>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="preferredTime"
                    :items="timeOptions"
                    label="Preferred Time"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'required ']"
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="handover_mutation()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
            <script>
/* eslint-disable */
import { handover_asset } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    triggerCreation: Boolean,
  },

  data() {
    return {
      loading: false,
      selectedDay: null,
      daysOfWeek: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      selectedOption: "daily",
      selectedDate: null,
      dateOptions: Array.from({ length: 31 }, (_, i) => i + 1),
      preferredTime: null,
      timeOptions: Array.from({ length: 24 }, (_, i) => i + 1),
    };
  },
  watch: {
    triggerCreation: {
      async handler() {
        this.selectedOption = "daily";
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async handover_mutationss() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(handover_asset, {
              input: {
                organization_id: data.organization.organization_id,
                current_user_email: data.user.user_email_id,
                asset_id: this.assetitems.asset_id,
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.handover_asset);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            // this.fetch_audit_message();
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
  },
};
</script>
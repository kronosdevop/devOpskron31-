<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="accpetStartWork" @update:model-value="$emit('update:accpetStartWork', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card height="300px">
        <v-toolbar flat elevation="0" dark dense class="navBar">
          <v-toolbar-title>
            <div class="custom-title">Start Work</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-4">
              <v-col v-if="showOtp == 0" cols="4">
                <v-btn
                  class="cardCss mt-n2 ml-n1 text-capitalize"
                  dark
                  :loading="loading"
                  @click="generate_otp('START_GENERATE_OTP')"
                >
                  Generate OTP
                </v-btn>
              </v-col>
              <v-col v-if="showOtp == 1" cols="12">
                <div class="mt-2 text-left">
                  <h4 class="mt-2">
                    Enter OTP/Code
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-icon
                          class=""
                          color="primary"
                          dark
                          v-bind="attrs"
                          v-on="on"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span>
                        OTP/Code sent to the customer please enter to
                        continue</span
                      >
                    </v-tooltip>
                  </h4>
                </div>
                <div class="mt-2">
                  <v-otp-input
                    :rules="[(v) => !!v || 'Required']"
                    v-model="otp"
                    length="6"
                  ></v-otp-input>
                </div>
                <div class="text-left">
                  <v-btn
                    class="cardCss ml-n1 text-capitalize"
                    dark
                    v-if="showOtp == 1 && otpCheck == 0"
                    @click="verify_otp()"
                  >
                    Verify
                  </v-btn>
                </div>
                <div class="text-left">
                  <v-btn
                    v-if="otpCheck == 1"
                    class="cardCss ml-n1 text-capitalize"
                    dark
                    :loading="loading"
                    @click="generate_otp('START')"
                  >
                    Start
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="accept_start_work()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Start
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import { claim_start_ticket } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    accpetStartWork: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      otp: null,
      showOtp: 0,
      otpCheck: 0,
    };
  },
  methods: {
    close_dialog() {
      this.showOtp = 0;
      this.$emit("clicked", 0);
      this.otp = null;
    },

    async generate_otp(value) {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(claim_start_ticket, {
            input: {
              user_id: this.$store.getters.GetUserObj.user.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_id: this.rowInfo.assigned_id,
              action_type: value,
            },
          })
        );

        var response = JSON.parse(result.data.claim_start_ticket);
        this.loading = false;
        this.otp = null;
        if (response.Status == "SUCCESS") {
          if (value == "START_GENERATE_OTP") {
            this.$emit("successMsg", "OTP/Code Sent Successfully");
            this.showOtp = 1;
          } else {
            this.$emit("startWork", response.Message);
          }
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    verify_otp() {
      if (this.$refs.form.validate()) {
        if (this.rowInfo.start_otp == this.otp) {
          this.$emit("successMsg", "Successfull");
          this.otpCheck = 1;
        } else {
          this.$emit("errorMsg", "Invalid Otp");
        }
      }
    },
  },
};
</script>
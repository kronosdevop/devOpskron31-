<template>
  <v-app id="inspire">
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div style="height: 100vh; width: 100%" class="maindiv">
      <v-row no-gutters>
        <!-- <v-col cols="6">
          <v-img src="@/assets/signup.png" class=""> </v-img>
        </v-col> -->
        <v-layout justify-center>
          <v-card class="d-flex" max-width="1000" height="500">
            <v-row>
              <v-col cols="12">
                <v-card
                  flat
                  class="d-flex rounded-xl"
                  width="480"
                  style="margin-top: 20px"
                  height=""
                >
                  <v-col cols="12">
                    <div class="d-flex justify-center mt-16">
                      <v-img
                        max-width="180"
                        max-height="100"
                        src="@/assets/MBCA.jpeg"
                      >
                        <template #placeholder>
                          <v-row
                            class="fill-height ma-0"
                            align="center"
                            justify="center"
                          >
                            <v-progress-circular
                              indeterminate
                              color="primaryColor"
                            ></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                    </div>
                    <v-window v-model="steps" touchless>
                      <v-window-item :value="1">
                        <v-card-text>
                          <h3 class="text-center font-weight mb-2">
                            Welcome Back!
                          </h3>
                          <h4 class="text-center font-weight mb-2">
                            We're so excited to see you again!
                          </h4>
                          <v-form>
                            <div v-if="otpVisible == 0">
                              <v-text-field
                                dense
                                outlined
                                label="Email"
                                v-model="userEmail"
                                :rules="[rules.required, rules.email]"
                                required
                                append-icon="mdi-email"
                                type="text"
                                color="black"
                                @keyup.enter="validate_sign_in('otp')"
                                style="font-size: 13px; color: black"
                              >
                              </v-text-field>
                            </div>
                            <div v-if="otpVisible == 1">
                              <v-text-field
                                dense
                                readonly
                                outlined
                                label="Email"
                                v-model="userEmail"
                                :rules="[rules.required, rules.email]"
                                required
                                append-icon="mdi-email"
                                type="text"
                                color="black"
                                style="font-size: 13px; color: black"
                              >
                              </v-text-field>
                            </div>
                            <div v-show="otpVisible == 1">
                              <v-row no-gutters>
                                <v-otp-input
                                  v-model="otpInput"
                                  ref="otp"
                                  length="6"
                                ></v-otp-input>

                                <v-tooltip bottom>
                                  <template #activator="{ on, attrs }">
                                    <v-icon
                                      color="#4747fe"
                                      dark
                                      v-bind="attrs"
                                      v-on="on"
                                      @click="validate_sign_in('otp')"
                                    >
                                      mdi-refresh-circle
                                    </v-icon>
                                  </template>
                                  <span>Resend OTP</span>
                                </v-tooltip>
                              </v-row>
                            </div>
                            <div v-if="otpVisible == 0">
                              <v-btn
                                block
                                dark
                                class="mt-4 elevation-0 text-capitalize cardCss"
                                :loading="loading1"
                                @click="validate_sign_in('otp')"
                                >Send OTP</v-btn
                              >
                              <!-- <v-row class="mt-2" no-gutters>
                                <div>
                                  Need an account ?
                                  <v-btn
                                    x-small
                                    text
                                    color="#ef3f6e"
                                    @click="sign_up_action()"
                                    ><b><u>Register</u></b></v-btn
                                  >
                                </div>
                              </v-row> -->
                            </div>
                            <div v-if="otpVisible == 1">
                              <v-btn
                                block
                                dark
                                class="mt-4 text-capitalize cardCss"
                                :loading="loading1"
                                @click="validate_sign_in('login')"
                                >Login</v-btn
                              >
                              <!-- <v-row no-gutters>
                                <div>
                                  Need an account ?
                                  <v-btn
                                    x-small
                                    text
                                    color="#ef3f6e"
                                    @click="sign_up_action()"
                                    ><b><u>Register</u></b></v-btn
                                  >
                                </div>
                              </v-row> -->
                            </div>
                          </v-form>
                        </v-card-text>
                      </v-window-item>
                    </v-window>
                  </v-col>
                </v-card>
              </v-col>
              <!-- <v-divider vertical inset /> -->
              <!-- <v-col cols="5">
                <v-img
                  contain
                  src="@/assets/QR.png"
                  class="team-img mx-auto"
                  style="margin-top: 110px"
                />
                <h3 class="text-center font-weight mt-2 mb-2">
                  Login with QR Code
                </h3>
                <h5 class="text-center font-weight mb-2">
                  Scan this with the Stichh
                  <br />mobile app to login in instantly.
                </h5>
              </v-col> -->
            </v-row>
          </v-card>
        </v-layout>
        <!-- <v-col cols="6">
          <v-layout justify-center> -->
        <!-- <v-flex xs12 sm12 md12> -->

        <!-- </v-flex> -->
        <!-- </v-layout>
        </v-col>
        <v-divider vertical />
        <v-col cols="6"> -->
        <!-- <v-layout justify-center> -->

        <!-- </v-layout> -->
        <!-- </v-col> -->
      </v-row>
    </div>
  </v-app>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { Auth } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      userEmail: "",
      SnackBarComponent: {},
      steps: null,
      loading1: false,
      otpInput: "",
      otpVisible: 0,
      userDetails: {},
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
      },
    };
  },
  created() {
    if (this.$router.history.current.params.otp == 1) {
      this.otpVisible = 1;
      this.userEmail = this.$router.history.current.params.email;
      this.send_otp();
    }
    // this.$root.$on("sign_up", this.sign_up);
  },
  methods: {
    async send_otp() {
      try {
        const user = await Auth.signIn(this.userEmail)

          .then((user) => {
            this.userDetails = user;
          })
          .catch((err) => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Couldn't find your MBCA account",
              timeout: 5000,
              Top: true,
            };
          });
      } catch (error) {}
    },
    validate_sign_in(val) {
      var valid = true;

      if (this.userEmail == "") {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Email  Is Required",
          timeout: 5000,
          Top: true,
        };
      }
      if (valid) {
        if (val == "otp") {
          this.generate_otp();
        } else {
          this.login_with_otp();
        }
      }
    },
    async generate_otp() {
      this.loading1 = true;
      try {
        const user = await Auth.signIn(this.userEmail)
          .then((user) => {
            this.userDetails = user;

            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "OTP Sent Successfully",
              timeout: 5000,
              Top: true,
            };

            this.otpVisible = 1;

            this.loading1 = false;
          })
          .catch((err) => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Couldn't find your MBCA account!!",
              timeout: 5000,
              Top: true,
            };
            this.loading1 = false;
          });
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.message,
          timeout: 5000,
          Top: true,
        };
        this.loading1 = false;
      }
    },
    sign_up_action() {
      this.$router.push("/SignUp");
    },

    async login_with_otp() {
      this.loading1 = true;

      try {
        await Auth.sendCustomChallengeAnswer(this.userDetails, this.otpInput);
        await Auth.currentAuthenticatedUser()
          .then((user) => {
            this.$store.commit("SetAuth", true);
            this.$store.commit("SetUserEmail", this.userEmail);
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "Login Successfully!!",
              timeout: 5000,
              Top: true,
            };
            this.$router.push("/home");
            this.loading1 = false;
          })
          .catch((err) => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Invalid OTP",
              timeout: 5000,
              Top: true,
            };
            this.loading1 = false;
            this.otpInput = "";
            this.$refs.otp.focus();
          });
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.message,
          timeout: 5000,
          Top: true,
        };
        this.loading1 = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.test_cursor input {
  cursor: pointer;
}
.team-img {
  width: 50%;
}
</style>
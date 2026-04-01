<template>
  <v-app id="inspire" class="login-background">
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <!-- Top Background Section -->
    <div class="background-top">
      <canvas
        id="dots-canvas"
        style="
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 1;
          pointer-events: none;
        "
      ></canvas>

      <v-container fluid class="fill-height d-flex align-center justify-center">
        <v-row justify="center">
          <v-col cols="12" xs="12" sm="8" md="6" lg="4">
            <div class="login-card-wrapper">
              <v-card class="login-card pa-6">
                <div class="text-center mb-4 mt-n4">
                  <v-img
                    :src="stichhLogo"
                    width="150"
                    height="80"
                    contain
                    class="mb-2 ml-n4"
                  />
                </div>

                <h1 class="text-h6 font-weight-bold mt-n6 mb-1 text-left">
                  Welcome Back !
                </h1>
                <p class="text-subtitle-2 text-medium-emphasis text-left">
                  {{
                    otpVisible === 0
                      ? "Sign in to continue to Stichh."
                      : "Enter the OTP sent to your email."
                  }}
                </p>
                <v-form
                  class="d-flex flex-column"
                  style="justify-content: flex-start"
                  @submit.prevent
                >
                  <v-text-field
                    v-model="userEmail"
                    variant="outlined"
                    density="compact"
                    label="Email"
                    placeholder="Enter your email"
                    :rules="[rules.required, rules.email]"
                    hide-details="auto"
                    :readonly="otpVisible === 1"
                    class="mb-3 mt-4"
                    @keydown.enter.prevent="validate_sign_in('otp')"
                  />

                  <transition name="fade">
                    <div
                      v-if="otpVisible === 1"
                      class="d-flex flex-column align-center mb-4"
                    >
                      <v-otp-input
                        v-model="otpInput"
                        length="6"
                        :ref="otpRef"
                        class="mb-2"
                        style="gap: 8px"
                        @keydown.enter.prevent="validate_sign_in('login')"
                      />
                      <div
                        class="d-flex align-center justify-center"
                        style="font-size: 13px"
                      >
                        <span class="text-medium-emphasis">
                          {{
                            otpRefresh === false
                              ? `Resend OTP (${timer}s)`
                              : "Resend OTP"
                          }}
                        </span>
                        <v-btn
                          v-if="!timerRunning"
                          icon
                          size="small"
                          variant="text"
                          color="primary"
                          @click="restartTimer('resendotp')"
                        >
                          <v-icon size="16">mdi-refresh</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </transition>

                  <v-spacer class="mt-2" />
                  <!-- Primary Button -->
                  <v-btn
                    block
                    :color="loading1 ? 'grey' : 'primary'"
                    size="large"
                    class="white--text mt-4"
                    :loading="loading1"
                    @click="
                      validate_sign_in(otpVisible === 0 ? 'otp' : 'login')
                    "
                  >
                    {{ otpVisible === 0 ? "SEND OTP" : "SIGN IN" }}
                  </v-btn>

                  <!-- OR Divider (Show only before OTP is sent) -->
                  <div v-if="otpVisible === 0" class="d-flex align-center my-4 mb-4">
                    <v-divider></v-divider>
                    <span
                      class="mx-3 text-medium-emphasis"
                      style="font-size: 13px"
                    >
                      OR
                    </span>
                    <v-divider></v-divider>
                  </div>

                  <!-- Google Button -->
                  <v-btn
                    v-if="otpVisible === 0"
                    block
                    class="social-btn"
                    size="large"
                    elevation="0"
                    @click="newLoginMethod"
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      class="social-icon"
                    />
                    <span class="social-text ml-5">Continue with Google</span>
                  </v-btn>

                  <!-- Microsoft Button -->
                  <v-btn
                    v-if="otpVisible === 0"
                    block
                    class="social-btn mt-3"
                    size="large"
                    elevation="0"
                    @click="loginWithMicrosoft"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                      alt="Microsoft"
                      class="social-icon ml-3"
                    />
                    <span class="social-text ml-5"
                      >Continue with Microsoft</span
                    >
                  </v-btn> 
                </v-form>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Soft Wave -->
      <div class="wave-container">
        <svg viewBox="0 0 1440 120" class="wave-svg" preserveAspectRatio="none">
          <path
            class="wave-path"
            fill="#f5f6f8"
            d="M0,0 C720,60 720,60 1440,0 L1440,120 L0,120 Z"
          />
        </svg>
      </div>
    </div>

    <!-- <div class="white-background"></div> -->

    <div style="position: absolute; bottom: 0; right: 0; padding: 10px">
      V-4.3.7
    </div>
  </v-app>
</template>

<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { Auth } from "aws-amplify";
import AuthHelper from "@/utils/authHelper.js";
import stichhLogo from "@/assets/stichhdigitize.png";
import { initiateLocalCacheDB } from "@/db.js";

export default {
  components: {
    SnackBar,
  },

  mixins: [initiateLocalCacheDB],
  data() {
    return {
      userEmail: "",
      userName: "",
      password: "",
      showPassword: false,
      rememberMe: false,
      SnackBarComponent: {},
      steps: null,
      loading1: false,
      otpInput: "",
      otpVisible: 0,
      userDetails: null,
      isEmailEntered: false,
      timerRunning: false,
      timer: 60,
      otpRef: "otpInput",
      otpRefresh: false,
      rules: {
        required: (v) => !!v || "This field is required",
        email: (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      },
      dots: [],
      dotsCount: 50,
      ctx: null,
      canvas: null,
      stichhLogo,
    };
  },
  // async created() {
  //   // Enhanced authentication cleanup
  //   await this.clearAuthenticationData();
  // },
  mounted() {
    // this.clearAllStores();
    this.canvas = document.getElementById("dots-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);

    for (let i = 0; i < this.dotsCount; i++) {
      this.dots.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      });
    }

    this.animateDots();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeCanvas);
  },
  methods: {
    async clearAuthenticationData() {
      try {
        // Force sign out to clear any cached tokens
        await Auth.signOut();
        console.log("User signed out successfully");
      } catch (error) {
        // Ignore errors as user might not be signed in
        console.log("No user to sign out or sign out error:", error.message);
      }

      // Clear all store data
      this.$store.commit("SetAuth", false);
      this.$store.commit("SetUserEmail", "");
      this.$store.commit("SetUserObj", {});
      this.$store.commit("SetOrgLogo", "");
      this.$store.commit("SetBreadCrumbItems", []);
      this.$store.commit("SetimageCheck", false);
      this.$store.commit("SetFirstSignup", false);
      this.$store.commit("SetflowZeroStep", []);
      this.$store.commit("SetUserEmailTeam", "");
      this.$store.commit("SetOrgDetails", {});
      this.$store.commit("SetFormObj", {});
      this.$store.commit("Setappitems", {});
      this.$store.commit("SetFlowItem", {});
      this.$store.commit("SetLeaveType", []);
      this.$store.commit("Setproductitems", {});
      this.$store.commit("Setpathinfo", "");
      this.$store.commit("SetCRMForm", {});
      this.$store.commit("Setdashboarditems", {});
      this.$store.commit("SetMessageitems", {});
      this.$store.commit("Setappadmins", false);
      this.$store.commit("Setnamesearch", "");
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormType", "");
      this.$store.commit("SetMqttClient", null);
      this.$store.commit("SetadministrationCheck", false);
      this.$store.commit("SetadminAppsCheck", false);
      this.$store.commit("SetFormName", "");
      this.$store.commit("SetEditFormDetails", {});
      this.$store.commit("SetFormLibObject", {});
      this.$store.commit("SetAuditActions", {});
      this.$store.commit("Setloginaudit", false);
      this.$store.commit("SetInitiatorId", "");
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("Setreporttracker", {});
      this.$store.commit("Setlibraryformtype", "");
      this.$store.commit("SetdashboardDetails", {});
      this.$store.commit("SetExternalForm", false);
      this.$store.commit("SetPublishMessage", []);
      this.$store.commit("SetTvdetails", {});
      this.$store.commit("SetCustomFormDesign", false);
      this.$store.commit("Settvboardback", false);
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetappName", "");
      this.$store.commit("Setappicon", "");
      this.$store.commit("Setvisitdetails", {});
      this.$store.commit("SetVisitorFormEdit", false);
      this.$store.commit("SetTermsandConditions", {});
      // this.$store.commit("SetmqqtColor", "");
      this.$store.commit("SetdragCheck", false);
      this.$store.commit("SetstockStatus", "");
      this.$store.commit("SetcustomerDetails", {});
      this.$store.commit("SetcustomerData", {});
      this.$store.commit("Setvendorbulkback", false);
      this.$store.commit("SetChecklist", {});
      this.$store.commit("ClearWebsiteBuilder");

      // Clear notifications and related data
      this.$store.commit("CLEAR_NOTIFICATIONS");
      this.$store.commit("CLEAR_TASKS");
      this.$store.commit("CLEAR_PENDING");
      this.$store.commit("CLEAR_APPLIST");
      this.$store.commit("CLEAR_CHANNELS");
      this.$store.commit("CLEAR_CHATS");

      // Clear localStorage and sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();

        // Clear specific localStorage items that might be set elsewhere
        localStorage.removeItem("vuex-state");
        localStorage.removeItem("notoficationItems");
        localStorage.removeItem("amplify-signin-with-hostedUI");
        localStorage.removeItem("amplify-cache");
        localStorage.removeItem("aws.cognito.identity-id");
        localStorage.removeItem("aws.cognito.identity-providers");

        // Clear any Amplify cached tokens
        const amplifyKeys = Object.keys(localStorage).filter(
          (key) =>
            key.includes("amplify") ||
            key.includes("cognito") ||
            key.includes("aws")
        );
        amplifyKeys.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.log("Error clearing storage:", error.message);
      }
    },

    resizeCanvas() {
      if (this.canvas) {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
      }
    },

    animateDots() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let dot of this.dots) {
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this.ctx.fill();
      }
      this.updateDots();
      requestAnimationFrame(this.animateDots);
    },

    updateDots() {
      for (let dot of this.dots) {
        dot.x += dot.dx;
        dot.y += dot.dy;

        if (dot.x < 0 || dot.x > this.canvas.width) dot.dx = -dot.dx;
        if (dot.y < 0 || dot.y > this.canvas.height) dot.dy = -dot.dy;
      }
    },
    startTimer() {
      this.timer = 60;
      this.timerRunning = true;
      const interval = setInterval(() => {
        this.timer--;
        if (this.timer <= 0) {
          clearInterval(interval);
          this.timerRunning = false;
          this.otpRefresh = true;
        }
      }, 1000);
    },
    backtologin() {
      window.location.href = "https://www.stichh.com/";
    },

    restartTimer() {
      this.otpRefresh = true;
      this.validate_sign_in("resendotp");
    },

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
              SnackbarText: "Couldn't find your Stichh account",
              timeout: 5000,
              Top: true,
            };
          });
      } catch (error) {}
    },

    validate_sign_in(type) {
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
        if (type == "otp") {
          this.startTimer();
          this.generate_otp();
        } else if (type == "resendotp") {
          this.generate_otp();
        } else {
          this.login_with_otp();
        }
      }
    },

    focusOnOTPField() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs[this.otpRef].focus();
        }, 100);
      });
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
            this.focusOnOTPField();
            this.otpVisible = 1;

            this.loading1 = false;
          })
          .catch((err) => {
            // Handle specific authentication errors
            if (
              err.name === "NotAuthorizedException" &&
              err.message.includes("Access Token has been revoked")
            ) {
              // Clear authentication data and retry
              this.clearAuthenticationData().then(() => {
                this.SnackBarComponent = {
                  SnackbarVmodel: true,
                  SnackbarColor: "orange",
                  SnackbarText: "Session expired. Please try again.",
                  timeout: 5000,
                  Top: true,
                };
              });
            } else {
              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "red",
                SnackbarText: "Couldn't find your Stichh account!!",
                timeout: 5000,
                Top: true,
              };
            }
            this.loading1 = false;
          });
      } catch (error) {
        // Handle any other errors
        if (
          error.name === "NotAuthorizedException" &&
          error.message.includes("Access Token has been revoked")
        ) {
          await this.clearAuthenticationData();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "orange",
            SnackbarText: "Session expired. Please try again.",
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: error.message,
            timeout: 5000,
            Top: true,
          };
        }
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
          .then(async (user) => {
            this.$store.commit("SetAuth", true);
            this.$store.commit("SetUserEmail", this.userEmail);
            this.$store.commit("Setloginaudit", true);

            // Fetch user data using AuthHelper before navigation
            try {
              await AuthHelper.fetchUserData();

              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "green",
                SnackbarText: "Login Successfull!",
                timeout: 5000,
                Top: true,
              };

              this.$router.push("/home/DashboardView");
            } catch (error) {
              // If user data fetch fails, clear auth and redirect to login
              await AuthHelper.clearAuth();

              // Show appropriate error message
              if (error.message.includes("Authentication failed")) {
                this.SnackBarComponent = {
                  SnackbarVmodel: true,
                  SnackbarColor: "orange",
                  SnackbarText: "Session expired. Please login again.",
                  timeout: 5000,
                  Top: true,
                };
              } else {
                this.SnackBarComponent = {
                  SnackbarVmodel: true,
                  SnackbarColor: "red",
                  SnackbarText: "Login failed. Please try again.",
                  timeout: 5000,
                  Top: true,
                };
              }

              this.$router.push("/");
            }

            this.loading1 = false;
          })
          .catch((err) => {
            // Handle specific authentication errors
            if (
              err.name === "NotAuthorizedException" &&
              err.message.includes("Access Token has been revoked")
            ) {
              this.clearAuthenticationData().then(() => {
                this.SnackBarComponent = {
                  SnackbarVmodel: true,
                  SnackbarColor: "orange",
                  SnackbarText: "Session expired. Please try again.",
                  timeout: 5000,
                  Top: true,
                };
              });
            } else {
              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "red",
                SnackbarText: "Invalid OTP",
                timeout: 5000,
                Top: true,
              };
            }
            this.loading1 = false;
            this.otpInput = "";
          });
      } catch (error) {
        // Handle any other errors
        if (
          error.name === "NotAuthorizedException" &&
          error.message.includes("Access Token has been revoked")
        ) {
          await this.clearAuthenticationData();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "orange",
            SnackbarText: "Session expired. Please try again.",
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: error.message,
            timeout: 5000,
            Top: true,
          };
        }
        this.loading1 = false;
      }
    },
    async newLoginMethod() {
      if (this.loading1) return;

      this.loading1 = true;

      try {
        await Auth.federatedSignIn({
          provider: "Google",
        });

        // await Auth.currentAuthenticatedUser()
        //     .then(async (user) => {
        //       this.$store.commit("SetAuth", true);
        //       this.$store.commit("SetUserEmail", this.userEmail);
        //       this.$store.commit("Setloginaudit", true);
        //     });
      } catch (error) {
        console.log("Error during sign-in:", error);

        if (error.message === "There is already a signed in user.") {
          await Auth.signOut();
          return this.newLoginMethod();
        }

        if (
          error.message?.includes("redirect is coming from a different origin")
        ) {
          this.SnackbarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "redColorVariant2",
            Top: true,
            SnackbarText: error.message,
          };
        }
      } finally {
        this.loading1 = false; // ✅ FIXED
      }
    },
    // async loginWithMicrosoft() {
    //   if (!this.loading1) {
    //     this.loading1 = true;
    //     try {
    //       await Auth.federatedSignIn({
    //         customProvider: "Microsoft",
    //       });
    //     } catch (error) {
    //       console.log("Error during Microsoft sign-in:", error);
    //       if (error.message === "There is already a signed in user.") {
    //         await Auth.signOut();
    //         return this.loginWithMicrosoft();
    //       }
    //     } finally {
    //       this.loading1 = false;
    //     }
    //   }
    // },
    loginWithMicrosoft(){
      this.$router.push('/MicrosoftLogin')
    }
  },
};
</script>

<style scoped>
.google-btn {
  background-color: #ffffff !important;
  color: #444 !important;
  border: 1px solid #dadce0;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-btn:hover {
  background-color: #f7f8f8 !important;
}

.google-icon {
  width: 20px;
  height: 20px;
}
.login-background {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f6f8;
}

.background-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  min-height: 65vh;
  width: 100vw;
  background: linear-gradient(rgba(34, 61, 131, 0.5), rgba(34, 61, 131, 0.5)),
    url("@/assets/login-bgNew2.webp") center center / cover no-repeat;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card-wrapper {
  position: absolute;
  top: 84%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  height: 450px; /* 👈 FIXED HEIGHT */
  display: flex;
  flex-direction: column;
  justify-content: start;
  overflow: hidden;
  padding: 28px 24px;
  /* background: white;
  border-radius: 8px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  padding-top: 140px; */
}

.wave-container {
  position: absolute;
  bottom: -1px;
  width: 100%;
  height: 120px;
  overflow: hidden;
  z-index: 2;
  line-height: 0;
}

.wave-svg {
  width: 100%;
  height: 150px;
  display: block;
}

.wave-path {
  animation: waveMove 6s ease-in-out infinite alternate;
}

@keyframes waveMove {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(8px);
  }
  100% {
    transform: translateY(0px);
  }
}

.white-background {
  background-color: #f5f6f8;
  height: 100%;
}
.or-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 16px 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
}

.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.or-divider:not(:empty)::before {
  margin-right: 10px;
}

.or-divider:not(:empty)::after {
  margin-left: 10px;
}

.social-btn {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  color: #3c4043 !important;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.social-btn:hover {
  background-color: #f8f9fa !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.social-icon {
  width: 20px;
  height: 20px;
}

.social-text {
  font-size: 14px;
  letter-spacing: 0.2px;
}
</style>


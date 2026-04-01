<template>
  <div>
    <v-card-text>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-row no-gutters>
        <v-col cols="6">
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <label>OpenAI</label>
                <v-text-field
                  class="mt-2"
                  outlined
                  v-model="openAPIKey"
                  hint="Enter a valid Api Key"
                  dense
                  label="API Key"
                />
              </v-col>
              <v-col cols="1" v-if="displaystatus == 'SUCCESS'">
                <v-tooltip bottom color="success">
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-on="on"
                      medium
                      v-bind="attrs"
                      class="mt-10"
                      @click="verifyEmail()"
                    >
                      <v-icon color="success">mdi-check-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>Verified</span>
                </v-tooltip>
              </v-col>
              <div v-if="displaystatus != 'SUCCESS'">
                <v-col cols="1" v-show="openAPIKey.length > 1">
                  <v-btn
                    small
                    class="mt-10 text-capitalize white--text cardCss"
                    style="margin-left: 100px"
                    @click="verifyapi()"
                  >
                    Verify
                  </v-btn>
                </v-col>
              </div>

              <v-col cols="12">
                <v-card-actions class="justify-start">
                  <v-btn
                    :loading="loading"
                    dark
                    @click="validate_data()"
                    class="text-capitalize cardCss ml-n2"
                    >Save</v-btn
                  >
                </v-card-actions>
              </v-col>
            </v-row>
            <!-- <v-row no-gutters>
              <v-col cols="12">
                <v-row>
                  <v-col cols="3">
                    <label class="d-flex justify-start">Select AI</label>
                    <v-checkbox
                      v-model="aiSelection"
                      label="OpenAI"
                      color="blue"
                      hide-details
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      class="mt-10"
                      outlined
                      v-model="openAPIKey"
                      hint="Enter a valid Api Key"
                      dense
                      label="API Key"
                    />
                  
                  </v-col>
                
                  <div v-if="displaystatus != 'SUCCESS'">
                    <v-col
                      cols="1"
                      v-show="aiSelection == true && openAPIKey.length > 1"
                    >
                      <v-btn
                        small
                        class="mt-10 text-capitalize white--text cardCss"
                        style="margin-left: 100px"
                        @click="verifyapi()"
                      >
                        Verify
                      </v-btn>
                    </v-col>
                  </div>

                  <v-col
                    cols="1"
                    v-if="displaystatus == 'SUCCESS' && aiSelection == true"
                  >
                    <v-tooltip bottom color="success">
                      <template #activator="{ on, attrs }">
                        <v-btn
                          icon
                          v-on="on"
                          medium
                          v-bind="attrs"
                          class="mt-10"
                          @click="verifyEmail()"
                        >
                          <v-icon color="success">mdi-check-circle</v-icon>
                        </v-btn>
                      </template>
                      <span>Verified</span>
                    </v-tooltip>
                  </v-col>
                
                </v-row>
                <v-row class="mt-n5">
                  <v-col cols="3">
                    <v-checkbox
                      v-model="aiSelection2"
                      label="BARD"
                      color="blue"
                      class="mt-2"
                      hide-details
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      class=""
                      outlined
                      v-model="openAPIKey2"
                      dense
                      label="API Key"
                    />
                  </v-col>
                </v-row>

           
              </v-col>

            
              <v-col cols="12">
                <v-card-actions class="justify-start">
                  <v-btn
                    :loading="loading"
                    dark
                    @click="validate_data()"
                    class="text-capitalize cardCss ml-n2"
                    >Save</v-btn
                  >
                </v-card-actions>
              </v-col>
            </v-row> -->
          </v-form>
        </v-col>
        <v-col cols="6">
          <v-card class="ml-4" outlined>
            <v-card-title> OpenAI:</v-card-title>
            <v-card-text class="d-flex justify-left">
              <div class="text-left">
                The OpenAI API provides access to some of the most advanced AI
                models available, including natural language processing,
                computer vision, and more. With an API key, you can integrate
                these models into your own applications and workflows, enabling
                you to create more intelligent and sophisticated systems.
              </div>
              <br />
            </v-card-text>
            <v-card-text class="text-left">
              URL :-
              <a href="https://beta.openai.com/signup/" target="_blank"
                >https://beta.openai.com/signup/</a
              >
            </v-card-text>
            <v-card-title> BARD AI:</v-card-title>
            <v-card-text class="text-left">
              URL :-
              <a href="https://bard.google.com/" target="_blank"
                >https://bard.google.com/</a
              >
            </v-card-text>
          </v-card>
          <!-- <v-card v-if="aiSelection == 'OpenAI'" class="ml-4" outlined>
            <v-card-title> Steps to create an API key for OpenAI:</v-card-title>
            <v-card-text>
              <div class="text-left">
                1. Sign up for an OpenAI account: Go to the OpenAI website and
                sign up for an account by providing your email address and
                creating a password.
              </div>
              <br />
              <div class="text-left">
                2. Choose the API plan: Once you have signed up, select the API
                plan that best suits your needs. OpenAI offers several different
                plans depending on your usage, such as the Developer plan, which
                provides access to the GPT-3 API, or the Scale plan, which
                offers more features and higher usage limits.
              </div>
              <br />
              <div class="text-left">
                3. Create an API key: Once you have chosen a plan, navigate to
                the API dashboard, and click on the "Create new API key" button.
                This will generate a unique API key that you can use to access
                the OpenAI API.
              </div>
              <br />
              <div class="text-left">
                4. Integrate the API key into your application: Once you have
                your API key, you can integrate it into your application using
                the appropriate API client or SDK provided by OpenAI. This will
                allow you to make requests to the OpenAI API and receive
                responses based on your chosen plan and usage limits.
              </div>
            </v-card-text>
          </v-card>
          <v-card v-else class="ml-4" outlined>
            <v-card-title>
              Steps to create an API key for the BARD AI :</v-card-title
            >
            <v-card-text>
              <div class="text-left">
                1. Sign up for a BARD AI account: Go to the BARD AI website and
                sign up for an account by providing your email address and
                creating a password.
              </div>
              <br />
              <div class="text-left">
                2. Choose a plan: Once you have signed up, select the plan that
                best suits your needs. BARD AI offers several different plans
                depending on your usage, such as the Developer plan or the
                Enterprise plan.
              </div>
              <br />
              <div class="text-left">
                3. Create an API key: Once you have chosen a plan, navigate to
                the API dashboard, and click on the "Create new API key" button.
                This will generate a unique API key that you can use to access
                the BARD AI language model API.
              </div>
              <br />
              <div class="text-left">
                4. Integrate the API key into your application: Once you have
                your API key, you can integrate it into your application using
                the appropriate API client or SDK provided by BARD AI. This will
                allow you to make requests to the BARD AI language model API and
                receive responses based on your chosen plan and usage limits.
              </div>
            </v-card-text>
          </v-card> -->
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>
<script>
/* eslint-disable */
import { get_ai_api_settings } from "@/graphql/queries.js";
import { gpt_ai_settings } from "@/graphql/mutations.js";
import { openai_api_key_verification } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      newarray: [],
      newarray2: [],
      aiSelection: false,
      aiSelection2: false,
      maxLength: 3,
      check: false,
      show1: false,
      openAPIKey: "",
      loading: false,
      SnackBarComponent: {},
      getResponse: "",
      bardAPiKey: "",
      openAPIKey2: "",
      displaystatus: "",
    };
  },
  watch: {
    openAPIKey(val) {
      if (val == "") {
        this.displaystatus = "";
      }
    },
  },
  async created() {
    await this.get_api();
  },

  methods: {
    // truncateddText() {
    //   this.openAPIKey =
    //     this.openAPIKey.substring(0, 3) +
    //     "*".repeat(this.openAPIKey.length - 3);
    // },
    async get_api() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_ai_api_settings, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        let response = JSON.parse(result.data.get_ai_api_settings).items[0]
          .ai_types;
        let id_type = JSON.parse(result.data.get_ai_api_settings).items[0]
          .setting_id;

        this.displaystatus = response[0].is_verified == true ? "SUCCESS" : "";
        this.openAPIKey = response[0].organization_ai_apkey;

        this.getResponse = id_type;
      } catch (error) {
        this.loading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    validate_data() {
      if (this.openAPIKey != "" && this.displaystatus == "SUCCESS") {
        this.create_api();
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Enter Valid API Key!!",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async create_api() {
      this.newarray = [];
      this.loading = true;

      this.newarray.push({
        organization_ai_type: "OPENAI",
        organization_ai_apkey: this.openAPIKey,
        is_verified: this.displaystatus == "SUCCESS" ? true : false,
      });

      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(gpt_ai_settings, {
            input: {
              organization_id: data.organization.organization_id,
              setting_id: this.getResponse,
              ai_types: this.newarray,
            },
          })
        );
        var response = JSON.parse(result.data.gpt_ai_settings);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.get_api();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        this.loading = false;
      }
    },
    async verifyapi() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(openai_api_key_verification, {
            input: {
              customer_api_key: this.openAPIKey,
            },
          })
        );

        var response = JSON.parse(result.data.openai_api_key_verification);
        this.displaystatus = response.Status;
        if (this.displaystatus == "SUCCESS") {
          // this.check = true;
          // this.truncatedText();
        }

        if (response.Status == "ERROR") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>
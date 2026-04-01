<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- <v-toolbar flat dense> </v-toolbar> -->
    <v-card class="mt-4 ml-4" flat>
      <v-card-text>
        <label class="font-weight-bold">API Key </label>
        <div>
          <span ref="textInputapi">{{ teamAPiKey }}</span>

          <v-btn
            x-small
            @click="copyToClipboard_api_key()"
            variant="flat"
            class="ml-"
            ><v-icon small>mdi-content-copy</v-icon></v-btn
          >
        </div>

        <!-- <v-row no-gutters>
          <v-col cols="8">
            <v-row no-gutters>
              <v-col cols="6">
                <v-text-field
                  dense
                  readonly
                  outlined
                  v-model="teamAPiKey"
                  label=" API Key"
                />
              </v-col> -->
        <!-- <v-col cols="2">
                <v-btn
                  class="ml-2 mt-1"
                  :loading="loading"
                  small
                  @click="generate_apiKey()"
                >
                  Generate API Key</v-btn
                >
              </v-col> -->
        <!-- </v-row>
          </v-col>
        </v-row> -->
      </v-card-text>
    </v-card>
    <v-card class="mt-1 ml-4" outlined>
      <v-card-title
        ><v-icon class="mr-2">mdi-timelapse</v-icon> Regenerate API
        Key</v-card-title
      >
      <v-card-text>
        <div class="text-left">Has your key been compromised ?</div>

        <div class="text-left">You can generate a new Key.</div>
        <br />
        <div class="text-left"><b> Before you proceed ? </b></div>

        <div class="text-left">
          * You will need to check your apps to use the new key.
        </div>

        <div class="text-left">* Your statistics will be reset.</div>

        <div class="text-left">* This action cannot be undone.</div>
        <v-checkbox v-model="checkbox">
          <template #label>
            <div>I agree to above and would like to regenerate api key.</div>
          </template>
        </v-checkbox>
      </v-card-text>
      <v-card-actions class="justify-start mt-n6 ml-2">
        <v-btn
          class="cardCss white--text"
          :loading="loading"
          size="small"
          @click="generate_apiKey()"
        >
          Generate API Key</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { team_api_key_generation } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  mixins: [get_Org_details],
  components: {
    SnackBar,
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      teamAPiKey: "",
      SnackBarComponent: {},
      loading: false,
      checkbox: false,
    };
  },
  async created() {
    await this.get_Org_details();
    this.teamAPiKey = this.orgDetails.organization.team_api_key;
  },
  methods: {
    copyToClipboard_api_key() {
      const spanElement = this.$refs.textInputapi;
      const text = spanElement.innerText;

      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "APi Key copied to clipboard",
              timeout: 5000,
              Top: true,
            };
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },
    async generate_apiKey() {
      if (this.checkbox == false) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please agree to proceed",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(team_api_key_generation, {
              input: {
                organization_id: data.organization.organization_id,
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(result.data.team_api_key_generation);

          if (response.Status == "SUCCESS") {
            this.teamAPiKey = response.key;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.checkbox = false;
          } else {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.checkbox = false;
          }
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
      }
    },
  },
};
</script>
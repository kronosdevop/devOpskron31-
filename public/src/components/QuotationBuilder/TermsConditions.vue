<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <OverlayComp :overlay="overlay" />
    <v-card class="" flat >
      <v-card-text>
        <v-form ref="form">
          <v-container fluid>
            <v-row>
              <!-- Left Column: Terms and Conditions -->
              <v-col cols="12" md="6">
                <v-card flat class="pa-3">
                  <v-card-title class="text-subtitle-1 font-weight-bold"
                    >Terms and Conditions</v-card-title
                  >
                  <v-divider class="mb-3"></v-divider>

                  <v-textarea
                    label="Quotation Terms"
                    density="compact"
                    variant="outlined"
                    v-model="quotationTerms"
                    :rules="[rules.required]"
                    class="mb-4"
                  ></v-textarea>

                  <v-textarea
                    label="Billing Terms"
                    density="compact"
                    variant="outlined"
                    v-model="billingTerms"
                    :rules="[rules.required]"
                    class="mb-4"
                  ></v-textarea>

                  <v-textarea
                    label="Proforma Terms"
                    density="compact"
                    variant="outlined"
                    v-model="proformaTerms"
                    :rules="[rules.required]"
                  ></v-textarea>
                </v-card>
              </v-col>

              <!-- Right Column: Prefixes -->
              <v-col cols="12" md="6">
                <v-card flat class="pa-3">
                  <v-card-title class="text-subtitle-1 font-weight-bold"
                    >Document Prefixes</v-card-title
                  >
                  <v-divider class="mb-3"></v-divider>

                  <v-text-field
                    label="Prefix for Quotation"
                    density="compact"
                    variant="outlined"
                    v-model="quotationPrefix"
                    :rules="[rules.required]"
                    maxlength="5"
                    @input="quotationPrefix = $event.toUpperCase().slice(0, 5)"
                    class="mb-4"
                  />

                  <v-text-field
                    label="Prefix for Billing"
                    density="compact"
                    variant="outlined"
                    v-model="billingPrefix"
                    :rules="[rules.required]"
                    maxlength="5"
                    @input="billingPrefix = $event.toUpperCase().slice(0, 5)"
                    class="mb-4"
                  />

                  <v-text-field
                    label="Prefix for Proforma"
                    density="compact"
                    variant="outlined"
                    v-model="proformaPrefix"
                    :rules="[rules.required]"
                    maxlength="5"
                    @input="proformaPrefix = $event.toUpperCase().slice(0, 5)"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-start">
        <v-btn
          dark
          size="small"
          @click="validateAndSave()"
          :loading="loading"
          class="text-capitalize cardCss ml-4 mt-n8"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
import { create_organization_prefixs } from "@/graphql/mutations.js";
import { quotation_terms_conditions } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";

export default {
  components: {
    SnackBar,
    OverlayComp,
  },
  data() {
    return {
      billingTerms: "",
      quotationTerms: "",
      proformaTerms: "",
      quotationPrefix: "",
      proformaPrefix: "",
      billingPrefix: "",
      loading: false,
      apiCheck: false,
      SnackBarComponent: {},

      overlay: false,
      rules: {
        required: (val) => !!val || "This field is required",
      },
    };
  },
  created() {
    this.list_terms();
  },
  methods: {
    async validateAndSave() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.apiCheck = true;
        let data = this.$store.getters.GetTermsandConditions;

        if (data.billing_prefix !== this.billingPrefix) {
          await this.Add_Prefix(this.billingPrefix, "BILLING");
        }
        if (data.quotation_prefix !== this.quotationPrefix) {
          await this.Add_Prefix(this.quotationPrefix, "QUOTATION");
        }
        if (data.proforma_prefix !== this.proformaPrefix) {
          await this.Add_Prefix(this.proformaPrefix, "PROFORMA");
        }
        if (this.apiCheck == true) {
          this.save_terms();
        }
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please fill in all required fields",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async Add_Prefix(prefix, val) {
      this.loading = true;
      let data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(create_organization_prefixs, {
            input: {
              organization_id: data.organization.organization_id,
              prefix_name: prefix,
              prefix_type: val,
            },
          })
        );
        let response = JSON.parse(result.data.create_organization_prefixs);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.apiCheck = true;
        } else {
          this.apiCheck = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.apiCheck = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].messag,
          timeout: 5000,
          Top: true,
        };

        this.loading = false;
      }
    },
    async save_terms() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_terms_conditions, {
            input: {
              quotation_terms_conditions: this.quotationTerms,
              billing_terms_conditions: this.billingTerms,
              proforma_terms_conditions: this.proformaTerms,
              action_type: "CREATEUPDATE",
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.quotation_terms_conditions);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.list_terms();
        } else {
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "red",
          //   SnackbarText: response.Message,
          //   timeout: 5000,
          //   Top: true,
          // };
        }
      } catch (error) {
        this.tableLoading = false;
        console.error(error);
      }
    },

    async list_terms() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_terms_conditions, {
            input: {
              action_type: "LIST",
            },
          })
        );

        this.overlay = false;
        var response = JSON.parse(result.data.quotation_terms_conditions);

        if (response.Status === "SUCCESS") {
          this.quotationTerms =
            response.data[0].quotation_terms_conditions || "";
          this.billingTerms = response.data[0].billing_terms_conditions || "";
          this.proformaTerms = response.data[0].proforma_terms_conditions || "";
          this.proformaPrefix = response.proforma_prefix || "";
          this.billingPrefix = response.billing_prefix || "";
          this.quotationPrefix = response.quotation_prefix || "";

          this.$store.commit("SetTermsandConditions", response);
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
        this.overlay = false;
        console.error(error);
      }
    },
  },
};
</script>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="previewconfirmDialogue"
      @update:model-value="$emit('update:previewconfirmDialogue', $event)"
      persistent
      max-width="900"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Preview</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-row class="mt-3" no-gutters>
            <v-col cols="6" class="d-flex align-left justify-left">
              <v-img
                class=""
                contain
                v-if="logoUrl"
                height="60"
                max-width="100"
                :src="logoUrl"
                @error="handleImageError"
                @load="handleImageLoad"
              ></v-img>
              <div v-else class="text-grey-6">No logo available</div>
            </v-col>
            <v-col cols="6">
              <v-row no-gutters>
                <v-col cols="4">
                  <div class="text-left font-weight-bold FontSize">Name :</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-left font-weight-bold FontSize">
                    {{ EntityDetails.entity_name }}
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4">
                  <div
                    v-if="
                      EntityDetails.owner_country_code &&
                      EntityDetails.owner_contact_no
                    "
                    class="text-left font-weight-bold FontSize"
                  >
                    Contact Number :
                  </div>
                </v-col>
                <v-col cols="6">
                  <div
                    v-if="
                      EntityDetails.owner_country_code &&
                      EntityDetails.owner_contact_no
                    "
                    class="text-left font-weight-bold FontSize"
                  >
                    {{
                      EntityDetails.owner_country_code +
                      "-" +
                      EntityDetails.owner_contact_no
                    }}
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4">
                  <div class="text-left font-weight-bold FontSize">
                    Address :
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-left font-weight-bold FontSize">
                    {{ EntityDetails.entity_address }}
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider class="ma-2" />
          <label><strong>Customer Details</strong></label>
          <v-card outlined flat>
            <v-row class="mt-3 ma-1" no-gutters>
              <v-col cols="6">
                <v-row no-gutters>
                  <v-col cols="4">
                    <div class="text-left font-weight-bold FontSize">
                      Name :
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-left font-weight-bold FontSize">
                      {{ UserDetails.customer_name }}
                    </div>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="4">
                    <div
                      v-if="
                        UserDetails.customer_country_code &&
                        UserDetails.customer_contact_number
                      "
                      class="text-left font-weight-bold FontSize"
                    >
                      Contact Number :
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div
                      v-if="
                        UserDetails.customer_country_code &&
                        UserDetails.customer_contact_number
                      "
                      class="text-left font-weight-bold FontSize"
                    >
                      {{
                        UserDetails.customer_country_code +
                        "-" +
                        UserDetails.customer_contact_number
                      }}
                    </div>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="4">
                    <div class="text-left font-weight-bold FontSize">
                      Address :
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-left font-weight-bold FontSize">
                      {{ UserDetails.address_line_1 }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>

          <div class="mt-2 mb-1">
            <label><strong>Items</strong></label>
          </div>
          <v-card class="" outlined flat>
            <v-data-table
              :fixed-header="fixed"
              :headers="headers"
              :items="tableData"
              :loading="tableLoading"
              hide-default-footer
              :items-per-page="100"
              dense
              class="elevation-1 dtwidth"
            >
            </v-data-table>
            <v-card-actions class="justify-end">
              <div class="mt-2">
                <label><strong>Total :</strong> {{ grandTotal }} </label>
              </div>
            </v-card-actions>
          </v-card>
          <div class="mt-2 mb-1">
            <label><strong>Terms and Condtions</strong></label>
          </div>
          <v-card class="" outlined flat>
            <v-row class="ma-2" no-gutters>
              <v-col cols="12">
                <div v-html="formattedTermCondition"></div>
              </v-col>
            </v-row>
          </v-card>
          <v-card-actions class="justify-center">
            <v-btn
              dark
              small
              color="primaryColor"
              class="ml-2"
              :loading="loading"
              @click="Confirm_billing()"
              >Confirm</v-btn
            >
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { genrate_list_quotaions_bills } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
  },
  props: {
    previewconfirmDialogue: Boolean,
    tableData: Array,
    UserDetails: Object,
    formattedTable: String,
    grandTotal: Number,
    EntityDetails: Object,
    emailCheck: Boolean,
    termCondtion: String,
  },

  watch: {
    previewconfirmDialogue: {
      async handler() {
        let data = this.$store.getters.GetOrgDetails;

        this.term = this.termCondtion;
        this.logoUrl = this.EntityDetails.entity_logo;

        if (this.logoUrl.includes("N/A")) {
          this.logoUrl = "";
        }

        // Use the data from store instead of undefined orgDetails
        this.logoUrl = await this.s3get(this.logoUrl, data);

        this.organizationAddress = data.organization.organization_address_1;
        // this.$store.commit("Setnamesearch", "");
        // await this.get_all_org_users();
        // await this.fetch_details();
        // console.log(this.termCondtion);
      },
      immediate: true,
    },
  },

  data() {
    return {
      logoUrl: "",
      term: "",
      organizationAddress: "",
      headers: [
        { title: "Category", value: "categoryName", sortable: false },
        { title: "Item", value: "subCategoryName", sortable: false },
        { title: "Unit", value: "unit", sortable: false },

        { title: "Quantity", value: "quantatity", sortable: false },
        { title: "Price (Rs.)", value: "price", sortable: false },
      ],
      fixed: true,
      tableLoading: false,
      SnackBarComponent: {},
      termsAndcondition: "",
      loading: false,
    };
  },

  computed: {
    formattedTermCondition() {
      return this.term.replace(/\n/g, "<br>");
    },
    subtotal() {
      return this.tableData.reduce(
        (sum, item) => sum + (item.price * item.quantatity || 0),
        0
      );
    },
    gstTotal() {
      return this.tableData.reduce(
        (sum, item) => sum + Number(item.tax || 0),
        0
      );
      // return this.tableData.reduce((sum, item) => sum + ((item.price * item.quantatity * (item.tax / 100)) || 0), 0);
    },
  },

  mounted() {
    var data = this.$store.getters.GetTermsandConditions;
    // console.log("data",this.$store.getters.GetTermsandConditions)
    this.termsAndcondition = data.quotation_terms;
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    handleImageError(error) {
      console.error("Image failed to load:", error);
    },

    handleImageLoad() {},

    async s3get(logoUrl, response) {
      // Check if logoUrl is empty or doesn't exist
      if (!logoUrl || logoUrl === "" || logoUrl.includes("N/A")) {
        return "";
      }

      // TEMPORARY: Return original URL for testing
      return logoUrl;

      /* Original S3 logic - commented out for testing
      // Check if response and s3_details exist
      if (!response || !response.s3_details) {
        console.warn("S3 details not available, returning original URL");
        console.log("Response:", response);
        console.log("S3 details:", response?.s3_details);
        return logoUrl;
      }
      
      try {
        console.log("Calling getS3SignedUrl with:", logoUrl, response.s3_details);
        const signedUrl = await getS3SignedUrl(logoUrl, response.s3_details);
        console.log("S3 signed URL result:", signedUrl);
        
        if (signedUrl) {
          return signedUrl;
        }
        console.log("S3 signed URL is empty, returning original URL");
        return logoUrl; // Fallback to original URL if signed URL fails
      } catch (error) {
        console.error("Error getting S3 signed URL:", error);
        return logoUrl; // Fallback to original URL on error
      }
      */
    },

    async Confirm_billing() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(genrate_list_quotaions_bills, {
            input: {
              customer_name: this.UserDetails.customer_name,
              customer_email_id: this.UserDetails.customer_email_id,
              customer_address: this.UserDetails.address_line_1,
              customer_full_number: this.UserDetails.customer_full_number,
              terms_conditions: this.termCondtion,
              customer_id: this.UserDetails.customer_id,
              terms_condition_id: this.$store.getters.GetTermsandConditions.id,
              tableData: this.formattedTable,
              sub_total: this.subtotal.toString(),
              total_amount: this.grandTotal.toString(),
              action_type: "GENRATE",
              type: "QUOTATION",
              entity_id: this.EntityDetails.entity_id,
              is_email_required: this.emailCheck,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.genrate_list_quotaions_bills);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          setTimeout(() => {
            this.$router.push("/home/Quotations");
          }, 3000);
        } else {
          this.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.loading = false;
        console.error(error);
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
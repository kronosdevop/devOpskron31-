<template>
  <div>
    <v-card flat :height="height" class="ml-5">
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card-text class="mt-n3">
        <v-row>
          <v-col cols="6">
            <v-card>
              <v-card-text>
                <v-row class="justify-start" no-gutters>
                  <v-col cols="12">
                    <div
                      class="text-left font-weight-bold mt-2"
                      style="font-size: 15px"
                    >
                      Product Details
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Name</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_name }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Description</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_description }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Indindustry Vertical</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + producttype }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Status</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_status }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Tickets</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_ticket_raise }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Domain Url</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + domainUrl }}</b>
                    </div>
                  </v-col>

                  <v-col cols="4">
                    <div class="text-left mt-2">#Campaigns</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + noOfCampagins }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">#Live Campaigns</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + noOfLiveCampaigns }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">#Upcoming Campaigns</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + noOfUpcomingCampaigns }}</b>
                    </div>
                  </v-col>

                  <v-col cols="4">
                    <div class="text-left mt-2">#Completed Campaigns</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + noOfCompletedCampaigns }}</b>
                    </div>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-divider></v-divider>
                  </v-col>

                  <v-col cols="12">
                    <div
                      class="text-left font-weight-bold mt-2"
                      style="font-size: 15px"
                    >
                      Admin Details
                    </div>
                  </v-col>

                  <v-col cols="4">
                    <div class="text-left mt-2">Name</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + userselect }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Email ID</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + adminemail }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Contact Number</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + contactnumber }}</b>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="justify-end mr-5">
                <v-btn
                  depressed
                  :loading="loading"
                  @click="edit_mutation()"
                  dark
                  class="cardCss button-corner text-capitalize"
                >
                  edit
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-if="componentcheck == 1">
      <EditProduct
        :producteditdetails="producteditdetails"
        @clicked="producteditdetails = false"
        :editdetails="editdetails"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { get_product_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EditProduct from "@/components/CRM/Popups/EditProduct.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    EditProduct,
    SnackBar,
  },
  data() {
    return {
      product_name: "",
      product_description: "",
      userselect: "",
      userArray: [],
      componentcheck: 0,
      contactnumber: "",
      SnackBarComponent: {},
      domainUrl: "",
      searchF: "",
      editdetails: {},
      height: 0,
      loading: false,
      adminemail: "",
      product_status: "",
      producttype: "",
      product_ticket_raise: "",
      noOfCampagins: "",
      noOfUpcomingCampaigns: "",
      noOfLiveCampaigns: "",
      noOfCompletedCampaigns: "",
    };
  },

  created() {
    this.height = window.innerHeight - 310;
    this.get_product();
  },
  methods: {
    async get_product() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_product_details, {
            input: {
              product_id: this.$store.getters.Getproductitems.product_id,
            },
          })
        );
        this.tableLoading = false;

        var response = result.data.get_product_details.items[0];
        var admin = JSON.parse(
          result.data.get_product_details.items[0].admin_details
        );
        this.editdetails = response;
        this.product_name = response.product_name;
        this.product_description = response.product_description;
        this.producttype = response.product_type;
        this.userselect = admin.full_user_name;
        this.product_status = response.product_status;
        this.adminemail = admin.user_email_id;
        this.product_ticket_raise = response.product_ticket_raise;
        this.domainUrl =
          response.product_domain_url == null
            ? ""
            : response.product_domain_url;
        this.contactnumber = admin.user_full_contact_number;
        this.noOfCampagins =
          response.no_of_campaigns == null ? 0 : response.no_of_campaigns;
        this.noOfUpcomingCampaigns =
          response.no_upcoming_campaigns == null
            ? 0
            : response.no_upcoming_campaigns;
        this.noOfLiveCampaigns =
          response.no_live_campaigns == null ? 0 : response.no_live_campaigns;
        this.noOfCompletedCampaigns =
          response.no_completed_campaigns == null
            ? 0
            : response.no_completed_campaigns;
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
    edit_mutation() {
      this.editdetails;
      this.componentcheck = 1;
      this.producteditdetails = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.get_product();

      this.producteditdetails = false;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>

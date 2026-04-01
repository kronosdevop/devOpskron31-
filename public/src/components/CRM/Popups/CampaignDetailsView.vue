<template>
  <div>
    <v-card flat :height="height" class="ml-5 mt-2">
      <v-card-text class="">
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
                      Info
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Name</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + campaignName }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Description</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + campaignDescription }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Start Date</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + startDate }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">End Date</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + endDate }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Status</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + campaignStatus }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">#Users</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + campaignUsers }}</b>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="justify-end mr-5">
                <v-btn
                  depressed
                  @click="edit_action()"
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
  </div>
</template>
<script>
/* eslint-disable */
// import { get_campaign_details } from "@/graphql/queries.js";
// import { API, graphqlOperation } from "aws-amplify";

export default {
  data() {
    return {
      height: 0,
      campaignStatus: "",
      campaignUsers: "",
      endDate: "",
      startDate: "",
      campaignDescription: "",
      campaignName: "",
    };
  },
  created() {
    this.height = window.innerHeight - 310;
    this.get_campaign_details();
    // this.fetch_details();
  },
  methods: {
    fetch_details() {
      this.campaignStatus = this.$store.getters.Getproductitems.campaign_id;
      this.campaignUsers = this.$store.getters.Getproductitems.campaign_id;
      this.endDate = this.$store.getters.Getproductitems.campaign_id;
      this.startDate = this.$store.getters.Getproductitems.campaign_id;
      this.campaignDescription =
        this.$store.getters.Getproductitems.campaign_id;
      this.campaignName = this.$store.getters.Getproductitems.campaign_id;
    },
    edit_action() {
      this.componentCheck = 2;
    },
    async get_campaign_details() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_campaign_details, {
            input: {
              product_id: this.$store.getters.Getproductitems.product_id,
            },
          })
        );
        this.tableLoading = false;

        var response = result.data.get_campaign_details.items[0];
        var admin = JSON.parse(
          result.data.get_campaign_details.items[0].admin_details
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
  },
};
</script>
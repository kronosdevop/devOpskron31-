<template>
  <div>
    <v-card flat>
      <v-toolbar dense flat>
        <v-spacer />
        <v-btn
          dark
          @click="campaign_creation()"
          class="text-capitalize cardCss mt-n3"
          >Create</v-btn
        >
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="elevation-1 dtwidth mt-n2"
          @click:row="handle_row_click"
        >
          <template v-slot:[`item.service_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-if="item.campaign_description" v-on="on">
                  {{
                    item.campaign_description.length >= 50
                      ? item.campaign_description.substr(0, 50) + "..."
                      : item.campaign_description
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.campaign_description }}
              </div>
            </v-tooltip>
          </template>

          <template v-slot:[`item.Actions`]="{ item }">
            <!-- <v-icon small @click="edit_campaign(item)">mdi-pencil</v-icon> -->
            <v-icon
              small
              class=""
              color="red"
              @click.stop="delete_campaign(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CampaignCreation
        :campaignDialog="campaignDialog"
        @clicked="campaignDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <CampaignDelete
        :deleteDialog="deleteDialog"
        :rowInfo="rowInfo"
        @clicked="deleteDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
// import { list_campaigns_details } from "@/graphql/queries.js";
// import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import CampaignCreation from "@/components/CRM/Popups/CampaignCreation.vue";
import CampaignDelete from "@/components/CRM/Popups/CampaignDelete.vue";

export default {
  components: {
    CampaignCreation,
    SnackBar,
    CampaignDelete,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      tableData: [],
      SnackBarComponent: {},
      tableLoading: false,
      campaignDialog: false,
      componentCheck: 0,
      campaignItems: {},
      headers: [
        {
          text: "Product/Service",
          value: "product_name",
          sortable: false,
        },
        {
          text: "Campaign Name",
          value: "campaign_name",
          sortable: false,
        },
        {
          text: "Campaign Description",
          value: "campaign_description",
          sortable: false,
        },
        {
          text: "Start Date",
          value: "start_date",
          sortable: false,
        },
        {
          text: "End Date",
          value: "end_date",
          sortable: false,
        },
        {
          text: "Status",
          value: "campaign_progress_status",
          sortable: false,
        },
        {
          text: "Created By",
          value: "campaign_created_by",
          sortable: false,
        },
        {
          text: "# Users",
          value: "no_of_users",
          sortable: false,
        },

        {
          text: "Action",
          value: "Actions",
          sortable: false,
        },
      ],
      deleteDialog: false,
      rowInfo: {},
    };
  },
  created() {
    this.height = window.innerHeight - 310;
    this.get_all_campaigns();
  },
  methods: {
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.campaignDialog = false;
      this.deleteDialog = false;
      this.get_all_campaigns();
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

    handle_row_click(item) {
      this.campaignItems = item;
      this.$store.commit("Setproductitems", this.campaignItems);
      this.$router.push("/CampainsDetails");
    },

    edit_campaign() {},
    delete_campaign(val) {
      this.deleteDialog = true;
      this.rowInfo = val;
      this.componentCheck = 2;
    },
    fetch_value(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;

      return dateValue;
    },

    campaign_creation() {
      this.componentCheck = 1;
      this.campaignDialog = true;
    },

    async get_all_campaigns() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_campaigns_details, {
            input: {
              organization_id: data.organization.organization_id,
              campaign_progress_status: "ALL",
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;

        var response = result.data.list_campaigns_details;
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
        // console.log(error);
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

<style>
</style>
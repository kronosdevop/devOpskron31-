<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar flat>
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="campaignInfo">
            Campaign Details
          </v-btn>
          <v-btn small class="black--text" text value="agents"> Agents </v-btn>
        </v-btn-toggle>
      </v-row>

      <v-spacer />
      <v-btn
        dark
        v-if="toggle_exclusive == 'agents'"
        @click="assign_agents()"
        class="text-capitalize cardCss"
        >Assign</v-btn
      >
      <v-btn depressed @click="back_action()" dark class="cardCss ml-2"
        ><v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <v-card
      v-if="toggle_exclusive == 'agents'"
      flat
      :height="height"
      class="ml-5"
    >
      <v-card-text v-if="toggle_exclusive == 'agents'">
        <v-data-table
          :headers="headers"
          :height="height"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :options.sync="pagination"
          dense
          class="elevation-1 dtwidth"
        />
      </v-card-text>
    </v-card>
    <div v-if="toggle_exclusive == 'campaignInfo'">
      <CampaignDetailsView />
    </div>
    <div v-if="componentCheck == 1">
      <AssignAgent
        :addAgentDialog="addAgentDialog"
        @clicked="addAgentDialog = false"
        v-on:errorMsg="error_info"
        v-on:succesMsg="success_info"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AssignAgent from "@/components/CRM/Popups/AssignAgent.vue";
import CampaignDetailsView from "@/components/CRM/Popups/CampaignDetailsView.vue";

import SnackBar from "@/components/SnackBar.vue";
// import { list_campaigns_users } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {},
  components: {
    AssignAgent,
    SnackBar,
    CampaignDetailsView,
  },

  data() {
    return {
      height: 0,
      tableData: [],
      headers: [
        {
          text: "Name",
          value: "sales_person_name",
          sortable: false,
        },
        {
          text: "Email",
          value: "sales_email_id",
          sortable: false,
        },
      ],
      tableLoading: false,
      pagination: {
        pageStart: 1,
        page: 1,
        rowsPerPage: 20,
        itemsPerPage: 20,
      },
      fixed: false,
      toggle_exclusive: "campaignInfo",
      componentCheck: 0,
      addAgentDialog: false,
      SnackBarComponent: {},
    };
  },
  watch: {
    toggle_exclusive() {
      if (this.toggle_exclusive == "agents") {
        this.fetch_agents_list();
      }
    },
    // nextToken() {
    //   this.updatePagination();
    // },
  },
  created() {
    this.height = window.innerHeight - 250;
  },
  methods: {
    back_action() {
      this.$store.commit("Setproductitems", {});
      this.$router.push({
        name: "CrmAdmins",
        params: {
          formMethod: "campaigns",
        },
      });
    },
    async fetch_agents_list() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_campaigns_users, {
            input: {
              organization_id: data.organization.organization_id,
              campaign_id: this.$store.getters.Getproductitems.campaign_id,
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;

        var response = result.data.list_campaigns_users;

        this.tableData = response.items;
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
    assign_agents() {
      this.componentCheck = 1;
      this.addAgentDialog = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addAgentDialog = false;

      this.fetch_agents_list();
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
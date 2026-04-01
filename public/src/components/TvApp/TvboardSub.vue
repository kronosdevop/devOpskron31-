<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-toolbar class="mt-4" dense>
          <v-tabs v-model="currentTab">
            <v-tab v-for="(tab, index) in visibleTabs" :key="index">
              <i>{{ tab.name }}</i>
            </v-tab>
          </v-tabs>
          <v-spacer />
          <div class="mr-4">
            <v-toolbar-title class="font-weight-regular">
              {{ $store.getters.GetTvdetails.tv_board_name }}
            </v-toolbar-title>
          </div>

          <v-btn
            v-show="visibleTabs[currentTab]?.component === 'TvboardPublish'"
            dark
            class="text-capitalize cardCss mr-2"
            :loading="loading"
            @click="publish_call()"
            v-if="$store.getters.GetPublishMessage.length != 0"
          >
            Publish
          </v-btn>

          <v-btn
            v-show="
              visibleTabs[currentTab]?.component === 'LastMessage' &&
              $store.getters.GetTvdetails.tv_board_publish_type ==
                'PRESENTATION'
            "
            dark
            class="text-capitalize cardCss mr-2"
            :loading="loading"
            @click="upload_call()"
            v-if="$store.getters.GetPublishMessage.length != 0"
          >
            Upload
          </v-btn>
          <v-btn dark class="text-capitalize cardCss" @click="back_call()">
            <v-icon class="mr-2">mdi-step-backward</v-icon>
            Back
          </v-btn>
        </v-toolbar>

        <component :is="currentComponent" />
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- SnackBar component -->
  </div>
</template>
  <script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import TvboardPublish from "@/components/TvApp/TvboardPublish.vue";
import TvboardApi from "@/components/TvApp/TvboardApi.vue";
import LastMessage from "@/components/TvApp/LastMessage.vue";
import TvboardFeed from "@/components/TvApp/Popups/TvboardFeed.vue";
var axios = require("axios");
export default {
  components: {
    TvboardPublish,
    TvboardApi,
    LastMessage,
    TvboardFeed,
    SnackBar,
  },
  data() {
    return {
      currentTab: 0,
      loading: false,
      SnackBarComponent: {},
    };
  },
  mounted() {

  },

  computed: {
    visibleTabs() {
      return [
        {
          name: "Publish Message",
          component: "TvboardPublish",
          condition:
            this.$store.getters.GetTvdetails.tv_board_publish_type ==
              "TV_SIGNAGE" &&
            this.$store.getters.GetTvdetails.tv_board_type ==
              "custom_tv_board" &&
            this.$store.getters.GetTvdetails.tv_board_created_by ==
              this.$store.getters.GetUserObj.user.user_email_id,
        },
        {
          name: "Publishs Message",
          component: "TvboardFeed",
          condition:
            this.$store.getters.GetTvdetails.tv_board_publish_type == "FEED" &&
            this.$store.getters.GetTvdetails.tv_board_type ==
              "custom_tv_board" &&
            this.$store.getters.GetTvdetails.tv_board_created_by ==
              this.$store.getters.GetUserObj.user.user_email_id,
        },
        {
          name: "Last Sent Message",
          component: "LastMessage",
          condition: true,
        },

        {
          name: "Api",
          component: "TvboardApi",
          condition:
            this.$store.getters.GetTvdetails.tv_board_publish_type == "FEED" &&
            this.$store.getters.GetTvdetails.tv_board_type ==
              "custom_tv_board" &&
            this.$store.getters.GetTvdetails.tv_board_created_by ==
              this.$store.getters.GetUserObj.user.user_email_id,
        },
      ].filter((tab) => tab.condition);
    },
    currentComponent() {
      return this.visibleTabs[this.currentTab]?.component || "div";
    },
  },
  watch: {
    visibleTabs() {
      if (this.currentTab >= this.visibleTabs.length) {
        this.currentTab = 0;
      }
    },
  },
  methods: {
    upload_call() {
      // console.log("PPT");
    },
    back_call() {
      this.$router.push("TvboardType");
    },
    publish_call() {
      this.loading = true;

      axios({
        method: "post",
        maxBodyLength: Infinity,
        url: this.$store.getters.GetOrgDetails.organization.invoke_url,
        headers: {
          "x-api-key":
            this.$store.getters.GetOrgDetails.organization["x-api-key"],
          "Content-Type": "application/json",
        },
        data: {
          tv_board_api_key: this.$store.getters.GetTvdetails.tv_board_api_key,

          section_data: this.$store.getters.GetPublishMessage,

          team_api_key:
            this.$store.getters.GetOrgDetails.organization.team_api_key,
          content_type: "JSON",
          command: "tvboardMessagePublish",
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;

            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: res.data.Message,
              timeout: 5000,
              Top: true,
            };
          } else {
            this.loading = false;

            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: res.data.Message,
              timeout: 5000,
              Top: true,
            };
          }
        })
        .catch((err) => {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: err.errors[0].message,
            timeout: 5000,
            Top: true,
          };
        });
    },
  },
};
</script>
  
  
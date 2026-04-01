<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <v-card
      v-if="componentCheck != 2"
      flat
      
    >
      <v-card-text class="mt-n4" v-if="dataLoading == true">
        <v-row no-gutters>
          <v-col
            v-for="(card, index) in tableData"
            :key="index"
            cols="12"
            sm="4"
            md="4"
          >
            <v-card class="mt-2" max-width="400">
              <v-img
                class="white--text align-end"
                height="200px"
                :src="card.imageSrc"
              >
              </v-img>

              <v-card-text class="text--primary">
                <div class="text-left">
                  <b>{{ card.resource_name }}</b>
                </div>

                <div class="text-left">
                  Slot Timings
                  {{ ":" + " " + card.resource_open_time }}
                </div>
              </v-card-text>

              <v-card-actions class="mt-n2">
                <v-btn color="#DB4C77" @click="get_edit_info(card)" text>
                  Edit
                </v-btn>

                <v-btn
                  color="red"
                  @click="activate_deactivate(card)"
                  :class="{
                    'green--text': card.resource_status == 'ACTIVE',
                    'red--text': !card.resource_status == 'ACTIVE',
                  }"
                  text
                >
                  {{ card.resource_status }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text v-else class="d-flex justify-center align-center">
        <div class="font-weight-bold">No Resources Avaliable</div>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <CreateResources
        :resourceCreation="resourceCreation"
        @clicked="resourceCreation = false"
        v-on:errorMsg="error_info"
        v-on:SuccessMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditResource :rowData="rowData" v-on:backAction="edit_back_action" />
    </div>
    <div v-if="componentCheck == 3">
      <ActiveActions
        :rowData="rowData"
        :activeDeactiveDialog="activeDeactiveDialog"
        @clicked="activeDeactiveDialog = false"
        v-on:errorMsg="error_info"
        v-on:SuccessMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import CreateResources from "@/components/SloatBooking/Popups/CreateResources.vue";
import EditResource from "@/components/SloatBooking/Popups/EditResource.vue";
import ActiveActions from "@/components/SloatBooking/Popups/ActiveActions.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_booking_resource } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
var axios = require("axios");
var AWS = require("aws-sdk");
import { Auth } from "aws-amplify";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export default {
  components: {
    CreateResources,
    SnackBar,
    OverlayComp,
    EditResource,
    ActiveActions,
  },
  data() {
    return {
      headers: [
        { text: "Name", value: "resource_name", sortable: false },
        {
          text: "Created By",
          value: "resource_created_by",
          sortable: false,
        },
        {
          text: "Slot Availability",
          value: "resource_slot_availabity",
          sortable: false,
        },
        {
          text: "Created On",
          value: "resource_created_on",
          sortable: false,
        },
      ],
      tableData: [],
      fixed: true,
      tableLoading: false,
      componentCheck: 0,
      resourceCreation: false,
      SnackBarComponent: {},
      overlay: false,
      rowData: {},
      activeDeactiveDialog: false,
      privatePublicSongs: [],
      dataLoading: false,
    };
  },
  created() {
    this.overlay = true;
    this.get_resource_details();
  },
  methods: {
    back_call() {
      this.$router.push("/AdminLevelApps");
    },

    edit_back_action() {
      this.componentCheck = 0;
      this.get_resource_details();
    },

    get_edit_info(value) {
      this.componentCheck = 2;
      this.rowData = value;
    },

    resource_Creation() {
      this.componentCheck = 1;
      this.resourceCreation = true;
    },

    activate_deactivate(value) {
      this.componentCheck = 3;

      this.rowData = value;
      this.activeDeactiveDialog = true;
    },

    async get_resource_details() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_booking_resource, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_booking_resource);
        this.tableData = [];
        var data = [];
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;

          for (const item of this.tableData) {
            try {
              const result = await this.check_private_public_urls(
                item.resource_images[0]
              );
              item.checkPrivatePublic = result;

              // const signedUrl = await this.fetch_presigned(item.resource_images[0]);
              //   item.imageSrc = signedUrl;
              if (result === "private") {
                const signedUrl = await this.fetch_presigned(
                  item.resource_images[0]
                );
                item.imageSrc = signedUrl;
              } else {
                item.imageSrc = item.resource_images[0];
              }
            } catch (error) {
              item.checkPrivatePublic = "error";
              item.imageSrc = ""; // or a fallback image
            }
          }
          this.dataLoading = true;
          this.overlay = false;
        } else {
          this.overlay = false;
          this.dataLoading = false;
          this.tableLoading = false;
        }
        this.overlay = false;
      } catch (error) {
        this.tableLoading = false;
        this.overlay = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    getImageSource(card) {
      if (card.checkPrivatePublic === "private") {
        return this.fetch_presigned(card.resource_images[0]);
      } else {
        return card.resource_images[0];
      }
    },

    async check_private_public_urls(url) {
      var dataCheck = "";
      try {
        const response = await axios.head(url);

        if (response.status === 200) {
          dataCheck = "public";
        } else {
          dataCheck = "private";
        }
      } catch (error) {
        dataCheck = "private";
      }
      return dataCheck;
    },

    async fetch_presigned(url1) {
      const rawUrl = url1;
      const details = this.$store.getters.GetOrgDetails;
      // const s3_details =
      if (!rawUrl || !details || !details.s3_details) {
        // console.warn("Missing required data for signed URL");
        return;
      }
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
      if (signedUrl) {
        return signedUrl;
      }
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.resourceCreation = false;
      this.activeDeactiveDialog = false;
      this.dataLoading = false;
      this.overlay = true;
      await this.get_resource_details();
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },
  },
};
</script>

<style>
</style>
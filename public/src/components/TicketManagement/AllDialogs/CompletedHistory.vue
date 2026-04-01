<template>
  <!-- eslint-disable -->

  <v-dialog :model-value="ticketAccept" @update:model-value="$emit('update:ticketAccept', $event)" persistent :max-width="dialogWidth" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
            Ticket History for {{ rowInfo.product_name }}
          </div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4 text-left">
        <v-row>
          <v-col class="text-left" :cols="colsWidth">
            <div class="mt-n2"><h4>Ticket Details</h4></div>
            <v-divider class="mb-1 mt-1" />

            <div class="mt- 2 text-left">
              <b>Ticket ID : </b>{{ rowInfo.ticket_no_id }}
            </div>
            <div class="mt-1"><b>Product : </b>{{ rowInfo.product_name }}</div>
            <div class="mt-1">
              <b>Category : </b>{{ rowInfo.categorie_name }}
            </div>
            <div class="mt-1">
              <b>Preferred Timings : </b
              >{{ fetch_value(rowInfo.preferred_timings) }}
            </div>

            <div class="mt-1">
              <b>Is Priority : </b
              >{{ rowInfo.is_urgent == true ? "Yes" : "No" }}
            </div>

            <div class="mt-1">
              <b>Ticket Status : </b>
              <span :style="getStatusColorStyle">
                {{ rowInfo.ticket_status }}
              </span>
            </div>

            <div class="mt-1">
              <b>Ticket Description : </b>{{ rowInfo.ticket_description }}
            </div>

            <div class="mt-1">
              <b>Admin Comments : </b
              >{{
                rowInfo.ticket_admin_comments == "-"
                  ? "N/A"
                  : rowInfo.ticket_admin_comments
              }}
            </div>

            <div class="mt-5"><h4>Customer Details</h4></div>
            <v-divider class="mb-1 mt-1" />
            <div class="mt-1"><b>Name : </b>{{ rowInfo.user_name }}</div>
            <div class="mt-1">
              <b>Contact Number : </b>{{ rowInfo.customer_contact_number }}
            </div>
            <div class="mt-1">
              <b>Email Id : </b>{{ rowInfo.customer_email_id }}
            </div>
            <div class="mt-1">
              <b>Ticket Raised On : </b
              >{{ fetch_value(rowInfo.ticket_raised_on) }}
            </div>
            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-5">
              <h4>Technician History</h4>
            </div>
            <v-divider class="mb-1 mt-1" />
            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-1">
              <b>Start Time : </b>{{ fetch_value(rowInfo.start_time) }}
            </div>
            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-1">
              <b>End Time : </b>{{ fetch_value(rowInfo.end_time) }}
            </div>
            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-1">
              <b>Total Duration : </b>{{ rowInfo.worked_duration }}
            </div>
            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-1">
              <b>Comments : </b> {{ rowInfo.user_comments }}
            </div>
          </v-col>
          <v-col class="text-left" cols="6">
            <div
              v-if="ticketType == 'assigned' && rowInfo.ticket_status == 'LIVE'"
              class="mt-n2"
            >
              <h4>Start Time : {{ get_time(rowInfo.start_time) }}</h4>
            </div>
            <div v-if="rowInfo.media_keys.length != 0" class="mt-n2">
              <h4>Customer Attachments</h4>
            </div>

            <v-carousel
              v-if="rowInfo.media_keys.length != 0"
              class="mt-1"
              height="180px"
              hide-delimiters
            >
              <v-carousel-item
                v-for="(item, i) in privatePublicSongs"
                :key="i"
                :src="item"
              ></v-carousel-item>
            </v-carousel>

            <div
              v-if="
                rowInfo.technician_media_keys != undefined &&
                rowInfo.technician_media_keys.length != 0
              "
              class="mt-2"
            >
              <h4>Technician Attachments</h4>
            </div>
            <v-carousel
              v-if="
                rowInfo.technician_media_keys != undefined &&
                rowInfo.technician_media_keys.length != 0
              "
              class="mt-1"
              height="180px"
              hide-delimiters
            >
              <v-carousel-item
                v-for="(item, i) in signimagesarrayurls"
                :key="i"
                :src="item"
              ></v-carousel-item>
            </v-carousel>
            <!-- </v-card> -->
          </v-col>
        </v-row>
        <!-- Name <br />
        Description -->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
        
  <script>
/* eslint-disable */
import { claim_start_ticket, close_ticket } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
export default {
  props: {
    rowInfo: Object,
    ticketAccept: Boolean,
    ticketType: String,
  },

  data() {
    return {
      loading: false,
      heightchat: 0,
      otp: "",
      SnackBarComponent: {},
      endComments: "",
      endDocsFile: [],
      urls: [],
      signimagesarrayurls: [],
      regularS3URLsnew: [],
      arrayurls: [],
      height: 0,
      loading1: false,
      privatePublicSongs: [],
    };
  },

  computed: {
    getStatusColorStyle() {
      if (this.rowInfo.ticket_status === "LIVE") {
        return { color: "#4CAF50" };
      } else if (this.rowInfo.ticket_status === "INPROGRESS") {
        return { color: "#FF9800" };
      } else if (this.rowInfo.ticket_status === "COMPLETED") {
        return { color: "#009688" };
      } else {
        return { color: "" };
      }
    },
    dialogWidth() {
      return this.rowInfo.media_keys.length == 0 ? "600px" : "900px";
    },
    colsWidth() {
      return this.rowInfo.media_keys.length == 0 ? "12" : "6";
    },
  },

  watch: {
    ticketAccept: {
      async handler() {
        if (this.ticketAccept == true) {
          this.heightchat = window.innerHeight - 180;
          this.height = window.innerHeight - 350;
          // console.log(this.rowInfo);
          this.signimagesarrayurls = [];
          this.regularS3URLsnew = [];
          if (
            this.rowInfo.media_keys != undefined &&
            this.rowInfo.media_keys.length != 0
          ) {
            await this.check_private_public_urls();
          }
          if (
            this.rowInfo.technician_media_keys != undefined &&
            this.rowInfo.technician_media_keys.length != 0
          ) {
            this.fetch_url(this.rowInfo.technician_media_keys);
          }
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async check_private_public_urls() {
      this.privatePublicSongs = [];
      for (const url of this.rowInfo.media_keys) {
        try {
          const response = await axios.head(url);
          // Use HEAD request to check access without downloading the entire object
          if (response.status === 200) {
            this.privatePublicSongs.push(url); // Add accessible URLs to the checkedURLs array
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            this.fetch_presigned(url);
          } else {
            // console.error(`Error checking S3 URL ${url}: ${error.message}`);
          }
        }
      }
    },

    fetch_presigned(url) {
      var self = this;
      var response = self.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });

      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "tickets/" + url.split("tickets/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      this.privatePublicSongs.push(url);
    },

    get_time(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;
      var time = new Date(val);
      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
      return concatDateTime;
    },

    fetch_url(response) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
        signatureVersion: "v4",
      });
      this.signimagesarrayurls = [];
      response.forEach((preSignedUrl) => {
        var params = {
          Bucket: deatils.s3_details.bucket_name,
          Key: "tickets/" + preSignedUrl.split("tickets/")[1],
          Expires: 60000 * 5,
        };

        var url = s3Bucket.getSignedUrl("getObject", params);
        self.signimagesarrayurls.push(url); // Push the normal URL into the array
      });
    },

    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;

      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
      return concatDateTime;
    },
  },
};
</script>
        
<style scoped>
.no-icon-file-input .v-input__icon {
  display: none; /* Hide the icon */
}
</style>
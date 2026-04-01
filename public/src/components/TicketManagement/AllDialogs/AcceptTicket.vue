<template>
  <!-- eslint-disable -->
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="ticketAccept" @update:model-value="$emit('update:ticketAccept', $event)" persistent max-width="900" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            {{
            rowInfo.ticket_status == "LIVE"
              ? "Close Ticket for " + rowInfo.product_name
              : "Start Ticket for " + rowInfo.product_name
          }}
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4 text-left">
          <v-row>
            <v-col class="text-left" cols="6">
              <div class="mt-n2"><h4>Ticket Details</h4></div>
              <v-divider class="mb-1 mt-1" />

              <div class="mt- 2 text-left">
                <b>Ticket ID : </b>{{ rowInfo.ticket_no_id }}
              </div>
              <div class="mt-1">
                <b>Product : </b>{{ rowInfo.product_name }}
              </div>
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
              <div class="mt-1">
                <b>Ticket Assigned On : </b
                >{{ fetch_value(rowInfo.ticket_assigned_on) }}
              </div>
              <div class="mt-1">
                <b>Ticket Assigned Slot : </b
                >{{
                  fetch_time(rowInfo.slot_start_time) +
                  "-" +
                  fetch_time(rowInfo.slot_end_time) +
                  ", " +
                  fetch_date(rowInfo.slot_start_time)
                }}
              </div>
            </v-col>
            <v-col class="text-left" cols="6">
              <v-form ref="form">
                <div
                  v-if="
                    rowInfo.media_keys.length != 0 &&
                    (rowInfo.ticket_status == 'INPROGRESS' ||
                      rowInfo.ticket_status == 'COMPLETED')
                  "
                  class="mt-n2"
                >
                  <h4>Attachments</h4>
                </div>
                <div
                  v-if="
                    ticketType == 'assigned' && rowInfo.ticket_status == 'LIVE'
                  "
                  class="mt-n2"
                >
                  <h4>Start Time : {{ get_time(rowInfo.start_time) }}</h4>
                </div>
                <div
                  v-if="
                    ticketType == 'assigned' && rowInfo.ticket_status == 'LIVE'
                  "
                  class="mt-n2"
                >
                  <v-radio-group
                    @change="clear_radio_data()"
                    v-model="chooseAction"
                    row
                  >
                    <v-radio label="Pause Work" value="PauseAction"></v-radio>
                    <v-radio label="End Work" value="endAction"></v-radio>
                  </v-radio-group>
                </div>
                <v-carousel
                  v-if="
                    rowInfo.media_keys.length != 0 &&
                    (rowInfo.ticket_status == 'INPROGRESS' ||
                      rowInfo.ticket_status == 'COMPLETED')
                  "
                  class="mt-2"
                  height="250px"
                  hide-delimiters
                >
                  <v-carousel-item
                    v-for="(item, i) in privatePublicSongs"
                    :key="i"
                    :src="item"
                  ></v-carousel-item>
                </v-carousel>
                <v-row no-gutters>
                  <v-col cols="4">
                    <div
                      v-if="
                        chooseAction == 'endAction' &&
                        ticketType == 'assigned' &&
                        rowInfo.ticket_status == 'LIVE' &&
                        ticketsAcccepted == 'TRUE' &&
                        endWork == false
                      "
                    >
                      <v-btn
                        class="cardCss mt-1 ml-n1 text-capitalize"
                        dark
                        :loading="loading"
                        @click="end_mutation('END_GENERATE_OTP')"
                      >
                        Generate OTP
                      </v-btn>
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <div
                      v-if="
                        ticketType == 'assigned' &&
                        rowInfo.ticket_status == 'LIVE' &&
                        ticketsAcccepted == 'TRUE' &&
                        endWork == true
                      "
                      class="mt-2"
                    >
                      <h4 class="mt-2">
                        Enter OTP/Code
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-icon
                              class=""
                              color="primary"
                              dark
                              v-bind="attrs"
                              v-on="on"
                            >
                              mdi-information
                            </v-icon>
                          </template>
                          <span>
                            OTP/Code sent to the customer please enter to
                            continue</span
                          >
                        </v-tooltip>
                      </h4>
                    </div>
                  </v-col>
                </v-row>

                <div
                  v-if="
                    ticketType == 'assigned' &&
                    rowInfo.ticket_status == 'LIVE' &&
                    ticketsAcccepted == 'TRUE' &&
                    endWork == true
                  "
                  class="mt-2"
                >
                  <v-otp-input
                    :rules="[(v) => !!v || 'Required']"
                    v-model="otp"
                    length="6"
                  ></v-otp-input>
                </div>
                <div
                  v-if="
                    ticketType == 'assigned' &&
                    rowInfo.ticket_status == 'LIVE' &&
                    endWork == true
                  "
                  class="mt-2"
                >
                  <v-textarea
                    dense
                    outlined
                    label="Comments"
                    :rules="[(v) => !!v || 'Required']"
                    rows="0"
                    v-model="endComments"
                  />
                  <v-file-input
                    small-chips
                    outlined
                    dense
                    label="Upload Documents"
                    class="no-icon-file-input"
                    accept="image/*,application/pdf"
                    v-model="endDocsFile"
                    @change="upload_S3(endDocsFile)"
                  ></v-file-input>
                  <v-card flat class="overflow-auto overflow-x-hidden">
                    <v-row>
                      <v-col
                        cols="4"
                        v-for="(
                          signimagesarrayurls, index
                        ) in signimagesarrayurls"
                        :key="index"
                      >
                        <v-card class="mt-5">
                          <v-img
                            max-height="80"
                            contain
                            :src="signimagesarrayurls"
                            v-if="signimagesarrayurls.length > 1"
                          >
                          </v-img>
                          <div
                            class="d-flex align-centers justify-centers h-100"
                            v-if="signimagesarrayurls.length == 0"
                          >
                            No Image
                          </div>
                          <v-btn
                            icon
                            @click="delete_item(signimagesarrayurls, index)"
                          >
                            <v-icon color="red">mdi-delete</v-icon>
                          </v-btn>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>
                <div v-if="chooseAction == 'PauseAction'">
                  <v-textarea
                    dense
                    outlined
                    label="Reason For Pause "
                    :rules="[(v) => !!v || 'Required']"
                    rows="0"
                    v-model="pauseComments"
                  />
                </div>
              </v-form>
            </v-col>
          </v-row>
          <!-- Name <br />
        Description -->
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            v-if="ticketsAcccepted == 'FALSE'"
            depressed
            :loading="loading2"
            @click="start_mutation('ACCEPT_TICKET', 'loading2')"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Accept
          </v-btn>
          <v-btn
            v-if="ticketsAcccepted == 'FALSE'"
            depressed
            :loading="loading3"
            @click="reject_ticket('REJECT_TICKET', 'loading3')"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Cancel
          </v-btn>
          <v-btn
            v-if="
              rowInfo.ticket_status == 'INPROGRESS' &&
              ticketsAcccepted == 'TRUE'
            "
            depressed
            :loading="loading"
            @click="accept_start_work()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Start Work
          </v-btn>
          <v-btn
            v-if="
              ticketType == 'assigned' &&
              rowInfo.ticket_status == 'LIVE' &&
              endWork == true
            "
            depressed
            :loading="loading1"
            @click="end_validation()"
            dark
            class="cardCss ml-13 text-capitalize"
          >
            End Work
          </v-btn>
          <v-btn
            v-if="chooseAction == 'PauseAction'"
            depressed
            :loading="pauseBtn"
            @click="pause_validation()"
            dark
            class="cardCss ml-13 text-capitalize"
          >
            Pause Work
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <StartWork
        :rowInfo="rowInfo"
        :accpetStartWork="accpetStartWork"
        @clicked="accpetStartWork = false"
        v-on:successMsg="success_msg"
        v-on:startWork="started_work"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 2">
      <CancelTicket
        :rowInfo="rowInfo"
        :cancelTicketDialog="cancelTicketDialog"
        @clicked="cancelTicketDialog = false"
        v-on:successMsg="success_msg"
        v-on:startWork="started_work"
        v-on:errorMsg="error_msg"
      />
    </div>
  </div>
</template>
        
  <script>
/* eslint-disable */
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { claim_start_ticket, close_ticket } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import StartWork from "@/components/TicketManagement/AllDialogs/StartWork.vue";
import CancelTicket from "@/components/TicketManagement/AllDialogs/CancelTicket.vue";
import SnackBar from "@/components/SnackBar.vue";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
var axios = require("axios");

export default {
  props: {
    rowInfo: Object,
    ticketAccept: Boolean,
    ticketType: String,
  },
  components: {
    StartWork,
    SnackBar,
    CancelTicket,
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
      targetTime: new Date("2023-10-26T12:06:00").getTime(),
      privatePublicSongs: [],
      comments: "",
      ticketsAcccepted: null,
      loading3: false,
      loading2: false,
      componentCheck: 0,
      accpetStartWork: false,
      endWork: false,
      rejectComments: "",
      cancelTicketDialog: false,
      chooseAction: null,
      pauseComments: "",
      pauseBtn: false,
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
  },

  watch: {
    ticketAccept: {
      async handler() {
        if (this.ticketAccept == true) {
          this.chooseAction = null;
          this.ticketsAcccepted = null;
          this.heightchat = window.innerHeight - 180;
          this.height = window.innerHeight - 350;
          this.signimagesarrayurls = [];
          this.regularS3URLsnew = [];
          this.ticketsAcccepted = this.rowInfo.ticket_accepted;
          this.endWork = false;
          // console.log(this.rowInfo);
          if (
            this.rowInfo.media_keys != undefined &&
            this.rowInfo.media_keys.length != 0
          ) {
            await this.check_private_public_urls();
          }

          // if (
          //   this.ticketType == "assigned" &&
          //   this.rowInfo.ticket_status == "LIVE"
          // ) {
          //   this.get_time(this.rowInfo.start_time);
          // }
          // console.log(this.rowInfo);
          //  console.log( this.$store.getters.GetUserObj.user.user_email_id);
        }
      },
      immediate: true,
    },
  },

  methods: {
    accept_start_work() {
      this.componentCheck = 1;
      this.accpetStartWork = true;
    },
    reject_ticket() {
      this.componentCheck = 2;
      this.cancelTicketDialog = true;
    },
    clear_radio_data() {
      this.endWork = false;
      // this.$refs.form.reset();
    },
    pause_validation() {
      if (this.$refs.form.validate()) {
        this.pause_action();
      }
    },

    async pause_action() {
      this.pauseBtn = true;
      try {
        let result = await API.graphql(
          graphqlOperation(claim_start_ticket, {
            input: {
              user_id: this.$store.getters.GetUserObj.user.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_id: this.rowInfo.assigned_id,
              action_type: "PAUSED",
              comments: this.pauseComments,
            },
          })
        );

        var response = JSON.parse(result.data.claim_start_ticket);

        if (response.Status == "SUCCESS") {
          this.pauseBtn = false;
          this.$emit("successMsg", response.Message);
          this.pauseComments = "";

          // this.loading3 = false;
          // this.loading = false;
          // if (value == "ACCEPT_TICKET") {
          //   this.ticketsAcccepted = "TRUE";
          // } else if (value == "START") {
          //   this.$emit("successMsg", );
          //   this.selectTeam = "";
          //   this.$refs.form.reset();
          // } else if (value == "END_GENERATE_OTP") {
          //   this.$emit("otpMessage", response.Message);
          //   this.endWork = true;
          // }
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.pauseBtn = false;
      }
    },

    end_mutation(value) {
      this.loading = true;
      this.start_mutation(value);
    },

    success_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    started_work(value) {
      this.accpetStartWork = false;
      this.cancelTicketDialog = false;
      this.$emit("successMsg", value);
    },

    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    close_dialog() {
      this.ticketsAcccepted = null;
      this.$emit("clicked", 0);
      this.endWork = false;
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

    fetch_value(val) {
      return formatedatetime(val);
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();
      // var dateValue =
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year;

      // var timeValue = d.toLocaleString([], {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   hour12: true,
      // });
      // const concatDateTime = dateValue + " " + timeValue;
      // return concatDateTime;
    },

    fetch_time(val) {
      const d = new Date(parseInt(val * 1000));
      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return timeValue;
    },
    fetch_date(val) {
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
      return dateValue;
    },

    async upload_S3(files) {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);

        this.upload_S3_bucket(baseData[0], file);
      });
    },

    async upload_S3_bucket(baseData, file) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;

      var buf = Buffer.from(baseData, "base64");

      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key:
          "tickets" +
          "/" +
          "closeticket" +
          "/" +
          self.rowInfo.ticket_id +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.GetUserObj.user.user_id +
          "/" +
          Date.now() +
          "/" +
          file.name.split(" ").join(""),

        Body: buf,
        ContentType: file.type,
      };

      var bucketurl =
        "https://" +
        bucketName +
        ".s3." +
        deatils.s3_details.region +
        ".amazonaws.com/" +
        params.Key;

      await s3Bucket.putObject(params, function (err, data) {
        if (err) {
          // console.log(err);
          this.loading1 = false;
        } else if (data) {
          bucketurl;
          var deatil = self.$store.getters.GetOrgDetails;
          self.urls = bucketurl;
          self.s3get(deatil);
        }

        self.endDocsFile = [];
      });
    },

    s3get(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "tickets/" + this.urls.split("tickets/")[1],
        Expires: 60000 * 5,
      };

      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.push(url);
      //   return url;
    },

    end_validation() {
      if (this.$refs.form.validate()) {
        if (this.rowInfo.end_otp == this.otp) {
          this.end_action();
          // this.$emit("successMsg", "Successfull");
          // this.otpCheck = 1;
        } else {
          this.$emit("errorMsg", "Invalid Otp");
        }
      }
    },
    async end_action() {
      if (this.signimagesarrayurls.length != 0) {
        this.regularS3URLsnew = this.convertArrayToRegularS3URLs(
          this.signimagesarrayurls
        );
      }

      this.loading1 = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(close_ticket, {
            input: {
              // team_name: this.broadcastName,
              user_id: this.$store.getters.GetUserObj.user.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_id: this.rowInfo.assigned_id,
              ticket_otp: this.otp,
              user_comments: this.endComments,
              media_keys:
                this.regularS3URLsnew.length == 0
                  ? undefined
                  : this.regularS3URLsnew,
            },
          })
        );
        var response = JSON.parse(result.data.close_ticket);
        this.loading1 = false;
        if (response.Status == "SUCCESS") {
          this.signimagesarrayurls = [];
          this.regularS3URLsnew = [];
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading1 = false;
      }
    },

    async delete_item(val, index) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;

      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key: val,
      };

      await s3Bucket.deleteObject(params, function (err, data) {
        if (err) {
        } else if (data) {
          self.signimagesarrayurls.forEach((element) => {
            if (element == val) {
              self.signimagesarrayurls.splice(index, 1);
            }
          });
        }
      });
    },

    async start_mutation(value) {
      if (value == "ACCEPT_TICKET") {
        this.loading2 = true;
      } else if (value == "REJECT_TICKET") {
        this.loading3 = true;
      }

      try {
        let result = await API.graphql(
          graphqlOperation(claim_start_ticket, {
            input: {
              user_id: this.$store.getters.GetUserObj.user.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_id: this.rowInfo.assigned_id,
              action_type: value,
              comments: value == "REJECT_TICKET" ? this.comments : undefined,
            },
          })
        );

        var response = JSON.parse(result.data.claim_start_ticket);

        if (response.Status == "SUCCESS") {
          this.loading2 = false;
          this.loading3 = false;
          this.loading = false;
          if (value == "ACCEPT_TICKET") {
            this.ticketsAcccepted = "TRUE";
          } else if (value == "START") {
            this.$emit("successMsg", response.Message);
            this.selectTeam = "";
            this.$refs.form.reset();
          } else if (value == "END_GENERATE_OTP") {
            this.$emit("otpMessage", response.Message);
            this.endWork = true;
          }
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        loadeValue = false;
      }
    },

    get_action_type() {},
    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }

      return this.arrayurls;
    },

    convertToRegularS3URL(presignedURL) {
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },
  },
};
</script>
        
<style scoped>
.no-icon-file-input .v-input__icon {
  display: none; /* Hide the icon */
}
</style>
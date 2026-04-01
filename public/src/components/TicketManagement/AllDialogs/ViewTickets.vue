<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="ticketView" @update:model-value="$emit('update:ticketView', $event)" persistent :max-width="dialogWidth" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            > <div class="custom-title">
            View Details
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4 text-left">
          <v-row>
            <v-col :cols="colsWidth">
              <div class="mt-n2"><h4>Ticket Details</h4></div>
              <v-divider class="mb-1 mt-1" />
              <div class="font-weight-black mt-1">
                Ticket ID :
                <span class="font-weight-regular"> {{ ticket_no_id }}</span>
              </div>
              <div class="font-weight-black mt-1">
                Product :
                <span class="font-weight-regular">{{ product_name }}</span>
              </div>
              <div class="font-weight-black mt-1">
                Category :<span class="font-weight-regular">
                  {{ categorie_name }}</span
                >
              </div>
              <div class="mt-1">
                <b>Ticket Status : </b>
                <span :style="getStatusColorStyle">
                  {{ ticketDetails.ticket_status }}
                </span>
              </div>

              <div class="mt-1">
                <b>Ticket Raised On : </b>
                {{ get_date(ticketDetails.ticket_raised_on) }}
              </div>
              <div class="mt-1">
                <b>Ticket Description : </b>{{ ticket_description }}
              </div>
              <div class="mt-1">
                <b>Admin Comments : </b
                >{{
                  ticketDetails.admin_comments == "-"
                    ? "N/A"
                    : ticketDetails.admin_comments
                }}
              </div>
              <div class="mt-5"><h4>Technician Details</h4></div>
              <v-divider class="mb-1 mt-1" />
              <div class="font-weight-black mt-1">
                Assigned To :
                <span class="font-weight-regular">
                  {{ ticketDetails.ticket_assigned_user.full_user_name }}
                </span>
              </div>
              <div class="mt-1">
                <b>Ticket Assigned On : </b>
                {{ get_date(ticketDetails.ticket_assigned_on) }}
              </div>
            </v-col>

            <v-col
              cols="6"
              v-if="imagesarrayurls != undefined && imagesarrayurls.length != 0"
            >
              <div class="font-weight-black mt-2">Media</div>

              <v-card max-width="320" class="ml-2" flat>
                <v-carousel
                  v-model="model"
                  height="auto"
                  hide-delimiters
                  :show-arrows="false"
                  v-if="signimagesarrayurls.length == 1"
                >
                  <v-carousel-item
                    v-for="images1 in signimagesarrayurls"
                    :key="images1"
                    :src="images1"
                  >
                  </v-carousel-item>
                </v-carousel>
                <v-carousel
                  v-model="model"
                  hide-delimiters
                  height="auto"
                  v-if="signimagesarrayurls.length > 1"
                >
                  <v-carousel-item
                    v-for="images1 in signimagesarrayurls"
                    :key="images1"
                    :src="images1"
                  >
                  </v-carousel-item>
                </v-carousel>
              </v-card>
            </v-col>
          </v-row>
          <!-- <v-col
              cols="4"
              v-for="(signimagesarrayurls, index) in signimagesarrayurls"
              :key="index"
            >
              <v-card class="mt-5" flat>
                <v-img
                  max-height="100"
                  contain
                  :src="signimagesarrayurls"
                  v-if="signimagesarrayurls.length > 1"
                >
                </v-img>
              </v-card>
            </v-col> -->
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */

export default {
  props: {
    ticketView: Boolean,
    ticketDetails: Object,
  },
  data() {
    return {
      loading: false,
      model: false,
      product_name: "",
      categorie_name: "",
      ticket_no_id: "",
      ticket_description: "",
      ticket_assign_to: "",
      ticket_status: "",
      signimagesarrayurls: [],
      imagesarrayurls: [],
    };
  },
  watch: {
    ticketView: {
      async handler() {
        if (this.ticketView == true) {
          // console.log(this.ticketDetails);
          this.imagesarrayurls = [];
          this.signimagesarrayurls = [];
          this.product_name = this.ticketDetails.product_name;
          this.categorie_name = this.ticketDetails.categorie_name;
          this.ticket_description = this.ticketDetails.ticket_description;
          this.ticket_assign_to = this.ticketDetails.ticket_assign_to;
          this.ticket_no_id = this.ticketDetails.ticket_no_id;
          this.ticket_status = this.ticketDetails.ticket_status;
          var deatils = this.$store.getters.GetOrgDetails;
          this.imagesarrayurls = this.ticketDetails.media_keys;
          if (this.imagesarrayurls.length != 0) {
            await this.s3get2(deatils);
          }
        }
      },
      immediate: true,
    },
  },

  computed: {
    dialogWidth() {
      return this.ticketDetails.media_keys != undefined ? "800px" : "500px";
    },
    colsWidth() {
      return this.ticketDetails.media_keys != undefined ? "6" : "12";
    },
    getStatusColorStyle() {
      if (this.ticketDetails.ticket_status === "ASSIGNED") {
        return { color: "#4CAF50" };
      } else if (this.ticketDetails.ticket_status === "INPROGRESS") {
        return { color: "#FF9800" };
      } else if (this.ticketDetails.ticket_status === "COMPLETED") {
        return { color: "#009688" };
      } else {
        return { color: "" };
      }
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_assign_type(val) {
      var data = "";
      switch (val) {
        case "NOT_ASSIGNED":
          data = "Not Assigned";
          break;
        case "ASSIGNED":
          data = "Assigned";
          break;
        case "PROGRESS":
          data = "Progress";
          break;
        case "HOLD":
          data = "Hold";
          break;
        case "COMEPLETED":
          data = "Completed";
          break;

        default:
          data = "";
          break;
      }
      return data;
    },
    get_date(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    s3get2(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      for (let i = 0; i < this.imagesarrayurls.length; i++) {
        var params = {
          Bucket: response.s3_details.bucket_name,
          Key: "tickets/" + this.imagesarrayurls[i].split("tickets/")[1],
          Expires: 60000 * 5,
        };
        var url = s3Bucket.getSignedUrl("getObject", params);
        this.signimagesarrayurls.push(url);
      }
    },
  },
};
</script>

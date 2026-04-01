<template>
  <div>
    <!-- <CreateTicketDialog
      :DialogCreateTicket="DialogCreateTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateTicketEmit"
    /> -->
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-calendar-clock</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Slots</span>
          <span class="header-subtitle">Book your preferred time slots</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <!-- <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="25"> mdi-camera </v-icon>
            </v-btn>
          </template>
        </v-tooltip> -->
        <!-- Action Buttons -->
        <v-btn
          v-if="toggle_exclusive == 'resources_slot'"
          class="action-btn add-btn"
          @click="resource_Creation()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create</span>
        </v-btn>
        <v-btn
          v-if="toggle_exclusive == 'resources_categories'"
          class="action-btn add-btn"
          @click="add_category()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add</span>
        </v-btn>
        <v-btn
          @click="get_my_history()"
          class="action-btn"
          size="small"
          v-if="toggle_exclusive == 'user_slot'"
        >
          <v-icon>mdi-information</v-icon>
          <span>History</span>
        </v-btn>
        <!-- <v-btn
          v-if="adminAppExists"
          @click="open_settings()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-cog</v-icon>
          <span>Administrator</span>
        </v-btn> -->
      </div>
    </v-app-bar>
    <v-toolbar
      flat
      class="mt-n10"
      style="background-color: white"
      v-if="adminAppExists"
    >
      <template v-slot:extension>
        <v-tabs v-model="toggle_exclusive" mandatory class="modern-tab-toggle">
          <v-tab value="user_slot" class="tab-btn"> Slots </v-tab>
          <v-tab value="resources_slot" class="tab-btn"> Resources </v-tab>
          <v-tab value="resources_categories" class="tab-btn">
            Categories
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <div>
      <v-card flat class="overflow-y-auto" :height="windowHeight">
        <OverlayComp :overlay="overlay" />
        <v-card
          v-if="
            (componentCheck == 0 || componentCheck == 2) &&
            toggle_exclusive == 'user_slot'
          "
          flat
        >
          <v-card-text v-if="dataLoading == true">
            <v-row no-gutters>
              <v-col
                v-for="(card, index) in resourcesInfo"
                :key="index"
                cols="12"
                sm="4"
                md="4"
              >
                <v-card @click="get_data(card)" class="ma-2" max-width="400">
                  <v-img
                    class="white--text align-end"
                    height="200px"
                    :src="card.imageSource"
                  >
                    <!-- <v-card-title>{{ card.resource_name }}</v-card-title> -->
                  </v-img>

                  <v-card-text class="mt-n2 text--primary">
                    <div class="text-left">
                      <b>{{ card.resource_name }}</b>
                    </div>

                    <div class="text-left">
                      Slot Timings
                      {{ card.resource_open_time }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else class="d-flex justify-center align-center">
            <div class="font-weight-bold">No Resources Avaliable</div>
          </v-card-text>
        </v-card>
        <div class="text-left" v-if="toggle_exclusive == 'resources_slot'">
          <ResourcesList :key="resourcestKey" />
        </div>
        <div
          class="text-left"
          v-if="toggle_exclusive == 'resources_categories'"
        >
          <SlotCategories :key="categoryKey" />
        </div>
        <div v-if="componentCheck == 1">
          <SlotBooking :rowInfo="rowInfo" v-on:backACtion="back_to_action" />
        </div>
        <div v-if="componentCheck == 2">
          <BookingHistory
            :historyDialog="historyDialog"
            @clicked="
              () => {
                historyDialog = false;
                componentCheck = 0;
              }
            "
          />
        </div>
        <div v-if="componentCheck == 3">
          <CreateResources
            :resourceCreation="resourceCreation"
            @clicked="
              () => {
                resourceCreation = false;
                componentCheck = 0;
              }
            "
            v-on:errorMsg="error_info"
            v-on:SuccessMsg="success_info"
            v-on:resourcelist="userresource_refresh"
          />
        </div>
        <div v-if="componentCheck == 4">
          <AddCategories
            :categoriesAddition="categoriesAddition"
            @clicked="
              () => {
                categoriesAddition = false;
                componentCheck = 0;
              }
            "
            v-on:errorMsg="error_info"
            v-on:successMsg="success_info"
            v-on:updaterefesh="categoryRefresh"
          />
        </div>
      </v-card>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import SlotCategories from "@/components/SloatBooking/SlotCategories.vue";
import AddCategories from "@/components/SloatBooking/Popups/AddCategories.vue";
import CreateResources from "@/components/SloatBooking/Popups/CreateResources.vue";
import SlotBooking from "@/components/SloatBooking/Popups/SlotBooking.vue";
import BookingHistory from "@/components/SloatBooking/Popups/BookingHistory.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import ResourcesList from "@/components/SloatBooking/ResourcesList.vue";
import SnackBar from "@/components/SnackBar.vue";
// import html2canvas from "html2canvas";
// import CreateTicketDialog from "../Tickets/CreateTicketDialog.vue";
import { list_booking_resource } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
var axios = require("axios");
var AWS = require("aws-sdk");
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  components: {
    SlotBooking,
    OverlayComp,
    BookingHistory,
    ResourcesList,
    SnackBar,
    CreateResources,
    AddCategories,
    SlotCategories,
    // CreateTicketDialog,
  },
  data() {
    return {
      toggle_exclusive: "user_slot",
      componentCheck: 0,
      resourcestKey: 0,
      rowInfo: {},
      resourcesInfo: [],
      overlay: false,
      SnackBarComponent: {},
      historyDialog: false,
      resourceCreation: false,
      dataLoading: false,
      windowHeight: 0,
      categoryKey: 0,
      adminAppExists: false,
      categoriesAddition: false,
      // DialogCreateTicket: false,
      // ScreenshotFile: null,
      // orgDetails: {
      //   bucket_name: "stichh-medias",
      //   region: "us-east-1",
      // },
    };
  },

  async created() {
    this.fetch_admin_apps();
    this.windowHeight = window.innerHeight - 150;
    this.overlay = true;
    await this.fecth_all_resorces();
  },

  methods: {
    // async TakeScreenshot() {
    //   const target = document.body;
    //   const canvas = await html2canvas(target, {
    //     scale: window.devicePixelRatio || 2,
    //     useCORS: true,
    //     logging: false,
    //     windowWidth: document.documentElement.scrollWidth,
    //     windowHeight: document.documentElement.scrollHeight,
    //   });
    //   const dataUrl = canvas.toDataURL("image/png");
    //   const blob = await (await fetch(dataUrl)).blob();
    //   const file = new File([blob], "screenshot.png", { type: "image/png" });
    //   this.ScreenshotFile = file;
    //   this.DialogCreateTicket = true;
    // },
    // DialogCreateTicketEmit() {
    //   this.DialogCreateTicket = false;
    // },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.resourceCreation = false;
      this.categoriesAddition = false;
      this.componentCheck = 0;
    },
    categoryRefresh() {
      this.categoryKey += 1;
    },
    resource_Creation() {
      this.componentCheck = 3;
      this.resourceCreation = true;
    },
    userresource_refresh() {
      this.resourcestKey += 1;
    },
    add_category() {
      this.componentCheck = 4;
      this.categoriesAddition = true;
    },
    open_settings() {
      this.$router.push("/home/SlotSubitems");
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      // Check if userObj and admin_apps exist
      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "BOOKING_SLOT_ADMINS"
      );
      if (adminExists == undefined) {
        this.adminAppExists = false;
        return;
      }
      if (adminExists.is_visible == false) {
        this.adminAppExists = false;
        return;
      }
      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    get_my_history() {
      this.componentCheck = 2;
      this.historyDialog = true;
    },

    get_data(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
    },

    back_to_action() {
      this.componentCheck = 0;
    },

    async fecth_all_resorces() {
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

        var response = JSON.parse(result.data.list_booking_resource);
        this.resourcesInfo = [];

        if (response.Status === "SUCCESS") {
          for (const element of response.data) {
            if (element.resource_status === "ACTIVE") {
              try {
                const urlType = await this.check_private_public_urls(
                  element.resource_images[0]
                );
                let imageUrl = element.resource_images[0];
                if (urlType === "private") {
                  imageUrl = await this.get_image(imageUrl);
                }
                element.imageSource = imageUrl; // ✅ Pre-resolved string
              } catch (error) {
                element.imageSource = ""; // or a placeholder image URL
              }
              this.resourcesInfo.push(element);
            }
          }
          this.dataLoading = true;
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.overlay = false;
      }
    },
    getImageSource(card) {
      if (card.checkPrivatePublic === "private") {
        return this.get_image(card.resource_images[0]);
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

    async get_image(value) {
      const rawUrl = value;
      const details = this.$store.getters.GetOrgDetails;
      // const s3_details =
      if (!rawUrl || !details || !details.s3_details) {
        // console.warn("Missing required data for signed URL");
        return;
      }
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
      if (signedUrl) {
        const url = signedUrl;
        // console.log(url)
        return url;
      }
      // console.log(value);
      // var self = this;
      // var response = self.$store.getters.GetOrgDetails;
      // var s3Bucket = new AWS.S3({
      //   region: response.s3_details.region,
      //   accessKeyId: response.s3_details.access_key,
      //   secretAccessKey: response.s3_details.secret_key,
      //   signatureVersion: "v4",
      // });

      // var params = {
      //   Bucket: response.s3_details.bucket_name,
      //   Key: "resources/" + value.split("resources/")[1],
      //   Expires: 60000 * 5,
      // };
      // var url = s3Bucket.getSignedUrl("getObject", params);

      // return url;
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */
.modern-header-section {
  background: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border-bottom: 1px solid #e0e0e0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}
</style>

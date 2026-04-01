<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="resourceCreation"
      @update:model-value="$emit('update:resourceCreation', $event)"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="text-black">Create Resource</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12" sm="6">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-text-field
                      density="compact"
                      v-model="resourceName"
                      label="Resource Name"
                      :rules="[(v) => !!v || 'required ']"
                      class=""
                      variant="outlined"
                      @input="auto_populate(resourceName)"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      density="compact"
                      v-model="resourceDescription"
                      label="Resource Description"
                      :rules="[(v) => !!v || 'required ']"
                      class=""
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      density="compact"
                      v-model="slots"
                      label="Slot Duration"
                      :items="[
                        { title: '15 Minutes', value: '15_Minutes' },
                        { title: '30 Minutes', value: '30_Minutes' },
                        { title: '1 Hour', value: '1_Hour' },
                        { title: '2 Hours', value: '2_Hour' },
                        { title: '3 Hours', value: '3_Hour' },
                        { title: '4 Hours', value: '4_Hour' },
                        { title: '5 Hours', value: '5_Hour' },
                        { title: '6 Hours', value: '6_Hour' },
                        { title: '1 Day', value: '24_Hour' },
                      ]"
                      class=""
                      :rules="[(v) => !!v || 'required ']"
                      item-text="text"
                      item-value="value"
                      variant="outlined"
                      @input="fetch_minutes(slots)"
                    ></v-select>
                  </v-col>
                </v-row>
                <div v-if="slots != '24_Hour'" class="text-left mt-n3">
                  <b>Slot Availability</b>
                </div>
                <v-row v-if="slots != '24_Hour'" class="mt-1" no-gutters>
                  <v-col cols="6">
                    <v-text-field
                      v-model="formTime"
                      label="From"
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required ']"
                      density="compact"
                      readonly
                      @click="showFromTimePicker = true"
                    ></v-text-field>
                    <v-dialog
                      v-model="showFromTimePicker"
                      persistent
                      max-width="290"
                    >
                      <v-card>
                        <v-time-picker
                          v-model="formTime"
                          format="24hr"
                          color="#DB4C77"
                          full-width
                        ></v-time-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            text
                            color="primaryColor"
                            @click="cancelFromTime"
                            >Cancel</v-btn
                          >
                          <v-btn text color="primaryColor" @click="saveFromTime"
                            >OK</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-col>
                  <!-- $refs.menu1.save(formTime) -->
                  <v-col cols="6">
                    <v-text-field
                      v-model="toTime"
                      label="To"
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required ']"
                      density="compact"
                      class="ml-2"
                      readonly
                      @click="showToTimePicker = true"
                    ></v-text-field>
                    <v-dialog
                      v-model="showToTimePicker"
                      persistent
                      max-width="290"
                    >
                      <v-card>
                        <v-time-picker
                          v-model="toTime"
                          :allowed-hours="allowedHours"
                          format="24hr"
                          color="#DB4C77"
                          full-width
                        ></v-time-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn text color="primaryColor" @click="cancelToTime"
                            >Cancel</v-btn
                          >
                          <v-btn text color="primaryColor" @click="saveToTime"
                            >OK</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-col>
                </v-row>

                <!-- @click:minute="$refs.menu3.save(toTime)" -->
                <div class="text-left mt-n3"><b>Booking Time Ahead</b></div>

                <v-row no-gutters>
                  <v-col cols="12">
                    <!-- <v-row no-gutters>
                      <v-col cols="10"> -->
                    <v-radio-group
                      :rules="[(v) => !!v || 'required ']"
                      class="mt-4"
                      v-model="priorBooking"
                      inline
                      color="blue"
                    >
                      <v-radio
                        label="Immediate"
                        class="mt-n2"
                        value="immediate"
                      ></v-radio>
                      <v-radio
                        v-if="slots != '24_Hour'"
                        @click="get_hourly(24)"
                        class="mt-n2"
                        label="Hourly"
                        value="hours"
                      ></v-radio>
                      <v-radio
                        v-if="slots == '24_Hour'"
                        @click="get_hourly(5)"
                        class="mt-n2"
                        label="Days"
                        value="days"
                      ></v-radio>
                    </v-radio-group>

                    <!-- </v-col>
                    </v-row> -->
                  </v-col>

                  <v-col cols="12">
                    <!-- <v-row no-gutters>
                      <v-col cols="12"> -->
                    <v-select
                      v-if="priorBooking == 'hours'"
                      v-model="hourlyBasics"
                      :items="globalItems"
                      :rules="
                        priorBooking == 'hours'
                          ? [(v) => !!v || 'required ']
                          : []
                      "
                      label="Select Hours"
                      class="ml-n2"
                      density="compact"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col v-if="priorBooking == 'days'" cols="12">
                    <v-select
                      v-model="dayBasics"
                      :rules="
                        priorBooking == 'days'
                          ? [(v) => !!v || 'required ']
                          : []
                      "
                      :items="globalItems"
                      label="Select Days"
                      class="ml-n2"
                      density="compact"
                      variant="outlined"
                    />
                    <!-- </v-col>
                    </v-row> -->
                  </v-col>
                </v-row>
                <!-- <div class="text-left mt-n3"><b>Payment</b></div> -->
                <v-row no-gutters>
                  <v-col cols="4">
                    <v-checkbox
                      class="mt-n4"
                      v-model="slotPayed"
                      label="Is It Paid ?"
                      color="blue"
                    ></v-checkbox>
                  </v-col>
                  <v-col v-if="slotPayed == true" cols="4">
                    <v-select
                      density="compact"
                      variant="outlined"
                      :rules="
                        slotPayed == true ? [(v) => !!v || 'required '] : []
                      "
                      v-model="currency"
                      class="mt-n2 ml-n3"
                      :items="['INR', 'USD']"
                      label="Currency"
                    />
                  </v-col>
                  <v-col v-if="slotPayed == true" cols="4">
                    <v-text-field
                      class="ml-2 mt-n2"
                      v-model="paymentCost"
                      :rules="
                        slotPayed == true ? [(v) => !!v || 'required '] : []
                      "
                      variant="outlined"
                      label="Price/Slot"
                      density="compact"
                      @keypress="onlyNumbers"
                    />
                  </v-col>
                </v-row>
                <div class="text-left mt-n3"><b>Co-ordinator</b></div>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-select
                      density="compact"
                      v-model="cordinatoarMembers"
                      :items="userArray"
                      class="mt-2"
                      item-title="full_user_name"
                      item-value="user_id"
                      return-object
                      variant="outlined"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" sm="6" class="">
                <v-toolbar
                  density="compact"
                  class="rounded elevation-1 ml-2 bg-white"
                  ><b class="ml-2"> Add Attachments</b> <v-spacer />
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none"
                    accept="image/*,application/pdf"
                  />
                  <v-btn
                    v-show="signimagesarrayurls.length < 5"
                    dark
                    elevation="0"
                    class="text-capitalize cardCss mr-2"
                    @click="$refs.fileInput.click()"
                    size="small"
                    :loading="uploadload"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>

                <v-row>
                  <v-col cols="12">
                    <!-- <v-card flat class="overflow-auto overflow-x-hidden"> -->
                    <v-row>
                      <v-col cols="12">
                        <div
                          class="mt-2 ml-2"
                          v-if="signimagesarrayurls.length > 0"
                        >
                          Max 5 Attachments
                        </div>
                        <v-card
                          class="mt-5 ma-2 rounded-lg elevation-1"
                          v-for="(
                            signimagesarrayurls, index
                          ) in signimagesarrayurls"
                          :key="index"
                        >
                          <v-row class="pa-5">
                            <v-col
                              :cols="
                                displayPDFFileName(
                                  signimagesarrayurls.substring(
                                    signimagesarrayurls.lastIndexOf('/') + 1,
                                    signimagesarrayurls.indexOf('?') !== -1
                                      ? signimagesarrayurls.indexOf('?')
                                      : undefined,
                                  ),
                                ) == true
                                  ? '5'
                                  : '10'
                              "
                            >
                              <div>
                                {{
                                  signimagesarrayurls.substring(
                                    signimagesarrayurls.lastIndexOf("/") + 1,
                                    signimagesarrayurls.indexOf("?") !== -1
                                      ? signimagesarrayurls.indexOf("?")
                                      : undefined,
                                  )
                                }}
                              </div>
                            </v-col>
                            <v-col
                              cols="5"
                              v-show="
                                displayPDFFileName(
                                  signimagesarrayurls.substring(
                                    signimagesarrayurls.lastIndexOf('/') + 1,
                                    signimagesarrayurls.indexOf('?') !== -1
                                      ? signimagesarrayurls.indexOf('?')
                                      : undefined,
                                  ),
                                ) == true
                              "
                            >
                              <v-img
                                max-height="80"
                                contain
                                :src="signimagesarrayurls"
                                v-if="signimagesarrayurls.length > 1"
                              >
                              </v-img>
                            </v-col>
                            <v-col cols="2">
                              <v-btn
                                icon
                                @click="delete_item(signimagesarrayurls, index)"
                                :loading="delLoading"
                              >
                                <v-icon color="red">mdi-delete</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            size="small"
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_booking_resource } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { VTimePicker } from 'vuetify/components'

// TODO: Replace with Vue 3 compatible image cropper (e.g., vue-cropper, cropperjs)
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";

import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export default {
  props: {
    resourceCreation: Boolean,
  },
  components: {
    VTimePicker,
    // Croppa,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      resourceName: "",
      loading: false,
      typeresource: "",
      typeresourceitems: [],
      slotsitems: [],
      slots: "",
      cordinatoar: false,
      timeitems: [],
      cordinatoaritems: [],
      cordinatoarMembers: "",
      timeahead: "",
      paid: false,
      slotAvailable: "",
      slotsAvialbleItems: [],
      formTime: "",
      toTime: "",
      priorBooking: null,
      hourlyBasics: "",
      globalItems: [],
      dayBasics: "",
      paymentCost: "",
      userArray: [],
      slotPayed: false,
      resourceDescription: "",
      signimagesarrayurls: [],
      documentFiles: null,
      allowedMinutes: [],
      arrayurls: [],
      height: 0,
      currency: "",
      uploadedFile: null,
      allowedHours: [],
      croppaOptions: {
        aspectRatio: 16 / 9, // Example aspect ratio
        // Other options as per your requirements
      },
      myCroppa: {},
      uploadload: false,
      actualURLs: [],
      delLoading: false,
      showFromTimePicker: false,
      showToTimePicker: false,
    };
  },
  watch: {
    resourceCreation: {
      async handler() {
        if (this.resourceCreation == true) {
          this.height = window.innerHeight - 350;
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          this.fetch_details();
          this.generate_interval_options();
          this.fetch_slot_avliablity();
        }
      },

      immediate: true,
    },
    slots: {
      handler(newValue) {
        if (newValue) {
          this.fetch_minutes(newValue);
        }
      },
      immediate: true,
    },
    // formTime(newValue) {
    //   console.log(newValue);
    //   // this.formTime = this.convertToAmPm(newValue);
    // },
  },

  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
      this.signimagesarrayurls = [];
    },

    saveFromTime() {
      if (this.formTime) {
        const [hours, minutes] = this.formTime.split(":").map(Number);

        // Validate minutes based on slot duration
        if (this.slots === "15_Minutes") {
          if (![0, 15, 30, 45].includes(minutes)) {
            // Round to nearest allowed minute
            const allowedMinutes = [0, 15, 30, 45];
            const nearestMinute = allowedMinutes.reduce((prev, curr) =>
              Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev,
            );
            this.formTime = `${hours
              .toString()
              .padStart(2, "0")}:${nearestMinute.toString().padStart(2, "0")}`;
          }
        } else {
          if (![0, 30].includes(minutes)) {
            // Round to nearest allowed minute (0 or 30)
            const nearestMinute = minutes < 30 ? 0 : 30;
            this.formTime = `${hours
              .toString()
              .padStart(2, "0")}:${nearestMinute.toString().padStart(2, "0")}`;
          }
        }

        // Update allowed hours for to time picker
        const allHours = Array.from({ length: 24 }, (_, i) => i);
        this.allowedHours = allHours.filter((hour) => hour > hours);
      }
      this.showFromTimePicker = false;
    },

    fetch_minutes(value) {
      if (value == "15_Minutes") {
        this.allowedMinutes = [0, 15, 30, 45];
      } else if (value == "30_Minutes") {
        this.allowedMinutes = [0, 30];
      } else if (value == "1_Hour") {
        this.allowedMinutes = [0];
      } else {
        this.allowedMinutes = [0, 30]; // Default to 30-minute intervals
      }
    },

    updateAllowedToTime() {
      // This method is no longer needed with the new Vue 3 time picker approach
      // The time validation is now handled automatically by the v-time-picker component
    },
    upload_data() {
      this.$refs.croppa.add();
    },

    handleImageUpload(response) {
      // Handle the uploaded image response
      // console.log("Image uploaded:", response);
    },
    auto_populate(value) {
      this.resourceDescription = value;
    },
    handleImageRemove() {
      // Handle image removal
      // console.log("Image removed");
    },

    uploadImage() {
      if (this.uploadedFile) {
        // Perform image upload logic here
        // For example, use Axios to send the file to your server
        // axios.post('/upload', formData)
        //   .then(response => {
        //     // Handle the response
        //   })
        //   .catch(error => {
        //     // Handle errors
        //   });
      }
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
            user_email_id: element.user_email_id,
          });
        }
      });
    },

    // async upload_S3(files) {
    //   var imageUrl = [];
    //   var newUrl = [];
    //   var baseData = [];
    //   var file = files;
    //   const fr = new FileReader();
    //   fr.readAsDataURL(file);
    //   fr.addEventListener("load", () => {
    //     imageUrl = fr.result;
    //     newUrl = imageUrl;
    //     newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

    //     baseData.push(newUrl);

    //     this.upload_S3_bucket(baseData[0], file);
    //   });
    // },

    // async upload_S3_bucket(baseData, file) {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;

    //   var buf = Buffer.from(baseData, "base64");

    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key:
    //       "resources" +
    //       "/" +
    //       deatils.organization.organization_id +
    //       "/" +
    //       Math.floor(new Date().getTime()),
    //     Body: buf,
    //     ContentType: file.type,
    //   };

    //   var bucketurl =
    //     "https://" +
    //     bucketName +
    //     ".s3." +
    //     deatils.s3_details.region +
    //     ".amazonaws.com/" +
    //     params.Key;

    //   await s3Bucket.putObject(params, function (err, data) {
    //     if (err) {
    //       this.loading1 = false;
    //     } else if (data) {
    //       bucketurl;
    //       var deatil = self.$store.getters.GetOrgDetails;
    //       self.urls = bucketurl;
    //       self.s3get(deatil);
    //     }

    //     self.contentdocumentFiles = [];
    //   });
    // },

    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();

      // Process the selected files
      // await this.upload_new_func();
    },

    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async upload_new_func() {
      if (!this.documentFiles) return;
      this.uploadload = true;
      const orgDetails = this.$store.getters.GetOrgDetails;

      // const userId = this.$store.getters.GetUserObj.user.user_id;
      const Key = [
        "resources" +
          "/" +
          orgDetails.organization.organization_id +
          "/" +
          Math.floor(new Date().getTime()),
        this.replaceSpecialCharacters(this.documentFiles.name),
      ].join("/");

      try {
        const fileUrl = await uploadToS3(
          this.documentFiles,
          orgDetails.s3_details,
          Key,
        );
        if (fileUrl) {
          this.actualURLs.push(fileUrl);

          const signedUrl = await getS3SignedUrl(
            fileUrl,
            orgDetails.s3_details,
          );
          if (signedUrl) {
            // console.log(signedUrl);
            this.signimagesarrayurls.push(signedUrl);
            this.uploadload = false;
          }
          // console.log("✅ Uploaded file URL:", fileUrl);
          // await this.create_expense(fileUrl);
          // this.documentFiles = null;
        }
      } catch (err) {
        // this.uploadStatus = "❌ Upload failed. Check console.";
        // this.uploadStatusType = "error";
        this.loading = false;
      }
    },

    // async delete_item(val, index) {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;
    //   this.delLoading = true;
    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key: val,
    //   };

    //   await s3Bucket.deleteObject(params, function (err, data) {
    //     if (err) {
    //       // console.log(err);
    //     } else if (data) {
    //       self.signimagesarrayurls.forEach((element) => {
    //         if (element == val) {
    //           self.signimagesarrayurls.splice(index, 1);
    //         }
    //       });
    //     }
    //   });
    // },

    async delete_item(val, index) {
      this.delLoading = true;
      try {
        const urlObj = new URL(val);
        const key = urlObj.pathname.slice(1);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.signimagesarrayurls.splice(index, 1);
          this.actualURLs.splice(index, 1);
          this.delLoading = false;
        }
      } catch (err) {
        this.delLoading = false;
        console.error("Delete error:", err);
      }
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
        Key: "resources/" + this.urls.split("resources/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.push(url);
      //   return url;
    },

    generate_interval_options() {
      this.slotsitems = [];
      const durations = [
        15, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780,
        840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1440,
      ];
      for (const duration of durations) {
        let value;
        if (duration < 60) {
          value = `${duration}_Minutes`;
        } else {
          value = `${Math.floor(duration / 60)}_Hour`;
        }

        const label = value.replace("_", " ");
        this.slotsitems.push({ text: label, value });
      }
    },

    get_hourly(val) {
      this.globalItems = [];
      for (var i = 1; i <= val; i++) {
        this.globalItems.push(i);
      }
    },

    fetch_slot_avliablity() {
      this.slotsAvialbleItems = [];
      const startTime = { hours: 9, minutes: 0 };
      const endTime = { hours: 24, minutes: 0 };

      let currentTime = { ...startTime };

      while (
        currentTime.hours < endTime.hours ||
        (currentTime.hours === endTime.hours &&
          currentTime.minutes === endTime.minutes)
      ) {
        const label = `${currentTime.hours.toString().padStart(2, "0")}:${
          currentTime.minutes === 0 ? "00" : "30"
        }`;
        this.slotsAvialbleItems.push({ text: label, value: label });

        // Increment by 30 minutes
        currentTime.minutes += 30;

        if (currentTime.minutes === 60) {
          currentTime.hours += 1;
          currentTime.minutes = 0;
        }
      }
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // this.fetch_cordinators();
        this.create_event_info();
      }
    },

    onlyNumbers(event) {
      if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    },

    async create_event_info() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_booking_resource, {
            input: {
              organization_id: data.organization.organization_id,
              resource_name: this.resourceName,
              user_email_id: data.user.user_email_id,
              resource_slot_availabity: this.fetch_slot2_avliablity(),
              resource_images:
                this.signimagesarrayurls.length == 0
                  ? undefined
                  : this.convertArrayToRegularS3URLs(this.signimagesarrayurls),
              resource_booking_time_ahead: this.fetch_prior_booking(),
              resource_slot_duration: this.slots,
              is_resource_slot_paid: this.slotPayed,
              resource_slot_cordinators: this.fetch_cordinators(),
              resource_slot_price:
                this.slotPayed == true ? this.paymentCost : undefined,
              resource_description: this.resourceDescription,
              resource_amount_type:
                this.slotPayed == true ? this.currency : undefined,
            },
          }),
        );
        this.loading = false;
        var response = JSON.parse(result.data.create_booking_resource);
        if (response.Status == "SUCCESS") {
          this.clear_data();
          this.$emit("SuccessMsg", response.Message);
          this.$emit("resourcelist", "dataValue");
        } else {
          this.$emit("errorMsg", response.Message);
        }
        // console.log(response);
      } catch (error) {
        this.loading = false;
      }
    },
    displayPDFFileName(url) {
      if (url.endsWith(".jpg")) {
        // const filename = url.substring(url.lastIndexOf("/") + 1);
        return true;
      } else if (url.endsWith(".png")) {
        return true;
      } else if (url.endsWith(".jpeg")) {
        return true;
      } else {
        return false;
      }
    },

    convertToRegularS3URL(presignedURL) {
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },
    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }

      return JSON.stringify(this.arrayurls);
    },

    clear_data() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.slotPayed = false;
      this.paymentCost = "";
      this.hourlyBasics = "";
      this.dayBasics = "";
      this.priorBooking = null;
      this.signimagesarrayurls = [];
    },

    fetch_cordinators() {
      var data = [];

      if (this.cordinatoarMembers != "" && this.cordinatoarMembers != null) {
        data.push(this.cordinatoarMembers);
      }

      return JSON.stringify(data);
    },

    fetch_slot2_avliablity() {
      var data = {};
      if (this.slots != "24_Hour") {
        data = {
          start_time: this.formTime,
          end_time: this.toTime,
        };
      } else {
        data = {
          start_time: "00:00",
          end_time: "00:00",
        };
      }

      return JSON.stringify(data);
    },

    fetch_prior_booking() {
      var data = "";
      if (this.priorBooking == "immediate") {
        data = "IMMEDIATE";
      } else if (this.priorBooking == "hours") {
        data = this.hourlyBasics + "_" + "hours";
      } else if (this.priorBooking == "days") {
        data = this.dayBasics + "_" + "days";
      }

      return data;
    },

    saveToTime() {
      if (this.toTime) {
        const [hours, minutes] = this.toTime.split(":").map(Number);

        // Validate minutes based on slot duration
        if (this.slots === "15_Minutes") {
          if (![0, 15, 30, 45].includes(minutes)) {
            // Round to nearest allowed minute
            const allowedMinutes = [0, 15, 30, 45];
            const nearestMinute = allowedMinutes.reduce((prev, curr) =>
              Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev,
            );
            this.toTime = `${hours.toString().padStart(2, "0")}:${nearestMinute
              .toString()
              .padStart(2, "0")}`;
          }
        } else {
          if (![0, 30].includes(minutes)) {
            // Round to nearest allowed minute (0 or 30)
            const nearestMinute = minutes < 30 ? 0 : 30;
            this.toTime = `${hours.toString().padStart(2, "0")}:${nearestMinute
              .toString()
              .padStart(2, "0")}`;
          }
        }
      }
      this.showToTimePicker = false;
    },

    cancelFromTime() {
      this.showFromTimePicker = false;
    },

    cancelToTime() {
      this.showToTimePicker = false;
    },
  },
};
</script>
<style scoped>
.v-file input[type="file"]::-webkit-file-upload-button {
  visibility: hidden;
}

.primaryColor {
  color: #db4c77 !important;
}
</style>

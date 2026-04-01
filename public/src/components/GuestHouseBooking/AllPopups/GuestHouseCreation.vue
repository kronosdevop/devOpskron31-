<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="creationDialogue" @update:model-value="$emit('update:creationDialogue', $event)"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
            <v-stepper v-model="step">
              <v-stepper-header>
                <v-stepper-step :complete="step > 1" step="1"
                  >Tell us about your place</v-stepper-step
                >
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 2" step="2"
                  >Add Location</v-stepper-step
                >
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 3" step="3"
                  >Upload Images</v-stepper-step
                >
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 4" step="4"
                  >Capacity/Discounts</v-stepper-step
                >
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 5" step="5"
                  >Preview and Save</v-stepper-step
                >
              </v-stepper-header>

              <v-stepper-items>
                <v-stepper-content step="1">
                  <InfoPage v-on:emitSecondSTep="fetch_first_emit_second_step"  :key="clearInfo"/>
                </v-stepper-content>

                <v-stepper-content step="2">
                  <LocationInfo
                    v-on:emitThirdSTep="fetch_second_move_third"
                    v-on:backtofirstStep="back_to_first_step"
                    :key="clearInfo"
                  />
                </v-stepper-content>

                <v-stepper-content step="3">
                  <UploadImage
                    v-on:emitfourthstep="fetch_third_move_fouth"
                    v-on:emitthirdstep="back_to_second_step"
                    :key="clearInfo"
                  />
                </v-stepper-content>
                <v-stepper-content step="4">
                  <PriceandDiscount
                    v-on:emitfifthstep="fetch_fourth_move_fifth"
                    v-on:emitfourthstep="back_to_third_step"
                    :key="clearInfo"
                  />
                </v-stepper-content>
                <v-stepper-content step="5">
                  <v-card>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-row>
                            <v-col cols="12">
                              <span><b>Title:</b></span> {{ firstStepIfo.title }}
                            </v-col>
                            <v-col cols="12" class="mt-n2">
                              <span ><b>Discription:</b></span> {{ firstStepIfo.description }}
                            </v-col>  
                            <v-col cols="12" class="mt-n2">
                              <span><b>Location Address:</b></span> {{ secondStepInfo.locationsAddress }}
                            </v-col>
                            <v-col cols="12" class="mt-n2">
                              <span><b>Pricing:</b></span> {{ fourthStepInfo.pricing ? 'Enabled' : 'Disabled' }}
                            </v-col>
                            <v-col cols="12" class="mt-n2">
                              <span><b>Guest Capacity:</b></span> {{ fourthStepInfo.numberofadults }} (Adult) ~ {{ fourthStepInfo.numberofchildren }} (Children)
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-row>
                            <v-col cols="12">
                              <span><b>Payment UPI ID:</b></span> {{ fourthStepInfo.payment_uip_Id }}
                            </v-col>
                          <v-col cols="12" class="mt-n2">
                          <span><b>Weekly Price:</b></span> {{ fourthStepInfo.weeklyprice || "N/A" }}
                        </v-col>
                        <v-col cols="12" class="mt-n2">
                          <span><b>Weekend Price:</b></span> {{ fourthStepInfo.specialPrice || fourthStepInfo.weeklyprice }}
                        </v-col>
                        <v-col cols="12" class="mt-n2">
                          <span><b>Weekly Discount:</b></span> {{ fourthStepInfo.weeklyDiscount || 0 }}%
                        </v-col>
                        <v-col cols="12" class="mt-n2">
                          <span><b>Monthly Discount:</b></span> {{ fourthStepInfo.monthlyDiscount || 0 }}%
                        </v-col>
                          </v-row>
                        </v-col>
                        <v-col cols="12">
                          <span><b>Uploaded Images:</b></span>
                          <v-row>
                            <v-col v-for="(item, index) in thirdStepInfo" :key="index" cols="2">
                              <v-img
                                :src="item.preview"
                                alt="Uploaded Image"
                                contain
                                height="150"
                                class="rounded-lg"
                              />
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                      <v-card-actions class="justify-center">
                        <v-btn depressed @click="prevStep()" class="mr-2" dark color="primary">
                            Back
                        </v-btn>
                        <v-btn
                          @click="validate_data()"
                          dark
                          :loading="loading"
                          class="text-capitalize cardCss button-corner mt-8"
                        >
                          Save
                        </v-btn>
                      </v-card-actions>
                  </v-card>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import InfoPage from "@/components/GuestHouseBooking/AllPopups/InfoPage.vue";
import LocationInfo from "@/components/GuestHouseBooking/AllPopups/LocationInfo.vue";
import UploadImage from "@/components/GuestHouseBooking/AllPopups/UploadImage.vue";
import PriceandDiscount from "@/components/GuestHouseBooking/AllPopups/PriceandDiscount.vue";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { register_guest_house } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
export default {
  components: {
    InfoPage,
    LocationInfo,
    UploadImage,
    PriceandDiscount,
  },
  props: {
    creationDialogue: Boolean,
  },
  data() {
    return {
      step: 1,
      clearInfo:0,
      firstStepIfo: {},
      secondStepInfo: {},
      thirdStepInfo: {},
      fourthStepInfo: {},
      bucketUrls: [],
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.clearInfo++;
      this.step=1;
      this.$emit("clicked", 0);
    },
    fetch_first_emit_second_step(value) {
      this.firstStepIfo = value;
      this.step = 2;
    },
    fetch_second_move_third(value) {
      // console.log("value",value)
      this.secondStepInfo = value;
      this.step = 3;
    },
    fetch_third_move_fouth(value) {
      this.thirdStepInfo = value.map((item) => ({
        file: item.file,
        preview: URL.createObjectURL(item.file),
      }));
      this.step = 4;
    },

    fetch_fourth_move_fifth(value) {
      this.fourthStepInfo = value;
      this.step = 5;
    },
    back_to_first_step() {
      this.step = 1;
    },
    back_to_second_step() {
      this.step = 2;
    },
    back_to_third_step() {
      this.step = 3;
    },
    nextStep() {
      this.step++;
    },
    prevStep() {
      this.step--;
    },

    validate_data() {
      this.loading = true;
      this.get_file();
    },

    // async upload_S3(baseData, file) {
    //   const self = this;
    //   const deatils = this.$store.getters.GetOrgDetails;
    //   const buf = Buffer.from(baseData, "base64");

    //   const s3Bucket = new AWS.S3({
    //     region: "us-east-1",
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });

    //   const bucketName = "stichh-medias";
    //   const params = {
    //     Bucket: bucketName,
    //     Key: `guesthouseimages/${
    //       deatils.organization.organization_id
    //     }/${Date.now()}/${self.replaceSpecialCharacters("image.png")}`,
    //     ACL: "public-read",
    //     Body: buf,
    //     ContentType: file.type,
    //   };

    //   const bucketUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${params.Key}`;

    //   return new Promise((resolve, reject) => {
    //     s3Bucket.putObject(params, function (err, data) {
    //       if (err) {
    //         // console.log(err);
    //         reject(err);
    //       } else {
    //         self.bucketUrls.push(bucketUrl);
    //         resolve(bucketUrl);
    //       }
    //     });
    //   });
    // },

    async upload_new_func(file) {
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      // const userId = this.$store.getters.GetUserObj.user.user_id;
      const s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };
      const key = [
        `guesthouseimages/${
          orgDetails.organization.organization_id
        }/${Date.now()}/${this.replaceSpecialCharacters(file.name)}`            
      ];
      try {
        const fileUrl = await uploadToS3(
          file,
          s3_details,
          key
        );
        if (fileUrl) {
          return this.bucketUrls.push(fileUrl);
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        // this.uploadStatus = "❌ Upload failed. Check console.";
        // this.uploadStatusType = "error";
        this.loading = false;
      }
    },

    async get_file() {
      this.bucketUrls = [];
      let files = this.thirdStepInfo.map((item) => item.file);

      let uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = (event) => {
            let base64String = event.target.result.replace(
              /^data:.+;base64,/,
              ""
            );
            this.upload_new_func(file).then(resolve).catch(reject);
          };
          fr.readAsDataURL(file);
        });
      });

      Promise.all(uploadPromises)
        .then(() => {
          this.add_guestHouse();
        })
        .catch((error) => console.error("Error uploading images:", error));
    },

    async add_guestHouse() {
      try {
        let result = await API.graphql(
          graphqlOperation(register_guest_house, {
            input: {
              guest_house_name: this.firstStepIfo.title,
              guest_house_description: this.firstStepIfo.description,
              location_name: this.secondStepInfo.locationName,
              guest_house_type: this.firstStepIfo.selectedCard,
              location_lat: this.secondStepInfo.geoLattitude,
              location_long: this.secondStepInfo.geoLongitude,
              location_address: this.secondStepInfo.locationsAddress,
              location_pincode: this.secondStepInfo.pincode,
              guest_houser_images: this.bucketUrls,
              week_day_price: this.fourthStepInfo.weeklyprice,
              weekend_price:
                this.fourthStepInfo.specialPrice ||
                this.fourthStepInfo.weeklyprice,
              discounts: this.fetch_discounts(),
              allowed_guests: this.fetch_guestcount(),
              is_price_visible: this.fourthStepInfo.pricing,
              payment_upi_id: this.fourthStepInfo.payment_uip_Id,
              entry_logs: this.fetch_timings(),
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.register_guest_house);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.loading = false;
          this.step = 1;
        } else {
          this.loading = false;
          this.step = 1;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
      }
    },

    replaceSpecialCharacters(filename) {
      return filename.replace(/[^a-zA-Z0-9.]/g, "_");
    },

    fetch_discounts() {
      var discounts = {
        weekly_discount: this.fourthStepInfo.weeklyDiscount,
        monthly_discount: this.fourthStepInfo.monthlyDiscount,
      };
      return JSON.stringify(discounts);
    },
    fetch_guestcount() {
      var guestcount = {
        no_of_childrens: this.fourthStepInfo.numberofchildren,
        no_of_adults: this.fourthStepInfo.numberofadults,
      };
      return JSON.stringify(guestcount);
    },
    fetch_timings() {
      var timings = {
          check_in: this.fourthStepInfo.check_in,
          check_out: this.fourthStepInfo.chech_out,
      }
      return JSON.stringify(timings)
    },
  },
};
</script>
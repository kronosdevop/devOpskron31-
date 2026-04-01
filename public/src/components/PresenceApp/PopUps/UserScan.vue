<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="scanLog"
    @update:model-value="scanLog = $event"
    persistent
    max-width="500"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="ml-2">
          <div class="custom-title">Scan</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text align="center">
        <div v-if="cameras.length == 0">
          <div class="text-center font-weight-bold">No Camera Connected</div>
        </div>
        <div v-else>
          <v-select
            v-if="cameras.length > 1"
            v-model="selectedCameraIndex"
            :items="cameraOptions"
            style="max-width: 150px"
            label="Select a Camera"
            class="mt-5"
            density="compact"
            variant="outlined"
          >
          </v-select>
          <div class="page-container">
            <div class="video-container" v-if="selectedCameraIndex !== null">
              <video class="camera-video" ref="videoElement" autoplay></video>
              <div class="face-overlay"></div>
            </div>
          </div>
          <v-card-actions class="justify-center">
            <v-btn
              v-if="selectedCameraIndex !== null"
              @click="capturePhoto"
              :loading="buttonload"
              class="cardCss text-white text-capitalize"
            >
              Capture Photo
            </v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
    
    <script>
/*eslint-disable*/
import { user_swipes_capture } from "@/graphql/mutations.js";
import { getData } from "@/mixins/AllQueries.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
export default {
  props: {
    scanLog: Boolean,
  },
  mixins: [get_Org_details, getData],
  data() {
    return {
      stream: null,
      count: 0,
      cameras: [],
      latitude: null,
      longitude: null,
      error: false,
      buttonload: false,
      errorMessage: "",
      selectedCameraIndex: null,
      capturedPhoto: null,
      videoStream: null,
      isCameraAccessRequested: false,
      formattedDate: "",
    };
  },
  watch: {
    scanLog: {
      async handler() {
        if (this.scanLog == true) {
          this.isCameraAccessRequested = false;
          if (!this.isCameraAccessRequested) {
            await this.startCamera();
            this.isCameraAccessRequested = true;
          }
          await this.get_Org_details();
          await this.fectdetails();
          await this.getLocation();
          await this.loadCameras();
          if (this.cameras.length > 0) {
            this.selectedCameraIndex = 0; // Select the first camera by default
          }
        }
      },
      immediate: true,
    },
    selectedCameraIndex(newIndex, oldIndex) {
      // console.log(newIndex);
      if (newIndex !== oldIndex) {
        this.stopCamera();
        if (newIndex !== null) {
          this.startCamera();
        }
      }
    },
  },
  beforeUnmount() {
    this.stopCamera();
  },
  computed: {
    cameraOptions() {
      if (this.cameras.length === 2) {
        return [
          { text: "Device 1", value: 0 },
          { text: "Device 2", value: 1 },
        ];
      } else {
        return this.cameras.map((camera, index) => {
          return { text: camera.label, value: index };
        });
      }
    },
  },
  methods: {
    fectdetails() {
      const currentDate = new Date();

      // Define the options for formatting
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are 0-based
      const year = currentDate.getFullYear();

      // Create the formatted date string
      this.formattedDate = `${day}-${month}-${year}`;

      // console.log(this.formattedDate,'5');
    },
    async close_dialog() {
      await this.stopCamera();

      if (this.$refs.videoElement) {
        this.$refs.videoElement.srcObject = null;
      }

      this.$emit("clicked", 0);
      // window.location.reload();
    },

    async loadCameras() {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          this.cameras = devices.filter(
            (device) => device.kind === "videoinput"
          );
        } catch (error) {
          // console.error("Error enumerating devices:", error);
        }
      } else {
        // this.SnackBarComponent = {
        //   SnackbarVmodel: true,
        //   SnackbarColor: "red",
        //   Top: true,
        //   SnackbarText: "Devices is not supported.",
        // };
        // Handle the case where enumerateDevices is not available
        // console.error("enumerateDevices is not supported.");
        // You can provide a message to the user or take appropriate action here.
      }
    },
    async startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: this.cameras[this.selectedCameraIndex].deviceId,
          },
        });
        this.$refs.videoElement.srcObject = stream;
      } catch (error) {
        // console.error("Error accessing webcam:", error);
      }
    },
    async capturePhoto() {
      const canvas = document.createElement("canvas");
      canvas.width = this.$refs.videoElement.videoWidth;
      canvas.height = this.$refs.videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.$refs.videoElement, 0, 0, canvas.width, canvas.height);
      this.capturedPhoto = canvas.toDataURL("image/png");
      await this.getLocation();
      if (this.count == 1) {
        this.capture_photoV2();
      }
    },
    stopCamera() {
      if (this.$refs.videoElement && this.$refs.videoElement.srcObject) {
        const tracks = this.$refs.videoElement.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      // if (this.videoStream) {
      //   this.videoStream.getTracks().forEach((track) => track.stop());
      //   this.videoStream = null;
      // }
    },
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.error = false;
            this.count = 1;
          },
          (error) => {
            this.error = true;
            this.errorMessage = `Error getting location: ${error.message}`;
          }
        );
      } else {
        this.error = true;
        this.errorMessage = "Geolocation is not supported by this browser.";
      }
    },
    async capture_photoV2() {
      this.buttonload = true;
      const variables = {
        input: {
          swipe_lat: this.latitude,
          swipe_long: this.longitude,
          swipe_date: this.formattedDate,
          action_type: "FACE_BUFF",
          face_buff_or_base: this.capturedPhoto.split(
            "data:image/png;base64,"
          )[1],
        },
      };

      await this.fetchData(user_swipes_capture, variables)
        .then(() => {
          var response = JSON.parse(
            this.queryResponse.data.user_swipes_capture
          );
          this.buttonload = false;

          if (response.Status == "SUCCESS") {
            this.stopCamera();

            if (this.$refs.videoElement) {
              this.$refs.videoElement.srcObject = null;
            }
            this.$emit("successMsg", response.Message);
            this.$emit("usercorrection", "refresh");
            this.buttonload = false;
          } else {
            this.$emit("errorMsg", response.Message);

            this.buttonload = false;
          }
        })

        .catch((error) => {
          this.buttonload = false;
          this.$emit("errorMsg", error.errors[0].message);
        });
    },
  },
};
</script>
    
<style>
.face-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; /* Adjust this size according to your layout */
  height: 200px; /* Adjust this size according to your layout */
  border: 2px dashed red; /* Add a dashed red border as a guide */
  pointer-events: none; /* Prevent the overlay from blocking interactions with the video */
  z-index: 2; /* Place the overlay above the video */
}
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.camera-video {
  transform: scaleX(-1);
}
.video-container {
  position: relative;
  width: 80%; /* Adjust the width as needed */
  padding-top: 70%; /* 1:1 aspect ratio */
  border: 2px solid black;
  margin-top: 16px;
  overflow: hidden;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
  
<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="qrLocation"
      @update:model-value="$emit('update:qrLocation', $event)"
      persistent
      max-width="300"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">
              QR for
              {{
                rowInfo.location_name == undefined
                  ? rowInfo.qr_name
                  : rowInfo.location_name
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="d-flex justify-center" ref="logo">
            <v-img
              max-height="50"
              max-width="160"
              contain
              class="mb-4"
              src="@/assets/horizontal-logo.png"
            ></v-img>
          </div>

          <div class="qr-wrapper d-flex justify-center" ref="qrcode">
            <VueQRCodeComponent
              :text="locationQrId"
              error-level="H"
              :size="180"
              ref="qrcode"
            />
            <div class="qr-center-logo-bg">
              <img
                src="@/assets/logo-whitebg.png"
                alt="Logo"
                class="qr-center-logo"
              />
            </div>
          </div>
          <div class="d-flex justify-center pt-5 font-weight-bold">
            {{
              rowInfo.location_name == undefined
                ? rowInfo.qr_name
                : rowInfo.location_name
            }}
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            size="small"
            :loading="loading"
            @click="printQR()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Print QR
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/*eslint-disable*/

import { jsPDF } from "jspdf";
import VueQRCodeComponent from "vue-qrcode-component";
import html2canvas from "html2canvas";
export default {
  components: { VueQRCodeComponent },
  props: {
    qrLocation: Boolean,
    rowInfo: Object,
    qrtype: String,
  },
  data() {
    return {
      loading: false,
      locationQrId: "",
    };
  },
  watch: {
    qrLocation: {
      async handler() {
        if (this.qrLocation == true) {
          if (this.qrtype == "Single") {
            this.locationQrId = this.rowInfo.qr_details[0].qr_label;
          } else {
            this.locationQrId = this.rowInfo.qr_label;
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
    printQR() {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      html2canvas(this.$refs.logo, {
        scale: 3, // Increase the scale for higher resolution
      })
        .then((canvas) => {
          const logoImgData = canvas.toDataURL("image/png");

          const logoWidth = 100; // Logo width
          const logoHeight = 50; // Logo height
          const logoX = (pageWidth - logoWidth) / 2; // Center the logo horizontally
          const logoY = 30; // Place logo vertically with some padding from the top

          // Add the logo image to the PDF
          doc.addImage(logoImgData, "PNG", logoX, logoY, logoWidth, logoHeight);

          // Capture the QR code image with higher resolution using html2canvas
          html2canvas(this.$refs.qrcode, {
            scale: 3, // Increase the scale for higher resolution
          })
            .then((canvas) => {
              const qrImgData = canvas.toDataURL("image/png");

              // Define the QR code size and position
              const qrWidth = 120; // Increase QR code width
              const qrHeight = 120; // Increase QR code height
              const qrX = (pageWidth - qrWidth) / 2; // Center the QR code horizontally
              const qrY = logoY + logoHeight + 10; // Place QR code below the logo

              // Add the QR code image to the PDF
              doc.addImage(qrImgData, "PNG", qrX, qrY, qrWidth, qrHeight);

              // Add the center logo on top of the QR code in the PDF
              const centerLogo = new Image();
              centerLogo.src = require('@/assets/logo-whitebg.png');
              centerLogo.onload = () => {
                const centerLogoWidth = 30; // Adjust as needed
                const centerLogoHeight = 30; // Adjust as needed
                const centerLogoX = qrX + (qrWidth - centerLogoWidth) / 2;
                const centerLogoY = qrY + (qrHeight - centerLogoHeight) / 2;
                // Draw white rounded rectangle behind logo
                const padding = 4;
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(
                  centerLogoX - padding,
                  centerLogoY - padding,
                  centerLogoWidth + 2 * padding,
                  centerLogoHeight + 2 * padding,
                  8, 8, 'F'
                );
                // Draw logo
                doc.addImage(centerLogo, 'PNG', centerLogoX, centerLogoY, centerLogoWidth, centerLogoHeight);

                // Add location name or fallback QR name to the PDF
                const text =
                  this.rowInfo.location_name == undefined
                    ? this.rowInfo.qr_name
                    : this.rowInfo.location_name;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                const textWidth =
                  (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
                  doc.internal.scaleFactor;
                const textX = (pageWidth - textWidth) / 2; // Center text horizontally
                const textY = qrY + qrHeight + 15; // Place text just below the QR code

                doc.text(text, textX, textY); // Add location name text

                // Save the PDF with a dynamic file name
                doc.save(
                  `${
                    this.rowInfo.location_name == undefined
                      ? this.rowInfo.qr_name
                      : this.rowInfo.location_name
                  }.pdf`
                );
              };
            })
            .catch((error) => {
              console.error("Error capturing QR code: ", error);
            });
        })
        .catch((error) => {
          console.error("Error capturing logo: ", error);
        });
    },
  },
};
</script>
<style>
.qr-wrapper {
  position: relative;
  display: inline-block;
}
.qr-center-logo-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 2px #0002;
  pointer-events: none;
}
.qr-center-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  pointer-events: none;
}
</style>
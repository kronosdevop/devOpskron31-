<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="paySlipview" @update:model-value="$emit('update:paySlipview', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Payslip</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon
            @click="saveAsPDF"
            dark
            color="primaryColor"
            class="mr-2"
            v-show="description != ''"
            >mdi-download</v-icon
          >

          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="text-left mt-5">
          <div v-if="description != ''">
            <div id="payslip-content">
              <div v-html="description"></div>
            </div>
          </div>
          <div v-else justify="center" align="center">No Records</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_user_payslip_html } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
export default {
  props: {
    paySlipview: Boolean,
    payslipitem: Object,
  },
  data() {
    return {
      // description: `
      //   <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<strong>Mobil80 Solutions & Services Pvt. Ltd</strong></p><p><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong><strong> &nbsp; &nbsp;</strong></p><p><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong><img src="https://stichh-default-mumbai.s3.ap-south-1.amazonaws.com/AllorganizationLogos/4a15f402-3e19-4d9b-83a5-429715785f72/1717491043770.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA3PWOHBKHI7IEY7MQ%2F20240605%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240605T104242Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDMaCXVzLWVhc3QtMSJHMEUCICe8xtSxiubnfGdoAMXbVwj5TCeCx4%2FIV02PEBXrD%2B%2BvAiEAtb0ZTASscQz389z0wkkaDZzilXhGeW%2BtkoewcXS9lioq%2FwIIvP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw3ODk2MzI3MTU0MDYiDNgpA%2FpMT1r5l5MkECrTAnmKLo7NoR9j1iOYi8Td%2FOHvsB9hYFdL2aH2%2B0YOnoJYaoR0uxNOsOA%2Fz1owBDkOSoAhaV7bb%2FLsCioCErnnk54gloxxLnMRmrVj8sasAg25vKAEE4XDv5gKUzRukHUZXm8CwaBKW%2Bv8S6ytsXJTU2HhwyJuCERb2%2F4imO%2BV9l41Uxr9b%2FZC8HpyS7rZywU7tNhG%2FBzR75oUujUmfeOX9sWG6EFEQN4MVzNrHqhgg8eshs4PqmVNqNU1mYeaBO54EXRVxYS5qEdzc7uaUuKsCuM4UuM7%2BgwBcB0Yze3HdogGbdRXkdePnfunRgkFqI5Vfj%2Bg9YIgf4UOYh9Or7%2BYASdcB6rS75WkryKwMEpfI%2BP4Zq68e45C3ChNbmsqHiboKYeoZmk2Zgm%2FrqFpt9FO%2F%2FNpHu684vFzGOXFL7ecFi8IHEaWADOlj%2FEZXagQCdUyZldSBzCJ%2B4CzBjqeAfDmt2kDV%2FOYp%2By8fs6sVTntL3co18if5kS5yIMbFsKNmbCZ7PgcVL8U9k6prpdv4wPwqJo7JIxmWyltOSeEQwGnBtM4R2ctTC5fcF3C0cjYd83C6lXCDvt6aC9eTa9TsKq88l8VNOm4%2F0ZpLaqUFKKL4uCP6CozeHkVGW4npIqlxlD1O%2FeOKfyYgs2QhSr4FV8TqmmpI70eo6WpKtrh&X-Amz-Signature=b3580be23e3e4675ac9d6b44e03d728ac3a2edb33f1e0479a43e307c48b36661&X-Amz-SignedHeaders=host&x-id=GetObject" alt="organization logo" style="max-width:200px;max-height:110px;object-fit:contain;"><strong> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong><i><strong> &nbsp;</strong></i></p><p>&nbsp;</p><figure class="table"><table><thead><tr><th colspan="2" style="border: 1px solid #555; padding: 8px; background-color: lightgrey;">&nbsp; Payslip</th></tr></thead><tbody><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Employee Name &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</strong></td><td style='border: 1px solid black;  padding: 8px;'>Radhika &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Employee Code</strong></td><td style='border: 1px solid black;  padding: 8px;'>M102</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Location</strong></td><td style='border: 1px solid black;  padding: 8px;'>&nbsp;Mobi80c1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>No Of Days</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Days Worked</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr></tbody></table></figure><p><i>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</i><strong> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong></p><p>&nbsp;</p><figure class="table"><table><tbody><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Basic Salary &nbsp;&nbsp;</strong> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</td><td style='border: 1px solid black;  padding: 8px;'>&nbsp;1 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>&nbsp;HRA</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Conveyance</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>CCA</strong></td><td style='border: 1px solid black;  padding: 8px;'>200</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Professional Tax</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Income Tax</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Employees Provident Fund</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>ESIC</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Total Earnings</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Total Deductions</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr><tr><td style='border: 1px solid black;  padding: 8px;'><strong>Net Pay</strong></td><td style='border: 1px solid black;  padding: 8px;'>1</td></tr></tbody></table></figure><p><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</strong></p><p><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</strong></p><p>&nbsp;</p>
      // `,
      description: "",
    };
  },
  watch: {
    paySlipview: {
      async handler() {
        await this.fetch_usertimelist();
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      //   this.$refs.form.reset();
    },
    async fetch_usertimelist() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_user_payslip_html, {
            input: {
              payslip_id: this.payslipitem.payslip_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_user_payslip_html);

        if (response.Status == "SUCCESS") {
          this.description = "";
          this.description = response.data[0].htmlContent;
        } else {
          this.description = "";
        }
      } catch (error) {
        this.description = "";

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    saveAsPDF() {
      const payslipContent = document.getElementById("payslip-content");

      // Ensure the image is fully loaded
      const images = payslipContent.getElementsByTagName("img");
      const promises = Array.from(images).map((img) => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = reject;
          }
        });
      });

      Promise.all(promises)
        .then(() => {
          // Proceed with html2canvas after all images are loaded
          html2canvas(payslipContent, { scale: 2, useCORS: true }).then(
            (canvas) => {
              const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4",
              });

              // Get the dimensions of the PDF page
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();

              // Calculate the scaling factor to fit the content into the PDF page
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;
              const scaleFactor = Math.min(
                pageWidth / canvasWidth,
                pageHeight / canvasHeight
              );

              // Calculate the scaled dimensions
              const imgWidth = canvasWidth * scaleFactor;
              const imgHeight = canvasHeight * scaleFactor;

              // Center the image if it's smaller than the page size
              const marginLeft = (pageWidth - imgWidth) / 2;
              const marginTop = (pageHeight - imgHeight) / 2;

              // Add the image to the PDF
              const imgData = canvas.toDataURL("image/png");
              pdf.addImage(
                imgData,
                "PNG",
                marginLeft,
                marginTop,
                imgWidth,
                imgHeight
              );

              // Save the PDF
              pdf.save("payslip.pdf");
            }
          );
        })
        .catch((error) => {
          console.error("Failed to load images: ", error);
        });
    },
  },
};
</script>

<style>
</style>
<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-card class="overflow-hidden">
      <v-toolbar elevation="0" density="compact" class="bg-white">
        <v-toolbar-title class="text-black ml-2">
          <div class="custom-title">View Entry</div>
        </v-toolbar-title>
        <v-spacer />

        <v-tooltip
          location="bottom"
          v-if="
            reversetransactioncard == false &&
            TransactionDetails.transaction_type == 'INVOICE_PAYMENT' &&
            settleInvoice == false &&
            amountSetteled == false
          "
        >
          <template v-slot:activator="{ props }">
            <v-btn
              class="text-capitalize mr-2"
              size="small"
              color="green"
              v-bind="props"
              @click="settlePayment()"
            >
              Settle
            </v-btn>
          </template>
          <span>Settle Invoice</span>
        </v-tooltip>
        <v-tooltip
          location="bottom"
          v-if="
            TransactionDetails.transaction_type !== 'REVERSAL' &&
            !TransactionDetails.reversed &&
            reversetransactioncard == false &&
            settleInvoice == false &&
            amountSetteled == false &&
            recentrevesed == true
          "
        >
          <template v-slot:activator="{ props }">
            <v-icon
              class="icon-class mr-2"
              color="primary"
              v-bind="props"
              @click="reverse_transaction()"
            >
              mdi-arrow-u-left-top
            </v-icon>
          </template>
          <span>Reverse Transaction</span>
        </v-tooltip>
        <v-icon class="icon-class" @click="close_dialog()"
          >mdi-step-backward</v-icon
        >
      </v-toolbar>
      <v-card-text
        v-if="reversetransactioncard == false && settleInvoice == false"
      >
        <v-responsive :height="contentHeight" class="overflow-auto">
          <span
            v-if="
              TransactionDetails.transaction_type === 'REVERSAL' &&
              TransactionDetails.reversed
            "
            style="color: black"
          >
            <b>Transaction Reversed</b>
          </span>
          <v-sheet variant="outlined" class="pa-3 mt-2">
            <div class="d-flex justify-space-between align-center">
              <span class="text-left font-weight-medium">{{
                itemValue.customer.customer_name
              }}</span>
              <span
                :style="{
                  color:
                    TransactionDetails.bill_settling_type === 'PAID'
                      ? 'red'
                      : 'green',
                }"
                class="font-weight-medium"
              >
                ₹ {{ TransactionDetails.amount_paid }}
              </span>
            </div>
            <div class="d-flex justify-space-between align-center mt-2">
              <span class="text-left font-weight-small">Invoice/Bill No.</span>
              <span class="font-weight-small">
                {{ TransactionDetails?.invoice_number || "#-" }}
              </span>
            </div>
          </v-sheet>

          <v-sheet variant="outlined" class="pa-3 mt-2">
            <div class="">
              <span class="text-left text-h8">Entry Created By</span>
              <br />
              <span class="font-weight-medium">
                {{ customerData[0].user_email_id }}
                <!-- {{ itemValue.customer.customer_name }} -->
              </span>
            </div>
          </v-sheet>
          <v-sheet variant="outlined" class="pa-3 mt-2">
            <div class="">
              <span class="text-left text-h8">Transaction Date</span>
              <br />
              <span class="font-weight-medium">
                {{ updatedate(customerData[0].transaction_date || "-") }}
              </span>
            </div>
          </v-sheet>
          <v-sheet variant="outlined" class="pa-3 mt-2">
            <div class="">
              <span class="text-left text-h8">Entry Created Date</span>
              <br />
              <span class="font-weight-medium">
                {{ formatTimestamp(TransactionDetails.transaction_timestamp) }},
                {{ updatedate(TransactionDetails.transaction_date) }}
              </span>
            </div>
          </v-sheet>
          <v-sheet variant="outlined" class="pa-3 mt-2">
            <div class="">
              <span class="text-left text-h8">Comment</span>
              <br />
              <span class="font-weight-medium">
                {{ TransactionDetails.comments ?? "-" }}
              </span>
            </div>
          </v-sheet>
          <v-sheet
            variant="outlined"
            class="pa-3 mt-2"
            v-if="
              TransactionDetails.transaction_type !== 'REVERSAL' &&
              !TransactionDetails.reversed
            "
          >
            <div>
              <span class="text-left text-h8">Attachments</span>
              <br />
              <template
                v-if="
                  TransactionDetails.attachments &&
                  TransactionDetails.attachments.length &&
                  TransactionDetails.attachments.some(
                    (a) => a && a.trim() !== ''
                  )
                "
              >
                <div
                  v-for="(attachment, index) in TransactionDetails.attachments"
                  :key="index"
                  class="mt-2"
                >
                  <!-- Check if it's an image -->
                  <v-img
                    v-if="isImage(attachment)"
                    :src="attachment"
                    max-width="200"
                    max-height="200"
                    contain
                  />

                  <!-- Otherwise assume it's a PDF -->
                  <iframe
                  v-else
                    :src="attachment"
                    width="100%"
                    height="500"
                    style="border: 1px solid #ccc"
                  ></iframe>
                </div>
              </template>
              <span v-else class="font-weight-medium">No Attachments</span>
            </div>
          </v-sheet>
          <v-sheet variant="outlined" class="pa-3 mt-2" v-if=" TransactionDetails.transaction_type == 'INVOICE_PAYMENT'">
            <div class="">
              <span class="text-left text-h8">Transaction History</span>
              <br />
              <span class="font-weight-medium">
                <ul>
                  <li
                    v-for="(transaction, index) in invoiceTransaction"
                    :key="index"
                  >
                    <strong>Date:</strong> {{ transaction.transaction_date }} |
                    <strong>Amount:</strong> ₹{{ transaction.amount_paid }}
                  </li>
                </ul>
              </span>
            </div>
          </v-sheet>
        </v-responsive>
      </v-card-text>
      <v-card-text v-if="reversetransactioncard == true">
        <v-card-title class="mt-n4" style="color: black">
          Reverse Transaction
        </v-card-title>
        <v-card-subtitle style="color: black">
          <span class="text-left font-weight-medium">{{
            itemValue.customer.customer_name
          }}</span>
        </v-card-subtitle>
        <v-card-text class="mt-n2">
          <span
            :style="{
              color:
                TransactionDetails.bill_settling_type === 'PAID'
                  ? 'red'
                  : 'green',
            }"
            class="font-weight-medium"
          >
            ₹ {{ TransactionDetails.amount_paid }}
          </span>
          <br />
          <span style="color: black" class="mt-2">
            Are you sure you want to proceed? Once completed, this action
            cannont be undone.
          </span>
          <br />
          <v-form ref="form">
            <v-textarea
              variant="outlined"
              label="Reason"
              density="compact"
              rows="1"
              auto-grow
              class="mt-2"
              v-model="reason_reverse"
              :rules="[(v) => !!v || 'Required']"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="mt-n8"
            block
            density="compact"
            color="secondaryColor"
            style="color: white"
            :loading="loading"
            @click="validate_form()"
          >
            Reverse Transaction
          </v-btn>
        </v-card-actions>
      </v-card-text>
      <v-card-text v-if="settleInvoice == true">
        <v-form ref="form1">
          <span v-if="Give_Got_Type === 'You_Gave'">
            <b
              >You Gave {{ TransactionDetails.customer_name }} ₹
              {{ amount || 0 }}
            </b>
          </span>
          <span v-else-if="Give_Got_Type === 'You_Got'">
            <b>
              {{ TransactionDetails.customer_name }} Gave you ₹
              {{ amount || 0 }}</b
            >
          </span>
          <v-row>
            <v-col cols="12" sm="6" class="mt-2">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Amount"
                v-model="amount"
                prepend-inner-icon="mdi-currency-rupee"
                :rules="[rules.required, rules.positiveNumber]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="mt-2">
              <v-text-field
                label="Choose Date"
                v-model="computedDateDisplay"
                variant="outlined"
                density="compact"
                @click="datePicker = true"
                readonly
                append-inner-icon="mdi-calendar"
                persistent-hint
                class="mr-2"
                style="min-width: 180px; max-width: 200px"
                :rules="[rules.required]"
              >
                <v-dialog v-model="datePicker" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempDate"
                      :max="new Date().toISOString().substr(0, 10)"
                      color="#DB4C77"
                      class="primaryColor"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn variant="text" color="primaryColor" @click="datePicker = false">
                        Cancel
                      </v-btn>
                      <v-btn variant="text" color="primaryColor" @click="saveDate">
                        OK
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <v-text-field
                variant="outlined"
                v-model="invoiceNo"
                density="compact"
                readonly
                label="Invoice/Bill No."
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <v-text-field
                variant="outlined"
                density="compact"
                v-model="comments"
                label="Comments"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n8">
              <span><b>Attachments:</b></span>

              <!-- Show card only if imageCheck is true -->
              <template v-if="imageCheck">
                <!-- Card for images only -->
                <v-card
                  v-if="!isPdf(imageUrl)"
                  variant="outlined"
                  class="attachment-card d-flex align-center justify-center"
                  @click="triggerFileInput"
                >
                  <!-- Show plus icon if there's no image -->
                  <v-icon v-if="!imageUrl" size="40">mdi-plus</v-icon>

                  <!-- Image preview -->
                  <v-img v-else :src="imageUrl" class="uploaded-image"></v-img>

                  <!-- Delete icon for image -->
                  <v-icon
                    v-if="imageUrl"
                    class="delete-icon"
                    size="small"
                    @click.stop="removeImage"
                  >
                    mdi-delete
                  </v-icon>
                </v-card>

                <!-- PDF Preview shown outside the card -->
                <div v-else class="pdf-preview-wrapper">
                  <iframe
                    :src="pdfDataUrl(imageUrl)"
                    type="application/pdf"
                    class="pdf-frame"
                  ></iframe>
                  <v-icon class="delete-icon" size="small" @click.stop="removeImage">
                    mdi-delete
                  </v-icon>
                </div>
              </template>

              <input
                type="file"
                ref="fileInput"
                accept="image/*,.pdf"
                hidden
                @change="uploadImage"
              />
            </v-col>
          </v-row>
        </v-form>
        <v-card-actions class="justify-end">
          <v-btn
            color="red"
            class="mr-2 mt-n7"
            style="color: white"
            :loading="loading"
            @click="processAndSave()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import { initiate_customer_transaction } from "@/graphql/mutations.js";
import { format_Date, formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { reverse_customer_transaction } from "@/graphql/mutations.js";
import { list_transactions_of_invoice } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { Auth } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  props: {
    itemValue: Object,
    TransactionDetails: Object,
    customerData: Array,
  },

  data() {
    return {
      minDate: new Date().toISOString().substr(0, 10),
      date: new Date().toISOString().substr(0, 10),
      datePicker: false,
      tempDate: null,
      computedDateFormatted: this.formatDate(new Date()),
      menu: false,
      reversetransactioncard: false,
      amountSetteled: false,
      recentrevesed: true,
      reason_reverse: "",
      invoiceTransaction: [],
      amount: "",
      invoiceNo: "",
      comments: "",
      imageUrl: "",
      imageCheck: true,
      settleInvoice: false,
      s3ImageUrl: "",
      selectedFile: null,
      Give_Got_Type: "You_Gave",
      loading: false,
      contentHeight: 0,
      SnackBarComponent: {},
      rules: {
        required: (value) => !!value || "This field is required",
        positiveNumber: (value) =>
          (value && parseFloat(value) > 0) || "Amount must be greater than 0",
      },
    };
  },
  mounted() {
    this.contentHeight = window.innerHeight - 200;
    this.listingTransation();
  },
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
  },
  methods: {
    settlePayment() {
      this.settleInvoice = true;
      this.amount = this.TransactionDetails.pending_amount;
      this.invoiceNo = this.TransactionDetails.invoice_number;
    },
    isPdf(dataUrl) {
      return dataUrl.startsWith("data:application/pdf");
    },
    pdfDataUrl(base64) {
      // For safety: if already a full data URL, return as-is
      if (base64.startsWith("data:application/pdf")) return base64;
      return `data:application/pdf;base64,${base64}`;
    },
    uploadImage(event) {
      const file = event.target.files[0];
      if (
        file &&
        (file.type.startsWith("image/") || file.type === "application/pdf")
      ) {
        this.selectedFile = file;
        const reader = new FileReader();

        reader.onload = (e) => {
          this.imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // alert("Please upload a valid image file.");
      }
    },
    removeImage() {
      this.imageUrl = "";
      this.selectedFile = null;
    },

    async upload_new_func() {
      if (!this.selectedFile) return;
      await Auth.currentCredentials();
      const orgDetails1 = this.$store.getters.GetOrgDetails;

      const s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };
      // const userId = this.$store.getters.GetUserObj.user.user_id;

      const key = `workflow/${orgDetails1.organization.organization_id}-${
        this.itemValue.customer.customer_id
      }/${Date.now()}-${this.selectedFile.name.split(" ").join("")}`;
      try {
        const fileUrl = await uploadToS3(this.selectedFile, s3_details, key);
        if (fileUrl) {
          // console.log("✅ Uploaded file URL:", fileUrl);
          return fileUrl;
        }
      } catch (err) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Upload failed. ",
          timeout: 5000,
          Top: true,
        };

        this.loading = false;
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    isImage(url) {
      return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);
    },
    close_dialog() {
      if (this.reversetransactioncard) {
        this.reversetransactioncard = false;
      } else if (this.settleInvoice) {
        this.settleInvoice = false;
      } else {
        this.$emit("clicked", 0);
      }
    },

    formatTimestamp(unixTimestamp) {
      if (!unixTimestamp) return "";

      const date = new Date(unixTimestamp * 1000);
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    },
    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return format_Date(date);
      }
    },
    updatedate(date) {
      if (date != "" && date != undefined) {
        return formatdisplayDate(date);
      }
    },

    reverse_transaction() {
      this.reversetransactioncard = true;
    },
    async validate_form() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.confirm_ReverseTransaction();
      }
    },
    async processAndSave() {
      const validation = await this.$refs.form1.validate(); // Validate form before saving
    
      
      if (!validation.valid) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please fill all required fields correctly.",
          timeout: 5000,
          Top: true,
        };

        return;
      }
      if (
        Number(this.amount) > Number(this.TransactionDetails.pending_amount)
      ) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "The amount exceeds the billing amount",
          timeout: 5000,
          Top: true,
        };

        return;
      }

      this.loading = true;
      try {
        this.s3ImageUrl = this.selectedFile ? await this.upload_new_func() : "";
        // console.log(this.s3ImageUrl)
        await this.saveData();
      } catch (error) {
        console.error("Error in processAndSave:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error uploading image or saving data.",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.loading = false;
      }
    },
    async listingTransation() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_transactions_of_invoice, {
            input: {
              invoice_id: this.TransactionDetails.invoice_id,
            },
          })
        );
        let response = JSON.parse(result.data.list_transactions_of_invoice);
        if (response.Status === "SUCCESS") {
          this.invoiceTransaction = response.data;
          this.reversetransactioncard = false;
          this.settleInvoice = false;

          const mostRecentTransaction = this.invoiceTransaction.reduce(
            (latest, current) => {
              return current.transaction_timestamp >
                latest.transaction_timestamp
                ? current
                : latest;
            }
          );
          // console.log(mostRecentTransaction);
          if (
            mostRecentTransaction.amount_paid ==
            this.TransactionDetails.amount_paid
          ) {
            this.recentrevesed = true;
          } else {
            this.recentrevesed = false;
          }
          if (this.invoiceTransaction[0].pending_amount == 0) {
            this.amountSetteled = true;
          }
        } else {
          this.recentrevesed = true;
          this.invoiceTransaction = [];
        }
      } catch (error) {
        this.recentrevesed = true;
        this.invoiceTransaction = [];
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0]?.message || "Error saving data.",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async saveData(fileUrl) {
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_customer_transaction, {
            input: {
              customer_id: this.itemValue.customer.customer_id,
              invoice_number: this.invoiceNo,
              amount: this.amount,
              comments: this.comments,
              transaction_date: this.date,
              attachments: this.s3ImageUrl,
              bill_settling_type:
                this.Give_Got_Type === "You_Gave" ? "PAID" : "RECEIVED",
            },
          })
        );
        let response = JSON.parse(result.data.initiate_customer_transaction);
        if (response.Status === "SUCCESS") {
          this.loading = false;
          this.reversetransactioncard = false;
          this.settleInvoice = false;
          this.listingTransation();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0]?.message || "Error saving data.",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async confirm_ReverseTransaction() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(reverse_customer_transaction, {
            input: {
              transaction_id: this.TransactionDetails.transaction_id,
              comments: this.reason_reverse,
              attachments:
                this.TransactionDetails.attachments.length === 1 &&
                this.TransactionDetails.attachments[0] === ""
                  ? ""
                  : this.TransactionDetails.attachments,
              transaction_date: this.TransactionDetails.transaction_date,
              user_email_id: this.TransactionDetails.user_email_id,
            },
          })
        );
        this.loading = false;
        let response = JSON.parse(result.data.reverse_customer_transaction);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.reversetransactioncard = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.loading = false;
          this.reversetransactioncard = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.customerLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    saveDate() {
      this.date = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;
    },
  },
};
</script>

<style scoped>
.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.scrollable-content::-webkit-scrollbar {
  width: 2px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
.attachment-card {
  width: 100px;
  height: 100px;
  cursor: pointer;
  position: relative;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  color: red;
}
.pdf-preview-wrapper {
  position: relative;
  margin-top: 16px;
}

.pdf-frame {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.delete-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}
</style>
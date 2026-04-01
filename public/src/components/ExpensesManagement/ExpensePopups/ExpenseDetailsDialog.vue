<template>
  <div>
    <v-dialog
      :model-value="expenseDetailsDialog"
      @update:model-value="$emit('update:expenseDetailsDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Expense Details
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="closeDialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form1">
            <v-row
              v-for="(n, idx) in formTemplate"
              :key="idx"
              no-gutters
              class="mt-2"
            >
              <v-col cols="12" v-if="n.data_type == 'label'">
                <div class="text-left font-weight-bold">
                  {{ n.display_label }}
                </div>
              </v-col>
              <v-col cols="12" v-else>
                <v-row>
                  <v-col class="" cols="5">
                    <div
                      v-if="n.display_label != 'Attachment Media'"
                      class="text-left font-weight-bold"
                    >
                      {{ n.display_label }}
                    </div>
                  </v-col>
                  <v-col
                    v-show="
                      n.key !== 'prfl_pic_s3_key' && n.key !== 'media_keys'
                    "
                    cols="7"
                  >
                    <div class="text-left" v-if="n.data_type == 'media'">
                      <div v-show="n.respectiveValue == 'N/A'">
                        <b>
                          {{
                            n.key == "epoch"
                              ? ":" + " " + fetch_time(n.respectiveValue)
                              : ":" + " " + n.respectiveValue
                          }}</b
                        >
                      </div>
                      <div>
                        <v-tooltip bottom>
                          <template #activator="{ on }">
                            <div
                              v-show="
                                n.respectiveValue != 'N/A' &&
                                n.respectiveValue != ''
                              "
                              v-on="on"
                            >
                              <b
                                >:
                                {{
                                  +n.respectiveValue
                                    .split("/")
                                    .pop()
                                    .split("?")[0].length >= 20
                                    ? n.respectiveValue
                                        .split("/")
                                        .pop()
                                        .split("?")[0]
                                        .substr(0, 20) + "..."
                                    : n.respectiveValue
                                        .split("/")
                                        .pop()
                                        .split("?")[0]
                                }}
                              </b>
                              <v-icon
                                v-show="
                                  n.respectiveValue != 'N/A' &&
                                  n.respectiveValue != ''
                                "
                                color="primaryColor"
                                class="ml-1"
                                @click="downloadlist(n)"
                              >
                                mdi-download</v-icon
                              >
                            </div>
                            <div v-show="n.respectiveValue == ''">
                              <b>: {{ "N/A" }}</b>
                            </div>
                          </template>
                          <div class="textWrap" style="max-width: 250px">
                            {{
                              n.respectiveValue.split("/").pop().split("?")[0]
                            }}
                          </div>
                        </v-tooltip>
                      </div>
                    </div>
                    <div v-if="n.data_type == 'gallery'">
                      <b> : </b>
                      <v-carousel
                        v-model="model1"
                        height="auto"
                        hide-delimiters
                        :show-arrows="false"
                        v-if="n.input_array_value.length == 1"
                      >
                        <v-carousel-item
                          v-for="images1 in imageregularUrl"
                          :key="images1"
                        >
                          <v-img
                            height="150"
                            :src="images1"
                            contain
                          ></v-img>
                        </v-carousel-item>
                      </v-carousel>
                      <v-carousel
                        v-model="model2"
                        height="auto"
                        hide-delimiters
                        v-else
                      >
                        <v-carousel-item
                          v-for="images1 in imageregularUrl"
                          :key="images1"
                        >
                          <v-img
                            height="150"
                            :src="images1"
                            contain
                          ></v-img>
                        </v-carousel-item>
                      </v-carousel>
                    </div>
                    <div
                      v-else-if="
                        n.data_type == 'url' || n.data_type == 'youtube'
                      "
                    >
                      <b>
                        : <a :href="n.respectiveValue"  target="_blank">{{ n.respectiveValue }}</a>
                      </b>
                    </div>
                    <div
                      class="text-left pre-line-style"
                      v-else-if="n.data_type != 'gallery' && n.data_type != 'media'"
                    >
                      <b v-if="n.data_type == 'epoch'">: {{ fetch_time(n.respectiveValue*1000) }}</b>
                      <b v-else> : <span v-html="formatText(n.respectiveValue)"></span></b>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
const FileSaver = require("file-saver");
import axios from "axios";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";

export default {
  name: "ExpenseDetailsDialog",
  data() {
    return {
      formTemplate: [],
      imageregularUrl: [],
      workflowPayloadInfo: {},
      directoryFormArray: [],
      model2: false,
      model1: false,
    };
  },
  props: {
    expenseDetailsDialog: {
      type: Boolean,
      default: false,
    },
    expenseData: {
      type: Object,
      default: null,
    },
  },
  watch: {
    expenseDetailsDialog: {
      async handler() {
        if (this.expenseDetailsDialog == true && this.expenseData) {
          this.workflowPayloadInfo = {};
          this.formTemplate = [];
          await this.fetch_expense_data();
        }
      },
      immediate: true,
    },
  },
  emits: ["update:expenseDetailsDialog", "edit-expense", "view-document", "download-document"],
  methods: {
    closeDialog() {
      this.$emit("update:expenseDetailsDialog", false);
    },

    formatText(text) {
      if (!text) return "";
      return text.replace(/\n/g, "<br>");
    },

    async fetch_expense_data() {
      var array = [];
      this.formTemplate = [];
      this.imageregularUrl = [];
      
      // Use the template structure from approval_user_list
      array = [
        {
          "is_editable": true,
          "section": null,
          "input_value": "list_users",
          "display_label": "Member Name",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": "full_user_name",
          "input_array_value": null,
          "display_weightage": 100,
          "is_required": true,
          "data_type": "single_choice",
          "value": "user_id",
          "key": "user_id"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": "expense_details",
          "display_label": "Select Expense Category",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": "expense_name",
          "input_array_value": null,
          "display_weightage": 200,
          "is_required": true,
          "data_type": "single_choice",
          "value": "category_id",
          "key": "category_id"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": null,
          "display_label": "Bill Date",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 300,
          "is_required": false,
          "data_type": "date",
          "value": null,
          "key": "bill_date"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": null,
          "display_label": "Bill Number",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 300,
          "is_required": false,
          "data_type": "string",
          "value": null,
          "key": "bill_no"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": null,
          "display_label": "Amount",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 300,
          "is_required": false,
          "data_type": "number",
          "value": null,
          "key": "amount"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": null,
          "display_label": "Expense Description",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 900,
          "is_required": false,
          "data_type": "string",
          "value": null,
          "key": "expense_description"
        },
        {
          "display_label": "Attachment Media",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 200,
          "is_required": false,
          "data_type": "media",
          "is_editable": true,
          "section": null,
          "value": null,
          "key": "media_keys"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": "list_expense_group",
          "display_label": "Expense Group Name",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": "expense_group_name",
          "input_array_value": null,
          "display_weightage": 300,
          "is_required": false,
          "data_type": "single_choice",
          "value": "expense_group_id",
          "key": "expense_group_id"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": "list_organization_projects",
          "display_label": "Expense Project Name",
          "is_displayed": false,
          "is_readonly": false,
          "value_label": "project_name",
          "input_array_value": null,
          "display_weightage": 300,
          "is_required": false,
          "data_type": "single_choice",
          "value": "project_id",
          "key": "project_id"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": null,
          "display_label": "Amount transfer Mode",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": "type",
          "input_array_value": [
            {
              "type": "CASH",
              "id": 1
            },
            {
              "type": "BANK",
              "id": 2
            },
            {
              "type": "CHEQUE",
              "id": 3
            }
          ],
          "display_weightage": 290,
          "is_required": false,
          "data_type": "single_choice",
          "value": "type",
          "key": "amount_type"
        },
        {
          "is_editable": true,
          "section": null,
          "input_value": null,
          "display_label": "Select Expense Type",
          "is_displayed": true,
          "is_readonly": false,
          "value_label": "type",
          "input_array_value": [
            {
              "type": "GROUP",
              "id": 1
            },
            {
              "type": "PROJECT",
              "id": 2
            }
          ],
          "display_weightage": 290,
          "is_required": false,
          "data_type": "single_choice",
          "value": "type",
          "key": "expense_type"
        },
        {
          "is_editable": false,
          "section": null,
          "input_value": null,
          "display_label": "Transaction Status",
          "is_displayed": true,
          "is_readonly": true,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 1000,
          "is_required": false,
          "data_type": "string",
          "value": null,
          "key": "transaction_status"
        },
        {
          "is_editable": false,
          "section": null,
          "input_value": null,
          "display_label": "Created On",
          "is_displayed": true,
          "is_readonly": true,
          "value_label": null,
          "input_array_value": null,
          "display_weightage": 1100,
          "is_required": false,
          "data_type": "epoch",
          "value": null,
          "key": "transaction_created_on"
        }
      ];

      array.map((obj) => ({ ...obj, respectiveValue: "" }));
      
      // Map expense data to template
      // console.log(this.expenseData);
      const expenseDataMap = {
        user_id: this.expenseData.user_name || this.expenseData.user_email_id || "N/A",
        category_id: this.expenseData.category_id_text || "N/A",
        bill_date: this.expenseData.bill_date || "N/A",
        bill_no: this.expenseData.bill_no || "N/A",
        amount: this.expenseData.amount || "N/A",
        expense_description: this.expenseData.expense_description || this.expenseData.description || "N/A",
        media_keys: this.expenseData.media_keys || "N/A",
        expense_group_id: this.expenseData.expense_group_id_text || "N/A",
        project_id: this.expenseData.project_name || "N/A",
        amount_type: this.expenseData.amount_type || "N/A",
        expense_type: this.expenseData.expense_type || "N/A",
        transaction_status: this.expenseData.transaction_status || "N/A",
        transaction_created_on: this.expenseData.transaction_created_on ? this.expenseData.transaction_created_on : "N/A"
      };

      for (var i = 0; i < array.length; i++) {
        for (let data in expenseDataMap) {
          if (array[i].key == `${data}`) {
            array[i].respectiveValue = `${expenseDataMap[data]}`;
          }
        }
      }
      
      const replacedArray = array.map((obj) => ({
        ...obj,
        respectiveValue:
          obj.respectiveValue !== undefined ? obj.respectiveValue : "N/A",
      }));
      
      const details = this.$store.getters.GetOrgDetails;
      const updatedData = await Promise.all(
        replacedArray.map(async (row) => {
          if (row.data_type === "media") {
            const rawUrl = row.respectiveValue;
            if (rawUrl && rawUrl !== "N/A") {
              const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
              return {
                ...row,
                signedUrl,
              };
            }
            return {
              ...row,
              signedUrl: null,
            };
          }
          if (row.data_type === "gallery") {
            const details = this.$store.getters.GetOrgDetails;
            if (row.input_array_value && row.input_array_value.length != 0) {
              for (let i = 0; i < row.input_array_value.length; i++) {
                const urlupdate = await getS3SignedUrl(
                  row.input_array_value[i].type,
                  details.s3_details
                );
                this.imageregularUrl.push(urlupdate);
              }
            }
            return {
              ...row,
              signedUrl: null,
            };
          }

          return {
            ...row,
            signedUrl: null,
          };
        })
      );
      
      this.formTemplate = updatedData;
      this.formTemplate = this.formTemplate.filter(
        (obj) => obj.is_displayed == true
      );
    },

    fetch_time(val) {
      if (!val || val === "N/A") return "N/A";
      const d = new Date(parseInt(val));
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

    async downloadlist(url) {
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(url.respectiveValue, details.s3_details);
      this.dwonload_pdf(
        signedUrl,
        `${signedUrl.split("/").pop().split("?")[0]}`
      );
    },

    async dwonload_pdf(url, fileName) {
      axios({
        url: url,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
  },
};
</script>

<style scoped>
.textWrap {
  word-wrap: break-word;
  white-space: normal;
}

.pre-line-style {
  white-space: pre-line;
}
</style> 
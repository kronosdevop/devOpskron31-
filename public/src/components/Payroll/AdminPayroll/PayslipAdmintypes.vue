<template>
  <div>
    <v-card flat >
    <OverlayComp :overlay="overlay" />
    <!-- <v-card-title>Payroll Administration</v-card-title> -->
    <v-toolbar class="" flat >
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="payslipadd">
            PaySlip
          </v-btn>
          <v-btn small class="black--text" text value="payconfiguration">
            Configuration
          </v-btn>
          <v-btn small class="black--text" text value="paytemplate">
            Template
          </v-btn>
        </v-btn-toggle>
      <v-spacer />

      <v-menu bottom right small :close-on-click="true">
        <template #activator="{ on, attrs }">
          <v-btn
            v-on="on"
            dark
            v-bind="attrs"
            color="text-capitalize cardCss  "
            class="mt- mr-0 pl-5"
            v-show="toggle_exclusive == 'payslipadd'"
          >
            Actions
            <v-icon color="dark_primary " class="px-2">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-hover>
          <v-list class="py-0" dense width="130px" height="80">
            <v-list-item class="py-1 my-0 px-1 mb-n2">
              <v-icon color="pink">mdi-download</v-icon>
              <v-list-item-title @click="download_invoice()" class="ml-4"
                ><span class="black--text" ml-10
                  >Template</span
                ></v-list-item-title
              >
            </v-list-item>

            <v-list-item class="py-0 my-0 px-1">
              <v-icon color="pink">mdi-upload</v-icon>

              <UploadPayroll
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
              />
            </v-list-item>
          </v-list>
        </v-hover>
      </v-menu>
    </v-toolbar>
  </v-card>
    <div class="text-left" v-if="toggle_exclusive == 'payslipadd'">
      <v-card flat :height="cardHeight" class="overflow-auto" >
      <PayslipList :key="adminpaykey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'paytemplate'">
      <v-card flat :height="cardHeight" class="overflow-auto" >
      <PayslipTemplate />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'payconfiguration'">
      <v-card flat :height="cardHeight" class="overflow-auto" >
      <PayslipSetting />
      </v-card>
    </div>

    <div v-if="componentCheck == 1">
      <ExcelUploadpayslip
        :payslipExceldailog="payslipExceldailog"
        @clicked="payslipExceldailog = false"
        :excelHeaders="excelHeaders"
        :excelTableData="excelTableData"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:payupdating="payrefresh"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
                
        <script>
const FileSaver = require("file-saver");
import axios from "axios";
import PayslipTemplate from "@/components/Payroll/AdminPayroll/PayslipTemplate.vue";
import { get_payslip_template } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import UploadPayroll from "@/components/UploadPayroll/IndexList.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import ExcelUploadpayslip from "@/components/Payroll/PayrollPopus/ExcelUploadpayslip.vue";
import PayslipList from "@/components/Payroll/AdminPayroll/PayslipList.vue";
import PayslipSetting from "@/components/Payroll/AdminPayroll/PayslipSetting.vue";
export default {
  mixins: [get_current_details],
  components: {
    ExcelUploadpayslip,
    UploadPayroll,
    PayslipList,
    SnackBar,
    OverlayComp,
    PayslipSetting,
    PayslipTemplate,
  },
  data: () => ({
    toggle_exclusive: "payslipadd",
    payslipExceldailog: false,
    componentCheck: 0,
    excelTableData: [],
    excelHeaders: [],
    overlay: false,
    adminpaykey: 0,
    SnackBarComponent: {},
    urlpay: "",
    cardHeight: 0,
  }),
  async mounted() {
    this.overlay = true;
    await this.get_current_details();
    await this.download_template();
    this.overlay = false;
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    back_call() {
      this.$router.push("/AdminLevelApps");
    },
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
      this.payslipExceldailog = false;
    },
    handleSuccess({ results, header }) {
      this.excelTableData = results;
      this.excelHeaders = header;
      this.componentCheck = 1;
      this.payslipExceldailog = true;
    },
    payrefresh() {
      this.adminpaykey += 1;
    },

    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.$message({
        message: "Please do not upload files larger than 1m in size.",
        type: "warning",
      });
      return false;
    },

    async download_template() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_payslip_template, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_payslip_template);

        if (response.Status == "SUCCESS") {
          this.urlpay = response.data.getTemplate;
        }
      } catch (error) {
        this.tableData = [];
        this.tableLoading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async download_invoice() {
      let firstName = this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileName = firstName ? firstName + "_" + "PaySlip" + ".xlsx" :  "_" + "PaySlip" + ".xlsx";
      axios({
        url: this.urlpay,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
  },
};
</script>
                
        <style>
</style>
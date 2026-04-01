<template>
  <div>
    <v-card flat class="" >
      <v-row no-gutters>
        <v-col cols="12" sm="6">
          <v-card flat class="ma-2" >
            <v-card-text>
              <v-toolbar density="compact" flat class="bg-white">
                <v-row>
                  <v-col cols="12" sm="6">
                    <span>
                      Total Purchase : {{ totalPurchase }}
                      <v-icon color="blue">mdi-arrow-u-down-left</v-icon>
                    </span>
                  </v-col>
                  <v-col cols="12" sm="1">
                    <v-divider vertical></v-divider>
                  </v-col>
                  <v-col cols="12" sm="5">
                    <span>
                      You will Give : {{ totalPayable }}
                      <v-icon color="green">mdi-arrow-bottom-left</v-icon>
                    </span>
                  </v-col>
                </v-row>
              </v-toolbar>
              <v-divider></v-divider>
              <v-toolbar density="compact" flat class="bg-white">
                <v-text-field
                  class=" mt-6"
                  label="Search"
                  density="compact"
                  variant="outlined"
                  style="max-width: 200px"
                  v-model="searchlist"
                  append-inner-icon="mdi-magnify"
                ></v-text-field>
              </v-toolbar>
              <v-responsive :height="supplierHeight" class="overflow-auto">
                <v-list>
                  <v-list-item
                    v-for="(item, index) in filteredSuppliers"
                    :key="index"
                    class="mb-2"
                    @click="ViewSupplierDetails(item)"
                    :style="{
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                      borderRadius: '8px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      backgroundColor:
                        supplierData === item ? '#E0F7FA' : 'white', // sky blue background
                    }"
                  >
                    <template v-slot:prepend>
                      <v-avatar
                        size="48"
                        :style="{
                          backgroundColor: getLightTransparentColor(index),
                          color: '#333',
                        }"
                        class="elevation-1"
                      >
                        <span class="text-h6 text-uppercase">
                          {{ item.supplier.supplier_name?.charAt(0) || "?" }}
                        </span>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-bold">
                      {{ item.supplier.supplier_name || "No Name" }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2">
                      {{ item.supplier.supplier_name || "-" }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <div class="text-right mr-4">
                        <div
                          :style="{
                            color:
                              item.TransactionSummary.currentBalance < 0
                                ? 'red'
                                : item.TransactionSummary.currentBalance > 0
                                ? 'green'
                                : 'black',
                          }"
                          class="font-weight-bold"
                        >
                          ₹ {{ Math.abs(item.TransactionSummary.currentBalance) }}
                        </div>
                        <div class="text-caption">Total Transaction</div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-responsive>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          sm="6"
          v-if="
            SuplierData &&
            Object.keys(SuplierData).length &&
            SuplierData.supplier
          "
        >
          <v-card class="pa-2"  flat>
            <SuplierTransaction
              :key="SuplierData?.supplier?.supplierr_id || indexKey"
              :SuplierDetails="SuplierDetails"
              @clicked="closeDialog"
              :SuplierData="SuplierData"
              v-on:errorMsg="error_info"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { list_all_suppliers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SuplierTransaction from "./popups/SuplierTransaction.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";

export default {
  components: {
    SnackBar,
    SuplierTransaction,
  },
  data() {
    return {
      searchlist: "",
      fixed: true,
      supplierLoading: false,
      supplierData: [],
      next_token: null,
      componentCheck: 0,
      supplierHeight: 0,
      SuplierDetails: false,
      giveGotTransaction: false,
      SuplierData: {},
      SnackBarComponent: {},
      totalPayable: "",
      totalPurchase: "",
      purchase_payment_Type: "",
      indexKey: 0,
    };
  },

  async mounted() {
    this.supplierHeight = window.innerHeight - 260;
    await this.fetch_supliers();
  },
  computed: {
    filteredSuppliers() {
      if (!this.searchlist) {
        return this.supplierData;
      }
      return this.supplierData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.searchlist.toLowerCase())
        )
      );
    },
  },

  methods: {
    ViewSupplierDetails(item) {
      this.SuplierData = {}; // reset first if needed
      this.indexKey += 1; // force re-render
      this.SuplierData = item;
      this.SuplierDetails = true;
      this.fetch_supliers();
    },
    getLightTransparentColor(index) {
      const colors = [
        "rgba(244, 67, 54, 0.2)",
        "rgba(233, 30, 99, 0.2)",
        "rgba(156, 39, 176, 0.2)",
        "rgba(63, 81, 181, 0.2)",
        "rgba(33, 150, 243, 0.2)",
        "rgba(0, 188, 212, 0.2)",
        "rgba(76, 175, 80, 0.2)",
        "rgba(255, 235, 59, 0.2)",
        "rgba(255, 152, 0, 0.2)",
        "rgba(121, 85, 72, 0.2)",
      ];
      return colors[index % colors.length];
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
      this.supplierData = [];
      this.giveGotTransaction = false;
      this.next_token = null;
      this.fetch_supliers();
    },
    open_yougot(item) {
      this.SuplierDetails = item;
      this.purchase_payment_Type = "payment_type";
      this.componentCheck = 2;
      this.giveGotTransaction = true;
    },
    open_yougave(item) {
      this.SuplierDetails = item;
      this.purchase_payment_Type = "purchase_type";
      this.componentCheck = 2;
      this.giveGotTransaction = true;
    },
    closeDialog() {
      this.SuplierDetails = false;
      this.fetch_supliers();
    },

    handleClick(item) {
      this.componentCheck = 1;
      this.SuplierDetails = true;
      this.SuplierData = item;
    },
    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return format_Date(date);
      }
    },
    async fetch_supliers() {
      this.supplierLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_suppliers, {
            input: {
              nextToken: this.next_token,
              limit: 100,
            },
          })
        );
        this.supplierLoading = false;
        let response = JSON.parse(result.data.list_all_suppliers);
        if (response.Status == "SUCCESS") {
          this.supplierData = response.data;
          // console.log("response",this.supplierData)
          this.totalPayable = response.totalPayable;
          this.totalPurchase = response.totalCumulativePurchased;
          this.next_token = response.nextTokenResponse;
        } else {
          this.supplierData = [];
          this.totalPayable = 0;
          this.next_token = null;
        }
      } catch (error) {
        this.supplierLoading = false;
        this.supplierData = [];
        this.next_token = null;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style>
</style>
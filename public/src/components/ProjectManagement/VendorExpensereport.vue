<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-toolbar flat  class="pt-2">
          <!-- <v-menu
            ref="menu"
            v-model="monthdailog"
            :close-on-content-click="false"
            :return-value.sync="date"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date1"
                label="Select a Month"
                readonly
                dense
                v-bind="attrs"
                style="max-width: 200px"
                class=""
                outlined
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              :max="new Date().toISOString().substr(0, 10)"
              v-model="date"
              type="month"
              no-title
              color="primaryColor white--text"
              scrollable
            >
              <v-spacer></v-spacer>
              <v-btn text color="primaryColor" @click="monthdailog = false">
                Cancel
              </v-btn>
              <v-btn
                text
                color="primaryColor"
                @click="$refs.menu.save(date)"
                v-on:click="get_next()"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-menu> -->
          <v-spacer />
        </v-toolbar>
        <v-row>
          <v-col cols="6">
            <span class="font-weight-bold">
              By Vendor ( Total : {{ vendorTotal }} )
            </span>
            <div v-if="sectionValue.length != 0">
              <ColoumnChart
                :coloumndata="sectionValue"
                :chartId="'barContainer_'"
                :key="updatekey"
              />
            </div>
            <div v-else class="center-container">
              <span>No Records</span>
            </div>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">
              By Expense ( Total : {{ expenseTotal }} )
            </span>
            <div v-if="expsenseValue.length != 0">
              <ColoumnChart
                :coloumndata="expsenseValue"
                :chartId="'barContainers_'"
                :key="updateExpensekey"
              />
            </div>
            <div v-else class="center-container">
              <span>No Records</span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { genrate_project_cost_graph } from "@/graphql/queries.js";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    ColoumnChart,

    SnackBar,
  },
  data() {
    return {
      formattedmonth: "",
      formattedyear: "",
      expenseTotal: "0",
      vendorTotal: "0",
      SnackBarComponent: {},
      sectionValue: [],
      expsenseValue: [],
      monthdailog: false,
      fixed: true,
      date1:
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
        " " +
        new Date().toISOString().split("T")[0].split("-")[0],
      date: new Date().toISOString().substr(0, 7),
      updatekey: 0,
      updateExpensekey: 0,
    };
  },
  watch: {
    date(val) {
      this.date1 =
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][Number(val.split("-")[1]) - 1] +
        " " +
        val.split("-")[0];
    },
  },
  mounted() {
    this.get_next();
  },
  methods: {
    fecth_date() {
      const [month, year] = this.date1.split(" ");

      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };

      this.formattedmonth = `${monthMap[month]}`;
      this.formattedyear = `${year}`;
      this.formattedmonth = parseInt(this.formattedmonth, 10);
      this.formattedyear = parseInt(this.formattedyear, 10);
    },
    async get_next() {
      await this.fecth_date();
      let projectDetails = JSON.parse(localStorage.getItem("projectInfo"));
      try {
        let result = await API.graphql(
          graphqlOperation(genrate_project_cost_graph, {
            input: {
              //   year: this.formattedyear,
              //   month: this.formattedmonth,
              //   action_type: "GROUP",
              project_id: projectDetails.project_id,
            },
          })
        );

        let resultdata = JSON.parse(result.data.genrate_project_cost_graph);
        if (resultdata.Status == "SUCCESS") {
          let response = resultdata.data;
          this.expenseTotal = resultdata.expense_total;
          this.vendorTotal = resultdata.vendor_total;
          // console.log(resultdata);
          if (response.expense) {
            let combined = response.expense.x.map((key, index) => ({
              key: key,
              value: parseInt(response.expense.y[index], 10),
            }));

            combined.sort((a, b) => b.value - a.value);

            response.x = combined.map((item) => item.key);
            response.y = combined.map((item) => item.value.toString());

            this.expsenseValue = [];
            this.updatekey++;
            this.updateExpensekey++;
            this.expsenseValue.push(response);
          }
          if (response.vendor) {
            let combined = response.vendor.x.map((key, index) => ({
              key: key,
              value: parseInt(response.vendor.y[index], 10),
            }));

            combined.sort((a, b) => b.value - a.value);

            response.x = combined.map((item) => item.key);
            response.y = combined.map((item) => item.value.toString());

            this.sectionValue = [];
            this.updatekey++;
            this.updateExpensekey++;
            this.sectionValue.push(response);
          }
        } else {
          this.sectionValue = [];
          this.expsenseValue = [];
          this.updatekey++;
          this.updateExpensekey++;
        }
      } catch (error) {
        this.sectionValue = [];
        this.updatekey++;
        this.updateExpensekey++;
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
  
  <style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100%;
  text-align: center;
  font-size: 20px;
}
</style>
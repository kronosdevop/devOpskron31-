<template>
  <div>
    <template>
      <!-- <v-toolbar flat class="mt-2">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="date1"
              label="Picker in menu"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              dense
              outlined
              style="max-width: 200px"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" type="month" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn
              text
              color="primary"
              @click="$refs.menu.save(date), generateDates(),gpt_api()"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
      </v-toolbar> -->
      <v-row>
        <v-col cols="6">
          <v-row>
            <label class="d-flex justify-start font-weight-bold ml-7 mt-8">
              Daily Usage(Tokens)</label
            >
            <v-spacer />
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="date1"
                  label="Select a Month"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  class="mt-6 mr-4"
                  dense
                  outlined
                  style="max-width: 180px"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                :max="new Date().toISOString().substr(0, 10)"
                v-model="date"
                type="month"
                no-title
                scrollable
              >
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="menu = false">
                  Cancel
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.menu.save(date), generateDates(), gpt_api()"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
          </v-row>
          <div v-if="checkcomponent == true">
            <v-card :height="height" class="">
              <v-container class="fill-height" fluid>
                <Bar :data="data_graph" :options="options" />
              </v-container>
            </v-card>
          </div>
        </v-col>

        <v-col cols="6">
          <v-row>
            <span class="font-weight-bold mt-6 ml-2"
              >Daily usage breakdown (UTC)</span
            >

            <v-spacer />
            <v-select
              outlined
              v-model="gpt_date"
              style="max-width: 145px"
              dense
              label="Select Day"
              @change="list_all_details()"
              :items="array_date"
              class="mt-5"
            ></v-select>

            <v-select
              outlined
              style="max-width: 180px"
              :items="admins_list"
              dense
              class="mt-5 ml-2 mr-5"
              v-model="members_list"
              label="All Members"
              item-text="full_user_name"
              @change="list_all_details()"
              item-value="user_id"
            ></v-select>

            <!-- <v-btn @click="gpt_api()"> Save </v-btn> -->
          </v-row>
          <v-data-table
            :headers="headers"
            :height="dataheight"
            :items="tableData"
            :loading="tableLoading"
            hide-default-footer
            :items-per-page="20"
            dense
            class="elevation-1 dtwidth overflow-y-auto"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
/* eslint-disable */
import { get_usage_report_details_openai } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { list_users } from "@/graphql/queries.js";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export default {
  components: {
    Bar,
  },
  data: () => ({
    headers: [
      { text: "Time", value: "date", sortable: false },
      {
        text: "Token Used",
        value: "token",
        sortable: false,
      },
    ],

    tableData: [],
    tableLoading: false,
    date: new Date().toISOString().substr(0, 7),
    menu: false,
    members_list: "",
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
    modal: false,
    checkcomponent: false,
    token_used: "",
    array_date: [],
    new_date_list: [],
    admins_list: [],

    new_label: [],
    gpt_date: "",
    data_graph: {
      // labels: ["January", "February", "March"],
      labels: [],
      datasets: [
        {
          backgroundColor: ["rgb(179, 230, 255)"],
          borderColor: "rgb(0, 136, 204)",

          borderWidth: 2,
          borderSkipped: false,
          data: [],
          // borderWidth: 1,
          // barPercentage: 0.5,
          // barThickness: 20,
          // maxBarThickness: 50,
          // minBarLength: 56,
        },
      ],
    },
    options: {
      indexAxis: "x",
      width: 260,
      scales: {
        x: {
          stacked: true,
          barPercentage: 0.1,
          grid: {
            display: false,
            width: 20,
          },

          ticks: {
            precision: 0,
          },
        },
        y: {
          stacked: true,
          barPercentage: 0.1,
          grid: {
            display: true,
          },
        },
      },

      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "",
        },
      },
    },
  }),
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
  created() {
    this.gpt_api();
    this.get_admins();
    this.generateDates();
    this.height = window.innerHeight - 220;
    this.dataheight = window.innerHeight - 215;
  },
  methods: {
    generateDates() {
      const year = this.date.slice(0, 4);
      const month = this.date.slice(5, 7) - 1;
      // const daysInMonth = new Date(year, month, 1).getDate() ;
      // const dates = [];
      // for (let i = 1; i <= daysInMonth; i++) {
      //   dates.push(new Date(year, month, i).toISOString().split("T")[0]);

      // }
      const dates = [];
      const date = new Date(Date.UTC(year, month, 1));

      while (date.getUTCMonth() === month) {
        dates.push(new Date(date).toISOString().split("T")[0]);
        date.setUTCDate(date.getUTCDate() + 1);
      }

      this.array_date = dates;

      return dates;
    },
    async gpt_api() {
      this.checkcomponent = false;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_usage_report_details_openai, {
            input: {
              organization_id: data.organization.organization_id,
              month: this.date.slice(5, 7),
              year: this.date.slice(0, 4),
              user_id: "",
              date: "",
            },
          })
        );

        var response = JSON.parse(
          result.data.get_usage_report_details_openai
        ).usage_report;
        this.token_used = JSON.parse(
          result.data.get_usage_report_details_openai
        ).month_tokens_used;

        this.new_label = [];
        response.forEach((element) => {
          this.new_label.push(element.date);
        });
        this.new_date_list = [];
        response.forEach((element) => {
          this.new_date_list.push(element.token);
        });

        this.data_graph.labels = this.new_label;

        this.data_graph.datasets[0].data = this.new_date_list;
        this.options.plugins.title.text = "Total Token : " + this.token_used;

        this.checkcomponent = true;
      } catch (error) {
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
    async get_admins() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_users, {
            organization_id: data.organization.organization_id,
            user_status: "ACTIVE",
            user_type: "ADMIN",
            limit: 1000,
            next_token: null,
          })
        );

        this.admins_list = [];

        var response = result.data.list_users;

        response.details.forEach((element) => {
          if (element.user_type != "CHATBOT") {
            this.admins_list.push({
              full_user_name: element.full_user_name,
              user_id: element.user_id,
            });
          }
        });
        response.details.forEach((element) => {
          if (element.user_type != "CHATBOT") {
            this.admins_list.unshift({
              full_user_name: "All Members",
              user_id: "",
            });
          }
        });
      } catch (error) {
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
    async list_all_details() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_usage_report_details_openai, {
            input: {
              organization_id: data.organization.organization_id,
              month: this.date.slice(5, 7),
              year: this.date.slice(0, 4),
              user_id: this.members_list,
              date: this.gpt_date,
            },
          })
        );

        var response = JSON.parse(
          result.data.get_usage_report_details_openai
        ).usage_report;
        this.tableData = response;
      } catch (error) {
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
  },
};
</script>

<style></style>

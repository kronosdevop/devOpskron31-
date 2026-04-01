<template>
  <div>
    <v-dialog
      :model-value="logexport"
      @update:model-value="$emit('update:logexport', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Export Log</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-menu
                  v-model="monthPicker"
                  :close-on-content-click="false"
                  persistent
                  max-width="350"
                  transition="scale-transition"
                  scroll-strategy="none"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="datedisplay"
                      label="Select a Month"
                      readonly
                      density="compact"
                      variant="outlined"
                      class=""
                      v-bind="props"
                    />
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" sm="7">
                          <span class="ml-6" style="font-size: 19px"
                            ><b>{{ datedisplayMonth }}</b></span
                          >
                        </v-col>
                        <v-col>
                          <v-select
                            label="Select Year"
                            v-model="yearfilter"
                            :items="itemyears"
                            density="compact"
                            variant="outlined"
                            class="mt-1"
                            style="max-width: 100px"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row class="ml-n2" dense>
                        <v-col
                          v-for="(month, index) in monthNames"
                          :key="index"
                          cols="4"
                          class="d-flex justify-center"
                        >
                          <v-btn
                            class="ma-1"
                            :class="{ 'active-btn': month === monthfilter }"
                            density="compact"
                            :disabled="isMonthDisabled(index)"
                            @click="selectMonth(month)"
                          >
                            {{ month }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row class="mt-4 justify-end">
                        <v-btn
                          text
                          class="ma-1"
                          density="compact"
                          @click="close_dialog()"
                          >Cancel</v-btn
                        >
                        <v-btn
                          color="primary"
                          text
                          class="ma-1 mr-8"
                          density="compact"
                          @click="saveSelection"bz
                          >Save</v-btn
                        >
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-menu>
                <v-autocomplete
                  v-model="visitselect"
                  label="Search Visit"
                  density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'required ']"
                  item-title="workflow_name"
                  item-value="workflow_id"
                  :items="Mastervisit"
                ></v-autocomplete>
                <v-autocomplete
                  v-model="userselect"
                  density="compact"
                  variant="outlined"
                  label="Search User"
                  item-title="full_user_name"
                  item-value="user_id"
                  :items="orgUsers"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="export_mutation()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { genrate_visit_management_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_visittype_master } from "@/mixins/GetVisitMaster";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  mixins: [get_visittype_master, get_all_org_users],
  props: {
    logexport: Boolean,
  },
  data() {
    return {
      loading: false,
      monthPicker: false,
      visitArray: [],
      visitlist: [],
      userselect: "",
      userArray: [],
      searchvisit: "",
      visitselect: "",
      datedisplay: "",
      datedisplayMonth: "",
      yearfilter: new Date().getFullYear(),
      monthfilter: "",
      monthNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      itemyears: [],
      date: new Date().toISOString().substr(0, 7),
    };
  },
  watch: {
    logexport: {
      async handler() {
        if (this.logexport == true) {
          this.date = new Date().toISOString().substr(0, 7);
          await Promise.all([
            this.get_visittype_master(),
            this.get_all_org_users(),
          ]);
          await this.fetch_details();
          this.populateYearItems();
          this.setInitialFilters();
        }
      },
      immediate: true,
    },
  },
  async mounted() {
    this.get_visittype_master();
  },
  methods: {
    get_data(val) {},
    filterVisits() {
      this.visitArray = this.visitlist;
    },
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
        this.userArray.unshift({
          full_user_name: "All",
          user_id: "ALL",
        });
      });
      this.Mastervisit.forEach((element) => {
        this.visitlist.push({
          visit_type_name:
            element.workflow_name + " V " + element.workflow_version,
          visit_type_id: element.workflow_id,
          created_on: this.get_date(element.workflow_created_on).split(",")[0],
        });
      });
      this.filterVisits();
    },
    get_date(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    close_dialog() {
      this.date = new Date().toISOString().substr(0, 7);
      this.visitselect = "";
      this.monthPicker = false;
      this.$emit("clicked", 0);
    },
    async download_invoice(url) {
      var fileName = url.split("/").pop();
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
    async export_mutation() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(genrate_visit_management_reports, {
              input: {
                user_email_id: this.userselect,
                workflow_id: this.visitselect,
                month_year: this.date,
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(
            result.data.genrate_visit_management_reports
          );
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.download_invoice(response.data);
            this.$emit("exportupdate", 0);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
    populateYearItems() {
      const currentYear = new Date().getFullYear();
      this.itemyears = Array.from(
        { length: 10 },
        (_, index) => currentYear - index
      );
    },
    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.monthfilter = this.monthNames[new Date().getMonth()] || "Jan";
      this.updateDatedisplayMonth();
      this.datedisplay =
        this.datedisplayMonth || `${this.monthfilter} ${this.yearfilter}`;
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      } else {
        const currentDate = new Date();
        this.datedisplayMonth = `${
          this.monthNames[currentDate.getMonth()]
        } ${currentDate.getFullYear()}`;
      }
    },
    selectMonth(month) {
      this.monthfilter = month;
    },
    saveSelection() {
      this.datedisplay = `${this.monthfilter} ${this.yearfilter}`;
      this.date = `${this.yearfilter}-${
        this.monthNames.indexOf(this.monthfilter) + 1
      }`.padStart(2, "0");
      this.monthPicker = false;
      this.get_data(this.date);
    },
    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      if (this.yearfilter === currentYear && index > currentMonth) {
        return true;
      }
      return false;
    },
  },
};
</script>

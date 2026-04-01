<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="dailyMonthyChartDialog"
    @update:model-value="$emit('update:dailyMonthyChartDialog', $event)"
    persistent
    max-width="500"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">Add configuration</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text>
        <v-form ref="form">
          <v-row no-gutters class="mt-4">
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                label="Select Year"
                v-model="slectedYear"
                :items="yearsCalender"
                @update:model-value="get_selected_year_months(slectedYear)"
              />
            </v-col>

            <v-col v-show="selectedchartType == 'Daily Chart'" cols="12">
              <v-select
                density="compact"
                variant="outlined"
                label="Select Month"
                :rules="[(v) => !!v || 'required ']"
                v-model="SelectMonth"
                class=""
                :items="monthsArray"
                @input="bind_title_name()"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                :rules="[(v) => !!v || 'required ']"
                density="compact"
                label="Title"
                variant="outlined"
                v-model="sectionTitle"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                label="Select No of Bars"
                v-model="noOfBars"
                item-title="text"
                item-value="id"
                :items="[
                  { text: 'One bar', value: 1, id: 1 },
                  { text: 'Two bars', value: 2, id: 2 },
                  { text: 'Three bars', value: 3, id: 3 },
                  { text: 'Four bars', value: 4, id: 4 },
                  { text: 'Five bars', value: 5, id: 5 },
                  { text: 'Two bars with total', value: 3, id: 6 },
                  { text: 'Three bars with total', value: 4, id: 7 },
                  { text: 'Four bars with total', value: 5, id: 8 },
                ]"
                return-object
              />
            </v-col>
            <!-- item-text="text"
            item-value="value" -->
            <!-- :items="[
                  { text: 'One bar', value: 1 },
                  { text: 'Two bars', value: 2 },
                  { text: 'Two bars with total(includes 3 bars)', value: 3 },
                  { text: 'Three bars', value: 3 },
                  { text: 'Three bars with total(includes 4 bars)', value: 4 },
                  { text: 'Four bars', value: 4 },
                  { text: 'Four bars with total(includes 5 bars)', value: 5 },
                  { text: 'Five bars', value: 5 },
                ]"
                return-object -->
            <!-- :items="[1, 2, 3, 4, 5]" -->
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          dark
          @click="validate_data()"
          class="text-capitalize cardCss button-corner"
          >Add</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/
export default {
  props: {
    dailyMonthyChartDialog: Boolean,
    selectedchartType: String,
  },
  data() {
    return {
      slectedYear: "",
      yearsCalender: [],
      SelectMonth: "",
      monthsArray: [],
      sectionTitle: "",
      noOfBars: "",
      datesInMonth: [],
    };
  },
  watch: {
    dailyMonthyChartDialog: {
      async handler() {
        if (this.dailyMonthyChartDialog == true) {
          this.get_selected_value();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },
    get_selected_value() {
      const currentYear = new Date().getFullYear();
      const yearsArray = [];

      for (let i = 0; i <= 5; i++) {
        yearsArray.push((currentYear - i).toString());
      }
      this.yearsCalender = yearsArray;
    },

    get_selected_year_months(value) {
      if (this.selectedchartType == "Daily Chart") {
        const currentYear = new Date().getFullYear();

        const currentMonth = new Date().getMonth();

        const months = [
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
        ];
        let monthsToShow;

        if (value == currentYear) {
          monthsToShow = months.slice(0, currentMonth + 1);
        } else if (value < currentYear) {
          monthsToShow = months;
        } else {
          monthsToShow = [];
        }
        this.monthsArray = monthsToShow;
      } else {
        this.sectionTitle = this.slectedYear;
      }
    },

    bind_title_name() {
      this.sectionTitle = this.SelectMonth + " " + this.slectedYear;

      const monthIndex = this.monthsArray.indexOf(this.SelectMonth);
      const startDate = new Date(this.slectedYear, monthIndex, 1); // 1st day of the month
      const endDate = new Date(this.slectedYear, monthIndex + 1, 0);
      const totalDays = endDate.getDate();
      this.datesInMonth = [];
      for (let i = 1; i <= totalDays; i++) {
        const currentDate = new Date(this.slectedYear, monthIndex, i);
        const formattedDate = this.formatDate(currentDate);
        // console.log(formattedDate);
        this.datesInMonth.push(formattedDate);
      }
    },
    formatDate(date) {
      const monthNames = [
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
      ];
      const month = monthNames[date.getMonth()]; // Get month name (e.g., "Oct")
      const day = date.getDate();
      return `${month}-${day}`;
      // const day = String(date.getDate()).padStart(2, "0");
      // const month = String(date.getMonth() + 1).padStart(2, "0");
      // const year = date.getFullYear();
      // return `${day}-${month}-${year}`;
      // return `${day}-${month}-${year}`;
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      // console.log(valid);
      if (valid) {
        const months = [
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
        ];
        var data = {};
        if (this.selectedchartType == "Daily Chart") {
          data = {
            sectionTitle: this.sectionTitle,
            SelectMonth: this.SelectMonth,
            slectedYear: this.slectedYear,
            noOfBars: this.noOfBars.value,
            typeOfbar: this.noOfBars.text,
            selectedMonthDays: this.datesInMonth,
          };
        } else {
          data = {
            sectionTitle: this.sectionTitle,
            slectedYear: this.slectedYear,
            noOfBars: this.noOfBars.value,
            typeOfbar: this.noOfBars.text,
            selectedMonthDays: months,
          };
        }

        this.$emit("selectedDailyData", data);
        this.$refs.form.reset();
      }
    },
  },
};
</script>
<template>
  <v-card class="am-2" flat>
    <v-form ref="form">
      <v-row class="mt-3" no-gutters>
        <v-col cols="12" class="d-flex align-center justify-center">
          <b> How many employees do you have ?</b>
        </v-col>
        <v-col cols="12">
          <!-- <v-row align="center" class="mt-3" justify="space-around">
            <v-card
              v-for="(range, index) in ranges"
              :key="index"
              class="d-flex justify-center align-center same-size"
              outlined
              @click="get_selected_range(range)"
              :class="{ 'selected-card': selectedRange === range }"
            >
              <div>{{ range }}</div>
            </v-card>
          </v-row> -->
          <v-row align="center" class="mt-3" justify="space-around">
            <v-card
              class="d-flex justify-center align-center same-size"
              @click="get_selected_range('1-10')"
              :style="selectedRange === '1-10' ? selectedStyle : defaultStyle"
              outlined
            >
              <div>1-10</div>
            </v-card>
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '11-30' ? selectedStyle : defaultStyle"
              @click="get_selected_range('11-30')"
            >
              <div>11-30</div>
            </v-card>
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '31-50' ? selectedStyle : defaultStyle"
              @click="get_selected_range('31-50')"
            >
              <div>31-50</div>
            </v-card>
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '51-100' ? selectedStyle : defaultStyle"
              @click="get_selected_range('51-100')"
            >
              <div>51-100</div>
            </v-card>
          </v-row>
          <v-row class="mt-5" align="center" justify="space-around">
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '101-200' ? selectedStyle : defaultStyle"
              @click="get_selected_range('101-200')"
            >
              <div>101-200</div>
            </v-card>
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '201-500' ? selectedStyle : defaultStyle"
              @click="get_selected_range('201-500')"
            >
              <div>201-500</div>
            </v-card>
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '501-1000' ? selectedStyle : defaultStyle"
              @click="get_selected_range('501-1000')"
            >
              <div>501-1000</div>
            </v-card>
            <v-card
              class="d-flex justify-center align-center same-size"
              outlined
              :style="selectedRange === '1000+' ? selectedStyle : defaultStyle"
              @click="get_selected_range('1000+')"
            >
              <div>1000+</div>
            </v-card>
          </v-row>
        </v-col>
        <v-col class="d-flex align-center mt-6 justify-center" cols="12">
          <b> What is your business Industry ?</b>
        </v-col>
        <v-col cols="12">
          <v-row align="center" class="mt-5" justify="space-around">
            <v-card
              flat
              class="d-flex flex-column justify-center align-center same-size1"
              :class="{ 'highlight-card': selectedCard === 'IT' }"
              @click="selectCard('IT')"
            >
              <img :src="softwareDeveloperImg" style="max-width:80px;max-height:60px;" />
              <div style="font-size: 12px" class="text-center mt-2">
                <b>IT</b>
              </div>
            </v-card>

            <v-card
              flat
              class="d-flex flex-column justify-center align-center same-size1"
              :class="{ 'highlight-card': selectedCard === 'Security' }"
              @click="selectCard('Security')"
            >
              <img :src="securityUpdateImg" style="max-width:80px;max-height:60px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Security</b>
              </div>
            </v-card>

            <v-card
              flat
              class="d-flex flex-column justify-center align-center same-size1"
              :class="{ 'highlight-card': selectedCard === 'Health Care' }"
              @click="selectCard('Health Care')"
            >
              <img :src="lifeInsuranceImg" style="max-width:80px;max-height:60px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Health Care</b>
              </div>
            </v-card>

            <v-card
              flat
              class="d-flex flex-column justify-center align-center same-size1"
              :class="{ 'highlight-card': selectedCard === 'Manufacturing' }"
              @click="selectCard('Manufacturing')"
            >
              <img :src="processImg" style="max-width:80px;max-height:60px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Manufacturing</b>
              </div>
            </v-card>
          </v-row>
          <v-row align="center" justify="space-around">
            <v-card
              flat
              class="d-flex flex-column justify-center align-center mt-5 same-size1"
              :class="{ 'highlight-card': selectedCard === 'Construction' }"
              @click="selectCard('Construction')"
            >
              <img :src="workerImg" style="max-width:80px;max-height:60px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Construction</b>
              </div>
            </v-card>
            <v-card
              flat
              class="d-flex flex-column justify-center align-center mt-5 same-size1"
              :class="{ 'highlight-card': selectedCard === 'Retail' }"
              @click="selectCard('Retail')"
            >
              <img :src="outletsImg" style="max-width:80px;max-height:60px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Retail</b>
              </div>
            </v-card>
            <v-card
              flat
              class="d-flex flex-column justify-center mt-5 align-center same-size1"
              :class="{ 'highlight-card': selectedCard === 'Food & Beverage' }"
              @click="selectCard('Food & Beverage')"
            >
              <img :src="healthyDrinkImg" style="max-width:80px;max-height:50px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Food & Beverage</b>
              </div>
            </v-card>
            <v-card
              flat
              class="d-flex flex-column justify-center mt-5 align-center same-size1"
              :class="{ 'highlight-card': selectedCard === 'Hospitality' }"
              @click="selectCard('Hospitality')"
            >
              <img :src="hospitalityImg" style="max-width:80px;max-height:60px;" />

              <div style="font-size: 12px" class="text-center mt-2">
                <b>Hospitality</b>
              </div>
            </v-card>
          </v-row>
        </v-col>
        <v-col class="d-flex align-center mt-6 justify-center" cols="12">
          <v-card class="d-flex justify-center mt-5 align-center">
            <v-btn
              v-show="otherIndus == 0"
              block
              @click="show_other_industries()"
              color="#80CBC4"
              class="text-white"
            >
              <v-icon left>mdi-plus</v-icon>
              Other Industries
            </v-btn>
          </v-card>
        </v-col>
        <v-col v-show="otherIndus == 1" cols="12">
          <v-row align="center" class="mt-3" justify="space-around" no-gutters>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              outlined
              :class="{ 'highlight-card': selectedCard === 'Transportation' }"
              @click="selectCard('Transportation')"
            >
              <div>Transportation</div>
            </v-card>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              outlined
              :class="{ 'highlight-card': selectedCard === 'Events' }"
              @click="selectCard('Events')"
            >
              <div>Events</div>
            </v-card>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              outlined
              :class="{ 'highlight-card': selectedCard === 'Staffing' }"
              @click="selectCard('Staffing')"
            >
              <div>Staffing</div>
            </v-card>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              :class="{ 'highlight-card': selectedCard === 'Real Estate' }"
              @click="selectCard('Real Estate')"
              outlined
            >
              <div>Real Estate</div>
            </v-card>
          </v-row>
          <v-row align="center" class="mt-3" justify="space-around" no-gutters>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              :class="{ 'highlight-card': selectedCard === 'Entertainment' }"
              @click="selectCard('Entertainment')"
              outlined
            >
              <div>Entertainment</div>
            </v-card>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              :class="{ 'highlight-card': selectedCard === 'Field Services' }"
              @click="selectCard('Field Services')"
              outlined
            >
              <div>Field Services</div>
            </v-card>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              :class="{ 'highlight-card': selectedCard === 'Governmental' }"
              @click="selectCard('Governmental')"
              outlined
            >
              <div>Governmental</div>
            </v-card>
            <v-card
              class="d-flex flex-column justify-center align-center same-size2 light-grey-bg"
              outlined
              :class="{ 'highlight-card': selectedCard === 'Others' }"
              @click="selectCard('Others')"
            >
              <div>Others</div>
            </v-card>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
    <v-card-actions class="justify-center mt-3">
      <v-btn
        depressed
        :loading="loading"
        @click="back_step()"
        dark
        color="primary"
        class=""
      >
        Back
      </v-btn>
      <v-btn
        depressed
        :loading="loading"
        @click="next_step()"
        dark
        class="cardCss ml-2"
      >
        Next
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import softwareDeveloperImg from '@/assets/software-developer.png';
import securityUpdateImg from '@/assets/security-update.png';
import lifeInsuranceImg from '@/assets/life-insurance.png';
import processImg from '@/assets/process.png';
import workerImg from '@/assets/worker.png';
import outletsImg from '@/assets/outlets.png';
import healthyDrinkImg from '@/assets/healthy-drink.png';
import hospitalityImg from '@/assets/hospitality.png';

export default {
  data() {
    return {
      loading: false,
      otherIndus: 0,
      employeCount: "",
      selectedCard: "",
      secondStepData: {},
      selectedRange: "",
      selectedStyle: {
        backgroundColor: "#E3F2FD", // Blue shade for selected
        color: "black",
        borderColor: "#42A5F5",
      },
      defaultStyle: {
        backgroundColor: "white",
        color: "black",
        borderColor: "#ccc",
      },
      softwareDeveloperImg,
      securityUpdateImg,
      lifeInsuranceImg,
      processImg,
      workerImg,
      outletsImg,
      healthyDrinkImg,
      hospitalityImg,
    };
  },
  methods: {
    next_step() {
      if (this.selectedCard == "" || this.selectedRange == "") {
        this.$emit("secondsetepValid", "Please Select any one record ");
      } else {
        var data = {
          employeeCount: this.selectedRange,
          selectedIndustry: this.selectedCard,
        };
        this.$emit("emitSecondStepData", data);
      }
    },

    back_step() {
      this.$emit("previousfirstStep", 1);
    },
    selectCard(card) {
      this.selectedCard = card;
    },
    show_other_industries() {
      this.otherIndus = 1;
    },

    get_selected_range(value) {
      this.selectedRange = value;
    },
  },
};
</script>
<style>
.highlight-card {
  border: 2px solid #42A5F5 !important;
  background-color: #E3F2FD !important;
  position: relative;
}

.highlight-card::after {
  content: "✓";
  color: white;
  font-size: 16px;
  font-weight: bold;
  position: absolute;
  top: 1px;
  right: 1px;
  background-color: #42A5F5 !important;
  border-radius: 0%;
  width: 15px;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.same-size {
  width: 80px;
  height: 30px;
  text-align: center;
  font-size: 12px;
}
.same-size1 {
  width: 100px;
  height: 110px;
  text-align: center;
}
.same-size2 {
  width: 120px;
  height: 40px;
  text-align: center;
  font-size: 12px;
  margin: 10px;
}
.light-grey-bg {
  background-color: #d26a0f;
  border-radius: 8px;
}
.selected-card {
  border: #1976d2 !important;
  background-color: white !important;
  color: black !important;
  position: relative;
}


</style>
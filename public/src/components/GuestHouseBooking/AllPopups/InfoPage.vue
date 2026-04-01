<template>
  <div>
    <v-card flat>
      <v-form ref="form">
        <v-row class="" no-gutters>
          <v-col cols="12" class="d-flex align-left justify-left">
            <b>Which of these best describes your place</b>
          </v-col>

          <v-col class="ml-4" cols="12">
            <v-row class="justify-left">
              <v-radio-group
                v-model="selectedtype"
                row
                :rules="[(v) => !!v || 'Please select an option']"
              >
                <v-radio label="House" value="house"></v-radio>
                <v-radio label="Flat / Apartment" value="apartment"></v-radio>
              </v-radio-group>
              <!-- <v-card
                flat
                class="d-flex flex-column justify-center align-center same-size1"
                :class="{ 'highlight-card': selectedCard === 'House' }"
                @click="selectCard('House')"
              >
                <v-img
                  src="@/assets/house.png"
                  max-height="60"
                  max-width="80"
                  contain
                ></v-img>

                <div style="font-size: 12px" class="text-center mt-2">
                  <b>House</b>
                </div>
              </v-card>
              <v-card
                flat
                class="d-flex flex-column justify-center align-center same-size1"
                :class="{
                  'highlight-card': selectedCard === 'Flat / Appartment',
                }"
                @click="selectCard('Flat / Appartment')"
              >
                <v-img
                  src="@/assets/buildings.png"
                  max-height="60"
                  max-width="80"
                  contain
                ></v-img>

                <div style="font-size: 12px" class="text-center mt-2">
                  <b>Flat / Appartment</b>
                </div>
              </v-card> -->
            </v-row>
          </v-col>
          <v-col cols="12" class="d-flex align-left justify-left mt-2">
            <b>Now, lets give it a title</b>
          </v-col>
          <v-col class="mt-2" cols="12">
            <v-text-field
              dense
              rows="2"
              outlined
              :rules="[
                (v) => !!v || 'Required ',
                (v) => (v && v.length <= 35) || 'Max 35 characters',
              ]"
              placeholder="Title*"
              v-model="title"
              maxlength="35"
              counter="35"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" class="d-flex align-left justify-left">
            <b>Now, lets give it a short description</b>
          </v-col>
          <v-col class="mt-2" cols="12">
            <v-textarea
              dense
              rows="2"
              outlined
              :rules="[
                (v) => !!v || 'Required ',
                (v) => (v && v.length <= 500) || 'Max 500 characters',
              ]"
              placeholder="Short Description*"
              v-model="description"
              maxlength="500"
              counter="500"
            >
            </v-textarea>
          </v-col>
        </v-row>
      </v-form>
      <v-card-actions class="justify-center">
        <v-btn depressed @click="next_step()" dark class="cardCss">
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
  <script>
/* eslint-disable */

export default {
  data() {
    return {
      orgName: "",
      selectedWeeks: [],
      timezonesArray: [],
      title: "",
      loading: false,
      selectedCard: "",
      description: "",
      selectedtype: "",
    };
  },

  methods: {
    next_step() {
      if (this.$refs.form.validate()) {
        var firstStepData = {
          title: this.title,
          description: this.description,
          selectedCard: this.selectedtype,
        };
        // console.log("firstStepData", firstStepData)
        this.$emit("emitSecondSTep", firstStepData);
      }
    },
  },
};
</script>
<style scoped>
.same-size1 {
  width: 100px;
  height: 110px;
  text-align: center;
}
.highlight-card {
  border: 2px solid #42a5f5 !important;
  background-color: #e3f2fd !important;
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
  background-color: #42a5f5 !important;
  border-radius: 0%;
  width: 15px;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
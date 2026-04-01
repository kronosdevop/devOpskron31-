<template>
  <div>
    <!--  eslint-disable 
 -->
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
  props: {
    ViewInfo: Object,
  },
  data() {
    return {
      title: "",
      description: "",
      selectedtype: "",
    };
  },
  mounted() {
    if (this.ViewInfo) {
      this.title = this.ViewInfo.name || "";
      this.description = this.ViewInfo.guest_house_description || "";
      this.selectedtype = this.ViewInfo.guest_house_type || "";
    }
  },
  // watch: {
  //     ViewInfo: {
  //         handler(newValue) {
  //             if (newValue) {
  //                 this.title = newValue.name || "";
  //                 this.description = newValue.guest_house_description || "";
  //                 this.selectedtype = newValue.selectedCard || "";
  //             }
  //         },
  //         immediate: true,
  //         deep: true,
  //     },
  // },
  methods: {
    next_step() {
      if (this.$refs.form.validate()) {
        var firstStepData = {
          title: this.title,
          description: this.description,
          selectedCard: this.selectedtype,
        };
        this.$emit("emitSecondSTep", firstStepData);
      }
    },
  },
};
</script>

<style scoped>
</style>
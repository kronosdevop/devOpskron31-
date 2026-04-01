<template>
  <div>
    <v-card class="mt-n6 ml-n4">
      <v-form ref="form">
        <v-row class="mt-n6">
          <v-col cols="6">
            <v-card-text>
              <!-- <v-text-field
                                label="How many adults can accommodate?"
                                outlined
                                dense
                                v-model="numberofadults"
                                :rules="[v => !!v || 'This field is required', v => /^[0-9]*(\.[0-9]+)?$/.test(v) || 'Only numbers are allowed']"
                                @keypress="is_number($event)"
                                maxlength="2"
                            ></v-text-field>
                            <v-text-field
                                label="How many children can accommodate?"
                                outlined
                                dense
                                v-model="numberofchildren"
                                :rules="[v => !!v || 'This field is required', v => /^[0-9]*(\.[0-9]+)?$/.test(v) || 'Only numbers are allowed']"
                                @keypress="is_number($event)"
                                maxlength="2"
                            ></v-text-field> -->

              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-header style="font-size: large"
                    >Guests</v-expansion-panel-header
                  >
                  <v-expansion-panel-content>
                    <v-row align="center">
                      <span class="ml-4" style="font-size: small"
                        >Adults
                        <br />
                        <span style="font-size: x-small" class="mt-n4"
                          >Age 13+
                        </span>
                      </span>
                      <v-spacer />
                      <v-card flat class="d-flex align-center">
                        <v-btn
                          icon
                          small
                          outlined
                          @click="decreaseAdultCount"
                          :disabled="numberofadults <= 1"
                        >
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                        <span class="mx-3" style="font-size: 16px">{{
                          numberofadults
                        }}</span>
                        <v-btn icon small outlined @click="increaseAdultCount">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-card>
                    </v-row>

                    <v-row>
                      <span class="ml-4" style="font-size: small"
                        >Children
                        <br />
                        <span style="font-size: x-small" class="mt-n4"
                          >Ages 2-12
                        </span>
                      </span>
                      <v-spacer />
                      <v-card flat class="d-flex align-center">
                        <v-btn
                          icon
                          small
                          outlined
                          @click="decreaseChildrenCount"
                          :disabled="numberofchildren <= 0"
                        >
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                        <span class="mx-3" style="font-size: 16px">{{
                          numberofchildren
                        }}</span>
                        <v-btn
                          icon
                          small
                          outlined
                          @click="increaseChildrenCount"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-card>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-text-field
                label="Payment UPI ID"
                outlined
                dense
                class="mt-4"
                v-model="paymentupiid"
                :rules="[(v) => !!v || 'This field is required.']"
              />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-dialog
                    ref="dialog"
                    v-model="check_in"
                    :return-value.sync="check_in_time"
                    persistent
                    width="290px"
                  >
                    <template #activator="{ on, attrs }">
                      <v-text-field
                        v-model="check_in_time"
                        label="Check In"
                        append-icon="mdi-clock-time-four-outline"
                        readonly
                        outlined
                        dense
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="check_in"
                      v-model="check_in_time"
                      full-width
                    >
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="check_in = false">
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="$refs.dialog.save(check_in_time)"
                      >
                        OK
                      </v-btn>
                    </v-time-picker>
                  </v-dialog>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog
                    ref="dialog1"
                    v-model="check_out"
                    :return-value.sync="check_out_time"
                    persistent
                    width="290px"
                  >
                    <template #activator="{ on, attrs }">
                      <v-text-field
                        v-model="check_out_time"
                        label="Check Out"
                        append-icon="mdi-clock-time-four-outline"
                        readonly
                        outlined
                        dense
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-if="check_out"
                      v-model="check_out_time"
                      full-width
                    >
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="check_out = false">
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="$refs.dialog1.save(check_out_time)"
                      >
                        OK
                      </v-btn>
                    </v-time-picker>
                  </v-dialog>
                </v-col>
              </v-row>
              <v-text-field
                label="Set price:"
                outlined
                dense
                v-model="basePrice"
                :rules="[
                  (v) => !!v || 'This field is required',
                  (v) =>
                    /^[0-9]*(\.[0-9]+)?$/.test(v) || 'Only numbers are allowed',
                ]"
                @keypress="is_number($event)"
              />
              <v-checkbox
                v-model="pricing"
                class="mt-n2"
                label="Display pricing before Booking"
              ></v-checkbox>
            </v-card-text>
          </v-col>
          <v-col cols="5">
            <v-checkbox
              v-model="checkbox"
              class=""
              label="Enable Special Price"
            ></v-checkbox>
            <v-text-field
              v-if="checkbox == true"
              label="Set price For Weekends:"
              outlined
              dense
              v-model="weekendprice"
              :rules="
                checkbox
                  ? [
                      (v) => !!v || 'This field is required',
                      (v) =>
                        /^[0-9]*(\.[0-9]+)?$/.test(v) ||
                        'Only numbers are allowed',
                    ]
                  : []
              "
              @keypress="is_number($event)"
            />
            <v-text-field
              v-if="checkbox == true"
              label="Weekly Discount (%)"
              outlined
              dense
              v-model="weeklyDiscount"
              :rules="
                checkbox
                  ? [
                      (v) => !!v || 'This field is required',
                      (v) =>
                        /^[0-9]*(\.[0-9]+)?$/.test(v) ||
                        'Only numbers are allowed',
                    ]
                  : []
              "
              @keypress="is_number($event)"
            />
            <v-text-field
              v-if="checkbox == true"
              outlined
              label="Monthly Discount (%)"
              dense
              v-model="monthlyDiscount"
              :rules="
                checkbox
                  ? [
                      (v) => !!v || 'This field is required',
                      (v) =>
                        /^[0-9]*(\.[0-9]+)?$/.test(v) ||
                        'Only numbers are allowed',
                    ]
                  : []
              "
              @keypress="is_number($event)"
            />
          </v-col>
        </v-row>
      </v-form>

      <v-card-actions class="justify-center mt-2">
        <v-btn depressed @click="back_action()" dark color="primary">
          Back
        </v-btn>
        <v-btn depressed @click="emit_fourth_step()" dark class="cardCss">
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
      basePrice: "",
      monthlyDiscount: "",
      weeklyDiscount: "",
      checkbox: false,
      weekendprice: "",
      pricing: true,
      paymentupiid: "",
      maxChildren: "",
      maxAdults: "",
      numberofadults: 1,
      numberofchildren: 0,
      maxAdults: 10,
      maxChildren: 5,
      check_in_time: "11:00",
      check_in: false,
      check_out_time: "11:00",
      check_out: false,
    };
  },

  watch: {
    checkbox(newValue) {
      if (!newValue) {
        this.weekendprice = "";
        this.weeklyDiscount = "";
        this.monthlyDiscount = "";
      }
    },
  },

  methods: {
    decreaseAdultCount() {
      if (this.numberofadults > 1) {
        this.numberofadults -= 1;
      }
    },

    increaseAdultCount() {
      if (this.numberofadults < this.maxAdults) {
        this.numberofadults += 1;
      }
    },

    decreaseChildrenCount() {
      if (this.numberofchildren > 0) {
        this.numberofchildren -= 1;
      }
    },

    increaseChildrenCount() {
      if (this.numberofchildren < this.maxChildren) {
        this.numberofchildren += 1;
      }
    },

    is_number(evt) {
      evt = evt || window.event;
      let charCode = evt.which || evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
    },
    async emit_fourth_step() {
      const valid = await this.$refs.form.validate();
      if (!valid) return;

      var StepfourData = {
        weeklyprice: this.basePrice,
        enable_special_price: this.checkbox,
        specialPrice: this.checkbox ? this.weekendprice : null,
        weeklyDiscount: this.checkbox ? this.weeklyDiscount : null,
        monthlyDiscount: this.checkbox ? this.monthlyDiscount : null,
        numberofadults: this.numberofadults,
        numberofchildren: this.numberofchildren,
        payment_uip_Id: this.paymentupiid,
        check_in: this.check_in_time,
        chech_out: this.check_out_time,
        pricing: this.pricing,
      };
      // console.log("emitfifthstep", StepfourData);
      this.$emit("emitfifthstep", StepfourData);
    },
    back_action() {
      this.$emit("emitfourthstep", 3);
    },
  },
};
</script>

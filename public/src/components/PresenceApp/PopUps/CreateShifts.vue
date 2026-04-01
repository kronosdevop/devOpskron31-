<template>
  <v-dialog
    :model-value="createShiftDialog"
    @update:model-value="$emit('update:createShiftDialog', $event)"
    persistent
    max-width="600"
  >
    <v-card rounded="lg">
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="ml-4">
          <div class="custom-title">Create Shift</div>
        </v-toolbar-title>

        <v-spacer />
        <v-btn icon class="mr-2" @click="close_dialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mt-4 pb-0">
        <v-form ref="form">
          <!-- SHIFT NAME -->
          <v-text-field
            v-model="shiftName"
            placeholder="Enter Shift Name *"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
            :rules="[(v) => !!v || 'Required']"
          />

          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <!-- START TIME -->
              <v-dialog v-model="startDialog" width="300">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="startTime"
                    label="Start Time"
                    variant="outlined"
                    readonly
                    density="compact"
                    prepend-inner-icon="mdi-clock-time-four-outline"
                  />
                </template>

                <v-time-picker v-model="startTime" format="24hr">
                  <v-btn text @click="startDialog = false">Cancel</v-btn>
                  <v-btn text @click="startDialog = false">OK</v-btn>
                </v-time-picker>
              </v-dialog>
            </v-col>

            <v-col cols="12" sm="6">
              <!-- END TIME -->
              <v-dialog v-model="endDialog" width="300">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="endTime"
                    label="End Time"
                    variant="outlined"
                    density="compact"
                    readonly
                    prepend-inner-icon="mdi-clock-time-four-outline"
                  />
                </template>

                <v-time-picker v-model="endTime" format="24hr">
                  <v-btn text @click="endDialog = false">Cancel</v-btn>
                  <v-btn text @click="endDialog = false">OK</v-btn>
                </v-time-picker>
              </v-dialog>
            </v-col>
          </v-row>
          <!-- WEEKOFF MULTI SELECT -->
          <v-select
            v-model="weekoffDays"
            :items="weekDays"
            label="Select Week-Off Days"
            variant="outlined"
            density="compact"
            multiple
            chips
            clearable
            class="mt-2"
          />

          <!-- SAVE BUTTON -->
          <div class="text-center mt-6">
            <v-btn
              class="px-10 cardCss py-2"
              :loading="loading"
              @click="validate_data"
            >
              <v-icon start>mdi-content-save</v-icon>
              CREATE
            </v-btn>
          </div>
          <div class="mt-8 text-center">
            <div class="text-body-2">
              <b>NOTE :</b> If <b>End Time</b> is earlier than
              <b>Start Time</b>, End Time is considered for NEXT DAY.
            </div>

            <div class="text-caption mt-1">
              <b>(Eg :</b> Start 20:00 → End 06:00 = next day calculation)
            </div>

            <v-divider class="mt-2" thickness="2" />
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>


<script>
/*eslint-disable*/
import { API, graphqlOperation } from "aws-amplify";
import { create_list_edit_delete_work_shift_timings } from "@/graphql/mutations.js";
export default {
  props: {
    createShiftDialog: Boolean,
  },

  data() {
    return {
      shiftName: "",

      startTime: "09:00",
      endTime: "18:00",

      startDialog: false,
      endDialog: false,

      weekDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],

      weekoffDays: [],
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.resetForm();
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.save_Shift();
      }
    },

    resetForm() {
      this.shiftName = "";
      this.startTime = "09:00";
      this.endTime = "18:00";
      this.weekoffDays = [];
    },

    async save_Shift() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_work_shift_timings, {
            input: {
              action_type: "CREATE",
              work_shift_timings_name: this.shiftName,
              work_shift_start_timings: this.startTime,
              work_shift_end_timings: this.endTime,
              week_off: this.weekoffDays.map((d) => String(d)),
            },
          })
        );

        this.loading = false;

        // FIX: correct response field name
        const raw = result.data.create_list_edit_delete_work_shift_timings;
        const response = JSON.parse(raw);

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;

        const msg =
          error?.errors?.[0]?.message ||
          error?.message ||
          "Something went wrong while saving the shift.";

        this.$emit("errorMsg", msg);
      }
    },
  },
};
</script>
<style>
.v-text-field input {
  font-size: 14px !important;
}
</style>


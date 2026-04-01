<template>
  <v-dialog
    :model-value="editShiftDialog"
    @update:model-value="$emit('update:editShiftDialog', $event)"
    persistent
    max-width="600"
  >
    <v-card rounded="lg">
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="ml-4">
          <div class="custom-title">Edit Shift</div>
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
            color="primary"
            clearable
            class="mt-2"
          />

          <!-- SAVE BUTTON -->
          <div class="text-center mt-6">
            <v-btn class="px-10 cardCss py-2" @click="validate_data" :loading="loading">
              <v-icon start>mdi-content-save</v-icon>
              Update
            </v-btn>
          </div>

          <div class="mt-8 text-center">
            <div class="text-body-2">
              <b>NOTE :</b> If <b>End Time</b> is earlier than <b>Start Time</b>,
              End Time is considered as NEXT DAY.
            </div>

            <v-divider class="mt-2" thickness="2" />
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { create_list_edit_delete_work_shift_timings } from "@/graphql/mutations.js";

export default {
  props: {
    editShiftDialog: Boolean,
    workshiftData: Object,
  },

  data() {
    return {
      shiftName: "",
      startTime: "",
      endTime: "",
      weekoffDays: [],

      startDialog: false,
      endDialog: false,

      weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      loading: false,
    };
  },

  watch: {
    editShiftDialog(val) {
      if (val) {
        this.bindDataToFields();
      }
    },

    workshiftData: {
      handler() {
        if (this.editShiftDialog) this.bindDataToFields();
      },
      deep: true,
    },
  },

  methods: {
    bindDataToFields() {
      if (!this.workshiftData) return;

      this.shiftName = this.workshiftData.work_shift_timings_name || "";
      this.startTime = this.workshiftData.work_shift_start_timings || "09:00";
      this.endTime = this.workshiftData.work_shift_end_timings || "18:00";

      // Week-offs
      this.weekoffDays = Array.isArray(this.workshiftData.week_off)
        ? [...this.workshiftData.week_off]
        : [];
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },
    async validate_data() {
          const { valid } = await this.$refs.form.validate();
          if (valid) {
            this.save_Shift();
          }
        },

    async save_Shift() {
      this.loading = true;

      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_work_shift_timings, {
            input: {
              action_type: "UPDATE",
              work_shift_timings_id: this.workshiftData.work_shift_timings_id,
              work_shift_timings_name: this.shiftName,
              work_shift_start_timings: this.startTime,
              work_shift_end_timings: this.endTime,
              week_off: this.weekoffDays.map((d) => String(d)),
            },
          })
        );

        const response = JSON.parse(result.data.create_list_edit_delete_work_shift_timings);

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }

      } catch (error) {
        const msg =
          error?.errors?.[0]?.message ||
          error?.message ||
          "Something went wrong while updating shift.";
        this.$emit("errorMsg", msg);

      } finally {
        this.loading = false;
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

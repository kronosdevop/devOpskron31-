<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    max-width="500"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Doorlock Setting</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="closeDialog">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="mt-4">
        <div
          v-if="item && item.qr_details && item.qr_details.length > 1"
          class="text-left"
        >
          <div class="text-subtitle-2 mb-3">
            Select QR to configure doorlock:
          </div>
          <v-radio-group v-model="selectedQrIndex" class="mb-3">
            <v-radio
              v-for="(qr, index) in item.qr_details"
              :key="index"
              :value="index"
              :label="`QR ${index + 1} - ${qr.qr_label || 'Unnamed QR'}`"
            >
              <template v-slot:label>
                <div class="d-flex align-center">
                  <span class="mr-2">QR {{ index + 1 }}</span>
                  <span class="text-caption grey--text">{{
                    qr.qr_name || "Unnamed QR"
                  }}</span>
                  <v-chip
                    v-if="qr.is_door_lock === true"
                    size="x-small"
                    color="success"
                    class="ml-2"
                  >
                    Enabled
                  </v-chip>
                  <v-chip v-else size="x-small" color="grey" class="ml-2">
                    Disabled
                  </v-chip>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
          <div class="text-body-2">
            <span v-if="!getSelectedQrDoorLockStatus()">
              Do you want to enable doorlock for the selected QR?
            </span>
            <span v-else>
              Doorlock is enabled for the selected QR. Do you want to disable
              it?
            </span>
          </div>
        </div>
        <div v-else class="text-left">
          <span v-if="!item || !getDoorLockStatus()">
            Do you want to use doorlock while using QR?
          </span>
          <span v-else>
            Doorlock is enabled for this location. Do you want to turn it off?
          </span>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          color="primary"
          :loading="loading"
          @click="toggleDoorEnabled"
          :disabled="
            item &&
            item.qr_details &&
            item.qr_details.length > 1 &&
            selectedQrIndex === null
          "
        >
          <span
            v-if="
              !item ||
              (item.qr_details && item.qr_details.length > 1
                ? !getSelectedQrDoorLockStatus()
                : !getDoorLockStatus())
            "
            >Enable</span
          >
          <span v-else>Disable</span>
        </v-btn>
        <v-btn text @click="closeDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { edit_presence_qrs } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  name: "DoorlockDialog",
  props: {
    modelValue: Boolean,
    item: Object,
  },
  data() {
    return {
      loading: false,
      selectedQrIndex: null,
    };
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        // console.log(this.item)
        this.loading = false;
        // Reset selection when dialog opens
        this.selectedQrIndex = null;
        // Auto-select first QR if multiple exist
        if (
          this.item &&
          this.item.qr_details &&
          this.item.qr_details.length > 1
        ) {
          this.selectedQrIndex = 0;
        }
      }
    },
  },
  methods: {
    getDoorLockStatus() {
      return this.item &&
        this.item.qr_details &&
        this.item.qr_details.length == 1
        ? this.item.qr_details[0].is_door_lock === true
        : false;
    },
    getSelectedQrDoorLockStatus() {
      if (
        this.item &&
        this.item.qr_details &&
        this.item.qr_details.length > 1 &&
        this.selectedQrIndex !== null
      ) {
        return this.item.qr_details[this.selectedQrIndex].is_door_lock === true;
      }
      return false;
    },
    getSelectedQrLabel() {
      if (
        this.item &&
        this.item.qr_details &&
        this.item.qr_details.length > 1 &&
        this.selectedQrIndex !== null
      ) {
        return this.item.qr_details[this.selectedQrIndex].qr_label;
      }
      return this.item &&
        this.item.qr_details &&
        this.item.qr_details.length == 1
        ? this.item.qr_details[0].qr_label
        : this.item.location_id;
    },
    closeDialog() {
      this.$emit("clicked", 0);
      this.$emit("update:modelValue", false);
    },
    async toggleDoorEnabled() {
      if (!this.item || !this.item.location_id) return;
      this.loading = true;
      try {
        const input = {
          qr_label: this.getSelectedQrLabel(),
          is_door_lock:
            this.item && this.item.qr_details && this.item.qr_details.length > 1
              ? !this.getSelectedQrDoorLockStatus()
              : !this.getDoorLockStatus(),
        };
        const result = await API.graphql(
          graphqlOperation(edit_presence_qrs, { input })
        );
        this.loading = false;
        let response = JSON.parse(result.data.edit_presence_qrs);
        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
        this.closeDialog();
      } catch (error) {
        this.loading = false;
        this.$emit(
          "errorMsg",
          error.errors?.[0]?.message || "Error updating doorlock"
        );
        this.closeDialog();
      }
    },
  },
};
</script> 
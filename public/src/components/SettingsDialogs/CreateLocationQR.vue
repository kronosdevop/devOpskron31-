<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="qrCreation"
      @update:model-value="$emit('update:qrCreation', $event)"
      persistent
      max-width="400"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Create QR</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to create a QR for this
            <b> {{ rowInfo.location_name }}</b> ?
          </div>
          <v-form ref="form">
            <v-text-field
              density="compact"
              variant="outlined"
              label="Source Name"
              v-model="sourceName"
              style="max-width: 200"
              class="pt-2"
              :rules="[(v) => !!v || 'Required']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="locationQrCreation()"
            dark
            size="small"
            class="cardCss button-corner text-capitalize"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
import { create_presence_qrs } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    qrCreation: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      sourceName: "",
    };
  },
  methods: {
    close_dialog() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },

    async locationQrCreation() {
      const { valid } = await this.$refs.form?.validate?.();
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(create_presence_qrs, {
              input: {
                location_id: this.rowInfo.location_id,
                qr_name: this.sourceName,
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(result.data.create_presence_qrs);

          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
  },
};
</script>
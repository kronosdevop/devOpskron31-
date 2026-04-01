<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="rfidCreation"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add RFID Controller</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="loaction"
                  label="Select Location"
                  :items="loactionitems"
                  :search-input.sync="searchloc"
                  hide-no-data
                  hide-selected
                  :rules="[(v) => !!v || 'Required']"
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                />
                <v-text-field
                  density="compact"
                  variant="outlined"
                  v-model="rfidId"
                  label="Box ID"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            size="small"
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
import { get_location_details } from "@/mixins/GetLocations.js";
import { map_rfid_location } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  mixins: [get_location_details],
  props: {
    rfidCreation: Boolean,
  },
  data() {
    return {
      loading: false,
      rfidId: "",
      loaction: "",
      searchloc: "",
      loactionitems: [],
    };
  },
  watch: {
    rfidCreation: {
      async handler() {
        await this.get_location_details();
        await this.fetch_details();
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      this.locationList.forEach((element) => {
        if (element.location_name != "Scan AnyWhere")
          this.loactionitems.push({
            title: element.location_name,
            value: element.location_id,
          });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async delete_mutation() {
      const { valid } = await this.$refs.form?.validate?.();
      if (valid) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(map_rfid_location, {
              input: {
                rfid_box_id: this.rfidId,
                location_id: this.loaction,
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.map_rfid_location);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
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
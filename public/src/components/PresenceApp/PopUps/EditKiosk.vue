<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="kioskEdition"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Kiosk</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  v-model="kioskName"
                  label="Name"
                  :rules="[(v) => !!v || 'required ']"
                />
                <v-autocomplete
                  density="compact"
                  variant="outlined"
                  v-model="loaction"
                  label="Select Location"
                  :items="loactionitems"
                  :search-input.sync="searchloc"
                  hide-no-data
                  hide-selected
                  :rules="[(v) => !!v || 'Required']"
                  item-text="title"
                  item-value="location_id"
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
import { stichh_kiosk_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  mixins: [get_location_details],
  props: {
    kioskEdition: Boolean,
    kioskitem: Object,
  },
  data() {
    return {
      loading: false,
      kioskName: "",
      loaction: "",
      searchloc: "",
      loactionitems: [],
    };
  },
  watch: {
    kioskEdition: {
      async handler() {
        await this.get_location_details();
        await this.fetch_details();
        this.kioskName = this.kioskitem.kiosk_name;
        this.loaction = this.kioskitem.location_id;
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      this.loactionitems = [];
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          title: element.location_name,
          location_id: element.location_id,
        });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async delete_mutation() {
      const result = await this.$refs.form.validate();
      if (result.valid) {
        this.add_kiok();
      }
    },

    async add_kiok() {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(stichh_kiosk_function, {
              input: {
                kiosk_name: this.kioskName,
                location_id: this.loaction,
                kiosk_id: this.kioskitem.kiosk_id,
                action_type: "UPDATE_KIOSK",
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.stichh_kiosk_function);
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
    },
  },
};
</script>
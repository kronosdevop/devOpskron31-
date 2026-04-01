<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="kioskDeletion"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <!-- <v-toolbar-title class="text--black">
            <div class="custom-title">Delete Kiosk</div></v-toolbar-title
          > -->
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="">
          <div class="text-center">
            Are you sure you want to delete

            <b> {{ kioskitem.kiosk_name }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            :loading="loading"
            @click="delete_Entity()"
            dark
            size="small"
            class="text-capitalize cardCss button-corner"
          >
          Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { stichh_kiosk_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    kioskDeletion: Boolean,
    kioskitem: Object,
  },

  data() {
    return {
      loading: false,
    };
  },
  watch: {
    kioskDeletion: {
      async handler() {},
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_Entity() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(stichh_kiosk_function, {
            input: {
              action_type: "DELETE_KIOSK",
              kiosk_id: this.kioskitem.kiosk_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.stichh_kiosk_function);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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

<style>
</style>
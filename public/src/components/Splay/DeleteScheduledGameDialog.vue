<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogDeleteScheduledGame"
      max-width="500px"
      persistent
    >
      <v-card rounded="lg">
        <!--Toolbar/Header-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Delete Scheduled Game </span>
          <v-btn
            icon
            variant="text"
            @click="DialogDeleteScheduledGameEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Content-->
        <div class="text-center font-weight-bold mt-3">
          🚨 Do you want to delete this game scheduled at
          {{ Convert(StoreObj.game_scheduled_time) }} for category -
          {{ StoreObj.category_name }}?
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-2">
          <v-btn
            variant="flat"
            color="primary"
            rounded="lg"
            size="small"
            :loading="loading"
            @click="DeleteScheduledGame"
          >
            Delete
            <template #loader>
              <v-progress-circular indeterminate color="white" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { delete_scheduled_game } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogDeleteScheduledGame: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    loading: false,

    SnackBarComponent: {},
  }),

  methods: {
    async DeleteScheduledGame() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(delete_scheduled_game, {
            input: {
              game_session_id: this.StoreObj.game_session_id,
            },
          }),
        );
        let resultObj = JSON.parse(result.data.delete_scheduled_game);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogDeleteScheduledGameEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to delete scheduled game, try again",
        };
      } finally {
        this.loading = false;
      }
    },
    DialogDeleteScheduledGameEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    Convert(value) {
      if (!value) return "N/A";

      const date = new Date(value * 1000);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      return `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${date.getFullYear()}, ${hours}:${minutes}:${ampm}`;
    },
  },
};
</script>

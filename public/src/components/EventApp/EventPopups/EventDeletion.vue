<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="eventDelete"
      @update:model-value="eventDelete = $event"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <!-- <v-toolbar-title class="ml-2">
            <div class="custom-title">Delete Location</div></v-toolbar-title
          > -->
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <div class="delete-icon-container">
            <v-img
              :src="trashIcon"
              alt="Delete Icon"
              max-width="120"
              height="120"
              contain
              class="rotate-swing"
            />
          </div>
        </v-card-title>
        <v-card-text class="mt-4">
          <div class="text-center">
            Are you sure you want to delete the
            {{ eventInfo.event_name }} ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_event()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { edit_delete_events } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import trashIcon from "@/assets/trash.png";

export default {
  props: {
    eventDelete: Boolean,
    eventInfo: Object,
  },
  data() {
    return {
      loading: false,
      trashIcon: trashIcon,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_event() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_delete_events, {
            input: {
              action_type: "DELETE",
              event_id: this.eventInfo.event_id,
            },
          })
        );
        var response = JSON.parse(result.data.edit_delete_events);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.rotate-swing {
  animation: swing 2s ease-in-out infinite;
}

@keyframes swing {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.cardCss {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
  border-radius: 25px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3) !important;
  transition: all 0.3s ease !important;
}

.cardCss:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4) !important;
}

.button-corner {
  border-radius: 25px !important;
}

.delete-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  width: 100%;
}
</style>
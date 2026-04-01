<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="deleteBroadcast"
      @update:model-value="$emit('update:deleteBroadcast', $event)"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <div v-if="broadcast_info.is_default == 'FALSE'">
          <v-card-title class="text-center">
            <v-img
              :src="require('@/assets/trash.png')"
              alt="Delete Icon"
              max-width="800"
              height="150"
              contain
              class="rotate-swing"
            />
          </v-card-title>

          <v-card-text class="mt-6">
            <div class="text-center">
              Are you sure you want to delete
              <strong>{{ broadcast_info.team_name }}</strong> ?
            </div>
          </v-card-text>

          <v-card-actions class="justify-center">
            <v-btn
              @click="delete_event()"
              :loading="loading"
              dark
              class="text-capitalize cardCss button-corner text-white"
            >
              Yes, Delete It!
            </v-btn>
          </v-card-actions>
        </div>

        <div v-if="broadcast_info.is_default != 'FALSE'">
          <v-card-title class="text-center">
            <v-icon
              icon="mdi-alert-circle"
              size="120"
              color="#ff9800"
              class="pulse-glow"
            />
          </v-card-title>

          <v-card-text class="mt-6">
            <div class="text-center">
              Broadcast Channel Can't be <strong>Deleted</strong>
            </div>
          </v-card-text>

          <v-card-actions class="justify-center">
            <v-btn
              @click="close_dialog()"
              dark
              class="text-capitalize cardCss button-corner text-white"
            >
              OK
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { delete_broadcast_channel } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    deleteBroadcast: Boolean,
    broadcast_info: Object,
  },
  data() {
    return {
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_event() {
      this.loading = true;

      try {
        const userData = this.$store.getters.GetUserObj;

        if (!userData || !userData.user) {
          throw new Error("User data not available");
        }

        let result = await API.graphql(
          graphqlOperation(delete_broadcast_channel, {
            input: {
              team_id: this.broadcast_info.team_id,
              user_email_id: userData.user.user_email_id,
            },
          })
        );

        var response = JSON.parse(result.data.delete_broadcast_channel);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.close_dialog();
        } else {
          this.$emit(
            "errorMsg",
            response.Message || "Failed to delete broadcast channel"
          );
        }
      } catch (error) {
        console.error("Error deleting broadcast channel:", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to delete broadcast channel. Please try again.";
        this.$emit("errorMsg", errorMessage);
      } finally {
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

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .cardCss {
    padding: 10px 20px !important;
    font-size: 14px !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .cardCss {
    border: 2px solid #000 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .rotate-swing,
  .pulse-glow {
    animation: none;
  }

  .cardCss:hover {
    transform: none !important;
  }
}
</style>
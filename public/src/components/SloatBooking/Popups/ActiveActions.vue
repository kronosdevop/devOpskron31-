<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="activeDeactiveDialog"
      @update:model-value="$emit('update:activeDeactiveDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-title class="text-center">
          <div class="action-icon-container">
            <!-- Use image for deactivate, icon for activate -->
            <v-img
              v-if="rowData.resource_status == 'ACTIVE'"
              :src="trashIcon"
              alt="Delete Icon"
              max-width="120"
              height="120"
              contain
              class="rotate-swing"
            />
            <v-icon
              v-else
              icon="mdi-check-circle"
              size="120"
              color="#4caf50"
              class="pulse-glow"
            />
          </div>
        </v-card-title>

        <v-card-text class="mt-4">
          <div class="text-center">
            Are you sure you want to
            <strong>
              {{
                rowData.resource_status == "ACTIVE" ? "deactivate" : "activate"
              }}
              {{ rowData.resource_name }}
            </strong>
            ?
          </div>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn
            depressed
            :loading="loading"
            @click="active_deactive_actions()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            {{
              rowData.resource_status == "ACTIVE"
                ? "Yes, Deactivate!"
                : "Yes, Activate!"
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { edit_and_get_delete_resource } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import trashIcon from "@/assets/trash.png";

export default {
  props: {
    activeDeactiveDialog: Boolean,
    rowData: Object,
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

    async active_deactive_actions() {
      this.loading = true;

      try {
        var data = this.$store.getters.GetUserObj;

        if (!data || !data.organization) {
          throw new Error("User data not available");
        }

        let result = await API.graphql(
          graphqlOperation(edit_and_get_delete_resource, {
            input: {
              action_type: "DELETE_ACTIAVTE",
              organization_id: data.organization.organization_id,
              resource_id: this.rowData.resource_id,
              resource_status:
                this.rowData.resource_status == "ACTIVE"
                  ? "DEACTIVE"
                  : "ACTIVE",
            },
          })
        );

        var response = JSON.parse(result.data.edit_and_get_delete_resource);

        if (response.Status == "SUCCESS") {
          this.$emit("SuccessMsg", response.Message);
          this.close_dialog();
        } else {
          this.$emit(
            "errorMsg",
            response.Message || "Failed to update resource status"
          );
        }
      } catch (error) {
        console.error("Error updating resource status:", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to update resource status. Please try again.";
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

.action-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cardCss {
    padding: 10px 20px !important;
    font-size: 14px !important;
  }

  .action-icon-container {
    padding: 15px 0;
  }

  .action-icon-container .v-img {
    max-width: 100px !important;
    height: 100px !important;
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
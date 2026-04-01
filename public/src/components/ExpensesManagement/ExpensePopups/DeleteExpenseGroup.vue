<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="deleteGroup"
    @update:model-value="$emit('update:deleteGroup', $event)"
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
          <strong>{{ rowInfo.expense_group_name }}</strong> ?
        </div>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          :loading="loading"
          @click="delete_mutation()"
          dark
          class="text-capitalize cardCss button-corner text-white"
        >
          Yes, Delete It!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
<script>
import { activate_and_reactivate_expense_group } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rowInfo: Object,
    deleteGroup: Boolean,
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

    async delete_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(activate_and_reactivate_expense_group, {
            expense_group_id: this.rowInfo.expense_group_id,
            expense_group_status: "DEACTIVE",
          })
        );

        var response = JSON.parse(
          result.data.activate_and_reactivate_expense_group
        );

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.close_dialog();
        } else {
          this.$emit(
            "errorMsg",
            response.Message || "Failed to delete expense group"
          );
        }
      } catch (error) {
        console.error("Error deleting expense group:", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to delete expense group. Please try again.";
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
  .rotate-swing {
    animation: none;
  }

  .cardCss:hover {
    transform: none !important;
  }
}
</style>
<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="deleteExpense"
    @update:model-value="$emit('update:deleteExpense', $event)"
    persistent
    max-width="400"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="bg-white">
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
          <b> {{ custom_details.expense_name }}</b> ?
        </div>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          depressed
          :loading="loading"
          @click="delete_mutation()"
          dark
          class="cardCss button-corner text-capitalize text-white"
        >
          Yes, Delete It!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
  <script>
import { delete_expense } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import trashIcon from "@/assets/trash.png";

export default {
  props: {
    custom_details: Object,
    deleteExpense: Boolean,
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
    async delete_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(delete_expense, {
            input: {
              user_email_id: data.user.user_email_id,
              category_id: this.custom_details.category_id,
            },
          })
        );
        var response = JSON.parse(result.data.delete_expense);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.$refs.form.reset();
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
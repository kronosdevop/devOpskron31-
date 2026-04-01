<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog :model-value="editBlockDate" @update:model-value="$emit('update:editBlockDate', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="custom-title ml-2">
            {{ selectedOption === "change_price" ? "Edit Price" : "Edit Date" }}
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text>
          <v-radio-group v-model="selectedOption">
            <v-radio label="Edit price" value="change_price"></v-radio>
            <v-radio label="Unblock Date" value="enable_date"></v-radio>
          </v-radio-group>

          <v-text-field
            v-if="selectedOption === 'change_price'"
            v-model="priceAmount"
            label="Enter New Price"
            outlined
            dense
          ></v-text-field>
          <v-spacer />

          <div
            v-if="selectedOption === 'enable_date'"
            class="mt-n2 ml-2 d-flex align-center justify-space-between"
          >
            <p>
              Are you sure you want to Unblock
              <b>{{ ViewInfo.items.calender_date }}</b
              >?
            </p>
            <v-btn
              class="text-capitalize cardCss mt-10"
              :loading="loading"
              dark
              small
              @click="confirmEnable"
              >Yes</v-btn
            >
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            small
            v-if="selectedOption === 'change_price'"
            class="text-capitalize cardCss mt-n10 ma-2"
            dark
            :loading="loading"
            @click="Unblock_Selected_date()"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
import { create_update_calender } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    editBlockDate: Boolean,
    ViewInfo: Object,
  },
  data() {
    return {
      loading: false,
      selectedOption: "",
      priceAmount: this.ViewInfo?.price || "",
      Enable_selectedDate: this.ViewInfo.items.is_blocked || true,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectedOption = "";
    },

    confirmEnable() {
      this.Enable_selectedDate = false;
      this.Unblock_Selected_date(true); // Call with flag true
    },

    async Unblock_Selected_date(isFromConfirm = false) {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_update_calender, {
            input: {
              guest_house_id: this.ViewInfo.items.guest_house_id,
              calender_date: this.ViewInfo.items.calender_date,
              day_price: isFromConfirm
                ? this.ViewInfo.items.day_price
                : this.priceAmount,
              is_blocked: isFromConfirm
                ? this.Enable_selectedDate
                : this.ViewInfo.items.is_blocked,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.create_update_calender);
        // console.log("GraphQL Response:", response);

        if (response.Status === "SUCCESS") {
          // console.log("Date updated successfully");
          this.$emit("successMsg", response.Message);
          this.loading = false;
          this.selectedOption = "";
        } else {
          // console.error("Failed to update date");
          this.$emit("errorMsg", response.Message);
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
        console.error("Error updating date:", error);
      }
    },
  },
};
</script>

<style scoped>
.confirmation-text {
  margin-top: 10px;
}
</style>

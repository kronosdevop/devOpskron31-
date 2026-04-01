<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="reorderingStock"
      @update:model-value="$emit('update:reorderingStock', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Reorder Stock</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="form">
            <div class="text-left">
              Are you sure you want to Reorder

              {{ rowInfo.sub_category_name }} of {{ rowInfo.location_name }} ?
              <v-text-field
                variant="outlined"
                density="compact"
                label="Quantity*"
                v-model="reoderQuantity"
                @keypress="is_number($event)"
                class="mt-4"
                :rules="[(v) => !!v || 'Quantity is required']"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="flat"
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss"
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
import { Initiate_Reorder } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    reorderingStock: Boolean,

    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      reoderQuantity: "",
    };
  },
  watch: {
    reorderingStock: {
      async handler() {
        // console.log(this.subscriberitem);
      },
      immediate: true,
    },
  },
  methods: {
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    close_dialog() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      
      if (!this.reoderQuantity || this.reoderQuantity.trim() === '') {
        this.$emit("errorMsg", "Quantity is required");
        return;
      }

      this.loading = true;
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(Initiate_Reorder, {
            input: {
              sub_category_stock_id: this.rowInfo.sub_category_stock_id,
              user_email_id: data.user.user_email_id,
              quantity: this.reoderQuantity,
            },
          })
        );

        this.loading = false;
        let response = JSON.parse(result.data.Initiate_Reorder);
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
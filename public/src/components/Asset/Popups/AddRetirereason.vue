<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="retireAddition"
      @update:model-value="retireAddition = $event"
      persistent
      transition="dialog-bottom-transition"
      max-width="500"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Add Retire Reason</div></v-toolbar-title
          >
          <v-spacer />
          <!-- <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon> -->
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="retireName"
                  label="Reason*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end" style="border-top: 2px solid #eee">
          <v-btn text @click="close_dialog()">Back</v-btn>
          <v-btn color="primary" @click="validate_data()" :loading="loading"
            >Add</v-btn
          >
        </v-card-actions>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            size="small"
            class="text-capitalize cardCss button-corner text-white mt-n6"
          >
            Add
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
import { asset_retire } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    retireAddition: Boolean,
  },
  data() {
    return {
      retireName: "",

      loading: false,
    };
  },
  watch: {
    retireAddition: {
      async handler() {},
      immediate: true,
    },
  },
  computed: {},
  methods: {
    getcal() {
      this.modal = true;
    },
    formatDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_retire, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "CREATE_RETIRE_REASON",
              retire_reason: this.retireName,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.asset_retire);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
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
  
  <style>
</style>
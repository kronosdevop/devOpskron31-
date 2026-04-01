<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="visitorEdition"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Edit Vistior for {{ rowInfo.rfid }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="VisitorName"
                  label="Name"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_Entity()"
            size="small"
            color="primaryColor"
            class="text-capitalize cardCss button-corner"
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
import { edit_presence_visitors } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    visitorEdition: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      VisitorName: "",
    };
  },
  watch: {
    visitorEdition: {
      async handler() {
        if (this.visitorEdition == true) {
          this.VisitorName = this.rowInfo.visitor_name;
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_Entity() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(edit_presence_visitors, {
              input: {
                visitor_id: this.rowInfo.visitor_id,
                visitor_name: this.VisitorName,
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.edit_presence_visitors);
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
      }
    },
  },
};
</script>
    
    <style>
</style>
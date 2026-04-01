<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="campaignDialog" @update:model-value="$emit('update:campaignDialog', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Create Campaign
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="campaignName"
                  label="Campaign Name"
                  :rules="[(v) => !!v || 'Required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  dense
                  v-model="campaignDescription"
                  label="Campaign Description"
                  :rules="[(v) => !!v || 'Required ']"
                  outlined
                  rows="1"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-menu
                  ref="fromMenu"
                  v-model="fromMenu"
                  :close-on-content-click="false"
                  :return-value.sync="fromDate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="fromDate"
                      outlined
                      :rules="[(v) => !!v || 'Required ']"
                      label="Campaign Start Date"
                      readonly
                      dense
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="fromDate"
                    :min="minDate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="fromMenu = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.fromMenu.save(fromDate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12">
                <v-menu
                  ref="toMenu"
                  v-model="toMenu"
                  :close-on-content-click="false"
                  :return-value.sync="toDate"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="toDate"
                      outlined
                      dense
                      label="Campaign End Date"
                      :rules="[(v) => !!v || 'Required ']"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="toDate"
                    :min="minDate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="toMenu = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.toMenu.save(toDate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="selectedModel"
                  :items="productserviceList"
                  dense
                  item-text="label"
                  item-value="value"
                  label="Choose Product/Services "
                  outlined
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { create_campaigns } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_product_service_list } from "@/mixins/GetProductServiceList.js";

export default {
  props: {
    campaignDialog: Boolean,
  },
  mixins: [get_product_service_list],
  data() {
    return {
      campaignName: "",
      campaignDescription: "",
      fromDate: "",
      toDate: "",
      selectedModel: "",
      productserviceList: [],
      fromMenu: false,
      toMenu: false,
      minDate: new Date().toISOString().split("T")[0],
      loading: false,
    };
  },
  watch: {
    campaignDialog: {
      async handler() {
        if (this.campaignDialog == true) {
          this.productserviceList = [];
          await this.get_product_service_list();
          this.productListArray.forEach((element) => {
            this.productserviceList.push({
              label: element.product_name,
              value: element.product_id,
            });
          });
        }
      },
      immediate: true,
    },
  },

  methods: {
    validate_data() {
      if (this.$refs.form.validate()) {
        this.create_campaign_list();
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async create_campaign_list() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_campaigns, {
            input: {
              campaign_name: this.campaignName,
              campaign_description: this.campaignDescription,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              campaign_start_date: this.fromDate,
              campaign_end_date: this.toDate,
              product_id: this.selectedModel,
            },
          })
        );
        var response = JSON.parse(result.data.create_campaigns);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
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
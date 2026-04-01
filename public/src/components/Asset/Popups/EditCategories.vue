<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriesEddition"
      @update:model-value="categoriesEddition = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Edit Categories</div>
          </v-toolbar-title>
          <v-spacer />
          <!-- <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon> -->
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="categoriesName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12">
                  <v-textarea
                    dense
                    v-model="categoriesdescription"
                    label="Description"
                    :rules="[(v) => !!v || 'required ']"
                    class="mr-2"
                    outlined
                  ></v-textarea>
                </v-col> -->
              <v-col cols="12">
                <v-select
                  v-model="depreciationCode"
                  label="Category Depreciation(%)*"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                  :items="depreciationitems"
                ></v-select>
              </v-col>
              <!-- <v-col cols="12" class="mt-n5">
                <v-checkbox
                  v-model="isverification"
                  label="Set Asset Verification"
                />
              </v-col> -->
              <!-- <v-col cols="12">
                <v-dialog
                  ref="dialog1"
                  v-model="modal"
                  color="primaryColor"
                  :return-value.sync="date"
                  persistent
                  width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      :value="computedDateFormatted"
                      @click="modal = true"
                      dense
                      outlined
                      v-show="isverification == true"
                      persistent-hint
                      class="mr-2"
                      label="Category Verification Date"
                      color="primaryColor"
                      :rules="verficationdaterule"
                      append-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    >
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :min="new Date().toISOString().substr(0, 10)"
                    v-model="date"
                    color="primaryColor"
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="primaryColor" @click="modal = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primaryColor"
                      @click="$refs.dialog1.save(date)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col> -->
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end" style="border-top: 2px solid #eee">
          <v-btn text @click="close_dialog()">Back</v-btn>
          <v-btn color="primary" @click="validate_data()" :loading="loading"
            >Save</v-btn
          >
        </v-card-actions>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Save
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
import { asset_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    categoriesEddition: Boolean,
    categoriesItem: Object,
  },
  data() {
    return {
      categoriesName: "",
      depreciationCode: "",
      categoriesdescription: "",
      date: "",
      modal: false,
      isverification: false,
      loading: false,
      depreciationitems: Array.from({ length: 100 }, (_, i) => i + 1),
    };
  },
  watch: {
    categoriesEddition: {
      async handler() {
        if (this.categoriesEddition == true) {
          this.date =
            !this.categoriesItem.category_verification_date ||
            this.categoriesItem.category_verification_date == "N/A"
              ? ""
              : this.categoriesItem.category_verification_date;
          this.categoriesName = this.categoriesItem.category_name;
          this.categoriesdescription = this.categoriesItem.category_description;
          this.depreciationCode = this.categoriesItem.category_depriciation;
          this.isverification =
            this.categoriesItem.is_category_verification == null
              ? false
              : this.categoriesItem.is_category_verification;
        }
      },
      immediate: true,
    },
  },
  computed: {
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
    verficationdaterule() {
      return this.isverification ? [(v) => !!v || "Required"] : [];
    },
  },
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
          graphqlOperation(asset_categories, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "UPDATE_CATEGORY",
              category_name: this.categoriesName,
              category_depriciation: Number(this.depreciationCode),
              category_id: this.categoriesItem.category_id,
              is_category_verification: this.isverification,
              category_verification_date: this.isverification
                ? this.date
                : "N/A",
              category_description: this.categoriesdescription,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.asset_categories);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
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
  
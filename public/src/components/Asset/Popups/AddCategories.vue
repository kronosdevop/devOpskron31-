<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriesAddition"
      @update:model-value="categoriesAddition = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title>
            <div class="custom-title">Create Categories</div></v-toolbar-title
          >
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
                  label="Description*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                ></v-textarea>
              </v-col> -->
              <v-col cols="12">
                <v-select
                  v-model="depreciationCode"
                  label="Category Depreciation(%)"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                  :items="depreciationitems"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Category Prefix*"
                  maxlength="3"
                  hint="Max  3 characters"
                  :rules="[(v) => !!v || 'required ']"
                  v-model="categoryPrefix"
                  @input="convert_to_uppercase"
                  density="compact"
                  variant="outlined"
                />
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
                      v-model="computedDateFormatted"
                      dense
                      outlined
                      v-show="isverification == true"
                      persistent-hint
                      class="mr-2"
                      label="Category Verfication Date"
                      color="primaryColor"
                      :rules="verficationdaterule"
                      append-icon="mdi-calendar"
                      @click:append="date ? getcal() : getcal()"
                      v-bind="attrs"
                      v-on="on"
                      readonly
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
            >Create</v-btn
          >
        </v-card-actions>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Create
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
    categoriesAddition: Boolean,
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
      categoryPrefix: "",
    };
  },
  watch: {
    categoriesAddition: {
      async handler() {
        this.categoryPrefix = "";
      },
      immediate: true,
    },
  },
  // computed: {
  //   computedDateFormatted() {
  //     return this.formatDate(this.date);
  //   },
  //   verficationdaterule() {
  //     if (this.isverification == true) {
  //       return [(v) => !!v || "Required"];
  //     } else {
  //       return [];
  //     }
  //   },
  // },
  methods: {
    getcal() {
      this.modal = true;
    },

    fetch_category_name() {
      this.categoriesdescription = this.categoriesName;
    },

    convert_to_uppercase() {
      this.categoryPrefix = this.categoryPrefix.toUpperCase();
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
          graphqlOperation(asset_categories, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "CREATE_CATEGORY",
              category_name: this.categoriesName,
              category_depriciation:
                this.depreciationCode == "" || this.depreciationCode == null
                  ? "0"
                  : this.depreciationCode.toString(),
              is_category_verification:
                this.isverification == null ? false : this.isverification,
              category_verification_date:
                this.isverification == true ? this.date : "",
              category_description: this.categoriesdescription,
              category_prefix: this.categoryPrefix,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.asset_categories);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.$refs.form.reset();
          this.categoryPrefix = "";
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
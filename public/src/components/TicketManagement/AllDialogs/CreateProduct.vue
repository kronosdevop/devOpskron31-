<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addproduct" @update:model-value="$emit('update:addproduct', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            > <div class="custom-title">
            Create Product / Service
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              dense
              v-model="productName"
              label="Name"
              :rules="[(v) => !!v || 'required ']"
              class="mr-2 mt-4 ml-2"
              outlined
            />
            <v-textarea
              dense
              v-model="Description"
              label="Description"
              :rules="[(v) => !!v || 'required ']"
              class="mr-2 ml-2"
              :counter="200"
              outlined
              maxlength="200"
            />
            <v-text-field
              dense
              v-model="Url"
              label="Domain Url"
              :rules="[urlRule]"
              class="mr-2 ml-2"
              outlined
            />
            <v-checkbox
              class="mt-n3 ml-1"
              v-model="otpVerification"
              label="OTP Verification Required ?"
            ></v-checkbox>
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_product } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addproduct: Boolean,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      productName: "",
      Description: "",
      Url: "",
      userselect: "",
      userArray: [],
      searchF: "",
      ServiceProduct: "",
      loading: false,
      producttype: "",
      producttypeitems: [
        "Technology",
        "Finance",
        "Healthcare",
        "Retail",
        "Automotive",
        "Energy",
        "Telecommunications",
        "Media",
        "Agriculture",
        "Construction",
        "Education",
        "Entertainment",
        "Food & Beverage",
        "Hospitality",
        "Manufacturing",
        "Real Estate",
        "Transportation",
        "Travel",
        "Utilities",
        "Fashion",
        "Beauty",
        "Pharmaceuticals",
        "Banking",
        "Insurance",
        "Aerospace",
        "Chemicals",
        "Consumer Electronics",
        "Furniture",
        "Gaming",
        "Home Improvement",
        "Information Technology",
        "Logistics",
        "Mining",
        "Music",
        "Oil & Gas",
        "Publishing",
        "Sports",
        "Textiles",
        "Toys",
        "Wine & Spirits",
        "E-commerce",
        "Fitness",
        "Jewelry",
        "Legal Services",
        "Marketing",
        "Shipping",
        "Waste Management",
        "Wireless",
      ],
      otpVerification: false,
    };
  },
  watch: {
    addproduct: {
      async handler() {
        // await this.get_all_org_users();
        // await this.fetch_details();
      },

      immediate: true,
    },
  },
  methods: {
    urlRule(value) {
      if (!value || this.isValidUrl(value)) {
        return true; // Validation passed
      }
      return "Invalid URL";
    },
    isValidUrl(url) {
      // You can implement your URL validation logic here
      // For a basic example, you can use a regular expression
      const urlPattern =
        /^www\.[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})$/;
      return urlPattern.test(url);
    },
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },
    // fetch_details() {
    //   this.orgUsers.forEach((element) => {
    //     if (element.user_status == "ACTIVE") {
    //       this.userArray.push({
    //         full_user_name: element.full_user_name,
    //         user_id: element.user_id,
    //       });
    //     }
    //   });

    //   this.userArray.sort((a, b) =>
    //     a.full_user_name.localeCompare(b.full_user_name)
    //   );
    // },
    async validate_data() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(create_product, {
              input: {
                organization_id: data.organization.organization_id,
                product_name: this.productName,
                // industries_type: this.ServiceProduct,
                product_description: this.Description,
                product_domain_url: this.Url,
                is_otp_verification_required: this.otpVerification,
                // product_logo:

                product_created_by: data.user.user_email_id,
              },
            })
          );
          var response = JSON.parse(result.data.create_product);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
            this.$emit("successMsg", response.Message);
            this.$emit("productRefresh", "refresh");
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.$emit("errorMsg", error.errors[0].message);
          this.loading = false;
        }
      }
    },
  },
};
</script>

<style>
</style>
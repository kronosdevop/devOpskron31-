<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="producteditdetails" @update:model-value="$emit('update:producteditdetails', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Edit Product
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
              label="Product Name"
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
              outlined
              :counter="200"
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
            <v-select
              outlined
              dense
              v-model="producttype"
              label="Indindustry Vertical"
              item-text="name"
              item-value="value"
              class="mr-2 ml-2"
              :rules="[(v) => !!v || 'required ']"
              :items="producttypeitems"
            />
            <v-autocomplete
              dense
              v-model="userselect"
              label="Select Product Admin"
              outlined
              item-text="full_user_name"
              item-value="user_id"
              :items="userArray"
              :search-input.sync="searchF"
              hide-no-data
              :rules="[(v) => !!v || 'required ']"
              class="mr-2 ml-2"
              @change="get_data()"
              hide-selected
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { edit_product_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    producteditdetails: Boolean,
    editdetails: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      productName: "",
      loading: false,
      Description: "",
      searchF: "",
      Url: "",
      userselect: "",
      userArray: [],
      product_id: "",
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
    };
  },
  watch: {
    producteditdetails: {
      async handler() {
        this.$store.commit("Setnamesearch", this.searchF);
        await this.get_all_org_users();
        await this.fetch_details();

        // var data = this.$store.getters.Getproductitems;
        this.productName = this.editdetails.product_name;
        this.Description = this.editdetails.product_description;
        this.producttype = this.editdetails.product_type;
        this.userselect = this.editdetails.product_head;
        this.product_id = this.editdetails.product_id;
        this.Url = this.editdetails.product_domain_url;
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
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });

      this.userArray.sort((a, b) =>
        a.full_user_name.localeCompare(b.full_user_name)
      );
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(edit_product_details, {
              input: {
                product_id: this.product_id,
                product_name: this.productName,
                product_type: this.producttype,
                product_description: this.Description,
                product_domain_url: this.Url == "" ? undefined : this.Url,
                product_logo: undefined,
                product_head: this.userselect,
              },
            })
          );
          var response = JSON.parse(result.data.edit_product_details);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
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
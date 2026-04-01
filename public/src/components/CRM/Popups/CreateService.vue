<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addservice" @update:model-value="$emit('update:addservice', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >
            <div class="custom-title">Create Service
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              dense
              v-model="serviceName"
              label="Service Name"
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
            <v-autocomplete
              dense
              v-model="userselect"
              label="Select Service Admin"
              outlined
              item-text="full_user_name"
              item-value="user_id"
              :items="userArray"
              :search-input.sync="searchF"
              hide-no-data
              :rules="[(v) => !!v || 'required ']"
              class="mr-2 ml-2"
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
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  //
  <script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { create_services } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    addservice: Boolean,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      serviceName: "",
      Description: "",
      searchF: "",
      Url: "",
      loading: false,
      userselect: "",
      userArray: [],
    };
  },
  watch: {
    addservice: {
      async handler() {
        this.$store.commit("Setnamesearch", this.searchF);
        await this.get_all_org_users();
        await this.fetch_details();
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
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(create_services, {
              input: {
                organization_id: data.organization.organization_id,
                service_name: this.serviceName,
                service_description: this.Description,
                service_domain_url: this.Url == "" ? undefined : this.Url,
                // service_logo:
                user_id: this.userselect,
                user_email_id: data.user.user_email_id,
              },
            })
          );
          var response = JSON.parse(result.data.create_services);
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
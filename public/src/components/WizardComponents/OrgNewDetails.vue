<template>
  <div>
    <v-card flat>
      <v-form ref="form">
        <v-row class="mt-3" no-gutters>
          <v-col cols="12" class="d-flex align-center justify-center">
            <b>Customize your app in one minute ?</b>
          </v-col>
          <v-col class="mt-2" cols="12">
            <v-text-field
              density="compact"
              rows="1"
              variant="outlined"
              readonly
              :rules="[(v) => !!v || 'Required ']"
              placeholder="Company Name*"
              v-model="orgName"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" class="d-flex align-center justify-center">
            <b>What's your role in the Company</b>
          </v-col>

          <v-col class="mt-2" cols="12">
            <v-text-field
              rows="1"
              density="compact"
              variant="outlined"
              v-model="roleinCompany"
              :rules="[(v) => !!v || 'Required ']"
              placeholder="Job title*"
            />
          </v-col>
        </v-row>
      </v-form>
      <v-card-actions class="justify-center mt-5">
        <v-btn
          variant="flat"
          :loading="loading"
          @click="next_step()"
          color="primary"
          class="cardCss mt-3"
        >
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

import { get_Org_details } from "@/mixins/GetOrgDetails.js";

var axios = require("axios");

export default {
  mixins: [get_Org_details],
  data() {
    return {
      orgName: "",
      selectedWeeks: [],
      timezonesArray: [],
      roleinCompany: "",
      loading: false,
    };
  },
  async created() {
    this.selectedWeeks = [];
    this.timezonesArray = [];
    await this.get_Org_details();

    this.fetch_team_details();
    // this.fetch_regions();
  },

  methods: {
    fetch_team_details() {
      var response = this.orgDetails;
      this.orgName = response.organization.organization_name;
    },

    async next_step() {
      const {valid} = await this.$refs.form.validate();
      if (valid) {
        var firstStepData = {
          orgname: this.orgName,
          jobtitle: this.roleinCompany,
        };
       
        this.$emit("emitSecondSTep", firstStepData);
      }
    },
  },
};
</script>
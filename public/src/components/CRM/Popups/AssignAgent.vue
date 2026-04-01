<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addAgentDialog" @update:model-value="$emit('update:addAgentDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            Add Agents
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-4" no-gutters>
              <v-col>
                <v-autocomplete
                  dense
                  v-model="selectData"
                  label="Select Users"
                  outlined
                  item-text="label"
                  item-value="value"
                  :items="agentDetails"
                  :search-input.sync="searchF"
                  :menu-props="{ contentClass: 'select-items' }"
                  class="mr-2"
                  @change="searchF = ''"
                  cache-items
                  multiple
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
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
// import { campaign_asing_to_users } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    addAgentDialog: Boolean,
  },
  mixins: [get_all_org_users],
  watch: {
    addAgentDialog: {
      async handler() {
        this.agentDetails = [];
        this.selectData = [];
        this.$store.commit("Setnamesearch", this.searchF);
        await this.get_all_org_users();
        this.fetch_users();
      },
      immediate: true,
    },
  },
  data() {
    return {
      selectData: [],
      loading: false,
      tableData: [],
      agentDetails: [],
      searchF: "",
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_users() {
      this.agentDetails = [];

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.agentDetails.push({
            label: element.full_user_name,
            value: element.user_id,
          });
        }
      });
      this.agentDetails.sort((a, b) => a.label.localeCompare(b.agentDetails));
    },
    convert_date(dateGMTSplit) {
      function pad(x) {
        return ("00" + x).slice(-2);
      }
      if (dateGMTSplit) {
        let b = dateGMTSplit.split(/\D+/);
        let d = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
        return `${pad(d.getMonth() + 1)}/${pad(
          d.getDate()
        )}/${d.getFullYear()} : ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } else {
        return "NA";
      }
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_agents_to_campaigns();
      }
    },

    deleteItem() {},
    async add_agents_to_campaigns() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(campaign_asing_to_users, {
            input: {
              organization_id: data.organization.organization_id,
              user_ids: this.selectData,
              campaign_id: this.$store.getters.Getproductitems.campaign_id,
            },
          })
        );
        var response = JSON.parse(result.data.campaign_asing_to_users);
        this.selectData = [];
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("succesMsg", response.Message);
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
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="teamRoom" @update:model-value="$emit('update:teamRoom', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Team Details
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card flat :height="440" :loading="loading" class="overflow-auto">
          <v-card-text>
            <v-list two-line>
              <v-list-item-subtitle class="text-left mt-n2 mb-2">
                The following users part of discussion room
                <b> {{ rowInfo.team_name }} </b> event</v-list-item-subtitle
              >
              <template v-for="(item, index) in groupItems" :key="item.full_user_name">
        <v-list-item class="mt-n2">
                  <v-avatar size="32" class="mr-2 mt-n1" color="#117658">
                    <span class="white--text">
                      {{ item.full_user_name.substring(0, 1) }}</span
                    >
                  </v-avatar>

                  <v-list-item-content>
                    <v-list-item-title
                      class=""
                      v-html="item.full_user_name"
                    ></v-list-item-title>
                    <v-list-item-title
                      v-html="item.user_email_id"
                      class="text-left"
                    ></v-list-item-title>
                    <v-divider
                      class="mt-n2"
                      v-if="index < groupItems.length - 1"
                      :key="index"
                    ></v-divider>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { get_team_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    teamRoom: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      groupItems: [],
    };
  },
  watch: {
    teamRoom: {
      async handler() {
        await this.fecth_team_details();
        this.loading = false;
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async fecth_team_details() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_team_details, {
            input: {
              organization_id: data.organization.organization_id,
              team_id: this.rowInfo.team_id,
            },
          })
        );
        this.groupItems = [];
        this.loading = false;
        var response = JSON.parse(result.data.get_team_details);
        if (response.Status == "SUCCESS") {
          this.groupItems = response.team_users_list;
        } else {
          this.groupItems = [];
        }

        this.loading = false;
        // this.tableData = response.data;
      } catch (error) {
        this.loading = false;
      }
    },
  },
};
</script>
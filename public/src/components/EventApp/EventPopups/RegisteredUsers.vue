<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="Eventlist"
      @update:model-value="Eventlist = $event"
      persistent
      max-width="600"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Event Registeration List for {{ eventInfo.event_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card :loading="loading" flat :height="440" class="overflow-auto">
          <v-card-text class="">
            <v-list three-line>
              <v-list-item-subtitle class="text-left mt-2 mb-2">
                The following users have registered for the
                <b> {{ eventInfo.event_name }} </b> event</v-list-item-subtitle
              >
              <template v-for="(item, index) in items" :key="item.user_name">
                <!-- <v-divider v-if="item.index - 1" :key="index"></v-divider> -->

                <v-list-item>
                  <v-avatar size="32" class="mr-2 mt-n10" color="#117658">
                    <span class="white--text">
                      {{ item.user_name.substring(0, 1) }}</span
                    >
                  </v-avatar>

                  <v-list-item-content>
                    <v-list-item-title
                      class="mt-n6"
                      v-html="item.user_name"
                    ></v-list-item-title>
                    <v-list-item-title
                      v-html="item.user_email_id"
                      class="text-left mt-n6"
                    ></v-list-item-title>
                    <v-divider
                      class="mt-n6 mb-n8"
                      v-if="index < items.length - 1"
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
import { event_registers_members_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    eventInfo: Object,
    Eventlist: Boolean,
  },
  data() {
    return {
      loading: false,
      items: [],
    };
  },
  watch: {
    Eventlist: {
      async handler() {
        if (this.Eventlist == true) {
          this.list_users();
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async list_users() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(event_registers_members_list, {
            input: {
              event_id: this.eventInfo.event_id,
              nextToken: null,
              limit: 100,
            },
          })
        );
        this.items = [];
        var response = result.data.event_registers_members_list;

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.items = response.data;
        } else {
          this.items = [];
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
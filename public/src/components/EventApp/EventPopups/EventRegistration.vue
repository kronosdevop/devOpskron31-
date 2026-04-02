<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="displayEvents"
      @update:model-value="displayEvents = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title v-if="rowInfo.displaytype == 'eventunregistartion'">
            <div class="custom-title">Event Registeration</div>
          </v-toolbar-title>
          <v-toolbar-title v-else>
            <div class="custom-title">
              Event UnRegisteration
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="text-left pa-0">
          <v-card flat class="full-width-card">
            <v-img
              class="text-white align-end"
              height="100px"
              :src="require('@/assets/event-banner.png')"
              cover
            >
              <v-card-title> {{ rowInfo.info.event_name }}</v-card-title></v-img
            >
            <v-card-text class="text-black">
              <span> <b>About this Event : </b></span><br /><br />

              <span> Date : {{ event_date }}</span> <br />

              <span>Start Time : {{ rowInfo.info.event_start_time }}</span
              ><br />

              <span>End Time : {{ rowInfo.info.event_end_time }}</span
              ><br /><br />

              <span>{{ rowInfo.info.event_description }}</span
              ><br />
              <span
                ><a :href="rowInfo.info.address_or_url" target="_blank">
                  {{ rowInfo.info.address_or_url }}</a
                ></span
              >
              <v-divider class="mt-2"></v-divider>
              <v-row class="mt-5">
                <v-col cols="6">
                  <v-text-field
                    v-model="user_name"
                    label="Name"
                    density="compact"
                    variant="outlined"
                    readonly
                    style="max-width: 200px"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="user_email_id"
                    label="Email-ID"
                    readonly
                    density="compact"
                    variant="outlined"
                    class="ml-n4"
                    style="max-width: 300px"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate()"
            :loading="loading"
            dark
            size="small"
            v-if="rowInfo.displaytype == 'eventunregistartion'"
            class="text-capitalize cardCss text-white ml-2 mt-4"
          >
            Register
          </v-btn>

          <v-btn
            @click="unregister_event()"
            :loading="loading"
            dark
            size="small"
            v-if="rowInfo.displaytype == 'eventregistartion'"
            class="text-capitalize cardCss text-white ml-2 mt-4"
          >
            UnRegister
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { un_or_register_members_for_event } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rowInfo: Object,
    displayEvents: Boolean,
  },
  data() {
    return {
      loading: false,
      event_date: "",
      user_email_id: "",
      user_name: "",
    };
  },
  watch: {
    displayEvents: {
      async handler() {
        if (this.displayEvents == true) {
          this.event_date =
            this.fetch_value(this.rowInfo.info.from_date) +
            " - " +
            this.fetch_value(this.rowInfo.info.to_date);
          this.user_email_id =
            this.$store.getters.GetUserObj.user?.user_email_id;
          this.user_name = this.$store.getters.GetUserObj.user?.full_user_name;
          // console.log(this.rowInfo.info);
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_value(date) {
      const dates = new Date(date);
      const a = dates.toLocaleDateString();
      return a.toUpperCase();
    },

    validate() {
      if (
        this.rowInfo.info.register_users.includes(
          this.rowInfo.info.register_users
        )
      ) {
        this.$emit("check", 0);
      } else if (this.rowInfo.info.available_capcity == "0") {
        this.$emit("check", 1);
      } else {
        this.register_event();
      }
    },

    close_dialog() {
      this.$emit("clciked", 0);
    },
    async unregister_event() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(un_or_register_members_for_event, {
            input: {
              register_status: "UNREGISTER",
              event_id: this.rowInfo.info.event_id,
              user_id: data.user.user_id,
              user_email_id: this.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.un_or_register_members_for_event);
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
    },

    async register_event() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(un_or_register_members_for_event, {
            input: {
              register_status: "REGISTER",
              event_id: this.rowInfo.info.event_id,
              user_id: data.user.user_id,
              user_email_id: this.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.un_or_register_members_for_event);
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
    },
  },
};
</script>

<style scoped>
.full-width-card {
  width: 100% !important;
  max-width: none !important;
}
</style>
<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="historydailog" @update:model-value="$emit('update:historydailog', $event)" persistent max-width="800" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
            Ticket ID : {{ ticket_no_id }}
          </div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4 text-left">
        <v-row>
          <v-col cols="6">
            <div class="mt-n2"><h4>Ticket Details</h4></div>
            <v-divider class="mb-1 mt-1" />
            <div><b>Ticket ID : </b>{{ ticket_no_id }}</div>
            <div class="mt-1"><b>Product : </b>{{ product_name }}</div>
            <div class="mt-1"><b>Category : </b>{{ categorie_name }}</div>
            <div class="mt-1">
              <b>Preferred Time : </b
              >{{
                slot_timeings != undefined ? fetch_value(slot_timeings) : "N/A"
              }}
            </div>
            <div class="mt-1">
              <b>Ticket Status : </b>
              <span :style="getStatusColorStyle">
                {{ rowInfo.ticket_status }}
              </span>
            </div>
            <div class="mt-1">
              <b>Ticket Raised On : </b> {{ get_date(ticket_raised_on) }}
            </div>
            <div class="mt-1">
              <b>Ticket Description : </b>{{ ticket_description }}
            </div>
            <div class="mt-1">
              <b>Admin Comments : </b
              >{{
                rowInfo.admin_comments == "-" ? "N/A" : rowInfo.admin_comments
              }}
            </div>

            <!-- <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-5">
              <h4>Customer Details</h4>
            </div>
            <v-divider class="mb-1 mt-1" />

            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-1">
              <b>Name : </b>{{ rowInfo.user_name }}
            </div>
            <div v-if="rowInfo.ticket_status == 'COMPLETED'" class="mt-1">
              <b>Email Id : </b>{{ rowInfo.user_email_id }}
            </div> -->
          </v-col>
          <v-divider
            vertical
            v-if="
              ticket_status == 'ASSIGNED' ||
              ticket_status == 'COMPLETED' ||
              ticket_status == 'PAUSED'
            "
          />
          <v-col
            cols="6"
            v-if="
              ticket_status == 'ASSIGNED' ||
              ticket_status == 'COMPLETED' ||
              ticket_status == 'PAUSED'
            "
          >
            <div class="mt-n2"><b>Assigned User</b></div>
            <v-divider class="mb-1 mt-1" />
            <div
              v-if="
                user_profile_pic_url != undefined &&
                user_profile_pic_url != 'N/A'
              "
              class="caption"
            >
              <v-avatar size="50" class="mt-1 mb-1">
                <v-img :src="user_profile_pic_url" contain />
              </v-avatar>
            </div>
            <div v-else>
              <v-avatar size="50" class="ml-2" color="primaryColor">
                <span class="white--text">
                  {{ full_user_name.substring(0, 1) }}</span
                >
              </v-avatar>
            </div>
            <div class="mt-1"><b>Name : </b> {{ full_user_name }}</div>
            <div class="mt-1">
              <b>Contact Number : </b> {{ user_full_contact_number }}
            </div>
            <!-- <div class="mt-1"><b>Email : </b> {{ ticket_assign_to }}</div> -->
            <div class="mt-1">
              <b>Assigned On : </b> {{ get_date(ticket_assigned_on) }}
            </div>
            <div v-if="rowInfo.ticket_status == 'PAUSED'" class="mt-1">
              <b>Paused On : </b> {{ get_date(rowInfo.pause_time) }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <!-- <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="delete_mutation()"
          dark
          class="cardCss button-corner text-capitalize"
        >
          Claim
        </v-btn>
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>
          
<script>
export default {
  props: {
    rowInfo: Object,
    historydailog: Boolean,
  },
  data() {
    return {
      loading: false,
      product_name: "",
      categorie_name: "",
      ticket_status: "",
      slot_timeings: "",
      full_user_name: "",
      user_full_contact_number: "",
      ticket_no_id: "",
      user_name: "",
      ticket_raised_on: "",
      ticket_assign_to: "",
      user_profile_pic_url: "",
      ticket_assigned_on: "",
      ticket_description: "",
    };
  },

  computed: {
    getStatusColorStyle() {
      if (this.rowInfo.ticket_status === "ASSIGNED") {
        return { color: "#4CAF50" };
      } else if (this.rowInfo.ticket_status === "INPROGRESS") {
        return { color: "#FF9800" };
      } else if (this.rowInfo.ticket_status === "COMPLETED") {
        return { color: "#009688" };
      } else {
        return { color: "" };
      }
    },
  },

  watch: {
    historydailog: {
      async handler() {
        if (this.historydailog == true) {
          this.full_user_name = "";
          this.user_full_contact_number = "";
          this.product_name = this.rowInfo.product_name;
          this.categorie_name = this.rowInfo.categorie_name;
          this.ticket_status = this.rowInfo.ticket_status;
          this.slot_timeings = this.rowInfo.preferred_timings;

          this.ticket_no_id = this.rowInfo.ticket_no_id;
          this.user_name = this.rowInfo.user_name;
          this.ticket_raised_on = this.rowInfo.ticket_raised_on;

          this.ticket_assign_to = this.rowInfo.ticket_assign_to;
          this.ticket_description = this.rowInfo.ticket_description;
          this.ticket_assigned_on = this.rowInfo.ticket_assigned_on;
          if (this.rowInfo.ticket_assigned_user != undefined) {
            this.full_user_name =
              this.rowInfo.ticket_assigned_user.full_user_name;
            this.user_full_contact_number =
              this.rowInfo.ticket_assigned_user.user_full_contact_number;
            this.user_profile_pic_url =
              this.rowInfo.ticket_assigned_user.user_profile_pic_url;
          }
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;

      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
      return concatDateTime;
    },
    get_date(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
  },
};
</script>
          
          <style>
</style>
<template>
  <div>
    <!-- eslint-disable -->
    <!-- <v-navigation-drawer
      v-model="notificationTab"
      app
      right
      temporary
      width="400"
      class="pa-0"
    > -->
    <v-card elevation="2" rounded="lg" class="mt-4" style="height: 280px; overflow-y: auto;">
      <v-card-title class="py-2 px-3">
        <span class="text-h6 font-weight-bold">Recent Notifications</span>
      </v-card-title>
      <v-divider />
      <v-list dense class="pa-0">
        <template v-if="sortedFilteredNotifications.length">
          <template v-for="(item, index) in sortedFilteredNotifications.slice(0, 5)" :key="index">
            <v-list-item class="px-4 py-2 notification-list-item" >
              <v-list-item-content>
                <div class="d-flex align-center" style="width: 100%;">
                  <span class="text-body-2 font-weight-medium" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ item.msg_title }}
                  </span>
                  </div>
                  <div>
                  <span class="text-body-2 font-weight-medium grey--text " style="max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ item.msg_description }}
                  </span>
                  </div>
                 <div>
                  <span class="text-body-2 font-weight-medium grey--text " style="min-width: 80px; text-align: right;">
                    {{ fetch_value(item.msg_created_on) }}
                  </span>
                </div>
              </v-list-item-content>
            </v-list-item>
            <v-divider v-if="index < sortedFilteredNotifications.slice(0, 5).length - 1" class="mx-4" />
          </template>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-content class="d-flex align-center justify-center" style="height: 120px;">
              <v-list-item-title class="grey--text">No notifications</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
    <!-- </v-navigation-drawer> -->
    <!-- <v-dialog :model-value="notificationTab" @update:model-value="$emit('update:notificationTab', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Notifications</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <v-list-item-group>
              
              <v-list-item v-for="(item, index) in notifications" :key="index">
                <v-list-item-content>
                  <v-list-item-title>{{ item.messageTitle }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    item.body.data.msg_sent_by
                  }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{
                    fetch_value(item.body.data.msg_created_on)
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog> -->
  </div>
</template>
<script>
/* eslint-disable*/
// import { getNotifications } from "@/mixins/NotificationStorageDB";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { mapGetters } from "vuex";
import { initiateLocalCacheDB } from "@/db.js";
// import { notifyListeners } from "@/Eventbus.js"; //

export default {
  mixins: [initiateLocalCacheDB],

  props: {
    notificationTab: Boolean,
    notificationsData: Array,
  },
  data() {
    return {
      listItems: [],
      storednotifications: [],
      sortedFilteredNotifications: [],
      dummyArray: [
        {
          messageTitle: "Scan your attenndence",
          msg_sent_by: "Jisha",
          date: "12-02-2025",
        },
        {
          messageTitle: "Please verify assets owned by you",
          msg_sent_by: "Jisha",
          date: "12-02-2025",
        },
        {
          messageTitle: "Complete the tasks assigned to you",
          msg_sent_by: "Jisha",
          date: "10-02-2025",
        },
        {
          messageTitle: "Data Correction workflow initiated",
          msg_sent_by: "Radhika",
          date: "11-02-2025",
        },
        {
          messageTitle: "Attendence Proceeded",
          msg_sent_by: "Radhika",
          date: "11-02-2025",
        },
      ],
    };
  },
  watch: {
    notificationsData: {
      handler(newData) {
        // Ensure newData is valid before processing
        if (!Array.isArray(newData)) return;

        // Update the sorted & filtered notifications
        this.sortedFilteredNotifications =
          this.filterAndSortNotifications(newData);
      },
      deep: true, // Watches for deep changes in objects/arrays
      immediate: true, // Runs on component mount
    },
  },
  async created() {
    // addNotificationListener((newNotification) => {
    //   console.log("New Notification:", newNotification);
    //   // this.notifications.push(newNotification);
    // });
    // var data = JSON.parse(localStorage.getItem("notoficationItems"));
    // this.listItems = data;
    // const data1 = await this.getAllItems("STORE_NOTIFICATIONS_LIST");
    // console.log(data1);
  },
  // watch: {
  //   notificationTab: {
  //     async handler() {
  //       if (this.notificationTab == true) {
  //         // const notifications = await getNotifications();
  //         // this.listItems = notifications;
  //         // console.log(this.storednotifications);
  //         var data = JSON.parse(localStorage.getItem("notoficationItems"));
  //         this.listItems = data;
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  computed: {
    ...mapGetters(["getNotifications"]), // Get notifications from Vuex
    notifications() {
      // console.log("ssss", this.getNotifications);
      return this.getNotifications; // Bind directly to table
    },
  },
  methods: {
    filterAndSortNotifications(notifications) {
      if (!Array.isArray(notifications)) return [];

      // Safely get user email with proper null checks
      const userObj = this.$store.getters.GetUserObj;
      const currentUserEmail = userObj?.user?.user_email_id;

      // If no user email found, return empty array
      if (!currentUserEmail) {
        console.warn('User email not found in store, returning empty notifications');
        return [];
      }

      // Filter notifications for the current user
      let filtered = notifications.filter(
        (notif) => notif.cureentUser === currentUserEmail
      );

      // Remove duplicates based on msg_id
      const uniqueNotifications = [];
      const seenMsgIds = new Set();

      for (const notif of filtered) {
        if (!seenMsgIds.has(notif.msg_id)) {
          seenMsgIds.add(notif.msg_id);
          uniqueNotifications.push(notif);
        }
      }

      // Sort by msg_created_on in descending order
      uniqueNotifications.sort((a, b) => b.msg_created_on - a.msg_created_on);

      // Return the top 6 notifications
      return uniqueNotifications.slice(0, 6);
    },

    // filterAndSortNotifications(notifications) {
    //   if (!Array.isArray(notifications)) return [];

    //   const currentUserNAme =
    //     this.$store.getters.GetUserObj?.user.user_email_id;
    //   // console.log(currentUserNAme);
    //   let filtered = notifications.filter(
    //     (notif) => notif.cureentUser === currentUserNAme
    //   );
    //   // console.log(filtered);
    //   filtered.sort((a, b) => b.msg_created_on - a.msg_created_on);

    //   return filtered.slice(0, 6);
    // },

    fetch_value(val) {
      return formatedatetime(val / 1000);
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style scoped>
.notification-list-item {
  transition: background 0.2s;
}
.notification-list-item:hover {
  background: #f5f5f7;
}
</style>
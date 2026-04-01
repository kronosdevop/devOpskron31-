<template>
  <div>
    <!-- <div v-if="!hideTitle" class="notification-list-title">Recent Notifications</div> -->
    <div class="notification-list-outer pa-1">
      <template v-if="sortedFilteredNotifications.length">
        <div v-for="(item, index) in sortedFilteredNotifications.slice(0, 1)" :key="index" class="notification-soft-card">
          <div class="notification-title">{{ item.msg_title }}</div>
          <div class="notification-desc">{{ item.msg_description }}</div>
          <div class="notification-meta">
            <span class="notification-user">{{ item.msg_sent_by || '' }}</span>
            <span class="notification-date">{{ fetch_value(item.msg_created_on) }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="notification-empty">No notifications</div>
      </template>
    </div>
  </div>
</template>

<script>
/* eslint-disable*/
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { mapGetters } from "vuex";
import { initiateLocalCacheDB } from "@/db.js";

export default {
  mixins: [initiateLocalCacheDB],
  props: {
    notificationTab: Boolean,
    notificationsData: Array,
    hideTitle: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      listItems: [],
      storednotifications: [],
      sortedFilteredNotifications: [],
    };
  },
  watch: {
    notificationsData: {
      handler(newData) {
        if (!Array.isArray(newData)) return;
        this.sortedFilteredNotifications = this.filterAndSortNotifications(newData);
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    ...mapGetters(["getNotifications"]),
    notifications() {
      return this.getNotifications;
    },
  },
  methods: {
    filterAndSortNotifications(notifications) {
      if (!Array.isArray(notifications)) return [];
      const userObj = this.$store.getters.GetUserObj;
      const currentUserEmail = userObj?.user?.user_email_id;
      if (!currentUserEmail) return [];
      let filtered = notifications.filter(
        (notif) => notif.cureentUser === currentUserEmail
      );
      const uniqueNotifications = [];
      const seenMsgIds = new Set();
      for (const notif of filtered) {
        if (!seenMsgIds.has(notif.msg_id)) {
          seenMsgIds.add(notif.msg_id);
          uniqueNotifications.push(notif);
        }
      }
      uniqueNotifications.sort((a, b) => b.msg_created_on - a.msg_created_on);
      return uniqueNotifications.slice(0, 6);
    },
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
.notification-list-title {
  font-size: 1.13rem;
  font-weight: 400;
  color: #222;
  margin-bottom: 10px;
  letter-spacing: 0.01em;
  padding-left: 24px;
}
.notification-soft-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 60, 0.04);
  display: flex;
  flex-direction: column;
}
.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #181818;
  margin-bottom: 3px;
  text-align: left;
  line-height: 1.2;
}
.notification-desc {
  font-size: 12px;
  color: #7b7b7b;
  margin-bottom: 6px;
  text-align: left;
  line-height: 1.3;
}
.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #bdbdbd;
  font-weight: 500;
}
.notification-user {
  color: #bdbdbd;
  font-size: 11px;
  font-weight: 500;
}
.notification-date {
  color: #bdbdbd;
  font-size: 11px;
  font-weight: 500;
}
.notification-empty {
  text-align: left;
  color: #bdbdbd;
  font-size: 12px;
  margin-top: 12px;
  padding-left: 16px;
}
.notification-list-outer {
  padding: 0;
  margin: 0;
}
</style>
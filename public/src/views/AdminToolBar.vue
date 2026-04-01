<template>
  <!-- eslint-disable -->
  <v-toolbar dark elevation="0" class="ma-2" dense>
    <v-tabs
      v-model="tab"
      absolute
      dense
      background-color="transparent"
      color="#db4c77"
      grow
      fixed
    >
      <v-tab
        v-for="item in selectedNavList"
        @click="navigate(item.router)"
        :key="item.text"
        :class="{ 'active-tab': tab === item.router }"
      >
        <div class="white--text" style="font-size: 12px">{{ item.text }}</div>
        <v-icon
          color="white"
          class="ml-2"
          small
          @click.stop="refresh_tab(item)"
          >{{ item.icon }}</v-icon
        >
      </v-tab>
    </v-tabs>
  </v-toolbar>
</template>
<script>
/* eslint-disable */
import { EventBus } from "@/main";
export default {
  props: {
    selectedNavList: Array,
  },
  data() {
    return {
      tab: null,
      listItems: ["Teams"],
      activeItem: null,
    };
  },
  methods: {
    button_click(item) {
      this.$router.push(item.router);
      this.selectedNavList.forEach((navItem) => {
        navItem.isActive = navItem === item; // Set isActive for clicked item
      });
    },

    navigate(item) {
      this.tab = item;
      this.$router.push(item);
    },

    refresh_tab(item) {
      if (this.tab === item.value) {
        this.refresh_page(item);
      }
    },

    refresh_page(value) {
      var data = "";
      if (value.text == "Teams") {
        data = true;
        EventBus.$emit("temValue", data);
      } else if (value.text == "Broadcast") {
        data = "true";
        EventBus.$emit("broadcastCheck", data);
      } else if (value.text == "Apps") {
        data = "apps";
        EventBus.$emit("userappsCheck", data);
      } else if (value.text == "Approvals") {
        data = "approvals";

        EventBus.$emit("userApprovlas", data);
      } else if (value.text == "Admin Apps") {
        data = "adminApps";
        EventBus.$emit("admins", data);
      } else if (value.text == "Administration") {
        data = "administration";
        EventBus.$emit("adminpanel", data);
      }
    },

    isActive(item) {
      return (this.activeItem = item);
    },

    cancel_click(item) {
      this.$emit("removeItem", item);
      // Add functionality for the button click
    },
  },
};
</script>
<style scoped>
.custom-toolbar {
  border-radius: 10px; /* Adjust the radius value as needed */
}
.active-item {
  background-color: lightblue; /* Highlight the selected item */
}
.v-tab:hover:not(.v-tab--active) {
  background-color: lightgrey;
}

.v-tab--active {
  background-color: #db4c77; /* Change background color for the active tab */
}
</style>
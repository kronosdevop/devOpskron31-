<template>
  <!-- eslint-disable -->
  <v-toolbar color="grey lighten-2" elevation="0" dense>
    <v-slide-group show-arrows mandatory>
      <v-slide-item
        v-for="(item, index) in appsListAccess"
        :key="index"
        #default="{ active }"
      >
        <v-btn
          :color="item.isActive ? 'primary' : ''"
          @click="button_click(item)"
        >
          <v-icon small>{{ item.icon }}</v-icon>
          <span style="font-size: 12px" class="ml- 2">
            {{ item.dashboard_name }}</span
          >
        </v-btn>
      </v-slide-item>
    </v-slide-group>
  </v-toolbar>
</template>
<script>
/* eslint-disable */

export default {
  props: {
    appsListAccess: Array,
  },
  data() {
    return {
      activeItem: null,
    };
  },
  methods: {
    button_click(item) {
      //   this.$router.push(item.router);
      //   this.userItems.forEach((navItem) => {
      //     navItem.isActive = navItem === item; // Set isActive for clicked item
      //   });
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
</style>

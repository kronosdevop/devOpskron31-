<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="bookedByDialog" @update:model-value="$emit('update:bookedByDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Booked Slots</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <template v-for="(item, index) in allDates" :key="index">
        <v-divider :inset="item.inset"></v-divider>

              <v-list-item
                v-if="
                  item.availability == false && item.booking_now == 'BOOKED'
                "
                :key="item.date"
                class="text-left"
              >
                <v-list-item-content class="d-flex align-end justify-end">
                  <v-list-item-title
                    class="title-wrapper full-width-title ma-1"
                  >
                    {{
                      "Booked By" + "-" + item.booked_user.user_name
                    }}</v-list-item-title
                  >
                  <v-list-item-subtitle class="title-wrapper ma-1">
                    {{ "Booked Slot" + "-" + item.date }}</v-list-item-subtitle
                  >
                  <v-list-item-subtitle class="title-wrapper ma-1">
                    {{
                      "Booked On" + "-" + get_date(item.booked_user.booked_on)
                    }}</v-list-item-subtitle
                  >
                  <v-list-item-subtitle class="title-wrapper ma-1">
                    {{
                      "Categories " +
                      "-" +
                      item.booked_user.booking_category_name
                    }}</v-list-item-subtitle
                  >
                  <v-list-item-subtitle class="title-wrapper ma-1">
                    {{
                      "Comments " + "-" + item.booked_user.booking_comments
                    }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: {
    allDates: Array,
    bookedByDialog: Boolean,
  },
  data() {
    return {};
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        +year +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        (+date <= 9 ? "0" + date : date)
      );
    },
  },
};
</script>
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="groupVisbility" @update:model-value="$emit('update:groupVisbility', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black"
            ><div class="custom-title">
              Group Visibility for {{ rowInfo.dashboard_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="">
          <v-row no-gutters>
            <v-checkbox
              v-model="groupVisbile"
              label="Visibile"
              color="green"
              readonly
            ></v-checkbox>
            <v-checkbox
              class="ml-2"
              v-model="groupNotVisibilt"
              label="Not Visibile"
              readonly
            ></v-checkbox>
          </v-row>
          <v-data-table
            dense
            :headers="headers"
            :items="items"
            height="300px"
            :single-select="singleSelect"
            v-model="selectedItems"
            show-select
            :loading="loading"
            item-key="department_name"
            :items-per-page="500"
            hide-default-footer
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import { get_department_details } from "@/mixins/GetDepartments.js";
export default {
  props: {
    groupVisbility: Boolean,
    rowInfo: Object,
  },
  mixins: [get_department_details],
  data() {
    return {
      headers: [{ text: "Groups", value: "department_name", sortable: false }],
      items: [],
      selectedItems: [],
      singleSelect: false,
      groupVisbile: true,
      groupNotVisibilt: false,
      loading: false,
    };
  },

  watch: {
    groupVisbility: {
      async handler() {
        if (this.groupVisbility == true) {
          this.loading = true;
          this.items = [];
          await this.get_department_details();
          this.fecth_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    fecth_details() {
      this.loading = false;

      this.items = this.departmentList;
    },
  },
};
</script>
<style scoped>
.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  background-color: white;
  color: white !important;
}
</style>
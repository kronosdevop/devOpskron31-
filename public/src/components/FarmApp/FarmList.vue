<template>
  <div>
    <v-card flat>
      <v-card-text>
        <!-- <v-toolbar flat>
          <v-spacer />
          <v-btn dark @click="add_fields()" class="text-capitalize cardCss"
            >Add</v-btn
          >
          <v-btn dark class="text-capitalize cardCss ml-2" @click="back_call()">
            <v-icon class="mr-2">mdi-step-backward</v-icon>
            Back
          </v-btn></v-toolbar
        > -->
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :fixed-header="fixed"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small color="primaryColor" @click="get_location(item)"
              >mdi-map-marker</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AddingFarm :addFields="addFields" @clicked="addFields = false" />
    </div>
    <div v-if="componentCheck == 2">
      <MapView
        :viewSwipeLocation="viewSwipeLocation"
        @clicked="viewSwipeLocation = false"
        :rowInfo="rowInfo"
      />
    </div>
  </div>
</template>

<script>
import AddingFarm from "@/components/FarmApp/Popups/AddingFarm.vue";
import MapView from "@/components/FarmApp/Popups/MapView.vue";
export default {
  components: {
    AddingFarm,
    MapView,
  },
  data() {
    return {
      fixed: true,
      componentCheck: 0,
      rowInfo: {},
      viewSwipeLocation: false,
      addFields: false,
      tableLoading: false,
      tableData: [{ Sloat_name: "Sector 1" }],
      headers: [
        {
          text: "Layout",
          value: "Sloat_name",
          sortable: false,
        },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  methods: {
    back_call() {
      this.$router.push("/AdminLevelApps");
    },
    add_fields() {
      this.componentCheck = 1;
      this.addFields = true;
    },
    get_location(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.viewSwipeLocation = true;
    },
  },
};
</script>

<style>
</style>
<template>
  <div>
    <v-card flat>
      <v-card-text>
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
              >mdi-alpha-i-circle-outline</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <ViewSubcategories :subView="subView" @clicked="subView = false" />
    </div>
  </div>
</template>

<script>
import ViewSubcategories from "@/components/FarmApp/Popups/ViewSubcategories.vue";
export default {
  components: {
    ViewSubcategories,
  },
  data() {
    return {
      fixed: true,
      tableLoading: false,
      subView: false,
      componentCheck: 0,
      tableData: [{ farm_categories: "Agriculture" }],
      headers: [
        {
          text: "Categories",
          value: "farm_categories",
          sortable: false,
        },
        { text: "Sub Categories", value: "actions", sortable: false },
      ],
    };
  },
  methods: {
    get_location() {
      this.componentCheck = 1;
      this.subView = true;
    },
  },
};
</script>

<style>
</style>
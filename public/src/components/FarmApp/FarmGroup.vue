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
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
  
  <script>
export default {
  data() {
    return {
      fixed: true,
      componentCheck: 0,
      tableData: [{ group_name: "Sector 1" }],
      headers: [
        {
          text: "Name",
          value: "group_name",
          sortable: false,
        },
        { text: "Head", value: "actions", sortable: false },
      ],
    };
  },
};
</script>
  
  <style>
</style>